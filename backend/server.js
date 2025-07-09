const express = require('express');
const cors = require('cors');
const admin = require('./firebaseAdmin')
require('dotenv').config();


const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const fetch = require('node-fetch');

const authMiddleware = require('./authMiddleware'); 

app.get('/dashboard', authMiddleware, (req,res) => {
    res.json({
        message:`Welcome, ${req.user.email} !`,
        uid: req.user.uid
    });
});

app.post('/signup', async (req,res) => {
    const {name, username, email, password} = req.body;

    try{
        const userRecord = await admin.auth().createUser({
            displayName: username,
            email,
            password,
        });

        res.status(201).json({
            message: "User Successfully Created",
            uid: userRecord.uid,
            email: userRecord.email,
        });
    } catch (error){
        console.log("error creating user" + error.message);
        res.status(500).json({error:"Failed to create user, Please try again."});
    }
});

app.post('/login', async (req, res) => {
    const {name,username, email, password} = req.body;
    try{
            const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true,
            }),
        });

        const data = await response.json();
        console.log(process.env.FIREBASE_API_KEY)
        if (!response.ok) {
            return res.status(400).json({error: data.error.message});
        }

        const profileResponse = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.FIREBASE_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: data.idToken }),
        });

        const profileData = await profileResponse.json();
        const user = profileData.users[0];

        const customToken = await admin.auth().createCustomToken(data.localId); 

        res.status(200).json({
            message: 'Login Successful',
            token: customToken,
            idToken: data.idToken,
            email: data.email,
            name: data.displayName || null,
        });

        localStorage.setItem('username', user.displayName || username);
    } catch (error) {
        console.error("Login error: " + error.message);
        res.status(500).json({error: 'Internal Server Error'});
    }

    
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});