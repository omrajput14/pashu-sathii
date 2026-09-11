<div align="center">

<img src="government-dashboard/public/pashu-sathi-logo.png" alt="Pashu Sathi" width="160"/>

# PASHU SATHI 

**National Animal Healthcare, Veterinary Telemedicine & Epidemiological Surveillance Platform**

Built for **Smart India Hackathon 2026** — Problem Statement **#26128**, Maharashtra State Innovation Society, MedTech Track

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter&logoColor=white)](frontend/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.16-6DB33F?logo=springboot&logoColor=white)](backend/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](government-dashboard/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](government-dashboard/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17_%2B_PostGIS-4169E1?logo=postgresql&logoColor=white)](backend/)
[![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?logo=redis&logoColor=white)](backend/)
[![Azure](https://img.shields.io/badge/Cloud-Azure_Container_Apps-0078D4?logo=microsoftazure&logoColor=white)](backend/)
[![Tests](https://img.shields.io/badge/tests-716_passing-brightgreen)](#verification--test-coverage-summary)

</div>

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Overview](#overview)
- [Key Features](#key-features)
- [Outbreak Detection Flow](#outbreak-detection-flow)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start Guides](#quick-start-guides)
- [Verification & Test Coverage Summary](#verification--test-coverage-summary)
- [Localization](#localization)
- [Architectural & History Integrity Notice](#architectural--history-integrity-notice)

---

## Problem Statement

> **SIH Problem Statement #26128 — Livestock Disease Early Detection**
> Maharashtra State Innovation Society · MedTech Track · Smart India Hackathon 2025

Rural India loses an estimated **₹25,000 crore a year** to preventable livestock disease (DAHD), and outbreaks are typically confirmed **7–14 days** after the first animal falls sick — by then the herd is already dying. Maharashtra alone carries roughly **3.5 crore cattle**, and there is no unified way for a farmer, a field vet, and a district health officer to see the same outbreak at the same time.

**Pashu Sathi closes that loop end to end:** a farmer files a report from the field in seconds, an AI model does the first-pass screening, a licensed vet confirms it, and a spatial clustering + risk engine decides in real time whether it's an isolated case or the start of an outbreak — surfacing it on a government dashboard before it spreads.

---

## Overview

The platform ships as three coordinated applications sharing one backend:

1. **Multilingual Farmer & Paravet Mobile App** *(Flutter)* — AI-assisted symptom screening, emergency triage, digital animal health passports, offline-first sync, and veterinary appointment scheduling with in-app chat.
2. **Spring Boot Cloud Backend** — enterprise-grade REST APIs, JWT-based authentication, an agentic AI/RAG diagnosis pipeline, Redis caching, Azure Blob storage, and PostgreSQL + PostGIS spatial data.
3. **National Epidemiological & Government Command Dashboard** *(React)* — real-time GIS outbreak mapping, outbreak cluster intelligence, laboratory telemetry, automated vaccination campaigns, and administrative field reporting.

---

## Key Features

<table>
<tr>
<th>Farmer / Paravet App</th>
<th>Backend Platform</th>
<th>Government Dashboard</th>
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
- Firebase push + notification preferences
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

## Outbreak Detection Flow

The core of the platform: what happens between a farmer noticing something wrong and a district officer dispatching a response team.

<div align="center">
<img src="backend/sih_flowchart.svg" alt="Outbreak detection flow: farmer report to AI screening to vet confirmation to PostGIS clustering to risk scoring to dashboard alert to field response" width="480"/>
</div>

A single confirmed case doesn't trigger an alert on its own — the risk engine only escalates once a spatial and epidemiological pattern emerges, which is what keeps false alarms down and officer trust up.

---

## System Architecture

```mermaid
graph TD
    classDef client fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#ecfdf5;
    classDef gateway fill:#0c4a6e,stroke:#38bdf8,stroke-width:2px,color:#f0f9ff;
    classDef security fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#faf5ff;
    classDef domain fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#e0e7ff;
    classDef ai fill:#451a03,stroke:#fb923c,stroke-width:2px,color:#fff7ed;
    classDef gis fill:#134e4a,stroke:#2dd4bf,stroke-width:2px,color:#ccfbf1;
    classDef notif fill:#701a75,stroke:#f472b6,stroke-width:2px,color:#fdf2f8;
    classDef storage fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;

    subgraph Client ["  Client Layer  "]
        FA["Farmer / Paravet Mobile App<br/>Flutter / Dart"]:::client
        GD["Government Surveillance Dashboard<br/>React / TypeScript / Vite"]:::client
    end

    subgraph Gateway ["  API & Gateway Layer  "]
        AG["Azure Container Apps / Cloud Ingress"]:::gateway
    end

    subgraph AppLayer ["  Application Layer — Spring Boot 3.5 / Java 21  "]
        SEC["Auth & Spring Security (JWT)"]:::security
        CORE["Domain Services<br/>Animal · Appointment · Medical Record · Mortality · Vaccination"]:::domain
        AI["AI Orchestrator<br/>Agent · RAG · Prompt · Provider Gateway"]:::ai
        GEO["Disease Surveillance & GIS Engine<br/>Outbreak · Boundary · Dashboard"]:::gis
        NOTIF["Notification Service<br/>Firebase Push"]:::notif
    end

    subgraph DataLayer ["  Data & Storage Layer  "]
        PG[("PostgreSQL 17 + PostGIS")]:::storage
        RD[("Redis 7.4 Cache")]:::storage
        BLOB[("Azure Blob Document Store")]:::storage
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

    style Client fill:#022c22,stroke:#059669,stroke-width:2px,color:#a7f3d0,stroke-dasharray: 4 4
    style Gateway fill:#082f49,stroke:#0284c7,stroke-width:2px,color:#bae6fd,stroke-dasharray: 4 4
    style AppLayer fill:#0f172a,stroke:#475569,stroke-width:2px,color:#cbd5e1,stroke-dasharray: 4 4
    style DataLayer fill:#111827,stroke:#3b82f6,stroke-width:2px,color:#93c5fd,stroke-dasharray: 4 4
```

---

## Tech Stack

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

## Repository Structure

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

## Quick Start Guides

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

## Verification & Test Coverage Summary

| Subsystem | Technology | Test Runner | Test Count | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Flutter / Dart | `flutter test` | 157 passed | Passing |
| **Backend** | Spring Boot / JUnit 5 | `./mvnw test` | 464 passed | Passing |
| **Government Dashboard** | React / Vitest | `vitest run` | 95 passed | Passing |
| **Total** | | | **716 passed** | Passing |

---

## Localization

The mobile app ships fully localized in four languages, so farmers and paravets can use it in the language they're most comfortable with:

**English · हिंदी (Hindi) · मराठी (Marathi) · اردو (Urdu)**

---

## Architectural & History Integrity Notice

- **Full Git History Preserved**: The repository merges all historical commits from the independent Flutter frontend, Spring Boot backend, and Government Dashboard repositories via standard `git subtree` without squashing, rewriting, or rebasing.
- **Package Integrity**: All backend Java packages (`app.vetra.*`), database migration sequences, and API contracts remain strictly preserved to ensure seamless zero-downtime deployment.
