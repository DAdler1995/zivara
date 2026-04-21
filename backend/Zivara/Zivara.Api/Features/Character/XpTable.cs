namespace Zivara.Api.Features.Character;

public static class XpTable
{
    private static readonly long[] Table =
    [
        0,           // index 0 - unused
        0,           // level 1
        83,          // level 2
        174,         // level 3
        276,         // level 4
        388,         // level 5
        512,         // level 6
        650,         // level 7
        801,         // level 8
        969,         // level 9
        1154,        // level 10
        1358,        // level 11
        1584,        // level 12
        1833,        // level 13
        2107,        // level 14
        2411,        // level 15
        2746,        // level 16
        3115,        // level 17
        3523,        // level 18
        3973,        // level 19
        4470,        // level 20
        5018,        // level 21
        5624,        // level 22
        6291,        // level 23
        7028,        // level 24
        7842,        // level 25
        8740,        // level 26
        9730,        // level 27
        10824,       // level 28
        12031,       // level 29
        13363,       // level 30
        14833,       // level 31
        16456,       // level 32
        18247,       // level 33
        20224,       // level 34
        22406,       // level 35
        24815,       // level 36
        27473,       // level 37
        30408,       // level 38
        33648,       // level 39
        37224,       // level 40
        41171,       // level 41
        45529,       // level 42
        50339,       // level 43
        55649,       // level 44
        61512,       // level 45
        67983,       // level 46
        75127,       // level 47
        83014,       // level 48
        91721,       // level 49
        101333,      // level 50
        111945,      // level 51
        123660,      // level 52
        136594,      // level 53
        150872,      // level 54
        166636,      // level 55
        184040,      // level 56
        203254,      // level 57
        224466,      // level 58
        247886,      // level 59
        273742,      // level 60
        302288,      // level 61
        333804,      // level 62
        368599,      // level 63
        407015,      // level 64
        449428,      // level 65
        496254,      // level 66
        547953,      // level 67
        605032,      // level 68
        668051,      // level 69
        737627,      // level 70
        814445,      // level 71
        899257,      // level 72
        992895,      // level 73
        1096278,     // level 74
        1210421,     // level 75
        1336443,     // level 76
        1475581,     // level 77
        1629200,     // level 78
        1798808,     // level 79
        1986068,     // level 80
        2192818,     // level 81
        2421087,     // level 82
        2673114,     // level 83
        2951373,     // level 84
        3258594,     // level 85
        3597792,     // level 86
        3972294,     // level 87
        4385776,     // level 88
        4842295,     // level 89
        5346332,     // level 90
        5902831,     // level 91
        6517253,     // level 92
        7195629,     // level 93
        7944614,     // level 94
        8771558,     // level 95
        9684577,     // level 96
        10692629,    // level 97
        11805606,    // level 98
        13034431,    // level 99
    ];

    public const int MaxLevel = 99;
    public const int MinLevel = 1;

    public static int GetLevelFromXP(long xp)
    {
        var level = MinLevel;
        for (var i = MinLevel; i <= MaxLevel; i++)
        {
            if (xp >= Table[i]) level = i;
            else break;
        }
        return level;
    }

    public static long GetXPForLevel(int level)
    {
        var clamped = Math.Max(MinLevel, Math.Min(MaxLevel, level));
        return Table[clamped];
    }

    public static long GetXPIntoCurrentLevel(long totalXp, int level)
    {
        return totalXp - GetXPForLevel(level);
    }

    public static long GetXPToNextLevel(long totalXp, int level)
    {
        if (level >= MaxLevel) return 0;
        return GetXPForLevel(level + 1) - totalXp;
    }
}