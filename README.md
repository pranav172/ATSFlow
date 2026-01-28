# ATSFlow 🚀

**Beat the Bots. Land the Job.**

AI-powered resume optimization that gets past applicant tracking systems and in front of hiring managers.

## ✨ Features

- ⚡ **ATS Analysis** - Get your resume scored on ATS compatibility (0-100)
- 🎯 **AI Optimization** - Rewrite bullets with action verbs and metrics
- 📄 **Multiple Exports** - Download as PDF, DOCX, or **editable LaTeX (.tex)**
- 🔒 **Privacy First** - Your data is encrypted and deleted after 2 years
- 💳 **Flexible Pricing** - Free tier available, pay-as-you-go, or unlimited Pro

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.3+ (Strict Mode)
- **Styling**: TailwindCSS 3.4
- **Database**: PostgreSQL (Supabase)
- **Auth**: Clerk
- **AI**: Groq (Llama 3.3 70B), Google Gemini 2.0 Flash
- **Payments**: Stripe
- **Queue**: BullMQ + Upstash Redis
- **Email**: Resend
- **Storage**: Cloudflare R2

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
# Fill in your API keys in .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
ATSFlow/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable React components
├── lib/                   # Utility functions and services
│   ├── ai/               # AI provider integrations
│   ├── db/               # Database schema and queries
│   └── utils/            # Helper functions
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## 🧪 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
```

## 🔐 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication
- `GROQ_API_KEY` - Groq AI API
- `GOOGLE_AI_API_KEY` - Google Gemini API
- `STRIPE_SECRET_KEY` - Stripe payments

## 📝 LaTeX/Overleaf Export

One of our unique features! Users can download **editable .tex files** in addition to PDFs.

### Why LaTeX?
- ✅ Version control friendly (Git + LaTeX)
- ✅ Pixel-perfect customization
- ✅ Open in Overleaf with one click
- ✅ Popular in tech/academic communities

## 🎨 Brand Guidelines

**Colors**:
- Primary: `#6366f1` (Indigo 500)
- Success: `#10b981` (Emerald 500) - ATS score 80+
- Warning: `#f59e0b` (Amber 500) - ATS score 60-79
- Danger: `#ef4444` (Red 500) - ATS score <60

**Typography**:
- Font: Inter (400, 500, 600, 700)
- Monospace: JetBrains Mono

**Voice**:
- Professional but punchy
- Never use "we" — address user as "you"
- Use contractions ("you'll", "it's")
- No corporate jargon

## 🚧 Roadmap

- [x] Phase 0: Project setup
- [x] Phase 1: Foundation (Next.js, Tailwind, TypeScript)
- [ ] Phase 2: Database schema
- [ ] Phase 3: Authentication
- [ ] Phase 4: UI components
- [ ] Phase 5: File upload
- [ ] Phase 6: Resume parsing
- [ ] Phase 7: AI integration
- [ ] Phase 8: ATS analysis
- [ ] Phase 9: Optimization engine
- [ ] Phase 10: PDF & LaTeX generation
- [ ] Phase 11: Stripe payments
- [ ] Phase 12: Background jobs
- [ ] Phase 13: Email system
- [ ] Phase 14: Landing page
- [ ] Phase 15: Dashboard
- [ ] Phase 16: Security
- [ ] Phase 17: Monitoring
- [ ] Phase 18: Testing
- [ ] Phase 19: Deployment
- [ ] Phase 20: Launch

## 📄 License

Proprietary - All Rights Reserved

## 🤝 Contributing

This is a private project. Contributions are not accepted at this time.

## 📧 Contact

For inquiries: [Your contact info]

---

**Made with ❤️ for job seekers worldwide**
