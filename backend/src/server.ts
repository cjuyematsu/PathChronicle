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

app.get("/health", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "Backend is running",
        timestamp: new Date().toISOString()
    });
});

// Add a test endpoint
app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!" });
});

async function startServer() {
    try {
        // Mount routes
        app.use("/api/locations", locationRoutes);
        app.use("/api/trips", tripRoutes);
        app.use("/api/auth", authRoutes);

        // IMPORTANT: Listen on 0.0.0.0 for external access
        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server running on 0.0.0.0:${PORT}`);
            console.log(`Health check: http://0.0.0.0:${PORT}/health`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();