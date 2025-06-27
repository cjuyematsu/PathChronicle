# PathChronicle

Personal travel chronicle with interactive maps and animated route playback for remembering your adventures

## Getting Started

First, make sure Docker Desktop is running

Create .env files both in the root and in /backend

example .env:

```
# Database Configuration
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=mydatabase
DB_HOST=localhost
DB_PORT=5432

# Prisma Database URL
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase"

# Environment
NODE_ENV=development
```

Run `docker-compose up` to start the database

Cd into backend directory and run `npx prisma studio` to see the db (if needed)

After making changes to the database schema (in schema.prisma file) run `prisma migrate dev --name migration_name`

Run `npm run dev` to start the backend

Cd into frontend directory and run `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result
