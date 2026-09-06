# VETRA — Complete Project Audit Against SIH 2026 PS#26128

> **Audit Date:** 27 August 2026  
> **Auditor Mode:** Senior Software Architect + SIH Technical Evaluator  
> **Rule:** A feature is FULLY IMPLEMENTED only if the complete end-to-end workflow works. A screen existing is not a feature.

---

## Architecture Reality Check

| Layer | Documented | Actual Code | Match |
|---|---|---|---|
| Frontend | Flutter | Flutter (Riverpod + GoRouter + Dio) | YES |
| Backend | Spring Boot | Spring Boot 3.x (Clean Arch + DDD) | YES |
| Database | PostgreSQL + PostGIS | PostgreSQL + PostGIS (Flyway V1-V22) | YES |
| AI Provider | Gemini | Gemini via provider-agnostic gateway | YES |
| Notifications | Firebase FCM | FCM interface exists - body is a logger stub | PARTIAL |
| Maps | Interactive GIS | Icon placeholder + hardcoded static text | NO |
| Offline | SQLite / sync queue | No SQLite. Separate static screens. No sync logic | NO |
| Government Role | GOVERNMENT user | Only FARMER / VETERINARIAN / ADMINISTRATOR | NO |
| Weather API | Integrated | Zero references to any weather API anywhere | NO |
| Lab Referral | Full workflow | Zero lab/laboratory/sample references in backend | NO |

---

## Feature Audit — Complete Classification

### Authentication and User Management

FULLY IMPLEMENTED: JWT authentication — Full registration, login, refresh token, role-based access.

FULLY IMPLEMENTED: FARMER and VETERINARIAN roles — Full profile creation, ownership verification.

NOT IMPLEMENTED: GOVERNMENT role — UserRole enum only has FARMER, VETERINARIAN, ADMINISTRATOR. No government officer user type exists.

---

### Animal Registration and QR Passport

**The QR Passport workflow reality:**

| Step | Status | Evidence |
|---|---|---|
| Create animal | GREEN | AnimalService.createAnimal() — full backend implementation |
| Unique persistent animal ID | GREEN | UUID primary key, duplicate tag/QR validation |
| Store QR code ID | GREEN | qrCodeId field on animal table |
| Generate QR visual | RED | qr_flutter NOT in pubspec.yaml — no QR generation library |
| Scan QR with camera | RED | mobile_scanner NOT in pubspec.yaml — no QR scan library |
| Retrieve animal by QR | GREEN | searchAnimals(qrCodeId:...) API endpoint exists |
| Display passport with history | YELLOW | animal_passport_page.dart is 587 lines and calls real APIs |
| Vaccination history | YELLOW | HealthRecordType.VACCINATION enum exists, health records stored |
| Treatment history | YELLOW | Medical records API works |
| AI scan history in passport | YELLOW | Context builder pulls previous AI scans |
| Timeline medical history | GREEN | loadTimeline() calls real GET /animals/{id}/health-records |
| Offline passport | RED | AnimalPassportOfflineStatePage = static text "Offline Animal Data Loaded" |

**Critical QR Finding:** There is no QR generation library and no QR scanner library in the entire Flutter project. The passport page exists and is wired to a real API, but the core QR scan-to-open flow — the centrepiece of the demo — is not physically possible with current code.

---

### Disease Reporting

| Workflow Step | Status | Evidence |
|---|---|---|
| Farmer report page | RED | report_disease_page.dart — onPressed: () => context.pop() — submits nothing |
| Backend disease report creation | GREEN | DiseaseService.createDiseaseReport() — full implementation |
| GPS location capture on report | RED | No geolocator usage found in disease reporting flow |
| Animal linkage on report | GREEN | DiseaseReport entity links to animal_id |
| Status lifecycle (SUSPECTED to CONFIRMED to REJECTED) | GREEN | Backend enum + update endpoint |
| Veterinarian confirms report | YELLOW | Vet can update diagnosis status — no dedicated UI flow |
| AI scan auto-create disease report | YELLOW | DiseaseService accepts aiScanId but flow not triggered automatically |

**Critical Finding:** The Farmer disease report page submits nothing. The button calls context.pop(). This is the most critical broken link in the PS#26128 requirement for "rapid symptom reporting."

---

### Outbreak Detection Engine

| Component | Status | Evidence |
|---|---|---|
| Spatial cluster detection | GREEN | OutbreakDetectionEngine.evaluateReport() — real Haversine distance + time window |
| Disease-specific profiles (FMD, Rabies, Anthrax, Brucellosis) | GREEN | DiseaseOutbreakProperties — hardcoded high-quality profiles |
| Risk scoring (LOW/MEDIUM/HIGH/CRITICAL) | GREEN | Formula: caseCount x severityWeight x velocityFactor |
| Outbreak lifecycle (ACTIVE to MONITORING to RESOLVED) | GREEN | OutbreakScheduler — hourly cron, autonomous lifecycle transitions |
| Trend analysis | GREEN | OutbreakTrendAnalyzer.calculateTrend() |
| Spring events on escalation | GREEN | OutbreakEscalatedEvent, OutbreakRiskChangedEvent, etc. |
| PostGIS spatial queries | YELLOW | Schema has GiST indexes and GEOMETRY columns — engine uses Haversine in Java, NOT PostGIS queries |
| Weather signal | RED | No weather signal. Risk score only uses case count + severity weight |
| Historical outbreak signal | RED | No historical data baseline in risk calculation |
| Vaccination gap signal | RED | Vaccination records exist in health records but never queried by risk engine |

**Finding:** The outbreak engine is architecturally real and the best-implemented backend module. However, it is a 1-signal engine (spatial/temporal case count) presented as a multi-signal system. Weather, historical, and vaccination gap signals are completely absent.

---

### Map / GIS Visualization

| Feature | Status | Evidence |
|---|---|---|
| Real interactive map widget | RED | No google_maps_flutter, flutter_map, or mapbox in pubspec |
| Farmer outbreak map | RED | outbreak_map_page.dart = static Icon(Icons.map) + hardcoded text |
| Farmer risk zone | RED | risk_zone_page.dart = static list, hardcoded "High Risk Zone #1" |
| Vet outbreak map | RED | vet_outbreak_map_page.dart — lines 99-125 are hardcoded strings ("Oak Valley Farm", "Dr. Sarah Jenkins") |
| Geographic cluster visualization | RED | Not possible without a map widget |
| Heatmap | RED | HeatmapPoint.java exists in backend geo package — no frontend |
| GeoJSON endpoint | YELLOW | GeoJsonService.java exists — no frontend consumes it |
| Disease filter, radius filter | YELLOW | Dropdown UI exists in vet map — connected to setState() only, no API |

**Finding:** Both map screens in the app display an icon and hardcoded static data. There is no mapping library in the Flutter project. This is the second-most critical gap.

---

### AI System

| Feature | Status | Evidence |
|---|---|---|
| AI gateway with failover | GREEN | DefaultAIGateway, FailoverManager — real provider-agnostic routing |
| Gemini API integration | GREEN | Configured, model gemini-3.5-flash wired |
| Visual disease scan (camera to AI) | YELLOW | disease_scanner_page.dart uses camera; AIScanService processes images |
| AI Advisor conversational session | GREEN | AIAdvisorService — full multi-turn conversation, 15-turn limit, emergency keywords |
| Animal context included in AI prompt | GREEN | AIAdvisorContextBuilder pulls animal breed, species, age |
| Medical history included | GREEN | EVMR records pulled into prompt context |
| Marathi / Hindi language support | GREEN | Prompt template has preferredLanguage variable with Marathi/Hindi/English |
| Safety guardrails (no diagnosis/prescriptions) | GREEN | Prompt explicitly forbids prescriptions, always escalates to vet |
| RAG veterinary knowledge | YELLOW | Config exists (vetra.ai.rag), vector store set to in-memory — no actual knowledge base loaded |
| AI triggers disease report automatically | RED | Scan result does not auto-create a disease report |

**Finding:** The AI system is the strongest part of VETRA. The guardrails, multi-language support, and context assembly are production-quality. The RAG knowledge base is configured but empty.

---

### Government Dashboard

| Feature | Status | Evidence |
|---|---|---|
| Government-specific dashboard | RED | DashboardController has one endpoint. UserRole has no GOVERNMENT type |
| Total cases / active outbreaks view | RED | Dashboard returns: animal_count, pending_appointments, 0L (Active alerts placeholder) |
| Live map with clusters | RED | No map exists anywhere |
| District/block/village breakdown | RED | No administrative boundary data in schema |
| Outbreak alerts | RED | Alert count is hardcoded to 0L in DashboardService.java |
| Response initiation (vet visit, campaign) | RED | No response workflow exists |
| Farmer advisories | RED | Not implemented |
| Lab referral tracking | RED | Not implemented |

**Finding:** The Government Command Dashboard — the most critical requirement of PS#26128 — does not exist. The existing dashboard is a per-user summary card for farmers and vets. The activeAlerts field is 0L (a code comment says "Active alerts placeholder"). There is no GOVERNMENT role. There is no district-level view.

---

### Notification System

| Feature | Status | Evidence |
|---|---|---|
| Notification entity, preferences, templates | GREEN | Full entity model, NotificationTemplate, NotificationPreference |
| Firebase FCM provider | BROKEN | FirebaseNotificationProvider.send() — logs the message and generates a fake fcm-{UUID} ID. No actual Firebase SDK. |
| SMS provider | RED | No SMS gateway |
| Outbreak event to notification trigger | YELLOW | Spring events fire on outbreak escalation — event listeners exist but send to fake FCM |
| Push to farmer on outbreak near their location | RED | Location-based push logic not implemented |

---

### Offline Functionality

**Classification: NOT IMPLEMENTED.**

Evidence:
- No sqflite or hive or any local database library in pubspec.yaml
- "Offline" pages (AnimalPassportOfflineStatePage, MyAnimalsOfflineStatePage) are static screens that display placeholder text
- FeatureFlagsService has offlineSyncEnabled = true — a boolean flag that does nothing
- No sync queue, no retry mechanism, no conflict resolution
- flutter_secure_storage exists for JWT token only

---

### Localization (Marathi / Voice)

| Feature | Status |
|---|---|
| flutter_localizations | GREEN — Wired |
| Marathi strings (l10n) | YELLOW — Used in some screens, missing in others |
| speech_to_text dependency | GREEN — In pubspec |
| Voice input actually wired to any screen | RED — Not found in any page |

---

### Vaccination Drives and Historical Data

- NOT IMPLEMENTED: No vaccination campaign management
- NOT IMPLEMENTED: No village-level vaccination coverage calculation
- NOT IMPLEMENTED: No vaccination gap analysis feeding into risk engine
- NOT IMPLEMENTED: No historical outbreak database (no seed data, no historical data queries)

---

## SIH PS#26128 — Requirement Mapping Table

| # | SIH Requirement | VETRA Current State | Status | Priority |
|---|---|---|---|---|
| 1 | Unified real-time mechanism | Dashboard exists — hardcoded zeros | RED | P0 |
| 2 | Farmer symptom reporting | Button calls context.pop() — submits nothing | RED | P0 |
| 3 | Rapid symptom reporting form | Form UI exists, no submit | RED | P0 |
| 4 | Veterinary workflow | Vet dashboard + medical records real | YELLOW | P1 |
| 5 | Animal health history | Timeline API real, passport page real | GREEN | — |
| 6 | Vaccination history stored | Health records with VACCINATION type | YELLOW | P1 |
| 7 | Treatment history | Medical records API real | GREEN | — |
| 8 | Fragmented data integration | Single PostgreSQL — no fragmented legacy sources | YELLOW | P1 |
| 9 | Village-level surveillance | No administrative boundaries anywhere | RED | P0 |
| 10 | Block-level surveillance | Not implemented | RED | P0 |
| 11 | District-level surveillance | Not implemented | RED | P0 |
| 12 | Early warning | Outbreak engine fires — government sees nothing | YELLOW | P0 |
| 13 | Risk assessment | 1-signal risk engine — spatial only | YELLOW | P0 |
| 14 | Outbreak clustering | Real spatial clustering in backend | GREEN | — |
| 15 | Preventive action workflow | Not implemented | RED | P1 |
| 16 | Veterinary referral | Appointment booking exists | YELLOW | P1 |
| 17 | Laboratory referral | Not implemented at all | RED | P1 |
| 18 | Coordinated response | Not implemented | RED | P0 |
| 19 | Government dashboard | Does not exist | RED | P0 |
| 20 | Low-connectivity / offline | Static placeholder screens | RED | P1 |
| 21 | Local language (Marathi) | Partial in UI, full in AI prompts | YELLOW | P1 |
| 22 | Weather / environmental context | Zero implementation | RED | P1 |
| 23 | Surveillance trends | Backend trend analyzer exists | YELLOW | P1 |
| 24 | Alerts / notifications | FCM provider is a logger stub | BROKEN | P0 |

**PS#26128 Coverage: 5 of 24 requirements are fully functional today.**

---

## Mocks and Placeholders Inventory

| File | Problem | Priority |
|---|---|---|
| report_disease_page.dart | Button: onPressed: () => context.pop() — no submission | P0 |
| outbreak_map_page.dart | Hardcoded text, no map library, Icon(Icons.map) | P0 |
| risk_zone_page.dart | Static hardcoded "High Risk Zone #1", no data | P0 |
| vet_outbreak_map_page.dart | "Oak Valley Farm", "Dr. Sarah Jenkins" — all static | P0 |
| DashboardService.java line 89 | 0L, — Active alerts placeholder comment in code | P0 |
| FirebaseNotificationProvider.java | Generates fake FCM ID, no real Firebase SDK | P0 |
| animal_passport_offline_state_page.dart | "Offline Animal Data Loaded" — static screen | P1 |
| my_animals_offline_state_page.dart | Static screen, no cached data | P1 |
| FeatureFlagsService.offlineSyncEnabled | Boolean set to true, no offline logic connected | P1 |
| RAG vector store | in-memory with no knowledge loaded | P2 |
| NOOP AI provider | Fallback provider produces nothing | P2 |

---

## What Must Be Built Next

### P0 — MUST BUILD (SIH Demo Critical)

**1. Wire the farmer disease report form to the backend API**
- report_disease_page.dart — Call POST /api/v1/disease-reports
- Capture GPS via geolocator (already in pubspec)
- Link to selected animal
- After submit — trigger outbreak detection

**2. Add QR library and wire the scan flow**
- Add qr_flutter + mobile_scanner to pubspec
- Farmer scans animal ear tag QR — opens AnimalPassportPage
- AnimalPassportPage calls real API — already wired, just needs scan trigger

**3. Government Command Dashboard**
- Add GOVERNMENT_OFFICER to UserRole enum
- New GovernmentDashboardController endpoint
- Returns: total cases, active outbreaks, high-risk villages, affected districts
- Simple Flutter screen reading real outbreak API data

**4. Replace map placeholders with real map widget**
- Add flutter_map (OpenStreetMap — free, no API key needed for demo)
- Plot outbreak cluster center points from GET /api/v1/disease/outbreaks
- Draw radius circles for each active cluster, color-coded by risk score

**5. Fix the active alerts count**
- DashboardService line 89: replace 0L with outbreakRepository.countByStatus(OutbreakStatus.ACTIVE)

**6. Wire notifications for demo**
- Minimum: when outbreak CRITICAL fires, show in-app banner to government user

### P1 — SHOULD BUILD

**7. Add district/taluka to disease reports**
- FarmerProfile already has taluka field (V22 migration) — use it in disease reports
- Group outbreaks by taluka for district-level view

**8. Government map with cluster visualization**
- Government dashboard shows active outbreaks on flutter_map
- Each outbreak = circle with radius, colored by risk level

**9. Vaccination gap integration into risk engine**
- Query animal_health_records WHERE record_type = 'VACCINATION' for animals in outbreak radius
- Calculate coverage percentage, add as 4th signal to calculateRiskScore()

**10. Weather signal (basic)**
- Call OpenWeatherMap free tier — humidity + rainfall for district lat/lng
- Feed into risk multiplier as 3rd signal

**11. Vet-to-lab referral (minimum viable)**
- Add lab_referrals table: animal_id, disease_suspected, lab_name, sample_type, status
- Simple "Refer to Lab" checkbox in vet medical record creation

**12. Complete Marathi localization**
- Audit all screens for missing l10n keys
- Ensure farmer-facing disease report form is fully in Marathi

### P2 — NICE TO HAVE

- RAG knowledge base (load actual livestock disease PDFs)
- Vaccination campaign management
- Farmer advisory broadcast
- Full offline with SQLite sync queue

---

## What VETRA Is Today

VETRA is a working livestock healthcare management application — not a surveillance system. The backend has a sophisticated outbreak detection engine, a proper disease report schema with PostGIS spatial indexing, and a high-quality AI clinical advisor. The Flutter frontend successfully implements animal registration, health record management, appointment booking, and a conversational AI assistant with proper guardrails. The core clinical loop (animal to health record to vet appointment to medical record) works end to end.

## What VETRA Needs to Become for SIH

VETRA needs three additions to satisfy PS#26128: (1) a wired farmer disease report that feeds the already-built backend outbreak engine, (2) a real map widget displaying actual cluster data from the already-built GeoJSON endpoint, and (3) a government-officer-facing dashboard showing district-level outbreak intelligence. The detection engine, the risk scoring, the AI system, and the data schema are already built. The problem is that the existing frontend surfaces are either placeholder screens or wired to stubs instead of the real APIs sitting in the backend.

---

## Final Scores

| Category | Score | Reason |
|---|---|---|
| SIH Problem-Solution Fit | 5/10 | Concept matches perfectly; implementation covers ~5 of 24 requirements end-to-end |
| Technical Completeness | 6/10 | Backend is strong; frontend has critical missing linkages |
| Early Warning Capability | 4/10 | Engine exists, no government sees the output |
| Government Readiness | 1/10 | No government role, no government dashboard, alerts count is 0L |
| Offline Readiness | 1/10 | Static placeholder screens only |
| AI Implementation | 8/10 | Best module in the project — guardrails, multi-language, context assembly are real |
| QR Passport | 4/10 | API works, no scan library, offline is fake |
| GIS / Outbreak Intelligence | 5/10 | Backend real, frontend is an icon |
| **Overall Current Readiness** | **4/10** | Strong backend, frontend surfaces need critical wiring |

---

## Ideal End-to-End Demo — Step by Step

| Step | Description | Status |
|---|---|---|
| 1 | Farmer opens app, scans animal ear tag QR | RED — No QR scanner |
| 2 | Animal Passport opens with full history | GREEN — Works if ID passed manually |
| 3 | Farmer reports health concern via form | RED — Submit does context.pop() |
| 4 | AI Advisor screens symptoms | GREEN — Works |
| 5 | Farmer submits disease report with GPS | RED — Not wired |
| 6 | Backend receives report, links to animal | GREEN — API is real |
| 7 | Outbreak detection engine evaluates | GREEN — Works |
| 8 | 3+ reports in 15km — cluster formed | GREEN — Works |
| 9 | Risk score calculated (MEDIUM/HIGH/CRITICAL) | YELLOW — 1-signal only |
| 10 | Vet receives notification | RED — FCM is a logger |
| 11 | Vet sees cluster on map | RED — Map is an icon |
| 12 | Vet confirms diagnosis — CONFIRMED status | GREEN — API works |
| 13 | Outbreak escalates — government alert | RED — No government dashboard |
| 14 | Government sees district map with clusters | RED — Does not exist |
| 15 | Government initiates response (vet team) | RED — Does not exist |
| 16 | Farmer receives advisory | RED — Does not exist |

**Steps currently working end-to-end: 5 of 16.**
**Steps broken at UI/wiring level (backend exists): 4 of 16.**
**Steps with no implementation at all: 7 of 16.**

---

## DO NOT BUILD YET

- Fargate / ALB cloud deployment — cold starts will kill the demo
- Advanced RAG with vector embeddings — RAG adds no visible demo value in the time available
- Full offline sync queue — too complex, too time-consuming, too little visible impact
- Competitor integrations — out of scope
- Blockchain animal traceability — not in PS#26128

---

> **Bottom Line:** VETRA's backend is doing real work that nobody can see. The sprint must focus on 3 things: QR scan — wire disease report submit — show outbreak on a real map. The government dashboard is the trophy that wins the hackathon.
