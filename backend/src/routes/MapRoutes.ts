import express from "express";
import db from '../../lib/db';

const router = express.Router();
router.post('/savedata/:id', async (req, res) => {
    const userId = req.params.id;
    const { origin, destination } = req.body;

    try {
        await db.query('INSERT INTO tripes (userId, origin, destination) VALUES ($1, $2, $3)', [userId, origin, destination]);
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