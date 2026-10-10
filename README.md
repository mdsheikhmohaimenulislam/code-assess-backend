# Code Assess — Developer Assessment Platform

A web-based platform for coding practice, technical assessments, and developer evaluation.

**Code Assess** is a developer assessment platform designed to help candidates improve their programming skills and participate in technical assessments. It provides companies with tools to manage coding problems and review candidate submissions, while administrators can manage users, companies, and platform resources.

The platform aims to make technical assessment workflows more organized, accessible, and efficient for candidates, companies, and administrators.

## Table of Contents

- [Overview](#overview)
- [Project Objectives](#project-objectives)
- [Key Features](#key-features)
- [User Roles](#user-roles)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Routes](#application-routes)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Security Considerations](#security-considerations)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

## Overview

Code Assess brings essential technical assessment activities into one platform. Candidates can explore programming problems and review their submissions, companies can manage their coding-related resources, and administrators can manage users and platform data.

The application includes role-specific dashboards and dedicated pages for coding problems, companies, submissions, profiles, and account access.

### Why Code Assess?

Technical assessments are an important part of evaluating programming skills during recruitment and professional development. Managing problems, submissions, users, and assessments separately can make the process complicated.

Code Assess aims to provide a centralized platform where these activities can be managed through a consistent user interface.

## Project Objectives

The main objectives of Code Assess are:

- Provide a centralized platform for coding practice and technical assessments.
- Help candidates discover coding problems and track their submissions.
- Allow companies to manage coding problems and related resources.
- Provide administrators with tools for managing users and platform content.
- Organize technical assessment workflows through role-based dashboards.
- Offer a responsive and accessible interface.
- Integrate authentication and backend APIs for application functionality.

## Key Features

### 1. Authentication and Account Access

- User registration and login pages.
- Google sign-in integration.
- Role-based access to application sections.
- Dedicated profile pages for different user roles.

Authentication features depend on the configured backend and Google OAuth settings.

### 2. Role-Based Dashboards

The platform provides separate dashboard experiences for administrators, companies, and candidates.

Each role has access to relevant sections according to the application's authorization rules.

### 3. Coding Problems

- Browse available coding problems.
- View individual problem details.
- Organize problem-related workflows.
- Provide dedicated problem management pages for authorized users.

### 4. Problem Management

Authorized users can access problem creation and management pages.

The platform includes separate problem-related routes for administrators and companies. Available operations depend on backend permissions and implementation.

### 5. Submission Management

The platform provides submission-related pages for candidates, companies, and administrators.

These pages are intended to help users access and manage coding submission information according to their roles.

### 6. Company Management

- Browse company information.
- Access company details.
- Create and manage company-related information.
- Edit company details through dedicated pages.

### 7. Payment Pages

The application includes payment-related routes for success, cancellation, and failure states.

Actual payment processing and access control depend on the configured payment provider and backend implementation.

### 8. Help Center and Documentation

The platform includes informational pages to help users understand the application and find answers to common questions.

### 9. Responsive User Interface

The frontend is built with modern web technologies and utility-first styling to support different screen sizes.

## User Roles

| Role | Main Responsibilities |
|---|---|
| Admin | Manage users, companies, problems, and submissions |
| Company | Manage company information, coding problems, and related submissions |
| Candidate | Explore coding problems, access candidate pages, and review submissions |

Access to individual actions must be enforced by the backend, not only by hiding frontend elements.

## Technology Stack

### Frontend

- **Next.js** — React framework for application routing and rendering.
- **React** — Component-based user interface development.
- **TypeScript** — Static typing for improved maintainability.
- **Tailwind CSS** — Utility-first CSS styling.
- **shadcn/ui** — Reusable interface components.
- **Lucide React** — Icons for the application interface.

### Backend

The frontend is designed to communicate with a backend API. The following technologies should be listed here only if they are part of the actual backend repository:

- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL

### Authentication and External Services

- Google OAuth
- Backend API integration
- Vercel deployment

### Development Tools

- Git
- GitHub
- npm
- Visual Studio Code
- Postman

## Project Structure

The following structure is a simplified overview of the frontend application.

```text
Dev-Assess/
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── company/
│   │   │   ├── createProblems/
│   │   │   ├── dashboard/
│   │   │   ├── problems/
│   │   │   ├── profile/
│   │   │   ├── submissions/
│   │   │   └── users/
│   │   ├── candidate/
│   │   │   ├── dashboard/
│   │   │   ├── problems/
│   │   │   ├── profile/
│   │   │   └── submissions/
│   │   ├── company/
│   │   │   ├── createCompany/
│   │   │   ├── createProblem/
│   │   │   ├── dashboard/
│   │   │   ├── myCompany/
│   │   │   ├── problems/
│   │   │   ├── profile/
│   │   │   └── submissions/
│   │   ├── companies/
│   │   ├── faq/
│   │   ├── help-center/
│   │   ├── login/
│   │   ├── payment/
│   │   ├── problems/
│   │   ├── register/
│   │   ├── about/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layouts/
│   │   ├── types/
│   │   └── ui/
│   └── providers/
├── .env.local
├── components.json
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

This is an illustrative structure; consult the repository for the exact current file organization.

## Getting Started

Follow these steps to run the frontend locally.

### Prerequisites

Install the following tools before starting:

- Node.js
- npm
- Git

A running backend API is also required for features that retrieve or modify application data.

### 1. Clone the Repository

```bash
git clone https://github.com/mdsheikhmohaimenulislam/Dev-Assess
```

### 2. Navigate to the Project Directory

```bash
cd Dev-Assess
```

Use the actual cloned directory name if it differs.

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env.local` file in the project root.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

Update these values to match your local backend and Google OAuth configuration.

### 5. Start the Development Server

```bash
npm run dev
```

Open the following address in your browser:

http://localhost:3000

### 6. Create a Production Build

```bash
npm run build
```

### 7. Run the Production Build Locally

```bash
npm run start
```

Run `npm run build` successfully before using the production start command.

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the backend API | `http://localhost:5000/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client identifier | `your-google-client-id` |

### Important Environment Notes

- Use your deployed backend URL for production.
- Do not use `localhost` as the production API URL.
- Add environment variables to the appropriate Vercel environments.
- Rebuild and redeploy after changing environment variables used by the frontend.
- Never commit `.env.local` to the repository.
- Never expose private credentials or API secrets in client-side variables.

Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser bundle. Only put values there that are safe to make public.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Compile and validate the production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run lint checks, if configured in `package.json` |

The availability and behavior of scripts depend on the current `package.json`.

## Application Routes

The application includes the following main routes.

### Public Pages

| Route | Purpose |
|---|---|
| `/` | Home page |
| `/about` | About the platform |
| `/companies` | Browse companies |
| `/problems` | Browse coding problems |
| `/problems/[id]` | View problem details |
| `/faq` | Frequently asked questions |
| `/help-center` | Help and support information |
| `/login` | Sign in |
| `/register` | Create an account |

### Admin Pages

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Admin dashboard |
| `/admin/users` | User management |
| `/admin/company` | Company management |
| `/admin/createProblems` | Create problems |
| `/admin/problems` | Manage problems |
| `/admin/submissions` | Manage submissions |
| `/admin/profile` | Admin profile |

### Company Pages

| Route | Purpose |
|---|---|
| `/company/dashboard` | Company dashboard |
| `/company/myCompany` | Company information |
| `/company/createCompany` | Create company information |
| `/company/createProblem` | Create a problem |
| `/company/problems` | Manage company problems |
| `/company/submissions` | View submissions |
| `/company/profile` | Company profile |

### Candidate Pages

| Route | Purpose |
|---|---|
| `/candidate/dashboard` | Candidate dashboard |
| `/candidate/problems` | Coding problems |
| `/candidate/submissions` | Candidate submissions |
| `/candidate/profile` | Candidate profile |

Additional dynamic routes are available for individual records and details.

## Authentication

The frontend includes login, registration, and Google sign-in functionality.

To configure Google sign-in:

1. Create or select a project in Google Cloud Console.
2. Configure the OAuth consent screen.
3. Create an OAuth Client ID for a web application.
4. Add the appropriate authorized JavaScript origins.
5. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your environment.
6. Configure the deployed frontend domain when using production.

Authentication and role authorization should be validated by the backend. Client-side navigation or UI restrictions alone are not sufficient security controls.

## API Integration

The frontend uses a configurable base URL to communicate with the backend API.

Example:

```text
Local API:
http://localhost:5000/api/v1

Production API:
https://your-backend-domain.com/api/v1
```

Replace the production example with the actual deployed backend URL.

The frontend requires the backend to be available for operations such as authentication, retrieving problems, loading company information, and accessing submissions.

### Backend Configuration Checklist

- Confirm that the backend is deployed and accessible.
- Configure the correct API base URL.
- Allow the frontend domain in the backend's CORS configuration.
- Verify authentication and cookie settings if cookies are used.
- Check API responses and browser network errors when troubleshooting.

## Deployment

The frontend can be deployed using Vercel.

### Deployment Steps

1. Push the frontend repository to GitHub.
2. Import the repository into Vercel, or link the existing project using the Vercel CLI.
3. Configure the correct project root directory.
4. Add the required environment variables.
5. Verify the production API URL.
6. Configure Google OAuth for the deployed domain.
7. Deploy the application.
8. Test the deployed pages and authentication flow.

### Deploy Using Vercel CLI

Install the Vercel CLI if necessary, then run:

```bash
vercel
```

For a production deployment:

```bash
vercel --prod
```

If automatic Git deployments are disabled, run a new deployment after pushing changes.

## Security Considerations

- Keep private backend credentials on the server.
- Do not commit environment files containing secrets.
- Validate and authorize protected operations on the backend.
- Validate user input on both the client and server.
- Use HTTPS for deployed applications.
- Configure CORS for trusted frontend origins.
- Do not trust role information supplied only by the client.
- Ensure payment status is verified by the backend before granting paid access.

## Future Improvements

Potential improvements for future versions include:

- Online code execution with automated test cases.
- More programming language support.
- Assessment scheduling and invitation management.
- Candidate performance analytics.
- Detailed submission history and reporting.
- Notifications for assessment updates.
- Advanced problem search and filtering.
- Improved accessibility and user experience.
- Expanded assessment and payment reporting.

These are proposed improvements and may not be implemented in the current version.

## Author

**Mohaimenul Islam**

- GitHub: [@mdsheikhmohaimenulislam](https://github.com/mdsheikhmohaimenulislam)
- Portfolio: [mohaimenulislam.vercel.app](https://mohaimenulislam.vercel.app)

## License

No license has been specified in this README. Add a `LICENSE` file if you intend to distribute this project under a particular open-source license.

---

**Code Assess — Making developer assessment workflows more organized.**
