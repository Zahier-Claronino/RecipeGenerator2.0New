// Import Firestore stuff and helper functions from your config file
import { db, serverTimestamp } from './firebaseConfig.js';

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

// Example function to save the recipe
async function saveRecipeToFirestore(title, ingredients) {
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





const generateBtn = document.getElementById("generate-btn");
generateBtn.addEventListener("click", generateRecipe);

async function generateRecipe() {
  const ingredients = document.getElementById("ingredients").value.trim();
  const result = document.getElementById("result");

  if (!ingredients) {
    alert("Please enter some ingredients.");
    return;
  }

  result.textContent = "Generating recipe... please wait.";

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
    const cohereResponse = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: "Bearer 7NiBcnXBgwnBJlU5UTtodGKruHzGViokIulBkyeR",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command",
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.1,
      }),
    });

    if (!cohereResponse.ok) {
      result.textContent = `❌ Cohere API error: ${cohereResponse.status} ${cohereResponse.statusText}`;
      return;
    }

    const cohereData = await cohereResponse.json();

    if (!(cohereData.generations && cohereData.generations.length > 0)) {
      result.textContent = "❌ No recipe generated. Try again or check your API key.";
      return;
    }

    const recipeText = cohereData.generations[0].text.trim();
    const recipeTitles = [...recipeText.matchAll(/Recipe Name:\s*(.+)/g)].map((m) => m[1]);

    result.innerHTML = "";
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.justifyContent = "center";
    container.style.borderRadius = "10px";

    const recipes = recipeText.split("---").map((r) => r.trim()).filter(Boolean);

    for (let i = 0; i < recipes.length; i++) {
      const recipeDiv = document.createElement("div");
      recipeDiv.style.background = "whitesmoke";
      recipeDiv.style.color = "darkslategray";
      recipeDiv.style.display = "flex";
      recipeDiv.style.flexDirection = "column";
      recipeDiv.style.justifyContent = "start";

      const title = recipeTitles[i] || `Recipe ${i + 1}`;
      const titleElem = document.createElement("h3");
      titleElem.textContent = title;
      recipeDiv.appendChild(titleElem);

      const contentRow = document.createElement("div");
      contentRow.style.display = "flex";

      const pre = document.createElement("pre");
      pre.style.whiteSpace = "pre-wrap";
      pre.style.backgroundColor = "lightblue";
      pre.style.color = "black";
      pre.style.flex = "1";
      pre.textContent = recipes[i];
      contentRow.appendChild(pre);

      // Save each recipe to Firestore here:
      const recipeIngredients = extractIngredientsFromRecipe(recipes[i]);
      await saveRecipeToFirestore(title, recipeIngredients);
      console.log(`Saved recipe: ${title}`);

      // 🖼️ Image loader container
      const imageWrapper = document.createElement("div");
      imageWrapper.style.position = "relative";
      imageWrapper.style.display = "flex";
      imageWrapper.style.alignItems = "start";
      imageWrapper.style.justifyContent = "start";
      imageWrapper.style.width = "40%";

      // ⏳ Spinner
      const spinner = document.createElement("div");
      spinner.className = "spinner";
      spinner.style.border = "6px solid #f3f3f3";
      spinner.style.borderTop = "6px solid #3498db";
      spinner.style.borderRadius = "50%";
      spinner.style.width = "40px";
      spinner.style.height = "40px";
      spinner.style.animation = "spin 1s linear infinite";
      imageWrapper.appendChild(spinner);

      // 📷 Image
      const img = document.createElement("img");
      img.style.maxWidth = "100%";
      img.style.display = "none";
      img.style.flex = "1";
      img.src = generateImagePollinations(`${title}`);
      img.alt = title;
      img.style.marginTop = "17.5px";

      img.onload = () => {
        spinner.remove();
        img.style.display = "block";
        requestAnimationFrame(() => {
          const H = pre.offsetHeight;
          img.style.height = `${H}px`;
          console.log("Image height set to:", img.style.height);
        });
      };

      img.onerror = () => {
        spinner.remove();
        const errorText = document.createElement("div");
        errorText.textContent = "⚠️ Image failed to load.";
        imageWrapper.appendChild(errorText);
      };

      imageWrapper.appendChild(img);
      contentRow.appendChild(imageWrapper);

      recipeDiv.appendChild(contentRow);
      container.appendChild(recipeDiv);
    }

    result.appendChild(container);
  } catch (err) {
    result.textContent = "❌ An error occurred while generating the recipe.";
    console.error(err);
  }
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
    WelcomeUser.textContent = `Welcome ${username}, Lets cook.`;
  }
}











    
