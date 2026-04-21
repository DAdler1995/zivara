using Zivara.Api.Features.Character;

namespace Zivara.Api.Features.Quests;

public record QuestTemplate(string Key, string Description, int TargetValue);

public static class QuestTemplates
{
    public static readonly Dictionary<SkillType, Dictionary<int, List<QuestTemplate>>> Templates = new()
    {
        [SkillType.Agility] = new()
        {
            [1] = new()
            {
                new("agility_t1_1", "The road to the eastern market is long. Walk 3,000 steps before the sun sets.", 3000),
                new("agility_t1_2", "A ranger's legs are their greatest weapon. Cover 2 miles of ground today.", 3000),
                new("agility_t1_3", "The old road has not been walked in some time. Give it the attention it deserves. Walk 2,500 steps.", 2500),
                new("agility_t1_4", "A scout's report is only as good as their legs. Log 3,000 steps today.", 3000),
                new("agility_t1_5", "The guild master requires a short patrol of the outer road. Walk 2,000 steps.", 2000),
                new("agility_t1_6", "Movement is resistance. The Stillness hates a moving target. Walk 3,000 steps.", 3000),
                new("agility_t1_7", "The village at the crossroads needs word of your passing. Walk 2,500 steps today.", 2500),
                new("agility_t1_8", "The road does not walk itself. Cover 3,000 steps before nightfall.", 3000),
            },
            [2] = new()
            {
                new("agility_t2_1", "The mountain pass requires steady legs. Walk 6,000 steps today.", 6000),
                new("agility_t2_2", "A courier's work is never done. Log 7,000 steps before the day ends.", 7000),
                new("agility_t2_3", "The eastern watchtower reports movement on the road. Investigate by foot. Walk 6,500 steps.", 6500),
                new("agility_t2_4", "The patrol route has been extended. Cover 7,000 steps today.", 7000),
                new("agility_t2_5", "Word from the guild requires a long walk to deliver. Log 6,000 steps.", 6000),
                new("agility_t2_6", "The road to Kovari is well-worn but long. Walk 7,500 steps today.", 7500),
                new("agility_t2_7", "A seasoned traveller keeps their legs moving. Log 6,500 steps.", 6500),
                new("agility_t2_8", "The border road has been neglected. Walk it today. Cover 7,000 steps.", 7000),
            },
            [3] = new()
            {
                new("agility_t3_1", "The full circuit of the valley roads awaits. Walk 10,000 steps today.", 10000),
                new("agility_t3_2", "A veteran ranger covers ground without complaint. Log 10,000 steps.", 10000),
                new("agility_t3_3", "The mountain roads are long and the pass demands respect. Walk 12,000 steps.", 12000),
                new("agility_t3_4", "The Iron Road runs the length of the valley. Walk it end to end. Log 11,000 steps.", 11000),
                new("agility_t3_5", "Distance is discipline. Cover 10,000 steps today.", 10000),
                new("agility_t3_6", "The old pilgrim roads deserve their walkers. Log 11,000 steps.", 11000),
                new("agility_t3_7", "A warrior who cannot move cannot fight. Walk 10,000 steps today.", 10000),
                new("agility_t3_8", "The full patrol circuit takes most of the day. Cover 12,000 steps.", 12000),
            }
        },
        [SkillType.Endurance] = new()
        {
            [1] = new()
            {
                new("endurance_t1_1", "The training grounds are open. Complete a workout of any kind today.", 1),
                new("endurance_t1_2", "The knight-commander demands the recruits prove themselves. Log an exercise session of at least 15 minutes.", 15),
                new("endurance_t1_3", "Even a short session is better than none. Complete a 15 minute workout.", 15),
                new("endurance_t1_4", "The body adapts to what it is asked to do. Ask it something today. Log a workout.", 1),
                new("endurance_t1_5", "The training yard is quiet. That is not an excuse. Log a workout of any duration.", 1),
                new("endurance_t1_6", "Effort compounds. A 15 minute session today is worth more than you think.", 15),
                new("endurance_t1_7", "The guild requires proof of continued training. Log a workout today.", 1),
                new("endurance_t1_8", "The Stillness favors those who sit still. Do not oblige it. Log a workout.", 1),
            },
            [2] = new()
            {
                new("endurance_t2_1", "A journeyman does not stop at the minimum. Complete a 30 minute workout today.", 30),
                new("endurance_t2_2", "The training regimen demands sustained effort. Log a workout of 30 minutes or more.", 30),
                new("endurance_t2_3", "Half an hour of honest effort. That is all that is asked. Log a 30 minute workout.", 30),
                new("endurance_t2_4", "The body builds itself in the work. Put in 30 minutes today.", 30),
                new("endurance_t2_5", "A seasoned warrior trains consistently. Log a workout of 30 minutes or more.", 30),
                new("endurance_t2_6", "Thirty minutes is an investment. Log the workout.", 30),
                new("endurance_t2_7", "The training grounds respect effort, not excuses. Log 30 minutes of work.", 30),
                new("endurance_t2_8", "Push past the first instinct to stop. Log a 30 minute workout today.", 30),
            },
            [3] = new()
            {
                new("endurance_t3_1", "An elite warrior does not train lightly. Complete a 45 minute workout today.", 45),
                new("endurance_t3_2", "The long session is where growth happens. Log a workout of 45 minutes or more.", 45),
                new("endurance_t3_3", "A full hour of training is a statement. Log a 60 minute workout.", 60),
                new("endurance_t3_4", "The hardest part is starting. The second hardest is the 45 minute mark. Pass it.", 45),
                new("endurance_t3_5", "An hour in the training yard. No shortcuts today. Log 60 minutes.", 60),
                new("endurance_t3_6", "The veteran's standard is not comfortable. Log a 45 minute workout.", 45),
                new("endurance_t3_7", "Sustained effort over a full hour. Log it and move on.", 60),
                new("endurance_t3_8", "Forty-five minutes of honest work. That is today's requirement.", 45),
            }
        },
        [SkillType.Nutrition] = new()
        {
            [1] = new()
            {
                new("nutrition_t1_1", "The court healer warns of poor provisions. Log every meal you consume today.", 2),
                new("nutrition_t1_2", "A traveller's rations must be chosen wisely. Log at least 2 meals, one of them healthy.", 2),
                new("nutrition_t1_3", "Awareness is the first step. Log at least 2 meals today regardless of what they are.", 2),
                new("nutrition_t1_4", "The healer cannot treat what she does not know. Log 2 meals today.", 2),
                new("nutrition_t1_5", "Keep an honest record of your provisions. Log 2 meals today.", 2),
                new("nutrition_t1_6", "What you eat is what you become. Start paying attention. Log 2 meals.", 2),
                new("nutrition_t1_7", "The guild's records require a nutritional accounting. Log 2 meals today.", 2),
                new("nutrition_t1_8", "Honest provisions, honestly recorded. Log 2 meals today.", 2),
            },
            [2] = new()
            {
                new("nutrition_t2_1", "Three meals logged before the day ends. At least one must be healthy.", 3),
                new("nutrition_t2_2", "The healer's ledger requires a full day's accounting. Log 3 meals.", 3),
                new("nutrition_t2_3", "Sustained nutrition awareness. Log every meal today. Minimum 3.", 3),
                new("nutrition_t2_4", "A journeyman tracks their provisions faithfully. Log 3 meals today.", 3),
                new("nutrition_t2_5", "The road is long and provisions matter. Log 3 meals before nightfall.", 3),
                new("nutrition_t2_6", "Three honest meal entries. That is today's requirement.", 3),
                new("nutrition_t2_7", "Consistency in the small things builds the larger ones. Log 3 meals.", 3),
                new("nutrition_t2_8", "The healer requests a full day's meal record. Log 3 meals today.", 3),
            },
            [3] = new()
            {
                new("nutrition_t3_1", "A full day of healthy provisions. Log 3 meals, all of them healthy.", 3),
                new("nutrition_t3_2", "The veteran knows that performance begins in the kitchen. Log 4 meals today.", 4),
                new("nutrition_t3_3", "Log every meal today without exception. Minimum 3, at least 2 healthy.", 3),
                new("nutrition_t3_4", "Complete nutritional awareness. Log all meals today. Minimum 4.", 4),
                new("nutrition_t3_5", "The discipline of a full day's honest record. Log 4 meals.", 4),
                new("nutrition_t3_6", "Three healthy meals in a single day. Log them.", 3),
                new("nutrition_t3_7", "A full accounting of today's provisions. Log at least 4 meals.", 4),
                new("nutrition_t3_8", "The highest standard of nutritional tracking. Log 4 meals today.", 4),
            }
        },
        [SkillType.Vitality] = new()
        {
            [1] = new()
            {
                new("vitality_t1_1", "The healer requires a baseline measurement. Log your weight today.", 1),
                new("vitality_t1_2", "What gets measured gets managed. Log your weight today.", 1),
                new("vitality_t1_3", "The records must be kept current. Log your weight.", 1),
                new("vitality_t1_4", "A warrior knows their own condition. Log your weight today.", 1),
                new("vitality_t1_5", "The guild's health records require an update. Log your weight.", 1),
                new("vitality_t1_6", "Awareness of the body begins with measurement. Log your weight today.", 1),
                new("vitality_t1_7", "The healer cannot track progress without data. Log your weight.", 1),
                new("vitality_t1_8", "The record does not keep itself. Log your weight today.", 1),
            },
            [2] = new()
            {
                new("vitality_t2_1", "A consistent record tells the true story. Log your weight today.", 1),
                new("vitality_t2_2", "The trend only appears in the data. Log your weight.", 1),
                new("vitality_t2_3", "Vitality is tracked, not assumed. Log your weight today.", 1),
                new("vitality_t2_4", "The healer reviews the long record. Add today's entry. Log your weight.", 1),
                new("vitality_t2_5", "A week of entries tells more than a single one. Log your weight today.", 1),
                new("vitality_t2_6", "The numbers do not lie. Add today's to the record.", 1),
                new("vitality_t2_7", "Progress is measured, not felt. Log your weight.", 1),
                new("vitality_t2_8", "An honest entry in the record. Log your weight today.", 1),
            },
            [3] = new()
            {
                new("vitality_t3_1", "The long record demands consistency. Log your weight today.", 1),
                new("vitality_t3_2", "A veteran tracks every variable. Log your weight.", 1),
                new("vitality_t3_3", "The record is only useful if it is complete. Log your weight today.", 1),
                new("vitality_t3_4", "Precision in tracking is precision in progress. Log your weight.", 1),
                new("vitality_t3_5", "The data speaks when the feeling does not. Log your weight today.", 1),
                new("vitality_t3_6", "A complete record requires today's entry. Log your weight.", 1),
                new("vitality_t3_7", "The healer needs today's measurement. Log your weight.", 1),
                new("vitality_t3_8", "Every entry matters. Log your weight today.", 1),
            }
        },
        [SkillType.Hydration] = new()
        {
            [1] = new()
            {
                new("hydration_t1_1", "The desert road is dry. Drink 4 glasses of water today.", 4),
                new("hydration_t1_2", "A traveller who does not drink does not travel long. Log 4 glasses of water.", 4),
                new("hydration_t1_3", "The healer prescribes water before anything else. Log 4 glasses today.", 4),
                new("hydration_t1_4", "Half the daily measure. Log 4 glasses of water today.", 4),
                new("hydration_t1_5", "Water first. Everything else second. Log 4 glasses today.", 4),
                new("hydration_t1_6", "The river runs through those who drink from it. Log 4 glasses of water.", 4),
                new("hydration_t1_7", "Four glasses of water. A modest requirement with immodest returns.", 4),
                new("hydration_t1_8", "The dry season is hard on everyone. Drink 4 glasses of water today.", 4),
            },
            [2] = new()
            {
                new("hydration_t2_1", "Six glasses before nightfall. The healer insists.", 6),
                new("hydration_t2_2", "The body is mostly water. Remind it of that. Log 6 glasses today.", 6),
                new("hydration_t2_3", "Three quarters of the daily measure. Log 6 glasses of water.", 6),
                new("hydration_t2_4", "A journeyman maintains their hydration without being reminded. Log 6 glasses.", 6),
                new("hydration_t2_5", "Six glasses of water logged before the day ends.", 6),
                new("hydration_t2_6", "The road is long and the water skin must be used. Log 6 glasses.", 6),
                new("hydration_t2_7", "Consistent hydration is a discipline. Log 6 glasses today.", 6),
                new("hydration_t2_8", "The healer requires six glasses minimum. Log them.", 6),
            },
            [3] = new()
            {
                new("hydration_t3_1", "The full daily measure. Eight glasses of water today.", 8),
                new("hydration_t3_2", "A veteran maintains peak hydration without exception. Log 8 glasses.", 8),
                new("hydration_t3_3", "Eight glasses. The river expects nothing less.", 8),
                new("hydration_t3_4", "Full hydration, fully logged. Eight glasses today.", 8),
                new("hydration_t3_5", "The daily measure is not a suggestion. Log 8 glasses of water.", 8),
                new("hydration_t3_6", "Eight glasses of water. The Dry King Zorathi demands you stay ahead of him.", 8),
                new("hydration_t3_7", "A fully hydrated adventurer is a dangerous one. Log 8 glasses.", 8),
                new("hydration_t3_8", "The full measure. Eight glasses. Log them before midnight.", 8),
            }
        },
        [SkillType.Discipline] = new()
        {
            [1] = new()
            {
                new("discipline_t1_1", "The first step is showing up. Check in today.", 1),
                new("discipline_t1_2", "The realm notices those who return. Check in and log one activity today.", 1),
                new("discipline_t1_3", "A warrior who shows up consistently is more dangerous than one who trains hard occasionally. Check in today.", 1),
                new("discipline_t1_4", "Presence is its own form of progress. Check in today.", 1),
                new("discipline_t1_5", "The guild marks attendance. Make sure yours is recorded. Check in.", 1),
                new("discipline_t1_6", "Every day you show up is a day the Stillness does not win. Check in.", 1),
                new("discipline_t1_7", "Discipline is the bridge between goals and results. Check in today.", 1),
                new("discipline_t1_8", "Log one activity and check in. That is enough for today.", 1),
            },
            [2] = new()
            {
                new("discipline_t2_1", "Check in and log at least two different activities today.", 2),
                new("discipline_t2_2", "A full day of engagement. Check in and log two activities.", 2),
                new("discipline_t2_3", "The consistent adventurer tracks everything. Check in and log 2 activities.", 2),
                new("discipline_t2_4", "Two activities logged and a check-in completed. That is today's requirement.", 2),
                new("discipline_t2_5", "Discipline compounds. Check in and log two activities today.", 2),
                new("discipline_t2_6", "The guild requires proof of active engagement. Check in and log 2 activities.", 2),
                new("discipline_t2_7", "Two logged activities and a daily check-in. Show up fully today.", 2),
                new("discipline_t2_8", "Log two activities and mark your presence. Check in today.", 2),
            },
            [3] = new()
            {
                new("discipline_t3_1", "A full day of discipline. Check in and log three different activities.", 3),
                new("discipline_t3_2", "The veteran shows up completely. Check in and log 3 activities today.", 3),
                new("discipline_t3_3", "Three activities and a check-in. The full day, fully lived.", 3),
                new("discipline_t3_4", "Discipline at the highest level means complete engagement. Log 3 activities.", 3),
                new("discipline_t3_5", "Check in and log three activities. No half measures today.", 3),
                new("discipline_t3_6", "The Stillness hates a full day. Log 3 activities and check in.", 3),
                new("discipline_t3_7", "Three separate activities logged. Check in. The day is yours.", 3),
                new("discipline_t3_8", "Complete engagement. Three logged activities and a daily check-in.", 3),
            }
        }
    };

    public static int GetTierForLevel(int level)
    {
        if (level <= 20) return 1;
        if (level <= 50) return 2;
        return 3;
    }

    public static QuestTemplate GetRandom(SkillType skill, int tier, Random random)
    {
        var templates = Templates[skill][tier];
        return templates[random.Next(templates.Count)];
    }
}