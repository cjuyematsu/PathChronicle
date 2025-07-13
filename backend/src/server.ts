import express from "express";
//import authRoutes from "./routes/AuthRoutes";
import tripRoutes from "./routes/Trips";
import locationRoutes from "./routes/LocationRoutes";
import authRoutes from "./routes/AuthRoutes"
//import getAirports from "./lib/airports";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://localhost:3001",
            // Add deployed frontend URL when available
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());

async function startServer() {
    try {
        //await getAirports(); // Import airport data (NOTE: This is a one-time operation, so you might want to comment this out after the first run)

        // Mount routes
        //app.use("/api/auth", authRoutes);
        app.use("/api/locations", locationRoutes);
        app.use("/api/trips", tripRoutes);
        app.use("/api/auth", authRoutes)

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();