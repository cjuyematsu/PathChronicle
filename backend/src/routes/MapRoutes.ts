import express from "express";
import db from '../../lib/db';

const router = express.Router();
router.post('/savedata/:id', async (req, res) => {
    const userId = req.params.id;
    const data = req.body;

    try {
        await db.query('INSERT INTO users (userId, data) VALUES ($1, $2)', [userId,data]);
        res.status(201).send('trip data inserted successfully')
    }
    catch (error) {
        res.status(501).send('Error committing data')
    }
});


router.get('/user/:id/data', async (req, res) => {
    const userId = req.params.id;

    try {
        const data = await db.query('SELECT * FROM trips WHERE user_id = $1', [userId]);
        res.json(data);
    } 
    catch {
        res.status(500).json('error fetching data');
    }
});

export default router;