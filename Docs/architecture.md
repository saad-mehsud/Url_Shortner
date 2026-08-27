# System Architecture

This document describes the architectural design, layered patterns, data flow, and components of the **URL Shortener API**.

---

## 1. High-Level Architectural Pattern

The application adopts a **Layered (N-Tier) Architecture** built on ASP.NET Core:

```mermaid
graph TD
    Client["Clients / Web Browsers / HTTP Consumers"]
    
    subgraph "ASP.NET Core Application Pipeline"
        Middleware["Middleware Pipeline\n(Exception Handling, Health, Auth)"]
        
        subgraph "Controllers Layer (Presentation)"
            AuthController["AuthController"]
            UserController["UserController"]
            UrlController["UrlController"]
        end
        
        subgraph "Services Layer (Business Logic)"
            AuthService["IAuthServices / AuthServices"]
            UserService["IUserServices / UserServices"]
            UrlService["IUrlServices / UrlServices"]
            ClickService["IClickServices / ClickServices"]
        end
        
        subgraph "Data Layer (Persistence)"
            DbContext["EF Core DbConfig (DbContext)"]
            ExceptionProcessor["PostgreSQL Exception Processor"]
        end
    end
    
    subgraph "Storage"
        PostgreSQL[("PostgreSQL Database")]
    end

    Client --> Middleware
    Middleware --> Controllers
    AuthController --> AuthService
    UserController --> UserService
    UrlController --> UrlService
    UrlController --> ClickService
    
    AuthService --> DbContext
    UserService --> DbContext
    UrlService --> DbContext
    ClickService --> DbContext
    
    DbContext --> ExceptionProcessor
    ExceptionProcessor --> PostgreSQL
```

---

## 2. Layer Responsibilities

### Presentation Layer (`Controllers/`)
- Handles incoming HTTP requests and binds payload into strongly typed DTOs.
- Validates model states using `System.ComponentModel.DataAnnotations`.
- Enforces role-based authentication attributes (`[Authorize]`, `[Authorize(Roles = "Admin")]`).
- Extracts authenticated user claims (`ClaimTypes.NameIdentifier`) from JWT claims.
- Maps internal service results to HTTP status codes (`200 OK`, `204 NoContent`, `302 Redirect`, `401 Unauthorized`, `404 NotFound`, etc.).

### Business Logic Layer (`Services/`)
- Implements interface contracts (`IAuthServices`, `IUserServices`, `IUrlServices`, `IClickServices`).
- Implements URL shortening algorithms with collision prevention and validation.
- Orchestrates password hashing (`PasswordHasher<User>`) and JWT token lifecycle.
- Manages refresh token rotation and tracks token reuse security events.
- Employs domain exceptions (`NotFoundException`, `ConflictException`, `BadRequestException`, `UnauthorizedException`) instead of returning raw error objects.

### Data Access Layer (`Data/` & `Models/`)
- Configures Entity Framework Core `DbContext` (`DbConfig`).
- Implements relationship configurations (`OnModelCreating`) with cascade deletes.
- Leverages `EntityFrameworkCore.Exceptions.PostgreSQL` to intercept database constraint violations at the EF Core level and transform them into typed exceptions before reaching application layers.

---

## 3. Request Processing Middleware Pipeline

The pipeline is registered in [`Program.cs`](file:///home/saadm/Data/C#/Url_Shortner/Program.cs):

```mermaid
sequenceDiagram
    autonumber
    actor Client
    participant ExMiddleware as Global Exception Handler
    participant Health as Health Checks (/health)
    participant AuthN as Authentication (JWT Bearer)
    participant AuthZ as Authorization (RBAC)
    participant Controller as Controller Action
    participant Service as Domain Service
    participant DB as PostgreSQL (via EF Core)

    Client->>ExMiddleware: HTTP Request
    ExMiddleware->>Health: Inspect Path
    alt Path == /health
        Health-->>Client: Health Report (JSON)
    else API Request
        Health->>AuthN: Validate JWT Token
        AuthN->>AuthZ: Check Policies / Roles
        AuthZ->>Controller: Route to Controller
        Controller->>Service: Invoke Business Logic
        Service->>DB: Query / Mutate Data
        DB-->>Service: Return Entities / Rows
        Service-->>Controller: Return Domain Result / Throw Exception
        Controller-->>ExMiddleware: HTTP Response
        ExMiddleware-->>Client: Return JSON or ProblemDetails
    end
```

---

## 4. Entity-Relationship (ER) Architecture

The application defines 5 core entities with cascading relational constraints:

```mermaid
erDiagram
    USERS ||--o{ URLS : "creates (1:N)"
    USERS ||--o{ REFRESH_TOKENS : "owns (1:N)"
    URLS ||--o{ CLICKS : "has (1:N)"
    REFRESH_TOKENS ||--o{ TOKEN_REUSE : "triggers (1:N)"

    USERS {
        int Id PK
        string UserName
        string Email UK "Unique Index"
        string PasswordHash
        string Role
    }

    URLS {
        int Id PK
        string LongUrl
        string ShortUrl
        datetime CreatedAt
        int UserId FK
    }

    CLICKS {
        int ClickId PK
        int UrlId FK
        datetime DateClicke
        string Referrer
        string IpAddress
    }

    REFRESH_TOKENS {
        int TokenId PK
        string Token
        string Status "Active | Expired | Revoked"
        datetime Expires
        datetime Created
        datetime Blacklisted
        int UserId FK
        int ReplacedByTokenId
    }

    TOKEN_REUSE {
        int ReuseId PK
        int UserId
        int TokenId FK
        datetime CreatedAt
        string UserIp
    }
```

---

## 5. URL Shortening & Resolution Workflow

### 1. Shortening Workflow
1. Client submits target URL (`CreateUrlRequest`).
2. `UrlServices.CheckIfShortUrl` validates that the URL is not already a shortened link on this platform.
3. `UrlServices.Shorten_LongUrls` generates a 10-character random alphanumeric string using `Random.Shared.GetItems` and prefixes the `DOMAIN` environment variable.
4. Entity is persisted to the database associated with the caller's `UserId`.

### 2. Resolution & Analytics Workflow
```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Web User / Browser
    participant UrlController as UrlController (GET /{shortUrl})
    participant UrlService as UrlServices
    participant DB as PostgreSQL

    Visitor->>UrlController: GET /{shortUrl}
    UrlController->>UrlService: GetLongUrlAsync(shortUrl)
    UrlService->>DB: Query URL by suffix/short code
    alt URL not found
        DB-->>UrlService: null
        UrlService-->>UrlController: null
        UrlController-->>Visitor: 404 Not Found (ProblemDetails)
    else URL found
        DB-->>UrlService: URL entity
        UrlService-->>UrlController: URL entity
        UrlController->>UrlService: AddClick(longUrl.Id)
        UrlService->>DB: Insert Click (UrlId, DateClicke: UtcNow)
        DB-->>UrlService: Click Saved
        UrlController-->>Visitor: 302 Redirect (Location: LongUrl)
    end
```

---

## 6. Dependency Injection Registration Map

| Service Interface | Concrete Implementation | Lifetime | Registration Purpose |
| :--- | :--- | :--- | :--- |
| [`IUrlServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/IUrlServices.cs) | [`UrlServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/UrlServices.cs) | Scoped | Core URL generation, resolution, CRUD, and click dispatch |
| [`IClickServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/IClickServices.cs) | [`ClickServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/ClickServices.cs) | Scoped | Click analytics retrieval |
| [`IUserServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/IUserServices.cs) | [`UserServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/UserServices.cs) | Scoped | User creation, lookup, role management, password hashing |
| [`IAuthServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/IAuthServices.cs) | [`AuthServices`](file:///home/saadm/Data/C#/Url_Shortner/Services/AuthServices.cs) | Scoped | Login, JWT creation, token refresh, reuse detection |
| `IExceptionHandler` | [`GlobalExceptionHandler`](file:///home/saadm/Data/C#/Url_Shortner/Exceptions/GlobalExceptionHandler.cs) | Singleton | Centralized error interceptor & RFC 7807 problem details writer |
| `DbContext` | [`DbConfig`](file:///home/saadm/Data/C#/Url_Shortner/Data/DbConfig.cs) | Scoped | EF Core Database Context for PostgreSQL with exception processor |
