import express from "express";
import authRoutes from "./routes/AuthRoutes";
import { initializeDatabase } from "../lib/initialize_db";
import tripRoutes from "./routes/Trips";
import getAirports from "../lib/airports";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

async function startServer() {
    try {
        await initializeDatabase(); // Initialize the database (schema, tables, etc.)

        await getAirports(); // Import airport data

        // Mount routes
        //app.use("/api/auth", authRoutes);
        app.use("/api/trips", tripRoutes);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
