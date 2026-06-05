# Space Reservation System

A Single Page Application (SPA) for managing and reserving shared spaces within the company, built with Vanilla JavaScript and a role-based access control system (`admin` and `user`).

---

## tegnologies Used

-Vanilla JavaScript (Es Modules) => Core aplication logic
-vite => Dev server and bundler
-Axios => HTTP client for API Request
- JSON SERVER => Mock rest Api (auth - data)
- SSCS => Styling

---


## Description

This platform allows employees to reserve different shared spaces (Private offices, Meeting rooms, Coworking spaces, and Auditoriums) while preventing conflicts through strict real-time schedule validation. Authentication and reservation data are decoupled into two separate mock JSON Server instances.

---

## Project Structure

```text
Ticket-managementJS/
├── index.html
├── package.json
├── .env
├── auth-db.json          # JSON Server — Users database (Port 3001)
├── data-db.json          # JSON Server — Reservations database (Port 3002)
└── assets/
    ├── scss/
    │   └── style.scss
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js            # Main entry point of the application
        ├── router.js         # SPA Router with role-based middleware
        ├── components/
        │   ├── navbar.js
        │   └── reservationForm.js  # Single and static reservation form
        ├── pages/
        │   ├── welcome.js
        │   ├── login.js
        │   ├── register.js
        │   ├── admin.js      # Global Administrator dashboard
        │   ├── client.js     # Standard User dashboard (Reservations)
        │   └── accessDenied.js
        ├── services/
        │   ├── httpClient.js     # Axios instances (auth + data)
        │   ├── authService.js
        │   ├── reservationService.js # Reservation API endpoints service
        │   └── userService.js
        └── utils/
            ├── session.js        # Session persistence & inactivity management
            ├── storage.js
            ├── validators.js
            └── helpers.js

```
## How to Run
### Requirements
 * Node.js >= 18.0.0
### Setup Steps
 1. Install the project dependencies:
   ```bash
   npm install
   
   ```
 2. Run the servers in parallel (Recommended):
   ```bash
   npm run dev
   
   ```
   *This will simultaneously start:*
   * Authentication Server on http://localhost:3001
   * Data Server (Reservations) on http://localhost:3002
   * Frontend Development Server (Vite) on http://localhost:5173


   
## Test Credentials
| User | Password | Role | Permissions |
|---|---|---|---|
| admin1 | password123 | Administrator (admin) | Full CRUD control; can approve, reject, modify, and delete any reservation. |
| user1 | password123 | User (user) | Can create reservations, view only their own history, and edit/cancel based on business rules. |
| user2 | password123 | User (user) | Can create reservations, view only their own history, and edit/cancel based on business rules. |
```

```
