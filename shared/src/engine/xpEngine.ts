import { XP_TABLE, MAX_LEVEL, MIN_LEVEL, MAX_XP } from "../xpTable";
import { STEP_XP } from "../constants";

/**
 * Returns the level (1-99) for a given total XP amount.
 * If XP exceeds the level 99 threshold, returns 99.
 */
export function getLevelFromXP(xp: number): number {
    if (xp < 0) return MIN_LEVEL;
    if (xp >= MAX_XP) return MAX_LEVEL;

    let level = MIN_LEVEL;
    for (let i = MIN_LEVEL; i <= MAX_LEVEL; i++) {
        if (xp >= XP_TABLE[i]) {
        level = i
        } else {
        break
        }
    }

    return level
}

/**
 * Returns the total XP required to reach a given level.
 * Clamps to valid level range (1-99).
 */
export function getXPForLevel(level: number): number {
    const clamped = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));
    return XP_TABLE[clamped];
}

/**
 * Returns how much XP the player has earned within their current level.
 * This is what drives the XP progress bar within a level.
 *
 * Example: if a player has 100 XP total and level 2 starts at 83 XP,
 * they have 17 XP into level 2.
 */
export function getXPIntoCurrentLevel(xp: number): number {
    const level = getLevelFromXP(xp)
    return xp - XP_TABLE[level]
}

/**
 * Returns how much XP is needed to reach the next level from current total XP.
 * Returns 0 if already at max level.
 */
export function getXPToNextLevel(xp: number): number {
    const level = getLevelFromXP(xp)
    if (level >= MAX_LEVEL) return 0
    return XP_TABLE[level + 1] - xp
}

/**
 * Calculates Agility XP earned for a given step count.
 *
 * Formula:
 * - Steps up to CAP_STEPS (15,000): BASE_RATE (2.0) XP per step
 * - Steps above CAP_STEPS: BASE_RATE * (0.5 ^ (stepsOverCap / DECAY_HALF_LIFE))
 *   The rate halves every DECAY_HALF_LIFE (5,000) steps over the cap.
 *
 * Examples:
 * - 5,000 steps  = 10,000 XP
 * - 10,000 steps = 20,000 XP
 * - 15,000 steps = 30,000 XP
 * - 20,000 steps = 30,000 + ~5,000 = ~35,000 XP (decayed rate)
 * - 25,000 steps = ~37,500 XP (rate halved again)
 */
export function calculateStepXP(stepCount: number): number {
    if (stepCount <= 0) return 0

    const { BASE_RATE, CAP_STEPS, DECAY_HALF_LIFE } = STEP_XP

    if (stepCount <= CAP_STEPS) {
        return Math.floor(stepCount * BASE_RATE)
    }

    // XP for steps up to the cap
    const xpAtCap = CAP_STEPS * BASE_RATE

    // XP for steps above the cap using exponential decay
    const stepsOverCap = stepCount - CAP_STEPS
    let xpAboveCap = 0

    // Integrate the decay curve in 1-step increments would be slow.
    // Instead we calculate the definite integral of the decay function:
    // integral of BASE_RATE * 0.5^(x / DECAY_HALF_LIFE) dx from 0 to stepsOverCap
    // = BASE_RATE * DECAY_HALF_LIFE / ln(2) * (1 - 0.5^(stepsOverCap / DECAY_HALF_LIFE))
    const ln2 = Math.LN2
    xpAboveCap =
        BASE_RATE * (DECAY_HALF_LIFE / ln2) * (1 - Math.pow(0.5, stepsOverCap / DECAY_HALF_LIFE))

    return Math.floor(xpAtCap + xpAboveCap)
}

/**
 * Returns the daily step quest target for a given Agility level.
 */
export function getStepGoalForLevel(agilityLevel: number): number {
    if (agilityLevel <= 20) return 5000
    if (agilityLevel <= 40) return 7500
    if (agilityLevel <= 60) return 10000
    return 12000
}

/**
 * Returns the XP awarded for a workout based on duration in minutes.
 */
export function getWorkoutXP(durationMinutes: number): number {
    if (durationMinutes >= 60) return 1000
    if (durationMinutes >= 45) return 700
    if (durationMinutes >= 30) return 450
    if (durationMinutes >= 15) return 200
    return 0
}