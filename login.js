import { auth } from "./firebaseConfig.js"; // Import your Firebase auth instance  

import {signInWithCustomToken, onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

localStorage.setItem('logged', 'false');
// Flag to track if login just happened
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const refreshedToken = await user.getIdToken(true);
            localStorage.setItem('idToken', refreshedToken);
            /*console.log("✅ Token refreshed and saved to local storage", refreshedToken);
            console.log("✅ Logged in as:", user.email);*/

            // Fetch dashboard data using the token
            const dashboardRes = await fetch('https://recipegenerator2-0new-backend.onrender.com/dashboard', {//http://localhost:3000/dashboard
                method: 'GET',
                headers: {
                    Authorization:`Bearer ${refreshedToken}`,
                },
            });
            
            

            const dashboardData = await dashboardRes.json();
            /*console.log("📊 Dashboard data:", dashboardData);*/
            const justoggedIn = localStorage.getItem('justLoggedIn') === 'true';
            // Show alert and redirect only if user just logged in
            if (localStorage.getItem('justLoggedIn') === 'true') {
                //logged = true;
                
                localStorage.setItem('justLoggedIn', 'false');
                window.location.href = 'RecipeGenerator.html'; // Redirect to homepage/dashboard
                
            }else{
                localStorage.removeItem('idToken');
                
               // logged = false;
            }

        } catch (err) {
            console.error("❌ Failed to fetch dashboard:", err);
        }
    } else {
        
        console.log("👤 No user is currently logged in.");
        localStorage.removeItem('idToken'); // Cleanup
    }
});

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Access the email and password input fields
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        const res = await fetch('https://recipegenerator2-0new-backend.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'LoginFailed');

        console.log('Token from backend:', data.token);

        // 💾 Save user info in localStorage
        localStorage.setItem('username', data.name || 'User');
        localStorage.setItem('email', data.email);
        localStorage.setItem('idToken', data.idToken);
        localStorage.setItem('logged', 'true');
        // Sign in with the custom token, onAuthStateChanged will handle everything else
        await signInWithCustomToken(auth, data.token);
        loginForm.reset(); 
        window.location.href = 'RecipeGenerator.html'; // Redirect to dashboard page
        // Reset the form after successful login

    } catch (error) {
        alert("Login Failed: " + error.message);
        console.error(error);
    }
}); 

