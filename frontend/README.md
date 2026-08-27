# URL Shortener - React Frontend

Modern, responsive web interface for the **.NET 10 & PostgreSQL URL Shortener API** built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.

---

## ✨ Features

- **⚡ Fast URL Shortening**: Instant link shortening with client-side validation and live result display.
- **📊 Real-time Click Analytics**: Track total visits, relative timestamps, visitor referrers, and client IP addresses.
- **📱 QR Code Generator & Downloader**: Generate high-resolution QR codes for any short link and download as PNG.
- **🔒 Enterprise Authentication & Security**:
  - JWT Access Token authentication.
  - Refresh Token Rotation with automatic retry on `401 Unauthorized`.
  - Detection and handling of compromised/revoked refresh tokens.
- **👑 Role-Based Dashboards**:
  - **User Dashboard**: Shorten links, search & filter user's links, copy links, view QR codes, inspect click logs, delete links.
  - **Admin Dashboard**: System-wide overview, total global links, registered users directory with deletion privileges, and live `/health` system diagnostics.
- **🌓 Dark / Light Mode**: System theme detection with manual toggle and `localStorage` persistence.
- **🔔 Snappy Toast Notification System**: Clean feedback for clipboard copies, API responses, errors, and auth events.
- **📖 Scalar API Integration**: Direct one-click links to the backend's interactive Scalar API documentation.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Routing**: React Router DOM 7
- **QR Code**: QRCode.react

---

## 🚀 Quick Start

### 1. Prerequisites

Ensure the ASP.NET Core backend is running (typically at `http://localhost:5216`):

```bash
# In the repository root:
dotnet run
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The frontend will start at **`http://localhost:5173`**.

Vite is configured with a built-in reverse proxy forwarding `/api`, `/health`, and `/scalar` directly to `http://localhost:5216`, eliminating CORS configuration issues during development.

### 4. Build for Production

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.tsx             # Main header with brand, theme toggle, nav links & auth
│   │   ├── Footer.tsx             # Footer with live /health status probe
│   │   ├── ProtectedRoute.tsx     # Route guard for authenticated & admin routes
│   │   ├── QRCodeModal.tsx        # QR Code view and PNG download modal
│   │   ├── ClicksDetailModal.tsx  # Detailed click logs & referrer analytics modal
│   │   └── StatsCard.tsx          # Reusable dashboard KPI metric card
│   ├── context/
│   │   ├── AuthContext.tsx        # Session state, JWT management, automatic token refresh
│   │   ├── ToastContext.tsx       # Toast notifications provider (success/error/info/warning)
│   │   └── ThemeContext.tsx       # Dark & light mode provider
│   ├── pages/
│   │   ├── HomePage.tsx           # Public landing page with instant shortener CTA
│   │   ├── LoginPage.tsx          # Sign-in form with validation & password toggle
│   │   ├── RegisterPage.tsx       # Sign-up form with role selector (User / Admin)
│   │   ├── DashboardPage.tsx      # User link manager & analytics dashboard
│   │   ├── AdminDashboardPage.tsx # Admin console for global links, users, & diagnostics
│   │   ├── ProfilePage.tsx        # Account details & session token security view
│   │   └── NotFoundPage.tsx       # 404 page
│   ├── services/
│   │   └── api.ts                 # Typed fetch client with automatic token refresh & error mapping
│   ├── types/
│   │   └── index.ts               # TypeScript interfaces matching backend models & DTOs
│   ├── utils/
│   │   └── formatters.ts          # Clipboard copy, date formatting, relative time, JWT decoder
│   ├── App.tsx                    # Route definitions & context providers
│   ├── main.tsx                   # React root entrypoint
│   └── index.css                  # Tailwind styles & theme variables
├── package.json
├── tsconfig.json
├── vite.config.ts                 # Vite bundler configuration & proxy rules
└── index.html
```
