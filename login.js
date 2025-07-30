import { auth } from "./firebaseConfig.js";  
import { signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const loader = document.createElement('div');
loader.id = 'login-loader';
loader.innerHTML = `<div class="spinner"></div>`;
document.body.appendChild(loader);

const style = document.createElement('style');
style.innerHTML = `
#login-loader {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(3px);
    background-color: rgba(0,0,0,0.5);
    z-index: 9999;
    justify-content: center;
    align-items: center;
}
.spinner {
    border: 6px solid #f3f3f3;
    border-top: 6px solid #00bfff;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    animation: spin 1s linear infinite;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);

localStorage.setItem('logged', 'false');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const refreshedToken = await user.getIdToken(true);
            localStorage.setItem('idToken', refreshedToken);

            const dashboardRes = await fetch('https://recipegenerator2-0new-backend.onrender.com/dashboard', {
                method: 'GET',
                headers: {
                    Authorization:`Bearer ${refreshedToken}`,
                },
            });

            const dashboardData = await dashboardRes.json();
            const justLoggedIn = localStorage.getItem('justLoggedIn') === 'true';

            if (justLoggedIn) {
                localStorage.setItem('justLoggedIn', 'false');
                window.location.href = 'RecipeGenerator.html';
            } else {
                localStorage.removeItem('idToken');
            }

        } catch (err) {
            console.error("❌ Failed to fetch dashboard:", err);
        }
    } else {
        console.log("👤 No user is currently logged in.");
        localStorage.removeItem('idToken');
    }
});

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.getElementById('login-loader').style.display = 'flex';

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        // ✅ First, sign in the user using Firebase to check email verification
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            throw new Error("Please verify your email before logging in.");
        }

        // 🔐 Now it's verified, proceed with backend login
        const res = await fetch('https://recipegenerator2-0new-backend.onrender.com/login', {
            method: 'POST',
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'LoginFailed');

        console.log('Token from backend:', data.token);

        localStorage.setItem('username', data.name || 'User');
        localStorage.setItem('email', data.email);
        localStorage.setItem('idToken', data.idToken);
        localStorage.setItem('logged', 'true');
        localStorage.setItem('justLoggedIn', 'true');

        await signInWithCustomToken(auth, data.token);

        loginForm.reset(); 
        window.location.href = 'RecipeGenerator.html';

    } catch (error) {
        alert("Login Failed: " + error.message);
        console.error(error);
    } finally {
        document.getElementById('login-loader').style.display = 'none';
    }
});

