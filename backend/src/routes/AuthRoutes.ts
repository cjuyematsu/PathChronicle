import express from "express";
import bcrypt from "bcryptjs";
import db from '../lib/db';
import jwt from 'jsonwebtoken';

const router = express.Router();
const regex = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Pattern of email

router.post("/signup", async (req, res) => {
    const { email, password, countryCode } = req.body;

    if (!email || !password) {
        res.status(400).json({message: 'Email, password and country are required.'});
        return;
    }

    if(!email.match(regex)) {
        res.status(400).json({message: 'Email is invalid.'});
        return; // If the email does not match correct pattern don't send to db
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // Hashes password for security
        await db.query('INSERT INTO users (email, password, icon_code) VALUES ($1, $2, $3)', [email, hashedPassword, countryCode]);
        res.status(201).json({message: 'User registration successful'})
    }
    catch (error) {
        console.error('Signup Error:', error); 
        res.status(501).json({message: 'Error registering user'})
    }
});

router.post('/signin', async (req, res): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({message: 'Username and password are required.'});
        return;
    }

    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({message: 'Invalid login'});
            return;
        }

        const tokenPayload = {
            id: user.id, 
            email: user.email,
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET || 'path-to-logged-in',
            { expiresIn: '1h' } 
        );

        res.status(200).json({
            message: 'Logged in Successfully',
            token: token,
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({message: 'Error Logging in'});
    }
});

const verifyToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(403).json({message:'A token is required for authentication'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'path-to-logged-in');
        req.user = decoded; 
    } catch (err) {
        return res.status(401).json({message:'Invalid Token'});
    }
    return next();
};

router.get('/userdata', verifyToken, async (req: any, res): Promise<void> => {
    try {
        const result = await db.query('SELECT id, email, icon_code FROM users WHERE id = $1', [req.user.id]);
        const user = result.rows[0];

        if (!user) {
            res.status(404).json({message:'User not found.'});
            return;
        }

        res.status(200).json({
            name: user.email.split('@')[0], 
            email: user.email,
            countryCode: user.icon_code,
        });
    } catch (error) {
        res.status(500).json({message: 'Error fetching user data'});
    }
});

router.post('/update-country', verifyToken, async (req: any, res): Promise<void> => {
    const { countryCode } = req.body;

    if (!countryCode) {
        res.status(400).json({message: 'Country code is required.'});
        return;
    }

    try {
        await db.query('UPDATE users SET icon_code = $1 WHERE id = $2', [countryCode, req.user.id]);
        res.status(200).json({message: 'Country updated successfully'});
    } catch (error) {
        console.error('Update Country Error:', error);
        res.status(500).json({message: 'Error updating country'});
    }
});

export default router;
