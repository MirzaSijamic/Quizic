### Project Summary
Quizic is a full-stack learning platform for onboarding and upskilling.  
It supports both students and admins with separate workflows, secure sign-in, quiz management, and progress analytics.

### What I Built
- Microsoft Office365 OAuth login flow
- Cookie-based session authentication with HMAC signature validation
- Role-based access control for student and admin users
- REST API with CRUD operations for:
  - Courses
  - Lessons
  - Quizzes
  - Questions
  - Profiles
  - Results
  - Profile-course relations
- Quiz submission engine with:
  - Automatic score calculation
  - Pass/fail evaluation using passing score thresholds
  - Attempt tracking
  - Validation for invalid question IDs
- Admin dashboard to create, edit, and delete quizzes and questions
- Admin results dashboard with filtering, sorting, pass rate, and detailed answer review
- Student progress dashboard with finished vs unfinished course tracking
- Responsive React UI with protected routes and dark/light theme support
- Quiz migration utility from seed data to persistent browser storage

### Architecture
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: FastAPI with Router → Service → CRUD layering
- Database: PostgreSQL with psycopg2
- Security: OAuth, signed sessions, dependency-based role checks
- UI Libraries: Radix UI, MUI, Lucide, Motion

## Tech Stack

| Area | Technologies |
|---|---|
| Languages | TypeScript, Python, SQL |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | FastAPI, Pydantic |
| Database | PostgreSQL, psycopg2 |
| UI and UX | Radix UI, MUI, Lucide, Motion |
| Tools | npm, Git, REST APIs |

## Engineering Highlights
- Designed and integrated secure authentication across frontend and backend
- Implemented role-aware navigation and protected admin routes
- Built scalable API structure with reusable service and CRUD layers
- Developed end-to-end quiz lifecycle from authoring to scoring to analytics
- Combined backend persistence with frontend fallback handling for resilient UX
- Add a short achievements section with measurable outcomes
