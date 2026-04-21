// XP awards per activity
export const XP_AWARDS = {
    MEAL_HEALTHY: 100,
    MEAL_NEUTRAL: 50,
    MEAL_UNHEALTHY: 25,
    WATER_PER_GLASS: 30,
    WATER_DAILY_BONUS: 100,
    WEIGHT_LOG: 75,
    WEIGHT_LOSS_BONUS: 50,
    MEASUREMENT_LOG: 40,
    DAILY_CHECKIN: 50,
    ALL_QUESTS_BONUS: 150,
    RETURN_OF_HERO: 200,
    WORKOUT_15_MIN: 200,
    WORKOUT_30_MIN: 450,
    WORKOUT_45_MIN: 700,
    WORKOUT_60_MIN_PLUS: 1000
} as const

// step xp formula parameters
export const STEP_XP = {
    BASE_RATE: 2.0,
    CAP_STEPS: 15000,
    DECAY_HALF_LIFE: 5000
} as const

// daily step targets by agility level range
export const STEP_GOALS = {
    LEVEL_1: 5000,
    LEVEL_21: 7500,
    LEVEL_41: 10000,
    LEVEL_61: 12000
} as const

// water daily goal
export const WATER_GOAL_DAILY = 8

// reward jar defaults
export const JAR = {
  WEEKLY_CONTRIBUTION: 50.0,
  DAILY_QUEST_DAY_PERCENT: 0.1,
  WEEKLY_QUEST_PERCENT: 0.2,
  WORLD_BOSS_PERCENT: 0.1
} as const

// character name constraints
export const CHARACTER_NAME = {
    MAX_LENGTH: 20,
    CHANGE_COOLDOWN_DAYS: 30
} as const