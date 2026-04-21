using Microsoft.EntityFrameworkCore;
using Zivara.Api.Features.Activity;
using Zivara.Api.Features.Auth;
using Zivara.Api.Features.Character;
using Zivara.Api.Features.Notifications;
using Zivara.Api.Features.Quests;
using Zivara.Api.Features.Rewards;

namespace Zivara.Api.Data;

public class ZivaraDbContext : DbContext
{
    public ZivaraDbContext(DbContextOptions<ZivaraDbContext> options) : base(options)
    {
    }

    // Auth
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Character
    public DbSet<CharacterEntity> Characters => Set<CharacterEntity>();
    public DbSet<Skill> Skills => Set<Skill>();

    // Activity
    public DbSet<MealLog> MealLogs => Set<MealLog>();
    public DbSet<WorkoutLog> WorkoutLogs => Set<WorkoutLog>();
    public DbSet<WeightLog> WeightLogs => Set<WeightLog>();
    public DbSet<WaterLog> WaterLogs => Set<WaterLog>();
    public DbSet<StepSyncLog> StepSyncLogs => Set<StepSyncLog>();
    public DbSet<XpEvent> XpEvents => Set<XpEvent>();
    public DbSet<ActivityLog> ActivityLogs => Set<ActivityLog>();

    // Quest
    public DbSet<Quest> Quests => Set<Quest>();

    // Rewards
    public DbSet<JarConfig> JarConfigs => Set<JarConfig>();
    public DbSet<JarWeek> JarWeeks => Set<JarWeek>();
    public DbSet<JarWeekActivity> JarWeekActivities => Set<JarWeekActivity>();
    public DbSet<WishListItem> WishListItems => Set<WishListItem>();

    // DeviceToken
    public DbSet<DeviceToken> DeviceTokens => Set<DeviceToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
        });

        // RefreshToken
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId);
        });

        // Character
        modelBuilder.Entity<CharacterEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(20);
            entity.HasOne(e => e.User)
                  .WithOne()
                  .HasForeignKey<CharacterEntity>(e => e.UserId);
        });

        // Skill
        modelBuilder.Entity<Skill>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.CharacterId, e.SkillType }).IsUnique();
            entity.HasOne(e => e.Character)
                  .WithMany(c => c.Skills)
                  .HasForeignKey(e => e.CharacterId);
        });

        // XpEvent - append only, never updated
        modelBuilder.Entity<XpEvent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // MealLog
        modelBuilder.Entity<MealLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FoodNotes).HasMaxLength(500);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // WorkoutLog
        modelBuilder.Entity<WorkoutLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // WeightLog
        modelBuilder.Entity<WeightLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // WaterLog
        modelBuilder.Entity<WaterLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // StepSyncLog - unique constraint enforces idempotency
        modelBuilder.Entity<StepSyncLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.CharacterId, e.SyncDate }).IsUnique();
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // ActivityLog
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // Quest
        modelBuilder.Entity<Quest>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // JarConfig
        modelBuilder.Entity<JarConfig>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.CharacterId).IsUnique();
            entity.Property(e => e.WeeklyContribution).HasPrecision(10, 2);
            entity.HasOne(e => e.Character)
                  .WithOne()
                  .HasForeignKey<JarConfig>(e => e.CharacterId);
        });

        // JarWeek
        modelBuilder.Entity<JarWeek>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => new { e.CharacterId, e.WeekStartDate }).IsUnique();
            entity.Property(e => e.MaxEarn).HasPrecision(10, 2);
            entity.Property(e => e.UnlockedPercent).HasPrecision(5, 4);
            entity.Ignore(e => e.UnlockedAmount); // computed property, not stored
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // JarWeekActivity
        modelBuilder.Entity<JarWeekActivity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PercentAwarded).HasPrecision(5, 4);
            entity.HasOne(e => e.JarWeek)
                  .WithMany(w => w.Activities)
                  .HasForeignKey(e => e.JarWeekId);
        });

        // WishListItem
        modelBuilder.Entity<WishListItem>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.EstimatedCost).HasPrecision(10, 2);
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });

        // DeviceToken
        modelBuilder.Entity<DeviceToken>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Token).IsUnique();
            entity.HasOne(e => e.Character)
                  .WithMany()
                  .HasForeignKey(e => e.CharacterId);
        });
    }
}