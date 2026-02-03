# ATSFlow 🚀

**Beat the Bots. Land the Job.**

AI-powered resume optimization that gets past applicant tracking systems and in front of hiring managers.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?logo=postgresql)
![AI](https://img.shields.io/badge/AI-Gemini%20%2B%20Groq-purple)

---

## 📋 Table of Contents

- [Features](#-features)
- [System Design](#-system-design)
  - [High-Level Architecture](#high-level-architecture)
  - [Low-Level Architecture](#low-level-architecture)
- [Data Flow](#-data-flow)
- [Tech Stack](#-tech-stack)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ⚡ **ATS Analysis** | Get your resume scored on ATS compatibility (0-100) with detailed breakdown |
| 🎯 **AI Optimization** | Rewrite bullets with action verbs, metrics, and impactful language |
| 🔗 **JD Matching** | Compare your resume against job descriptions with keyword gap analysis |
| 📄 **Multiple Exports** | Download as PDF, DOCX, TXT, or **editable LaTeX (.tex)** |
| 💬 **Interview Prep AI** | Generate tailored interview questions with tips and sample answers |
| ✉️ **Cover Letter Generator** | Create personalized cover letters from your resume and JD |
| 🧠 **Dual AI Models** | Groq (LLaMA 3.3 70B) for speed + Gemini 2.0 Flash for accuracy |
| 🔒 **Privacy First** | Your data is encrypted and deleted after 2 years |
| ⏱️ **Rate Limiting** | Built-in protection against abuse |
| 💳 **Flexible Pricing** | Free tier available, pay-as-you-go, or unlimited Pro |

---

## 🏗️ System Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │   Landing   │    │   Upload    │    │  Dashboard  │    │   Analysis  │  │
│   │    Page     │    │    Page     │    │    Page     │    │   Results   │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER (Next.js App Router)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐ │
│   │  /api/upload │   │ /api/analyze │   │  /api/match  │   │   /api/ai/*  │ │
│   │  (POST)      │   │   (POST)     │   │   (POST)     │   │  (POST)      │ │
│   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘ │
│          │                  │                   │                  │         │
│          ▼                  ▼                   ▼                  ▼         │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                     MIDDLEWARE LAYER                                  │  │
│   │  • Clerk Authentication  • Rate Limiting  • Error Handling           │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                 │
│   │ parse-resume  │   │  ats-scorer   │   │  jd-matcher   │                 │
│   │   Service     │   │    Service    │   │    Service    │                 │
│   └───────────────┘   └───────────────┘   └───────────────┘                 │
│                                                                              │
│   ┌───────────────┐   ┌───────────────┐   ┌───────────────┐                 │
│   │ analyze-resume│   │  ai-provider  │   │   ai-router   │                 │
│   │   Service     │   │    Service    │   │   Service     │                 │
│   └───────────────┘   └───────────────┘   └───────────────┘                 │
│                                                                              │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
          ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│    DATABASE      │    │   AI PROVIDERS   │    │  EXTERNAL APIs   │
│   PostgreSQL     │    │                  │    │                  │
│   (Supabase)     │    │  • Groq (LLaMA)  │    │  • Clerk Auth    │
│                  │    │  • Google Gemini │    │  • Stripe        │
│  • Users         │    │                  │    │  • Resend Email  │
│  • Resumes       │    └──────────────────┘    └──────────────────┘
│  • Resume Versions│
│  • Job Descriptions│
│  • Payments      │
│  • Optimization Logs│
└──────────────────┘
```

### Low-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           RESUME ANALYSIS PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────────┘

 ┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────────┐
 │   PDF/DOCX   │      │   Text       │      │  Structured  │      │    ATS       │
 │   Upload     │─────▶│  Extraction  │─────▶│   Parsing    │─────▶│   Scoring    │
 │              │      │              │      │              │      │              │
 │  pdf-parse   │      │   mammoth    │      │   Regex &    │      │ Rule-based   │
 │              │      │              │      │   Patterns   │      │ + AI Blend   │
 └──────────────┘      └──────────────┘      └──────────────┘      └──────────────┘
                                                                          │
                                                                          ▼
                                                                   ┌──────────────┐
                                                                   │  AI Analysis │
                                                                   │              │
                                                                   │ Gemini Flash │
                                                                   │ (Deep Analysis)│
                                                                   └──────────────┘
                                                                          │
                                                                          ▼
                                                                   ┌──────────────┐
                                                                   │   Groq       │
                                                                   │ Optimization │
                                                                   │              │
                                                                   │ LLaMA 3.3 70B│
                                                                   │ (Fast Rewrite)│
                                                                   └──────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI ROUTER DECISION LOGIC                               │
└─────────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────┐
                    │           AI ROUTER                  │
                    │                                      │
                    │   Task Type → Model Selection        │
                    └─────────────────────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
     ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
     │   SPEED TASKS   │   │ ACCURACY TASKS  │   │  HYBRID TASKS   │
     │   (Groq/LLaMA)  │   │(Gemini Flash)   │   │   (Both)        │
     │                 │   │                 │   │                 │
     │ • quick-polish  │   │ • deep-analysis │   │ • Full Resume   │
     │ • keyword-check │   │ • interview-prep│   │   Analysis      │
     │ • salary-insight│   │                 │   │                 │
     └─────────────────┘   └─────────────────┘   └─────────────────┘
```

---

## 🔄 Data Flow

### Resume Upload & Analysis Flow

```
┌──────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ User │────▶│ Upload PDF  │────▶│ /api/upload │────▶│ pdf-parse   │
└──────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                            │
                                                            ▼
                                                    ┌─────────────┐
                                                    │ Extract Raw │
                                                    │    Text     │
                                                    └─────────────┘
                                                            │
                                                            ▼
                                                    ┌─────────────┐
                                                    │  Store in   │
   ┌─────────────────────────────────────────────── │  Database   │
   │                                                └─────────────┘
   │                                                        │
   ▼                                                        ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐    │
│  Dashboard  │────▶│ Click       │────▶│ /api/analyze│◀───┘
│   Shows     │     │ "Analyze"   │     │   Endpoint  │
│   Resume    │     └─────────────┘     └─────────────┘
└─────────────┘                                │
                                               ▼
                               ┌───────────────────────────────┐
                               │     ANALYSIS PIPELINE          │
                               ├───────────────────────────────┤
                               │ 1. Parse structured content   │
                               │ 2. Calculate rule-based score │
                               │ 3. Gemini deep analysis       │
                               │ 4. Groq optimization suggestions│
                               │ 5. Blend scores (70/30 split) │
                               │ 6. Store results in DB        │
                               └───────────────────────────────┘
                                               │
                                               ▼
                                       ┌─────────────┐
                                       │  Analysis   │
                                       │   Results   │
                                       │   (JSON)    │
                                       └─────────────┘
```

### Job Description Matching Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            JD MATCHING PIPELINE                               │
└──────────────────────────────────────────────────────────────────────────────┘

 ┌────────────┐     ┌────────────┐     ┌────────────────────────────────────────┐
 │   Resume   │     │     Job    │     │           MATCHING ENGINE               │
 │    Text    │────▶│Description │────▶│                                        │
 └────────────┘     └────────────┘     │  1. Extract JD Keywords                │
                                       │     • Technical Skills (with synonyms) │
                                       │     • Soft Skills                      │
                                       │     • Experience Requirements          │
                                       │     • Education Requirements           │
                                       │                                        │
                                       │  2. Match Against Resume               │
                                       │     • Keyword presence check           │
                                       │     • Synonym matching (JS=JavaScript) │
                                       │     • Skill gap identification         │
                                       │                                        │
                                       │  3. Generate Recommendations           │
                                       │     • Priority-based (high/medium/low) │
                                       │     • Actionable suggestions           │
                                       │     • Missing skill analysis           │
                                       └────────────────────────────────────────┘
                                                        │
                                                        ▼
                                               ┌────────────────┐
                                               │ Match Result   │
                                               │ • Overall Score│
                                               │ • Matched KWs  │
                                               │ • Missing KWs  │
                                               │ • Skill Gaps   │
                                               │ • Recommendations│
                                               └────────────────┘
```

---

## 🛠️ Tech Stack

### Core Technologies

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React framework with SSR |
| **Language** | TypeScript 5.3+ (Strict) | Type-safe development |
| **Styling** | TailwindCSS 3.4 | Utility-first CSS framework |
| **Database** | PostgreSQL (Supabase) | Relational database with realtime |
| **ORM** | Drizzle ORM | Type-safe SQL query builder |
| **Authentication** | Clerk | User management and auth |
| **AI (Speed)** | Groq (LLaMA 3.3 70B) | Fast inference for quick tasks |
| **AI (Accuracy)** | Google Gemini 2.0 Flash | Deep analysis and complex tasks |
| **Payments** | Stripe | Subscription and one-time payments |

### Supporting Services

| Service | Purpose |
|---------|---------|
| **Upstash Redis** | Rate limiting and caching |
| **Resend** | Transactional emails |
| **Cloudflare R2** | File storage (optional) |
| **Vercel** | Deployment platform |

---

## 📡 API Reference

### Authentication
All API endpoints require authentication via Clerk. Include the session token in requests.

### Endpoints

#### `POST /api/upload`
Upload and parse a resume file.

**Request:**
```javascript
// FormData
{
  file: File (PDF only, max 5MB)
}
```

**Response:**
```json
{
  "success": true,
  "resumeId": "uuid-string"
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| 400 | Invalid file type or missing file |
| 401 | Unauthorized |
| 429 | Rate limit exceeded |
| 500 | Parse or database error |

---

#### `POST /api/analyze`
Analyze a resume and generate ATS score with AI insights.

**Request:**
```json
{
  "resumeId": "uuid-string"
}
```

**Response:**
```json
{
  "score": 75,
  "grade": "Good",
  "breakdown": {
    "contact": { "score": 15, "max": 15, "issues": [] },
    "keywords": { "score": 22, "max": 30, "issues": ["Add more action verbs"] },
    "sections": { "score": 20, "max": 25, "issues": [] },
    "formatting": { "score": 10, "max": 20, "issues": ["Too few bullet points"] },
    "atsCompatibility": { "score": 8, "max": 10, "issues": [] }
  },
  "strengths": ["Strong technical skills", "Good experience section"],
  "improvements": ["Add quantifiable metrics", "Use more action verbs"]
}
```

---

#### `POST /api/match`
Match resume against a job description.

**Request:**
```json
{
  "resumeId": "uuid-string",
  "jobDescription": "Full job posting text...",
  "quickMatch": false
}
```

**Response:**
```json
{
  "success": true,
  "overallMatchScore": 72,
  "keywordMatchScore": 65,
  "matchedKeywords": ["python", "react", "aws"],
  "missingKeywords": ["kubernetes", "terraform"],
  "skillGapAnalysis": [
    {
      "skill": "kubernetes",
      "importance": "required",
      "mentionCount": 3,
      "suggestion": "Add 'kubernetes' to your skills section"
    }
  ],
  "recommendations": [
    {
      "category": "keyword",
      "priority": "high",
      "issue": "Missing required skill: kubernetes (mentioned 3x)",
      "action": "Add 'kubernetes' to your skills section"
    }
  ]
}
```

---

#### `POST /api/ai/polish`
Quick AI polish for resume text.

**Request:**
```json
{
  "text": "I worked on developing web applications"
}
```

**Response:**
```json
{
  "polished": "Developed and deployed 15+ production web applications serving 50K+ users"
}
```

---

#### `POST /api/ai/interview-prep`
Generate tailored interview questions based on resume and job description.

**Request:**
```json
{
  "resumeText": "Your resume content...",
  "jobDescription": "Optional: Job description for tailored questions"
}
```

**Response:**
```json
{
  "questions": [
    {
      "question": "Describe a complex React component you built.",
      "type": "technical",
      "tip": "Use the STAR method to structure your answer",
      "sampleAnswer": "I built a real-time dashboard component..."
    }
  ]
}
```

---

#### `POST /api/ai/cover-letter`
Generate a tailored cover letter.

**Request:**
```json
{
  "resumeText": "Your resume content...",
  "jobDescription": "Job description...",
  "companyName": "Google"
}
```

**Response:**
```json
{
  "coverLetter": "Dear Hiring Manager...\n\nI am excited to apply..."
}
```

---

#### `POST /api/export`
Export a resume in various formats.

**Request:**
```json
{
  "resumeId": "uuid-string",
  "format": "pdf" | "docx" | "txt"
}
```

**Response:** Binary file with appropriate Content-Type header.

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE SCHEMA                                     │
└─────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│      USERS       │       │       RESUMES        │       │  RESUME_VERSIONS │
├──────────────────┤       ├──────────────────────┤       ├──────────────────┤
│ id (PK, UUID)    │◀──┐   │ id (PK, UUID)        │──────▶│ id (PK, UUID)    │
│ clerk_id (UNIQUE)│   │   │ user_id (FK)         │       │ resume_id (FK)   │
│ email (UNIQUE)   │   └───│ original_filename    │       │ user_id (FK)     │
│ full_name        │       │ storage_key          │       │ version_type     │
│ subscription_tier│       │ file_size_bytes      │       │ ai_model_used    │
│ subscription_sts │       │ mime_type            │       │ content (JSONB)  │
│ credits_remaining│       │ raw_text             │       │ pdf_url          │
│ stripe_customer  │       │ structured_content   │       │ docx_url         │
│ created_at       │       │ ats_score (0-100)    │       │ tex_url          │
│ updated_at       │       │ ats_analysis (JSONB) │       │ created_at       │
└──────────────────┘       │ status               │       └──────────────────┘
         │                 │ retention_until      │
         │                 │ created_at           │
         │                 │ updated_at           │
         │                 └──────────────────────┘
         │
         │                 ┌──────────────────────┐       ┌──────────────────┐
         │                 │   JOB_DESCRIPTIONS   │       │ OPTIMIZATION_LOGS│
         │                 ├──────────────────────┤       ├──────────────────┤
         └────────────────▶│ id (PK, UUID)        │       │ id (PK, UUID)    │
                           │ user_id (FK)         │       │ resume_id (FK)   │
                           │ company_name         │       │ user_id (FK)     │
                           │ role_title           │       │ provider         │
                           │ description_text     │       │ model            │
                           │ extracted_keywords   │       │ prompt_tokens    │
                           │ required_skills      │       │ completion_tokens│
                           │ detected_seniority   │       │ cost_usd         │
                           │ created_at           │       │ latency_ms       │
                           └──────────────────────┘       │ success          │
                                                          │ created_at       │
                           ┌──────────────────────┐       └──────────────────┘
                           │      PAYMENTS        │
                           ├──────────────────────┤
                           │ id (PK, UUID)        │
                           │ user_id (FK)         │
                           │ stripe_payment_id    │
                           │ amount_usd           │
                           │ status               │
                           │ product_sku          │
                           │ credits_added        │
                           │ created_at           │
                           └──────────────────────┘
```

### Key Enums

| Enum | Values |
|------|--------|
| `subscription_tier` | `free`, `pro`, `coach` |
| `resume_status` | `uploaded`, `parsing`, `parsed`, `analyzing`, `analyzed`, `optimizing`, `optimized`, `failed`, `quarantined` |
| `version_type` | `original`, `optimized_standard`, `optimized_technical`, `optimized_leadership`, `tailored`, `cover_letter` |

---

## 📁 Project Structure

```
ATSFlow/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (sign-in, sign-up)
│   ├── api/                      # API routes
│   │   ├── upload/route.ts       # Resume upload endpoint
│   │   ├── analyze/route.ts      # ATS analysis endpoint
│   │   ├── match/route.ts        # JD matching endpoint
│   │   ├── export/route.ts       # Export PDF/DOCX/TXT
│   │   ├── parse-pdf/route.ts    # PDF text extraction
│   │   ├── ai/                   # AI endpoints
│   │   │   ├── polish/           # Quick text polish
│   │   │   ├── interview-prep/   # Interview question generation
│   │   │   └── cover-letter/     # Cover letter generation
│   │   ├── resumes/              # Resume CRUD
│   │   ├── latex/                # LaTeX operations
│   │   └── webhooks/             # Clerk/Stripe webhooks
│   ├── dashboard/                # Protected dashboard routes
│   ├── upload/                   # Upload page
│   ├── latex/                    # LaTeX editor page
│   ├── interview-prep/           # Interview prep AI page
│   ├── cover-letter/             # Cover letter generator page
│   ├── export/                   # Export resume page
│   ├── ai-tools/                 # AI text polish page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components
│   ├── ui/                       # Base UI components (Button, Card, etc.)
│   ├── analysis/                 # Analysis-related components
│   ├── dashboard/                # Dashboard components
│   ├── FileUpload.tsx            # Drag-drop file upload
│   ├── AnalysisResult.tsx        # Score display
│   ├── JDMatcher.tsx             # Job description matching UI
│   ├── ATSAnalysisSection.tsx    # Detailed analysis view
│   └── ...
│
├── lib/                          # Core logic
│   ├── ai/                       # AI integrations
│   │   ├── ai-router.ts          # Smart model selection
│   │   ├── analysis-service.ts   # Main analysis orchestration
│   │   └── schema.ts             # Zod schemas for AI responses
│   ├── db/                       # Database
│   │   ├── index.ts              # Drizzle client
│   │   ├── schema.ts             # Table definitions
│   │   └── migrate.ts            # Migration runner
│   ├── services/                 # Business logic
│   │   ├── parse-resume.ts       # PDF/DOCX parsing
│   │   ├── ats-scorer.ts         # Rule-based scoring
│   │   ├── jd-matcher.ts         # JD keyword matching
│   │   ├── ai-provider.ts        # AI provider abstraction
│   │   └── analyze-resume.ts     # Full analysis pipeline
│   ├── actions/                  # Server actions
│   └── utils.ts                  # Utility functions
│
├── middleware.ts                 # Auth middleware (Clerk)
├── drizzle.config.ts            # Drizzle ORM config
├── tailwind.config.ts           # Tailwind configuration
└── package.json                 # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Accounts for: Supabase, Clerk, Groq, Google AI Studio

### Installation

```bash
# Clone the repository
git clone https://github.com/pranav172/ATSFlow.git
cd ATSFlow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI Providers
GROQ_API_KEY=gsk_...
GOOGLE_AI_API_KEY=AIza...

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional
UPSTASH_REDIS_URL=redis://...
RESEND_API_KEY=re_...
```

---

## 🧪 Development

### Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run test         # Run Vitest tests
```

### Testing

```bash
# Unit tests with Vitest
npm run test

# E2E tests with Playwright
npx playwright test
```

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Ensure all required environment variables are set in your deployment platform.

---

## 🎨 Brand Guidelines

**Colors:**
| Usage | Color | Hex |
|-------|-------|-----|
| Primary | Indigo | `#6366f1` |
| Success (Score 80+) | Emerald | `#10b981` |
| Warning (Score 60-79) | Amber | `#f59e0b` |
| Danger (Score <60) | Red | `#ef4444` |

**Typography:**
- Primary: Inter (400, 500, 600, 700)
- Monospace: JetBrains Mono

---

## 📄 License

Proprietary - All Rights Reserved

---

## 📧 Contact

**Developer:** Pranav  
**GitHub:** [@pranav172](https://github.com/pranav172)  
**Project:** [ATSFlow](https://github.com/pranav172/ATSFlow)

---

**Made with ❤️ for job seekers worldwide**
