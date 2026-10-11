# DecisionHub — Complete API Evaluation Report

> **Ready for Evaluation**: This report documents all **REST API endpoints** implemented in the DecisionHub Spring Boot backend and integrated with the React frontend, including authentication headers, role-based access rules, request payloads, and expected responses.
> - **Importable Postman Collection**: `DecisionHub.postman_collection.json`
> - **Backend Base URL**: `http://127.0.0.1:8080`
> - **Frontend Base URL**: `http://127.0.0.1:3000`

---

## 1. Architecture & Authentication Overview

- **Authentication**: Stateless JWT (`HS256`, 24-hour expiration).
- **Header Format**: `Authorization: Bearer <token>` (required on all endpoints except `/api/auth/login`, `/api/auth/register`, and `/api/auth/password-reset/*`).
- **Standard Error Format**:
  - `400 Bad Request`: `{"error": "Descriptive validation or business rule message"}`
  - `403 Forbidden`: `{"error": "Moderator access is required"}` (or `Admin access is required`)

---

## 2. Pre-Seeded Role Accounts for Evaluation

All demo accounts share the uniform password **`demo123`** and come pre-populated with distinct decision boards, communities, invitations, comments, notifications, feedback, and moderation reports:

| Persona Role | Full Name | Email | Password | Global Role | Community Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Global Admin** | System Admin | `admin@decisionhub.local` | `demo123` | `ADMIN` | `OWNER` of *Platform Governance & Security*; `MODERATOR` of *Product Builders* & *Engineering Circle* |
| **Community Moderator** | Arjun Mehta | `arjun@decisionhub.local` | `demo123` | `USER` | `OWNER` of *Engineering Circle* & *AI & Architecture Guild*; `MODERATOR` of *Product Builders* & *Platform Governance* |
| **Community Owner** | Maya Patel | `maya@decisionhub.local` | `demo123` | `USER` | `OWNER` of *Product Builders* & *Weekend Explorers*; `MODERATOR` of *Workplace & Culture* |
| **Community Member** | Harish | `harish@decisionhub.local` | `demo123` | `USER` | `MEMBER` across communities; has pending invitation to *Engineering Circle* |
| **Community Member** | Priya Nair | `priya@decisionhub.local` | `demo123` | `USER` | `OWNER` of *Workplace & Culture* |
| **Community Member** | Rohan Shah | `rohan@decisionhub.local` | `demo123` | `USER` | `OWNER` of *Sustainable Choices* |

---

## 3. Complete API Endpoint Inventory (10 Modules)

### Module 1 — Authentication & User Session (`AuthController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `POST` | `/api/auth/register` | Public | `Register.jsx` | Registers a new user and returns a signed JWT |
| 2 | `POST` | `/api/auth/login` | Public | `Login.jsx` | Authenticates credentials and returns `{token, name, email, role}` |
| 3 | `GET` | `/api/auth/demo-admin` | Public | Demo utility | Returns a ready-to-use JWT for `admin@decisionhub.local` |
| 4 | `POST` | `/api/auth/password-reset/request` | Public | `ResetPassword.jsx` | Generates a SHA-256 hashed password reset token |
| 5 | `POST` | `/api/auth/password-reset/confirm` | Public | `ResetPassword.jsx` | Confirms reset token and updates password |
| 6 | `GET` | `/api/users/me` | Bearer | `AuthContext.jsx` | Returns the authenticated user's profile |

**Sample Request (`POST /api/auth/login`)**:
```json
{
  "email": "admin@decisionhub.local",
  "password": "demo123"
}
```
**Sample Response (`200 OK`)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "name": "System Admin",
  "email": "admin@decisionhub.local",
  "role": "ADMIN"
}
```

---

### Module 2 — Decision Boards, Options & Voting (`DecisionController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 7 | `GET` | `/api/decisions/public?page=0&size=20&category=` | Bearer | `Boards.jsx`, `Feedback.jsx` | Paginated public decision boards (optional category filter) |
| 8 | `GET` | `/api/decisions/mine?page=0&size=20` | Bearer | `Dashboard.jsx`, `Boards.jsx` | Paginated decisions created by the logged-in user |
| 9 | `GET` | `/api/decisions` | Bearer | Admin / API | Lists all decision boards |
| 10 | `GET` | `/api/decisions/community/{communityId}` | Bearer | `CommunityDetail.jsx` | Lists decision boards linked to a specific community |
| 11 | `GET` | `/api/decisions/{id}` | Bearer | `BoardDetail.jsx` | Returns full decision board with options, 5-factor scores, and vote counts |
| 12 | `POST` | `/api/decisions` *(or `/api/decisions/create`)* | Bearer | `CreateBoard.jsx` | Creates a decision board with options and criteria scores |
| 13 | `PUT` | `/api/decisions/{id}` | Owner / Admin | `BoardDetail.jsx` | Updates decision metadata or closes/reopens voting (`closed: true/false`) |
| 14 | `DELETE` | `/api/decisions/{id}` | Owner / Admin | `BoardDetail.jsx` | Deletes a decision board (`204 No Content`) |
| 15 | `GET` | `/api/decisions/{id}/options` | Bearer | `BoardDetail.jsx` | Lists all options for a decision board |
| 16 | `POST` | `/api/decisions/{id}/options` | Owner / Admin | `BoardDetail.jsx` | Adds a new option with pros/cons and 5-factor criteria scores |
| 17 | `POST` | `/api/decisions/{id}/votes` | Bearer | `BoardDetail.jsx` | Casts a vote (`SINGLE_CHOICE`, `MULTIPLE_CHOICE`, or `RATING` 1–5) and triggers notification |
| 18 | `DELETE` | `/api/decisions/{id}/votes/{optionId}` | Bearer | `BoardDetail.jsx` | Retracts the current user's vote on an option |
| 19 | `GET` | `/api/decisions/{id}/votes/results` | Bearer | `BoardDetail.jsx` | Returns the decision with recalculated vote counts and rating averages |

**Sample Request (`POST /api/decisions/1/votes`)**:
```json
{
  "optionId": 1,
  "rating": 5
}
```

---

### Module 3 — Communities, Roles & Invitations (`CommunityController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 20 | `GET` | `/api/communities` | Bearer | `Communities.jsx`, `Sidebar.jsx` | Lists all communities with `joined`, `memberRole`, and `memberCount` |
| 21 | `POST` | `/api/communities` | Bearer | `Communities.jsx` | Creates a new community and assigns creator as `OWNER` |
| 22 | `GET` | `/api/communities/{id}` | Bearer | `CommunityDetail.jsx` | Returns community details and member roster with roles |
| 23 | `PUT` | `/api/communities/{id}` | Owner / Admin | `CommunityDetail.jsx` | Updates community name and description |
| 24 | `POST` | `/api/communities/{id}/members` | Bearer | `Communities.jsx`, `CommunityDetail.jsx` | Joins the community as `MEMBER` |
| 25 | `DELETE` | `/api/communities/{id}/members/me` | Bearer | `Communities.jsx`, `CommunityDetail.jsx` | Leaves the community |
| 26 | `PUT` | `/api/communities/{id}/members/{memberId}/role?role=MODERATOR` | Owner / Admin | `CommunityDetail.jsx` | Promotes/demotes a community member (`MODERATOR` / `MEMBER`) |
| 27 | `POST` | `/api/communities/{id}/invitations?email=` | Owner / Mod / Admin | `CommunityDetail.jsx` | Sends a community invitation and creates a `COMMUNITY_INVITATION` notification |
| 28 | `GET` | `/api/communities/invitations` | Bearer | `Notifications.jsx` | Lists pending invitations for the logged-in user (includes `community` and `inviter`) |
| 29 | `POST` | `/api/communities/invitations/{id}/accept` | Invitee | `Notifications.jsx` | Accepts an invitation and adds the user to the community |
| 30 | `POST` | `/api/communities/invitations/{id}/decline` | Invitee | `Notifications.jsx` | Declines a pending invitation |

---

### Module 4 — Decision Board Threaded Comments & Reactions (`CommentController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 31 | `GET` | `/api/decisions/{decisionId}/comments` | Bearer | `Discussion.jsx` | Lists comments and nested replies (hidden comments filtered for non-moderators) |
| 32 | `POST` | `/api/decisions/{decisionId}/comments` | Bearer | `Discussion.jsx` | Creates a top-level comment (`parentId: null`) or nested reply (`parentId: <id>`) |
| 33 | `PUT` | `/api/decisions/{decisionId}/comments/{commentId}` | Author / Mod / Admin | `Discussion.jsx` | Edits comment body |
| 34 | `POST` | `/api/decisions/{decisionId}/comments/{commentId}/reactions` | Bearer | `Discussion.jsx` | Increments reaction/like count on a comment |
| 35 | `PUT` | `/api/decisions/{decisionId}/comments/{commentId}/hidden?value=true` | Mod / Owner / Admin | `Reports.jsx` | Hides or unhides a reported comment |
| 36 | `DELETE` | `/api/decisions/{decisionId}/comments/{commentId}` | Author / Mod / Admin | `Discussion.jsx` | Deletes a comment and its child replies (`204 No Content`) |

---

### Module 5 — Standalone Discussion Forum & Replies (`DiscussionController.java` & `DiscussionCommentController.java`)

| # | Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- | :--- |
| 37 | `GET` | `/api/discussions` | Bearer | Lists all standalone discussion threads |
| 38 | `GET` | `/api/discussions/mine` | Bearer | Lists discussion threads created by the logged-in user |
| 39 | `GET` | `/api/discussions/{id}` | Bearer | Fetches a single discussion thread by ID |
| 40 | `POST` | `/api/discussions?title=...&content=...` | Bearer | Creates a new standalone discussion thread |
| 41 | `DELETE` | `/api/discussions/{id}` | Creator / Admin | Deletes a discussion thread (`204 No Content`) |
| 42 | `GET` | `/api/discussions/{discussionId}/comments` | Bearer | Lists comments and nested replies for a discussion thread |
| 43 | `POST` | `/api/discussions/{discussionId}/comments?content=...&parentCommentId=` | Bearer | Adds a comment or nested reply to a discussion thread |
| 44 | `DELETE` | `/api/discussions/{discussionId}/comments/{commentId}` | Creator / Admin | Deletes a discussion comment (`204 No Content`) |

---

### Module 6 — Decision Suggestions (`SuggestionController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 45 | `GET` | `/api/decisions/{decisionId}/suggestions` | Bearer | `Suggestions.jsx` | Lists improvement suggestions submitted for a decision board |
| 46 | `POST` | `/api/decisions/{decisionId}/suggestions` | Bearer | `Suggestions.jsx` | Submits a new suggestion and notifies the board owner |

---

### Module 7 — Notifications & Unread Summary (`NotificationController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 47 | `GET` | `/api/notifications` | Bearer | `Notifications.jsx`, `NotificationBell.jsx` | Lists all notifications (`VOTE`, `COMMENT`, `COMMUNITY_INVITATION`, `SYSTEM`, `GENERAL`) |
| 48 | `GET` | `/api/notifications/summary` | Bearer | `Sidebar.jsx`, `NotificationBell.jsx` | Returns unread notification count: `{"unread": 3}` |
| 49 | `POST` | `/api/notifications/{id}/read` | Bearer | `Notifications.jsx`, `NotificationBell.jsx` | Marks a single notification as read |
| 50 | `POST` | `/api/notifications/read-all` | Bearer | `Notifications.jsx` | Marks all notifications as read (`{"updated": <count>}`) |
| 51 | `POST` | `/api/notifications/system?email=...&message=...` | Admin Only | Admin / System | Sends a targeted `SYSTEM` notification (`403` if non-admin) |

---

### Module 8 — Analytics & Decision Insights (`AnalyticsController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 52 | `GET` | `/api/analytics/summary` | Bearer | `Analytics.jsx` | Aggregates board counts, category vote shares, poll type distribution, option popularity, community activity, daily trends, open/closed outcomes, and top 5 most active boards |

---

### Module 9 — User Feedback Workflow (`FeedbackController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 53 | `POST` | `/api/feedback` | Bearer | `Feedback.jsx` | Submits product or decision-specific feedback (`status: "OPEN"`) |
| 54 | `GET` | `/api/feedback` | Bearer | `Feedback.jsx` | Lists feedback submitted by the logged-in user |
| 55 | `GET` | `/api/feedback/all` | Admin / Mod | `Feedback.jsx` | Lists all feedback entries across the platform |
| 56 | `PUT` | `/api/feedback/{id}/status?status=REVIEWED` | Admin / Mod | `Feedback.jsx` | Transitions feedback status (`OPEN` → `REVIEWED` → `RESOLVED`) |

---

### Module 10 — Moderation & Content Reporting (`ReportController.java`)

| # | Method | Endpoint | Auth | Used By (Frontend) | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 57 | `POST` | `/api/decisions/{decisionId}/reports` | Bearer | `BoardDetail.jsx`, `Discussion.jsx` | Reports a decision board (`commentId: null`) or specific comment (`commentId: <id>`) |
| 58 | `GET` | `/api/reports` | Admin / Owner / Mod | `Reports.jsx` | Lists moderation reports scoped to the moderator's communities (or all reports for `ADMIN`). Returns `403 Forbidden` for regular members |
| 59 | `PUT` | `/api/reports/{id}?status=RESOLVED` | Admin / Owner / Mod | `Reports.jsx` | Resolves (`RESOLVED`) or dismisses (`DISMISSED`) a moderation report |

---

## 4. Quick 5-Step Evaluator Verification Checklist

1. **Authenticate (`POST /api/auth/login`)**:
   - Log in as `admin@decisionhub.local` / `demo123` → Verify `200 OK` and copy `token`.
2. **Verify Role-Specific Decisions & Communities**:
   - Call `GET /api/decisions/mine` and `GET /api/communities` → Verify Admin's boards (`Admin: Cloud migration`, `Admin: Team onboarding`, `Admin: Vendor shortlist`) and community roles.
3. **Verify Collaboration (Comments, Replies, Suggestions & Votes)**:
   - Call `POST /api/decisions/1/votes` with `{"optionId": 1, "rating": 5}` → Verify vote count increments.
   - Call `POST /api/decisions/1/comments` with `{"body": "Evaluator test comment", "parentId": null}` → Verify `200 OK`.
4. **Verify Notifications & Analytics**:
   - Call `GET /api/notifications` and `GET /api/notifications/summary` → Verify unread notifications and count.
   - Call `GET /api/analytics/summary` → Verify aggregated charts data (`totalBoards`, `categoryVotes`, `pollTypes`, `outcomes`).
5. **Verify Role-Based Moderation (`GET /api/reports`)**:
   - With `admin@decisionhub.local` or `arjun@decisionhub.local` token → `GET /api/reports` returns `200 OK` with reported items.
   - Log in as `harish@decisionhub.local` / `demo123` (regular member) → `GET /api/reports` returns `403 Forbidden` (`{"error": "Moderator access is required"}`).
