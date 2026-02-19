# ERR-Expenses-Web-App-with-ROS-API-Integration

Final year project for **HDip in Computer Science (SETU Waterford)**.  
A full-stack expenses web application with **Revenue Online Service (ROS)** integration for **Enhanced Reporting Requirements (ERR)**.

This project is a **proof-of-concept (POC)** and focuses on modelling the ERR data flow and submission process rather than delivering a full payroll expense system.

---

## Project Overview

The application models an **Enhanced Reporting Requirements (ERR)** expense management workflow for Irish employers, aligned with official **Revenue ROS specifications**.

Its primary focus is the **generation of compliant ERR submission JSON files**, rather than end-to-end payroll expense processing.

The system allows payroll processors to:

- Record expense and benefit claims
- Associate claims with employees, expense elements, and pay dates
- Generate ERR submission payloads in line with Revenue requirements
- Preserve a full audit trail of claim entry and submission activity - TODO

The project follows a **happy-path implementation** suitable for academic demonstration, while reflecting real-world payroll and reporting system design patterns.

---

## Technology Stack

### Frontend

- **SvelteKit**
- **JavaScript**
- **Bulma CSS**

### Backend

- **Node.js**
- **Express**
- **MongoDB (Mongoose)**

### Other

- JWT authentication
- Role-Based Access Control (Admin / Processor)
- OpenSSL (cryptographic support via Node.js)

---

## Project Structure (High Level)

```
ERR-Expenses-Web-App-with-ROS-API-Integration/
├── backend/
│   ├── models/        # MongoDB schemas (Users, Employees, Claims, Elements)
│   ├── routes/        # API routes
│   ├── controllers/   # Request handlers
│   ├── utils/         # Seed scripts and helpers
│   └── config/        # Database configuration
│
├── frontend/
│   ├── src/
│   │   ├── routes/    # SvelteKit pages
│   │   ├── lib/       # Components and utilities
│   │   └── app.css    # Global styling
│
└── README.md
```

---

## Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local or cloud instance)
- npm
- Git

---

## Backend Setup

From the `backend` directory:

```bash
npm install
```

### Create a `.env` file:

```
MONGO_URI=mongodb://localhost:27017/err-expenses
JWT_SECRET=your_secret_key
PORT=5500
```

### Start the backend server:

```bash
npm run dev
```

---

## Frontend Setup

From the `frontend` directory:

```bash
npm install
npm run dev
```

---

## Application URL

The application will be available at:

```
http://localhost:5173
```

---

## Seed Data

Run the following from the project root:

```bash
node backend/utils/createUsers.js
node backend/utils/createEmployees.js
```

These scripts create:

- Test users (Admin / Processor)
- Employee reference data used when creating claims

---

## Academic Context & Scope

This project was developed for academic purposes as a final-year capstone project.

Key design goals include:

- Regulatory schema modelling (ERR)
- Secure backend API design
- Auditability and traceability of submissions - TODO
- Practical trade-offs between realism and scope

The UI is intentionally minimal and primarily serves as a trigger for backend processing and submission generation.

---

## Disclaimer

This project is not intended for production use.  
It is a learning and demonstration project designed to explore software engineering concepts and regulatory data modelling.

---
