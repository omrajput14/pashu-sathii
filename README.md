# PASHU SATHI (पशु साथी)

> **National Animal Healthcare, Veterinary Telemedicine & Epidemiological Surveillance Platform**  
> *Developed for Smart India Hackathon (SIH)*

[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?logo=flutter)](frontend/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.16-6DB33F?logo=springboot)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](government-dashboard/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](government-dashboard/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql)](backend/)
[![Azure](https://img.shields.io/badge/Cloud-Azure_Container_Apps-0078D4?logo=microsoftazure)](backend/)

---

## 📌 Overview

**PASHU SATHI** is a unified, end-to-end veterinary and livestock intelligence platform engineered to bridge the gap between rural farmers, certified veterinarians, para-vets, and national disease surveillance authorities.

The platform provides:
1. **Multilingual Farmer & Paravet Mobile App**: AI-assisted symptom screening, emergency triage, digital animal health passports, offline-first sync, and veterinary appointment scheduling.
2. **Spring Boot Cloud Backend**: Enterprise-grade REST APIs, JWT & biometric authentication, Redis caching, MinIO/Azure Blob storage, and PostgreSQL relational data models.
3. **National Epidemiological & Government Command Dashboard**: Real-time GIS outbreak mapping, outbreak cluster intelligence, laboratory telemetry, automated vaccination campaigns, and administrative field reporting.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Client Layer
        FA[Farmer / Paravet Mobile App<br/>Flutter / Dart]
        GD[Government Surveillance Dashboard<br/>React / TypeScript / Vite]
    end

    subgraph API & Gateway Layer
        AG[Azure Container Apps / Cloud Ingress]
    end

    subgraph Application Layer
        SB[Pashu Sathi Backend Service<br/>Spring Boot 3.5.16 / Java 21]
        SEC[Spring Security & JWT Auth]
        AI[AI Governance & Triage Engine]
        GEO[Spatial Surveillance & GIS Engine]
    end

    subgraph Data & Storage Layer
        PG[(PostgreSQL 16 Database)]
        RD[(Redis Distributed Cache)]
        BLOB[(Azure Blob / S3 Document Store)]
    end

    FA -->|REST / HTTPS| AG
    GD -->|REST / HTTPS| AG
    AG --> SB
    SB --> SEC
    SB --> AI
    SB --> GEO
    SB --> PG
    SB --> RD
    SB --> BLOB
```

---

## 📂 Repository Structure

```
pashu-sathi/
├── frontend/                   # Cross-Platform Flutter Mobile Application
│   ├── lib/                    # Application source code (MVVM / Clean Architecture)
│   ├── assets/                 # Icons, branding, illustrations & offline bundles
│   ├── test/                   # Comprehensive Flutter unit & widget test suite (157+ tests)
│   └── pubspec.yaml            # Flutter package dependencies
│
├── backend/                    # Spring Boot 3.5.16 Cloud Enterprise Backend
│   ├── src/main/java/app/vetra # Application modules, services, controllers, entities
│   ├── src/main/resources/     # Database migrations (Flyway), application profiles
│   ├── src/test/java/app/vetra # Backend unit & integration test suites
│   ├── pom.xml                 # Maven build configuration
│   └── Dockerfile              # Multi-stage production container build
│
├── government-dashboard/       # National Epidemiological Surveillance Web Application
│   ├── src/                    # React 18 + TypeScript + Vite UI components
│   ├── src/test/               # Vitest suite for UI & GIS logic (95+ tests)
│   ├── public/                 # Static assets, branding & icons
│   └── package.json            # Node.js dependencies and build scripts
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

---

## 🔒 Architectural & History Integrity Notice

- **Full Git History Preserved**: The repository merges all historical commits from the independent Flutter frontend, Spring Boot backend, and Government Dashboard repositories via standard `git subtree` without squashing, rewriting, or rebasing.
- **Package Integrity**: All backend Java packages (`app.vetra.*`), database migration sequences, and API contracts remain strictly preserved to ensure seamless zero-downtime deployment.
