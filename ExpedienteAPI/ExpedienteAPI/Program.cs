using MedContracts.Control_Interface.Flujo;
using MedContracts.Control_Interface.RepoDapper;
using MedRecordFlujo;
using Microsoft.AspNetCore.Diagnostics;
using RepoDapper;
using RepoDapper.Repositorios;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Expediente API", Version = "v1" });
});

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

builder.Services.AddScoped<IRepositorioDapper, RepositorioDapper>();
builder.Services.AddScoped<IPatientDapper, PatientDapper>();
builder.Services.AddScoped<IRecordDapper, RecordDapper>();

builder.Services.AddScoped<IPatientFlujo, PatientFlujo>();
builder.Services.AddScoped<IRecordFlujo, RecordFlujo>();

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var error = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        await context.Response.WriteAsJsonAsync(new
        {
            message = error?.Message ?? "Error interno del servidor.",
            status = 500,
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
app.UseAuthorization();
app.MapControllers();
app.Run();