# VETRA Government Dashboard — UX Design Specification

**Document Version:** 1.0.0  
**Target Platform:** Web / Desktop Command Center (Chromium, Firefox, Safari desktop viewports $\ge$ 1280px, responsive to 768px)  
**Reference Design System:** [VETRA Government Dashboard Design System](file:///Users/0mrajput/Desktop/SIH/docs/gov-dashboard-design-system.md)  
**Domain Standard:** Smart India Hackathon 2026 Problem Statement SIH26128 (Livestock Health Intelligence & Early Outbreak Detection)

---

## 1. Design Direction

### 1.1 Product Philosophy: The Epidemiological Instrument Panel
Most public health and animal husbandry portals suffer from one of two design failures: they either present a cluttered wall of unprioritized CRUD tables or adopt the glossy, decorative aesthetics of consumer SaaS applications (neon purple gradients, floating glass cards, bubbly emojis, and circular donut gauges).

The VETRA Government Dashboard is designed on an **Epidemiological Instrument Panel** philosophy. It functions as a tactical command station for State and District Veterinary Officers, Epidemiologists, and Animal Husbandry Commissioners. Every visual element serves situational awareness, spatial comprehension, explainable risk scoring, and decisive biosecurity intervention.

### 1.2 Five Core Tenets
1. **Cartographic & Map-Anchored Authority:** Disease does not spread in uniform geometric circles. Outbreak risk is rendered via **continuous isopleth contour bands** (spatial-temporal kernel density surfaces) that fade outward from cluster centroids, reflecting real terrain, transmission velocity, and livestock density.
2. **Dual-Typographic Rigor:** Standard UI copy, labels, and analytical prose use **Inter** (clean, institutional legibility). Every operational metric—risk scores, GPS coordinates, timestamps, case counts, and case IDs—uses **JetBrains Mono / IBM Plex Mono**. Operational data reads like precision telemetry, not marketing copy.
3. **Restrained, Purpose-Specific Color Scale:** Only ten saturated color tokens exist across the entire interface. The structural foundation consists of deep cartographic navy (`#0E1A2B`), crisp clinical surfaces (`#FFFFFF`), and muted institutional slate (`#526074`). Consequently, active disease alerts and spatial risk bands are always the most visually prominent elements on screen.
4. **Explainable AI & Multi-Signal Transparency:** A risk score is never displayed in isolation as an arbitrary number. The 0–100 composite score is always accompanied by its four underlying mathematical vectors: **Cluster Density & Velocity (40%)**, **Vector Meteorological Risk (20%)**, **Historical Recurrence (20%)**, and **Herd Vaccination Immunity Gap (20%)**.
5. **The Five-Second Situational Awareness Test:** An officer glancing at any screen within the dashboard must instantly comprehend:
   - **What is happening?** (Specific disease condition and case velocity)
   - **Where?** (Administrative district, taluka, and exact GPS cluster)
   - **How serious?** (LOW, MEDIUM, HIGH, or CRITICAL risk rating)
   - **Why?** (Underlying multi-signal drivers)
   - **What action is required?** (Automated statutory ring-vaccination, quarantine perimeter, or clinical deployment)

---

## 2. Information Architecture

### 2.1 Navigation Model & Hierarchy
The dashboard employs a persistent **Cartographic Navy Sidebar Navigation (240px)** on the left, paired with an **Administrative Scope & Tactical Alert Top Bar (56px)** and a **Map/Workspace Canvas with Contextual Slide-out Drawer (380px)**.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [TOP BAR] Region: Maharashtra > Pune > Baramati [▾]  |  Active Alerts: 3 CRITICAL, 7 HIGH  |  Dr. V. Patil (Joint Dir)│
├──────────────┬──────────────────────────────────────────────────────────────────────────┬────────────────────────────┤
│ SIDEBAR      │ WORKSPACE / PRIMARY GIS CANVAS                                           │ CONTEXTUAL DRAWER          │
│ (240px)      │                                                                          │ (380px, collapsible)       │
│              │                                                                          │                            │
│ ▤ Overview   │                                                                          │                            │
│ ▤ GIS Map    │                                                                          │                            │
│ ▤ Outbreaks  │                                                                          │                            │
│ ▤ Analytics  │                                                                          │                            │
│ ▤ Reports    │                                                                          │                            │
│ ▤ Vaccines   │                                                                          │                            │
│ ▤ Alerts     │                                                                          │                            │
│ ▤ Labs       │                                                                          │                            │
│ ▤ Protocols  │                                                                          │                            │
└──────────────┴──────────────────────────────────────────────────────────────────────────┴────────────────────────────┘
```

### 2.2 Route Structure & Information Topology
```
/gov/
├── overview              # Command Overview (Tactical summary, active clusters, intervention queue)
├── surveillance-map      # Live GIS Surveillance (Full-screen GIS, contour layers, filters, cluster inspection)
├── outbreaks             # Outbreak Intelligence (Cluster list, velocity trends, multi-signal breakdown)
│   └── :outbreakId       # Deep Outbreak Investigation (Isochrone spread, ring vaccination, case timeline)
├── analytics             # Epidemiological Analytics (District heatmaps, multi-signal radar, R0 velocity)
├── field-reports         # Surveillance Field Reports (Live telemetry feed, farmer vs vet submissions)
│   └── :reportId         # Report Clinical Dossier (Symptoms, GPS tag, AI scan audit, lab requisition)
├── vaccination           # Vaccination Coverage & Immunity Gaps (Cold chain, block-level herd immunity)
├── alerts                # Critical Events & Advisory Dispatch (Threshold breaches, automated SMS/FCM broadcast)
├── laboratory            # Diagnostic Lab Integration (Sample accessioning, PCR/ELISA confirmation logs)
└── settings              # Administrative Settings & Biosecurity Protocols
```

---

## 3. User Roles & Permission Matrix

| Role | Operational Scope | Permissions & Capabilities | Primary Action Focus |
|---|---|---|---|
| **State Epidemiological Director** | Statewide (Maharashtra) | Full statewide surveillance visibility; issue state containment orders; configure multi-signal risk thresholds; authorize regional livestock transit bans. | Strategic outbreak containment, statewide resource allocation. |
| **District Veterinary Officer (DVO)** | Single District (e.g., Pune) | District & taluka surveillance; dispatch field veterinarian rapid response teams; trigger targeted ring vaccination drives; review high-risk cluster reports. | Operational field response, local outbreak suppression. |
| **Taluka Livestock Development Officer (LDO)** | Single Block / Taluka | Block & village level surveillance; verify farmer field symptom reports; log on-site clinical diagnoses; monitor cold chain & vaccine stock. | Tactical field diagnosis, farmer symptom verification. |
| **Government Laboratory Pathologist** | Regional / State Diagnostic Labs | Upload PCR, ELISA, and culture test results; confirm or reject field presumptive cases; link diagnostic confidence source to existing case IDs. | Diagnostic confirmation, strain typing. |

---

## 4. Command Overview (Landing Experience)

### 4.1 Page Objective
The **Command Overview** is not a passive dashboard of vanity metrics. It serves as an active tactical command station presenting real-time spatial threats, containment progress, and high-priority pending actions.

### 4.2 Layout Grid (Top to Bottom)
1. **Administrative Context Header (56px):** State/District filter dropdown, last data sync timestamp (`2026-08-29 15:12:04 IST` in mono font), Live Telemetry Pulse indicator.
2. **Tactical KPI Strip (72px):** 4 restrained operational cards using monospace figures:
   - `ACTIVE OUTBREAKS`: `12` *(4 Critical, 5 High, 3 Medium)*
   - `CONFIRMED CASES (24H)`: `38` *(+6 from previous cycle)*
   - `SUSPECTED / UNVERIFIED`: `74` *(Awaiting vet verification)*
   - `IMMUNITY DEFICIT ZONES`: `4 Blocks` *(Vaccination coverage < 60%)*
3. **Split Main Operations Section (65% / 35%):**
   - **Left (65%) — Tactical GIS Overview:** Map preview with active isopleth risk contours, cluster markers sized by case volume, and quick layer toggles (*FMD, Lumpy Skin, Anthrax, Blackleg*).
   - **Right (35%) — Priority Action Queue & Alert Stream:**
     - **Intervention Queue:** Top 3 outbreaks requiring immediate administrative action (e.g., *"Ring vaccination unfulfilled in Baramati cluster"*).
     - **Real-Time Telemetry Feed:** Scrolling ticker of incoming disease reports tagged by time, village, and animal species.
4. **Bottom Surveillance Table (Full Width):** Summary list of top active clusters showing Disease Name, Center Village, Radius, Composite Risk Score, and Direct Investigation button.

### 4.3 ASCII Wireframe: Command Overview
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [VETRA GOV]  Surveillance Scope: [ Maharashtra State > Pune District ▾ ]   Sync: 15:14:02 IST [● LIVE]   Officer: DVO │
├──────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NAV]        │ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────────────────┐ │
│ ▤ Overview*  │ │ ACTIVE CLUSTERS  │ │ CONFIRMED (24H)  │ │ SUSPECTED CASES  │ │ CRITICAL VAX GAPS                  │ │
│ ▤ GIS Map    │ │ 12 (4 CRIT, 5 HI)│ │ 38  [+6 / 24h]   │ │ 74  [Awaiting Vet] │ │ 4 Talukas (<60% coverage)          │ │
│ ▤ Outbreaks  │ └──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────────────────────────┘ │
│ ▤ Analytics  ├───────────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│ ▤ Reports    │ TACTICAL SURVEILLANCE MAP                             │ HIGH-PRIORITY ACTION QUEUE                    │
│ ▤ Vaccines   │ ┌───────────────────────────────────────────────────┐ │ ┌───────────────────────────────────────────┐ │
│ ▤ Alerts     │ │ [Layer: FMD ▾] [Risk: ALL ▾] [Time: 7D ▾]         │ │ │ [!] CRITICAL: FMD CLUSTER #OB-4921        │ │
│ ▤ Labs       │ │                                                   │ │ │ Baramati, Pune · Score: 88 (CRITICAL)     │ │
│              │ │       (((( 88 ))))  <- Isopleth Contours          │ │ │ Action: Dispatch 500 ring vaccine doses   │ │
│              │ │         Baramati                                  │ │ │ [ Initiate Dispatch ] [ Review Cluster ]  │ │
│              │ │                                                   │ │ ├───────────────────────────────────────────┤ │
│              │ │                 (( 64 ))                          │ │ │ [▲] HIGH RISK: LSD ALERT #OB-4918         │ │
│              │ │                  Indapur                          │ │ │ Haveli, Pune · Score: 68 (HIGH)           │ │
│              │ │                                                   │ │ │ Action: Quarantine advisory to 14 villages│ │
│              │ │  [+] [-] [Fit Bounds]    Legend: ■ Conf ● Susp    │ │ │ [ Issue Advisory ]   [ View Dossier ]     │ │
│              │ └───────────────────────────────────────────────────┘ │ └───────────────────────────────────────────┘ │
│              ├───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│              │ RECENT SURVEILLANCE REPORTS & ANOMALIES                                                               │
│              │ Timestamp   Report ID    Disease / Suspected    Village & Taluka      Animals   Source     Status     │
│              │ 15:12:01    #REP-8821    Foot-and-Mouth (FMD)   Songaon, Baramati     6 Bovine  VET_CLINIC CONFIRMED  │
│              │ 15:08:44    #REP-8820    Lumpy Skin Disease     Loni Kalbhor, Haveli  2 Cattle  FARMER_APP SUSPECTED  │
│              │ 14:55:19    #REP-8819    Blackleg (BQ)          Malegaon, Baramati    1 Cattle  AI_SCAN    SUSPECTED  │
└──────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Live GIS Surveillance

### 5.1 Map Composition & Geospatial Mechanics
The GIS map is powered by Leaflet / MapLibre with a clean, low-contrast cartographic base map (Carto Positron or custom Vector Tiles) that does not clash with epidemiological layers.

### 5.2 The Signature Feature: Multi-Band Isopleth Risk Contours
Unlike generic dashboard maps that draw arbitrary circle radii, VETRA renders continuous risk surfaces derived from the `OutbreakDetectionEngine` spatial clustering algorithm:
- **Cluster Centroid:** Sized proportionally to total active case count ($\sqrt{\text{cases}} \times 6\text{px}$).
- **Tier 1 Inner Core (0–2 km):** 18% opacity of tier color (e.g., `#6E1423` for Critical).
- **Tier 2 Active Zone (2–5 km):** 12% opacity.
- **Tier 3 Buffer Zone (5–10 km):** 8% opacity.
- **Tier 4 Surveillance Perimeter (10–15 km):** 4% opacity with subtle dashed contour rule.
- **Contour Geometry:** Non-circular polygons calculated from spatial density distribution of contributing case coordinates, accounting for river barriers and transport corridors where data allows.

### 5.3 Point Marker Semantics (Accessibility-Compliant)
- **Confirmed Case:** Solid square marker (`#B7301F`, 8px, 1px white border) — indicates licensed veterinarian clinical diagnosis or laboratory confirmation.
- **Suspected Case:** Hollow diamond marker (`#D97B1F`, 9px, 2px border, transparent fill) — indicates unverified farmer symptom report or preliminary AI vision scan.
- *Dual-encoding ensures complete distinction for colorblind operators without relying on hue alone.*

### 5.4 Map Controls & Layer Panel
- **Administrative Region Selector:** Multi-level cascade (`State` $\rightarrow$ `District` $\rightarrow$ `Taluka` $\rightarrow$ `Village`).
- **Disease Filter Dropdown:** Select all or isolate specific diseases (*FMD, Lumpy Skin, Anthrax, Brucellosis, Blackleg, PPR*).
- **Risk Severity Filter:** Multi-select chips (*CRITICAL, HIGH, MEDIUM, LOW*).
- **Diagnosis Status Toggle:** *All, Confirmed Only, Suspected Only*.
- **Temporal Filter:** Slider / presets (*Last 24 Hours, 7 Days, 30 Days, Custom Window*).
- **Analytical Layer Toggles:**
  - `[x] Risk Contours`
  - `[x] Active Case Pins`
  - `[ ] Heatmap Density (KDE)`
  - `[ ] Veterinary Clinics & Responders`
  - `[ ] Livestock Market Yards (Transit Risk)`
  - `[ ] Vaccination Coverage Gradient`

### 5.5 ASCII Wireframe: Surveillance GIS
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [VETRA GOV]  GIS Surveillance Canvas   |   Scope: Pune District   |   Active Layers: Contours + Pins + Clinics       │
├──────────────┬──────────────────────────────────────────────────────────────────────────┬────────────────────────────┤
│ [NAV]        │ [ Filter: Disease: ALL ▾ ] [ Severity: CRITICAL+HIGH ▾ ] [ Window: 7D ▾ ]│ CLUSTER DOSSIER: #OB-4921  │
│ ▤ Overview   ├──────────────────────────────────────────────────────────────────────────┤ ────────────────────────── │
│ ▤ GIS Map*   │                                                                          │ Foot-and-Mouth Disease     │
│ ▤ Outbreaks  │                                  [Taluka: Haveli]                        │ Baramati Cluster, Pune     │
│ ▤ Analytics  │                                                                          │                            │
│ ▤ Reports    │                                                                          │ COMPOSITE RISK SCORE       │
│ ▤ Vaccines   │                                        (  ( 58 )  )                      │ 88 / 100 — CRITICAL        │
│ ▤ Alerts     │                                         LSD Cluster                      │ ────────────────────────── │
│ ▤ Labs       │                                                                          │ Cluster Strength:  38 / 40 │
│              │            ((((   88   ))))                                              │ Weather Factor:    18 / 20 │
│              │             FMD Core Cluster                                             │ History Factor:    14 / 20 │
│              │             Baramati                                                     │ Vaccine Gap:       18 / 20 │
│              │               ■ Confirmed (14)                                           │ ────────────────────────── │
│              │               ◇ Suspected (26)                                           │ Confirmed Cases:   14      │
│              │                                                                          │ Suspected Cases:   26      │
│              │                                                                          │ Total Animals:     58      │
│              │                                                                          │ Containment Radius:6.5 km  │
│              │                                                                          │ First Detected:    24h ago │
│              │                                                                          │ ────────────────────────── │
│              │                                                                          │ STATUTORY ACTION REQUIRED: │
│              │                                                                          │ Ring vaccine buffer: 6.5km │
│              │                                                                          │ Movement ban: 12 villages  │
│              │ [+] [-] [Recenter] [Export GeoJSON]  Scale: 1:50,000 | 5 km ───          │ [ Trigger Containment ]    │
└──────────────┴──────────────────────────────────────────────────────────────────────────┴────────────────────────────┘
```

---

## 6. Outbreak Intelligence (Cluster Detail & Explainability)

### 6.1 Explainable Multi-Signal Risk Decomposition
When an outbreak is selected, the system decomposes the risk score into its deterministic constitutive signals. The score is explicitly labeled as a **Calculated Risk Index (0–100)**, never as a generic "probability".

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│ OUTBREAK INTELLIGENCE DOSSIER: #OB-4921 — BARAMATI FMD CLUSTER                               │
│ Risk Level: CRITICAL (Score: 88 / 100)  |  Status: ACTIVE_SURVEILLANCE  |  Radius: 6.5 km    │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ MULTI-SIGNAL DECOMPOSITION & RISK VECTORS                                                    │
│                                                                                              │
│ Signal 1: Cluster Strength & Velocity (Weight: 40%)              Score: 38.0 / 40.0 pts      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      [ 95% of Max ]              │
│ 14 Confirmed (Vet/Lab) + 26 Suspected (Farmer) within 6.5 km. Velocity factor: 1.8x.         │
│                                                                                              │
│ Signal 2: Meteorological & Vector Transmission (Weight: 20%)     Score: 18.0 / 20.0 pts      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                [ 90% of Max ]              │
│ High transmission window: Temp 27.4°C, Humidity 84%, Wind 12 km/h ENE (Aerosol favorable).   │
│                                                                                              │
│ Signal 3: Historical Recurrence & Seasonality (Weight: 20%)      Score: 14.0 / 20.0 pts      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                            [ 70% of Max ]              │
│ 3 historical outbreaks recorded in Baramati block during August/September monsoon window.   │
│                                                                                              │
│ Signal 4: Herd Vaccination Immunity Deficit (Weight: 20%)        Score: 18.0 / 20.0 pts      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                [ 90% of Max ]              │
│ Block vaccination coverage at 42.1% (Critical Deficit < 60%). 428 susceptible bovine head.   │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ PLAIN LANGUAGE EPIDEMIOLOGICAL SYNTHESIS                                                     │
│ High-density foot-and-mouth aerosol cluster active across 4 adjoining dairy villages. High   │
│ ambient humidity combined with critically low herd vaccination creates imminent risk of      │
│ exponential spread along the Baramati-Indapur milk transit corridor.                         │
├──────────────────────────────────────────────────────────────────────────────────────────────┤
│ STATUTORY PROTOCOL & ACTION DISPATCH                                                         │
│ 1. Mandatory ring vaccination of all cloven-hoofed livestock within 6.5 km perimeter.        │
│ 2. Temporary suspension of Songaon weekly livestock market.                                 │
│ 3. Automated SMS biosecurity broadcast to 1,240 registered dairy farmers in 12 villages.     │
│                                                                                              │
│ [ Dispatch Ring Vaccine Team ]   [ Issue Transit Advisory ]   [ Export Formal Situation Memo]│
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Disease Analytics

### 7.1 Analytical Charts & Operational Purpose
Every analytical widget in the VETRA Command Center directly supports resource allocation and outbreak containment. Decorative charts with no tactical purpose are strictly omitted.

1. **Epidemic Curve (Epi-Curve):** Stacked bar chart showing Daily Cases over 30/60/90 days, stacked by `Confirmed` (dark red) and `Suspected` (amber outline). Overlaid with a 7-day moving average trendline.
2. **Diagnostic Confidence Distribution:** Horizontal bar chart comparing diagnostic sources: `AI_VERIFIED`, `VETERINARIAN`, `LAB_CONFIRMED`, and `GOVERNMENT`.
3. **District & Taluka Risk Comparative Table:** Dense sorting grid of all 36 districts of Maharashtra, reporting Active Clusters, Affected Cattle/Buffalo/Sheep/Goats, Vaccination Gap %, and Composite Threat Score.
4. **Disease Taxonomy Breakdown:** Proportional distribution of active caseload (*Foot-and-Mouth Disease, Lumpy Skin Disease, Blackleg, Anthrax, PPR, Brucellosis, Hemorrhagic Septicemia*).
5. **Effective Spread Velocity ($R_t$ Proxy):** Monospace numerical readout and 14-day trend vector indicating whether cluster generation is expanding ($R_t > 1.0$), plateauing ($R_t \approx 1.0$), or contained ($R_t < 1.0$).

### 7.2 ASCII Wireframe: Analytics Page
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [VETRA GOV]  Epidemiological Analytics   |   Scope: Maharashtra Statewide   |   Period: Last 30 Days                 │
├──────────────┬───────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [NAV]        │ EPIDEMIC CASE VELOCITY (EPI-CURVE)                             DISEASE DISTRIBUTION & CASE LOAD       │
│ ▤ Overview   │ ┌────────────────────────────────────────────────────────────┐ ┌─────────────────────────────────────┐ │
│ ▤ GIS Map    │ │ Cases/Day                                                  │ │ Foot-and-Mouth Disease:  ████ 44%   │ │
│ ▤ Outbreaks  │ │ 50│                                    ■ Confirmed         │ │ Lumpy Skin Disease:      ███  31%   │ │
│ ▤ Analytics* │ │ 40│                          ██        ◇ Suspected         │ │ Blackleg (BQ):           █    12%   │ │
│ ▤ Reports    │ │ 30│                 ██  ██   ██                            │ │ Anthrax:                 █     7%   │ │
│ ▤ Vaccines   │ │ 20│        ██   ██  ██  ██   ██                            │ │ Brucellosis:             ▌     4%   │ │
│ ▤ Alerts     │ │ 10│  ██    ██   ██  ██  ██   ██                            │ │ PPR (Small Ruminants):   ▌     2%   │ │
│ ▤ Labs       │ │  0└──────────────────────────────────                      │ └─────────────────────────────────────┘ │
│              │ │   01-Aug   08-Aug   15-Aug   22-Aug   29-Aug               │ DIAGNOSTIC CONFIDENCE MATRIX          │
│              │ │   Mean R_t Velocity: 1.42 (Expanding)                      │ ┌─────────────────────────────────────┐ │
│              │ └────────────────────────────────────────────────────────────┘ │ VET_CLINICAL:  ██████████ 52% (148)  │ │
│              │ DISTRICT SURVEILLANCE & THREAT RANKING                         │ AI_PRELIM:     █████      28% (80)   │ │
│              │ District       Active Clusters  Confirmed  Suspected  Vax Gap  │ LAB_CONFIRMED: ███        14% (40)   │ │
│              │ 1. Pune               4 (2 CRIT)       38         74     42%   │ GOV_OFFICIAL:  █           6% (18)   │ │
│              │ 2. Ahmednagar         3 (1 CRIT)       24         41     38%   └─────────────────────────────────────┘ │
│              │ 3. Nashik             2 (1 CRIT)       19         33     29%                                           │
│              │ 4. Satara             2 (0 CRIT)       11         22     18%   [ Export ICAR/NADRES Monthly Report ]   │
│              │ 5. Solapur            1 (0 CRIT)        8         14     22%   [ Export Epidemiological Bulletin (PDF)]│
└──────────────┴───────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Field Reports & Surveillance Ingestion

### 8.1 Operational Table Structure
The Field Reports page acts as the operational audit ledger for incoming livestock health reports from farmers, field veterinarians, and AI triage scans.

| Column Name | Header Token | Format / Face | Filter / Sort Capabilities | Example Cell Content |
|---|---|---|---|---|
| **Timestamp** | `DATE / TIME` | Mono 12px | Sortable (Default DESC) | `2026-08-29 15:12:01` |
| **Report ID** | `REPORT ID` | Mono 12px, `text-secondary` | Search by ID prefix | `#REP-8821` |
| **Animal Tag / Breed** | `LIVESTOCK` | Inter 13px + Sub-label | Filter by Species | `TAG-MH-9812` · Murrah Buffalo |
| **Suspected Condition**| `DISEASE / CONDITION` | Inter 13px, 600 | Filter by Disease catalog | Foot-and-Mouth Disease |
| **Diagnosis Status** | `DIAGNOSIS` | Badge 12px (Solid/Outline) | Filter: `CONFIRMED`, `SUSPECTED` | `[● CONFIRMED]` (Vet Verified) |
| **Confidence Source** | `CONFIDENCE SOURCE` | Mono 11px, `text-secondary` | Filter: Source enum | `VETERINARIAN` |
| **Location (Admin)** | `VILLAGE / TALUKA` | Inter 13px | Multi-select Taluka filter | Songaon, Baramati (Pune) |
| **Coordinates** | `GPS LOCATION` | Mono 12px | Click to center on GIS | `18.1512° N, 74.5781° E` |
| **Actions** | `ACTION` | Button (Outline) | — | `[ Inspect Dossier ]` |

### 8.2 Bulk Operations & Verification Actions
- **Bulk Verify Reports:** Allows a DVO to select multiple suspected farmer reports with matching symptom profiles and assign them to an on-duty field veterinarian for rapid physical audit.
- **Export Filtered Ledger:** Generates an official CSV/Excel ledger compliant with Department of Animal Husbandry & Dairying (DAHD) formatting requirements.

---

## 9. Vaccination Monitoring & Immunity Deficit Intelligence

### 9.1 Block-Level Herd Immunity Analytics
Outbreak risk is inversely proportional to herd immunity. The Vaccination Monitoring module integrates data from the existing VETRA animal registry and prescription/vaccination records to identify regional vulnerability pockets before outbreaks occur.

### 9.2 Key Metrics & Spatial Layers
- **Effective Coverage Percentage:** Ratio of vaccinated to total registered eligible livestock head in each administrative block.
  - $\ge 80\%$: `Adequate Immunity` (`#3E7C4A` Forest Green)
  - $60\% - 79\%$: `Moderate Deficit` (`#C9A227` Ochre Gold)
  - $< 60\%$: `Critical Deficit / High Outbreak Vulnerability` (`#B7301F` Brick Red)
- **Vaccine Cold Chain & Stock Visibility:** Real-time stock levels of mandatory state vaccines (*FMD Oil-adjuvant, Lumpy Skin homologous, Anthrax Spore, HS+BQ combined*) across government veterinary dispensaries and mobile clinics.
- **Ring Vaccination Tracker:** Interactive tracking gauge for active outbreak perimeters showing:
  - Total Target Population within Buffer: `1,450 Head`
  - Immunized to Date: `980 Head (67.5%)`
  - Outstanding Doses Required: `470 Head`

---

## 10. Alerts & Critical Events

### 10.1 Priority Hierarchy & Presentation Rules
Alerts in VETRA are never hidden behind a passive bell notification dropdown. Critical alerts represent active biosecurity breaches and occupy a persistent **Right-hand Tactical Rail** on desktop or a **High-Visibility Sticky Banner** when viewing relevant administrative sectors.

### 10.2 Four-Tier Alert Classification
1. **CRITICAL ALERT (Tier 1 — `#6E1423` / `#B7301F`):**
   - *Trigger:* Spatial cluster reaches `CRITICAL` risk threshold ($\ge 80$ pts), or a suspected Anthrax / Notifiable Disease case is logged.
   - *Visual Treatment:* Solid 4px left border, light surface background, prominent mono timestamp, and a gentle single 2-second opacity pulse on arrival (disabled if `prefers-reduced-motion` is active).
   - *Mandatory Information:* Disease, exact village, computed radius, affected herd size, and a 1-click **"Initiate Containment Protocol"** button.
2. **HIGH RISK WARNING (Tier 2 — `#D97B1F`):**
   - *Trigger:* Cluster risk score 55–79 pts, or rapid case velocity ($\ge 5$ new cases within 24 hours in a 10 km radius).
3. **MODERATE ADVISORY (Tier 3 — `#C9A227`):**
   - *Trigger:* Adverse meteorological vector conditions (e.g., peak vector temperature/humidity forecast) coupled with low vaccination coverage.
4. **INFORMATIONAL UPDATE (Tier 4 — `#1E5C97`):**
   - *Trigger:* Completed ring vaccination drive, resolved cluster archived, or lab test result upload.

---

## 11. Laboratory Integration Concept (Integration-Ready Architecture)

### 11.1 Defensible, Non-Fabricated Scope
In accordance with system specifications, VETRA does not invent arbitrary laboratory workflows. It provides an **Integration-Ready Verification Bridge** connecting field disease surveillance reports to state veterinary diagnostic laboratories (e.g., Disease Investigation Section, Pune / ICAR-NIVEDI).

### 11.2 Data Elements & UI Manifest
- **Sample Accession Number:** Unique laboratory sample barcode (e.g., `LAB-PN-2026-0941`).
- **Linked Disease Report ID:** Direct link to the initiating field surveillance report (`#REP-8821`).
- **Specimen Type:** Blood / Serum, Nasal Swab, Vesicular Fluid, Tissue Biopsy, Milk.
- **Diagnostic Assay:** Real-time RT-PCR, Antigen ELISA, Serum Neutralization Test (SNT), Giemsa Staining.
- **Assay Result:** `POSITIVE`, `NEGATIVE`, `INCONCLUSIVE`, `AWAITING_ANALYSIS`.
- **Confirmed Pathogen / Strain:** e.g., *Foot-and-Mouth Disease Virus — Serotype O (Ind2001 lineage)*.
- **Verification Impact on Surveillance Engine:** When a lab result is marked `POSITIVE`, the linked `DiseaseReport.diagnosisStatus` automatically upgrades from `SUSPECTED` to `CONFIRMED`, and `diagnosisConfidenceSource` updates to `LAB_CONFIRMED`, immediately triggering recalculation of the cluster's composite risk score.

---

## 12. Design System Application & Token Mapping

### 12.1 Color Tokens
```css
/* Structural Palette (Cartographic Navy & Clinical Slate) */
--color-nav-bg:            #0E1A2B;
--color-nav-text:          #9FB1C4;
--color-nav-text-active:   #F4F7FA;
--color-workspace-bg:      #F6F8FA;
--color-surface:           #FFFFFF;
--color-border:            #E1E6EC;
--color-border-strong:     #C7D0DB;
--color-text-primary:      #101826;
--color-text-secondary:    #526074;
--color-text-muted:        #93A1B0;

/* Muted Institutional Accent */
--color-accent:            #1E5C97;
--color-accent-hover:      #164A7C;
--color-accent-subtle:     #E4EDF6;

/* Epidemiological Risk Scale (4-Tier Backend Aligned) */
--color-risk-critical:     #6E1423; /* Oxblood / Terminal Severity */
--color-risk-high:         #D97B1F; /* Amber-Orange */
--color-risk-medium:       #C9A227; /* Ochre Gold */
--color-risk-low:          #3E7C4A; /* Forest Green */

/* Point Semantics */
--color-case-confirmed:    #B7301F; /* Solid square */
--color-case-suspected:    #D97B1F; /* Hollow diamond */
```

### 12.2 Typography Scale
- **UI & Content Font:** `Inter`, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif.
- **Operational Data & Metrics Font:** `JetBrains Mono`, `IBM Plex Mono`, monospace (with `font-variant-numeric: tabular-nums`).

| Role | Font Family | Size | Weight | Line Height | Tracking | Use Case |
|---|---|---|---|---|---|---|
| `Page Title` | Inter | 20px | 600 | 28px | -0.01em | Top-level view headings |
| `Section Header` | Inter | 16px | 600 | 24px | 0 | Module and panel headers |
| `Panel / Card Label` | Inter | 13px | 600 | 18px | +0.02em | Uppercase card labels |
| `Body Standard` | Inter | 14px | 400 | 22px (1.6x) | 0 | Analytical notes, synthesis |
| `Table Text` | Inter | 13px | 400 | 18px | 0 | Disease names, village names |
| `Table Numeric` | Mono | 13px | 400 | 18px | 0 | Case counts, percentages |
| `Risk Score Display`| Mono | 30px | 500 | 36px | -0.02em | Large cluster threat numeral |
| `Data Metadata` | Mono | 12px | 400 | 16px | 0 | GPS coordinates, timestamps |

### 12.3 Component Geometry & Spacing
- **Base Grid Unit:** 8px rhythm (padding: 8px, 16px, 24px, 32px).
- **Border Radius:**
  - `radius-sm`: 2px (Badges, risk indicators).
  - `radius-md`: 4px (Buttons, text inputs, table headers).
  - `radius-lg`: 6px (Panels, modal dialogs, map containers).
  - *No pill-shaped cards or bubbly 20px+ radii permitted.*
- **Border Treatment:** 1px solid `var(--color-border)`. Elevation is communicated via clean tonal border layering rather than heavy drop shadows (`box-shadow: 0 1px 2px rgba(16, 24, 38, 0.04)` maximum).

---

## 13. Responsive Behavior

### 13.1 Breakpoint System
- **Large Command Display ($\ge 1440\text{px}$):** Standard layout. 240px sidebar, 60% GIS canvas, 40% telemetry/action drawer.
- **Standard Desktop ($1024\text{px} - 1439\text{px}$):** 200px collapsed sidebar, 50% GIS canvas, 50% panel with drawer collapsing to overlay modal on outbreak selection.
- **Tactical Field Tablet ($768\text{px} - 1023\text{px}$):** Sidebar collapses to compact 56px icon rail. Map and summary cards stack vertically. Contextual drawer opens as full-width slide-up bottom sheet (50vh).
- **Mobile Handheld ($< 768\text{px}$):** Optimized for field read-only tactical inspection. Navigation converts to top mobile header with slide-over hamburger drawer. Map maintains minimum 300px touch-interactive height with fixed bottom action sheet.

---

## 14. Accessibility & Inclusive Design (WCAG 2.2 Level AA)

1. **Color Independence & Dual Coding:**
   - Outbreak risk tiers are communicated by both color and explicit textual labels (e.g., `[88 CRITICAL]`).
   - Confirmed vs Suspected cases are distinguished by shape (Square vs Diamond) as well as color.
   - Contrast ratio for all body text exceeds **4.8:1** against surface backgrounds; large display risk scores exceed **7:1**.
2. **Keyboard Navigation & Visible Focus States:**
   - Full keyboard accessibility across map controls, filters, table rows, and action triggers.
   - Distinct, non-overlapping focus ring: `2px solid var(--color-accent)` with `2px offset` using `var(--color-accent-subtle)`.
3. **Motion & Vestibular Safety:**
   - System respects `@media (prefers-reduced-motion: reduce)`.
   - All hover transitions and new-alert pulses are immediately disabled when reduced motion is preferred.

---

## 15. Interaction Specifications

### 15.1 Administrative Geographic Cascade
1. User clicks **Administrative Scope** selector in top bar.
2. Searchable dropdown presents Maharashtra districts with active cluster counts badge.
3. Selecting `Pune District` immediately recenters GIS viewport, recalculates summary KPI metrics for Pune, and filters Field Reports and Outbreak lists to the district boundary.

### 15.2 Outbreak Cluster Selection & Deep Inspection
1. User clicks either an isopleth cluster on the GIS map or an outbreak row in the intelligence list.
2. The map smoothly animates bounds to frame the cluster perimeter with 20% outer padding.
3. The right-hand **Contextual Intelligence Drawer (380px)** slides out, presenting the complete 4-signal decomposition, weather telemetry, and recommended action buttons.
4. Esc key or clicking the canvas closes the drawer and restores full map visibility.

### 15.3 Alert Acknowledgment & Containment Dispatch
1. Clicking **"Initiate Containment Protocol"** on a Critical Alert opens a structured confirmation modal.
2. The modal pre-fills calculated statutory requirements: Target buffer radius (`6.5 km`), estimated eligible animals (`1,450`), and designated local veterinary clinic.
3. Confirming the dispatch triggers an automated API call, logs the action in the government audit ledger, and transitions the alert badge to `DISPATCHED_IN_PROGRESS`.

---

## 16. Real Backend Data Mapping

| UI Component / View | Existing VETRA Backend Endpoint | Response DTO & Fields Consumed |
|---|---|---|
| **KPI Strip: Active Clusters** | `GET /api/v1/disease/outbreaks/statistics` | `OutbreakStatisticsResponse.activeOutbreaks`, `highRiskOutbreaks` |
| **KPI Strip: High Risk Outbreaks**| `GET /api/v1/disease/outbreaks/high-risk` | `List<OutbreakResponse>` where `riskScore IN ('HIGH', 'CRITICAL')` |
| **GIS Map: Active Outbreak Layer**| `GET /api/v1/disease/outbreaks/geojson` | `GeoJsonFeatureCollection` (RFC 7946 Polygon & Point features) |
| **GIS Map: Spatial Heatmap** | `GET /api/v1/disease/outbreaks/heatmap` | `List<HeatmapPoint>` (`latitude`, `longitude`, `weight`) |
| **Outbreak Multi-Signal Detail** | `GET /api/v1/disease/outbreaks/{id}` | `OutbreakResponse` (`compositeRiskScore`, `riskBreakdown`, `clusterScore`, `weatherScore`, `historyScore`, `vaccinationGapScore`, `riskExplanation`, `recommendedAction`) |
| **Outbreak Contributing Cases** | `GET /api/v1/disease/outbreaks/{id}/reports`| `List<DiseaseReportResponse>` (`tagNumber`, `animalName`, `diseaseName`, `diagnosisStatus`, `latitude`, `longitude`, `createdAt`) |
| **Field Reports Table** | `GET /api/v1/disease/reports` | `Page<DiseaseReportResponse>` (`id`, `diseaseName`, `diagnosisStatus`, `diagnosisConfidenceSource`, `reportedByName`, `latitude`, `longitude`, `createdAt`) |
| **Disease Analytics & Trends** | `GET /api/v1/disease/analytics` | `DiseaseAnalyticsResponse` (`totalOutbreaks`, `diseaseDistribution`, `reportsByConfidenceSource`, `averageResolutionTimeHours`) |
| **Disease Taxonomy Catalog** | `GET /api/v1/disease/registry` | `List<DiseaseMetadata>` (`diseaseName`, `speciesAffected`, `transmissionType`, `seasonalPeakMonth`, `vaccineAvailable`) |

---

## 17. Backend Capabilities & Gaps Identified

### 17.1 Supported Out of the Box
- Spatial-temporal outbreak cluster detection via `OutbreakDetectionEngine`.
- RFC 7946 GeoJSON export (`/api/v1/disease/outbreaks/geojson`) and normalized KDE heatmap datasets (`/api/v1/disease/outbreaks/heatmap`).
- Multi-Signal Risk Engine with 4-signal breakdown (`RiskBreakdownResponse`).
- Paginated field reports with geographic radius proximity queries (`/api/v1/disease/reports/nearby`).
- Diagnostic confidence source tracking (`AI_VERIFIED`, `VETERINARIAN`, `LAB_CONFIRMED`, `GOVERNMENT`).

### 17.2 Backend Extensions Recommended for Production Phase
1. **Administrative Geometry Endpoints:** A dedicated endpoint `GET /api/v1/geo/boundaries?level=DISTRICT&state=Maharashtra` to serve official taluka/district GeoJSON boundary polygons for administrative clipping.
2. **Dedicated Vaccination Stock Registry:** An endpoint `GET /api/v1/vaccination/inventory?districtId={id}` to fetch live state cold chain inventory metrics.
3. **Laboratory Sample Webhook/API:** Endpoints `POST /api/v1/lab/samples` and `PUT /api/v1/lab/samples/{id}/results` to formalize third-party laboratory LIMS data ingestion.

---

## 18. Architectural & UX Design Rationale

1. **Why Isopleth Contours over Fixed Radius Circles?**  
   Livestock pathogens (e.g., FMD virus aerosol transmission or LSD insect vectors) do not disperse in uniform geometric circles. Wind direction, river valleys, and road corridors distort transmission surfaces. Rendering multi-tier isopleth contours derived from Kernel Density Estimation accurately conveys spatial gradient and uncertainty to decision-makers.
2. **Why Separate Sans and Monospace Faces?**  
   Public health dashboards handle high cognitive loads during crisis events. Presenting operational numerals (coordinates, IDs, case numbers, threat scores) in a monospace face enforces tabular alignment, reduces reading errors under stress, and creates an unambiguous visual separation between qualitative descriptions and quantitative facts.
3. **Why Terminal Oxblood Maroon for Critical Severity?**  
   Bright neon red creates visual exhaustion when multiple alerts trigger simultaneously. Using deep oxblood (`#6E1423`) for critical severity establishes an authoritative, serious terminal tier that commands immediate operational attention without overpowering secondary interface elements.

---

## 19. Anti-Patterns Explicitly Avoided

- ❌ **No Purple Gradients or Neon Highlights:** Replaced by cartographic navy and clinical slate.
- ❌ **No Glassmorphism or Background Blurs:** Replaced by crisp, solid `#FFFFFF` cards with 1px hairline borders.
- ❌ **No Excessive 20px+ Rounded Cards:** Standardized on functional 2px–6px structural geometry.
- ❌ **No Emojis or Playful Iconography:** Replaced by Lucide/Feather-style precise epidemiological and operational glyphs.
- ❌ **No Fake AI Aesthetics:** No glowing sparkles or black-box probability claims; risk is fully explained via 4 explicit mathematical signals.
- ❌ **No Decorative Donut Charts:** Replaced by linear proportion bars and stacked epi-curves with exact numerical data.
- ❌ **No Consumer Health App Conventions:** Built strictly as a professional government surveillance and decision-support command center.

---

## 20. Implementation Handoff Notes (For Frontend Web Engineer)

1. **Framework & Stack Recommendation:**  
   - Core: React 18+ / Next.js or Vite with TypeScript.
   - Styling: Vanilla CSS / CSS Modules utilizing the exact custom property token names defined in Section 12.
   - Mapping: Leaflet (`react-leaflet`) or MapLibre GL with Carto Positron vector tiles.
   - Charts: Chart.js or Recharts with custom monospace tooltips and tabular number formatting.
2. **State Management & Querying:**  
   - Use TanStack Query (React Query) for caching and background revalidation of `/api/v1/disease/outbreaks` and `/api/v1/disease/reports`.
   - Polling interval: 30 seconds for live telemetry; immediate refetch on administrative scope change.
3. **Token Compliance:**  
   - Ensure all numerical table columns use CSS `font-family: 'JetBrains Mono', 'IBM Plex Mono', monospace` and `font-variant-numeric: tabular-nums; text-align: right;`.
   - All color codes must reference CSS variables defined in `docs/gov-dashboard-design-system.md`.
