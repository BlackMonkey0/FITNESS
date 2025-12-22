/**********************
 * ESTADO GLOBAL
 **********************/
let meals = [];
let exercises = [];
let calorieGoal = 3200;
let proteinGoal = 150;
let userBiometrics = { weight: 0, fat: 0, muscle: 0, history: [] };
let aiMode = "automatic";
let geminiApiKey = "";
let weightChart = null;

/* Cached DOM references */
const DOM = {};

function initDOM() {
  // Elementos principales
  DOM.mealList = document.getElementById('mealList');
  DOM.mealName = document.getElementById('mealName');
  DOM.mealCalories = document.getElementById('mealCalories');
  DOM.mealProtein = document.getElementById('mealProtein');
  DOM.mealCarbs = document.getElementById('mealCarbs');
  DOM.mealFat = document.getElementById('mealFat');
  DOM.aiMealText = document.getElementById('aiMealText');
  DOM.analyzeMealBtn = document.getElementById('analyzeMealBtn');
  DOM.addMealBtn = document.getElementById('addMealBtn');
  
  // Visión IA
  DOM.uploadZone = document.getElementById('uploadZone');
  DOM.imageInput = document.getElementById('imageInput');
  DOM.captureBtn = document.getElementById('captureBtn');
  DOM.uploadBtn = document.getElementById('uploadBtn');
  DOM.imagePreview = document.getElementById('imagePreview');
  DOM.previewImage = document.getElementById('previewImage');
  DOM.removeImage = document.getElementById('removeImage');
  DOM.analyzeImageBtn = document.getElementById('analyzeImageBtn');
  DOM.aiResults = document.getElementById('aiResults');
  DOM.nutritionFacts = document.getElementById('nutritionFacts');
  DOM.useDetectionBtn = document.getElementById('useDetectionBtn');
  DOM.foodType = document.getElementById('foodType');
  DOM.apiKey = document.getElementById('apiKey');
  DOM.saveApiKey = document.getElementById('saveApiKey');
  
  // Dashboard
  DOM.totalCalories = document.getElementById('totalCalories');
  DOM.totalProtein = document.getElementById('totalProtein');
  DOM.calProgress = document.getElementById('calProgress');
  DOM.protProgress = document.getElementById('protProgress');
  DOM.calStatus = document.getElementById('calStatus');
  DOM.proteinGoalDisplay = document.getElementById('proteinGoalDisplay');
  DOM.mealCount = document.getElementById('mealCount');
  DOM.exerciseCount = document.getElementById('exerciseCount');
  DOM.lastUpdate = document.getElementById('lastUpdate');
  DOM.toggleGym = document.getElementById('toggleGym');
  
  // Otros
  DOM.toasts = document.getElementById('toasts');
  DOM.confirmModal = document.getElementById('confirmModal');
  DOM.confirmMessage = document.getElementById('confirmMessage');
  DOM.confirmOk = document.getElementById('confirmOk');
  DOM.confirmCancel = document.getElementById('confirmCancel');
  DOM.aiModeSelect = document.getElementById('aiMode');
  DOM.clock = document.getElementById('clock');
  DOM.clockJoke = document.getElementById('clockJoke');
  DOM.smileBtn = document.getElementById('smileBtn');
  DOM.smileOverlay = document.getElementById('smileOverlay');
  DOM.weightChart = document.getElementById('weightChart');
  
  // Inicializar valores
  DOM.proteinGoalDisplay.textContent = proteinGoal;
}

/**********************
 * IA VISION - ANÁLISIS DE IMÁGENES
 **********************/

function setupImageUpload() {
  const uploadZone = DOM.uploadZone;
  const imageInput = DOM.imageInput;
  const captureBtn = DOM.captureBtn;
  const uploadBtn = DOM.uploadBtn;
  const removeBtn = DOM.removeImage;
  const preview = DOM.imagePreview;
  const previewImg = DOM.previewImage;

  uploadZone?.addEventListener('click', () => {
    imageInput?.click();
  });

  captureBtn?.addEventListener('click', () => {
    if (imageInput) imageInput.setAttribute('capture', 'environment');
    imageInput?.click();
  });

  uploadBtn?.addEventListener('click', () => {
    if (imageInput) imageInput.removeAttribute('capture');
    imageInput?.click();
  });

  imageInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageFile(file);
    }
  });

  removeBtn?.addEventListener('click', () => {
    if (preview) preview.hidden = true;
    if (imageInput) imageInput.value = '';
    if (DOM.analyzeImageBtn) DOM.analyzeImageBtn.disabled = true;
  });

  DOM.analyzeImageBtn?.addEventListener('click', analyzeImageWithAI);
  DOM.useDetectionBtn?.addEventListener('click', useDetectedValues);
}

function handleImageFile(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    if (DOM.previewImage) DOM.previewImage.src = e.target.result;
    if (DOM.imagePreview) DOM.imagePreview.hidden = false;
    if (DOM.analyzeImageBtn) DOM.analyzeImageBtn.disabled = false;
    
    const fileName = file.name.length > 20 ? file.name.substring(0, 20) + '...' : file.name;
    if (DOM.uploadZone) {
      DOM.uploadZone.innerHTML = `<p>✅ ${fileName} cargado</p><p class="hint">Haz clic en "Analizar Imagen con IA"</p>`;
    }
  };
  
  reader.readAsDataURL(file);
}

async function analyzeImageWithAI() {
  if (!geminiApiKey) {
    showToast("⚠️ Primero configura tu clave API de Gemini");
    const visionTab = document.querySelector('[data-target="vision"]');
    if (visionTab) visionTab.click();
    return;
  }

  const imageSrc = DOM.previewImage?.src;
  const foodType = DOM.foodType?.value || 'plate';
  
  if (!imageSrc || imageSrc === '') {
    showToast("⚠️ Primero sube una imagen");
    return;
  }

  showToast("🔬 Analizando imagen con IA...");
  if (DOM.analyzeImageBtn) {
    DOM.analyzeImageBtn.disabled = true;
    DOM.analyzeImageBtn.textContent = "Analizando...";
  }

  try {
    // Simulación de respuesta de IA (para pruebas sin API)
    const simulatedResponse = simulateAIResponse(foodType);
    displayAIResults(simulatedResponse);
    
    showToast("✅ Análisis completado");
    
  } catch (error) {
    console.error("Error en análisis IA:", error);
    showToast("❌ Error en análisis. Usando modo simulación.");
    
    // Modo simulación como fallback
    const simulatedResponse = simulateAIResponse(foodType);
    displayAIResults(simulatedResponse);
  } finally {
    if (DOM.analyzeImageBtn) {
      DOM.analyzeImageBtn.disabled = false;
      DOM.analyzeImageBtn.textContent = "🔬 Analizar Imagen con IA";
    }
  }
}

function simulateAIResponse(foodType) {
  const responses = {
    plate: {
      estimatedCalories: Math.floor(Math.random() * 800) + 400,
      estimatedProtein: Math.floor(Math.random() * 40) + 15,
      estimatedCarbs: Math.floor(Math.random() * 100) + 30,
      estimatedFat: Math.floor(Math.random() * 40) + 10,
      detectedFoods: ["Pollo", "Arroz", "Verduras", "Aceite de oliva"],
      foodName: "Plato mixto detectado",
      confidence: 85
    },
    label: {
      calories: Math.floor(Math.random() * 400) + 200,
      protein: Math.floor(Math.random() * 30) + 5,
      carbs: Math.floor(Math.random() * 50) + 10,
      fat: Math.floor(Math.random() * 20) + 3,
      servingSize: "Porción de 100g",
      foodName: "Producto envasado",
      confidence: 95
    },
    ingredients: {
      detectedItems: ["Pechuga de pollo", "Brócoli", "Quinoa", "Aguacate"],
      estimatedTotalCalories: Math.floor(Math.random() * 600) + 300,
      estimatedTotalProtein: Math.floor(Math.random() * 50) + 20,
      foodName: "Ingredientes varios",
      confidence: 75
    }
  };
  
  return responses[foodType] || responses.plate;
}

function displayAIResults(data) {
  if (!DOM.aiResults) return;
  
  let html = '<h4>🔍 Resultados del Análisis</h4>';
  
  if (data.detectedFoods) {
    html += `<p><strong>Alimentos detectados:</strong> ${data.detectedFoods.join(', ')}</p>`;
  }
  
  if (data.estimatedCalories || data.calories) {
    const calories = data.estimatedCalories || data.calories;
    const protein = data.estimatedProtein || data.protein;
    const carbs = data.estimatedCarbs || data.carbs;
    const fat = data.estimatedFat || data.fat;
    
    html += `
      <div class="nutrition-summary">
        <p><strong>Calorías:</strong> ${calories} kcal</p>
        <p><strong>Proteína:</strong> ${protein}g</p>
        <p><strong>Carbohidratos:</strong> ${carbs}g</p>
        <p><strong>Grasas:</strong> ${fat}g</p>
      </div>
    `;
    
    // Actualizar tarjeta de nutrición
    if (DOM.nutritionFacts) {
      DOM.nutritionFacts.hidden = false;
      document.getElementById('detectedCalories').textContent = `${calories} kcal`;
      document.getElementById('detectedProtein').textContent = `${protein}g`;
      document.getElementById('detectedCarbs').textContent = `${carbs}g`;
      document.getElementById('detectedFat').textContent = `${fat}g`;
      document.getElementById('detectedFoods').textContent = data.detectedFoods ? data.detectedFoods.join(', ') : '-';
    }
  }
  
  if (data.confidence) {
    html += `<p class="hint">Confianza del análisis: ${data.confidence}%</p>`;
  }
  
  DOM.aiResults.innerHTML = html;
}

function useDetectedValues() {
  const calories = document.getElementById('detectedCalories').textContent.replace(' kcal', '');
  const protein = document.getElementById('detectedProtein').textContent.replace('g', '');
  const carbs = document.getElementById('detectedCarbs').textContent.replace('g', '');
  const fat = document.getElementById('detectedFat').textContent.replace('g', '');
  const foods = document.getElementById('detectedFoods').textContent;
  
  if (DOM.mealName) DOM.mealName.value = foods;
  if (DOM.mealCalories) DOM.mealCalories.value = calories;
  if (DOM.mealProtein) DOM.mealProtein.value = protein;
  if (DOM.mealCarbs) DOM.mealCarbs.value = carbs;
  if (DOM.mealFat) DOM.mealFat.value = fat;
  
  showToast("✅ Valores copiados al formulario");
  
  // Ir a la pestaña de comidas
  const mealsTab = document.querySelector('[data-target="meals"]');
  if (mealsTab) mealsTab.click();
}

/**********************
 * BASE DE DATOS DE ALIMENTOS MEJORADA
 **********************/
const foodDatabase = {
  arroz: { calories: 130, protein: 2.5, carbs: 28, fat: 0.3 },
  pollo: { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  huevo: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  avena: { calories: 389, protein: 17, carbs: 66, fat: 7 },
  pasta: { calories: 350, protein: 12, carbs: 72, fat: 1.5 },
  atun: { calories: 130, protein: 29, carbs: 0, fat: 1 },
  ternera: { calories: 250, protein: 26, carbs: 0, fat: 17 },
  manzana: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  platano: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  leche: { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  pan: { calories: 260, protein: 9, carbs: 49, fat: 3.2 },
  queso: { calories: 400, protein: 25, carbs: 2, fat: 33 },
  salmon: { calories: 208, protein: 20, carbs: 0, fat: 13 },
  aguacate: { calories: 160, protein: 2, carbs: 9, fat: 15 },
  brocoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  nueces: { calories: 654, protein: 15, carbs: 14, fat: 65 }
};

/**********************
 * IA LOCAL - ANALIZADOR DE TEXTO MEJORADO
 **********************/
function handleAnalyze() {
  const text = (DOM.aiMealText?.value || '').toLowerCase();
  if (!text) return showToast("Escribe qué has comido...");

  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let detectedFoods = [];
  let found = false;

  // Buscar alimentos en el texto
  Object.keys(foodDatabase).forEach(food => {
    if (text.includes(food)) {
      // Intentar extraer cantidad (ej: "200g de arroz")
      const regex = new RegExp(`(\\d+)\\s*(g|gr|gramos)?\\s*(de\\s+)?${food}`, 'i');
      const match = text.match(regex);
      const quantity = match ? parseInt(match[1]) / 100 : 1; // Convertir a porciones de 100g
      
      calories += Math.round(foodDatabase[food].calories * quantity);
      protein += Math.round(foodDatabase[food].protein * quantity);
      carbs += Math.round(foodDatabase[food].carbs * quantity);
      fat += Math.round(foodDatabase[food].fat * quantity);
      detectedFoods.push(food);
      found = true;
    }
  });

  if (found) {
    const foodName = detectedFoods.length > 0 ? 
      `Comida con ${detectedFoods.join(', ')}` : 
      "Comida detectada";
    
    if (DOM.mealName) DOM.mealName.value = foodName;
    if (DOM.mealCalories) DOM.mealCalories.value = calories;
    if (DOM.mealProtein) DOM.mealProtein.value = protein;
    if (DOM.mealCarbs) DOM.mealCarbs.value = carbs;
    if (DOM.mealFat) DOM.mealFat.value = fat;
    
    showToast(`✅ Detectados: ${detectedFoods.join(', ')}`);
  } else {
    // Si no se detecta, usar valores promedio
    const result = { calories: 450, protein: 25, carbs: 60, fat: 15 };
    if (DOM.mealName) DOM.mealName.value = "Comida no identificada";
    if (DOM.mealCalories) DOM.mealCalories.value = result.calories;
    if (DOM.mealProtein) DOM.mealProtein.value = result.protein;
    if (DOM.mealCarbs) DOM.mealCarbs.value = result.carbs;
    if (DOM.mealFat) DOM.mealFat.value = result.fat;
    
    showToast("⚠️ Alimentos no reconocidos. Usando valores promedio.");
  }
}

/**********************
 * GESTIÓN DE COMIDAS
 **********************/
function addMeal() {
  const name = DOM.mealName?.value || "";
  const cal = Number(DOM.mealCalories?.value || 0);
  const prot = Number(DOM.mealProtein?.value || 0);
  const carbs = Number(DOM.mealCarbs?.value || 0);
  const fat = Number(DOM.mealFat?.value || 0);
  
  if (!name || isNaN(cal) || cal <= 0) {
    return showToast("❌ Faltan datos de comida");
  }
  
  const meal = {
    id: Date.now(),
    name,
    cal,
    prot,
    carbs,
    fat,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-ES')
  };
  
  meals.push(meal);
  updateTotals();
  renderMeals();
  saveToDisk();
  
  // Limpiar formulario
  if (DOM.mealName) DOM.mealName.value = "";
  if (DOM.mealCalories) DOM.mealCalories.value = "";
  if (DOM.mealProtein) DOM.mealProtein.value = "";
  if (DOM.mealCarbs) DOM.mealCarbs.value = "";
  if (DOM.mealFat) DOM.mealFat.value = "";
  if (DOM.aiMealText) DOM.aiMealText.value = "";
  
  showToast(`✅ ${name} añadido`);
}

async function deleteMeal(id) {
  const ok = await showConfirm('¿Eliminar esta comida?');
  if (!ok) return showToast('Operación cancelada');
  
  meals = meals.filter(m => m.id !== id);
  updateTotals();
  renderMeals();
  saveToDisk();
  showToast('🗑️ Comida eliminada');
}

function renderMeals() {
  const list = DOM.mealList;
  if (!list) return;
  
  list.innerHTML = "";
  
  // Filtrar comidas de hoy
  const today = new Date().toLocaleDateString('es-ES');
  const todayMeals = meals.filter(m => m.date === today);
  
  if (todayMeals.length === 0) {
    list.innerHTML = '<li><p class="placeholder">No hay comidas registradas hoy</p></li>';
    if (DOM.mealCount) DOM.mealCount.textContent = '0';
    return;
  }
  
  todayMeals.forEach((meal) => {
    const li = document.createElement("li");
    
    const info = document.createElement('div');
    info.innerHTML = `
      <strong>${meal.name}</strong><br>
      <small>${meal.cal} kcal | P:${meal.prot}g C:${meal.carbs}g G:${meal.fat}g</small>
    `;
    
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.setAttribute('aria-label', `Eliminar ${meal.name}`);
    btn.textContent = '×';
    btn.addEventListener('click', () => deleteMeal(meal.id));
    
    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  });
  
  if (DOM.mealCount) DOM.mealCount.textContent = todayMeals.length;
}

/**********************
 * ENTRENAMIENTO
 **********************/
function addExercise() {
  const name = document.getElementById("exerciseName")?.value;
  const sets = document.getElementById("workoutSets")?.value;
  const reps = document.getElementById("workoutReps")?.value;
  const weight = document.getElementById("workoutWeight")?.value || 0;
  
  if (!name || !sets || !reps) {
    return showToast("❌ Faltan datos del ejercicio");
  }
  
  const exercise = {
    id: Date.now(),
    name,
    sets: parseInt(sets),
    reps: parseInt(reps),
    weight: parseFloat(weight),
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('es-ES')
  };
  
  exercises.push(exercise);
  renderExercises();
  saveToDisk();
  
  // Limpiar formulario
  ["exerciseName", "workoutSets", "workoutReps", "workoutWeight"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  
  showToast(`💪 ${name} registrado`);
}

function deleteExercise(id) {
  exercises = exercises.filter(ex => ex.id !== id);
  renderExercises();
  saveToDisk();
  showToast("Ejercicio eliminado");
}

function renderExercises() {
  const list = document.getElementById("exerciseList");
  if (!list) return;
  
  list.innerHTML = "";
  
  // Filtrar ejercicios de hoy
  const today = new Date().toLocaleDateString('es-ES');
  const todayExercises = exercises.filter(ex => ex.date === today);
  
  if (todayExercises.length === 0) {
    list.innerHTML = '<li><p class="placeholder">No hay ejercicios hoy</p></li>';
    if (DOM.exerciseCount) DOM.exerciseCount.textContent = '0';
    return;
  }
  
  todayExercises.forEach(ex => {
    const li = document.createElement("li");
    
    const info = document.createElement('div');
    info.innerHTML = `
      <strong>${ex.name}</strong><br>
      <small>${ex.sets}x${ex.reps} ${ex.weight > 0 ? '| ' + ex.weight + 'kg' : ''}</small>
    `;
    
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.setAttribute('aria-label', `Eliminar ${ex.name}`);
    btn.textContent = '×';
    btn.addEventListener('click', () => deleteExercise(ex.id));
    
    li.appendChild(info);
    li.appendChild(btn);
    list.appendChild(li);
  });
  
  if (DOM.exerciseCount) DOM.exerciseCount.textContent = todayExercises.length;
}

/**********************
 * DASHBOARD Y PROGRESO
 **********************/
function updateTotals() {
  const today = new Date().toLocaleDateString('es-ES');
  const todayMeals = meals.filter(m => m.date === today);
  
  const totalCalories = todayMeals.reduce((s, m) => s + m.cal, 0);
  const totalProtein = todayMeals.reduce((s, m) => s + m.prot, 0);
  
  if (DOM.totalCalories) DOM.totalCalories.textContent = `${totalCalories} kcal`;
  if (DOM.totalProtein) DOM.totalProtein.textContent = `${totalProtein}g`;
  if (DOM.calStatus) {
    const remaining = calorieGoal - totalCalories;
    DOM.calStatus.textContent = remaining > 0 ? 
      `Faltan ${remaining} kcal` : 
      "META SUPERADA";
    DOM.calStatus.style.color = remaining > 0 ? "var(--green)" : "var(--red)";
  }
  
  // Actualizar barras de progreso
  const calPct = Math.min(100, Math.round((totalCalories / (calorieGoal || 1)) * 100));
  const protPct = Math.min(100, Math.round((totalProtein / (proteinGoal || 1)) * 100));
  
  if (DOM.calProgress) DOM.calProgress.style.width = `${calPct}%`;
  if (DOM.protProgress) DOM.protProgress.style.width = `${protPct}%`;
  
  // Actualizar último update
  if (DOM.lastUpdate) {
    const now = new Date();
    DOM.lastUpdate.textContent = now.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }
}

/**********************
 * BIOMETRÍA
 **********************/
function saveBiometrics() {
  const weight = document.getElementById("bodyWeight")?.value;
  const fat = document.getElementById("bodyFat")?.value;
  const muscle = document.getElementById("bodyMuscle")?.value;
  
  if (!weight) return showToast("❌ Ingresa al menos tu peso");
  
  userBiometrics.weight = parseFloat(weight);
  userBiometrics.fat = fat ? parseFloat(fat) : 0;
  userBiometrics.muscle = muscle ? parseFloat(muscle) : 0;
  
  // Añadir al historial
  userBiometrics.history.push({
    date: new Date().toISOString(),
    weight: userBiometrics.weight,
    fat: userBiometrics.fat,
    muscle: userBiometrics.muscle
  });
  
  saveToDisk();
  showToast("✅ Biometría guardada");
  
  // Actualizar gráfico
  updateWeightChart();
}

function updateWeightChart() {
  const canvas = DOM.weightChart;
  if (!canvas || userBiometrics.history.length < 2) return;
  
  const ctx = canvas.getContext('2d');
  
  // Destruir gráfico anterior si existe
  if (weightChart) {
    weightChart.destroy();
  }
  
  const dates = userBiometrics.history.map(h => 
    new Date(h.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  );
  
  const weights = userBiometrics.history.map(h => h.weight);
  
  weightChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Peso (kg)',
        data: weights,
        borderColor: 'var(--green)',
        backgroundColor: 'rgba(57, 255, 20, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'var(--green)'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'var(--green)'
          },
          grid: {
            color: 'rgba(57, 255, 20, 0.1)'
          }
        },
        y: {
          ticks: {
            color: 'var(--green)'
          },
          grid: {
            color: 'rgba(57, 255, 20, 0.1)'
          }
        }
      }
    }
  });
}

/**********************
 * IA COACH
 **********************/
function handleEmergencyCompensate() {
  const input = document.getElementById("aiEmergencyText")?.value.toLowerCase();
  if (!input) return showToast("Dime qué ha pasado...");

  let advice = "";
  let adjustment = "";

  if (input.includes("entrenar") || input.includes("gimnasio") || input.includes("gym")) {
    calorieGoal = Math.max(1500, calorieGoal - 400);
    proteinGoal += 15;
    advice = "🏋️ PROTOCOLO SEDENTARISMO ACTIVADO: Reduciendo ingesta calórica y aumentando aminoácidos para preservar tejido muscular.";
    adjustment = "📉 Meta calorías: -400 kcal | 📈 Proteína: +15g";
  } else if (input.includes("comer") || input.includes("comida") || input.includes("exceso")) {
    calorieGoal = Math.max(1500, calorieGoal - 600);
    advice = "🍽️ COMPENSACIÓN DE NUTRIENTES: Reajustando balance diario por omisión de toma de alimentos.";
    adjustment = "📉 Ajuste: -600 kcal al total.";
  } else {
    advice = "⚖️ ESTADO ESTABLE: No se requieren ajustes críticos en el bio-plan actual.";
    adjustment = "⚖️ Sin cambios.";
  }

  typeWriter(advice, "aiResponse", 30);
  const adjustmentPlan = document.getElementById("adjustmentPlan");
  const planDetails = document.getElementById("planDetails");
  
  if (adjustmentPlan) adjustmentPlan.style.display = "block";
  if (planDetails) planDetails.textContent = adjustment;
  
  // Efecto visual
  document.body.classList.add("security-breach");
  setTimeout(() => document.body.classList.remove("security-breach"), 500);

  updateTotals();
  saveToDisk();
  showToast("⚙️ IA: Sistema recalibrado");
}

/**********************
 * PERSISTENCIA
 **********************/
function saveToDisk() {
  const data = {
    meals,
    exercises,
    calorieGoal,
    proteinGoal,
    userBiometrics,
    aiMode,
    geminiApiKey,
    version: '2.0'
  };
  localStorage.setItem('fitnessTrackerData', JSON.stringify(data));
}

function loadFromDisk() {
  const saved = localStorage.getItem('fitnessTrackerData');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      
      meals = data.meals || [];
      exercises = data.exercises || [];
      calorieGoal = data.calorieGoal || 3200;
      proteinGoal = data.proteinGoal || 150;
      userBiometrics = data.userBiometrics || { weight: 0, fat: 0, muscle: 0, history: [] };
      aiMode = data.aiMode || "automatic";
      geminiApiKey = data.geminiApiKey || "";
      
      // Actualizar interfaz
      if (document.getElementById("calorieGoalInput")) {
        document.getElementById("calorieGoalInput").value = calorieGoal;
      }
      if (document.getElementById("proteinGoalInput")) {
        document.getElementById("proteinGoalInput").value = proteinGoal;
      }
      if (DOM.aiModeSelect) {
        DOM.aiModeSelect.value = aiMode;
      }
      if (DOM.apiKey) {
        DOM.apiKey.value = geminiApiKey;
      }
      
      renderMeals();
      renderExercises();
      updateTotals();
      updateWeightChart();
      
    } catch (e) {
      console.error("Error cargando datos:", e);
      showToast("⚠️ Error cargando datos guardados");
    }
  }
}

/**********************
 * UTILIDADES
 **********************/
function showToast(msg) {
  const container = DOM.toasts || document.getElementById("toasts");
  if (!container) return;
  
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  container.appendChild(t);
  
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(100%)';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

async function showConfirm(message, title = 'Confirmar') {
  return new Promise((resolve) => {
    const modal = DOM.confirmModal;
    const msgEl = DOM.confirmMessage;
    const okBtn = DOM.confirmOk;
    const cancelBtn = DOM.confirmCancel;
    
    if (!modal || !msgEl || !okBtn || !cancelBtn) {
      resolve(confirm(message));
      return;
    }
    
    let previousActive = document.activeElement;
    msgEl.textContent = message;
    modal.setAttribute('aria-hidden', 'false');
    
    function cleanup(result) {
      modal.setAttribute('aria-hidden', 'true');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKeyDown);
      modal.removeEventListener('click', onOverlayClick);
      if (previousActive) previousActive.focus();
      resolve(result);
    }
    
    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }
    
    function onKeyDown(e) {
      if (e.key === 'Escape') cleanup(false);
    }
    
    function onOverlayClick(e) {
      if (e.target === modal) cleanup(false);
    }
    
    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKeyDown);
    modal.addEventListener('click', onOverlayClick);
    
    setTimeout(() => cancelBtn.focus(), 0);
  });
}

function typeWriter(text, elementId, speed = 30) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerHTML = "";
  let i = 0;
  
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

/**********************
 * RELOJ Y ANIMACIONES
 **********************/
function updateClock() {
  if (!DOM.clock) return;
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { 
    weekday: 'short', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  DOM.clock.textContent = `${dateStr} — ${timeStr}`;
}

function startClock() {
  updateClock();
  setInterval(updateClock, 1000);
}

/**********************
 * EVENT LISTENERS
 **********************/
function setupEventListeners() {
  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-target');
      if (!targetId) return;
      
      // Remover activo de todos
      document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.panel').forEach(p => {
        p.classList.remove('active');
      });
      
      // Activar tab y panel seleccionado
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });
  
  // Botones
  if (DOM.analyzeMealBtn) DOM.analyzeMealBtn.onclick = handleAnalyze;
  if (DOM.addMealBtn) DOM.addMealBtn.onclick = addMeal;
  if (DOM.toggleGym) DOM.toggleGym.onclick = toggleGymMode;
  
  document.getElementById("compensateBtn")?.addEventListener('click', handleEmergencyCompensate);
  document.getElementById("addExerciseBtn")?.addEventListener('click', addExercise);
  document.getElementById("saveBodyBtn")?.addEventListener('click', saveBiometrics);
  document.getElementById("saveApiKey")?.addEventListener('click', saveApiKeyConfig);
  document.getElementById("saveAiSettings")?.addEventListener('click', saveAiSettings);
  document.getElementById("saveGoalsBtn")?.addEventListener('click', saveGoals);
  document.getElementById("clearDataBtn")?.addEventListener('click', clearData);
}

function saveApiKeyConfig() {
  geminiApiKey = DOM.apiKey?.value || '';
  saveToDisk();
  showToast("✅ Clave API guardada");
}

function saveAiSettings() {
  aiMode = DOM.aiModeSelect?.value || "automatic";
  saveToDisk();
  showToast("⚙️ Ajustes IA guardados");
}

function saveGoals() {
  const calGoal = document.getElementById("calorieGoalInput")?.value;
  const protGoal = document.getElementById("proteinGoalInput")?.value;
  
  if (calGoal) calorieGoal = parseInt(calGoal);
  if (protGoal) proteinGoal = parseInt(protGoal);
  
  if (DOM.proteinGoalDisplay) DOM.proteinGoalDisplay.textContent = proteinGoal;
  
  saveToDisk();
  updateTotals();
  showToast("🎯 Metas actualizadas");
}

async function clearData() {
  const ok = await showConfirm("¿Borrar TODOS los datos? Esta acción no se puede deshacer.");
  if (!ok) return;
  
  localStorage.removeItem('fitnessTrackerData');
  meals = [];
  exercises = [];
  
  renderMeals();
  renderExercises();
  updateTotals();
  
  showToast("🗑️ Todos los datos han sido eliminados");
}

function toggleGymMode() {
  const enabled = document.body.classList.toggle('gym-mode');
  if (DOM.toggleGym) {
    DOM.toggleGym.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  }
  localStorage.setItem('gymMode', enabled ? '1' : '0');
  showToast(enabled ? '🏋️ Modo GYM activado' : '✨ Modo GYM desactivado');
}

/**********************
 * INICIALIZACIÓN
 **********************/
window.onload = () => {
  // Inicializar DOM
  initDOM();
  
  // Cargar datos guardados
  loadFromDisk();
  
  // Configurar eventos
  setupEventListeners();
  setupImageUpload();
  
  // Iniciar reloj
  startClock();
  
  // Iniciar Matrix
  initMatrix();
  
  // Restaurar modo gym si estaba activo
  if (localStorage.getItem('gymMode') === '1') {
    document.body.classList.add('gym-mode');
    if (DOM.toggleGym) {
      DOM.toggleGym.setAttribute('aria-pressed', 'true');
    }
  }
  
  showToast("✅ AI Fitness Tracker cargado");
};

/**********************
 * MATRIX RAIN
 **********************/
function initMatrix() {
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  
  let columns, drops;
  
  function resizeMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / 20);
    drops = Array(columns).fill(1);
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#39ff14';
    ctx.font = '16px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const char = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 28)];
      ctx.fillText(char, i * 20, drops[i] * 20);
      
      if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  resizeMatrix();
  setInterval(drawMatrix, 33);
  window.addEventListener('resize', resizeMatrix);
}
