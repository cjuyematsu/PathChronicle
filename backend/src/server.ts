import express from "express";
import authRoutes from "./routes/AuthRoutes";
import { initializeDatabase } from "../lib/initialize_db";
import tripRoutes from "./routes/Trips";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/auth", authRoutes);

async function startServer() {
    try {
        await initializeDatabase();

        // Mount routes
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
