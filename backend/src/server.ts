import express from "express";
import tripRoutes from "./routes/Trips";
import locationRoutes from "./routes/LocationRoutes";
import authRoutes from "./routes/AuthRoutes";
import cors from "cors";

const app = express();
const PORT = parseInt(process.env.PORT || "5000", 10);

// CORS Middleware
app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "https://localhost:3001", 
            "https://path-chronicle.vercel.app",  
            "https://*.vercel.app",
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 200
    })
);

app.use(express.json());

async function startServer() {
    try {
        // Mount routes
        app.use("/api/locations", locationRoutes);
        app.use("/api/trips", tripRoutes);
        app.use("/api/auth", authRoutes);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();