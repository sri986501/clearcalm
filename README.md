# ClearCalm — Calm, Verifiable Insurance Platform

> **Clarity without anxiety.** ClearCalm simplifies insurance policies, streamlines claims, and audits documents with verified transparency.

---

## Overview

**ClearCalm** is a modern, human-centered insurance customer platform. Insurance policies and claims are inherently high-stress and laden with legal jargon. ClearCalm eliminates cognitive overload by answering five fundamental questions on every screen:

1. **Where am I?**
2. **What is my current status?**
3. **What matters?**
4. **What do I need to do?**
5. **What happens next?**

Built on the **UI/UX Pro Max** design intelligence framework, ClearCalm presents a tranquil, highly readable interface featuring deep slate blues, crisp paper surfaces, reassuring status indicators, and progressive disclosure.

---

## Key Features

- **Reassuring Overview:** Immediate coverage status banner (*"Your coverage is up to date"*), active policy summaries, and upcoming payment timelines without distracting KPI clutter.
- **Progressive Policy Experience:** Easy-to-understand policy cards with expandable coverage breakdowns (cashless network hospital lists, copay details, deductibles, and nominee info).
- **Anxiety-Free Claims:** Step-by-step resolution timeline with pre-filled forms, document checklists, and unambiguous status tracking.
- **AI Document Verification & Audit:** 6-phase calm analysis pipeline (ingestion, OCR extraction, anomaly detection, policy validation, covenant cross-checking, and report generation).
- **Document History & Ledger:** Searchable and filterable archive of past verifications with full audit reports.
- **Provider Discovery & Education:** Verified directory of authorized insurance providers alongside category-specific buyer guides (*"Questions to check before purchasing"*).
- **ML Model Observability:** Transparent evaluation metrics including confusion matrices and discrepancy distributions.
- **Omnipresent Support:** Quick access to verified IRDAI consumer helplines, Insurance Ombudsman offices, and direct claims assistance.
- **Mobile-First Design:** Fully responsive layouts tested across 360px to 1440px+ viewports with 44px+ touch targets and zero horizontal scrolling.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, Lucide Icons, Framer Motion
- **State Management:** Zustand, TanStack React Query
- **Backend:** Node.js, Express, TypeScript, Multer, PDF-Parse, Tesseract.js
- **Typography:** IBM Plex Sans (Headings) & Inter (Body)
- **Accessibility:** WCAG 2.1 AA compliant, visible focus indicators, semantic HTML

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sri986501/clearcalm.git
   cd clearcalm
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Configure Environment Variables:**
   Copy the example environment files and supply your credentials:
   ```bash
   # In the root or server directory:
   cp .env.example .env
   ```
   *(Never commit private API keys or database connection strings to version control.)*

4. **Start the Development Servers:**
   ```bash
   npm run dev
   ```
   - Client dev server: `http://localhost:5173/` (or `http://localhost:5174/`)
   - Backend API server: `http://localhost:5000/`

5. **Build for Production:**
   ```bash
   npm run build
   ```

---

## Design System

| Token | Value | Semantic Role |
| :--- | :--- | :--- |
| **Primary Navy** | `#0F2942` / `#0369A1` | Trust, authority, primary actions |
| **Accent Sky** | `#0EA5E9` | Focus highlights and interactive accents |
| **Success / Calm** | `#16A34A` / `#F0FDF4` | Verified, active, and reassured states |
| **Warning / Notice** | `#D97706` / `#FFFBEB` | Gentle attention items without anxiety |
| **Background / Card** | `#F8FAFC` / `#FFFFFF` | Calm paper surfaces with `#E2E8F0` borders |

---

## License

This project is licensed under the MIT License.
