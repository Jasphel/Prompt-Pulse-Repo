# AGENTS.md
# Prompt Pulse — Full-Stack AI Agent Development Guidelines

> **Project:** Prompt Pulse  
> **Repository:** Jasphel/Prompt-Pulse-Repo  
> **Team:** J4V4  
> **Primary Objective:** Maintain a consistent, secure, maintainable, and integration-ready full-stack application.

---

# 1. PURPOSE AND AUTHORITY

This document defines the development rules and architectural expectations for all AI coding agents working on Prompt Pulse.

It serves as the central development instruction document for:
- Frontend development.
- Backend development.
- Database management.
- API development and integration.
- Authentication and SMS integration.
- Object storage.
- Testing and debugging.
- Deployment and configuration.
- Project documentation and knowledge management.

All agents must understand the existing project before implementing changes.

## 1.1 Core Principles

Every implementation must prioritize:

1. **Completeness** — Implement all requested functionality.
2. **Consistency** — Follow established architecture and coding conventions.
3. **Integration Readiness** — Ensure compatibility between frontend, backend, database, and external services.
4. **Security** — Protect user information, credentials, and application resources.
5. **Maintainability** — Produce understandable and modular implementations.
6. **Documentation** — Preserve important project knowledge and implementation decisions.

## 1.2 Instruction Priority

When instructions conflict, follow this order:

1. Explicit instructions from the project owner.
2. This `AGENTS.md` file.
3. Relevant, current project decisions documented in `Obsidian_Notes/`.
4. Existing implementation and established repository conventions.
5. General programming and framework best practices.

Do not silently resolve significant architectural conflicts. Explain them and request clarification when necessary.

---

# 2. PROJECT DIRECTORY STRUCTURE

The project uses a separated frontend and backend architecture.

The intended repository structure is:

```text
Prompt-Pulse-Repo/
│
├── AGENTS.md
├── README.md
│
├── frontend/
│   └── ... Lovable-generated frontend
│
├── backend/
│   └── ... Python backend application
│
├── Obsidian_Notes/
│   └── ... Persistent project knowledge
│
├── test/
│   └── ... Project-level tests
│
└── Dockerfile
```

This represents the intended organization. Agents must inspect the actual repository before assuming that every directory or file already exists.

## 2.1 Directory Responsibilities

| Directory | Responsibility |
|---|---|
| `frontend/` | User interface, components, client-side logic, and API communication |
| `backend/` | Python application, API endpoints, business logic, database and external integrations |
| `Obsidian_Notes/` | Persistent project knowledge, architecture decisions, implementation records, and technical documentation |
| `test/` | Project-level testing and validation |
| Root | Shared instructions, project documentation, and deployment configuration |

### Directory Restrictions

- Frontend implementation belongs in `frontend/`.
- Backend implementation belongs in `backend/`.
- Do not place application logic in the repository root without architectural justification.
- Keep project-wide instructions in the root `AGENTS.md`.
- Preserve the existing directory organization unless an approved architectural change is necessary.

---

# 3. TECHNOLOGY STACK

The following technologies and services are established project decisions.

## 3.1 Frontend

| Component | Technology |
|---|---|
| Frontend development | Lovable |
| Source location | `frontend/` |
| Deployment | Vercel |
| Backend communication | HTTP API |

Lovable is the primary frontend development tool.

AI agents must work with the code generated or maintained through Lovable while respecting the actual framework, dependencies, and project configuration present in `frontend/`.

Do not assume a particular frontend framework without inspecting the repository.

### Frontend Requirements

- Preserve the existing design system.
- Maintain reusable UI components.
- Follow established styling conventions.
- Implement responsive layouts where required.
- Maintain clear separation between presentation and application logic.
- Communicate with the backend through defined API endpoints.
- Never expose backend secrets in client-side code.
- Provide appropriate loading, success, empty, and error states.

Do not unnecessarily regenerate, replace, or restructure the frontend simply to implement a small feature.

## 3.2 Backend

| Component | Technology |
|---|---|
| Language | Python |
| Framework | Bottle |
| Database | Neon PostgreSQL |
| Database Driver | Psycopg |
| Object Storage | S3-compatible storage |
| Configuration | Environment variables |

### Backend Requirements

- Use Bottle for HTTP routing.
- Use Psycopg for PostgreSQL connectivity.
- Separate request handling from business logic.
- Use modular and reusable application components.
- Validate all incoming requests.
- Implement consistent API responses.
- Handle exceptions appropriately.
- Keep database and object storage integrations independent.

Do not introduce an alternative backend framework or database driver without explicit authorization.

## 3.3 External Services

| Service | Responsibility |
|---|---|
| Lovable | Frontend development |
| Neon | Relational database |
| S3-compatible storage | File and object storage |
| HaturikoSMS | SMS messaging and notification delivery |
| Vercel | Application deployment |
| Docker | Application containerization |

External services must be integrated through their documented interfaces.

---

# 4. FRONTEND DEVELOPMENT — LOVABLE

The frontend must remain compatible with the existing Lovable-generated application.

## 4.1 Development Rules

Agents must:

1. Inspect the existing frontend implementation.
2. Identify its framework, dependencies, and package manager.
3. Follow existing component and styling conventions.
4. Reuse existing components whenever possible.
5. Avoid unnecessary dependency installations.
6. Maintain compatibility with backend API contracts.
7. Avoid duplicating business logic already handled by the backend.

## 4.2 Frontend and Backend Separation

The frontend is responsible for:
- Rendering application interfaces.
- Managing client-side state.
- Collecting user input.
- Performing appropriate client-side validation.
- Communicating with the backend.
- Displaying API responses.

The backend remains responsible for:
- Authoritative input validation.
- Business rules.
- Authentication and authorization.
- Database operations.
- External API integrations.
- Sensitive application operations.

Client-side validation must never be considered a replacement for backend validation.

## 4.3 API Communication

All backend requests must use the configured backend URL.

Avoid hardcoding backend addresses throughout frontend components.

Use a centralized API configuration or client implementation when appropriate.

Handle:
- Unsuccessful HTTP responses.
- Network failures.
- Invalid response structures.
- Expired authentication sessions.
- Unexpected server errors.

Never place database credentials, HaturikoSMS API keys, or privileged object storage credentials in frontend environment variables.

---

# 5. BACKEND DEVELOPMENT — PYTHON AND BOTTLE

## 5.1 General Standards

- Follow PEP 8.
- Use descriptive function and variable names.
- Use type hints where appropriate.
- Keep functions focused.
- Avoid duplicated logic.
- Use explicit exception handling.
- Maintain clear module responsibilities.

## 5.2 Recommended Backend Organization

If the backend does not already have an established organization, use the following as a reference:

```text
backend/
│
├── app.py
├── config.py
├── requirements.txt
├── .env.example
│
├── routes/
├── controllers/
├── services/
├── repositories/
├── database/
├── storage/
├── integrations/
├── middleware/
│
└── tests/
```

Responsibilities:

| Module | Responsibility |
|---|---|
| `app.py` | Application initialization |
| `config.py` | Environment configuration |
| `routes/` | HTTP route definitions |
| `controllers/` | Request and response handling |
| `services/` | Business logic |
| `repositories/` | Database queries and persistence |
| `database/` | Database connections and utilities |
| `storage/` | Object storage operations |
| `integrations/` | External service integrations |
| `middleware/` | Authentication and request processing |
| `tests/` | Backend testing |

This structure is a guideline, not a requirement to create empty directories prematurely.

## 5.3 Bottle Guidelines

- Use appropriate HTTP methods.
- Validate request parameters and bodies.
- Return correct HTTP status codes.
- Use consistent response structures.
- Keep routes lightweight.
- Delegate application logic to appropriate services.
- Apply authorization checks to protected endpoints.
- Avoid exposing internal server errors.

---

# 6. DATABASE — NEON POSTGRESQL

Neon PostgreSQL is the project's primary relational database.

All PostgreSQL operations must use Psycopg.

## 6.1 Database Standards

- Use parameterized SQL queries.
- Maintain primary and foreign key relationships.
- Apply appropriate constraints.
- Use transactions for operations requiring atomicity.
- Commit successful write operations.
- Roll back failed transactions where appropriate.
- Close database resources properly.
- Handle connection failures gracefully.
- Avoid unnecessary queries.

## 6.2 Database Architecture

Keep database operations separate from HTTP route definitions.

Use repositories or equivalent data-access modules when appropriate.

Business logic must not be unnecessarily embedded inside SQL queries or Bottle route handlers.

## 6.3 Schema Changes

Before changing the database:

1. Inspect existing tables and relationships.
2. Identify affected application features.
3. Check dependencies and constraints.
4. Prepare the required schema changes.
5. Validate compatibility with existing application code.
6. Document important modifications in `Obsidian_Notes/`.

Never perform destructive database operations without explicit authorization.

---

# 7. OBJECT STORAGE — S3-COMPATIBLE STORAGE

Object storage is a required architectural component.

It must remain independent of Neon PostgreSQL.

## 7.1 Responsibilities

Use object storage for:
- Uploaded files.
- Images and other media.
- Documents.
- Other unstructured application objects.

Use PostgreSQL for structured application information and metadata.

When appropriate, store object keys or identifiers in PostgreSQL to associate files with application records.

## 7.2 Integration Rules

- Keep storage operations in a dedicated integration or storage module.
- Use environment-based credentials.
- Never expose privileged storage credentials to the frontend.
- Validate file types and sizes.
- Generate safe object names.
- Handle upload and download failures.
- Implement appropriate access restrictions.
- Avoid assuming that a database record guarantees an object exists.

## 7.3 File Lifecycle

When implementing file operations:

1. Validate the incoming file.
2. Verify user authorization.
3. Upload the object.
4. Save its metadata when appropriate.
5. Handle failures and inconsistent operations.
6. Implement appropriate cleanup for deleted or replaced objects.

Do not store file contents directly in PostgreSQL unless explicitly required.

---

# 8. AUTHENTICATION AND SMS — HATURIKOSMS

HaturikoSMS is the project's selected external SMS messaging service.

Official documentation:

- Website: https://sms.haturiko.tech/
- Developer documentation: https://sms.haturiko.tech/docs
- API base URL: `https://sms.haturiko.tech/api/v1`

## 8.1 Important Architectural Distinction

HaturikoSMS provides SMS messaging functionality. It must not automatically be treated as a complete authentication or identity-management provider.

The application backend remains responsible for authentication-related business logic.

If SMS-based OTP verification is required, the backend must implement:

- OTP generation.
- OTP delivery requests.
- OTP expiration.
- OTP verification.
- Attempt limits.
- Request rate limiting.
- Appropriate verification state management.

HaturikoSMS handles the actual SMS messaging operation.

## 8.2 API Integration

The service uses HTTPS and JSON.

Authentication to the HaturikoSMS API uses:

```http
Authorization: Bearer YOUR_HSМS_API_KEY
```

The API key must remain exclusively on the backend.

Primary documented endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/messages` | Send an individual SMS |
| POST | `/batches` | Send multiple SMS messages |
| GET | `/messages/{message_id}` | Retrieve message status |
| GET | `/messages` | Retrieve message records |
| GET | `/batches/{batch_id}` | Retrieve batch information |
| GET | `/account/usage` | Check account usage |
| GET | `/sender-ids` | Retrieve sender ID information |

Agents must consult the official developer documentation before implementing or modifying the integration.

## 8.3 API Key Management

Recommended configuration:

```env
HSMS_API_KEY=
HSMS_BASE_URL=https://sms.haturiko.tech/api/v1
HSMS_SENDER_ID=
```

These names are project configuration conventions and must be synchronized with the actual implementation.

Never:
- Hardcode API keys.
- Commit live credentials.
- Expose API keys to the frontend.
- Log API authorization headers.
- Use live credentials for routine testing.

## 8.4 Test Mode

Use HaturikoSMS test API keys during development whenever available.

Test mode simulates message sending without delivering actual SMS messages or consuming live message credits.

Never send real SMS messages during testing without explicit authorization.

## 8.5 Message Status and Webhooks

Use message IDs to associate external SMS records with application operations.

Implement webhook verification according to the official HaturikoSMS documentation before accepting status updates.

Important distinction:

A telco-acknowledged status means the mobile network accepted the message. It does not guarantee that the recipient's handset received or read it.

Never report an SMS as delivered merely because it was acknowledged.

## 8.6 OTP Security

When implementing OTP functionality:

- Generate codes securely using appropriate cryptographic randomness.
- Store verification information securely.
- Apply short expiration periods.
- Limit incorrect verification attempts.
- Apply resend restrictions.
- Invalidate used or expired codes.
- Avoid storing plaintext OTPs unnecessarily.
- Never expose OTPs in application logs.
- Never trust frontend verification alone.

Do not implement an OTP workflow unless it is part of the approved application requirements.

---

# 9. ENVIRONMENT CONFIGURATION

All sensitive settings must use environment variables.

## 9.1 Expected Configuration

```env
# Application
BACKEND_URL=
PROD_MODE=

# Database
DATABASE_URL=

# Object Storage
NEON_S3_ENDPOINT=
NEON_S3_ACCESS_KEY=
NEON_S3_SECRET_KEY=
NEON_S3_REGION=
NEON_S3_BUCKET=

# HaturikoSMS
HSMS_API_KEY=
HSMS_BASE_URL=https://sms.haturiko.tech/api/v1
HSMS_SENDER_ID=
```

Additional variables may be introduced when required.

## 9.2 Configuration Rules

- Maintain `.env.example`.
- Never commit actual `.env` files.
- Never hardcode credentials.
- Validate required variables at startup.
- Separate development and production configurations.
- Avoid logging sensitive configuration.
- Ensure production secrets are managed through Vercel environment settings.

Only introduce configuration variables that the implementation actually uses.

---

# 10. DEPLOYMENT — VERCEL AND DOCKER

Vercel is the selected deployment platform.

Docker is used to package the application according to the existing repository deployment configuration.

## 10.1 Docker Requirements

Before modifying the Dockerfile:

1. Inspect the existing Dockerfile.
2. Understand its base image.
3. Identify the build and runtime stages.
4. Examine installed system dependencies.
5. Identify the application entry point.
6. Verify exposed ports.
7. Understand environment variable requirements.

Do not replace the existing Dockerfile simply to introduce a preferred configuration.

## 10.2 Deployment Requirements

Ensure that:

- The application starts correctly inside its container.
- The HTTP server listens on the configured port.
- Runtime configuration comes from environment variables.
- Database connections use Neon PostgreSQL.
- File operations use external object storage.
- No essential application data depends on container-local persistence.
- Production errors are handled appropriately.

## 10.3 Vercel Compatibility

Verify the actual Vercel deployment configuration before making changes.

Pay particular attention to:
- `vercel.json`
- Dockerfile location and naming.
- Project root directory.
- Build configuration.
- Service routing.
- Environment variables.
- Frontend/backend communication.

Vercel supports containerized HTTP applications, but deployment behavior depends on the selected runtime and project configuration.

Do not assume that a conventional Docker Compose deployment works directly on Vercel.

For multiple services, use the documented Vercel Services configuration where appropriate.

## 10.4 Stateless Runtime

Treat deployed containers as potentially disposable and replaceable.

Do not rely on:
- Persistent local file storage.
- In-memory sessions surviving instance replacement.
- Local files being shared between instances.
- Background processes remaining continuously active.

Use Neon PostgreSQL and object storage for persistent application data.

---

# 11. API DEVELOPMENT AND INTEGRATION

All frontend/backend communication must follow consistent API contracts.

## 11.1 RESTful Standards

| Method | Purpose |
|---|---|
| GET | Retrieve data |
| POST | Create resources or execute operations |
| PUT | Replace resources |
| PATCH | Partially update resources |
| DELETE | Delete resources |

## 11.2 Response Structure

Use a consistent response format.

Successful response:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Request could not be completed.",
  "error": {
    "code": "VALIDATION_ERROR"
  }
}
```

These are recommended conventions. Preserve existing API contracts unless a change is necessary and approved.

## 11.3 Integration Rules

Before implementing an endpoint:

1. Identify its frontend requirements.
2. Check for existing endpoints.
3. Determine required database operations.
4. Identify external service dependencies.
5. Define expected request and response structures.
6. Implement backend logic.
7. Connect the frontend.
8. Validate the complete workflow.

Avoid implementing isolated frontend or backend features that cannot communicate correctly.

---

# 12. TESTING AND QUALITY ASSURANCE

Testing must cover individual components and their interactions.

## 12.1 Backend Testing

Validate:
- API endpoints.
- Request validation.
- Business logic.
- Database operations.
- Authentication and authorization.
- SMS integration.
- Object storage.
- Exception handling.

## 12.2 Frontend Testing

Validate:
- UI behavior.
- Component interactions.
- Form validation.
- Navigation.
- API requests.
- Loading and error states.
- Responsive behavior.

## 12.3 Integration Testing

Validate:
- Frontend-to-backend communication.
- Backend-to-database operations.
- Backend-to-object-storage operations.
- HaturikoSMS API communication.
- Authentication workflows.
- Deployment compatibility.

Use test credentials and test environments whenever available.

Never claim that a feature has passed testing unless the relevant tests were actually executed.

---

# 13. OBSIDIAN NOTES — PROJECT KNOWLEDGE MANAGEMENT

`Obsidian_Notes/` is the project's persistent knowledge repository.

It serves as the long-term knowledge base for AI agents working on Prompt Pulse.

Agents must use it to maintain important project information across development sessions.

## 13.1 Purpose

Obsidian Notes should contain information that helps future agents understand:

- Overall project architecture.
- Established technology decisions.
- Application features.
- Database structure.
- API contracts.
- External integrations.
- Important implementation details.
- Known limitations.
- Bugs and unresolved issues.
- Development progress.
- Important architectural decisions.

## 13.2 Reading Existing Notes

Before performing significant development work:

1. Inspect the relevant Obsidian notes.
2. Read existing architecture documentation.
3. Identify related implementation records.
4. Check for previous decisions and unresolved issues.
5. Compare documentation against the current implementation.

Do not assume that previously written notes are always current.

Verify important information against the actual codebase.

## 13.3 Writing and Updating Notes

After completing significant work, agents should update relevant project notes.

Document:
- What was implemented.
- Why the implementation was chosen.
- Which files were modified.
- Important dependencies.
- API or database changes.
- Integration details.
- Known limitations.
- Remaining tasks.

Prefer updating an existing relevant note rather than creating unnecessary duplicates.

## 13.4 Note Organization

Follow the existing Obsidian vault structure.

If no appropriate organization exists, use the following as a suggested structure:

```text
Obsidian_Notes/
│
├── Project Overview.md
├── Architecture/
│   ├── System Architecture.md
│   ├── Frontend Architecture.md
│   ├── Backend Architecture.md
│   └── Deployment Architecture.md
│
├── Database/
│   └── Database Schema.md
│
├── API/
│   └── API Documentation.md
│
├── Integrations/
│   ├── HaturikoSMS.md
│   └── Object Storage.md
│
├── Development/
│   ├── Implementation Log.md
│   ├── Known Issues.md
│   └── Pending Tasks.md
│
└── Decisions/
    └── Architecture Decision Records.md
```

Do not restructure an existing vault without justification.

## 13.5 Knowledge Preservation Rules

- Write factual information.
- Distinguish implemented features from planned features.
- Record important decisions and their reasoning.
- Avoid recording credentials, passwords, tokens, or private keys.
- Avoid unnecessary duplication.
- Preserve useful historical decisions.
- Correct outdated notes when verified.
- Use meaningful filenames and links.

**Important:** Obsidian Notes complement the source code; they do not replace it. Actual implementation must be verified against the repository.

---

# 14. AI AGENT WORKFLOW

All AI agents must follow this workflow.

## Phase 1 — Understand

Before implementing anything:

1. Read this `AGENTS.md`.
2. Inspect the repository structure.
3. Read relevant Obsidian notes.
4. Inspect affected source files.
5. Understand existing dependencies.
6. Identify related integrations.
7. Determine the actual requirements.

Do not generate code based solely on assumptions.

## Phase 2 — Plan

Identify:

- The problem being addressed.
- Expected behavior.
- Affected files.
- Required dependencies.
- Database changes.
- API changes.
- Frontend changes.
- External service changes.
- Potential risks.

For substantial modifications, present an implementation plan before proceeding.

## Phase 3 — Implement

During development:

- Follow established conventions.
- Reuse existing implementations.
- Maintain modularity.
- Avoid unnecessary dependencies.
- Preserve existing functionality.
- Keep frontend/backend contracts synchronized.
- Follow security requirements.
- Avoid unrelated modifications.

## Phase 4 — Validate

After implementation:

1. Inspect modified files.
2. Check syntax and imports.
3. Run relevant tests.
4. Verify API behavior.
5. Validate affected integrations.
6. Check for regressions.
7. Document any remaining issues.

## Phase 5 — Preserve Knowledge

Update relevant Obsidian notes when significant project knowledge changes.

Ensure that future agents can understand the implementation without having to reconstruct every previous development decision.

## Phase 6 — Report

Provide a concise development report containing:

- Implementation summary.
- Modified or created files.
- Important technical decisions.
- Dependencies introduced.
- Tests performed.
- Test results.
- Known limitations.
- Remaining tasks.

Never claim completion when implementation or validation is unfinished.

---

# 15. PROHIBITED ACTIONS

AI agents must not:

1. Replace Bottle without authorization.
2. Replace Psycopg without authorization.
3. Replace Neon PostgreSQL without authorization.
4. Remove required object storage functionality.
5. Expose HaturikoSMS credentials.
6. Place privileged backend secrets in frontend code.
7. Modify unrelated files unnecessarily.
8. Delete existing functionality without justification.
9. Modify production data without authorization.
10. Introduce unnecessary dependencies.
11. Assume API endpoints exist without inspecting the backend.
12. Treat SMS delivery as proof of user authentication.
13. Treat network acknowledgement as proof of SMS delivery.
14. Assume container-local files are persistent.
15. Invent undocumented features or requirements.
16. Claim tests passed when they were not executed.
17. Overwrite existing Obsidian knowledge without checking its contents.
18. Commit sensitive information to the repository.

---

# 16. DEFINITION OF DONE

A feature is considered complete only when its applicable acceptance criteria are satisfied.

| Category | Acceptance Criteria |
|---|---|
| Functionality | Requested behavior works correctly. |
| Frontend | UI is connected to the required application logic. |
| Backend | API behavior is implemented correctly. |
| Database | Required data operations work correctly. |
| Integrations | External services communicate successfully. |
| Security | Applicable security requirements are satisfied. |
| Testing | Relevant tests have been executed. |
| Consistency | Existing architecture and conventions are preserved. |
| Documentation | Important changes are recorded. |
| Deployment | Changes remain compatible with the deployment configuration. |

An implementation that fails applicable acceptance criteria must be reported as incomplete or requiring changes.

---

# 17. FINAL INSTRUCTION

You are an AI coding agent working on Prompt Pulse.

Your responsibility extends beyond generating code.

You must understand the existing system, respect established architectural decisions, implement features correctly, validate integrations, and preserve project knowledge.

Treat the repository as an evolving application rather than a blank project.

Always:

- Inspect before modifying.
- Understand before implementing.
- Plan before making significant changes.
- Validate before claiming completion.
- Document important decisions.
- Preserve existing project knowledge.

**Primary Development Standard:**

COMPLETENESS. CONSISTENCY. INTEGRATION READINESS.

These principles must guide every implementation and modification made to Prompt Pulse.
