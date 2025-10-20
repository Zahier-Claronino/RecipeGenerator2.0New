// Import Firestore stuff and helper functions from your config file
import { db, serverTimestamp } from './firebaseConfig.js';
import { doc, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Import only what you need from Firebase SDK (auth functions)
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// Import auth instance from your config (already initialized)
import { auth } from './firebaseConfig.js';
let currentUser = null;


onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("✅ Auth state ready. Logged in as:", user.email);
    currentUser = user;
  } else {
    console.log("🚫 Auth state ready. Not logged in.");
    currentUser = null;
  }
});

// Add loading spinner container to DOM (hidden by default)
const loadingSpinner = document.createElement("div");
loadingSpinner.id = "loading-spinner";
loadingSpinner.style.position = "fixed";
loadingSpinner.style.top = "0";
loadingSpinner.style.left = "0";
loadingSpinner.style.width = "100%";
loadingSpinner.style.height = "100%";
loadingSpinner.style.backgroundColor = "rgba(0,0,0,0.4)";
loadingSpinner.style.display = "none";
loadingSpinner.style.alignItems = "center";
loadingSpinner.style.justifyContent = "center";
loadingSpinner.style.zIndex = "9999";

const spinnerCircle = document.createElement("div");
spinnerCircle.style.border = "16px solid #f3f3f3";
spinnerCircle.style.borderTop = "16px solid #3498db";
spinnerCircle.style.borderRadius = "50%";
spinnerCircle.style.width = "120px";
spinnerCircle.style.height = "120px";
spinnerCircle.style.animation = "spin 2s linear infinite";

loadingSpinner.appendChild(spinnerCircle);
document.body.appendChild(loadingSpinner);

// Add spinner keyframes style
const style = document.createElement("style");
style.textContent = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);


// Example function to save the recipe
async function saveRecipeToFirestore(title, ingredients, instructions) {
  if (!currentUser) {
    console.warn("Not logged in, not saving recipe.");
    return;
  }

  try {
    const userRef = doc(db, "users", currentUser.uid);
    const recipesRef = collection(userRef, "recipes");
    await addDoc(recipesRef, {
      title,
      ingredients,
      instructions: instructions || "No instructions provided.",
      createdAt: serverTimestamp()
      
    });
    console.log("✅ Recipe saved!");
  } catch (error) {
    console.error("❌ Error saving recipe:", error);
  }
}

function extractIngredientsFromRecipe(recipeString) {
  const ingredientsMatch = recipeString.match(/Ingredients:\n([\s\S]*?)\n\nInstructions:/);
  if (!ingredientsMatch) return [];

  // Split ingredients by lines, remove the '- ' prefix
  return ingredientsMatch[1].split('\n').map(line => line.replace(/^\-\s*/, '').trim());
}

function extractInstructionsFromRecipe(recipeString) {
  const instructionsMatch = recipeString.match(/Instructions:\n([\s\S]*)/);
  if (!instructionsMatch) return "No instructions provided.";

  return instructionsMatch[1].trim();
}



const generateBtn = document.getElementById("generate-btn");
generateBtn.addEventListener("click", generateRecipe);

async function generateRecipe() {
  const ingredients = document.getElementById("ingredients").value.trim();
  const result = document.getElementById("result");

  if (!ingredients) {
    alert("Please enter some ingredients.");
    return;
  }

  // Show the loading spinner
  loadingSpinner.style.display = "flex";

  result.textContent = "Generating recipe... please wait.(Wait Time: 10s-45s)";

  const prompt = `You are a professional chef. Based ONLY on the following ingredients: ${ingredients}, generate as many complete recipes as possible.

Rules:
- Do NOT use any ingredient that is not listed.
- Do NOT assume pantry items like salt, pepper, or oil unless explicitly listed.
- If a complete recipe is not possible, suggest a simple preparation using the given items.
- Be creative, but strict about the available ingredients.
-IMPORTANT: If the ingredients list does NOT contain food, or if it contains something obviously unrelated (like 'car', 'rock', or 'computer'), then reply only with:
"Sorry, I only provide recipes based on food ingredients."

DO NOT attempt to turn non-food items into a recipe.

For each recipe, use this format:

Recipe Name: [Title]
Ingredients:
- [ingredient 1]
- [ingredient 2]
- ...

Instructions:
1. [Step 1]
2. [Step 2]
3. ...

Separate each recipe clearly with a dashed line (---).`;

 try {
  const cohereResponse = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      Authorization: "Bearer V8ZgHC0BnnsNkIGaPv6CatEpnhVRPwHwX9ptxcW0",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "command-xlarge-nightly", // Use a model from your key's available models
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.1,
    }),
  });

  if (!cohereResponse.ok) {
    result.textContent = `❌ Cohere API error: ${cohereResponse.status} ${cohereResponse.statusText}`;
    loadingSpinner.style.display = "none"; // Hide spinner on error
    return;
  }

  const cohereData = await cohereResponse.json();

  // Updated path to text: v2/chat returns an array in `response`
  if (!(cohereData.response && cohereData.response.length > 0)) {
    result.textContent = "❌ No recipe generated. Try again or check your API key.";
    loadingSpinner.style.display = "none"; // Hide spinner on error
    return;
  }

  const recipeText = cohereData.response[0].message.content.trim();
  const recipeTitles = [...recipeText.matchAll(/Recipe Name:\s*(.+)/g)].map((m) => m[1]);

  // ...rest of your code stays the same (recipe splitting, DOM creation, Firestore save, image loader)
  
} catch (err) {
  result.textContent = "❌ An error occurred while generating the recipe.";
  console.error(err);
  loadingSpinner.style.display = "none";
}

// 🔧 Helper: Generate image URL using Pollinations
function generateImagePollinations(prompt) {
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}`;
}



document.getElementById("ingredients").addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent form submission or weird behavior
    document.getElementById("generate-btn").click(); // Trigger the button click
  }
});


const logout = document.getElementById('logout');
const login = document.getElementById('login');
const signup = document.getElementById('signup');
logout.addEventListener('click', function(){
  signOut(auth).then( async () => {

    
    
    console.log("User signed out successfully.");
    alert("You have been logged out successfully.");
    
    
    localStorage.removeItem('idToken'); // Clear token from local storage
    localStorage.removeItem('username'); // Clear username from local storage
    localStorage.removeItem('email'); // Clear email from local storage
    localStorage.setItem('justLoggedIn', 'false'); // Reset justLoggedIn flag
    localStorage.setItem('logged', 'false'); // Reset logged status
    window.location.href = 'login.html';

  });
    
});

//remove logout button if not signed in (remember to add a sign up and sign in option if the user is not signed in)
/*onAuthStateChanged(auth, (user) => {
  if(!user){
    logout.style.display = 'none';
  }

  if(user){
    logout.style.display = 'block'
  }
});*/
const WelcomeUser = document.getElementById('WelcomeUser');
const username = localStorage.getItem('username');
if(localStorage.getItem('logged') === 'false'){
  logout.style.display = 'none';
  login.style.display = 'block';
  signup.style.display = 'block';
  localStorage.removeItem('idToken');


}else if(localStorage.getItem('logged') === 'true'){
  logout.style.display = 'block';
  login.style.display = 'none';
  signup.style.display = 'none';
  if (WelcomeUser && username) {
    WelcomeUser.textContent = `Welcome ${username}, Lets Cook`;
  }
}











    



