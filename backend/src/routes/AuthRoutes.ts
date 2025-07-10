import express from "express";
import bcrypt from "bcryptjs";
import db from "../lib/db";

const router = express.Router();
const regex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Pattern of email

router.post("/signup", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send("Email and password are required.");
        return;
    }

    if (!email.match(regex)) {
        res.status(400).send("Email is invalid.");
        return; // If the email does not match correct pattern don't send to db
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hashes password for security
        await db.query(
            "INSERT INTO users (username, password) VALUES ($1, $2)",
            [email, hashedPassword]
        );
        res.status(201).send("User registration successful");
    } catch (error) {
        res.status(501).send("Error registering user");
    }
});

router.post("/signin", async (req, res): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send("Username and password are required.");
        return;
    }

    try {
        const result = await db.query(
            "SELECT * FROM users WHERE username = $1",
            [email]
        );
        const user = result.rows[0]; // First result of the sql query is the current user

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).send("Invalid login");
            return;
        }
        res.status(200).send("Logged in Successfully"); // Found email and password in database
    } catch (error) {
        res.status(500).send("Error Logging in");
    }
});

export default router;
