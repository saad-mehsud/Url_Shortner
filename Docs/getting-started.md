# Getting Started Guide

This guide walks you through setting up, configuring, running, and testing the **URL Shortener API** locally.

---

## 1. Prerequisites

Before running the application, make sure you have the following installed on your machine:

- **[.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)** or higher:
  ```bash
  dotnet --version
  ```
- **[PostgreSQL 14+](https://www.postgresql.org/download/)**: Running locally or via Docker.
- **[dotnet-ef CLI tool](https://learn.microsoft.com/en-us/ef/core/cli/dotnet)**:
  ```bash
  dotnet tool install --global dotnet-ef
  ```

---

## 2. Configuration (.env)

The application loads environment variables at startup using `DotNetEnv` from a `.env` file located in the root project directory.

Create or update the `.env` file in the root folder with the following variables:

```env
# PostgreSQL Connection String
DATABASE_URI="Host=localhost;Port=5432;Database=url_shortner_db;Username=postgres;Password=your_password;"

# Base Domain for Generated Short URLs (used when shortening URLs)
DOMAIN="http://localhost:5216"

# JWT Secret Key (Must be at least 256 bits / 32 characters for HMAC-SHA256)
JWT_SECRET_KEY="your_super_secret_signing_key_must_be_long_enough_32_chars"

# JWT Token Validation Metadata
ISSUER="http://localhost:5216"
AUDIENCE="http://localhost:5216"
```

### Configuration Key Breakdown

| Key | Description | Example |
| :--- | :--- | :--- |
| `DATABASE_URI` | Npgsql connection string for PostgreSQL | `Host=localhost;Database=url_shortner;Username=postgres;Password=secret` |
| `DOMAIN` | Base domain prepended to generated short URLs | `http://localhost:5216` or `https://sho.rt` |
| `JWT_SECRET_KEY`| Secret key used to sign and verify HMAC-SHA256 JWT tokens | `abcdedfghijklmnopqrstuvwxyz123456` |
| `ISSUER` | Expected JWT issuer | `http://localhost:5216` |
| `AUDIENCE` | Expected JWT audience | `http://localhost:5216` |

---

## 3. Database Setup & Migrations

The project uses **Entity Framework Core 10** with the PostgreSQL provider.

### Apply Existing Migrations

To apply existing database migrations and build the schema:

```bash
dotnet ef database update
```

### Adding New Migrations (When Modifying Models)

If you modify entity models in [`Models/`](file:///home/saadm/Data/C#/Url_Shortner/Models), generate a new migration:

```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

---

## 4. Running the Application

### Running with .NET CLI

To start the API in development mode:

```bash
dotnet run
```

Or run with hot-reload:

```bash
dotnet watch
```

By default, the server will start listening at:
- **HTTP**: `http://localhost:5216`
- **HTTPS**: `https://localhost:7191`

---

## 5. Exploring & Testing the API

### Interactive Documentation (Scalar UI)

When running in **Development** mode (`ASPNETCORE_ENVIRONMENT=Development`), OpenAPI specifications and the **Scalar API Reference** UI are automatically registered:

- **Scalar API UI**: `http://localhost:5216/scalar/v1`
- **OpenAPI JSON**: `http://localhost:5216/openapi/v1.json`

### Health Check Endpoint

You can check system health (including database connectivity) at:

```bash
curl -i http://localhost:5216/health
```

**Response Format (`200 OK`):**
```json
{
  "status": "Healthy",
  "results": {
    "healthcheck": {
      "status": "Healthy",
      "description": "Service is healthy",
      "data": {}
    },
    "npgsql": {
      "status": "Healthy",
      "description": null,
      "data": {}
    }
  }
}
```

---

## 6. Quick Start Verification Workflow

1. **Register a new User**:
   ```bash
   curl -X POST http://localhost:5216/api/User/register \
     -H "Content-Type: application/json" \
     -d '{
       "userName": "johndoe",
       "email": "john@example.com",
       "password": "Password123!",
       "role": "User"
     }'
   ```

2. **Authenticate & Receive Tokens**:
   ```bash
   curl -X POST http://localhost:5216/api/Auth \
     -H "Content-Type: application/json" \
     -d '{
       "email": "john@example.com",
       "password": "Password123!"
     }'
   ```
   *Copy the returned `accessToken` and `refreshToken`.*

3. **Shorten a URL**:
   ```bash
   curl -X POST http://localhost:5216/api/Url \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" \
     -d '{
       "url": "https://github.com/dotnet/aspnetcore"
     }'
   ```

4. **Test Redirection & Click Tracking**:
   Open the generated `shortUrl` in your browser or curl it:
   ```bash
   curl -i http://localhost:5216/<shortUrlCode>
   ```
   *The server responds with HTTP `302 Found` and records click analytics.*
