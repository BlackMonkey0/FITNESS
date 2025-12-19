/**********************
 * ESTADO GLOBAL
 **********************/
let meals = [];
let exercises = [];
let totalCalories = 0;
let totalProtein = 0;

// Objetivos dinámicos que la IA puede modificar
let calorieGoal = 3200;
let proteinGoal = 150;

/**********************
 * BASE DE DATOS DE ALIMENTOS
 **********************/
const foodDatabase = {
  arroz: { calories: 130, protein: 2.5 },
  pollo: { calories: 165, protein: 31 },
  huevo: { calories: 155, protein: 13 },
  avena: { calories: 389, protein: 17 },
  pasta: { calories: 350, protein: 12 },
  atun: { calories: 130, protein: 29 },
  ternera: { calories: 250, protein: 26 },
  manzana: { calories: 52, protein: 0.3 },
  platano: { calories: 89, protein: 1.1 },
  leche: { calories: 42, protein: 3.4 },
  pan: { calories: 260, protein: 9 },
  queso: { calories: 400, protein: 25 }
};

/**********************
 * IA LOCAL - ANALIZADOR DE COMIDAS
 **********************/
function analyzeMealLocally(text) {
  text = text.toLowerCase();
  let calories = 0;
  let protein = 0;
  let found = false;

  Object.keys(foodDatabase).forEach(food => {
    if (text.includes(food)) {
      // Detecta números antes del alimento (ej: "2 huevos")
      const regex = new RegExp(`(\\d+)\\s*${food}`);
      const match = text.match(regex);
      const quantity = match ? parseInt(match[1]) : 1;

      calories += foodDatabase[food].calories * quantity;
      protein += foodDatabase[food].protein * quantity;
      found = true;
    }
  });

  return found ? { calories, protein } : { calories: 450, protein: 25, unknown: true };
}

function handleAnalyze() {
  const text = document.getElementById("aiMealText").value;
  if (!text) return showToast("Escribe qué has comido...");

  const result = analyzeMealLocally(text);
  
  document.getElementById("mealName").value = text;
  document.getElementById("mealCalories").value = Math.round(result.calories);
  document.getElementById("mealProtein").value = Math.round(result.protein);
  
  if (result.unknown) {
    showToast("⚠️ IA: Alimento desconocido. Usando promedio genérico.");
  } else {
    showToast("✅ IA: Análisis completado.");
  }
}

/**********************
 * MOTOR DE COMPENSACIÓN (IA COACH)
 **********************/
function handleEmergencyCompensate() {
    const input = document.getElementById("aiEmergencyText").value.toLowerCase();
    const responseBox = document.getElementById("aiResponse");
    const planBox = document.getElementById("adjustmentPlan");
    const planDetails = document.getElementById("planDetails");
    
    if (!input) return showToast("Dime qué ha pasado...");

    let advice = "";
    let adjustment = "";

    if (input.includes("entrenar") || input.includes("gimnasio") || input.includes("gym") || input.includes("ejercicio")) {
        calorieGoal -= 400;
        proteinGoal += 15;
        advice = "Protocolo de sedentarismo activado. He reducido tu meta calórica para evitar exceso de grasa hoy.";
        adjustment = "📉 Meta: -400 kcal | 📈 Proteína: +15g (Protección muscular)";
    } 
    else if (input.includes("comer") || input.includes("cenar") || input.includes("comida")) {
        calorieGoal -= 600;
        advice = "Entendido. Ajustaré el balance diario restando esa comida para mantener el déficit/superávit controlado.";
        adjustment = "📉 Ajuste por comida perdida: -600 kcal al objetivo total.";
    }
    else {
        advice = "Analizando situación... Te recomiendo priorizar la hidratación y mantener los macros actuales.";
        adjustment = "⚖️ Mantener plan original con foco en hidratación.";
    }

    responseBox.textContent = `"${advice}"`;
    planBox.style.display = "block";
    planDetails.textContent = adjustment;
    
    updateTotals();
    showToast("⚙️ IA: Plan re-calibrado");
}

/**********************
 * GESTIÓN DE COMIDAS
 **********************/
function addMeal() {
  const name = document.getElementById("mealName").value;
  const cal = Number(document.getElementById("mealCalories").value);
  const prot = Number(document.getElementById("mealProtein").value);

  if (!name || isNaN(cal)) return showToast("Faltan datos de comida");

  meals.push({ name, cal, prot, id: Date.now() });
  updateTotals();
  renderMeals();
  
  ["mealName", "mealCalories", "mealProtein", "aiMealText"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

function deleteMeal(id) {
  meals = meals.filter(m => m.id !== id);
  updateTotals();
  renderMeals();
}

function renderMeals() {
  const list = document.getElementById("mealList");
  list.innerHTML = "";
  meals.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>${m.name}</strong><br><small>${m.cal} kcal | ${m.prot}g P</small></div>
      <button onclick="deleteMeal(${m.id})" class="delete-btn">×</button>
    `;
    list.appendChild(li);
  });
}

/**********************
 * GESTIÓN DE ENTRENAMIENTO
 **********************/
function addExercise() {
  const name = document.getElementById("exerciseName").value;
  const sets = document.getElementById("workoutSets").value;
  const reps = document.getElementById("workoutReps").value;
  const weight = document.getElementById("workoutWeight").value || 0;

  if (!name || !sets || !reps) return showToast("Faltan datos de ejercicio");

  exercises.push({ name, sets, reps, weight, id: Date.now() });
  renderExercises();
  showToast(`💪 ${name} registrado`);

  ["exerciseName", "workoutSets", "workoutReps", "workoutWeight"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

function deleteExercise(id) {
  exercises = exercises.filter(ex => ex.id !== id);
  renderExercises();
}

function renderExercises() {
  const list = document.getElementById("exerciseList");
  list.innerHTML = "";
  exercises.forEach(ex => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${ex.name}</strong><br>
        <small>${ex.sets}x${ex.reps} ${ex.weight > 0 ? '| +' + ex.weight + 'kg mochila' : '(Sin peso)'}</small>
      </div>
      <button onclick="deleteExercise(${ex.id})" class="delete-btn">×</button>
    `;
    list.appendChild(li);
  });
}

/**********************
 * DASHBOARD Y UI
 **********************/
function updateTotals() {
  totalCalories = meals.reduce((s, m) => s + m.cal, 0);
  totalProtein = meals.reduce((s, m) => s + m.prot, 0);
  
  document.getElementById("calories").textContent = `${totalCalories} kcal`;
  document.getElementById("protein").textContent = `${totalProtein} g`;
  document.getElementById("calorieGoal").textContent = calorieGoal;
  
  const remaining = calorieGoal - totalCalories;
  const statusEl = document.getElementById("calStatus");
  
  if (statusEl) {
    statusEl.textContent = remaining > 0 ? `Faltan ${remaining} kcal` : "Meta superada";
    statusEl.style.color = remaining > 0 ? "var(--neon-blue)" : "var(--neon-pink)";
  }
}

function showToast(msg) {
  const container = document.getElementById("toasts");
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

/**********************
 * NAVEGACIÓN E INICIO
 **********************/
function init() {
  // Pestañas
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.id === 'toggleCompact') {
        document.body.classList.toggle('compact');
        return;
      }
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.target).classList.add('active');
    });
  });

  // Eventos de botones
  document.getElementById("analyzeMealBtn")?.addEventListener("click", handleAnalyze);
  document.getElementById("addMealBtn")?.addEventListener("click", addMeal);
  document.getElementById("compensateBtn")?.addEventListener("click", handleEmergencyCompensate);
  document.getElementById("addExerciseBtn")?.addEventListener("click", addExercise);
  
  updateTotals();
}

window.onload = init;