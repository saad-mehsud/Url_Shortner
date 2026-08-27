# URL Shortener API Documentation

Welcome to the comprehensive documentation for the **URL Shortener API** built with **.NET 10 (ASP.NET Core Web API)** and **PostgreSQL**.

---

## 📚 Table of Contents

1. [Getting Started](getting-started.md)
   - Prerequisites (.NET 10 SDK, PostgreSQL)
   - Configuration & Environment Variables (`.env`)
   - Database Migrations & Database Setup
   - Running and Debugging the Application
   - Interactive API Documentation (Scalar & OpenAPI)

2. [System Architecture](architecture.md)
   - Architectural Overview & Layered Design
   - Dependency Injection & Service Registration
   - Entity-Relationship (ER) Diagram
   - Request Processing Pipeline

3. [Database & Models](database-models.md)
   - EF Core `DbContext` Configuration (`DbConfig`)
   - Entity Models (`User`, `URL`, `Click`, `RefreshToken`, `TokenReuse`)
   - Data Relationships, Constraints, and Cascade Rules
   - Schema Evolution & Migrations

4. [Authentication & Security](authentication-security.md)
   - JWT Access Token Generation & Validation
   - Refresh Token Rotation & Expiration
   - Refresh Token Reuse Detection Algorithm
   - Password Hashing Strategy (`PasswordHasher<User>`)
   - Role-Based Access Control (RBAC: `Admin` vs `User`)

5. [API Reference](api-reference.md)
   - Authentication Endpoints (`/api/Auth/*`)
   - User Management Endpoints (`/api/User/*`)
   - URL Shortening & Management Endpoints (`/api/Url/*`)
   - Public Redirection Endpoint (`/{shortUrl}`)
   - Health Check Endpoint (`/health`)

6. [Error Handling & Diagnostics](error-handling.md)
   - Centralized Global Exception Handling (`GlobalExceptionHandler`)
   - Custom Domain Exceptions (`NotFoundException`, `ConflictException`, etc.)
   - PostgreSQL Constraint Translation (`EntityFramework.Exceptions.PostgreSQL`)
   - RFC 7807 `ProblemDetails` Response Format
   - Health Monitoring (`/health`)

---

## 🚀 Key Features

- **High-Performance URL Shortening**: Generates cryptographically secure 10-character alphanumeric short codes.
- **Click Tracking & Analytics**: Automatically records timestamp, IP, and referrer metadata per redirect.
- **Enterprise-Grade Authentication**: Dual-token authentication (JWT Access Token + Refresh Token Rotation).
- **Proactive Token Reuse Attack Mitigation**: Detects stolen refresh tokens and tracks security events.
- **Relational Data Integrity**: Fully typed Entity Framework Core data layer with PostgreSQL constraints and cascade deletes.
- **RFC 7807 Standard Error Responses**: Centralized exception pipeline with automatic database error translation.
- **Built-in Health Checks**: Live application and PostgreSQL database connectivity monitoring at `/health`.
- **Modern API Documentation**: Interactive Scalar API documentation UI available out of the box in development mode.

---

## 📁 Project Structure

```
Url_Shortner/
├── Controllers/                  # HTTP API Controllers
│   ├── AuthController.cs         # Login and token refresh
│   ├── UrlController.cs          # Shortening, management, redirection
│   └── UserController.cs         # Registration, profile management
├── Services/                     # Business Logic Layer
│   ├── IAuthServices.cs & AuthServices.cs
│   ├── IClickServices.cs & ClickServices.cs
│   ├── IUrlServices.cs & UrlServices.cs
│   └── IUserServices.cs & UserServices.cs
├── Models/                       # Entity Framework Core Domain Models
│   ├── User.cs                   # User accounts & roles
│   ├── URL.cs                    # URL mappings & click relationships
│   ├── Click.cs                  # Click analytics
│   ├── RefreshToken.cs           # Refresh token state & lifecycle
│   └── TokenReuse.cs             # Token reuse security logs
├── DTOs/                         # Data Transfer Objects (Request/Response)
│   ├── AuthRequest.cs
│   ├── AuthResponse.cs
│   ├── CreateUrlRequest.cs
│   ├── RefreshRequest.cs
│   ├── TokenResponse.cs
│   └── UserRequest.cs
├── Data/                         # EF Core Database Context
│   └── DbConfig.cs               # DB configuration & index setup
├── Exceptions/                   # Custom Exceptions & Error Handling
│   ├── BadRequestException.cs
│   ├── ConflictException.cs
│   ├── NotFoundException.cs
│   ├── UnauthorizedException.cs
│   └── GlobalExceptionHandler.cs # RFC 7807 Exception handler
├── Utils/                        # Utility & Infrastructure Helpers
│   └── HealthCheck.cs            # Custom JSON health response writer
├── Migrations/                   # EF Core Migration Snapshots
├── Docs/                         # System Documentation
├── Program.cs                    # Application Entrypoint & DI Configuration
└── Url_Shortner.csproj           # Project Configuration & NuGet Dependencies
```
