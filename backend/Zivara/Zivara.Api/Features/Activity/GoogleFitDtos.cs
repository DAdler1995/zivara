namespace Zivara.Api.Features.Activity;

public record GoogleFitAuthUrlResponse(string AuthUrl);
public record GoogleFitStatusResponse(bool IsConnected, DateTime? LastSyncedAt);
