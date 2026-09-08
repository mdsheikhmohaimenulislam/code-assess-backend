# Code Assess Backend

A production-oriented **backend API for an online coding assessment and evaluation platform**, built with **Node.js, TypeScript, Express.js, PostgreSQL, and Prisma ORM**.

The system provides secure authentication, role-based authorization, coding assessments, problems, test cases, candidate attempts, automated evaluations, results, invitations, payments, email notifications, caching, and administrative functionality through a versioned REST API.

---

## 🚀 Features

- 🔐 Secure authentication & authorization
- 👤 Role-based access control
- 🔑 JWT-based authentication
- 🌐 Google OAuth / Social Login
- 📝 Coding problem management
- 🧪 Test case management
- 📋 Assessment creation and management
- 👨‍💻 Candidate assessment attempts
- ⚙️ Automated code evaluation workflow
- 📊 Result and evaluation management
- 🏢 Company management
- 📩 Candidate invitation system
- 💳 Online payment integration
- 📧 Transactional email notifications
- ☁️ Cloudinary file/image storage
- ⚡ Redis caching and temporary state management
- 🔎 Search, filtering, sorting, and pagination
- 🗑️ Soft-delete support
- 📜 Audit/activity tracking
- 🛡️ Centralized error handling
- ✅ Server-side validation with Zod
- 🌍 CORS configuration
- 📦 RESTful API architecture
- 📚 Postman API documentation
- 🚀 Vercel-ready serverless deployment

---

## 🛠️ Technology Stack

### Runtime & Framework

- Node.js
- TypeScript
- Express.js

### Database & ORM

- PostgreSQL
- Prisma ORM

### Authentication & Security

- JWT
- Passport.js
- Google OAuth 2.0
- bcrypt / bcryptjs
- Role-Based Access Control (RBAC)
- CORS

### Validation & Code Quality

- Zod
- Biome

### Caching & Performance

- Redis
- Database indexing
- Optimized Prisma queries
- Transaction-based operations

### File & Media Storage

- Multer
- Cloudinary

### Email

- Nodemailer

### Payment

- Stripe / bKash / SSLCommerz

### API Documentation & Testing

- Postman
- Thunder Client

### Deployment

- Vercel
- Render

---

## 🏗️ Project Architecture

```text
src/
├── app/
│   ├── config/
│   ├── lib/
│   ├── middlewares/
│   ├── module/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── problems/
│   │   ├── assessment/
│   │   ├── company/
│   │   ├── AssessmentProblem/
│   │   ├── invitation/
│   │   ├── candidate/
│   │   ├── attempt/
│   │   ├── testCase/
│   │   ├── MCQOption/
│   │   ├── answer/
│   │   ├── evaluation/
│   │   ├── result/
│   │   └── payments/
│   └── utils/
│
├── app.ts
└── server.ts

prisma/
├── schema.prisma
└── migrations/

prisma.config.ts
package.json
tsconfig.json
vercel.json


## 👥 User Roles

The application implements three primary roles with role-based authorization.

| Role | Responsibilities |
|------|------------------|
| **Admin** | Manage users, assessments, companies, problems, system operations, and administrative activities |
| **Company** | Create and manage assessments, invite candidates, manage coding challenges, and handle hiring workflows |
| **Candidate** | Participate in assessments, submit answers/code, manage attempts, and view assessment results |

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| 🛡️ **Admin** | `loi@example.com` | `Loi123456@` |
| 🏢 **Company** | `company@example.com` | `Loi123456@` |
| 👨‍💻 **Candidate** | `user1@example.com` | `Loi123456@` |

## 🔐 Authentication & Authorization

The authentication system supports:

- User registration
- User login
- JWT access tokens
- Refresh token management
- Logout
- Secure password hashing
- Google OAuth 2.0
- Protected routes
- Role-based authorization
- Bearer token authentication

Protected APIs use:

```http
Authorization: Bearer <access_token>


## 📡 API Versioning

All APIs follow versioned RESTful routing:

```text
/api/v1/
/api/v1/auth
/api/v1/users
/api/v1/problem
/api/v1/assessment
/api/v1/company
/api/v1/candidate
/api/v1/attempts
/api/v1/evaluations
/api/v1/payment
``

# 📚 API Modules
### 🔐 Authentication

```
/api/v1/auth
```
---

## Provides:

- Registration
- Token management
- Logout
- Google authentication
- Authentication-related operations


---

## Users

```
/api/v1/users
```
## Provides:

- User profile management
- User information
- Account management
- Role-based user operations

## 🧩 Problems

```
/api/v1/problem
```
## Provides:

- Create coding problems
- Retrieve coding problems
- Update problems
- Problem management
- Search
- Filtering
- Sorting
- Pagination


## 📝 Assessments

```
/api/v1/assessment
```
## Provides:
- Assessment creation
- Assessment management
- Assessment configuration
- Candidate assessment workflows

## 🏢 Companies

```
/api/v1/company
```
## Provides:
- Company management
- Company information
- Company-related assessment operations

## 🔗 Assessment Problems

```
/api/v1/assessment-problem
```
## Provides:
- Assign problems to assessments
- Manage assessment-problem relationships
- Assessment problem configuration

## 📩 Invitations

```
/api/v1/invitations
```
## Provides:
- Candidate invitations
- Invitation management
- Assessment invitation workflows

## 👨‍💻 Candidates

```
/api/v1/candidate
```
## Provides:
- Candidate management
- Candidate assessment information
- Candidate-related operations

## ⏱️ Attempts
```
/api/v1/attempts
```
## Provides:
- Start assessment attempts
- Manage candidate attempts
- Track assessment progress
- Handle attempt-related operations

## 🧪 Test Cases

```
/api/v1/test-cases
```
## Provides:
- Create test cases
- Manage test cases
- Manage evaluation inputsn

## 💻 Answers

```
/api/v1/answer
```

## Provides:
- Candidate answers
- Code submissions
- Answer management

## ⚙️ Evaluations

```
/api/v1/evaluations
```
## Provides:
- Submission evaluation
- Evaluation results
- Coding assessment evaluation workflow

## 📊 Results

```
/api/v1/result/attempts
```
## Provides:
- Assessment results
- Candidate performance
- Attempt results

## 💳 Payments
```
/api/v1/payment
```
## Provides:
- Payment initialization
- Payment verification
- Payment callbacks
- Payment status tracking




## 📊 API Capabilities
The backend follows modern RESTful API practices and supports:

- ✅ Authentication
- ✅ Authorization
- ✅ Validation
- ✅ Pagination
- ✅ Filtering
- ✅ Sorting
- ✅ Searching
- ✅ Soft deletion
- ✅ Audit/activity tracking
- ✅ Database transactions
- ✅ Consistent response structure

### Pagination Example
```
GET /api/v1/problem?page=1&limit=10
```

### Filtering Example
```
GET /api/v1/problem?status=active
```
### Sorting Example
```
GET /api/v1/problem?sortBy=createdAt
```
### API Docs
```
https://documenter.getpostman.com/view/43872417/2sBYAxQ9fH
```
## 📦 Standard API Response
### Success Response

```ts
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```
### Error Response
```ts
{
  "success": false,
  "message": "Something went wrong",
  "errors": []
}
```
## 🗄️ Database
The project uses PostgreSQL as the primary relational database with Prisma ORM.

#### Key database practices include:
- Relational data modeling
- Foreign key relationships
- Database indexing
- Optimized Prisma queries
- Database transactions
- Data integrity constraints
- Efficient relation queries
- Soft-delete support

## ⚡ Redis
Redis is used for caching and temporary state management.
### Use cases include:
- API caching
- Frequently accessed data
- Temporary assessment state
- Session-related data
- Performance optimization

## 🛡️ Security

Security is an important part of the application architecture.

### Security practices include:
- Secure password hashing
- JWT authentication
- Bearer token authorization
- Role-based access control
- Server-side input validation
- CORS configuration
- Protected private routes
- Centralized error handling
- Environment variable based secrets
- Secure OAuth configuration

Database transactions
Never commit `.env`, OAuth credentials, database credentials, API keys, or payment secrets to the repository.

## 💳 Payment Integration

The application supports online payment processing through a supported payment gateway.

### Payment workflow:

```ts
Create Payment
      ↓
Payment Gateway
      ↓
Success / Cancellation
      ↓
Payment Verification
      ↓
Update Payment Status
```
Payment credentials are stored securely using environment variables.

## 📧 Email Notifications

Nodemailer is used for transactional email communication.

### Examples include:
- Candidate invitations
- Authentication-related emails
- Assessment notifications
- Payment notifications
- System notifications

## ☁️ File Upload & Cloudinary

The backend supports file and image uploads using:

- Multer
- Cloudinary

### Upload workflow:
```ts
Client
  ↓
Multer
  ↓
Backend Validation
  ↓
Cloudinary
  ↓
Stored File URL
  ↓
PostgreSQL
```
## 🧪 Validation

Request validation is implemented using Zod.

## Validation can be applied to:

- Request bodies
- Query parameters
- Route parameters
- Authentication inputs
- Business operations

Invalid requests return structured error responses.

## ⚙️ Installation & Setup
### 1. Clone the Repository
```bash
git clone https://github.com/mdsheikhmohaimenulislam/code-assess-backend.git

cd code-assess-backend
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables

Create a `.env `file:
```bash
NODE_ENV= Add_Data.
PORT= Add_Data.

DATABASE_URL= Add_Data.

JWT_SECRET= Add_Data.
JWT_REFRESH_SECRET= Add_Data.

GOOGLE_CLIENT_ID= Add_Data.
GOOGLE_CLIENT_SECRET= Add_Data.

REDIS_URL= Add_Data.

CLOUDINARY_CLOUD_NAME= Add_Data.
CLOUDINARY_API_KEY= Add_Data.
CLOUDINARY_API_SECRET= Add_Data.

SMTP_HOST= Add_Data.
SMTP_PORT= Add_Data.
SMTP_USER= Add_Data.
SMTP_PASS= Add_Data.

PAYMENT_SECRET_KEY= Add_Data.
PAYMENT_WEBHOOK_SECRET= Add_Data.
```
Environment variable names should match the configuration used by the application.

## 🗃️ Prisma Setup

#### Generate Prisma Client:
```bash
npx prisma generate
```
####  Run database migrations:

```bash
npx prisma migrate dev
```
#### For production:
```bash
npx prisma migrate deploy
```

## ▶️ Running the Project
#### Development

```bash
npm run dev
```
#### Production Build
```bash
npm run build
```
#### Start Production Server
```bash
npm start
```
## 🧹 Code Quality
#### Format Code

```bash
npm run format:fix
```
#### Check Formatting
```bash
npm run format:check
```
#### Fix Lint Issues
```bash
npm run lint:fix
```

## 📮 API Testing

#### The API can be tested using:

- Postman
- Thunder Client

#### Recommended workflow:
```ts
Authentication
      ↓
Get Access Token
      ↓
Authorize Protected APIs
      ↓
Create Resources
      ↓
Perform Business Operations
      ↓
Submit Assessment
      ↓
Evaluate Submission
      ↓
View Results
```

## 🚀 Deployment

The backend is designed to support serverless deployment using Vercel and can also be deployed using Render.

#### Before production deployment, configure:
- PostgreSQL production database
- Redis
- JWT secrets
- Google OAuth credentials
- Cloudinary credentials
- Email credentials
- Payment gateway credentials
- Production CORS origin
- OAuth redirect URLs

 Production secrets should always be configured through the deployment platform's environment variable system.

## 🌍 Production API
```bash
https://code-assess-backend.vercel.app
```
### API Base URL:
```bash
https://code-assess-backend.vercel.app/api/v1
```

## 📈 Future Improvements
- Real-time code execution
- Advanced code sandboxing
- More programming language support
- Detailed candidate analytics
- Advanced assessment analytics
- AI-assisted evaluation
- Real-time assessment monitoring
- Enhanced audit logging
- API rate limiting
- Automated CI/CD pipelines

## 🎯 Project Goals

The primary goal of this project is to build a scalable and secure backend platform that enables companies to create coding assessments, invite candidates, evaluate submissions, and manage assessment results through a well-structured REST API.

#### The project focuses on:
- Clean architecture
- Type safety
- Security
- Scalability
- Performance
- Maintainability
- Real-world business logic
- Production-ready API design

## 👨‍💻 Developer
#### Mohaimenul Islam
#### Backend / Full-Stack Developer

#### Technologies
```ts
TypeScript
Node.js
Express.js
PostgreSQL
Prisma
Redis
React.js
Next.js
REST APIs
PASSPORT.JS
```

## ⭐ Support

#### If you find this project useful, consider giving the repository a ⭐ on GitHub.




