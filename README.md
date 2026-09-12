<div align="center">

<img src="government-dashboard/public/pashu-sathi-logo.png" alt="Pashu Sathi Logo" width="170"/>

# PASHU SATHI (पशु साथी)

### National Animal Healthcare, Veterinary Telemedicine & Epidemiological Surveillance Platform

Built for **Smart India Hackathon 2026** · **Problem Statement #26128** · MedTech Track  
**Organization / State:** Maharashtra State Innovation Society & Department of Animal Husbandry and Dairying (DAHD)

[![SIH 2026](https://img.shields.io/badge/SIH_2026-PS_%2326128-10b981?style=for-the-badge&logo=target)](https://www.sih.gov.in/)
[![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter&logoColor=white)](frontend/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.16-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](backend/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](government-dashboard/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17_%2B_PostGIS-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](backend/)
[![Redis](https://img.shields.io/badge/Redis-7.4-DC382D?style=for-the-badge&logo=redis&logoColor=white)](backend/)
[![Tests](https://img.shields.io/badge/Tests-716_Passing-success?style=for-the-badge&logo=checkmarx)](README.md#verification--test-coverage-summary)
[![Checkstyle](https://img.shields.io/badge/Google_Checkstyle-0_Violations-success?style=for-the-badge&logo=checkstyle)](backend/)

</div>

---

## Executive Summary

Rural India loses over **₹25,000 crore annually** to preventable livestock diseases (DAHD Report). Outbreak responses are historically crippled by a **7–14 day detection lag** — by the time state officials learn of an outbreak through manual paperwork, epidemics such as Lumpy Skin Disease (LSD) and Foot-and-Mouth Disease (FMD) have already spread across district borders. In Maharashtra alone, over **3.5 crore cattle** support rural livelihood with limited veterinary access (1 vet per 10,000+ animals).

**Pashu Sathi (पशु साथी)** delivers an end-to-end digital health and epidemiological surveillance ecosystem. It closes the communication gap between farmers, licensed veterinarians, and state health authorities through:

1. **Zero-Barrier Vernacular Reporting**: Offline-first mobile reporting with two-way voice AI in 4 languages (English, Hindi, Marathi, Urdu).
2. **Human-in-the-Loop Diagnostic Triage**: Multi-agent AI lesion pre-screening backed by licensed veterinarian verification before public alerts.
3. **Automated Spatial-Temporal Outbreak Engine**: PostGIS 25km Haversine clustering with a 4-signal weighted risk engine (0–100) that eliminates false alarms.
4. **Unified Animal Health Identity**: Verifiable QR digital animal passports tracking lifelong pedigree, vaccinations, and treatment history.
5. **Government Command & GIS Intelligence**: Real-time district-level outbreak heatmaps, statutory containment directives, and 1-click SitRep CSV exports.

---

## Table of Contents

- [SIH Problem Statement & Impact](#sih-problem-statement--impact)
- [System Architecture](#system-architecture)
- [Outbreak Detection & Response Flow](#outbreak-detection--response-flow)
- [SIH Requirement Alignment Matrix](#sih-requirement-alignment-matrix)
- [Key Features & Capabilities](#key-features--capabilities)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Verification & Test Coverage Summary](#verification--test-coverage-summary)
- [Quick Start Guide](#quick-start-guide)
- [Localization & Accessibility](#localization--accessibility)
- [History & Architectural Integrity](#history--architectural-integrity)

---

## SIH Problem Statement & Impact

> **Problem Statement ID**: #26128  
> **Title**: Unified Digital Platform for Animal Disease Surveillance, Early Warning, and Veterinary Healthcare Delivery  
> **Target Sector**: MedTech / Animal Husbandry & Dairying  
> **Partner Organization**: Maharashtra State Innovation Society

```
┌───────────────────────────┐      ┌───────────────────────────┐      ┌───────────────────────────┐
│   THE STATUS QUO TRAP     │      │     THE DETECTION GAP     │      │   PASHU SATHI SOLUTION    │
│                           │      │                           │      │                           │
│ • Paper registers & logs  │  ──> │ • 7–14 days detection lag │  ──> │ • Real-time GPS reporting │
│ • No rural connectivity  │      │ • ₹25,000+ Cr annual loss │      │ • Offline-first local sync│
│ • Low farmer literacy     │      │ • Rapid uncontained spread│      │ • 2-Way Voice AI advisor  │
│ • 1 vet per 10,000 cattle │      │ • High livestock mortality│      │ • PostGIS 25km clustering │
└───────────────────────────┘      └───────────────────────────┘      └───────────────────────────┘
```

---

## System Architecture

The platform is designed as an enterprise 4-tier distributed system with transactional integrity, circuit-breaker resilience, and high-performance GIS spatial indexing:

<div align="center">
<img src="backend/system_architecture.svg" alt="Pashu Sathi Unified System Architecture Diagram" width="100%"/>
</div>

### Architectural Tiers

1. **Client Layer**:
   - **Cross-Platform Mobile App (Flutter 3.x / Dart)**: Offline-first with local SQLite persistence, two-way speech-to-text / text-to-speech audio ducking, camera lesion capture, and QR passport scanning.
   - **Government Command Dashboard (React 18 / TypeScript 5.7 / Vite 6)**: Interactive Leaflet GIS, dynamic administrative boundary cascading (State $\rightarrow$ District $\rightarrow$ Taluka $\rightarrow$ Village), and SitRep CSV telemetry.
2. **API & Cloud Ingress Layer**:
   - **Azure Container Apps / Reverse Proxy**: Automated TLS 1.3 encryption, token-bucket rate limiting, and container health probes (`/actuator/health`).
3. **Enterprise Application Layer (Spring Boot 3.5 / Java 21)**:
   - **Security Shield**: Stateless JWT authentication with strict role-based access control (`FARMER`, `VETERINARIAN`, `ADMIN`, `GOVERNMENT_OFFICER`).
   - **GIS Outbreak Engine**: PostGIS spatial clustering running 25km Haversine bounding-box queries within 48-hour temporal windows.
   - **Multi-Agent AI Gateway**: Clinical RAG knowledge retrieval, image vision lesion screening, circuit-breaker fallbacks, and human-in-the-loop vet verification.
   - **Domain Services**: Normalized business modules for Animal Registry, Appointments, Prescriptions, Vaccination Campaigns, and Mortality Audits.
   - **Notification Hub**: Firebase Admin Cloud Messaging (FCM) dispatching automated early outbreak alerts and appointment reminders.
4. **Persistence & Cache Layer**:
   - **PostgreSQL 17 + PostGIS**: 18 normalized relational entities with spatial indexing (`ST_DWithin`, `ST_ClusterDBSCAN`) managed via Flyway migrations (V1–V18).
   - **Redis 7.4 In-Memory Cache**: High-throughput JWT denylisting, session telemetry, and sub-5ms GIS outbreak heatmap caching.
   - **Azure Blob Storage**: AES-256 encrypted storage for lesion diagnostic photos, laboratory cultures, and statutory quarantine documents with expiring SAS tokens.

---

## Outbreak Detection & Response Flow

The core epidemiological surveillance pipeline: what happens between a rural farmer noticing a sick animal and a district veterinary officer deploying ring-vaccination teams:

<div align="center">
<img src="backend/sih_flowchart.svg" alt="Pashu Sathi Outbreak Detection Flowchart" width="480"/>
</div>

### Step-by-Step Outbreak Lifecycle

1. **Field Incident Capture**: The farmer or paravet logs symptoms via 2-way Voice AI or photographic lesion capture. The device automatically affixes precision GPS coordinates.
2. **AI Pre-Screening**: Multi-agent diagnostic vision pipeline performs initial lesion analysis and categorizes suspected conditions (e.g., FMD, Lumpy Skin Disease, Brucellosis).
3. **Licensed Veterinarian Review**: A certified vet reviews the case on their portal. Human verification prevents false rumors from triggering public panics.
4. **PostGIS 25km Clustering**: When confirmed, PostGIS queries all verified cases within a 25km radius over the rolling 48-hour window using spatial indices.
5. **4-Signal Risk Engine**: The system calculates a composite risk index ($0 - 100$):
   $$\text{Risk Score} = w_1(\text{Case Velocity}) + w_2(\text{Weather Anomaly}) + w_3(\text{Historical Recurrence}) + w_4(\text{Vaccine Gap})$$
6. **Command Alert & Containment Dispatch**: If the risk score exceeds threshold ($\ge 65$), a statutory outbreak containment zone is drawn on the government dashboard, and ring-vaccination directives are dispatched via FCM push notifications.

---

## SIH Requirement Alignment Matrix

| SIH #26128 Requirement | Pashu Sathi Technical Implementation | Verification & Testing |
| :--- | :--- | :--- |
| **Low-Friction Disease Reporting** | Multilingual Flutter mobile app with 2-way Voice AI (STT $\leftrightarrow$ TTS), camera capture, and automatic GPS geo-tagging | Verified across 4 languages; 157 Flutter unit & widget tests passing |
| **Offline-First Resilience** | SQLite local queue syncing to cloud on network reconnection with timestamp-based conflict resolution | Offline sync tests in `frontend/test/core/offline_sync_test.dart` |
| **Early Warning & Surveillance** | Spatial-temporal clustering engine (`OutbreakDetectionEngine`) with PostGIS 25km radius queries and 4-signal risk scoring | 464 JUnit 5 backend tests; PostGIS Haversine calculation verified |
| **Veterinary Healthcare Delivery** | Telemedicine consultation, appointment booking, verified e-prescriptions, and licensed vet directory | Full domain service integration tests (`appointment/`, `medicalrecord/`) |
| **Digital Animal Passport** | Dynamic QR code generation linking to immutable livestock health records, pedigree, and vaccination status | QR generator and scanner widget tests passing (`animal/`) |
| **Government Command Operations** | Real-time Leaflet GIS dashboard with administrative cascade filters (State $\rightarrow$ District $\rightarrow$ Taluka) and CSV SitRep downloads | 95 Vitest tests passing (100% green) in `government-dashboard` |
| **Enterprise Security & Compliance** | Spring Security 6 stateless JWT, RBAC authorization, BCrypt hashing, and Google Java Checkstyle compliance | 0 Checkstyle violations; OWASP top 10 protected |

---

## Key Features & Capabilities

<table>
<tr>
<th width="33%">Farmer & Paravet App (Flutter)</th>
<th width="33%">Cloud Backend (Spring Boot)</th>
<th width="34%">Government Command (React)</th>
</tr>
<tr valign="top">
<td>

- **2-Way Voice AI Advisor**: Conversational symptom intake in Hindi, Marathi, Urdu, and English with auto audio ducking.
- **AI Camera Lesion Scanner**: Instant preliminary classification of skin nodules, mouth lesions, and hoof sores.
- **Digital QR Animal Passport**: Real-time generated QR codes for instant vet verification and livestock market trading.
- **Offline Field Mode**: Complete offline reporting queue with automatic background synchronization.
- **Telemedicine Booking**: Direct vet consultation with in-app messaging and electronic prescription tracking.

</td>
<td>

- **Spatial Epidemiological Engine**: PostGIS 25km cluster calculation and 4-signal weighted risk assessment.
- **Multi-Agent AI Gateway**: Pluggable diagnostic gateway (Gemini / DeepSeek / Noop fallback) with circuit breaker.
- **Vaccination Orchestration**: Cold-chain supply tracking, ring-vaccination targeting, and booster alerts.
- **Mortality Audit & Economics**: Sourced livestock loss tracking with economic damage estimation.
- **Multi-Channel Notifications**: Real Firebase Cloud Messaging (FCM) for emergency outbreak directives.

</td>
<td>

- **Real-Time GIS Heatmap**: Interactive Leaflet maps with dynamic buffer radius visualization.
- **Administrative Scope Cascading**: State $\rightarrow$ District $\rightarrow$ Taluka $\rightarrow$ Village multi-tier filtering.
- **Statutory Directives**: 1-click deployment of bio-containment zones and animal movement restrictions.
- **SitRep Export**: Instant CSV and report generation for inter-departmental state briefings.
- **Lab Telemetry Console**: Clinical pathology and serological culture tracking across regional labs.

</td>
</tr>
</table>

---

## Technology Stack

| Domain | Technology | Version | Purpose & Rationale |
| :--- | :--- | :--- | :--- |
| **Mobile Frontend** | Flutter & Dart | 3.x / 3.7+ | Cross-platform native performance (Android & iOS) with offline SQLite |
| **Mobile State** | Riverpod | 2.6+ | Declarative, compile-safe dependency injection and reactive state |
| **Backend Core** | Spring Boot | 3.5.16 | Enterprise Java microservice framework with high throughput |
| **Runtime** | OpenJDK | 21 (LTS) | Virtual Threads (Project Loom) for high-concurrency spatial queries |
| **Security** | Spring Security | 6.x | Stateless JWT authentication, role-based RBAC, BCrypt passwords |
| **Database** | PostgreSQL | 17 | Relational persistence with ACID transaction guarantees |
| **Spatial Engine** | PostGIS | 3.5 | Geospatial indices (`ST_DWithin`, `ST_Point`, `ST_ClusterDBSCAN`) |
| **Caching** | Redis | 7.4 | Sub-5ms token denylist, session storage, and GeoJSON cache |
| **Cloud Storage** | Azure Blob / S3 | API v12 | Encrypted clinical media storage with time-expiring SAS tokens |
| **Push Alerts** | Firebase Admin SDK | 9.x | FCM push notification provider for rural outbreak alerts |
| **Web Dashboard** | React & Vite | 18 / 6.x | High-performance SPA command center for state veterinary officers |
| **Dashboard GIS** | Leaflet & GeoJSON | 1.9+ | GPU-accelerated outbreak heatmap and administrative polygon rendering |
| **Type Safety** | TypeScript | 5.7+ | Strict typing preventing client-side runtime errors across GIS layers |

---

## Repository Structure

```
pashu-sathi/
├── frontend/                     # Cross-Platform Flutter Mobile Application
│   ├── lib/
│   │   ├── core/                 # Design system (AppColors, AppTypography), network, location, voice
│   │   └── features/             # Animal passport, consultation, disease reporting, QR scanner
│   ├── assets/                   # Vernacular audio, brand icons, and offline emergency bundles
│   ├── test/                     # Flutter unit and widget test suite (157 tests)
│   └── pubspec.yaml              # Flutter dependencies
│
├── backend/                      # Spring Boot 3.5.16 Enterprise Cloud Backend
│   ├── src/main/java/app/vetra/  # Domain microservices:
│   │   ├── auth/                 # JWT stateless authentication & device token registry
│   │   ├── animal/               # Livestock registry, tag numbers, and QR passport engine
│   │   ├── medicalrecord/        # Clinical records, prescriptions, and deworming history
│   │   ├── disease/              # Disease surveillance, PostGIS clustering & 4-signal risk engine
│   │   ├── ai/                   # Multi-agent AI gateway, RAG knowledge retrieval & fallback
│   │   ├── notification/         # Firebase Admin SDK FCM provider & preference manager
│   │   └── dashboard/            # Government command analytics & administrative aggregations
│   ├── src/main/resources/       # Flyway database migrations (V1-V18) & profiles
│   ├── src/test/java/app/vetra/  # JUnit 5 integration and unit test suite (464 tests)
│   ├── backend/system_architecture.svg # Handcrafted SVG enterprise architecture
│   ├── backend/sih_flowchart.svg       # Sourced outbreak surveillance flowchart
│   ├── docker-compose.yml        # Local PostgreSQL 17 + PostGIS & Redis stack
│   └── pom.xml                   # Maven build configuration (Checkstyle enforced)
│
├── government-dashboard/         # National Epidemiological Surveillance Web Application
│   ├── src/
│   │   ├── pages/                # Command overview, GIS map, outbreak intel, alerts, labs
│   │   ├── components/           # Accessible design system, metric cards, status badges
│   │   └── utils/                # Scope cascade filter, coordinate bounds, SitRep CSV export
│   ├── src/test/                 # Vitest suite for UI & GIS logic (95 tests)
│   └── package.json              # Vite & React configuration
│
└── README.md                     # Official monorepo documentation
```

---

## Verification & Test Coverage Summary

Pashu Sathi enforces a strict **zero-broken-tests** and **zero-Checkstyle-violations** policy across all three subsystems. Every pull request runs deterministic automated suites:

| Subsystem | Framework | Test Runner | Tests Passed | Quality Standard |
| :--- | :--- | :--- | :---: | :--- |
| **Mobile Application** | Flutter / Dart | `flutter test` | **157** | Clean architectural boundaries, zero static warnings |
| **Cloud Backend** | Spring Boot / JUnit 5 | `./mvnw test` | **464** | Google Java Checkstyle (0 violations), MockMvc + PostGIS |
| **Government Dashboard** | React / Vitest | `npm test` | **95** | 100% green component & GIS viewport unit assertions |
| **Total Automated Tests** | | | **716** | **100% Passing (Green)** |

---

## Quick Start Guide

### Prerequisites

- **Java Development Kit**: OpenJDK 21+
- **Node.js**: v20+ and npm v10+
- **Flutter SDK**: v3.29+ and Dart v3.7+
- **Docker & Docker Compose**: v24+

---

### 1. Start Infrastructure (PostgreSQL + PostGIS & Redis)

```bash
cd backend
docker-compose up -d
```
*Verifies PostgreSQL with PostGIS on port `5432` and Redis on port `6379`.*

---

### 2. Run Enterprise Backend (Spring Boot 3.5)

```bash
cd backend

# Verify Google Java Checkstyle compliance (0 violations)
./mvnw checkstyle:check

# Run complete test suite (464 tests)
./mvnw test

# Start backend server
./mvnw spring-boot:run
```

- **API Base Endpoint**: `http://localhost:8080/api/v1`
- **Swagger / OpenAPI Documentation**: `http://localhost:8080/swagger-ui.html`
- **Actuator Health Probe**: `http://localhost:8080/actuator/health`

---

### 3. Run Government Surveillance Dashboard (React / Vite)

```bash
cd government-dashboard

# Install dependencies
npm install

# Run automated tests (95 tests)
npm test

# Launch development server
npm run dev
```

- **Dashboard URL**: `http://localhost:3000`
- *Pre-configured with 1-Click Direct Demo Authentication for State Veterinary Officers.*

---

### 4. Run Farmer & Paravet Mobile App (Flutter)

```bash
cd frontend

# Install Flutter packages
flutter pub get

# Run static analysis
flutter analyze

# Execute test suite (157 tests)
flutter test

# Launch on connected simulator or Android device
flutter run
```

---

## Localization & Accessibility

To ensure equitable rural adoption across diverse farming communities, the mobile application provides native language support across all clinical workflows:

<div align="center">

| Language | Code | Voice AI Support | Clinical Text |
| :--- | :---: | :---: | :---: |
| **English** | `en-IN` | Supported (STT + TTS) | 100% Localized |
| **हिंदी (Hindi)** | `hi-IN` | Supported (STT + TTS) | 100% Localized |
| **मराठी (Marathi)** | `mr-IN` | Supported (STT + TTS) | 100% Localized |
| **اردو (Urdu)** | `ur-IN` | Supported (STT + TTS) | 100% Localized |

</div>

---

## History & Architectural Integrity

- **Monorepo Subtree Preservation**: All commits from the independent Flutter frontend, Spring Boot backend, and Government Dashboard repositories were unified using standard `git subtree` without squashing, preserving full author attribution and historical integrity.
- **Zero-Downtime Migration Safety**: Database schemas are managed strictly via Flyway scripts (`V1__init.sql` through `V18`). Direct schema mutations in production are strictly forbidden.
- **Human-in-the-Loop Diagnostic Ethics**: Artificial intelligence in Pashu Sathi serves as an assistive triage aid. No animal quarantine or statutory movement directive is enacted without licensed veterinary verification.

---

<div align="center">

**Smart India Hackathon 2026 · Problem Statement #26128**  
*Empowering Rural Farmers · Protecting National Livestock · Halting Outbreaks Early*

</div>
