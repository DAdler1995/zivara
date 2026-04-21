namespace Zivara.Api.Features.Activity;

public record LogMealRequest(
    MealRating Rating,
    MealCategory? Category,
    string? FoodNotes,
    HungerOrHabit HungerOrHabit = HungerOrHabit.ActuallyHungry
);

public record LogWorkoutRequest(
    int DurationMinutes,
    string? Notes
);

public record LogWeightRequest(
    decimal WeightLbs
);

public record LogWaterRequest(
    int Glasses
);

public record SyncStepsRequest(
    DateOnly Date,
    int StepCount
);

public record ActivityResponse(
    string Message,
    int XpAwarded,
    string SkillTrained
);

public record TodayActivityResponse(
    int StepsToday,
    int WaterGlassesToday,
    int MealsLoggedToday,
    bool CheckedInToday,
    IEnumerable<MealSummary> Meals
);

public record MealSummary(
    Guid Id,
    MealRating Rating,
    MealCategory? Category,
    string? FoodNotes,
    HungerOrHabit HungerOrHabit,
    DateTime LoggedAt
);