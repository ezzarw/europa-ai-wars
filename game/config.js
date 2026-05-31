const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const cfg = {
  // Server
  PORT: parseInt(process.env.PORT, 10) || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // Game Engine
  GAME_SPEED_MS: parseInt(process.env.GAME_SPEED_MS, 10) || 2000,
  MAX_TURNS: parseInt(process.env.MAX_TURNS, 10) || 9999,

  // Economy
  BASE_REGION_INCOME: parseFloat(process.env.BASE_REGION_INCOME) || 5,
  ECONOMY_RANDOM_MAX: parseFloat(process.env.ECONOMY_RANDOM_MAX) || 20,
  ARMY_UPKEEP_MULTIPLIER: parseFloat(process.env.ARMY_UPKEEP_MULTIPLIER) || 0.15,
  AIR_UPKEEP_MULTIPLIER: parseFloat(process.env.AIR_UPKEEP_MULTIPLIER) || 0.10,
  NAVY_UPKEEP_MULTIPLIER: parseFloat(process.env.NAVY_UPKEEP_MULTIPLIER) || 0.08,
  ECONOMY_PRODUCTION_RATIO: parseFloat(process.env.ECONOMY_PRODUCTION_RATIO) || 0.05,
  PRODUCTION_COST_MULTIPLIER: parseFloat(process.env.PRODUCTION_COST_MULTIPLIER) || 2,

  // Limits
  MAX_TROOPS_RECRUIT: parseInt(process.env.MAX_TROOPS_RECRUIT, 10) || 1000,
  MAX_AIRCRAFT_BUILD: parseInt(process.env.MAX_AIRCRAFT_BUILD, 10) || 200,
  MAX_NAVAL_BUILD: parseInt(process.env.MAX_NAVAL_BUILD, 10) || 50,
  MAX_NUKE_COUNT: parseInt(process.env.MAX_NUKE_COUNT, 10) || 5,

  // Recruit Costs
  RECRUIT_COST_PER_TROOP: parseFloat(process.env.RECRUIT_COST_PER_TROOP) || 2,
  AIRCRAFT_COST: parseFloat(process.env.AIRCRAFT_COST) || 5,
  NAVAL_COST: parseFloat(process.env.NAVAL_COST) || 8,
  FORTIFY_COST_PER_LEVEL: parseFloat(process.env.FORTIFY_COST_PER_LEVEL) || 30,
  SPY_COST: parseFloat(process.env.SPY_COST) || 30,
  COUNTER_INTEL_COST: parseFloat(process.env.COUNTER_INTEL_COST) || 40,
  PROPAGANDA_BASE_COST: parseFloat(process.env.PROPAGANDA_BASE_COST) || 25,
  NUCLEAR_PROGRAM_COST: parseFloat(process.env.NUCLEAR_PROGRAM_COST) || 200,

  // Battle
  BATTLE_ATTACK_RANDOM_MIN: parseFloat(process.env.BATTLE_ATTACK_RANDOM_MIN) || 0.85,
  BATTLE_ATTACK_RANDOM_MAX: parseFloat(process.env.BATTLE_ATTACK_RANDOM_MAX) || 0.30,
  BATTLE_DEFENSE_RANDOM_MIN: parseFloat(process.env.BATTLE_DEFENSE_RANDOM_MIN) || 0.90,
  BATTLE_DEFENSE_RANDOM_MAX: parseFloat(process.env.BATTLE_DEFENSE_RANDOM_MAX) || 0.50,
  NEUTRAL_ATTACK_LOSS_MIN: parseFloat(process.env.NEUTRAL_ATTACK_LOSS_MIN) || 0.08,
  NEUTRAL_ATTACK_LOSS_MAX: parseFloat(process.env.NEUTRAL_ATTACK_LOSS_MAX) || 0.16,
  NEUTRAL_DEFEAT_LOSS_MIN: parseFloat(process.env.NEUTRAL_DEFEAT_LOSS_MIN) || 0.18,
  NEUTRAL_DEFEAT_LOSS_MAX: parseFloat(process.env.NEUTRAL_DEFEAT_LOSS_MAX) || 0.30,
  ENEMY_ATTACK_LOSS_MIN: parseFloat(process.env.ENEMY_ATTACK_LOSS_MIN) || 0.12,
  ENEMY_ATTACK_LOSS_MAX: parseFloat(process.env.ENEMY_ATTACK_LOSS_MAX) || 0.22,
  ENEMY_DEFENDER_LOSS_MIN: parseFloat(process.env.ENEMY_DEFENDER_LOSS_MIN) || 0.10,
  ENEMY_DEFENDER_LOSS_MAX: parseFloat(process.env.ENEMY_DEFENDER_LOSS_MAX) || 0.24,
  MIN_TROOPS_FOR_ATTACK: parseInt(process.env.MIN_TROOPS_FOR_ATTACK, 10) || 10,

  // Global Tension
  TENSION_PER_WAR: parseFloat(process.env.TENSION_PER_WAR) || 0.10,
  TENSION_PER_SANCTIONS: parseFloat(process.env.TENSION_PER_SANCTIONS) || 0.03,
  TENSION_PER_BETRAYAL: parseFloat(process.env.TENSION_PER_BETRAYAL) || 0.05,
  TENSION_PER_NUCLEAR_PROGRAM: parseFloat(process.env.TENSION_PER_NUCLEAR_PROGRAM) || 0.15,
  TENSION_PER_NUKE_STRIKE: parseFloat(process.env.TENSION_PER_NUKE_STRIKE) || 0.30,

  // Diplomacy
  TRADE_PRICE_BASE: parseFloat(process.env.TRADE_PRICE_BASE) || 5,
  TRADE_TRUST_GAIN: parseFloat(process.env.TRADE_TRUST_GAIN) || 0.02,
  TAX_RATE_DEFAULT: parseFloat(process.env.TAX_RATE_DEFAULT) || 0.3,
};

module.exports = cfg;
