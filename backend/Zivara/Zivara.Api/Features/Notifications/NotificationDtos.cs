namespace Zivara.Api.Features.Notifications;

public record RegisterDeviceTokenRequest(string Token);

public record UpdateNotificationSettingsRequest(
    bool MovementRemindersEnabled,
    int ReminderIntervalMinutes,
    string ReminderBlockStart,
    string ReminderBlockEnd
);