import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-analytics.js";
        import{ getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
        // TODO: Add SDKs for Firebase products that you want to use
        // https://firebase.google.com/docs/web/setup#available-libraries

        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: "AIzaSyBjkbvEon6S8GTiZ8uU2DRryk__iDqdx-U",
            authDomain: "recipegenerator-5e9de.firebaseapp.com",
            projectId: "recipegenerator-5e9de",
            storageBucket: "recipegenerator-5e9de.firebasestorage.app",
            messagingSenderId: "801354484347",
            appId: "1:801354484347:web:e3e85b1afea811a4cfb0de",
            measurementId: "G-8DPJQ3J8BR"
        };

        

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const analytics = getAnalytics(app);

        export{app, auth};