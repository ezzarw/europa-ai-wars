const REGIONS = [
  // === GERMANY ===
  { id: 'de_berlin', name: 'Berlin', country: 'germany', lat: 52.52, lng: 13.405, resources: 80, population: 360, neighbors: ['de_brandenburg', 'de_sachsen'] },
  { id: 'de_brandenburg', name: 'Brandenburg', country: 'germany', lat: 52.4, lng: 13.0, resources: 40, population: 250, neighbors: ['de_berlin', 'de_sachsen', 'de_mecklenburg', 'pl_lubusz'] },
  { id: 'de_mecklenburg', name: 'Mecklenburg', country: 'germany', lat: 53.6, lng: 12.0, resources: 30, population: 160, neighbors: ['de_brandenburg', 'de_niedersachsen', 'de_schleswig', 'pl_pomerania'] },
  { id: 'de_schleswig', name: 'Schleswig-Holstein', country: 'germany', lat: 54.2, lng: 9.9, resources: 25, population: 290, neighbors: ['de_mecklenburg', 'de_niedersachsen', 'dk_sjaelland'] },
  { id: 'de_niedersachsen', name: 'Niedersachsen', country: 'germany', lat: 52.7, lng: 9.0, resources: 55, population: 800, neighbors: ['de_schleswig', 'de_mecklenburg', 'de_nordrhein', 'de_hessen', 'de_sachsen_anhalt', 'nl_groningen'] },
  { id: 'de_nordrhein', name: 'Nordrhein-Westfalen', country: 'germany', lat: 51.3, lng: 7.5, resources: 90, population: 1800, neighbors: ['de_niedersachsen', 'de_hessen', 'de_rheinland', 'nl_limburg', 'be_flanders'] },
  { id: 'de_hessen', name: 'Hessen', country: 'germany', lat: 50.6, lng: 8.8, resources: 50, population: 630, neighbors: ['de_niedersachsen', 'de_nordrhein', 'de_rheinland', 'de_baden', 'de_bayern', 'de_sachsen_anhalt'] },
  { id: 'de_rheinland', name: 'Rheinland-Pfalz', country: 'germany', lat: 49.8, lng: 7.2, resources: 40, population: 410, neighbors: ['de_nordrhein', 'de_hessen', 'de_baden', 'fr_grand_est', 'lu_luxembourg'] },
  { id: 'de_baden', name: 'Baden-Württemberg', country: 'germany', lat: 48.5, lng: 9.0, resources: 65, population: 1110, neighbors: ['de_hessen', 'de_rheinland', 'de_bayern', 'ch_zurich', 'fr_grand_est'] },
  { id: 'de_bayern', name: 'Bayern', country: 'germany', lat: 48.5, lng: 11.5, resources: 70, population: 1310, neighbors: ['de_hessen', 'de_baden', 'de_sachsen', 'cz_bohemia', 'at_upper_austria', 'ch_zurich'] },
  { id: 'de_sachsen', name: 'Sachsen', country: 'germany', lat: 51.0, lng: 13.0, resources: 45, population: 410, neighbors: ['de_berlin', 'de_brandenburg', 'de_bayern', 'de_sachsen_anhalt', 'cz_bohemia', 'pl_silesia'] },
  { id: 'de_sachsen_anhalt', name: 'Sachsen-Anhalt', country: 'germany', lat: 51.8, lng: 11.8, resources: 30, population: 220, neighbors: ['de_niedersachsen', 'de_hessen', 'de_sachsen', 'de_brandenburg'] },

  // === FRANCE ===
  { id: 'fr_paris', name: 'Île-de-France', country: 'france', lat: 48.85, lng: 2.35, resources: 95, population: 1240, neighbors: ['fr_normandy', 'fr_hauts_france', 'fr_grand_est', 'fr_centre', 'fr_pays_loire'] },
  { id: 'fr_normandy', name: 'Normandie', country: 'france', lat: 49.1, lng: -0.3, resources: 40, population: 330, neighbors: ['fr_paris', 'fr_hauts_france', 'fr_pays_loire', 'fr_bretagne'] },
  { id: 'fr_bretagne', name: 'Bretagne', country: 'france', lat: 48.1, lng: -2.7, resources: 30, population: 330, neighbors: ['fr_normandy', 'fr_pays_loire'] },
  { id: 'fr_pays_loire', name: 'Pays de la Loire', country: 'france', lat: 47.5, lng: -0.8, resources: 35, population: 380, neighbors: ['fr_normandy', 'fr_bretagne', 'fr_paris', 'fr_centre', 'fr_nouvelle_aquitaine'] },
  { id: 'fr_centre', name: 'Centre-Val de Loire', country: 'france', lat: 47.5, lng: 1.5, resources: 30, population: 260, neighbors: ['fr_paris', 'fr_pays_loire', 'fr_nouvelle_aquitaine', 'fr_auvergne', 'fr_bourgogne'] },
  { id: 'fr_hauts_france', name: 'Hauts-de-France', country: 'france', lat: 50.0, lng: 2.5, resources: 45, population: 600, neighbors: ['fr_paris', 'fr_normandy', 'fr_grand_est', 'be_wallonia'] },
  { id: 'fr_grand_est', name: 'Grand Est', country: 'france', lat: 48.8, lng: 5.5, resources: 50, population: 550, neighbors: ['fr_paris', 'fr_hauts_france', 'fr_bourgogne', 'de_rheinland', 'de_baden', 'ch_zurich', 'lu_luxembourg', 'be_wallonia'] },
  { id: 'fr_bourgogne', name: 'Bourgogne', country: 'france', lat: 47.0, lng: 4.0, resources: 25, population: 160, neighbors: ['fr_centre', 'fr_grand_est', 'fr_auvergne', 'fr_rhone'] },
  { id: 'fr_auvergne', name: 'Auvergne', country: 'france', lat: 45.8, lng: 3.2, resources: 20, population: 140, neighbors: ['fr_centre', 'fr_bourgogne', 'fr_rhone', 'fr_occitanie', 'fr_nouvelle_aquitaine'] },
  { id: 'fr_nouvelle_aquitaine', name: 'Nouvelle-Aquitaine', country: 'france', lat: 44.8, lng: -0.5, resources: 40, population: 600, neighbors: ['fr_pays_loire', 'fr_centre', 'fr_auvergne', 'fr_occitanie', 'es_basque'] },
  { id: 'fr_rhone', name: 'Auvergne-Rhône-Alpes', country: 'france', lat: 45.5, lng: 4.8, resources: 55, population: 800, neighbors: ['fr_bourgogne', 'fr_auvergne', 'fr_occitanie', 'ch_geneva', 'it_piedmont'] },
  { id: 'fr_occitanie', name: 'Occitanie', country: 'france', lat: 43.7, lng: 1.5, resources: 35, population: 590, neighbors: ['fr_auvergne', 'fr_nouvelle_aquitaine', 'fr_rhone', 'es_catalonia'] },
  { id: 'fr_provence', name: 'Provence-Alpes-Côte Azur', country: 'france', lat: 43.5, lng: 5.5, resources: 45, population: 510, neighbors: ['fr_rhone', 'it_liguria', 'it_piedmont'] },

  // === UK ===
  { id: 'uk_london', name: 'London', country: 'uk', lat: 51.5, lng: -0.1, resources: 100, population: 900, neighbors: ['uk_south_east', 'uk_east_england'] },
  { id: 'uk_south_east', name: 'South East', country: 'uk', lat: 51.0, lng: -0.5, resources: 50, population: 920, neighbors: ['uk_london', 'uk_east_england', 'uk_south_west', 'uk_east_midlands'] },
  { id: 'uk_south_west', name: 'South West', country: 'uk', lat: 50.8, lng: -3.5, resources: 30, population: 560, neighbors: ['uk_south_east', 'uk_east_midlands', 'uk_west_midlands', 'uk_wales'] },
  { id: 'uk_east_england', name: 'East of England', country: 'uk', lat: 52.2, lng: 0.5, resources: 35, population: 620, neighbors: ['uk_london', 'uk_south_east', 'uk_east_midlands'] },
  { id: 'uk_east_midlands', name: 'East Midlands', country: 'uk', lat: 52.8, lng: -1.0, resources: 30, population: 480, neighbors: ['uk_south_east', 'uk_south_west', 'uk_east_england', 'uk_west_midlands', 'uk_yorkshire'] },
  { id: 'uk_west_midlands', name: 'West Midlands', country: 'uk', lat: 52.5, lng: -2.0, resources: 35, population: 590, neighbors: ['uk_south_west', 'uk_east_midlands', 'uk_north_west', 'uk_wales'] },
  { id: 'uk_yorkshire', name: 'Yorkshire', country: 'uk', lat: 53.8, lng: -1.5, resources: 40, population: 540, neighbors: ['uk_east_midlands', 'uk_north_west', 'uk_north_east'] },
  { id: 'uk_north_west', name: 'North West', country: 'uk', lat: 53.5, lng: -2.5, resources: 40, population: 730, neighbors: ['uk_west_midlands', 'uk_yorkshire', 'uk_scotland'] },
  { id: 'uk_north_east', name: 'North East', country: 'uk', lat: 54.9, lng: -1.6, resources: 25, population: 260, neighbors: ['uk_yorkshire', 'uk_scotland'] },
  { id: 'uk_scotland', name: 'Scotland', country: 'uk', lat: 56.0, lng: -4.0, resources: 50, population: 540, neighbors: ['uk_north_west', 'uk_north_east'] },
  { id: 'uk_wales', name: 'Wales', country: 'uk', lat: 52.0, lng: -3.5, resources: 25, population: 310, neighbors: ['uk_south_west', 'uk_west_midlands'] },
  { id: 'uk_northern_ireland', name: 'Northern Ireland', country: 'uk', lat: 54.6, lng: -6.0, resources: 15, population: 190, neighbors: ['ie_leinster'] },

  // === ITALY ===
  { id: 'it_lombardy', name: 'Lombardia', country: 'italy', lat: 45.5, lng: 9.2, resources: 85, population: 1010, neighbors: ['it_piedmont', 'it_veneto', 'it_emilia', 'it_tuscany', 'ch_ticino'] },
  { id: 'it_piedmont', name: 'Piemonte', country: 'italy', lat: 45.0, lng: 7.8, resources: 40, population: 440, neighbors: ['it_lombardy', 'it_liguria', 'it_valle_aosta', 'fr_rhone'] },
  { id: 'it_valle_aosta', name: 'Valle d\'Aosta', country: 'italy', lat: 45.7, lng: 7.3, resources: 5, population: 130, neighbors: ['it_piedmont', 'ch_geneva'] },
  { id: 'it_liguria', name: 'Liguria', country: 'italy', lat: 44.4, lng: 8.8, resources: 20, population: 160, neighbors: ['it_piedmont', 'it_lombardy', 'it_emilia', 'it_tuscany', 'fr_provence'] },
  { id: 'it_veneto', name: 'Veneto', country: 'italy', lat: 45.6, lng: 12.0, resources: 55, population: 490, neighbors: ['it_lombardy', 'it_emilia', 'it_friuli', 'at_tyrol'] },
  { id: 'it_friuli', name: 'Friuli-Venezia Giulia', country: 'italy', lat: 45.9, lng: 13.2, resources: 20, population: 120, neighbors: ['it_veneto', 'si_slovenia'] },
  { id: 'it_emilia', name: 'Emilia-Romagna', country: 'italy', lat: 44.5, lng: 11.0, resources: 50, population: 450, neighbors: ['it_lombardy', 'it_liguria', 'it_veneto', 'it_tuscany', 'it_marche'] },
  { id: 'it_tuscany', name: 'Toscana', country: 'italy', lat: 43.5, lng: 11.0, resources: 35, population: 370, neighbors: ['it_liguria', 'it_lombardy', 'it_emilia', 'it_marche', 'it_umbria', 'it_lazio'] },
  { id: 'it_marche', name: 'Marche', country: 'italy', lat: 43.3, lng: 13.2, resources: 20, population: 150, neighbors: ['it_emilia', 'it_tuscany', 'it_umbria', 'it_abruzzo'] },
  { id: 'it_umbria', name: 'Umbria', country: 'italy', lat: 42.9, lng: 12.4, resources: 10, population: 90, neighbors: ['it_tuscany', 'it_marche', 'it_lazio', 'it_abruzzo'] },
  { id: 'it_lazio', name: 'Lazio', country: 'italy', lat: 41.9, lng: 12.5, resources: 50, population: 590, neighbors: ['it_tuscany', 'it_umbria', 'it_abruzzo', 'it_campania', 'it_molise'] },
  { id: 'it_abruzzo', name: 'Abruzzo', country: 'italy', lat: 42.3, lng: 13.8, resources: 15, population: 130, neighbors: ['it_marche', 'it_umbria', 'it_lazio', 'it_molise'] },
  { id: 'it_molise', name: 'Molise', country: 'italy', lat: 41.7, lng: 14.5, resources: 5, population: 60, neighbors: ['it_lazio', 'it_abruzzo', 'it_campania', 'it_puglia'] },
  { id: 'it_campania', name: 'Campania', country: 'italy', lat: 40.8, lng: 14.3, resources: 35, population: 580, neighbors: ['it_lazio', 'it_molise', 'it_puglia', 'it_basilicata'] },
  { id: 'it_puglia', name: 'Puglia', country: 'italy', lat: 41.0, lng: 16.5, resources: 25, population: 400, neighbors: ['it_molise', 'it_campania', 'it_basilicata'] },
  { id: 'it_basilicata', name: 'Basilicata', country: 'italy', lat: 40.5, lng: 16.0, resources: 10, population: 60, neighbors: ['it_campania', 'it_puglia', 'it_calabria'] },
  { id: 'it_calabria', name: 'Calabria', country: 'italy', lat: 38.8, lng: 16.3, resources: 15, population: 200, neighbors: ['it_basilicata'] },
  { id: 'it_sicily', name: 'Sicilia', country: 'italy', lat: 37.5, lng: 14.0, resources: 30, population: 500, neighbors: [] },
  { id: 'it_sardinia', name: 'Sardegna', country: 'italy', lat: 40.0, lng: 9.0, resources: 15, population: 170, neighbors: [] },

  // === SPAIN ===
  { id: 'es_madrid', name: 'Madrid', country: 'spain', lat: 40.4, lng: -3.7, resources: 80, population: 670, neighbors: ['es_castile_leon', 'es_castile_mancha', 'es_extremadura'] },
  { id: 'es_catalonia', name: 'Cataluña', country: 'spain', lat: 41.6, lng: 2.0, resources: 70, population: 770, neighbors: ['es_aragon', 'es_valencia', 'fr_occitanie'] },
  { id: 'es_valencia', name: 'Comunidad Valenciana', country: 'spain', lat: 39.5, lng: -0.5, resources: 40, population: 500, neighbors: ['es_catalonia', 'es_aragon', 'es_castile_mancha', 'es_murcia'] },
  { id: 'es_andalusia', name: 'Andalucía', country: 'spain', lat: 37.2, lng: -4.5, resources: 50, population: 840, neighbors: ['es_extremadura', 'es_castile_mancha', 'es_murcia', 'pt_alentejo'] },
  { id: 'es_castile_leon', name: 'Castilla y León', country: 'spain', lat: 42.0, lng: -4.5, resources: 35, population: 240, neighbors: ['es_madrid', 'es_castile_mancha', 'es_extremadura', 'es_galicia', 'es_asturias', 'es_basque', 'es_aragon'] },
  { id: 'es_castile_mancha', name: 'Castilla-La Mancha', country: 'spain', lat: 39.5, lng: -3.0, resources: 25, population: 210, neighbors: ['es_madrid', 'es_castile_leon', 'es_valencia', 'es_andalusia', 'es_extremadura', 'es_murcia'] },
  { id: 'es_extremadura', name: 'Extremadura', country: 'spain', lat: 39.0, lng: -6.0, resources: 15, population: 110, neighbors: ['es_madrid', 'es_castile_leon', 'es_castile_mancha', 'es_andalusia', 'pt_lisbon'] },
  { id: 'es_galicia', name: 'Galicia', country: 'spain', lat: 42.8, lng: -7.8, resources: 25, population: 270, neighbors: ['es_castile_leon', 'es_asturias', 'pt_norte'] },
  { id: 'es_asturias', name: 'Asturias', country: 'spain', lat: 43.3, lng: -5.8, resources: 15, population: 110, neighbors: ['es_castile_leon', 'es_galicia', 'es_basque'] },
  { id: 'es_basque', name: 'País Vasco', country: 'spain', lat: 43.0, lng: -2.5, resources: 35, population: 220, neighbors: ['es_castile_leon', 'es_asturias', 'es_aragon', 'fr_nouvelle_aquitaine'] },
  { id: 'es_aragon', name: 'Aragón', country: 'spain', lat: 41.5, lng: -0.5, resources: 20, population: 130, neighbors: ['es_catalonia', 'es_valencia', 'es_castile_leon', 'es_basque'] },
  { id: 'es_murcia', name: 'Murcia', country: 'spain', lat: 38.0, lng: -1.2, resources: 20, population: 150, neighbors: ['es_valencia', 'es_castile_mancha', 'es_andalusia'] },

  // === PORTUGAL ===
  { id: 'pt_lisbon', name: 'Lisboa', country: 'portugal', lat: 38.7, lng: -9.1, resources: 55, population: 510, neighbors: ['pt_norte', 'pt_alentejo', 'es_extremadura'] },
  { id: 'pt_norte', name: 'Norte', country: 'portugal', lat: 41.2, lng: -8.3, resources: 35, population: 370, neighbors: ['pt_lisbon', 'pt_centro', 'es_galicia'] },
  { id: 'pt_centro', name: 'Centro', country: 'portugal', lat: 40.0, lng: -8.0, resources: 20, population: 220, neighbors: ['pt_norte', 'pt_lisbon', 'pt_alentejo', 'es_extremadura'] },
  { id: 'pt_alentejo', name: 'Alentejo', country: 'portugal', lat: 38.0, lng: -7.8, resources: 15, population: 150, neighbors: ['pt_lisbon', 'pt_centro', 'es_andalusia', 'es_extremadura'] },

  // === NETHERLANDS ===
  { id: 'nl_holland', name: 'Holland', country: 'netherlands', lat: 52.2, lng: 4.7, resources: 75, population: 850, neighbors: ['nl_groningen', 'nl_limburg', 'be_flanders'] },
  { id: 'nl_groningen', name: 'Groningen', country: 'netherlands', lat: 53.2, lng: 6.6, resources: 25, population: 170, neighbors: ['nl_holland', 'nl_limburg', 'de_niedersachsen'] },
  { id: 'nl_limburg', name: 'Limburg', country: 'netherlands', lat: 51.0, lng: 5.8, resources: 20, population: 110, neighbors: ['nl_holland', 'nl_groningen', 'de_nordrhein', 'be_flanders'] },

  // === BELGIUM ===
  { id: 'be_flanders', name: 'Flanders', country: 'belgium', lat: 51.0, lng: 4.0, resources: 55, population: 660, neighbors: ['be_wallonia', 'nl_holland', 'nl_limburg', 'de_nordrhein', 'fr_hauts_france'] },
  { id: 'be_wallonia', name: 'Wallonia', country: 'belgium', lat: 50.4, lng: 5.0, resources: 35, population: 360, neighbors: ['be_flanders', 'fr_hauts_france', 'fr_grand_est', 'lu_luxembourg', 'de_rheinland'] },

  // === LUXEMBOURG ===
  { id: 'lu_luxembourg', name: 'Luxembourg', country: 'luxembourg', lat: 49.6, lng: 6.1, resources: 30, population: 63, neighbors: ['be_wallonia', 'de_rheinland', 'fr_grand_est'] },

  // === SWITZERLAND ===
  { id: 'ch_zurich', name: 'Zürich', country: 'switzerland', lat: 47.4, lng: 8.5, resources: 60, population: 150, neighbors: ['ch_geneva', 'ch_ticino', 'de_baden', 'de_bayern', 'at_upper_austria'] },
  { id: 'ch_geneva', name: 'Geneva', country: 'switzerland', lat: 46.2, lng: 6.1, resources: 50, population: 100, neighbors: ['ch_zurich', 'ch_ticino', 'fr_rhone', 'fr_grand_est', 'it_valle_aosta'] },
  { id: 'ch_ticino', name: 'Ticino', country: 'switzerland', lat: 46.1, lng: 8.9, resources: 20, population: 70, neighbors: ['ch_zurich', 'ch_geneva', 'it_lombardy'] },

  // === AUSTRIA ===
  { id: 'at_upper_austria', name: 'Upper Austria', country: 'austria', lat: 48.3, lng: 14.0, resources: 40, population: 150, neighbors: ['at_vienna', 'at_tyrol', 'de_bayern', 'cz_bohemia', 'ch_zurich'] },
  { id: 'at_vienna', name: 'Vienna', country: 'austria', lat: 48.2, lng: 16.4, resources: 65, population: 190, neighbors: ['at_upper_austria', 'at_tyrol', 'hu_western', 'sk_bratislava'] },
  { id: 'at_tyrol', name: 'Tyrol', country: 'austria', lat: 47.2, lng: 11.5, resources: 25, population: 80, neighbors: ['at_upper_austria', 'at_vienna', 'it_veneto', 'si_slovenia', 'hu_western'] },

  // === POLAND ===
  { id: 'pl_warsaw', name: 'Warsaw', country: 'poland', lat: 52.2, lng: 21.0, resources: 70, population: 180, neighbors: ['pl_mazovia', 'pl_lodz', 'pl_lublin'] },
  { id: 'pl_mazovia', name: 'Mazovia', country: 'poland', lat: 52.5, lng: 20.5, resources: 40, population: 540, neighbors: ['pl_warsaw', 'pl_lodz', 'pl_pomerania', 'pl_warmia', 'pl_lublin', 'pl_silesia'] },
  { id: 'pl_pomerania', name: 'Pomerania', country: 'poland', lat: 54.3, lng: 18.0, resources: 30, population: 230, neighbors: ['pl_mazovia', 'pl_warmia', 'de_mecklenburg', 'ru_kaliningrad'] },
  { id: 'pl_warmia', name: 'Warmia-Masuria', country: 'poland', lat: 53.8, lng: 20.0, resources: 20, population: 140, neighbors: ['pl_mazovia', 'pl_pomerania', 'pl_lublin', 'lt_samogitia'] },
  { id: 'pl_lublin', name: 'Lublin', country: 'poland', lat: 51.2, lng: 22.5, resources: 25, population: 210, neighbors: ['pl_warsaw', 'pl_mazovia', 'pl_warmia', 'pl_silesia', 'ua_volyn', 'by_brest'] },
  { id: 'pl_lodz', name: 'Łódź', country: 'poland', lat: 51.5, lng: 19.5, resources: 30, population: 250, neighbors: ['pl_warsaw', 'pl_mazovia', 'pl_silesia', 'pl_greater_poland'] },
  { id: 'pl_greater_poland', name: 'Greater Poland', country: 'poland', lat: 52.4, lng: 17.0, resources: 35, population: 350, neighbors: ['pl_lodz', 'pl_silesia', 'pl_lubusz', 'pl_pomerania'] },
  { id: 'pl_lubusz', name: 'Lubusz', country: 'poland', lat: 52.0, lng: 15.5, resources: 15, population: 100, neighbors: ['pl_greater_poland', 'pl_silesia', 'de_brandenburg'] },
  { id: 'pl_silesia', name: 'Silesia', country: 'poland', lat: 50.3, lng: 19.0, resources: 65, population: 460, neighbors: ['pl_mazovia', 'pl_lodz', 'pl_greater_poland', 'pl_lubusz', 'pl_lublin', 'cz_moravia', 'de_sachsen'] },

  // === CZECH REPUBLIC ===
  { id: 'cz_prague', name: 'Prague', country: 'czech', lat: 50.1, lng: 14.4, resources: 55, population: 130, neighbors: ['cz_bohemia', 'cz_moravia'] },
  { id: 'cz_bohemia', name: 'Bohemia', country: 'czech', lat: 49.8, lng: 14.0, resources: 40, population: 680, neighbors: ['cz_prague', 'cz_moravia', 'de_bayern', 'de_sachsen', 'at_upper_austria'] },
  { id: 'cz_moravia', name: 'Moravia', country: 'czech', lat: 49.5, lng: 16.5, resources: 30, population: 120, neighbors: ['cz_prague', 'cz_bohemia', 'pl_silesia', 'sk_bratislava', 'at_upper_austria'] },

  // === SLOVAKIA ===
  { id: 'sk_bratislava', name: 'Bratislava', country: 'slovakia', lat: 48.1, lng: 17.1, resources: 35, population: 110, neighbors: ['sk_eastern', 'cz_moravia', 'at_vienna', 'hu_western'] },
  { id: 'sk_eastern', name: 'Eastern Slovakia', country: 'slovakia', lat: 48.7, lng: 21.0, resources: 20, population: 160, neighbors: ['sk_bratislava', 'pl_lublin', 'ua_zakarpattia', 'hu_eastern'] },

  // === HUNGARY ===
  { id: 'hu_budapest', name: 'Budapest', country: 'hungary', lat: 47.5, lng: 19.0, resources: 60, population: 180, neighbors: ['hu_western', 'hu_eastern', 'hu_southern'] },
  { id: 'hu_western', name: 'Western Hungary', country: 'hungary', lat: 47.3, lng: 17.0, resources: 30, population: 300, neighbors: ['hu_budapest', 'hu_southern', 'at_vienna', 'at_tyrol', 'sk_bratislava', 'si_slovenia'] },
  { id: 'hu_eastern', name: 'Eastern Hungary', country: 'hungary', lat: 47.8, lng: 21.0, resources: 25, population: 350, neighbors: ['hu_budapest', 'hu_southern', 'sk_eastern', 'ua_zakarpattia', 'ro_crisana'] },
  { id: 'hu_southern', name: 'Southern Hungary', country: 'hungary', lat: 46.0, lng: 18.5, resources: 25, population: 180, neighbors: ['hu_budapest', 'hu_western', 'hu_eastern', 'hr_croatia', 'rs_vojvodina'] },

  // === ROMANIA ===
  { id: 'ro_bucharest', name: 'Bucharest', country: 'romania', lat: 44.4, lng: 26.1, resources: 65, population: 190, neighbors: ['ro_muntenia', 'ro_dobrogea'] },
  { id: 'ro_muntenia', name: 'Muntenia', country: 'romania', lat: 44.8, lng: 25.5, resources: 35, population: 530, neighbors: ['ro_bucharest', 'ro_oltenia', 'ro_crisana', 'ro_moldova', 'ro_dobrogea'] },
  { id: 'ro_oltenia', name: 'Oltenia', country: 'romania', lat: 44.5, lng: 23.5, resources: 25, population: 230, neighbors: ['ro_muntenia', 'ro_crisana', 'ro_transylvania', 'rs_serbia'] },
  { id: 'ro_crisana', name: 'Crișana', country: 'romania', lat: 47.0, lng: 22.0, resources: 20, population: 180, neighbors: ['ro_muntenia', 'ro_oltenia', 'ro_transylvania', 'ro_moldova', 'hu_eastern'] },
  { id: 'ro_transylvania', name: 'Transylvania', country: 'romania', lat: 46.5, lng: 24.0, resources: 40, population: 670, neighbors: ['ro_crisana', 'ro_oltenia', 'ro_moldova'] },
  { id: 'ro_moldova', name: 'Moldova', country: 'romania', lat: 46.5, lng: 27.0, resources: 30, population: 450, neighbors: ['ro_muntenia', 'ro_crisana', 'ro_transylvania', 'ro_dobrogea', 'md_moldova', 'ua_bucovina'] },
  { id: 'ro_dobrogea', name: 'Dobrogea', country: 'romania', lat: 44.0, lng: 28.0, resources: 15, population: 90, neighbors: ['ro_bucharest', 'ro_muntenia', 'ro_moldova', 'bg_northern'] },

  // === BULGARIA ===
  { id: 'bg_sofia', name: 'Sofia', country: 'bulgaria', lat: 42.7, lng: 23.3, resources: 40, population: 130, neighbors: ['bg_northern', 'bg_southern', 'rs_serbia', 'mk_macedonia'] },
  { id: 'bg_northern', name: 'Northern Bulgaria', country: 'bulgaria', lat: 43.2, lng: 25.5, resources: 25, population: 270, neighbors: ['bg_sofia', 'bg_southern', 'ro_dobrogea', 'rs_serbia'] },
  { id: 'bg_southern', name: 'Southern Bulgaria', country: 'bulgaria', lat: 42.0, lng: 26.0, resources: 25, population: 230, neighbors: ['bg_sofia', 'bg_northern', 'tr_eastern_thrace', 'gr_eastern_macedonia'] },

  // === GREECE ===
  { id: 'gr_athens', name: 'Athens', country: 'greece', lat: 38.0, lng: 23.7, resources: 55, population: 380, neighbors: ['gr_central', 'gr_peloponnese'] },
  { id: 'gr_central', name: 'Central Greece', country: 'greece', lat: 38.8, lng: 22.5, resources: 20, population: 150, neighbors: ['gr_athens', 'gr_eastern_macedonia', 'gr_thessaly', 'gr_epirus'] },
  { id: 'gr_peloponnese', name: 'Peloponnese', country: 'greece', lat: 37.3, lng: 22.0, resources: 20, population: 120, neighbors: ['gr_athens', 'gr_central', 'gr_epirus'] },
  { id: 'gr_thessaly', name: 'Thessaly', country: 'greece', lat: 39.5, lng: 22.5, resources: 15, population: 80, neighbors: ['gr_central', 'gr_eastern_macedonia', 'gr_epirus', 'gr_macedonia'] },
  { id: 'gr_eastern_macedonia', name: 'Eastern Macedonia', country: 'greece', lat: 40.5, lng: 24.0, resources: 20, population: 110, neighbors: ['gr_central', 'gr_thessaly', 'gr_macedonia', 'bg_southern', 'tr_eastern_thrace'] },
  { id: 'gr_macedonia', name: 'Macedonia', country: 'greece', lat: 40.8, lng: 22.0, resources: 25, population: 190, neighbors: ['gr_thessaly', 'gr_eastern_macedonia', 'gr_epirus', 'mk_macedonia'] },
  { id: 'gr_epirus', name: 'Epirus', country: 'greece', lat: 39.5, lng: 20.8, resources: 10, population: 50, neighbors: ['gr_central', 'gr_peloponnese', 'gr_thessaly', 'gr_macedonia', 'al_albania'] },
  { id: 'gr_crete', name: 'Crete', country: 'greece', lat: 35.2, lng: 24.5, resources: 15, population: 60, neighbors: [] },

  // === TURKEY (European) ===
  { id: 'tr_eastern_thrace', name: 'Eastern Thrace', country: 'turkey', lat: 41.0, lng: 27.5, resources: 30, population: 600, neighbors: ['bg_southern', 'gr_eastern_macedonia'] },

  // === SCANDINAVIA ===
  { id: 'se_stockholm', name: 'Stockholm', country: 'sweden', lat: 59.3, lng: 18.1, resources: 65, population: 240, neighbors: ['se_uppsala', 'se_ostergotland', 'se_vastmanland'] },
  { id: 'se_uppsala', name: 'Uppsala', country: 'sweden', lat: 60.0, lng: 17.5, resources: 20, population: 170, neighbors: ['se_stockholm', 'se_vastmanland', 'se_norrland', 'fi_finland'] },
  { id: 'se_ostergotland', name: 'Östergötland', country: 'sweden', lat: 58.5, lng: 16.0, resources: 25, population: 160, neighbors: ['se_stockholm', 'se_vastmanland', 'se_smaland', 'se_vastra'] },
  { id: 'se_vastmanland', name: 'Västmanland', country: 'sweden', lat: 59.5, lng: 16.0, resources: 15, population: 140, neighbors: ['se_stockholm', 'se_uppsala', 'se_ostergotland', 'se_vastra', 'se_norrland'] },
  { id: 'se_vastra', name: 'Västra Götaland', country: 'sweden', lat: 57.7, lng: 12.0, resources: 45, population: 170, neighbors: ['se_ostergotland', 'se_vastmanland', 'se_smaland', 'no_oslo'] },
  { id: 'se_smaland', name: 'Småland', country: 'sweden', lat: 57.0, lng: 14.5, resources: 20, population: 130, neighbors: ['se_ostergotland', 'se_vastra', 'se_skane'] },
  { id: 'se_skane', name: 'Skåne', country: 'sweden', lat: 55.8, lng: 13.5, resources: 30, population: 140, neighbors: ['se_smaland', 'dk_sjaelland'] },
  { id: 'se_norrland', name: 'Norrland', country: 'sweden', lat: 63.0, lng: 16.0, resources: 35, population: 120, neighbors: ['se_uppsala', 'se_vastmanland', 'no_trondelag', 'fi_finland'] },

  // === NORWAY ===
  { id: 'no_oslo', name: 'Oslo', country: 'norway', lat: 59.9, lng: 10.8, resources: 50, population: 140, neighbors: ['no_sorlandet', 'no_vestlandet', 'no_trondelag', 'se_vastra'] },
  { id: 'no_sorlandet', name: 'Sørlandet', country: 'norway', lat: 58.5, lng: 8.0, resources: 15, population: 40, neighbors: ['no_oslo', 'no_vestlandet'] },
  { id: 'no_vestlandet', name: 'Vestlandet', country: 'norway', lat: 60.5, lng: 6.0, resources: 25, population: 60, neighbors: ['no_oslo', 'no_sorlandet', 'no_trondelag'] },
  { id: 'no_trondelag', name: 'Trøndelag', country: 'norway', lat: 63.4, lng: 10.4, resources: 20, population: 50, neighbors: ['no_oslo', 'no_vestlandet', 'no_nordland', 'se_norrland'] },
  { id: 'no_nordland', name: 'Nordland', country: 'norway', lat: 67.0, lng: 14.5, resources: 20, population: 30, neighbors: ['no_trondelag', 'no_troms'] },
  { id: 'no_troms', name: 'Troms og Finnmark', country: 'norway', lat: 70.0, lng: 23.0, resources: 15, population: 20, neighbors: ['no_nordland', 'fi_finland'] },

  // === FINLAND ===
  { id: 'fi_helsinki', name: 'Helsinki', country: 'finland', lat: 60.2, lng: 24.9, resources: 45, population: 160, neighbors: ['fi_south', 'fi_finland', 'se_uppsala'] },
  { id: 'fi_south', name: 'Southern Finland', country: 'finland', lat: 61.0, lng: 26.0, resources: 25, population: 110, neighbors: ['fi_helsinki', 'fi_finland', 'fi_east', 'ru_karelia'] },
  { id: 'fi_finland', name: 'Central Finland', country: 'finland', lat: 63.0, lng: 26.0, resources: 20, population: 70, neighbors: ['fi_helsinki', 'fi_south', 'fi_east', 'se_norrland', 'no_troms'] },
  { id: 'fi_east', name: 'Eastern Finland', country: 'finland', lat: 62.5, lng: 29.0, resources: 15, population: 60, neighbors: ['fi_south', 'fi_finland', 'ru_karelia'] },

  // === DENMARK ===
  { id: 'dk_copenhagen', name: 'Copenhagen', country: 'denmark', lat: 55.7, lng: 12.6, resources: 55, population: 130, neighbors: ['dk_sjaelland', 'dk_jutland'] },
  { id: 'dk_sjaelland', name: 'Sjælland', country: 'denmark', lat: 55.5, lng: 11.8, resources: 30, population: 250, neighbors: ['dk_copenhagen', 'dk_jutland', 'de_schleswig', 'se_skane'] },
  { id: 'dk_jutland', name: 'Jutland', country: 'denmark', lat: 56.0, lng: 9.5, resources: 30, population: 130, neighbors: ['dk_copenhagen', 'dk_sjaelland', 'de_schleswig'] },

  // === IRELAND ===
  { id: 'ie_dublin', name: 'Dublin', country: 'ireland', lat: 53.3, lng: -6.3, resources: 55, population: 140, neighbors: ['ie_leinster', 'ie_connacht', 'ie_munster'] },
  { id: 'ie_leinster', name: 'Leinster', country: 'ireland', lat: 52.8, lng: -7.0, resources: 25, population: 260, neighbors: ['ie_dublin', 'ie_connacht', 'ie_munster', 'uk_northern_ireland'] },
  { id: 'ie_connacht', name: 'Connacht', country: 'ireland', lat: 53.5, lng: -9.0, resources: 15, population: 80, neighbors: ['ie_dublin', 'ie_leinster', 'ie_munster'] },
  { id: 'ie_munster', name: 'Munster', country: 'ireland', lat: 52.0, lng: -8.5, resources: 20, population: 130, neighbors: ['ie_dublin', 'ie_leinster', 'ie_connacht'] },

  // === BALKANS ===
  { id: 'rs_belgrade', name: 'Belgrade', country: 'serbia', lat: 44.8, lng: 20.5, resources: 50, population: 170, neighbors: ['rs_serbia', 'rs_vojvodina', 'hr_croatia'] },
  { id: 'rs_serbia', name: 'Central Serbia', country: 'serbia', lat: 44.0, lng: 21.0, resources: 30, population: 430, neighbors: ['rs_belgrade', 'rs_vojvodina', 'ro_oltenia', 'bg_sofia', 'mk_macedonia', 'rs_kosovo', 'ba_bosnia', 'me_montenegro'] },
  { id: 'rs_vojvodina', name: 'Vojvodina', country: 'serbia', lat: 45.5, lng: 19.5, resources: 30, population: 190, neighbors: ['rs_belgrade', 'rs_serbia', 'hu_southern', 'hr_croatia', 'ro_crisana'] },
  { id: 'rs_kosovo', name: 'Kosovo', country: 'serbia', lat: 42.6, lng: 21.0, resources: 10, population: 180, neighbors: ['rs_serbia', 'mk_macedonia', 'al_albania', 'me_montenegro'] },

  { id: 'hr_croatia', name: 'Croatia', country: 'croatia', lat: 45.3, lng: 15.5, resources: 30, population: 410, neighbors: ['rs_belgrade', 'rs_vojvodina', 'si_slovenia', 'hu_southern', 'ba_bosnia'] },
  { id: 'si_slovenia', name: 'Slovenia', country: 'slovenia', lat: 46.1, lng: 14.8, resources: 25, population: 210, neighbors: ['hr_croatia', 'at_tyrol', 'at_vienna', 'hu_western', 'it_friuli'] },

  { id: 'ba_bosnia', name: 'Bosnia', country: 'bosnia', lat: 44.0, lng: 17.5, resources: 20, population: 350, neighbors: ['hr_croatia', 'rs_serbia', 'me_montenegro'] },
  { id: 'me_montenegro', name: 'Montenegro', country: 'montenegro', lat: 42.5, lng: 19.0, resources: 10, population: 60, neighbors: ['ba_bosnia', 'rs_serbia', 'rs_kosovo', 'al_albania'] },

  { id: 'mk_macedonia', name: 'North Macedonia', country: 'north_macedonia', lat: 41.5, lng: 21.5, resources: 15, population: 210, neighbors: ['rs_serbia', 'rs_kosovo', 'bg_sofia', 'gr_macedonia', 'al_albania'] },
  { id: 'al_albania', name: 'Albania', country: 'albania', lat: 41.0, lng: 20.0, resources: 15, population: 290, neighbors: ['me_montenegro', 'rs_kosovo', 'mk_macedonia', 'gr_epirus'] },

  // === BALTICS ===
  { id: 'lt_vilnius', name: 'Vilnius', country: 'lithuania', lat: 54.7, lng: 25.3, resources: 30, population: 80, neighbors: ['lt_samogitia', 'lt_aukstaitija', 'by_grodno', 'pl_warmia'] },
  { id: 'lt_samogitia', name: 'Samogitia', country: 'lithuania', lat: 55.5, lng: 22.0, resources: 15, population: 60, neighbors: ['lt_vilnius', 'lt_aukstaitija', 'lv_latvia', 'pl_warmia', 'ru_kaliningrad'] },
  { id: 'lt_aukstaitija', name: 'Aukštaitija', country: 'lithuania', lat: 55.5, lng: 24.0, resources: 15, population: 50, neighbors: ['lt_vilnius', 'lt_samogitia', 'lv_latvia', 'by_grodno'] },

  { id: 'lv_riga', name: 'Riga', country: 'latvia', lat: 56.9, lng: 24.1, resources: 30, population: 70, neighbors: ['lv_latvia', 'lt_samogitia', 'lt_aukstaitija', 'ee_estonia'] },
  { id: 'lv_latvia', name: 'Latvia', country: 'latvia', lat: 57.0, lng: 26.0, resources: 20, population: 130, neighbors: ['lv_riga', 'lt_aukstaitija', 'ee_estonia', 'ru_pskov'] },

  { id: 'ee_tallinn', name: 'Tallinn', country: 'estonia', lat: 59.4, lng: 24.8, resources: 25, population: 50, neighbors: ['ee_estonia', 'lv_riga', 'fi_helsinki'] },
  { id: 'ee_estonia', name: 'Estonia', country: 'estonia', lat: 58.5, lng: 26.0, resources: 20, population: 80, neighbors: ['ee_tallinn', 'lv_latvia', 'lv_riga', 'ru_pskov'] },

  // === EASTERN EUROPE / RUSSIA ===
  { id: 'ru_moscow', name: 'Moscow', country: 'russia', lat: 55.8, lng: 37.6, resources: 100, population: 1260, neighbors: ['ru_central', 'ru_smolensk', 'ru_tula'] },
  { id: 'ru_central', name: 'Central Russia', country: 'russia', lat: 56.0, lng: 38.0, resources: 40, population: 590, neighbors: ['ru_moscow', 'ru_smolensk', 'ru_tula', 'ru_nizhny'] },
  { id: 'ru_smolensk', name: 'Smolensk', country: 'russia', lat: 55.0, lng: 33.0, resources: 20, population: 100, neighbors: ['ru_moscow', 'ru_central', 'by_minsk', 'ru_pskov'] },
  { id: 'ru_tula', name: 'Tula', country: 'russia', lat: 54.0, lng: 37.5, resources: 20, population: 150, neighbors: ['ru_moscow', 'ru_central', 'ru_nizhny', 'ru_voronezh'] },
  { id: 'ru_nizhny', name: 'Nizhny Novgorod', country: 'russia', lat: 56.3, lng: 44.0, resources: 35, population: 320, neighbors: ['ru_central', 'ru_tula', 'ru_voronezh'] },
  { id: 'ru_voronezh', name: 'Voronezh', country: 'russia', lat: 51.5, lng: 39.0, resources: 25, population: 230, neighbors: ['ru_tula', 'ru_nizhny', 'ua_kharkiv', 'ru_rostov'] },
  { id: 'ru_pskov', name: 'Pskov', country: 'russia', lat: 57.8, lng: 28.0, resources: 15, population: 70, neighbors: ['ru_smolensk', 'lv_latvia', 'ee_estonia', 'by_vitebsk'] },
  { id: 'ru_kaliningrad', name: 'Kaliningrad', country: 'russia', lat: 54.7, lng: 20.5, resources: 15, population: 100, neighbors: ['lt_samogitia', 'pl_pomerania'] },
  { id: 'ru_karelia', name: 'Karelia', country: 'russia', lat: 63.0, lng: 33.0, resources: 20, population: 60, neighbors: ['fi_south', 'fi_east', 'ru_murmansk'] },
  { id: 'ru_murmansk', name: 'Murmansk', country: 'russia', lat: 68.5, lng: 33.0, resources: 15, population: 30, neighbors: ['ru_karelia', 'no_troms'] },
  { id: 'ru_rostov', name: 'Rostov', country: 'russia', lat: 47.0, lng: 40.0, resources: 30, population: 420, neighbors: ['ru_voronezh', 'ua_kharkiv', 'ua_crimea', 'ru_kuban'] },
  { id: 'ru_kuban', name: 'Kuban', country: 'russia', lat: 45.0, lng: 39.0, resources: 30, population: 500, neighbors: ['ru_rostov', 'ua_crimea'] },

  // === UKRAINE ===
  { id: 'ua_kyiv', name: 'Kyiv', country: 'ukraine', lat: 50.5, lng: 30.5, resources: 65, population: 290, neighbors: ['ua_volyn', 'ua_zhytomyr', 'ua_cherkasy', 'ua_chernihiv', 'by_gomel'] },
  { id: 'ua_volyn', name: 'Volyn', country: 'ukraine', lat: 50.8, lng: 25.5, resources: 20, population: 170, neighbors: ['ua_kyiv', 'ua_zhytomyr', 'pl_lublin', 'by_brest'] },
  { id: 'ua_zhytomyr', name: 'Zhytomyr', country: 'ukraine', lat: 50.0, lng: 28.5, resources: 15, population: 120, neighbors: ['ua_kyiv', 'ua_volyn', 'ua_cherkasy', 'ua_vinnytsia'] },
  { id: 'ua_cherkasy', name: 'Cherkasy', country: 'ukraine', lat: 49.0, lng: 32.0, resources: 20, population: 120, neighbors: ['ua_kyiv', 'ua_zhytomyr', 'ua_vinnytsia', 'ua_kropyvnytskyi', 'ua_poltava'] },
  { id: 'ua_chernihiv', name: 'Chernihiv', country: 'ukraine', lat: 51.5, lng: 31.5, resources: 15, population: 100, neighbors: ['ua_kyiv', 'ua_poltava', 'ua_sumy', 'by_gomel'] },
  { id: 'ua_poltava', name: 'Poltava', country: 'ukraine', lat: 49.5, lng: 34.0, resources: 20, population: 140, neighbors: ['ua_cherkasy', 'ua_chernihiv', 'ua_sumy', 'ua_kharkiv', 'ua_kropyvnytskyi', 'ua_dnipro'] },
  { id: 'ua_sumy', name: 'Sumy', country: 'ukraine', lat: 51.0, lng: 34.0, resources: 15, population: 110, neighbors: ['ua_chernihiv', 'ua_poltava', 'ua_kharkiv', 'ru_smolensk'] },
  { id: 'ua_kharkiv', name: 'Kharkiv', country: 'ukraine', lat: 50.0, lng: 36.0, resources: 40, population: 270, neighbors: ['ua_poltava', 'ua_sumy', 'ua_dnipro', 'ua_luhansk', 'ru_voronezh', 'ru_rostov'] },
  { id: 'ua_dnipro', name: 'Dnipro', country: 'ukraine', lat: 48.5, lng: 35.0, resources: 45, population: 320, neighbors: ['ua_poltava', 'ua_kharkiv', 'ua_kropyvnytskyi', 'ua_zaporizhzhia', 'ua_donetsk'] },
  { id: 'ua_kropyvnytskyi', name: 'Kropyvnytskyi', country: 'ukraine', lat: 48.5, lng: 32.0, resources: 15, population: 100, neighbors: ['ua_cherkasy', 'ua_poltava', 'ua_dnipro', 'ua_vinnytsia', 'ua_odesa'] },
  { id: 'ua_vinnytsia', name: 'Vinnytsia', country: 'ukraine', lat: 49.0, lng: 28.5, resources: 20, population: 150, neighbors: ['ua_zhytomyr', 'ua_cherkasy', 'ua_kropyvnytskyi', 'ua_odesa', 'md_moldova', 'ro_moldova'] },
  { id: 'ua_odesa', name: 'Odesa', country: 'ukraine', lat: 46.5, lng: 30.5, resources: 35, population: 240, neighbors: ['ua_kropyvnytskyi', 'ua_vinnytsia', 'ua_zaporizhzhia', 'ua_crimea', 'md_moldova', 'ro_dobrogea'] },
  { id: 'ua_zaporizhzhia', name: 'Zaporizhzhia', country: 'ukraine', lat: 47.8, lng: 35.0, resources: 30, population: 170, neighbors: ['ua_dnipro', 'ua_odesa', 'ua_crimea', 'ua_donetsk'] },
  { id: 'ua_crimea', name: 'Crimea', country: 'ukraine', lat: 45.0, lng: 34.0, resources: 25, population: 230, neighbors: ['ua_odesa', 'ua_zaporizhzhia', 'ru_rostov', 'ru_kuban'] },
  { id: 'ua_donetsk', name: 'Donetsk', country: 'ukraine', lat: 48.0, lng: 37.5, resources: 50, population: 410, neighbors: ['ua_dnipro', 'ua_kharkiv', 'ua_zaporizhzhia', 'ua_luhansk', 'ru_rostov'] },
  { id: 'ua_luhansk', name: 'Luhansk', country: 'ukraine', lat: 49.0, lng: 38.5, resources: 25, population: 210, neighbors: ['ua_kharkiv', 'ua_donetsk', 'ru_voronezh', 'ru_rostov'] },
  { id: 'ua_zakarpattia', name: 'Zakarpattia', country: 'ukraine', lat: 48.5, lng: 23.0, resources: 15, population: 130, neighbors: ['sk_eastern', 'hu_eastern', 'ro_crisana', 'ua_bucovina'] },
  { id: 'ua_bucovina', name: 'Bucovina', country: 'ukraine', lat: 48.2, lng: 25.5, resources: 15, population: 90, neighbors: ['ua_zakarpattia', 'ua_volyn', 'ro_moldova', 'md_moldova'] },

  // === BELARUS ===
  { id: 'by_minsk', name: 'Minsk', country: 'belarus', lat: 53.9, lng: 27.6, resources: 45, population: 200, neighbors: ['by_brest', 'by_grodno', 'by_vitebsk', 'by_mogilev', 'by_gomel'] },
  { id: 'by_brest', name: 'Brest', country: 'belarus', lat: 52.1, lng: 23.7, resources: 15, population: 140, neighbors: ['by_minsk', 'pl_lublin', 'ua_volyn'] },
  { id: 'by_grodno', name: 'Grodno', country: 'belarus', lat: 53.5, lng: 25.0, resources: 15, population: 110, neighbors: ['by_minsk', 'lt_vilnius', 'lt_aukstaitija', 'pl_warmia'] },
  { id: 'by_vitebsk', name: 'Vitebsk', country: 'belarus', lat: 55.2, lng: 30.0, resources: 20, population: 120, neighbors: ['by_minsk', 'by_mogilev', 'ru_pskov', 'ru_smolensk', 'lv_latvia'] },
  { id: 'by_mogilev', name: 'Mogilev', country: 'belarus', lat: 53.9, lng: 30.3, resources: 15, population: 110, neighbors: ['by_minsk', 'by_vitebsk', 'by_gomel', 'ru_smolensk'] },
  { id: 'by_gomel', name: 'Gomel', country: 'belarus', lat: 52.5, lng: 31.0, resources: 20, population: 140, neighbors: ['by_minsk', 'by_mogilev', 'ua_kyiv', 'ua_chernihiv', 'ru_smolensk'] },

  // === MOLDOVA ===
  { id: 'md_chisinau', name: 'Chișinău', country: 'moldova', lat: 47.0, lng: 28.9, resources: 20, population: 80, neighbors: ['md_moldova', 'ro_moldova', 'ua_odesa'] },
  { id: 'md_moldova', name: 'Moldova', country: 'moldova', lat: 47.0, lng: 28.0, resources: 20, population: 180, neighbors: ['md_chisinau', 'ro_moldova', 'ua_vinnytsia', 'ua_bucovina', 'ua_odesa'] },
];

module.exports = { REGIONS };
