
//using System.Text;
//using System.Text.Json.Serialization;
//using asms_project.Data;
//using asms_project.Middleware;
//using FluentValidation;
//using FluentValidation.AspNetCore;
//using Microsoft.AspNetCore.Authentication.JwtBearer;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.IdentityModel.Tokens;
//using Microsoft.OpenApi.Models;

//var builder = WebApplication.CreateBuilder(args);



//// Controllers & JSON Serializer
//builder.Services.AddControllers()
//    .AddJsonOptions(options =>
//    {
//        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
//    });

//// FluentValidation
//builder.Services.AddFluentValidationAutoValidation();
//builder.Services.AddValidatorsFromAssemblyContaining<Program>();

//// CORS Setup (for Next.js Frontend)
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowNextJs", policy =>
//    {
//        policy.WithOrigins("http://localhost:3000")
//              .AllowAnyHeader()
//              .AllowAnyMethod()
//              .AllowCredentials();
//    });
//});
//// PostgreSQL DbContext
//builder.Services.AddDbContext<ApplicationDbContext>(options =>
//    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

//// JWT Authentication Configuration
//var jwtSettings = builder.Configuration.GetSection("Jwt");
//var secretKey = jwtSettings["Secret"] ?? "YourSuperSecretJWTKeyForAssignmentSystem2026!";

//builder.Services.AddAuthentication(options =>
//{
//    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
//    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
//    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
//})
//.AddJwtBearer(options =>
//{
//    options.RequireHttpsMetadata = false;
//    options.SaveToken = true;
//    options.TokenValidationParameters = new TokenValidationParameters
//    {
//        ValidateIssuerSigningKey = true,
//        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
//        ValidateIssuer = true,
//        ValidIssuer = jwtSettings["Issuer"] ?? "AssignmentAPI",
//        ValidateAudience = true,
//        ValidAudience = jwtSettings["Audience"] ?? "AssignmentClient",
//        ValidateLifetime = true,
//        ClockSkew = TimeSpan.Zero
//    };
//});

//builder.Services.AddAuthorization();

//// Swagger / OpenAPI with JWT Authorization Support
//builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen(options =>
//{
//    options.SwaggerDoc("v1", new OpenApiInfo
//    {
//        Title = "Assignment & Submission Management API",
//        Version = "v1"
//    });

//    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
//    {
//        Name = "Authorization",
//        Type = SecuritySchemeType.ApiKey,
//        Scheme = "Bearer",
//        BearerFormat = "JWT",
//        In = ParameterLocation.Header,
//        Description = "Enter 'Bearer' [space] and then your valid JWT token.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1Ni...\""
//    });

//    options.AddSecurityRequirement(new OpenApiSecurityRequirement
//    {
//        {
//            new OpenApiSecurityScheme
//            {
//                Reference = new OpenApiReference
//                {
//                    Type = ReferenceType.SecurityScheme,
//                    Id = "Bearer"
//                }
//            },
//            Array.Empty<string>()
//        }
//    });
//});

//// ==========================================
//// 2. BUILD APPLICATION
//// ==========================================
//var app = builder.Build();


//AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
//// ==========================================
//// 3. CONFIGURE MIDDLEWARE PIPELINE
//// ==========================================

//// Global Exception Handling Middleware
//app.UseMiddleware<ExceptionMiddleware>();

//// Swagger UI in Development
//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//app.UseHttpsRedirection();

//// CORS Middleware (Must run BEFORE Authentication & Authorization)
//app.UseCors("AllowNextJs");

//app.Use(async (context, next) =>
//{
//    // Prevent client-side caching on all API responses
//    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
//    context.Response.Headers["Pragma"] = "no-cache";
//    context.Response.Headers["Expires"] = "0";

//    await next();
//});


//app.UseAuthentication();
//app.UseAuthorization();

//app.MapControllers();

//// Launch App
//app.Run();



using System.Text;
using System.Text.Json.Serialization;
using asms_project.Data;
using asms_project.Middleware;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

// ==========================================
// 1. LOAD ENVIRONMENT VARIABLES (.env)
// ==========================================
DotNetEnv.Env.Load(); // Reads .env file in root directory

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// Controllers & JSON Serializer
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// CORS Setup (Reads allowed origins from configuration/env)
var allowedOrigins = builder.Configuration["FRONTEND_URL"] ?? "http://localhost:3000";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJs", policy =>
    {
        policy.WithOrigins(allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries))
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// PostgreSQL DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? builder.Configuration["ConnectionStrings__DefaultConnection"];

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication Configuration
var secretKey = builder.Configuration["Jwt:Secret"]
    ?? builder.Configuration["Jwt__Secret"]
    ?? "YourSuperSecretJWTKeyForAssignmentSystem2026!";

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? builder.Configuration["Jwt__Issuer"]
    ?? "AssignmentAPI";

var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? builder.Configuration["Jwt__Audience"]
    ?? "AssignmentClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Swagger / OpenAPI with JWT Authorization Support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Assignment & Submission Management API",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid JWT token.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1Ni...\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ==========================================
// 2. BUILD APPLICATION
// ==========================================
var app = builder.Build();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// ==========================================
// 3. CONFIGURE MIDDLEWARE PIPELINE
// ==========================================

// Global Exception Handling Middleware
app.UseMiddleware<ExceptionMiddleware>();

// Enable Swagger in Development or if explicitly enabled
if (app.Environment.IsDevelopment() || builder.Configuration["ENABLE_SWAGGER"] == "true")
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// CORS Middleware
app.UseCors("AllowNextJs");

app.Use(async (context, next) =>
{
    // Prevent client-side caching on all API responses
    context.Response.Headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0";
    context.Response.Headers["Pragma"] = "no-cache";
    context.Response.Headers["Expires"] = "0";

    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Launch App
app.Run();