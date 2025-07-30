import { auth } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// 🎨 Inject loading spinner overlay
const loader = document.createElement('div');
loader.id = 'signup-loader';
loader.innerHTML = `<div class="spinner"></div>`;
document.body.appendChild(loader);

const style = document.createElement('style');
style.innerHTML = `
#signup-loader {
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

// 💬 Password confirmation logic
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const confirmPasswordMessage = document.getElementById('passwordConfirmationError');

async function confirmPasswordFunc() {
    const passwordInput = password.value.trim();
    const confirmPasswordInput = confirmPassword.value.trim();

    if (confirmPasswordInput === "") {
        confirmPasswordMessage.style.display = "none";
        return;
    }

    if (passwordInput !== confirmPasswordInput) {
        confirmPasswordMessage.style.display = 'block';
        confirmPasswordMessage.style.color = "red";
        confirmPasswordMessage.textContent = 'Passwords do not match';
    } else {
        confirmPasswordMessage.style.color = "black";
        confirmPasswordMessage.textContent = "✅Passwords match";
    }
}

password.addEventListener('input', confirmPasswordFunc);
confirmPassword.addEventListener('input', confirmPasswordFunc);

// 📬 Signup form submission
const form = document.getElementById('signupForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('signup-loader').style.display = 'flex';

    const name = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // ✉️ Send email verification
        await sendEmailVerification(user);
        alert("Verification email sent. Please check your inbox.");

        // 🛰️ Notify backend (keep this untouched)
        const res = await fetch('https://recipegenerator2-0new-backend.onrender.com/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, email, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error("Signup Failed " + data.error);

        console.log("User created: " + data.username);
        form.reset();

        // Redirect after successful signup
        window.location.href = 'login.html';

    } catch (error) {
        alert("Signup Failed: " + error.message);
        console.error(error);
    } finally {
        document.getElementById('signup-loader').style.display = 'none';
    }
});

// 🧹 Clear local storage
localStorage.removeItem('idToken');
localStorage.removeItem('username');
localStorage.removeItem('email');
