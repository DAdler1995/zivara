// six core skills
export enum SkillType {
    Agility = "Agility",
    Endurance = "Endurance",
    Vitality = "Vitality",
    Discipline = "Discipline",
    Nutrition = "Nutrition",
    Hydration = "Hydration"
}

// sources that can award xp - mirrors the C# XpSource enum
export enum XpSource {
    StepSync = "StepSync",
    MealLog = "MealLog",
    WorkoutLog = "WorkoutLog",
    WeightLog = "WeightLog",
    WaterLog = "WaterLog",
    QuestComplete = "QuestComplete",
    BossKill = "BossKill",
    Milestone = "Milestone",
    ReturnOfHero = "ReturnOfHero",
    DailyCheckin = "DailyCheckin",
}

// meal rating options
export enum MealRating {
    Healthy = "Healthy",
    Neutral = "Neutral",
    Unhealthy = "Unhealthy",
}

// meal categories
export enum MealCategory {
    Homemade = "Homemade",
    Sandwich = "Sandwich",
    Cereal = "Cereal",
    Takeout = "Takeout",
    Fried = "Fried",
    Salad = "Salad",
    Snack = "Snack",
    Drink = "Drink",
    Breakfast = "Breakfast",
    Leftovers = "Leftovers",
    Pizza = "Pizza",
    Soup = "Soup",
    Dessert = "Dessert",
    Other = "Other",
}

// hunger or habit selection on meal log
export enum HungerOrHabit {
    ActuallyHungry = "ActuallyHungry",
    ProbablyBored = "ProbablyBored",
}

// workout duration tiers
export enum WorkoutDuration {
    FifteenMin = 15,
    ThirtyMin = 30,
    FortyFiveMin = 45,
    SixtyMinPlus = 60,
}

// --- API RESPONSE SHAPES ---
export interface SkillDto {
    skillType: SkillType
    totalXP: number
    level: number
    xpIntoCurrentLevel: number
    xpToNextLevel: number
}

export interface CharacterDto {
    id: string
    name: string
    titleEquipped: string | null
    totalLevel: number
    skills: SkillDto[]
}

export interface LogMealRequest {
    rating: MealRating
    category?: MealCategory
    foodNotes?: string
    hungerOrHabit?: HungerOrHabit
}

export interface LogWorkoutRequest {
    durationMinutes: number
    notes?: string
}

export interface LogWeightRequest {
    weightLbs: number
}

export interface LogWaterRequest {
    glasses: number
}

export interface SyncStepsRequest {
    date: string // ISO date string YYYY-MM-DD
    stepCount: number
}

export interface XpAwardResult {
    skillType: SkillType
    xpAwarded: number
    newTotalXP: number
    newLevel: number
    leveledUp: boolean
}