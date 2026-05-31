const EUROPE_BOUNDS = [[33, -13], [72, 45]];
const EUROPE_VIEW_BOUNDS = [[35, -10], [70, 44]];

let map, regionLayers = {};
let selectedFaction = null, selectedRegion = null;
const tacticalLineKeys = new Set();
let tacticalSvgRenderer = null;

const EMOTION_ICONS = {
  hatred: '💢', anger: '😤', love: '❤️', joy: '😊',
  sadness: '😢', fear: '😨', disgust: '🤮', pride: '😏',
  shame: '😳', neutral: '😐',
};

function initMap() {
  map = L.map('map', {
    center: [52, 15],
    zoom: 5,
    zoomSnap: 0.25,
    minZoom: 4,
    maxZoom: 8,
    maxBounds: EUROPE_BOUNDS,
    maxBoundsViscosity: 1.0,
    preferCanvas: true,
    zoomControl: true,
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 3,
    noWrap: true,
  }).addTo(map);

  map.attributionControl.setPrefix(false);
  map.fitBounds(EUROPE_VIEW_BOUNDS, { padding: [12, 12] });
  map.on('zoomend', updateAllHexIconSizes);
  map.createPane('tacticalPane');
  map.getPane('tacticalPane').style.zIndex = 680;
  map.getPane('tacticalPane').style.pointerEvents = 'none';
  tacticalSvgRenderer = L.svg({ pane: 'tacticalPane', padding: 0.8 });

  const container = document.getElementById('mapContainer');
  if (container && !container.querySelector('.war-atmosphere')) {
    container.insertAdjacentHTML('beforeend', `
      <div class="war-atmosphere" aria-hidden="true">
        <div class="radar-sweep"></div>
        <div class="scan-grid"></div>
        <div class="signal-noise"></div>
      </div>
    `);
  }
}

function clearMapLayers() {
  for (const key in regionLayers) {
    map.removeLayer(regionLayers[key]);
  }
  regionLayers = {};
}

function getRegionPopupContent(region, state) {
  const strength = getRegionStrength(region, state);
  const fortification = region.fortification || 0;
  return `
    <div class="region-popup">
      <h3>${region.name}</h3>
      <div class="stat"><span>Owner:</span> <span>${getOwnerName(region, state)}</span></div>
      <div class="stat"><span>Troops:</span> <span>${(region.troops || 0).toLocaleString()}</span></div>
      <div class="stat"><span>Defending:</span> <span>${strength.toLocaleString()}</span></div>
      <div class="stat"><span>Fortification:</span> <span>${fortification}</span></div>
      <div class="stat"><span>Population:</span> <span>${region.population.toLocaleString()}K</span></div>
      <div class="stat"><span>Resources:</span> <span>${region.resources}</span></div>
    </div>
  `;
}

function compactNumber(value) {
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`;
  return `${Math.round(value)}`;
}

function getRegionStrength(region, state) {
  return Math.round((region.troops || 0) + (region.garrison || 0) + (region.fortification || 0) * 25);
}

function getHexPixelSize() {
  const zoom = map ? map.getZoom() : 5;
  return Math.max(9, Math.min(22, Math.round(24 - (zoom - 4) * 4)));
}

function getHexIcon(owner = {}, options = {}) {
  const size = getHexPixelSize();
  const opacity = options.dimmed ? 0.35 : 0.86;
  const selectedClass = options.selected ? ' selected' : '';
  const dimmedClass = options.dimmed ? ' dimmed' : '';
  const strengthLabel = options.strength ? compactNumber(options.strength) : '';
  const flag = owner.flag || '•';
  const accent = owner.color || '#94a3b8';

  return L.divIcon({
    className: 'hex-region-icon',
    iconSize: [size + 14, size + 10],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    tooltipAnchor: [0, -size / 2],
    html: `
      <div class="hex-stack" style="--hex-accent:${accent};--hex-size:${size}px;--hex-opacity:${opacity};">
        <div class="hex-region${selectedClass}${dimmedClass}">
          <span>${flag}</span>
        </div>
        ${strengthLabel ? `<b class="hex-strength">${strengthLabel}</b>` : ''}
      </div>
    `,
  });
}

function updateHexIcon(layer, options = {}) {
  layer.setIcon(getHexIcon(layer._ownerInfo || {}, {
    ...options,
    strength: options.strength ?? layer._strength,
  }));
}

function updateAllHexIconSizes() {
  for (const [id, layer] of Object.entries(regionLayers)) {
    updateHexIcon(layer, {
      selected: id === selectedRegion,
      dimmed: selectedFaction && layer._owner !== selectedFaction,
      strength: layer._strength,
    });
  }
}

function getOwner(region, state) {
  return state.factions?.find(f => f.id === region.owner) || state.destroyed?.find(f => f.id === region.owner);
}

function getOwnerColor(region, state) {
  const o = getOwner(region, state);
  return o ? o.color : '#444';
}

function getOwnerName(region, state) {
  const o = getOwner(region, state);
  return o ? o.flag + ' ' + o.name : 'None';
}

function addConquestPulse(region, color) {
  const pulse = L.circleMarker([region.lat, region.lng], {
    radius: 10,
    color,
    weight: 2,
    opacity: 0.95,
    fillColor: color,
    fillOpacity: 0.22,
    className: 'conquest-pulse',
  }).addTo(map);

  setTimeout(() => map.removeLayer(pulse), 1300);
}

function getTacticalLineColor(type) {
  if (type === 'attack') return '#ff1744';
  if (type === 'airstrike') return '#b388ff';
  return '#00e5ff';
}

function drawTacticalLine(fromRegion, toRegion, type, label = '') {
  if (!fromRegion || !toRegion || !map) return;

  const color = getTacticalLineColor(type);
  const line = L.polyline(
    [[fromRegion.lat, fromRegion.lng], [toRegion.lat, toRegion.lng]],
    {
      color,
      weight: type === 'attack' ? 5 : type === 'airstrike' ? 4 : 4.5,
      opacity: 0.95,
      className: `tactical-line tactical-line-${type}`,
      interactive: false,
      renderer: tacticalSvgRenderer,
      pane: 'tacticalPane',
    }
  ).addTo(map);

  const impact = L.circleMarker([toRegion.lat, toRegion.lng], {
    radius: type === 'airstrike' ? 7 : 5,
    color,
    weight: 2,
    opacity: 0.95,
    fillColor: color,
    fillOpacity: 0.35,
    className: `tactical-impact tactical-impact-${type}`,
    interactive: false,
    renderer: tacticalSvgRenderer,
    pane: 'tacticalPane',
  }).addTo(map);

  const midLat = (fromRegion.lat + toRegion.lat) / 2;
  const midLng = (fromRegion.lng + toRegion.lng) / 2;
  const beacon = L.marker([midLat, midLng], {
    interactive: false,
    pane: 'tacticalPane',
    icon: L.divIcon({
      className: 'tactical-beacon-icon',
      iconSize: [34, 18],
      iconAnchor: [17, 9],
      html: `<div class="tactical-beacon tactical-beacon-${type}">${type === 'attack' ? '!' : type === 'airstrike' ? '✦' : '↗'}${label ? `<span>${label}</span>` : ''}</div>`,
    }),
  }).addTo(map);

  if (label) {
    line.bindTooltip(label, {
      permanent: false,
      direction: 'center',
      className: 'tactical-tooltip',
      opacity: 0.95,
    });
  }

  setTimeout(() => {
    if (map.hasLayer(line)) map.removeLayer(line);
    if (map.hasLayer(impact)) map.removeLayer(impact);
    if (map.hasLayer(beacon)) map.removeLayer(beacon);
  }, type === 'airstrike' ? 5600 : 4800);
}

function processTacticalLines(state) {
  const events = state.events || [];
  const regionsById = Object.fromEntries((state.regions || []).map(r => [r.id, r]));

  events.forEach((event, index) => {
    const lineType = event.lineType;
    if (!lineType || !event.fromRegionId || !event.toRegionId) return;

    const key = event.eventId || `${index}:${event.type}:${event.fromRegionId}:${event.toRegionId}:${event.message}`;
    if (tacticalLineKeys.has(key)) return;
    tacticalLineKeys.add(key);

    if (tacticalLineKeys.size > 250) {
      const oldest = tacticalLineKeys.values().next().value;
      tacticalLineKeys.delete(oldest);
    }

    const label = event.troops ? `${event.troops}` : '';
    drawTacticalLine(regionsById[event.fromRegionId], regionsById[event.toRegionId], lineType, label);
  });
}

function updateMap(state) {
  const regions = state.regions || [];
  if (!map || regions.length === 0) return;

  const ownerMap = {};
  for (const f of state.factions || []) ownerMap[f.id] = f;
  for (const f of state.destroyed || []) ownerMap[f.id] = { ...f, color: '#94a3b8' };

  const activeRegionIds = new Set();

  for (const region of regions) {
    activeRegionIds.add(region.id);
    const ownerInfo = ownerMap[region.owner] || { flag: '•', color: '#94a3b8' };
    const strength = getRegionStrength(region, state);
    let poly = regionLayers[region.id];

    if (!poly) {
      poly = L.marker([region.lat, region.lng], {
        icon: getHexIcon(ownerInfo, { strength }),
        riseOnHover: true,
      }).addTo(map);

      poly._regionId = region.id;
      poly._owner = region.owner;
      poly._ownerInfo = ownerInfo;
      poly._strength = strength;

      poly.on('mouseover', function() {
        if (this._regionId !== selectedRegion) {
          this.getElement()?.querySelector('.hex-region')?.classList.add('hovered');
        }
      });
      poly.on('mouseout', function() {
        if (this._regionId !== selectedRegion) {
          this.getElement()?.querySelector('.hex-region')?.classList.remove('hovered');
        }
      });

      poly.bindTooltip(region.name, {
        direction: 'top',
        offset: [0, -5],
        className: 'region-tooltip',
      });

      poly.bindPopup(getRegionPopupContent(region, state), { className: 'custom-popup', closeButton: true, maxWidth: 250 });

      regionLayers[region.id] = poly;
    }

    poly.off('click');
    poly.on('click', () => selectRegion(region, state));

    if (poly._owner !== region.owner) {
      addConquestPulse(region, ownerInfo.color);
    }

    if (poly._owner !== region.owner || poly._ownerInfo?.flag !== ownerInfo.flag || poly._strength !== strength) {
      poly._owner = region.owner;
      poly._ownerInfo = ownerInfo;
      poly._strength = strength;
      updateHexIcon(poly, {
        selected: selectedRegion === region.id,
        dimmed: selectedFaction && region.owner !== selectedFaction,
        strength,
      });
    }

    poly.setPopupContent(getRegionPopupContent(region, state));
  }

  for (const [id, layer] of Object.entries(regionLayers)) {
    if (!activeRegionIds.has(id)) {
      map.removeLayer(layer);
      delete regionLayers[id];
    }
  }

  if (selectedRegion && regionLayers[selectedRegion]) {
    highlightRegion(selectedRegion);
  }

  processTacticalLines(state);
  map.invalidateSize();
}

function highlightRegion(regionId) {
  for (const [id, layer] of Object.entries(regionLayers)) {
    if (id === regionId) {
      updateHexIcon(layer, { selected: true });
      layer.setZIndexOffset(1000);
    } else {
      updateHexIcon(layer);
      layer.setZIndexOffset(0);
    }
  }
}

function selectRegion(region, state) {
  selectedRegion = region.id;
  selectedFaction = null;

  const faction = state.factions?.find(f => f.id === region.owner);
  const panel = document.getElementById('infoContent');
  if (!faction) {
    const owner = state.destroyed?.find(f => f.id === region.owner);
    panel.innerHTML = `<div class="info-placeholder">📍 ${region.name}<br>${owner ? '💀 ' + owner.name : 'No owner'}</div>`;
    return;
  }

  renderFactionInfo(faction, state, panel, region);
  highlightRegion(region.id);
  highlightFactionInList(faction.id);
}

function selectFactionById(factionId, state) {
  const faction = state.factions?.find(f => f.id === factionId);
  if (!faction) return;
  selectedFaction = factionId;
  selectedRegion = null;

  const panel = document.getElementById('infoContent');
  renderFactionInfo(faction, state, panel, null);

  for (const [id, layer] of Object.entries(regionLayers)) {
    const region = state.regions?.find(r => r.id === id);
    if (region && region.owner === factionId) {
      updateHexIcon(layer, { selected: true });
      layer.setZIndexOffset(800);
    } else {
      updateHexIcon(layer, { dimmed: true });
      layer.setZIndexOffset(0);
    }
  }
}

function renderFactionInfo(faction, state, panel, region) {
  let relationsHtml = '';
  for (const [targetId, rel] of Object.entries(faction.relations || {})) {
    const target = state.factions?.find(f => f.id === targetId);
    if (!target) continue;
    const em = faction.emotions?.[targetId];
    const emotionIcon = EMOTION_ICONS[em?.dominant || 'neutral'] || '😐';
    const statusClass = rel.war ? 'war' : rel.alliance ? 'alliance' : 'neutral';
    const statusText = rel.war ? '⚔️ WAR' : rel.alliance ? '🤝 ALLY' : '—';
    relationsHtml += `
      <div class="relation-row">
        <span class="relation-flag">${target.flag}</span>
        <span class="relation-name">${target.name}</span>
        <span class="relation-emotion emotion-${em?.dominant || 'neutral'}">${emotionIcon}</span>
        <span class="relation-status ${statusClass}">${statusText}</span>
      </div>
    `;
  }

  const doctrine = faction.doctrine || { id: 'european', name: 'European', icon: '🛡️', specialties: [], weakness: '' };
  const specialtiesList = (doctrine.specialties || []).map(s => `<span class="specialty">${s}</span>`).join('');

  const factionRegions = state.regions?.filter(r => r.owner === faction.id) || [];
  const regionList = factionRegions.slice(0, 10).map(r => r.name).join(', ') + (factionRegions.length > 10 ? '...' : '');
  const regionTactical = region ? `
    <div class="tactical-strip">
      <div><span>DEF</span><b>${getRegionStrength(region, state).toLocaleString()}</b></div>
      <div><span>TRP</span><b>${(region.troops || 0).toLocaleString()}</b></div>
      <div><span>FORT</span><b>${region.fortification || 0}</b></div>
    </div>
  ` : '';

  panel.innerHTML = `
    <div style="padding: 6px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
        <span style="font-size:24px;">${faction.flag}</span>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:14px;">${faction.name}</div>
          ${region ? `<div style="font-size:10px;color:#888;">📍 ${region.name}</div>` : ''}
          <div style="font-size:10px;color:#888;">Territories: ${factionRegions.length}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;font-weight:700;" class="doctrine-${doctrine.id}">${doctrine.icon} ${doctrine.name}</div>
        </div>
      </div>

      ${regionTactical}

      <div class="doctrine-info ${doctrine.id}">
        <div style="flex:1;">
          <div style="font-size:9px;font-weight:600;">${doctrine.icon} ${doctrine.name}</div>
          <div style="font-size:8px;color:#888;">${doctrine.description || ''}</div>
          <div style="margin-top:2px;">${specialtiesList}</div>
          <div class="weakness">${doctrine.weakness || ''}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;margin:6px 0;">
        <div>⚔️ Army: <b>${faction.army?.toLocaleString() || 0}</b></div>
        <div>✈️ Air: <b>${faction.air?.toLocaleString() || 0}</b></div>
        <div>🚢 Navy: <b>${faction.navy?.toLocaleString() || 0}</b></div>
        <div>💰 Economy: <b>${faction.economy?.toLocaleString() || 0}</b></div>
        <div>👥 Pop: <b>${(faction.population || 0).toLocaleString()}K</b></div>
        <div>⚡ Power: <b>${(faction.totalPower || 0).toLocaleString()}</b></div>
      </div>

      ${regionList ? `<div style="font-size:10px;color:#888;margin-bottom:4px;">📌 ${regionList}</div>` : ''}

      <div style="font-size:10px;color:#888;margin-bottom:4px;margin-top:4px;">DIPLOMACY & EMOTIONS:</div>
      <div style="max-height:120px;overflow-y:auto;">${relationsHtml}</div>
    </div>
  `;
}

function highlightFactionInList(factionId) {
  document.querySelectorAll('.faction-item').forEach(el => el.classList.remove('selected'));
  const el = document.querySelector(`.faction-item[data-id="${factionId}"]`);
  if (el) el.classList.add('selected');
}
