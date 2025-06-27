import { Pool } from "pg";

const db = new Pool({
    user: process.env.POSTGRES_USER || "myuser",
    host: process.env.POSTGRES_HOST || "localhost",
    database: process.env.POSTGRES_DB || "mydatabase",
    password: process.env.POSTGRES_PASSWORD || "mypassword",
    port: process.env.POSTGRES_PORT
        ? parseInt(process.env.POSTGRES_PORT, 10)
        : 5432,
});

export default db;
