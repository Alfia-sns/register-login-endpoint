const express = require('express');
const app = express();

// Inisialisasi Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(express.json());

// API endpoint untuk user registration
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validasi panjang password
    if (password.length < 8) {
        return res.status(400).json({ error: true, message: 'Password must be at least 8 characters' });
    }

    try {
        // Cek apakah email sudah terdaftar
        const snapshot = await db.collection('users').where('email', '==', email).get();
        if (!snapshot.empty) {
            return res.status(400).json({ error: true, message: 'Email already exists' });
        }

        // Simpan data user ke Firebase Firestore
        await db.collection('users').add({ name, email, password });

        // Response sukses
        res.status(201).json({ error: false, message: 'User Created' });
    } catch (error) {
        // Jika terjadi kesalahan saat menyimpan data
        console.error('Error registering user:', error);
        res.status(500).json({ error: true, message: 'Failed to register user' });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
