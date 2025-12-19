/**********************
 * ESTADO GLOBAL
 **********************/
let meals = [];
let exercises = [];
let calorieGoal = 3200;
let proteinGoal = 150;
let userBiometrics = { weight: 0, fat: 0 };
let aiMode = "suggestions";

/**********************
 * PERSISTENCIA (LOCAL STORAGE)
 **********************/
function saveToDisk() {
    const data = {
        meals,
        exercises,
        calorieGoal,
        proteinGoal,
        userBiometrics,
        aiMode
    };
    localStorage.setItem('fitnessTrackerData', JSON.stringify(data));
}

function loadFromDisk() {
    const savedData = localStorage.getItem('fitnessTrackerData');
    if (savedData) {
        const data = JSON.parse(savedData);
        meals = data.meals || [];
        exercises = data.exercises || [];
        calorieGoal = data.calorieGoal || 3200;
        proteinGoal = data.proteinGoal || 150;
        userBiometrics = data.userBiometrics || { weight: 0, fat: 0 };
        aiMode = data.aiMode || "suggestions";

        // Rellenar campos biométricos
        document.getElementById("bodyWeight").value = userBiometrics.weight || "";
        document.getElementById("bodyFat").value = userBiometrics.fat || "";
        document.getElementById("aiMode").value = aiMode;
        
        renderMeals();
        renderExercises();
        updateTotals();
    }
}

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
  if (result.unknown) showToast("⚠️ IA: Alimento desconocido. Usando promedio.");
  else showToast("✅ IA: Análisis completado.");
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

    if (input.includes("entrenar") || input.includes("gimnasio") || input.includes("gym")) {
        calorieGoal -= 400;
        proteinGoal += 15;
        advice = "Protocolo sedentarismo: He reducido calorías y subido proteína para proteger el músculo.";
        adjustment = "📉 Meta: -400 kcal | 📈 Proteína: +15g";
    } else if (input.includes("comer") || input.includes("comida")) {
        calorieGoal -= 600;
        advice = "Ajuste de balance: He restado la comida perdida del objetivo diario.";
        adjustment = "📉 Ajuste: -600 kcal al total.";
    } else {
        advice = "Mantén la hidratación y el plan actual.";
        adjustment = "⚖️ Sin cambios drásticos necesarios.";
    }

    responseBox.textContent = `"${advice}"`;
    planBox.style.display = "block";
    planDetails.textContent = adjustment;
    updateTotals();
    saveToDisk();
    showToast("⚙️ IA: Plan re-calibrado");
}

/**********************
 * GESTIÓN DE DATOS
 **********************/
function addMeal() {
  const name = document.getElementById("mealName").value;
  const cal = Number(document.getElementById("mealCalories").value);
  const prot = Number(document.getElementById("mealProtein").value);
  if (!name || isNaN(cal)) return showToast("Faltan datos de comida");
  meals.push({ name, cal, prot, id: Date.now() });
  updateTotals();
  renderMeals();
  saveToDisk();
  ["mealName", "mealCalories", "mealProtein", "aiMealText"].forEach(id => document.getElementById(id).value = "");
}

function deleteMeal(id) {
  meals = meals.filter(m => m.id !== id);
  updateTotals();
  renderMeals();
  saveToDisk();
}

function renderMeals() {
  const list = document.getElementById("mealList");
  list.innerHTML = "";
  meals.forEach((m) => {
    const li = document.createElement("li");
    li.innerHTML = `<div><strong>${m.name}</strong><br><small>${m.cal} kcal | ${m.prot}g P</small></div><button onclick="deleteMeal(${m.id})" class="delete-btn">×</button>`;
    list.appendChild(li);
  });
}

function addExercise() {
  const name = document.getElementById("exerciseName").value;
  const sets = document.getElementById("workoutSets").value;
  const reps = document.getElementById("workoutReps").value;
  const weight = document.getElementById("workoutWeight").value || 0;
  if (!name || !sets || !reps) return showToast("Faltan datos");
  exercises.push({ name, sets, reps, weight, id: Date.now() });
  renderExercises();
  saveToDisk();
  showToast(`💪 ${name} registrado`);
  ["exerciseName", "workoutSets", "workoutReps", "workoutWeight"].forEach(id => document.getElementById(id).value = "");
}

function deleteExercise(id) {
  exercises = exercises.filter(ex => ex.id !== id);
  renderExercises();
  saveToDisk();
}

function renderExercises() {
  const list = document.getElementById("exerciseList");
  list.innerHTML = "";
  exercises.forEach(ex => {
    const li = document.createElement("li");
    li.innerHTML = `<div><strong>${ex.name}</strong><br><small>${ex.sets}x${ex.reps} ${ex.weight > 0 ? '| +' + ex.weight + 'kg' : ''}</small></div><button onclick="deleteExercise(${ex.id})" class="delete-btn">×</button>`;
    list.appendChild(li);
  });
}

/**********************
 * DASHBOARD Y AJUSTES
 **********************/
function updateTotals() {
  const totalCalories = meals.reduce((s, m) => s + m.cal, 0);
  const totalProtein = meals.reduce((s, m) => s + m.prot, 0);
  document.getElementById("calories").textContent = `${totalCalories} kcal`;
  document.getElementById("protein").textContent = `${totalProtein} g`;
  document.getElementById("calorieGoalDisplay").textContent = calorieGoal;
  const remaining = calorieGoal - totalCalories;
  const statusEl = document.getElementById("calStatus");
  if (statusEl) {
    statusEl.textContent = remaining > 0 ? `Faltan ${remaining} kcal` : "Meta superada";
    statusEl.style.color = remaining > 0 ? "var(--neon-blue)" : "var(--neon-pink)";
  }
}

function saveBiometrics() {
    userBiometrics.weight = document.getElementById("bodyWeight").value;
    userBiometrics.fat = document.getElementById("bodyFat").value;
    saveToDisk();
    showToast("🧬 Biometría sincronizada");
}

function saveAiSettings() {
    aiMode = document.getElementById("aiMode").value;
    saveToDisk();
    showToast("⚙️ Ajustes de IA guardados");
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
  loadFromDisk(); // Carga los datos al iniciar

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

  document.getElementById("analyzeMealBtn")?.addEventListener("click", handleAnalyze);
  document.getElementById("addMealBtn")?.addEventListener("click", addMeal);
  document.getElementById("compensateBtn")?.addEventListener("click", handleEmergencyCompensate);
  document.getElementById("addExerciseBtn")?.addEventListener("click", addExercise);
  document.getElementById("saveBodyBtn")?.addEventListener("click", saveBiometrics);
  document.getElementById("saveAiSettings")?.addEventListener("click", saveAiSettings);
}

window.onload = init;

// --- 1. MOTOR MATRIX RAIN ---
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#39ff14"; // Color Biohacker
    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 33);

// --- 2. EFECTO DE ESCRITURA IA ---
function typeWriter(text, elementId, speed = 30) {
    let i = 0;
    const element = document.getElementById(elementId);
    element.innerHTML = ""; // Limpiar antes de escribir
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// --- 3. MODIFICACIÓN DE LA FUNCIÓN DE COMPENSACIÓN (IA) ---
// Busca tu función handleEmergencyCompensate y cambia el final por esto:
function handleEmergencyCompensate() {
    // ... (todo tu código anterior de lógica de IA) ...
    
    // En lugar de responseBox.textContent = advice, usamos:
    typeWriter(advice, "aiResponse"); 
    
    // ¡LLAMATIVO!: Efecto visual de hackeo al calcular
    document.body.classList.add("security-breach");
    setTimeout(() => document.body.classList.remove("security-breach"), 500);
}

// --- 4. MODIFICACIÓN DE SINCRONIZACIÓN ---
// Busca tu función saveBiometrics y añade esto:
function saveBiometrics() {
    userBiometrics.weight = document.getElementById("bodyWeight").value;
    userBiometrics.fat = document.getElementById("bodyFat").value;
    saveToDisk();
    
    // ¡LLAMATIVO!: Mensaje estilo terminal
    showToast(">> UPLOADING_BIOMETRICS... DONE");
    
    // Aumentar la velocidad de la matriz por un momento
    canvas.style.opacity = "0.8";
    setTimeout(() => canvas.style.opacity = "0.15", 1000);
}
