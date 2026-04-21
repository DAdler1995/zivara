import { describe, it, expect } from "vitest"
import {
    getLevelFromXP,
    getXPForLevel,
    getXPIntoCurrentLevel,
    getXPToNextLevel,
    calculateStepXP,
    getStepGoalForLevel,
    getWorkoutXP,
} from "./xpEngine"

describe("getLevelFromXP", () => {
    it("returns level 1 at 0 XP", () => {
        expect(getLevelFromXP(0)).toBe(1)
    })

    it("returns level 1 just below level 2 threshold", () => {
        expect(getLevelFromXP(82)).toBe(1)
    })

    it("returns level 2 at exactly the level 2 threshold", () => {
        expect(getLevelFromXP(83)).toBe(2)
    })

    it("returns level 10 at exactly the level 10 threshold", () => {
        expect(getLevelFromXP(1154)).toBe(10)
    })

    it("returns level 50 at exactly the level 50 threshold", () => {
        expect(getLevelFromXP(101333)).toBe(50)
    })

    it("returns level 99 at exactly the level 99 threshold", () => {
        expect(getLevelFromXP(13034431)).toBe(99)
    })

    it("returns level 99 when XP exceeds max", () => {
        expect(getLevelFromXP(99999999)).toBe(99)
    })

    it("returns level 1 for negative XP", () => {
        expect(getLevelFromXP(-100)).toBe(1)
    })
})

describe("getXPForLevel", () => {
    it("returns 0 XP for level 1", () => {
        expect(getXPForLevel(1)).toBe(0)
    })

    it("returns 83 XP for level 2", () => {
        expect(getXPForLevel(2)).toBe(83)
    })

    it("returns 13034431 XP for level 99", () => {
        expect(getXPForLevel(99)).toBe(13034431)
    })

    it("clamps to level 1 for levels below 1", () => {
        expect(getXPForLevel(0)).toBe(0)
        expect(getXPForLevel(-5)).toBe(0)
    })

    it("clamps to level 99 for levels above 99", () => {
        expect(getXPForLevel(100)).toBe(13034431)
    })
})

describe("getXPIntoCurrentLevel", () => {
    it("returns 0 at exactly level 1 start", () => {
        expect(getXPIntoCurrentLevel(0)).toBe(0)
    })

    it("returns correct XP into level 2", () => {
        // Level 2 starts at 83 XP. Player has 100 XP. Should be 17 XP into level 2.
        expect(getXPIntoCurrentLevel(100)).toBe(17)
    })

    it("returns 0 at exactly the level threshold", () => {
        // At exactly 83 XP the player just hit level 2, so 0 XP into it
        expect(getXPIntoCurrentLevel(83)).toBe(0)
    })
})

describe("getXPToNextLevel", () => {
    it("returns correct XP to next level from 0 XP", () => {
        // Level 1 to level 2 requires 83 XP total. At 0 XP, need 83 more.
        expect(getXPToNextLevel(0)).toBe(83)
    })

    it("returns correct XP to next level mid-level", () => {
        // At 100 XP we are level 2 (starts at 83). Level 3 starts at 174.
        // Need 174 - 100 = 74 more XP.
        expect(getXPToNextLevel(100)).toBe(74)
    })

    it("returns 0 at max level", () => {
        expect(getXPToNextLevel(13034431)).toBe(0)
    })
})

describe("calculateStepXP", () => {
    it("returns 0 for 0 steps", () => {
        expect(calculateStepXP(0)).toBe(0)
    })

    it("returns 0 for negative steps", () => {
        expect(calculateStepXP(-100)).toBe(0)
    })

    it("awards 2 XP per step below the cap", () => {
        expect(calculateStepXP(5000)).toBe(10000)
        expect(calculateStepXP(10000)).toBe(20000)
        expect(calculateStepXP(15000)).toBe(30000)
    })

    it("awards more XP for steps above cap but at a reduced rate", () => {
        const atCap = calculateStepXP(15000)
        const aboveCap = calculateStepXP(20000)
        expect(aboveCap).toBeGreaterThan(atCap)
        // Above cap rate should be less than 2 XP per step
        const extraSteps = 5000
        const extraXP = aboveCap - atCap
        expect(extraXP).toBeLessThan(extraSteps * 2)
    })

    it("XP for 20000 steps is less than double the XP for 15000 steps", () => {
        // Verifies the decay is working -- going from 15k to 20k should earn
        // significantly less than the first 15k steps
        const at15k = calculateStepXP(15000)
        const at20k = calculateStepXP(20000)
        expect(at20k).toBeLessThan(at15k * 2)
    })

    it("always returns an integer", () => {
        expect(Number.isInteger(calculateStepXP(7500))).toBe(true)
        expect(Number.isInteger(calculateStepXP(17500))).toBe(true)
    })
})

describe("getStepGoalForLevel", () => {
    it("returns 5000 steps for level 1", () => {
        expect(getStepGoalForLevel(1)).toBe(5000)
    })

    it("returns 5000 steps for level 20", () => {
        expect(getStepGoalForLevel(20)).toBe(5000)
    })

    it("returns 7500 steps for level 21", () => {
        expect(getStepGoalForLevel(21)).toBe(7500)
    })

    it("returns 10000 steps for level 41", () => {
        expect(getStepGoalForLevel(41)).toBe(10000)
    })

    it("returns 12000 steps for level 61", () => {
        expect(getStepGoalForLevel(61)).toBe(12000)
    })

    it("returns 12000 steps for level 99", () => {
        expect(getStepGoalForLevel(99)).toBe(12000)
    })
})

describe("getWorkoutXP", () => {
    it("returns 0 for workouts under 15 minutes", () => {
        expect(getWorkoutXP(10)).toBe(0)
        expect(getWorkoutXP(14)).toBe(0)
    })

    it("returns 200 XP for 15 minute workout", () => {
        expect(getWorkoutXP(15)).toBe(200)
    })

    it("returns 450 XP for 30 minute workout", () => {
        expect(getWorkoutXP(30)).toBe(450)
    })

    it("returns 700 XP for 45 minute workout", () => {
        expect(getWorkoutXP(45)).toBe(700)
    })

    it("returns 1000 XP for 60 minute workout", () => {
        expect(getWorkoutXP(60)).toBe(1000)
    })

    it("returns 1000 XP for workouts over 60 minutes", () => {
        expect(getWorkoutXP(90)).toBe(1000)
        expect(getWorkoutXP(120)).toBe(1000)
    })
})