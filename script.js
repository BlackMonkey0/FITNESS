/**********************
 * ESTADO GLOBAL
 **********************/
let meals = [];
let exercises = [];
let calorieGoal = 3200;
let proteinGoal = 150;
let userBiometrics = { weight: 0, fat: 0 };
let aiMode = "suggestions";

/* Cached DOM references */
const DOM = {};

function initDOM() {
  DOM.mealList = document.getElementById('mealList');
  DOM.mealName = document.getElementById('mealName');
  DOM.mealCalories = document.getElementById('mealCalories');
  DOM.mealProtein = document.getElementById('mealProtein');
  DOM.aiMealText = document.getElementById('aiMealText');
  DOM.analyzeMealBtn = document.getElementById('analyzeMealBtn');
  DOM.addMealBtn = document.getElementById('addMealBtn');
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
  DOM.toggleGym = document.getElementById('toggleGym');
  DOM.calProgress = document.getElementById('calProgress');
  DOM.protProgress = document.getElementById('protProgress');
}

// Clock: update visible date/time every second
function formatNow() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${dateStr} — ${timeStr}`;
}

function updateClock() {
  const el = DOM.clock || document.getElementById('clock');
  if (!el) return;
  el.textContent = formatNow();
}

function startClock() {
  updateClock();
  // update every second
  setInterval(updateClock, 1000);
}

// --- Fun / jokes (upgraded) ---
const JOKES = [
  "¿Sabías que las calorías tienen miedo a la báscula? Se esconden en la despensa.",
  "Si entrenas con buena actitud, la báscula también se anima (o eso dicen).",
  "Hoy tu cuerpo pide 3 cosas: agua, respeto... y otra galleta (moderación opcional).",
  "Si caminar a la nevera no fuera ejercicio, Netflix estaría preocupado.",
  "Hacer flexiones con buena intención cuenta como cardio mental.",
  "Los vegetales también son gente: trátalos con una salsa guay.",
  "Científicamente comprobado: sonreír al comer aumenta el sabor. Inténtalo.",
  "Recuerda: las proteínas no son enemigos, solo se hacen notar mucho.",
  "Entrena con orgullo. O con auriculares. Ambos funcionan.",
  "Si completas los pasos hasta la cocina, ya hiciste 200 pasos con honor."
];

function generateJoke() {
  // 50% chance to pick a classic joke, 50% to generate a time-aware quip
  if (Math.random() < 0.5) return JOKES[Math.floor(Math.random() * JOKES.length)];
  const now = new Date();
  const h = now.getHours();
  if (h >= 6 && h < 10) {
    return `Buenos días ☀️ — el desayuno es la excusa perfecta para algo delicioso y sensato.`;
  } else if (h >= 10 && h < 14) {
    return `Hora de recargar: si no es comida, es una idea para la comida.`;
  } else if (h >= 14 && h < 18) {
    return `Tarde productiva: camina un poco y dile adiós a la siesta mental.`;
  } else if (h >= 18 && h < 22) {
    return `Noche: buen momento para planificar comida épica pero equilibrada.`;
  }
  return `Noche avanzada: perfecto para pensar en metas y en otra ronda de agua.`;
}

let jokeIntervalId = null;
const JOKE_AUTO_INTERVAL = 15000; // 15s

function showRandomJoke(announce = false, animate = true) {
  const el = DOM.clockJoke || document.getElementById('clockJoke');
  if (!el) return;
  const joke = generateJoke();
  el.textContent = joke;
  if (animate) {
    el.classList.remove('pop');
    // force reflow to restart animation
    void el.offsetWidth;
    el.classList.add('pop');
    // remove class after animation (safety)
    setTimeout(() => el.classList.remove('pop'), 900);
  }
  if (announce) {
    el.setAttribute('aria-live', 'polite');
  }
}

function startJokeAutoRotate() {
  if (jokeIntervalId) return;
  jokeIntervalId = setInterval(() => showRandomJoke(true, true), JOKE_AUTO_INTERVAL);
}

function stopJokeAutoRotate() {
  if (!jokeIntervalId) return;
  clearInterval(jokeIntervalId);
  jokeIntervalId = null;
}

function setupJokes() {
  const el = DOM.clockJoke || document.getElementById('clockJoke');
  if (!el) return;
  // initial joke
  showRandomJoke(false, false);
  // click to change (animated, announced)
  el.addEventListener('click', () => showRandomJoke(true, true));
  // Start auto-rotation but stop briefly if user hovers/clicks repeatedly
  startJokeAutoRotate();
  el.addEventListener('mouseenter', () => stopJokeAutoRotate());
  el.addEventListener('mouseleave', () => startJokeAutoRotate());
}

// --- Smile feature: emoji + confetti + chime ---
const SMILE_LINES = [
  'Eres increíble tal como eres 😄',
  'Pequeños pasos, grandes victorias ✨',
  'Una sonrisa ha sido activada — buena elección 😀',
  'Esa energía se nota, sigue así 💪',
  'Hoy vas a comerte el día (y no solo la comida) 🌟'
];

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.linearRampToValueAtTime(0.12, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    o.start(now);
    o.stop(now + 0.5);
  } catch (e) {
    // ignore audio errors
    console.warn('Audio not available', e);
  }
}

function makeYouSmile() {
  const btn = DOM.smileBtn || document.getElementById('smileBtn');
  const overlay = DOM.smileOverlay || document.getElementById('smileOverlay');
  if (!btn || !overlay) return;
  // prevent spam
  if (btn.disabled) return;
  btn.disabled = true;
  setTimeout(() => btn.disabled = false, 1400);

  // choose compliment
  const text = SMILE_LINES[Math.floor(Math.random() * SMILE_LINES.length)];
  overlay.setAttribute('aria-hidden', 'false');
  overlay.innerHTML = `<div class="smile-card"><div class="smile-emoji">😊</div><div class="smile-text">${text}</div></div>`;

  // emoji bounce
  const emoji = overlay.querySelector('.smile-emoji');
  if (emoji) {
    emoji.classList.add('bounce');
    setTimeout(() => emoji.classList.remove('bounce'), 900);
  }

  // confetti
  const colors = ['var(--neon-pink)', 'var(--radon-blue)', 'var(--neon-purple)', 'var(--bio-green)'];
  for (let i = 0; i < 12; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = `${50 + (Math.random() - 0.5) * 40}%`;
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.transform = `translateY(${0}px) rotate(${Math.random() * 360}deg)`;
    c.style.top = `${30 + Math.random() * 12}%`;
    c.style.animationDelay = `${Math.random() * 120}ms`;
    overlay.appendChild(c);
    // cleanup
    setTimeout(() => c.remove(), 1100 + Math.random() * 400);
  }

  // play chime
  playChime();

  // cleanup overlay after short time
  setTimeout(() => {
    overlay.innerHTML = '';
    overlay.setAttribute('aria-hidden', 'true');
  }, 1400);
}

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

        // Rellenar campos en la interfaz
        if(document.getElementById("bodyWeight")) document.getElementById("bodyWeight").value = userBiometrics.weight || "";
        if(document.getElementById("bodyFat")) document.getElementById("bodyFat").value = userBiometrics.fat || "";
        if(document.getElementById("aiMode")) document.getElementById("aiMode").value = aiMode;
        
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
 * IA LOCAL - ANALIZADOR
 **********************/
function handleAnalyze() {
  const textInput = DOM.aiMealText || document.getElementById("aiMealText");
  const text = (textInput.value || '').toLowerCase();
  if (!text) return showToast("Escribe qué has comido...");

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

  const result = found ? { calories, protein } : { calories: 450, protein: 25, unknown: true };
  
  if (DOM.mealName) DOM.mealName.value = textInput.value; else document.getElementById("mealName").value = textInput.value;
  if (DOM.mealCalories) DOM.mealCalories.value = Math.round(result.calories); else document.getElementById("mealCalories").value = Math.round(result.calories);
  if (DOM.mealProtein) DOM.mealProtein.value = Math.round(result.protein); else document.getElementById("mealProtein").value = Math.round(result.protein);
  
  if (result.unknown) showToast("⚠️ IA: Alimento desconocido. Usando promedio.");
  else showToast("✅ IA: Análisis completado.");
}

/**********************
 * MOTOR DE COMPENSACIÓN (IA COACH)
 **********************/
function handleEmergencyCompensate() {
    const input = document.getElementById("aiEmergencyText").value.toLowerCase();
    if (!input) return showToast("Dime qué ha pasado...");

    let advice = "";
    let adjustment = "";

    if (input.includes("entrenar") || input.includes("gimnasio") || input.includes("gym")) {
        calorieGoal -= 400;
        proteinGoal += 15;
        advice = "PROTOCOLO SEDENTARISMO ACTIVADO: Reduciendo ingesta calórica y aumentando aminoácidos para preservar tejido muscular.";
        adjustment = "📉 Meta: -400 kcal | 📈 Prot: +15g";
    } else if (input.includes("comer") || input.includes("comida")) {
        calorieGoal -= 600;
        advice = "COMPENSACIÓN DE NUTRIENTES: Reajustando balance diario por omisión de toma de alimentos.";
        adjustment = "📉 Ajuste: -600 kcal al total.";
    } else {
        advice = "ESTADO ESTABLE: No se requieren ajustes críticos en el bio-plan actual.";
        adjustment = "⚖️ Sin cambios.";
    }

    // Efecto visual y de escritura
    typeWriter(advice, "aiResponse");
    document.getElementById("adjustmentPlan").style.display = "block";
    document.getElementById("planDetails").textContent = adjustment;
    
    document.body.classList.add("security-breach");
    setTimeout(() => document.body.classList.remove("security-breach"), 500);

    updateTotals();
    saveToDisk();
    showToast("⚙️ IA: Sistema recalibrado");
}

/**********************
 * GESTIÓN DE DATOS (MEALS & WORKOUT)
 **********************/
function addMeal() {
  const name = (DOM.mealName && DOM.mealName.value) || document.getElementById("mealName").value;
  const cal = Number((DOM.mealCalories && DOM.mealCalories.value) || document.getElementById("mealCalories").value);
  const prot = Number((DOM.mealProtein && DOM.mealProtein.value) || document.getElementById("mealProtein").value);
  if (!name || isNaN(cal)) return showToast("Faltan datos de comida");
  
  meals.push({ name, cal, prot, id: Date.now() });
  updateTotals();
  renderMeals();
  saveToDisk();
  if (DOM.mealName) DOM.mealName.value = ""; else document.getElementById('mealName').value = '';
  if (DOM.mealCalories) DOM.mealCalories.value = '';
  if (DOM.mealProtein) DOM.mealProtein.value = '';
  if (DOM.aiMealText) DOM.aiMealText.value = '';
}

async function deleteMeal(id) {
  const ok = await showConfirm('¿Eliminar esta comida? Esta acción no se puede deshacer.');
  if (!ok) return showToast('Operación cancelada');
  meals = meals.filter(m => m.id !== id);
  updateTotals();
  renderMeals();
  saveToDisk();
  showToast('🗑️ Comida eliminada');
}

function renderMeals() {
  const list = DOM.mealList || document.getElementById("mealList");
  list.innerHTML = "";
  const frag = document.createDocumentFragment();
  meals.forEach((m) => {
    const li = document.createElement("li");
    const info = document.createElement('div');
    info.innerHTML = `<strong>${m.name}</strong><br><small>${m.cal} kcal | ${m.prot}g P</small>`;
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.setAttribute('aria-label', `Eliminar ${m.name}`);
    btn.textContent = '×';
    btn.addEventListener('click', () => deleteMeal(m.id));
    li.appendChild(info);
    li.appendChild(btn);
    frag.appendChild(li);
  });
  list.appendChild(frag);
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
  const frag = document.createDocumentFragment();
  exercises.forEach(ex => {
    const li = document.createElement("li");
    const info = document.createElement('div');
    info.innerHTML = `<strong>${ex.name}</strong><br><small>${ex.sets}x${ex.reps} ${ex.weight > 0 ? '| +' + ex.weight + 'kg' : ''}</small>`;
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.setAttribute('aria-label', `Eliminar ${ex.name}`);
    btn.textContent = '×';
    btn.addEventListener('click', () => deleteExercise(ex.id));
    li.appendChild(info);
    li.appendChild(btn);
    frag.appendChild(li);
  });
  list.appendChild(frag);
}

/**********************
 * DASHBOARD & BIOMETRÍA
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
    statusEl.textContent = remaining > 0 ? `Faltan ${remaining} kcal` : "META SUPERADA";
    statusEl.style.color = remaining > 0 ? "var(--bio-green)" : "var(--system-red)";
  }

  // Update progress bars if present
  try {
    const calPct = Math.min(100, Math.round((totalCalories / (calorieGoal || 1)) * 100));
    const protPct = Math.min(100, Math.round((totalProtein / (proteinGoal || 1)) * 100));
    if (DOM.calProgress) DOM.calProgress.style.width = `${calPct}%`;
    if (DOM.protProgress) DOM.protProgress.style.width = `${protPct}%`;
  } catch (e) { /* ignore */ }
}

// Toggle gym mode (apply class and persist)
function toggleGymMode(fromClick = false) {
  const el = DOM.toggleGym || document.getElementById('toggleGym');
  const enabled = document.body.classList.toggle('gym-mode');
  if (el) el.setAttribute('aria-pressed', enabled ? 'true' : 'false');
  localStorage.setItem('gymMode', enabled ? '1' : '0');
  showToast(enabled ? '🏋️ Modo GYM activado' : '✨ Modo GYM desactivado');
}

function saveBiometrics() {
    userBiometrics.weight = document.getElementById("bodyWeight").value;
    userBiometrics.fat = document.getElementById("bodyFat").value;
    saveToDisk();
    
    showToast(">> UPLOADING_BIOMETRICS... DONE");
    // Efecto visual Matrix
    canvas.style.opacity = "0.8";
    setTimeout(() => canvas.style.opacity = "0.15", 1000);
}

/**********************
 * UTILIDADES (MATRIX & TYPEWRITER)
 **********************/
function showToast(msg) {
  const container = document.getElementById("toasts");
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Accessible confirm dialog that returns a Promise<boolean>
function showConfirm(message, title = 'Confirmar') {
  return new Promise((resolve) => {
    const modal = DOM.confirmModal || document.getElementById('confirmModal');
    const msgEl = DOM.confirmMessage || document.getElementById('confirmMessage');
    const okBtn = DOM.confirmOk || document.getElementById('confirmOk');
    const cancelBtn = DOM.confirmCancel || document.getElementById('confirmCancel');
    if (!modal || !okBtn || !cancelBtn) return resolve(confirm(message)); // fallback to native if missing

    let previousActive = document.activeElement;
    msgEl.textContent = message;
    modal.setAttribute('aria-hidden', 'false');

    function cleanup(result) {
      modal.setAttribute('aria-hidden', 'true');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKeyDown);
      modal.removeEventListener('click', onOverlayClick);
      if (previousActive && previousActive.focus) previousActive.focus();
      resolve(result);
    }

    function onOk() { cleanup(true); }
    function onCancel() { cleanup(false); }

    function onKeyDown(e) {
      if (e.key === 'Escape') { e.preventDefault(); cleanup(false); }
      // basic trap: keep focus inside modal
      if (e.key === 'Tab') {
        const focusables = [okBtn, cancelBtn];
        const idx = focusables.indexOf(document.activeElement);
        if (e.shiftKey) {
          if (idx === 0) { focusables[focusables.length - 1].focus(); e.preventDefault(); }
        } else {
          if (idx === focusables.length - 1) { focusables[0].focus(); e.preventDefault(); }
        }
      }
    }

    function onOverlayClick(e) {
      if (e.target === modal) cleanup(false);
    }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKeyDown);
    modal.addEventListener('click', onOverlayClick);
    // focus first focusable
    setTimeout(() => cancelBtn.focus(), 0);
  });
}

function typeWriter(text, elementId, speed = 30) {
    let i = 0;
    const element = document.getElementById(elementId);
    element.innerHTML = ""; 
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// MATRIX RAIN ENGINE
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
let columns, drops;

function resizeMatrix() {
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    columns = canvas.width / 16;
    drops = Array(Math.floor(columns)).fill(1);
}

function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#39ff14"; 
    ctx.font = "16px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 28)];
        ctx.fillText(text, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}

/**********************
 * INICIO
 **********************/
window.onload = () => {
  resizeMatrix();
  initDOM();
  loadFromDisk();
  startClock();
  setupJokes();
    setInterval(drawMatrix, 33);
    window.addEventListener('resize', resizeMatrix);

    // Navegación de pestañas
    const tabs = Array.from(document.querySelectorAll('.tab'));
    tabs.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        if (btn.id === 'toggleCompact') {
          const compacted = document.body.classList.toggle('compact');
          btn.setAttribute('aria-pressed', compacted ? 'true' : 'false');
          return;
        }
        // activate
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const target = btn.dataset.target;
        const panel = document.getElementById(target);
        if (panel) panel.classList.add('active');
        btn.focus();
      });

      // keyboard navigation: left/right arrow to move between tabs
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = tabs[(idx + 1) % tabs.length]; next.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = tabs[(idx - 1 + tabs.length) % tabs.length]; prev.focus();
        }
      });
    });

    // sidebar toggle
    const sidebarToggle = document.getElementById('toggleSidebar');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        const collapsed = document.body.classList.toggle('sidebar-collapsed');
        sidebarToggle.setAttribute('aria-pressed', collapsed ? 'true' : 'false');
        localStorage.setItem('sidebarCollapsed', collapsed ? '1' : '0');
      });
      // initialize from storage
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === '1') { document.body.classList.add('sidebar-collapsed'); sidebarToggle.setAttribute('aria-pressed', 'true'); }
    }

      // Restore gym mode if previously set
      const gymSaved = localStorage.getItem('gymMode');
      if (gymSaved === '1') { document.body.classList.add('gym-mode'); if (DOM.toggleGym) DOM.toggleGym.setAttribute('aria-pressed', 'true'); }

    // Listeners
    if (DOM.analyzeMealBtn) DOM.analyzeMealBtn.onclick = handleAnalyze;
    else document.getElementById("analyzeMealBtn").onclick = handleAnalyze;
    if (DOM.addMealBtn) DOM.addMealBtn.onclick = addMeal;
    else document.getElementById("addMealBtn").onclick = addMeal;
    if (DOM.smileBtn) DOM.smileBtn.addEventListener('click', makeYouSmile);
    else if (document.getElementById('smileBtn')) document.getElementById('smileBtn').addEventListener('click', makeYouSmile);
    if (DOM.toggleGym) DOM.toggleGym.addEventListener('click', () => toggleGymMode(true));
    document.getElementById("compensateBtn").onclick = handleEmergencyCompensate;
    document.getElementById("addExerciseBtn").onclick = addExercise;
    document.getElementById("saveBodyBtn").onclick = saveBiometrics;
    document.getElementById("saveAiSettings").onclick = () => {
      aiMode = (DOM.aiModeSelect && DOM.aiModeSelect.value) || document.getElementById("aiMode").value;
      saveToDisk();
      showToast("⚙️ Ajustes guardados");
    };
};
