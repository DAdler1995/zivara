using Microsoft.EntityFrameworkCore;
using Zivara.Api.Features.Auth;
using Zivara.Api.Features.Character;
using Zivara.Api.Features.Activity;

namespace Zivara.Api.Data;

public class ZivaraDbContext : DbContext
{
    public ZivaraDbContext(DbContextOptions<ZivaraDbContext> options) : base(options)
    {
    }

    // Auth
    public DbSet<User> Users => Set<User>();

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
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
    }
}