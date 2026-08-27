# Database & Models Documentation

This document covers the **Entity Framework Core** data layer, database configuration, entity models, relationships, and migration history for the URL Shortener API.

---

## 1. Database Context (`DbConfig`)

The primary database context is [`DbConfig`](file:///home/saadm/Data/C#/Url_Shortner/Data/DbConfig.cs), inheriting from `Microsoft.EntityFrameworkCore.DbContext`.

### Key Configuration Highlights
- **PostgreSQL Provider**: Registered using `options.UseNpgsql(DATABASE_URI)`.
- **Exception Processor**: Enhanced with `.UseExceptionProcessor()` from `EntityFrameworkCore.Exceptions.PostgreSQL` for translating native PostgreSQL exceptions (foreign key violations, duplicate keys, null constraint violations) into strongly typed EF Core exceptions.
- **Entity Sets**:
  - `DbSet<User> Users`
  - `DbSet<URL> Urls`
  - `DbSet<Click> Clicks`
  - `DbSet<RefreshToken> RefreshTokens`
  - `DbSet<TokenReuse> ReuseTokens`

---

## 2. Entity Model Definitions

### `User` Model
Represents registered users in the system.

- **File**: [`Models/User.cs`](file:///home/saadm/Data/C#/Url_Shortner/Models/User.cs)
- **Table**: `Users`

| Property | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | No | Primary Key (Auto-incrementing identity) |
| `UserName` | `string` | No | Display name or username of the user |
| `Email` | `string` | No | Unique email address (enforced by DB index) |
| `PasswordHash` | `string` | No | Securely hashed password (PBKDF2 via `PasswordHasher<User>`) |
| `Role` | `string` | No | Role for authorization (`"User"` or `"Admin"`). Default: `"User"` |
| `Urls` | `ICollection<URL>` | Yes | Navigation property: 1-to-many relationship with URLs |
| `RefreshTokens` | `ICollection<RefreshToken>` | Yes | Navigation property: 1-to-many relationship with Refresh Tokens |

---

### `URL` Model
Represents shortened URLs and their associations.

- **File**: [`Models/URL.cs`](file:///home/saadm/Data/C#/Url_Shortner/Models/URL.cs)
- **Table**: `Urls`

| Property | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `Id` | `int` | No | Primary Key |
| `LongUrl` | `string?` | Yes | Target destination URL |
| `ShortUrl` | `string?` | Yes | Full shortened URL string (e.g., `http://localhost:5216/aB12xY90Qz`) |
| `CreatedAt` | `DateTime` | No | Creation timestamp (UTC). Default: `DateTime.UtcNow` |
| `UserId` | `int` | No | Foreign Key pointing to `Users.Id` |
| `user` | `User?` | Yes | Navigation property to the owner user |
| `Clicks` | `ICollection<Click>?` | Yes | Navigation collection for all recorded redirect clicks |

---

### `Click` Model
Stores click analytics and visit events for shortened URLs.

- **File**: [`Models/Click.cs`](file:///home/saadm/Data/C#/Url_Shortner/Models/Click.cs)
- **Table**: `Clicks`

| Property | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `ClickId` | `int` | No | Primary Key |
| `UrlId` | `int` | No | Foreign Key referencing `Urls.Id` |
| `DateClicke` | `DateTime` | No | Timestamp of the redirect visit (UTC) |
| `referrer` | `string?` | Yes | HTTP Referer header value (if provided by client) |
| `ipAddress` | `string?` | Yes | Client IP address string (if captured) |

---

### `RefreshToken` Model
Manages refresh token records for JWT authentication rotation.

- **File**: [`Models/RefreshToken.cs`](file:///home/saadm/Data/C#/Url_Shortner/Models/RefreshToken.cs)
- **Table**: `RefreshTokens`

| Property | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `tokenId` | `int` | No | Primary Key |
| `token` | `string` | No | 64-byte Base64-encoded cryptographically secure random token string |
| `status` | `Status?` | Yes | Enum: `Active`, `Expired`, `Revoked` (Stored as string `varchar(20)`) |
| `expires` | `DateTime?` | Yes | Expiration timestamp (typically 7 days after creation) |
| `created` | `DateTime?` | Yes | Token creation timestamp (UTC) |
| `blacklisted` | `DateTime?` | Yes | Timestamp when explicitly blacklisted or revoked |
| `userId` | `int` | No | Foreign Key referencing `Users.Id` |
| `replacedByTokenId`| `int` | No | Tracks the successor token ID in the token rotation chain |
| `User` | `User?` | Yes | Navigation property to `User` |
| `tokenReuse` | `ICollection<TokenReuse>?` | Yes | Navigation collection to recorded reuse security events |

---

### `TokenReuse` Model
Logs token reuse security incidents when an already revoked refresh token is re-submitted.

- **File**: [`Models/TokenReuse.cs`](file:///home/saadm/Data/C#/Url_Shortner/Models/TokenReuse.cs)
- **Table**: `ReuseTokens`

| Property | Type | Nullable | Description |
| :--- | :--- | :--- | :--- |
| `reuseId` | `int` | No | Primary Key |
| `userId` | `int` | No | ID of user whose token was compromised/reused |
| `tokenId` | `int` | No | Foreign Key referencing `RefreshTokens.tokenId` |
| `token` | `RefreshToken?` | Yes | Navigation property to the reused `RefreshToken` |
| `createdAt` | `DateTime` | No | Timestamp of the reuse attempt (UTC). Default: `DateTime.UtcNow` |
| `userIp` | `string` | No | IP address of the client attempting the reuse |

---

## 3. Relational Rules & Foreign Keys

### Cascade Deletion Policies
1. **`User` -> `URL` (`1:N`)**:
   - Configured via `URL.OnModelCreating`:
     ```csharp
     modelBuilder.Entity<URL>()
         .HasOne(url => url.user)
         .WithMany(user => user.Urls)
         .HasForeignKey(url => url.UserId)
         .OnDelete(DeleteBehavior.Cascade);
     ```
   - *Behavior*: Deleting a `User` automatically removes all associated `URL` records.

2. **`User` -> `RefreshToken` (`1:N`)**:
   - Configured via `RefreshToken.OnModelCreating`:
     ```csharp
     modelBuilder.Entity<RefreshToken>()
         .HasOne(rt => rt.User)
         .WithMany(u => u.RefreshTokens)
         .HasForeignKey(rt => rt.userId)
         .OnDelete(DeleteBehavior.Cascade);
     ```
   - *Behavior*: Deleting a `User` cascades and removes all refresh tokens issued to that user.

3. **`RefreshToken` -> `TokenReuse` (`1:N`)**:
   - Configured via `TokenReuse.OnModelCreating`:
     ```csharp
     modelBuilder.Entity<TokenReuse>()
         .HasOne(tr => tr.token)
         .WithMany(rt => rt.tokenReuse)
         .HasForeignKey(tr => tr.tokenId)
         .OnDelete(DeleteBehavior.Cascade);
     ```
   - *Behavior*: Deleting a `RefreshToken` cascades and removes related audit records.

### Unique Indexes
- **`User.Email`**:
  ```csharp
  modelBuilder.Entity<User>()
      .HasIndex(u => u.Email)
      .IsUnique();
  ```
  Guarantees no two accounts share the same email at the database engine level.

---

## 4. Enum Conversions

The `Status` enum in `RefreshToken` is configured to persist as a string:

```csharp
modelBuilder.Entity<RefreshToken>()
    .Property(t => t.status)
    .HasMaxLength(20)
    .HasConversion<string>();
```

**Stored Values**: `"Active"`, `"Expired"`, `"Revoked"`.
