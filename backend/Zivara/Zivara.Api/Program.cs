using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting.WindowsServices;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using System.Text;
using Zivara.Api.Data;
using Zivara.Api.Features.Activity;
using Zivara.Api.Features.Auth;
using Zivara.Api.Features.Character;
using Zivara.Api.Features.Notifications;
using Zivara.Api.Features.Quests;
using Zivara.Api.Features.Rewards;

var builder = WebApplication.CreateBuilder(args); 
builder.Host.UseWindowsService();

builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ZivaraWeb", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174",
                "https://zivara.devdakota.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });

    options.AddPolicy("ZivaraMobile", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();

// database
builder.Services.AddDbContext<ZivaraDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// auth services
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// character services
builder.Services.AddScoped<ICharacterService, CharacterService>();
builder.Services.AddScoped<IXpService, XpService>();

// activity services
builder.Services.AddScoped<IActivityService, ActivityService>();

// quest services
builder.Services.AddScoped<IQuestService, QuestService>();
builder.Services.AddHostedService<QuestGenerationJob>();
builder.Services.AddScoped<IQuestProgressService, QuestProgressService>();

// rewards services
builder.Services.AddScoped<IJarService, JarService>();
builder.Services.AddHostedService<JarWeekCreationJob>();
builder.Services.AddScoped<IWishListService, WishListService>();

// notification services
builder.Services.AddHttpClient<ExpoNotificationService>();
builder.Services.AddScoped<IExpoNotificationService, ExpoNotificationService>();
builder.Services.AddHostedService<MovementReminderJob>();

// google fit services
builder.Services.AddHttpClient<GoogleFitService>();
builder.Services.AddScoped<IGoogleFitService, GoogleFitService>();
builder.Services.AddHostedService<GoogleFitSyncJob>();

builder.Services.AddHttpContextAccessor();

// jwt authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseCors("ZivaraWeb");
app.UseCors("ZivaraMobile");

app.UseAuthorization();
app.MapControllers();

app.Run();