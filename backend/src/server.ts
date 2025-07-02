import express from "express";
import authRoutes from './routes/AuthRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
    res.send("Hello, Express with TypeScript!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
