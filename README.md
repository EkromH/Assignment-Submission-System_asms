# 📝 **Project Overview**
Assignment & Student Management System (ASMS) is a full-stack web application designed to streamline academic workflows for educational institutes. It provides dedicated role-based portals for Admins, Teachers, and Students to manage classes, subjects, assignments, submissions, and grading.

Backend: Built with ASP.NET Core 8.0 (Web API) following RESTful principles. It handles authentication, role-based authorization, request validation, and core business logic for user management and grading workflows.

Testing: Integrated unit and integration test suite using xUnit, FluentAssertions, and EF Core In-Memory Database to validate business logic, edge cases (such as preventing updates to already-graded submissions), and API behavior.

Frontend: Built with next.js/react providing a fast, responsive user interface for interactive dashboards, assignment submissions, and progress tracking across all user roles.

Database: Powered by PostgreSQL via Entity Framework Core (EF Core) using code-first migrations. Handles relational data modeling for users, classes, subjects, assignments, submissions, and global application settings.


## **Main Features**
Role-Based Access Control (RBAC): Distinct dashboards and features for Admin, Teacher, and Student.

Class & Subject Management: Admins can structure classes, sections, and assign subjects.

Assignment Workflow: Teachers can create, publish, and track assignments per class, admin can see asignment workflow.

Student Submissions: Students can submit answers, track status (Submitted / Late), and view grades.

Grading & Feedback System: Teachers can grade student submissions and provide detailed feedback.

Application Settings: Global configuration toggles (e.g., allowing or restricting late submissions).


## **Technology Stack**
Backend: ASP.NET Core 8.0 (Web API)

Database: PostgreSQL (using Entity Framework Core)

Authentication: Login, JWT-based authentication, and role-based authorization

Testing: xUnit, FluentAssertions, Microsoft.EntityFrameworkCore.InMemory

Frontend: Next.js, React, TypeScript,

## **Backend (asp.net core web API) Structure**

```text
asms_project/
│
├── 📁 asms_project/                       # Main ASP.NET Core Web API Project
│   ├── 📁 Connected Services/             # Service & external dependencies configuration
│   ├── 📁 Dependencies/                 # NuGet packages and framework dependencies (.NET 8.0)
│   ├── 📁 Properties/                   # Launch profiles & environment settings
│   │   └── launchSettings.json
│   │
│   ├── 📁 Controllers/                  # API Endpoint Handlers
│   │   ├── AdminController.cs             # Admin management (Classes, Users, System configuration)
│   │   ├── AuthController.cs              # User authentication & JWT token generation
│   │   ├── StudentController.cs           # Student actions (View assignments, Submissions, Grades)
│   │   ├── TeacherController.cs           # Teacher actions (Assignment creation, Grading)
│   │   └── WeatherForecastController.cs   # Default ASP.NET Core template controller
│   │
│   ├── 📁 Data/                         # Database Context & Data Access
│   │   └── ApplicationDbContext.cs       # Entity Framework Core Database Context
│   │
│   ├── 📁 DTOs/                         # Data Transfer Objects
│   │   ├── AllDtos.cs                     # Common request/response DTOs
│   │   ├── AuthDtos.cs                    # Login, Register, and Auth payload DTOs
│   │   ├── TeacherDtos.cs                 # Assignment & Grading payload DTOs
│   │   ├── UserDtos.cs                    # User management DTOs
│   │   └── UserResponseDto.cs            # Formatted User response DTOs
│   │
│   ├── 📁 Middleware/                   # Custom HTTP Pipeline Middleware
│   │   └── ExceptionMiddleware.cs        # Global error handling and logging middleware
│   │
│   ├── 📁 Models/                       # Entity Framework Data Models
│   │   ├── ApplicationSetting.cs        # Global application configuration settings
│   │   ├── Assignment.cs                # Assignment entity model
│   │   ├── Class.cs                     # Class / Grade entity model
│   │   ├── ClassSubject.cs              # Mapping entity for Classes and Subjects
│   │   ├── Subject.cs                   # Subject entity model
│   │   ├── Submission.cs                # Student submission entity model
│   │   ├── TeacherAssignment.cs         # Mapping entity for Teachers and Assignments
│   │   └── User.cs                      # Application User entity model (Admin, Teacher, Student)
│   │
│   ├── 📁 Validators/                   # FluentValidation Rules
│   │   └── AppValidators.cs              # Request payload validation rules & schema checks
│   │
│   ├── appsettings.json                 # Connection strings & app configuration
│   ├── appsettings.Development.json     # Development environment configuration
│   ├── asms_project.http                # HTTP request execution file
│   ├── Program.cs                       # Application entry point & service dependency injection
│
├── 📁 asms_project.Tests/                 # xUnit Unit & Integration Testing Suite
│   ├── 📁 Dependencies/                 # Test framework dependencies (xUnit, FluentAssertions)
│   └── StudentControllerTests.cs        # Unit tests for StudentController operations
│
└── 📄 README.md                           # Comprehensive project documentation

## **Frontend (Next.js, react, typescript) Structure**

```text
├── .next/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx                # Role-based login page
│   ├── admin/
│   │   ├── assign-teacher/
│   │   │   └── page.tsx                # Teacher class & subject assignments
│   │   ├── classes/
│   │   │   └── page.tsx                # Class CRUD operations
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Admin overview & system metrics
│   │   ├── settings/
│   │   │   └── page.tsx                # System settings (Academic year, late submissions, etc.)
│   │   ├── subjects/
│   │   │   └── page.tsx                # Subject CRUD & class mappings
│   │   └── users/
│   │       └── page.tsx                # User management (Teachers, Students, Admins)
│   ├── student/
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Student overview
│   │   ├── assignments/
│   │   │   └── page.tsx                # View assigned class work & submission form
│   │   └── grades/
│   │       └── page.tsx                # View marks, feedback, and submission history
│   ├── teacher/
│   │   ├── assignments/
│   │   │   ├── create/
│   │   │   │   └── page.tsx            # Create/Draft new assignment
│   │   │   └── page.tsx                # Manage & toggle publish/draft status
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Teacher assigned classes/subjects overview
│   │   └── submissions/
│   │       └── grade/
│   │           └── page.tsx            # View student submissions, grade & give feedback
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx                      # Root layout with providers
│   └── page.tsx                        # Root redirect / landing page
├── components/
│   ├── Navbar.tsx                      # Role-aware navigation bar
│   ├── Sidebar.tsx                     # Dynamic dashboard sidebar menu
│   └── ProtectedRoute.tsx              # Auth & Role-based route guard wrapper
├── services/
│   ├── api.ts                          # Axios instance with JWT interceptors
│   ├── authService.ts                  # Login, Logout, token storage helpers
│   └── adminService.ts                 # Admin-specific API endpoints
├── types/
│   └── index.ts                        # Shared TypeScript interfaces (User, Assignment, Submission, etc.)
├── public/
├── .gitignore
├── AGENTS.md
├── CLAUDE.md
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── tsconfig.json
```

# **ASSIGNMENT & STUDENT MANAGEMENT SYSTEM (ASMS)
# SETUP INSTRUCTIONS**

## **PREREQUISITES**

Before setting up the project, ensure you have the following installed:
**1**. .NET 8.0 SDK (https://dotnet.microsoft.com/download/dotnet/8.0)

**NuGet Packages Used in the ASMS Project**
	1.  BCrypt.Net-Next (4.2.0) Used to securely hash and verify user passwords before storing them in the database.
  
	2.  FluentAssertions (8.10.0) Used to write clear, readable, and expressive assertions in automated unit tests.
  
	3.  FluentValidation.AspNetCore (11.3.1) Used to validate API request models with clean, reusable validation rules.
  
	4.  Microsoft.AspNetCore.Authentication.JwtBearer (8.0.0) Used to authenticate API users using JWT bearer tokens for secure authorization.
  
	5.  Moq (4.20.72) Used to create mock objects for isolating dependencies during unit testing.
  
	6.  Npgsql.EntityFrameworkCore.PostgreSQL (9.0.1) Used to connect Entity Framework Core with PostgreSQL database in the application.
  
	7.  Swashbuckle.AspNetCore (6.4.0) Used to generate Swagger documentation and provide an interactive API testing interface.
  
	8.  System.IdentityModel.Tokens.Jwt (8.22.0) Used to create, validate, read, and manage JWT tokens for authentication.
  
	9.  xunit.extensibility.core (2.9.3) Used as a core xUnit testing component for discovering and running tests.

**2**. Node.js (v18 or v20 LTS) (https://nodejs.org/)

```bash
npx create-next-app@latest asms_web
npm install axios
```
	
**3**. PostgreSQL Database (v18.4) (https://www.postgresql.org/)




## **ENVIRONMENT CONFIGURATION**

Create a `.env` file in the project root for local development. Do not commit the `.env` file or real secrets/API keys to GitHub.

```env
# Server Configuration
ASPNETCORE_ENVIRONMENT=Development
PORT=7181

# PostgreSQL Database Credentials
POSTGRES_DB=asms_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_PORT=5432

# Database Connection String
ConnectionStrings__DefaultConnection=Host=localhost;Port=5432;Database=asms_db;Username=postgres;Password=your_postgres_password

# JWT Authentication Config
Jwt__Secret=your_jwt_secret_key_minimum_32_characters
Jwt__Issuer=AssignmentAPI
Jwt__Audience=AssignmentClient

# AI & Vector Embedding Configuration
AI__OPENAI_API_KEY=your_openai_api_key_here
AI__EMBEDDING_MODEL=text-embedding-3-small
AI__EMBEDDING_DIMENSION=1536

# Vector Database / PGVector Settings
VECTOR_DB__ENABLED=true
VECTOR_DB__SIMILARITY_THRESHOLD=0.80

# Frontend URL (CORS Allowed Origins)
FRONTEND_URL=http://localhost:3000

# Feature Toggles
ENABLE_SWAGGER=true
```

> **Security:** Keep `.env` out of version control. Use placeholder values in `.env.example` and never commit real PostgreSQL passwords, JWT secrets, or OpenAI API keys.

## 1. **DATABASE SETUP (PostgreSQL)**
1. Open pgAdmin or psql terminal and create a new PostgreSQL database:
   
   ```sql
CREATE DATABASE asms_db;
```

2. Configure Database Connection:
   Open 'asms_project/appsettings.json' (or 'appsettings.Development.json')
   and update your database connection string:

   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Host=localhost;Port=5432;Database=asms_db;Username=postgres;Password=YOUR_POSTGRES_PASSWORD"
   }
   ```

3. Apply Entity Framework Database Migrations:
   Open terminal inside the 'asms_project' directory and run:

   ```bash
   dotnet ef database update
   ```

   (Note: Initial database seed data will automatically insert default roles, 
    classes, and admin accounts upon initial launch).


## 2. **BACKEND SETUP (ASP.NET Core Web API)**
1. Open terminal and navigate to the backend project folder:
   
   ```bash
   cd asms_project
   ```

2. Restore NuGet dependencies:
   
   ```bash
   dotnet restore
   ```

3. Build and Run the API server:
   
   ```bash
   dotnet run
   ```

4. Access the REST API:
   - Swagger UI: http://localhost:5000/swagger (or https://localhost:7181/swagger)


## 3. **UNIT & INTEGRATION TESTS SETUP**
1. Open terminal in the root directory (or asms_project.Tests folder).
2. Run the xUnit test suite using EF Core In-Memory Database:

   ```bash
   dotnet test
   ```

3. Expected Output:
   - controller tests (including StudentControllerTests) should pass without errors.


## 4. **FRONTEND SETUP (Node.js / Web Application)**
1. Open a new terminal window and navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install Node dependencies:

   ```bash
   npm install
   ```

3. Configure API Endpoint (if required):
   Ensure your environment configuration (service/api.ts) points to:
   
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:7181/api
   ```

4. Run the frontend development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to:
   
   http://localhost:3000 (or the local URL printed in your terminal)



## **DEMO LOGIN CREDENTIALS**
- Admin Role:    admin@school.test / Admin@123
- Teacher Role:  teacher@school.test  /  Teacher@123
- Student Role:  student@school.test  /  Student@123
