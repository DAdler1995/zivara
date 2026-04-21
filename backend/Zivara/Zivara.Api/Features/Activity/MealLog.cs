using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Activity;

public enum MealRating
{
    Healthy,
    Neutral,
    Unhealthy
}

public enum MealCategory
{
    Homemade,
    Sandwich,
    Cereal,
    Takeout,
    Fried,
    Salad,
    Snack,
    Drink,
    Breakfast,
    Leftovers,
    Pizza,
    Soup,
    Dessert,
    Other
}

public enum HungerOrHabit
{
    ActuallyHungry,
    ProbablyBored
}

public class MealLog
{
    public Guid Id { get; set; }
    public Guid CharacterId { get; set; }
    public MealRating Rating { get; set; }
    public MealCategory? Category { get; set; }
    public string? FoodNotes { get; set; }
    public HungerOrHabit HungerOrHabit { get; set; } = HungerOrHabit.ActuallyHungry;
    public DateTime LoggedAt { get; set; }

    // Navigation property
    public CharacterEntity Character { get; set; } = null!;
}