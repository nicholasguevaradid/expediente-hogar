using MedContracts.Control_Interface.Flujo;
using MedContracts.Control_Interface.RepoDapper;
using MedRecordFlujo;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RepoDapper;
using RepoDapper.Repositorios;
using Swashbuckle.AspNetCore.SwaggerUI;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── JWT ──────────────────────────────────────────────────────────────────────
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtKey     = jwtSection["Key"] ?? throw new InvalidOperationException("Jwt:Key is not configured.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtSection["Issuer"],
            ValidAudience            = jwtSection["Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew                = TimeSpan.Zero,
        };
    });

builder.Services.AddAuthorization();

// ── MVC + Swagger ─────────────────────────────────────────────────────────────
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Expediente API", Version = "v1" });

    // Bearer security scheme so Swagger UI has the Authorize button
    var bearerScheme = new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Ingrese el token JWT (sin el prefijo 'Bearer ').",
    };
    c.AddSecurityDefinition("Bearer", bearerScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── CORS ──────────────────────────────────────────────────────────────────────
var frontendOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:3000", "http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(frontendOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// ── DI ────────────────────────────────────────────────────────────────────────
builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();
builder.Services.AddScoped<IPatientDapper, PatientDapper>();
builder.Services.AddScoped<IRecordDapper, RecordDapper>();
builder.Services.AddScoped<IUserDapper, UserDapper>();

builder.Services.AddScoped<IPatientFlujo, PatientFlujo>();
builder.Services.AddScoped<IRecordFlujo, RecordFlujo>();

var app = builder.Build();

// ── Seeder (admin por defecto) ────────────────────────────────────────────────
await SeedAdminAsync(app);

// ── Middleware ────────────────────────────────────────────────────────────────
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var error = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        await context.Response.WriteAsJsonAsync(new
        {
            message   = error?.Message ?? "Error interno del servidor.",
            status    = 500,
            timestamp = DateTime.UtcNow
        });
    });
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.DocumentTitle = "Expediente API Docs";
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Expediente API v1");
        c.DocExpansion(DocExpansion.None);
        c.DefaultModelsExpandDepth(-1);
        c.DisplayRequestDuration();
        c.EnableTryItOutByDefault();
    });
}

app.UseCors("FrontendPolicy");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// ── Seeder helper ─────────────────────────────────────────────────────────────
static async Task SeedAdminAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var users  = scope.ServiceProvider.GetRequiredService<IUserDapper>();
    var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

    var adminUsername = config["Seed:AdminUsername"] ?? "admin";
    var adminPassword = config["Seed:AdminPassword"] ?? "Admin1234!";

    var existing = await users.GetByUsername(adminUsername);
    if (existing is null)
    {
        var hash = BCrypt.Net.BCrypt.HashPassword(adminPassword);
        await users.CreateUser(adminUsername, hash, "Admin");
        Console.WriteLine($"[Seed] Usuario admin '{adminUsername}' creado.");
    }
}
