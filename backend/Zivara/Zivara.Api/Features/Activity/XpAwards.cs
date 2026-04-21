namespace Zivara.Api.Features.Activity;

// Single source of truth for XP award amounts in the C# codebase.
// Mirrors the constants in shared/src/constants.ts.
// If any value changes, both files must be updated together.
public static class XpAwards
{
    public const int MealHealthy = 100;
    public const int MealNeutral = 50;
    public const int MealUnhealthy = 25;
    public const int WaterPerGlass = 30;
    public const int WaterDailyBonus = 100;
    public const int WaterDailyGoal = 8;
    public const int WeightLog = 75;
    public const int WeightLossBonus = 50;
    public const int DailyCheckin = 50;
    public const int AllQuestsBonus = 150;
    public const int ReturnOfHero = 200;
    public const int PassiveActivityLog = 25;
    public const int Workout15Min = 200;
    public const int Workout30Min = 450;
    public const int Workout45Min = 700;
    public const int Workout60Min = 1000;
}