# PASHU SATHI (पशु साथी)

> **National Animal Healthcare, Veterinary Telemedicine & Epidemiological Surveillance Platform**
> *Developed for Smart India Hackathon (SIH)*

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter&logoColor=white)](frontend/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.16-6DB33F?logo=springboot&logoColor=white)](backend/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](government-dashboard/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](government-dashboard/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](backend/)
[![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?logo=redis&logoColor=white)](backend/)
[![Azure](https://img.shields.io/badge/Cloud-Azure_Container_Apps-0078D4?logo=microsoftazure&logoColor=white)](backend/)
[![Tests](https://img.shields.io/badge/tests-716_passing-brightgreen)](#-verification--test-coverage-summary)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#️-system-architecture)
- [AI-Assisted Triage Flow](#-ai-assisted-triage-flow)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Quick Start Guides](#-quick-start-guides)
- [Verification & Test Coverage](#-verification--test-coverage-summary)
- [Localization](#-localization)
- [Architectural & History Integrity Notice](#-architectural--history-integrity-notice)

---

## 📌 Overview

**PASHU SATHI** is a unified, end-to-end veterinary and livestock intelligence platform engineered to bridge the gap between rural farmers, certified veterinarians, para-vets, and national disease surveillance authorities.

The platform ships as three coordinated applications sharing one backend:

1. **Multilingual Farmer & Paravet Mobile App** *(Flutter)* — AI-assisted symptom screening, emergency triage, digital animal health passports, offline-first sync, and veterinary appointment scheduling with in-app chat.
2. **Spring Boot Cloud Backend** — enterprise-grade REST APIs, JWT-based authentication, an agentic AI/RAG diagnosis pipeline, Redis caching, Azure Blob storage, and PostgreSQL + PostGIS spatial data.
3. **National Epidemiological & Government Command Dashboard** *(React)* — real-time GIS outbreak mapping, outbreak cluster intelligence, laboratory telemetry, automated vaccination campaigns, and administrative field reporting.

---

## ✨ Key Features

<table>
<tr>
<th>📱 Farmer / Paravet App</th>
<th>⚙️ Backend Platform</th>
<th>🏛️ Government Dashboard</th>
</tr>
<tr valign="top">
<td>

- AI photo-based symptom scanner
- Conversational AI health advisor
- Digital animal health passports
- Vet appointment booking + in-app chat
- Vaccination & mortality logging
- Offline-first local sync
- Push notifications (Firebase)
- 4 languages: English, Hindi, Marathi, Urdu

</td>
<td>

- JWT authentication & user management
- Agentic AI diagnosis pipeline (RAG-backed)
- Disease outbreak reporting & clustering
- Vaccination campaign orchestration
- Mortality & medical record tracking
- Redis-cached, rate-limited REST APIs
- Firebase push + in-app notification preferences
- Developer analytics & health endpoints

</td>
<td>

- Live GIS outbreak & cluster mapping
- Epidemiological analytics dashboard
- Laboratory surveillance telemetry
- Field surveillance report ledger
- Alerts management console
- Vaccination intelligence views
- Administrative boundary drill-down
- Protocols & reference library

</td>
</tr>
</table>

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph "Client Layer"
        FA["Farmer / Paravet Mobile App<br/>Flutter / Dart"]
        GD["Government Surveillance Dashboard<br/>React / TypeScript / Vite"]
    end

    subgraph "API & Gateway Layer"
        AG["Azure Container Apps / Cloud Ingress"]
    end

    subgraph "Application Layer — Spring Boot 3.5 / Java 21"
        SEC["Auth & Spring Security (JWT)"]
        CORE["Domain Services<br/>Animal · Appointment · Medical Record · Mortality · Vaccination"]
        AI["AI Orchestrator<br/>Agent · RAG · Prompt · Provider Gateway"]
        GEO["Disease Surveillance & GIS Engine<br/>Outbreak · Boundary · Dashboard"]
        NOTIF["Notification Service<br/>Firebase Push"]
    end

    subgraph "Data & Storage Layer"
        PG[("PostgreSQL 17 + PostGIS")]
        RD[("Redis 7.4 Cache")]
        BLOB[("Azure Blob Document Store")]
    end

    FA -->|REST / HTTPS| AG
    GD -->|REST / HTTPS| AG
    AG --> SEC
    SEC --> CORE
    SEC --> AI
    SEC --> GEO
    CORE --> PG
    AI --> PG
    GEO --> PG
    CORE --> RD
    AI --> RD
    CORE --> BLOB
    NOTIF -.->|push| FA
    CORE --> NOTIF
```

---

## 🤖 AI-Assisted Triage Flow

The backend's `ai/` module (agent, RAG, prompt, provider gateway, and orchestrator packages) drives symptom triage end to end:

```mermaid
sequenceDiagram
    actor Farmer
    participant App as Mobile App
    participant API as Backend API
    participant Agent as AI Orchestrator / Agent
    participant RAG as RAG Knowledge Base
    participant Vet as Veterinarian

    Farmer->>App: Describe symptoms / capture photo
    App->>API: POST /ai/scan or /ai/advisor
    API->>Agent: Dispatch triage request
    Agent->>RAG: Retrieve relevant veterinary knowledge
    RAG-->>Agent: Contextual findings
    Agent-->>API: Triage result + urgency signal
    API-->>App: Guidance (self-care vs. see a vet)
    opt Urgent case
        API->>Vet: Notify & suggest appointment
        Vet-->>Farmer: Appointment confirmed (in-app chat)
    end
```

---

## 🧰 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Mobile App** | Flutter 3.x, Dart, Riverpod, go_router, Dio, flutter_secure_storage, camera, speech_to_text |
| **Backend** | Spring Boot 3.5.16, Java 21, Spring Security (JWT), Spring Data JPA, Flyway, Resilience4j |
| **AI Pipeline** | Custom orchestrator, agent & RAG packages, pluggable model provider gateway |
| **Dashboard** | React 18, TypeScript 5.7, Vite 6, TanStack Query, Leaflet (GIS), Tailwind CSS |
| **Data** | PostgreSQL 17 + PostGIS, Redis 7.4 |
| **Storage & Messaging** | Azure Blob / S3-compatible storage, Firebase Cloud Messaging |
| **Infra** | Docker Compose (local), Azure Container Apps (cloud) |

---

## 📂 Repository Structure

```
pashu-sathi/
├── frontend/                   # Cross-Platform Flutter Mobile Application
│   ├── lib/                    # Application source (core/ + features/, MVVM-style)
│   ├── assets/                 # Icons, branding, illustrations & offline bundles
│   ├── test/                   # Flutter unit & widget test suite (157 tests)
│   └── pubspec.yaml            # Flutter package dependencies
│
├── backend/                    # Spring Boot 3.5.16 Cloud Enterprise Backend
│   ├── src/main/java/app/vetra # Domain modules: auth, animal, appointment, ai, disease,
│   │                           # vaccination, mortality, medicalrecord, notification, dashboard...
│   ├── src/main/resources/     # Flyway migrations, application profiles
│   ├── src/test/java/app/vetra # Backend unit & integration test suites (464 tests)
│   ├── docker-compose.yml      # Local Postgres/PostGIS + Redis stack
│   ├── pom.xml                 # Maven build configuration
│   └── Dockerfile              # Multi-stage production container build
│
├── government-dashboard/       # National Epidemiological Surveillance Web Application
│   ├── src/pages/               # Command overview, outbreak intel, GIS map, alerts, labs...
│   ├── src/components/          # Reusable React UI components
│   ├── src/test/                # Vitest suite for UI & GIS logic (95 tests)
│   └── package.json             # Node.js dependencies and build scripts
│
├── docs/                       # Technical documentation, specifications & case studies
│   ├── architecture/           # Full system architecture audits & reports
│   ├── design/                 # UI/UX design specifications & tokens
│   └── sih/                    # SIH problem statement case studies & SWOT analyses
│
└── README.md                   # Monorepo documentation & quick-start guide
```

---

## 🚀 Quick Start Guides

### 1. Frontend (Flutter Mobile App)

```bash
cd frontend

# Get Flutter dependencies
flutter pub get

# Run static analysis (0 warnings)
flutter analyze

# Run test suite (157 tests)
flutter test

# Run app on connected device or simulator
flutter run
```

### 2. Backend (Spring Boot 3.5.16)

```bash
cd backend

# Build and verify checkstyle
./mvnw checkstyle:check

# Run unit tests
./mvnw test

# Start the Spring Boot application locally
./mvnw spring-boot:run
```

*Default local API endpoint:* `http://localhost:8080/api`
*Default Swagger/OpenAPI documentation:* `http://localhost:8080/swagger-ui.html`

### 3. Government Surveillance Dashboard (React / Vite)

```bash
cd government-dashboard

# Install dependencies
npm install

# Run TypeScript type check
npm run lint

# Run Vitest test suite (95 tests)
npm test

# Launch local development server
npm run dev
```

*Default development URL:* `http://localhost:3000`

---

## 🧪 Verification & Test Coverage Summary

| Subsystem | Technology | Test Runner | Test Count | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Flutter / Dart | `flutter test` | 157 passed | ✅ All Green |
| **Backend** | Spring Boot / JUnit 5 | `./mvnw test` | 464 passed | ✅ All Green |
| **Government Dashboard** | React / Vitest | `vitest run` | 95 passed | ✅ All Green |
| **Total** | | | **716 passed** | ✅ All Green |

---

## 🌐 Localization

The mobile app ships fully localized in four languages, so farmers and paravets can use it in the language they're most comfortable with:

🇬🇧 English · 🇮🇳 हिंदी (Hindi) · 🇮🇳 मराठी (Marathi) · 🇵🇰 اردو (Urdu)

---

## 🔒 Architectural & History Integrity Notice

- **Full Git History Preserved**: The repository merges all historical commits from the independent Flutter frontend, Spring Boot backend, and Government Dashboard repositories via standard `git subtree` without squashing, rewriting, or rebasing.
- **Package Integrity**: All backend Java packages (`app.vetra.*`), database migration sequences, and API contracts remain strictly preserved to ensure seamless zero-downtime deployment.
