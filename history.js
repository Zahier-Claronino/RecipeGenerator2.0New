// import { db } from './firebaseConfig.js';
// import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
// import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// const auth = getAuth();

// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     const recipesRef = collection(db, "users", user.uid, "recipes");
//     const snapshot = await getDocs(recipesRef);

//     const recipeListDiv = document.getElementById("recipeList");
//     recipeListDiv.innerHTML = ""; // Clear old content

//     if (snapshot.empty) {
//       recipeListDiv.innerHTML = `
//         <p style="font-size: 1.2rem; font-weight: 500; font-family: 'Segoe UI'; color: #555;
//         background: linear-gradient(to right, #fbc2eb, #a6c1ee); padding: 1rem 1.5rem;
//         border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
//         max-width: 400px; margin: 2rem auto; text-align: center;">
//           🍽️ You haven’t saved any recipes yet. Cook something up first!
//         </p>`;
//     } else {
//       snapshot.forEach(doc => {
//         const recipe = doc.data();
//         const recipeEl = document.createElement("div");
//         recipeEl.classList.add("recipe-card");

//         recipeEl.innerHTML = `
//           <h3>${recipe.title}</h3>
//           <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
//           <p><strong>Instructions:</strong> ${recipe.instructions || "No instructions provided."}</p>
//           <hr/>
//         `;

//         recipeListDiv.appendChild(recipeEl);
//       });
//     }
//   } else {
//     window.location.href = "login.html";
//   }
// });
import { db } from './firebaseConfig.js';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

const auth = getAuth();
const recipeListDiv = document.getElementById("recipeList");
const saveRecipeForm = document.getElementById("saveRecipeForm"); // Your form to save a recipe

// Wait for auth state
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const recipesRef = collection(db, "users", user.uid, "recipes");

  // Function to display recipes
  async function displayRecipes() {
    const snapshot = await getDocs(recipesRef);
    recipeListDiv.innerHTML = ""; // Clear old content

    if (snapshot.empty) {
      recipeListDiv.innerHTML = `
        <p style="font-size: 1.2rem; font-weight: 500; font-family: 'Segoe UI'; color: #555;
        background: linear-gradient(to right, #fbc2eb, #a6c1ee); padding: 1rem 1.5rem;
        border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        max-width: 400px; margin: 2rem auto; text-align: center;">
          🍽️ You haven’t saved any recipes yet. Cook something up first!
        </p>`;
    } else {
      snapshot.forEach(doc => {
        const recipe = doc.data();
        const recipeEl = document.createElement("div");
        recipeEl.classList.add("recipe-card");

        recipeEl.innerHTML = `
          <h3>${recipe.title}</h3>
          <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join("")}</ul>
          <p><strong>Instructions:</strong> ${recipe.instructions || "No instructions provided."}</p>
          <p style="font-size:0.8rem; color:#888;">Saved: ${recipe.timestamp?.toDate().toLocaleString() || "N/A"}</p>
          <hr/>
        `;

        recipeListDiv.appendChild(recipeEl);
      });
    }
  }

  // Display recipes on load
  displayRecipes();

  // Handle saving new recipe from form
  if (saveRecipeForm) {
    saveRecipeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const title = saveRecipeForm.title.value.trim();
      const ingredients = saveRecipeForm.ingredients.value.split(",").map(i => i.trim());
      const instructions = saveRecipeForm.instructions.value.trim();

      if (!title) return alert("Recipe must have a title!");

      await addDoc(recipesRef, {
        title,
        ingredients,
        instructions,
        timestamp: serverTimestamp()
      });

      saveRecipeForm.reset();
      displayRecipes(); // Refresh the list
    });
  }
});
