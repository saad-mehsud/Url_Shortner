# API Reference

This document provides a comprehensive specification of all HTTP endpoints available in the **URL Shortener API**.

---

## 🔐 Base Headers & Authentication

Protected endpoints require a JSON Web Token (JWT) supplied in the `Authorization` request header:

```http
Authorization: Bearer <your_jwt_access_token>
```

---

## 1. Authentication Endpoints (`/api/Auth`)

### 1.1 Login
Authenticates a user with email and password, returning a short-lived access token (JWT) and a long-lived refresh token.

- **Method & Route**: `POST /api/Auth`
- **Access Level**: Public
- **Request Body** (`Authrequest`):
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Responses**:
  - `200 OK`: Authentication successful.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "refreshToken": "xK8zJ...=="
    }
    ```
  - `401 Unauthorized`: Invalid credentials.
    ```json
    {
      "type": "https://httpstatuses.io/401",
      "title": "Unauthorized",
      "status": 401,
      "detail": "Invalid email or password"
    }
    ```

---

### 1.2 Refresh Token
Exchanges an active refresh token for a fresh JWT access token and a newly rotated refresh token.

- **Method & Route**: `POST /api/Auth/refresh`
- **Access Level**: Public
- **Request Body** (`RefreshRequest`):
  ```json
  {
    "refreshToken": "xK8zJ...==",
    "userId": 1
  }
  ```
- **Responses**:
  - `200 OK`: Token refreshed successfully.
    ```json
    {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "refreshToken": "new_rotated_base64_refresh_token=="
    }
    ```
  - `401 Unauthorized`: Token expired, revoked, or token reuse attempt detected.
  - `404 Not Found`: Refresh token string does not exist.

---

## 2. User Management Endpoints (`/api/User`)

### 2.1 Register User
Creates a new user account with hashed password storage.

- **Method & Route**: `POST /api/User/register`
- **Access Level**: Public
- **Request Body** (`UserRequest`):
  ```json
  {
    "userName": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "User"
  }
  ```
- **Responses**:
  - `200 OK`: User registered successfully.
    ```json
    {
      "id": 1,
      "userName": "johndoe",
      "email": "john@example.com",
      "passwordHash": "AQAAAAIAAYagAAAAE...",
      "role": "User"
    }
    ```
  - `409 Conflict`: Email already exists.

---

### 2.2 Get All Users
Retrieves all registered users.

- **Method & Route**: `GET /api/User`
- **Access Level**: Protected (`Admin` role only)
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Responses**:
  - `200 OK`:
    ```json
    [
      {
        "id": 1,
        "userName": "admin",
        "email": "admin@example.com",
        "role": "Admin"
      }
    ]
    ```
  - `401 Unauthorized` / `403 Forbidden`: Insufficient permissions or missing token.

---

### 2.3 Get User by Email
Retrieves a specific user's profile by email query parameter.

- **Method & Route**: `GET /api/User/email?email={email}`
- **Access Level**: Protected (Authenticated user)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters**:
  - `email` (string, required): The user's registered email address.
- **Responses**:
  - `200 OK`: User profile returned.
  - `404 Not Found`: No user found with the provided email.

---

### 2.4 Update User
Updates an existing user record.

- **Method & Route**: `PUT /api/User`
- **Access Level**: Protected (Authenticated user)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body** (`User`):
  ```json
  {
    "id": 1,
    "userName": "updatedName",
    "email": "john@example.com",
    "passwordHash": "...",
    "role": "User"
  }
  ```
- **Responses**:
  - `204 No Content`: Update successful.
  - `404 Not Found`: User ID not found.

---

### 2.5 Delete User
Removes a user and cascades deletion to all their URLs and tokens.

- **Method & Route**: `DELETE /api/User/id?email={email}`
- **Access Level**: Protected (Authenticated user)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Query Parameters**:
  - `email` (string, required): The user's email address.
- **Responses**:
  - `204 No Content`: Deletion successful.
  - `404 Not Found`: User email does not exist.

---

## 3. URL Management Endpoints (`/api/Url`)

### 3.1 Get All URLs (Admin)
Returns all shortened URLs in the system along with their associated click analytics.

- **Method & Route**: `GET /api/Url`
- **Access Level**: Protected (`Admin` role only)
- **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
- **Responses**:
  - `200 OK`:
    ```json
    [
      {
        "id": 1,
        "longUrl": "https://example.com/very/long/path",
        "shortUrl": "http://localhost:5216/X9kLmPqRtZ",
        "createdAt": "2026-08-27T10:00:00Z",
        "userId": 2,
        "clicks": [
          {
            "clickId": 1,
            "urlId": 1,
            "dateClicke": "2026-08-27T11:15:30Z",
            "referrer": "https://twitter.com",
            "ipAddress": "192.168.1.50"
          }
        ]
      }
    ]
    ```

---

### 3.2 Get Current User's URLs
Retrieves the shortened URLs for the authenticated user based on the JWT `NameIdentifier` claim.

- **Method & Route**: `GET /api/Url/myUrls`
- **Access Level**: Protected (Authenticated user)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Responses**:
  - `200 OK`: URL record with click analytics collection.
  - `404 Not Found`: User has no shortened URLs.

---

### 3.3 Shorten a URL (Create)
Generates a new shortened URL for a provided target destination.

- **Method & Route**: `POST /api/Url`
- **Access Level**: Protected (Authenticated user)
- **Headers**: `Authorization: Bearer <JWT_TOKEN>`
- **Request Body** (`CreateUrlRequest`):
  ```json
  {
    "url": "https://docs.microsoft.com/en-us/dotnet/core/"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "id": 12,
      "longUrl": "https://docs.microsoft.com/en-us/dotnet/core/",
      "shortUrl": "http://localhost:5216/aB79xY10Zk",
      "createdAt": "2026-08-27T12:00:00Z",
      "userId": 1,
      "clicks": []
    }
    ```
  - `400 Bad Request`: When trying to shorten an existing shortened URL.

---

### 3.4 Update a URL
Updates the destination or short URL mappings of an existing record.

- **Method & Route**: `PUT /api/Url`
- **Access Level**: Public
- **Request Body** (`URL`):
  ```json
  {
    "id": 12,
    "longUrl": "https://new-destination.com",
    "shortUrl": "http://localhost:5216/aB79xY10Zk",
    "createdAt": "2026-08-27T12:00:00Z"
  }
  ```
- **Responses**:
  - `200 OK`: Updated entity.
  - `404 Not Found`: URL ID not found.

---

### 3.5 Delete a URL
Deletes a shortened URL record by its primary key ID.

- **Method & Route**: `DELETE /api/Url/:{id}`
- **Access Level**: Public
- **Path Parameters**:
  - `id` (integer, required): ID of the URL to remove.
- **Responses**:
  - `204 No Content`: Deleted successfully.
  - `404 Not Found`: ID not found.

---

## 4. Public Redirection Endpoint

### 4.1 Redirect Short URL
Resolves a 10-character short URL code, registers a click event timestamp, and issues an HTTP redirect.

- **Method & Route**: `GET /{shortUrl}`
- **Access Level**: Public
- **Path Parameters**:
  - `shortUrl` (string, required): 10-character alphanumeric short code (e.g. `aB79xY10Zk`).
- **Responses**:
  - `302 Found`: Redirects browser to destination `LongUrl` with `Location` header.
  - `404 Not Found`: Short URL code not found.

---

## 5. Health & Diagnostics

### 5.1 System & DB Health
Returns real-time status of application and PostgreSQL connectivity.

- **Method & Route**: `GET /health`
- **Access Level**: Public
- **Responses**:
  - `200 OK` (System Healthy):
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
  - `503 Service Unavailable`: PostgreSQL connection failed or timed out.
