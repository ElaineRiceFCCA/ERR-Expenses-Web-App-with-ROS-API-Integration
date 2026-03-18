# ERR-Expenses-Web-App-with-ROS-API-Integration

Full-stack proof-of-concept (POC) system developed as a final-year capstone project for: **Higher Diploma in Computer Science (NFQ Level 8)** SETU Waterford – Department of Computing & Mathematics.

This project models Ireland's **Enhanced Reporting Requirements (ERR)** workflow and demonstrates structured integration with the **Revenue Online Services (ROS)** system.

---

## Project Overview

The application models the lifecycle of reporting **Enhanced Reporting Requirements (ERR)** expenses, aligned with official **Revenue ROS specifications**.

Its primary focus is the **generation of compliant ERR submission JSON files**, rather than end-to-end payroll expense processing.

The system allows payroll processors to:

- Accurate ERR schema modelling
- Compliant JSON payload generation
- Generate ERR submission payloads in line with Revenue requirements
- Secure API design with Role-Based Access Control (RBAC)
- Preserve an audit trail of claim entry and submission activity

The project follows a **happy-path implementation** suitable for academic demonstration, while reflecting **schema-first, compliance-driven implementation**, not a full payroll system.

---

## Key Features

### Authentication & Security

- JWT-based authentication
- Role-Based Access Control (Admin / Processor)
- Protected API endpoints
- Password hashing via bcrypt

### Claims Processing

- Organisation-wide claims visibility
- Audit timestamps (createdAt, updatedAt)
- Separate statutory payDate for ERR reporting

### ERR Submission Modelling

- Enhanced Reporting Run Reference generation
- Submission ID generation
- Line Item ID generation
- Conditional employee structure:
  - PPSN + Employment ID
  - OR Employer Reference + Address + Date of Birth

### Revenue Integration

- ROS handshake service (PIT3 environment)
- REST submission groundwork
- Certificate-based signing preparation

### UI

- SvelteKit single-page application
- SD Worx-inspired design system
- Structured dashboards for:
  - Admin
  - Processor

---

## Technology Stack

### Frontend

- SvelteKit
- JavaScript
- Bulma CSS
- SD Worx-inspired custom design

### Backend

- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication
- bcrypt password hashing

### Integration

- OpenSSL (certificate handling)
- Revenue Signing Service (PIT3)
- REST-based ERR submission modelling

---

## Project Structure (High Level)

```
ERR-Expenses-Web-App-with-ROS-API-Integration/
├── Documentation/          # Final Report
├── RevenueSigningService/  # Revenue integration layer
├── Webpage/                # Project Webpage
├── backend/
│   ├── certs/              # Revenue certificates
│   ├── config/             # DB configuration
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth & RBAC
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── services/           # Revenue integration layer
│   ├── tools/              # Development tools
│   ├── utils/              # Seed scripts
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── lib/components/ # Components and utilities
│   │   ├── routes/         # SvelteKit pages
│   │   │   ├── admin/
│   │   │   ├── processor/
│   │   │   ├── login/
│   │   │   └── home/
│   │   └── app.css         # Global styling
│   ├── static/
└── README.md
```

---

## Local Development Setup

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (local instance recommended)
- Git
- OpenSSL (for certificate testing)
- npm

---

## Backend Setup

From the `backend` directory:

```bash
npm install
```

### Create a `.env` file:

```
# Application
PORT=xxxx
JWT_SECRET=your_jwt_secret_here
MONGO_URI=mongodb://127.0.0.1:27017/err_expenses

# Cookie Encryption
COOKIE_NAME=err_expenses
COOKIE_PASSWORD=your_32_character_cookie_key_here

# Revenue ROS (PIT3)
ROS_HOST=softwaretest.ros.ie
ROS_BASE_URL=https://softwaretest.ros.ie
AGENT_TAIN=YOUR_TEST_TAIN

# Signing Service
SIGNING_SERVICE_URL=http://localhost:xxxx

# Submission Metadata
SOFTWARE_USED=ERRExpenseManagementSystem
SOFTWARE_VERSION=0.01.0.0001
```

All credentials shown above are example placeholders.

---

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

## Signing Service Setup

From the `RevenueSigningService` directory:
Prerequisites: .NET SDK 8.0

```bash
dotnet --version
dotnet restore
dotnet build
dotnet run
```

The service will start on:

http://localhost:\*

\*Ensure this matches the SIGNING_SERVICE_URL value in your backend .env.

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
node backend/utils/createClaims.js
node backend/utils/createCompany.js
node backend/utils/createElements.js
node backend/utils/createEmployees.js
node backend/utils/createUsers.js
```

These scripts create:

- Test users (Admin / Processor)
- Reference data used when creating claims

---

## Versioning

This project uses semantic versioning with tagged milestones:

- v1.1.0 – Successful ROS PIT3 Handshake
- v1.2.0 – Successful ROS PIT3 ERR REST Submission
- v1.3.0 – POC Coding Completed

---

## Academic Context & Scope

This project was developed as a final-year capstone.

**Focus areas:**

- Regulatory data modelling
- Secure REST API design
- ERR schema compliance
- Auditability & traceability
- External government API integration
- SaaS-style architectural design

Dummy data is used throughout. No real PPSNs or personal data are processed.

---

## Project Website:

https://err-expenses-web-app-with-ros-api.netlify.app/

---

## Disclaimer

This project is a proof-of-concept designed to explore software engineering concepts and regulatory data modelling for academic purposes only, it is not a production-ready product and does not constitute a compliant payroll system.

---
