# DecisionHub Backend (Spring Boot)

This folder contains a Spring Boot backend scaffold for the DecisionHub project.

Files added:

- `pom.xml` — Maven build file with Spring Boot, JPA, Security and JWT dependencies.
- `src/main/java/com/decisionhub/DecisionHubApplication.java` — main Spring Boot application class.
- `src/main/resources/application.properties` — basic configuration (contains placeholders for DB credentials).

Before running:

1. Create the database `decisionhub_db` in your local MySQL server.
2. Update `src/main/resources/application.properties` with your MySQL username and password.

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

