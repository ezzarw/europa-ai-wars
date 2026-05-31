function updateRelations(factions, events) {
  for (const f1 of Object.values(factions)) {
    if (!f1.alive) continue;
    for (const f2 of Object.values(factions)) {
      if (f1.id === f2.id || !f2.alive) continue;
      const rel = f1.relations[f2.id];
      if (!rel) continue;

      if (rel.war) {
        rel.trust -= 0.05 + Math.random() * 0.05;
        rel.opinion -= 5 + Math.floor(Math.random() * 10);
        setEmotion(f1, f2.id, 'hatred', Math.min(100, (f1.emotions[f2.id]?.hatred || 0) + 5 + Math.floor(Math.random() * 5)));
        setEmotion(f1, f2.id, 'anger', Math.min(100, (f1.emotions[f2.id]?.anger || 0) + 3 + Math.floor(Math.random() * 5)));
      } else if (rel.alliance) {
        rel.trust += 0.02 + Math.random() * 0.02;
        rel.opinion += 1 + Math.floor(Math.random() * 3);
        setEmotion(f1, f2.id, 'love', Math.min(100, (f1.emotions[f2.id]?.love || 0) + 1 + Math.floor(Math.random() * 2)));
      } else {
        rel.trust += (Math.random() - 0.5) * 0.02;
        rel.opinion += (Math.random() - 0.5) * 2;
      }

      rel.trust = Math.max(0, Math.min(1, rel.trust));
      rel.opinion = Math.max(-100, Math.min(100, rel.opinion));

      if (rel.opinion < -50 && !rel.war && Math.random() < 0.01) {
        events.push({
          type: 'diplomatic_incident',
          message: `💢 ${f1.name} accuses ${f2.name} of hostile actions! Relations worsening!`,
        });
      }
    }
  }
}

function setEmotion(faction, targetId, emotion, value) {
  if (!faction.emotions[targetId]) {
    faction.emotions[targetId] = { dominant: emotion, joy: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, disgust: 0, hatred: 0, love: 0, pride: 0, shame: 0 };
  }
  faction.emotions[targetId][emotion] = Math.min(100, value);

  let max = 0;
  let dominant = 'neutral';
  for (const [key, val] of Object.entries(faction.emotions[targetId])) {
    if (key !== 'dominant' && val > max) {
      max = val;
      dominant = key;
    }
  }
  faction.emotions[targetId].dominant = dominant;
}

function getDominantEmotion(faction1, faction2) {
  const em = faction1.emotions[faction2.id];
  if (!em) return 'neutral';
  return em.dominant;
}

function getEmotionDescription(emotion) {
  const descriptions = {
    hatred: 'BURNING HATE',
    anger: 'FURIOUS',
    love: 'AFFECTIONATE',
    joy: 'JOYFUL',
    sadness: 'SORROWFUL',
    fear: 'TERRIFIED',
    surprise: 'SURPRISED',
    disgust: 'DISGUSTED',
    pride: 'PROUD',
    shame: 'ASHAMED',
    neutral: 'INDIFFERENT',
  };
  return descriptions[emotion] || 'NEUTRAL';
}

module.exports = { updateRelations, setEmotion, getDominantEmotion, getEmotionDescription };
