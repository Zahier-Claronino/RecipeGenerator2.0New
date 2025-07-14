import { auth } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');

const confirmPasswordMessage = document.getElementById('passwordConfirmationError');


async function confirmPasswordFunc(){
    
    const passwordInput =  password.value.trim();
    const confirmPasswordInput = confirmPassword.value.trim();
    

    if (confirmPasswordInput === ""){
        confirmPasswordMessage.style.display = "none";
        return;
    }

    if (passwordInput !== confirmPasswordInput){
        confirmPasswordMessage.style.display = 'block';
        confirmPasswordMessage.style.color = "red";
        confirmPasswordMessage.textContent = 'Passwords do not match';
    }else{
        confirmPasswordMessage.style.color = "black";
        confirmPasswordMessage.textContent = "✅Passwords match";
    }
}

password.addEventListener('input', confirmPasswordFunc);
confirmPassword.addEventListener('input',confirmPasswordFunc);



const form = document.getElementById('signupForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const res = await fetch('https://recipegenerator2-0new-backend.onrender.com/signup', { //http://localhost:3000/signup
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json',
            },
            body:JSON.stringify({name,username,email,password}),
        });

        const data = await res.json();
        if(!res.ok) throw new Error("Signup Failed " + data.error);

        alert("signup Successful!");
        console.log("user Created " + data.username);

        form.reset();

        window.location.href = 'login.html'; // Redirect to login page after successful signup
    }catch (error) {
        alert("Signup Failed: " + error.message);
        console.error(error);
    }
});

localStorage.removeItem('idToken'); // Clear token from local storage
localStorage.removeItem('username'); // Clear username from local storage
localStorage.removeItem('email'); // Clear email from local storage
