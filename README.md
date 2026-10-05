<div align="center">

<img src="government-dashboard/public/pashu-sathi-logo.png" alt="Pashu Sathi" width="150"/>

# Pashu Sathi · पशु साथी

**Animal healthcare, veterinary telemedicine and outbreak surveillance — from the farm gate to the state command room.**

Smart India Hackathon 2026 · Problem Statement **#26128** · MedTech

[![Flutter](https://img.shields.io/badge/Flutter-Mobile-02569B?style=flat-square&logo=flutter&logoColor=white)](frontend/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)](backend/)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](backend/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](government-dashboard/)
[![PostGIS](https://img.shields.io/badge/PostgreSQL-PostGIS-4169E1?style=flat-square&logo=postgresql&logoColor=white)](backend/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white)](backend/)

[Problem](#the-problem) · [Solution](#the-solution) · [Architecture](#architecture) · [Features](#features) · [Monorepo](#monorepo) · [Quick start](#quick-start) · [Docs](#documentation)

</div>

---

## The problem

Rural India loses over **₹25,000 crore a year** to preventable livestock disease. Outbreaks of Lumpy Skin Disease and Foot-and-Mouth Disease travel across district lines during a **7–14 day detection lag**, because reporting still runs on paper and veterinary access is thin — roughly one vet for every 10,000+ animals.

## The solution

Pashu Sathi connects **farmers**, **licensed veterinarians** and **government officers** on a single platform.

| | Capability | How |
| :-: | :--- | :--- |
| 🎙️ | **Vernacular, offline-first reporting** | Voice and camera reporting in English, Hindi, Marathi and Urdu; queued locally and synced on reconnect |
| 🩺 | **Human-in-the-loop triage** | AI lesion pre-screening, always verified by a licensed vet before any alert goes public |
| 📍 | **Spatial outbreak engine** | PostGIS clustering of verified cases within 25 km over a 48-hour window, scored by a 4-signal risk model |
| 🪪 | **Digital animal passport** | QR identity carrying pedigree, vaccination and treatment history |
| 🏛️ | **Government command centre** | Live GIS heatmaps, containment directives and one-click SitRep exports |

---

## Architecture

<div align="center">
<img src="backend/system_architecture.svg" alt="Pashu Sathi system architecture" width="100%"/>
</div>

| Tier | Components |
| :--- | :--- |
| **Clients** | Flutter mobile app (farmers, paravets, vets) · React command dashboard (government officers) |
| **API** | Spring Boot 3.5 on Java 21 · stateless JWT with RBAC (`FARMER`, `VETERINARIAN`, `ADMIN`, `GOVERNMENT_OFFICER`) |
| **Intelligence** | Outbreak detection engine · pluggable AI gateway (RAG, vision screening, circuit-breaker fallback) · FCM notifications |
| **Data** | PostgreSQL + PostGIS (Flyway-managed schema) · Redis cache and token denylist · S3 object storage |
| **Infra** | Docker · Terraform modules for AWS (VPC, ECS, ECR, RDS, Redis, IAM, monitoring) |

### From sick animal to containment

<div align="center">
<img src="backend/sih_flowchart.svg" alt="Outbreak detection flowchart" width="440"/>
</div>

1. **Capture** — a farmer or paravet logs symptoms by voice or photo; GPS is attached automatically.
2. **Pre-screen** — the AI pipeline suggests a suspected condition (FMD, LSD, Brucellosis…).
3. **Verify** — a licensed vet confirms or rejects the case, so rumours never become alerts.
4. **Cluster** — confirmed cases within 25 km over 48 hours are grouped with PostGIS.
5. **Score** — a 0–100 risk index combines case velocity, weather anomaly, historical recurrence and vaccine gap.
6. **Respond** — above the threshold, a containment zone appears on the dashboard and ring-vaccination directives go out as push notifications.

---

## Features

<table>
<tr>
<th width="33%">📱 Mobile app</th>
<th width="33%">⚙️ Backend</th>
<th width="34%">🖥️ Government dashboard</th>
</tr>
<tr valign="top">
<td>

- Voice AI advisor in 4 languages
- Camera lesion scanner
- QR animal passport
- Offline reporting queue
- Telemedicine and e-prescriptions
- Mortality reporting

</td>
<td>

- PostGIS outbreak clustering
- Multi-signal risk scoring
- Pluggable AI gateway (Gemini, DeepSeek, no-op fallback)
- Vaccination campaigns and drives
- Mortality audit and economic impact
- FCM push notifications

</td>
<td>

- Live Leaflet surveillance map
- State → District → Taluka → Village filters
- Outbreak intelligence and analytics
- Alerts and containment directives
- Laboratory, workforce and vaccination views
- CSV SitRep export

</td>
</tr>
</table>

**Languages:** English · हिंदी · मराठी · اردو

---

## Monorepo

| Package | Stack | Description |
| :--- | :--- | :--- |
| [`frontend/`](frontend/) | Flutter, Dart, Riverpod, SQLite | Farmer, paravet and vet mobile app |
| [`backend/`](backend/) | Spring Boot 3.5, Java 21, PostgreSQL/PostGIS, Redis | REST API, outbreak engine, AI gateway, infra |
| [`government-dashboard/`](government-dashboard/) | React 18, TypeScript, Vite, Tailwind, Leaflet | Surveillance and command web app |
| [`docs/`](docs/) | Markdown | SIH analysis, architecture reports, design systems |

```
pashu-sathii/
├── frontend/              # Flutter app: lib/core, lib/features, lib/l10n
├── backend/               # Spring Boot API: src/main/java/app/vetra/{auth,animal,disease,ai,...}
│   ├── src/main/resources/db/migration/   # Flyway migrations
│   ├── infra/             # Terraform modules (AWS)
│   └── docker-compose.yml # Local PostgreSQL/PostGIS + Redis
├── government-dashboard/  # React app: src/pages, src/components
└── docs/                  # SIH, architecture and design documentation
```

---

## Quick start

**Prerequisites:** JDK 21, Node.js 20+, Flutter SDK (Dart 3.7+), Docker.

**1 · Infrastructure**
```bash
cd backend && docker-compose up -d     # PostgreSQL + PostGIS, Redis
```

**2 · Backend** — [`http://localhost:8080`](http://localhost:8080)
```bash
cd backend
cp .env.example .env
./mvnw spring-boot:run
```
Swagger UI at `/swagger-ui.html` · health at `/actuator/health`

**3 · Government dashboard** — [`http://localhost:3000`](http://localhost:3000)
```bash
cd government-dashboard
cp .env.example .env
npm install && npm run dev
```

**4 · Mobile app**
```bash
cd frontend
flutter pub get && flutter run
```

**Run the tests**
```bash
cd backend && ./mvnw test
cd government-dashboard && npm test
cd frontend && flutter test
```

---

## Documentation

| Topic | Where |
| :--- | :--- |
| Backend setup, API and deployment | [`backend/README.md`](backend/README.md) · [`backend/DEPLOYMENT.md`](backend/DEPLOYMENT.md) |
| Mobile app | [`frontend/README.md`](frontend/README.md) |
| SIH PS #26128 analysis and case study | [`docs/sih/`](docs/sih/) |
| Architecture reports | [`docs/architecture/`](docs/architecture/) |
| Dashboard design system | [`docs/gov-dashboard-design-system.md`](docs/gov-dashboard-design-system.md) |

---

## Responsible AI

AI in Pashu Sathi is an **assistive triage aid**. No quarantine or movement restriction is issued without verification by a licensed veterinarian.

<div align="center">

**Smart India Hackathon 2026 · PS #26128**
*Empowering farmers · Protecting livestock · Stopping outbreaks early*

</div>
