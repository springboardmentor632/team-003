# DecisionHub Backend (Spring Boot)

This folder contains the Spring Boot backend for the DecisionHub project.

Included capabilities:

- JWT registration and login, user profiles, and role-based security.
- Decision board CRUD with public/private visibility and comparison criteria.
- Single-choice, multiple-choice, and 1-5 rating votes, including vote retraction.
- `pom.xml` — Maven build file with Spring Boot, JPA, Security and JWT dependencies.

Before running:

1. Create the database `decisionhub_db` in your local MySQL server.
2. Update `src/main/resources/application.properties` with your MySQL username, password, and a secure JWT secret.

Key routes are under `/api/auth`, `/api/users`, and `/api/decisions`.

Run (from `backend/`):

```bash
mvn spring-boot:run
```

Or build and run:

```bash
mvn -DskipTests package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

The backend listens on port `8080` by default. The frontend dev server runs at `http://localhost:5173`.

Database setup notes:

1. A helper SQL script is included at `backend/create_database.sql` for creating the database and example user grants. Run it in your MySQL client or via `mysql`:

```sql
SOURCE create_database.sql;
```

2. After creating the DB, set credentials in `src/main/resources/application.properties`.

