var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Health check
app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        service = "Revenue Signing Service",
        status = "Running",
        timestamp = DateTime.UtcNow
    });
});

app.Run();
