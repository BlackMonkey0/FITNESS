/**********************
 *  CONFIGURACIÓN DE FIREBASE (OPCIÓN 10)
 *  REEMPLAZA ESTOS DATOS CON LOS DE TU PROYECTO
 **********************/
const firebaseConfig = {
  apiKey: "AIzaSyAm4dzv9JTYmid__bqqvTZn6dIQuguwE90",
  authDomain: "fitnestracker-99a08.firebaseapp.com",
  projectId: "fitnestracker-99a08",
  storageBucket: "fitnestracker-99a08.firebasestorage.app",
  messagingSenderId: "707068987117",
  appId: "1:707068987117:web:a8abcb3ff55ca9476a2ee4"
};

// Inicializar Firebase
let firebaseApp, auth, db, currentUser = null;
let firebaseReady = false;

try {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseReady = true;
    console.log('🔥 Firebase inicializado');
} catch (e) {
    console.warn('⚠️ Firebase no disponible, usando localStorage:', e.message);
}

/**********************
 *  APP - ESTADO GLOBAL
 **********************/
const APP = {
    meals: [],
    exercises: [],
    waterGlasses: 0,
    streakDays: 0,
    calorieGoal: 2500,
    proteinGoal: 120,
    waterGoal: 3000,
    userBiometrics: { weight: 0, fat: 0, muscle: 0, water: 60, bone: 3, history: [] },
    userProfile: {
        age: 25, height: 175, gender: 'male',
        goal: 'gain', level: 'beginner',
        activity: 'moderate', diet: 'balanced'
    },
    customRoutines: [], // NUEVO: rutinas personalizadas
    selectedDate: new Date().toISOString().split('T')[0],
    currentCalendarMonth: new Date().getMonth(),
    currentCalendarYear: new Date().getFullYear(),
    // Gráficos
    weightChart: null,
    biometryChart: null,
    strengthChart: null,
    calorieChart: null,
    weightChartAdvanced: null,
};

/**********************
 *  STORAGE (LOCAL + NUBE)
 **********************/
const Storage = {
    save() {
        const data = {
            meals: APP.meals,
            exercises: APP.exercises,
            waterGlasses: APP.waterGlasses,
            streakDays: APP.streakDays,
            calorieGoal: APP.calorieGoal,
            proteinGoal: APP.proteinGoal,
            waterGoal: APP.waterGoal,
            userBiometrics: APP.userBiometrics,
            userProfile: APP.userProfile,
            customRoutines: APP.customRoutines,
            lastSave: new Date().toISOString()
        };
        try {
            localStorage.setItem('fitnessTrackerData', JSON.stringify(data));
            if (firebaseReady && currentUser) {
                this.syncToCloud(data);
            }
        } catch (e) {
            console.error('Error guardando:', e);
            UI.showToast('Error al guardar datos', 'error');
        }
    },

    load() {
        const saved = localStorage.getItem('fitnessTrackerData');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                APP.meals = data.meals || [];
                APP.exercises = data.exercises || [];
                APP.waterGlasses = data.waterGlasses || 0;
                APP.streakDays = data.streakDays || 0;
                APP.calorieGoal = data.calorieGoal || 2500;
                APP.proteinGoal = data.proteinGoal || 120;
                APP.waterGoal = data.waterGoal || 3000;
                APP.userBiometrics = data.userBiometrics || { history: [] };
                APP.userProfile = data.userProfile || {
                    age: 25, height: 175, gender: 'male',
                    goal: 'gain', level: 'beginner',
                    activity: 'moderate', diet: 'balanced'
                };
                APP.customRoutines = data.customRoutines || [];
            } catch (e) {
                console.error('Error cargando datos:', e);
                UI.showToast('Error al cargar datos guardados', 'error');
            }
        }
    },

    async syncToCloud(data) {
        if (!currentUser) return;
        try {
            const userRef = db.collection('users').doc(currentUser.uid);
            await userRef.set({
                ...data,
                lastSync: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log('☁️ Datos sincronizados con la nube');
        } catch (e) {
            console.error('Error sincronizando:', e);
            UI.showToast('Error al sincronizar con la nube', 'error');
        }
    },

    async loadFromCloud() {
        if (!currentUser) return;
        try {
            const doc = await db.collection('users').doc(currentUser.uid).get();
            if (doc.exists) {
                const data = doc.data();
                const localSave = localStorage.getItem('fitnessTrackerData');
                if (localSave) {
                    const localData = JSON.parse(localSave);
                    if (data.lastSave && localData.lastSave && data.lastSave > localData.lastSave) {
                        this.applyCloudData(data);
                        UI.showToast('☁️ Datos cargados desde la nube', 'success');
                    }
                } else {
                    this.applyCloudData(data);
                    UI.showToast('☁️ Datos cargados desde la nube', 'success');
                }
            }
        } catch (e) {
            console.error('Error cargando desde la nube:', e);
        }
    },

    applyCloudData(data) {
        APP.meals = data.meals || [];
        APP.exercises = data.exercises || [];
        APP.waterGlasses = data.waterGlasses || 0;
        APP.streakDays = data.streakDays || 0;
        APP.calorieGoal = data.calorieGoal || 2500;
        APP.proteinGoal = data.proteinGoal || 120;
        APP.waterGoal = data.waterGoal || 3000;
        APP.userBiometrics = data.userBiometrics || { history: [] };
        APP.userProfile = data.userProfile || {
            age: 25, height: 175, gender: 'male',
            goal: 'gain', level: 'beginner',
            activity: 'moderate', diet: 'balanced'
        };
        APP.customRoutines = data.customRoutines || [];
        localStorage.setItem('fitnessTrackerData', JSON.stringify({
            meals: APP.meals,
            exercises: APP.exercises,
            waterGlasses: APP.waterGlasses,
            streakDays: APP.streakDays,
            calorieGoal: APP.calorieGoal,
            proteinGoal: APP.proteinGoal,
            waterGoal: APP.waterGoal,
            userBiometrics: APP.userBiometrics,
            userProfile: APP.userProfile,
            customRoutines: APP.customRoutines,
            lastSave: data.lastSave || new Date().toISOString()
        }));
        UI.refreshAll();
    },

    exportData() {
        const data = JSON.stringify(APP, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitness_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        UI.showToast('✅ Datos exportados correctamente', 'success');
    },

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.meals || !data.exercises) throw new Error('Formato de archivo inválido');
                Object.assign(APP, data);
                Storage.save();
                UI.refreshAll();
                UI.showToast('✅ Datos importados correctamente', 'success');
            } catch (err) {
                UI.showToast('Error al importar: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    }
};

/**********************
 *  UI - RENDERIZADO Y UTILIDADES
 **********************/
const UI = {
    DOM: {},

    initDOM() {
        const $ = (id) => document.getElementById(id);
        this.DOM = {
            currentTime: $('currentTime'),
            currentDate: $('currentDate'),
            toastContainer: $('toastContainer'),
            // Dashboard
            todayCaloriesDisplay: $('todayCaloriesDisplay'),
            todayProteinDisplay: $('todayProteinDisplay'),
            calorieProgress: $('calorieProgress'),
            proteinProgress: $('proteinProgress'),
            caloriePercent: $('caloriePercent'),
            proteinPercent: $('proteinPercent'),
            caloriesRemaining: $('caloriesRemaining'),
            proteinRemaining: $('proteinRemaining'),
            mealsCount: $('mealsCount'),
            workoutsCount: $('workoutsCount'),
            waterCount: $('waterCount'),
            streakDays: $('streakDays'),
            calorieGoal: $('calorieGoal'),
            proteinGoal: $('proteinGoal'),
            // Meals
            mealNameInput: $('mealNameInput'),
            mealDescription: $('mealDescription'),
            mealCaloriesInput: $('mealCaloriesInput'),
            mealProteinInput: $('mealProteinInput'),
            mealCarbsInput: $('mealCarbsInput'),
            mealFatInput: $('mealFatInput'),
            mealDateInput: $('mealDateInput'),
            saveMealBtn: $('saveMealBtn'),
            clearMealForm: $('clearMealForm'),
            mealsListContainer: $('mealsListContainer'),
            totalCaloriesDay: $('totalCaloriesDay'),
            totalProteinDay: $('totalProteinDay'),
            totalCarbsDay: $('totalCarbsDay'),
            totalFatDay: $('totalFatDay'),
            calendarDays: $('calendarDays'),
            // Workout
            exerciseName: $('exerciseName'),
            exerciseSets: $('exerciseSets'),
            exerciseReps: $('exerciseReps'),
            exerciseWeight: $('exerciseWeight'),
            exerciseRest: $('exerciseRest'),
            exerciseNotes: $('exerciseNotes'),
            exerciseDateInput: $('exerciseDateInput'),
            addExerciseBtn: $('addExerciseBtn'),
            finishWorkoutBtn: $('finishWorkoutBtn'),
            exercisesListContainer: $('exercisesListContainer'),
            sessionCount: $('sessionCount'),
            // Biometry
            bodyWeight: $('bodyWeight'),
            bodyFat: $('bodyFat'),
            bodyMusclePercent: $('bodyMusclePercent'),
            bodyWater: $('bodyWater'),
            bodyBone: $('bodyBone'),
            bodyDateInput: $('bodyDateInput'),
            saveBodyBtn: $('saveBodyBtn'),
            calculateBodyBtn: $('calculateBodyBtn'),
            currentWeight: $('currentWeight'),
            currentFat: $('currentFat'),
            currentBMI: $('currentBMI'),
            currentMusclePercent: $('currentMusclePercent'),
            currentWater: $('currentWater'),
            currentBone: $('currentBone'),
            weightChange: $('weightChange'),
            fatChange: $('fatChange'),
            muscleChange: $('muscleChange'),
            waterChange: $('waterChange'),
            boneChange: $('boneChange'),
            bmiCategory: $('bmiCategory'),
            // Settings
            calorieGoalInput: $('calorieGoalInput'),
            proteinGoalInput: $('proteinGoalInput'),
            waterGoalInput: $('waterGoalInput'),
            saveGoalsBtn: $('saveGoalsBtn'),
            startTestBtn: $('startTestBtn'),
            editProfileBtn: $('editProfileBtn'),
            apiKeyInput: $('apiKeyInput'),
            saveApiKeyBtn: $('saveApiKeyBtn'),
            // Modals
            testModal: $('testModal'),
            testContent: $('testContent'),
            testPrevBtn: $('testPrevBtn'),
            testNextBtn: $('testNextBtn'),
            testProgressFill: $('testProgressFill'),
            currentQuestion: $('currentQuestion'),
            totalQuestions: $('totalQuestions'),
            profileModal: $('profileModal'),
            confirmModal: $('confirmModal'),
            modalMessage: $('modalMessage'),
            modalConfirm: $('modalConfirm'),
            modalCancel: $('modalCancel'),
            // Coach
            chatMessages: $('chatMessages'),
            chatInput: $('chatInput'),
            sendMessageBtn: $('sendMessageBtn'),
            statusDot: $('statusDot'),
            statusText: $('statusText'),
            clearChatBtn: $('clearChatBtn'),
            exportChatBtn: $('exportChatBtn'),
            // Others
            goalProgressBar: $('goalProgressBar'),
            goalProgressPercent: $('goalProgressPercent'),
            daysRemaining: $('daysRemaining'),
            currentWeightGoal: $('currentWeightGoal'),
            weightRemaining: $('weightRemaining'),
            // Progreso
            weightChartAdvanced: $('weightChartAdvanced'),
            strengthChart: $('strengthChart'),
            calorieChart: $('calorieChart'),
        };
    },

    showToast(message, type = 'info') {
        const container = this.DOM.toastContainer;
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    showConfirm(message, onConfirm) {
        const modal = this.DOM.confirmModal;
        if (!modal) return;
        this.DOM.modalMessage.textContent = message;
        modal.style.display = 'flex';
        const cleanup = () => { modal.style.display = 'none'; };
        this.DOM.modalConfirm.onclick = () => { onConfirm(); cleanup(); };
        this.DOM.modalCancel.onclick = cleanup;
        modal.querySelector('.modal-close').onclick = cleanup;
    },

    refreshAll() {
        this.updateDashboard();
        this.updateBiometryDisplay();
        this.updateWeightChart();
        this.updateBodyCompositionChart();
        this.updateWorkoutGoal();
        this.updateUserProfileDisplay();
        this.renderMealsForDate(APP.selectedDate);
        this.renderExercisesForDate(APP.selectedDate);
        this.renderExercisesList();
        this.renderCalendar();
        this.renderCustomRoutines();
        // Gráficos avanzados (si la pestaña Progreso está visible)
        setTimeout(() => this.renderAdvancedCharts(), 200);
        if (CoachAI) CoachAI.init();
    },

    updateClock() {
        const now = new Date();
        if (this.DOM.currentTime) {
            this.DOM.currentTime.textContent = now.toLocaleTimeString('es-ES', { hour12: false });
        }
        if (this.DOM.currentDate) {
            this.DOM.currentDate.textContent = now.toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        }
    },

    // ---------- DASHBOARD ----------
    updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = APP.meals.filter(m => m.date === today);
        const todayExercises = APP.exercises.filter(e => e.date === today);
        const totalCal = todayMeals.reduce((s, m) => s + m.calories, 0);
        const totalProt = todayMeals.reduce((s, m) => s + m.protein, 0);

        const DOM = this.DOM;
        if (DOM.todayCaloriesDisplay) DOM.todayCaloriesDisplay.textContent = `${totalCal} kcal`;
        if (DOM.todayProteinDisplay) DOM.todayProteinDisplay.textContent = `${totalProt}g`;

        const calPct = Math.min(100, Math.round((totalCal / APP.calorieGoal) * 100));
        const protPct = Math.min(100, Math.round((totalProt / APP.proteinGoal) * 100));
        if (DOM.calorieProgress) DOM.calorieProgress.style.width = `${calPct}%`;
        if (DOM.proteinProgress) DOM.proteinProgress.style.width = `${protPct}%`;
        if (DOM.caloriePercent) DOM.caloriePercent.textContent = `${calPct}%`;
        if (DOM.proteinPercent) DOM.proteinPercent.textContent = `${protPct}%`;
        if (DOM.caloriesRemaining) DOM.caloriesRemaining.textContent = `${Math.max(0, APP.calorieGoal - totalCal)} kcal restantes`;
        if (DOM.proteinRemaining) DOM.proteinRemaining.textContent = `${Math.max(0, APP.proteinGoal - totalProt)}g restantes`;

        if (DOM.mealsCount) DOM.mealsCount.textContent = todayMeals.length;
        if (DOM.workoutsCount) DOM.workoutsCount.textContent = todayExercises.length;
        if (DOM.waterCount) DOM.waterCount.textContent = APP.waterGlasses;
        if (DOM.streakDays) DOM.streakDays.textContent = APP.streakDays;
        if (DOM.calorieGoal) DOM.calorieGoal.textContent = APP.calorieGoal;
        if (DOM.proteinGoal) DOM.proteinGoal.textContent = APP.proteinGoal;
    },

    // ---------- CALENDARIO ----------
    renderCalendar() {
        const container = this.DOM.calendarDays;
        if (!container) return;
        const month = APP.currentCalendarMonth;
        const year = APP.currentCalendarYear;
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        const todayStr = new Date().toISOString().split('T')[0];
        let html = '';
        for (let i = 0; i < firstDayIndex; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayMeals = APP.meals.filter(m => m.date === dateStr);
            const totalCal = dayMeals.reduce((s, m) => s + m.calories, 0);
            let indicator = '';
            if (dayMeals.length > 0) {
                if (totalCal >= APP.calorieGoal * 0.9) indicator = 'meta';
                else if (totalCal >= APP.calorieGoal * 0.5) indicator = 'parcial';
                else indicator = 'exceso';
            }
            let cls = 'calendar-day';
            if (dateStr === todayStr) cls += ' today';
            if (dateStr === APP.selectedDate) cls += ' selected';
            if (indicator) cls += ' has-data';
            html += `<div class="${cls}" data-date="${dateStr}" onclick="UI.selectDate('${dateStr}')">
                <div class="day-number">${d}</div>
                ${indicator ? `<div class="day-indicator ${indicator}"></div>` : ''}
            </div>`;
        }
        container.innerHTML = html;
        const monthSelect = document.querySelector('.month-select');
        const yearInput = document.querySelector('.year-input');
        if (monthSelect) monthSelect.value = month;
        if (yearInput) yearInput.value = year;
    },

    selectDate(dateStr) {
        APP.selectedDate = dateStr;
        this.renderCalendar();
        this.renderMealsForDate(dateStr);
        this.renderExercisesForDate(dateStr);
        if (this.DOM.mealDateInput) this.DOM.mealDateInput.value = dateStr;
        if (this.DOM.exerciseDateInput) this.DOM.exerciseDateInput.value = dateStr;
        if (this.DOM.bodyDateInput) this.DOM.bodyDateInput.value = dateStr;
    },

    // ---------- COMIDAS ----------
    renderMealsForDate(dateStr) {
        const container = this.DOM.mealsListContainer;
        if (!container) return;
        const dayMeals = APP.meals.filter(m => m.date === dateStr);
        if (dayMeals.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-utensils"></i><p>No hay comidas</p></div>`;
            return;
        }
        dayMeals.sort((a, b) => b.timestamp - a.timestamp);
        let html = '';
        dayMeals.forEach(meal => {
            html += `
                <div class="meal-item">
                    <div class="meal-item-header">
                        <div class="meal-name-time">
                            <h4>${this.escapeHTML(meal.name)}</h4>
                            <span class="meal-time">${meal.time || ''}</span>
                        </div>
                        <button class="delete-meal-btn" data-id="${meal.id}">×</button>
                    </div>
                    ${meal.description ? `<p>${this.escapeHTML(meal.description)}</p>` : ''}
                    <div class="meal-nutrition">
                        <span class="nutrition-item calories"><i class="fas fa-fire"></i> ${meal.calories} kcal</span>
                        <span class="nutrition-item protein"><i class="fas fa-dna"></i> ${meal.protein}g</span>
                        <span class="nutrition-item carbs"><i class="fas fa-bread-slice"></i> ${meal.carbs}g</span>
                        <span class="nutrition-item fat"><i class="fas fa-bacon"></i> ${meal.fat}g</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        container.querySelectorAll('.delete-meal-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteMeal(Number(btn.dataset.id)));
        });
        this.updateDayTotals(dateStr);
    },

    deleteMeal(id) {
        this.showConfirm('¿Eliminar esta comida?', () => {
            APP.meals = APP.meals.filter(m => m.id !== id);
            Storage.save();
            this.renderMealsForDate(APP.selectedDate);
            this.updateDashboard();
            this.showToast('Comida eliminada', 'info');
        });
    },

    updateDayTotals(dateStr) {
        const dayMeals = APP.meals.filter(m => m.date === dateStr);
        const totalCal = dayMeals.reduce((s, m) => s + m.calories, 0);
        const totalProt = dayMeals.reduce((s, m) => s + m.protein, 0);
        const totalCarbs = dayMeals.reduce((s, m) => s + m.carbs, 0);
        const totalFat = dayMeals.reduce((s, m) => s + m.fat, 0);
        const DOM = this.DOM;
        if (DOM.totalCaloriesDay) DOM.totalCaloriesDay.textContent = totalCal;
        if (DOM.totalProteinDay) DOM.totalProteinDay.textContent = totalProt;
        if (DOM.totalCarbsDay) DOM.totalCarbsDay.textContent = totalCarbs;
        if (DOM.totalFatDay) DOM.totalFatDay.textContent = totalFat;
    },

    // ---------- EJERCICIOS ----------
    renderExercisesForDate(dateStr) {
        const container = this.DOM.dayExercisesContainer;
        if (!container) return;
        const dayEx = APP.exercises.filter(e => e.date === dateStr);
        if (dayEx.length === 0) {
            container.innerHTML = `<div class="empty-state"><i class="fas fa-dumbbell"></i><p>No hay ejercicios</p></div>`;
            return;
        }
        let html = '';
        dayEx.forEach(ex => {
            html += `
                <div class="exercise-item">
                    <div class="exercise-name">${this.escapeHTML(ex.name)}</div>
                    <div class="exercise-details">${ex.sets} × ${ex.reps}${ex.weight > 0 ? ` @ ${ex.weight}kg` : ''}</div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    renderExercisesList() {
        const container = this.DOM.exercisesListContainer;
        if (!container) return;
        const today = new Date().toISOString().split('T')[0];
        const todayEx = APP.exercises.filter(e => e.date === today);
        
        if (this.DOM.sessionCount) {
            this.DOM.sessionCount.textContent = `${todayEx.length} ejercicios`;
        }

        if (todayEx.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-dumbbell"></i>
                    <p>No hay ejercicios en esta sesión</p>
                    <small>Añade tu primer ejercicio</small>
                </div>
            `;
            return;
        }
        todayEx.sort((a, b) => b.timestamp - a.timestamp);
        let html = '';
        todayEx.forEach(ex => {
            html += `
                <div class="session-exercise" data-id="${ex.id}">
                    <div class="exercise-info">
                        <span class="exercise-name">${this.escapeHTML(ex.name)}</span>
                        <div class="exercise-detail">
                            <span>${ex.sets} series × ${ex.reps} reps</span>
                            ${ex.weight > 0 ? `<span>@ ${ex.weight} kg</span>` : ''}
                            ${ex.rest > 0 ? `<span>⏱ ${ex.rest}s</span>` : ''}
                            ${ex.notes ? `<span>📝 ${this.escapeHTML(ex.notes)}</span>` : ''}
                        </div>
                    </div>
                    <div class="exercise-actions">
                        <button class="delete-exercise-btn" data-id="${ex.id}" title="Eliminar">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;

        container.querySelectorAll('.delete-exercise-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(btn.dataset.id);
                this.deleteExercise(id);
            });
        });
    },

    deleteExercise(id) {
        this.showConfirm('¿Eliminar este ejercicio?', () => {
            APP.exercises = APP.exercises.filter(e => e.id !== id);
            Storage.save();
            this.renderExercisesList();
            this.renderExercisesForDate(APP.selectedDate);
            this.updateDashboard();
            this.showToast('Ejercicio eliminado', 'info');
        });
    },

    // ---------- OBJETIVO ENTRENAMIENTO ----------
    updateWorkoutGoal() {
        const startWeight = 58.0;
        const goalWeight = 80.0;
        const current = APP.userBiometrics.weight || startWeight;
        const progress = Math.min(100, ((current - startWeight) / (goalWeight - startWeight)) * 100);
        const remaining = Math.max(0, goalWeight - current);
        const daysRemaining = Math.ceil((remaining / 0.5) * 7);
        const DOM = this.DOM;
        if (DOM.currentWeightGoal) DOM.currentWeightGoal.textContent = `${current.toFixed(1)} kg`;
        if (DOM.weightRemaining) DOM.weightRemaining.textContent = `${remaining.toFixed(1)} kg`;
        if (DOM.daysRemaining) DOM.daysRemaining.textContent = daysRemaining;
        if (DOM.goalProgressBar) DOM.goalProgressBar.style.width = `${progress}%`;
        if (DOM.goalProgressPercent) DOM.goalProgressPercent.textContent = `${progress.toFixed(1)}% completado`;
    },

    // ---------- BIOMETRÍA ----------
    updateBiometryDisplay() {
        const hist = APP.userBiometrics.history;
        if (hist && hist.length > 0) {
            const latest = hist[hist.length - 1];
            const DOM = this.DOM;
            if (DOM.currentWeight) DOM.currentWeight.textContent = `${latest.weight.toFixed(1)} kg`;
            if (DOM.currentFat) DOM.currentFat.textContent = `${latest.fat.toFixed(1)}%`;
            if (DOM.currentBMI) DOM.currentBMI.textContent = latest.bmi?.toFixed(1) || '--';
            if (DOM.currentMusclePercent) DOM.currentMusclePercent.textContent = `${latest.muscle.toFixed(1)}%`;
            if (DOM.currentWater) DOM.currentWater.textContent = `${latest.water.toFixed(1)}%`;
            if (DOM.currentBone) DOM.currentBone.textContent = `${latest.bone.toFixed(1)} kg`;
            if (hist.length >= 2) {
                const prev = hist[hist.length - 2];
                this._updateChange(DOM.weightChange, latest.weight - prev.weight, 'kg');
                this._updateChange(DOM.fatChange, latest.fat - prev.fat, '%');
                this._updateChange(DOM.muscleChange, latest.muscle - prev.muscle, '%');
                this._updateChange(DOM.waterChange, latest.water - prev.water, '%');
                this._updateChange(DOM.boneChange, latest.bone - prev.bone, 'kg');
            }
            if (DOM.bmiCategory) {
                const bmi = latest.bmi;
                let cat = '', color = '';
                if (bmi < 18.5) { cat = 'Bajo peso'; color = '#FFC107'; }
                else if (bmi < 25) { cat = 'Normal'; color = '#4CAF50'; }
                else if (bmi < 30) { cat = 'Sobrepeso'; color = '#FF9800'; }
                else { cat = 'Obesidad'; color = '#F44336'; }
                DOM.bmiCategory.textContent = cat;
                DOM.bmiCategory.style.color = color;
            }
        } else {
            const DOM = this.DOM;
            if (DOM.currentWeight) DOM.currentWeight.textContent = '-- kg';
            if (DOM.currentFat) DOM.currentFat.textContent = '--%';
            if (DOM.currentBMI) DOM.currentBMI.textContent = '--';
            if (DOM.currentMusclePercent) DOM.currentMusclePercent.textContent = '--%';
            if (DOM.currentWater) DOM.currentWater.textContent = '--%';
            if (DOM.currentBone) DOM.currentBone.textContent = '-- kg';
            if (DOM.bmiCategory) DOM.bmiCategory.textContent = '--';
        }
    },

    _updateChange(el, change, unit) {
        if (!el) return;
        if (isNaN(change)) { el.textContent = '--'; return; }
        const abs = Math.abs(change);
        const arrow = change >= 0 ? '↑' : '↓';
        const color = change >= 0 ? (unit === 'kg' ? '#F44336' : '#4CAF50') : (unit === 'kg' ? '#4CAF50' : '#F44336');
        el.innerHTML = `<span style="color:${color}">${arrow} ${abs.toFixed(1)}${unit}</span>`;
    },

    // ---------- PERFIL ----------
    updateUserProfileDisplay() {
        const p = APP.userProfile;
        const goalMap = { lose: 'Perder grasa', gain: 'Ganar músculo', maintain: 'Mantenerse', strength: 'Fuerza', endurance: 'Resistencia' };
        const levelMap = { beginner: 'Principiante', intermediate: 'Intermedio', advanced: 'Avanzado' };
        const el = (id) => document.getElementById(id);
        if (el('userAge')) el('userAge').textContent = `${p.age} años`;
        if (el('userHeight')) el('userHeight').textContent = `${p.height} cm`;
        if (el('userGoal')) el('userGoal').textContent = goalMap[p.goal] || p.goal;
        if (el('userLevel')) el('userLevel').textContent = levelMap[p.level] || p.level;
    },

    // ---------- GRÁFICOS ----------
    updateWeightChart() {
        // Gráfico del dashboard (existente)
        const canvas = document.getElementById('weightChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (APP.weightChart) { APP.weightChart.destroy(); }
        const history = APP.userBiometrics.history || [];
        if (history.length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Sin datos de peso', canvas.width/2, canvas.height/2);
            return;
        }
        const sorted = history.sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sorted.map(r => new Date(r.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
        const weights = sorted.map(r => r.weight);
        const fats = sorted.map(r => r.fat);
        APP.weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Peso (kg)', data: weights, borderColor: '#4CAF50', backgroundColor: '#4CAF5033', fill: true, tension: 0.2 },
                    { label: 'Grasa (%)', data: fats, borderColor: '#2196F3', backgroundColor: '#2196F333', fill: true, tension: 0.2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 10 } } } },
                scales: {
                    x: { ticks: { color: '#94a3b8', maxTicksLimit: 6 } },
                    y: { ticks: { color: '#94a3b8' } }
                }
            }
        });
    },

    updateBodyCompositionChart() {
        const canvas = document.getElementById('bodyCompositionChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (APP.biometryChart) { APP.biometryChart.destroy(); }
        const latest = APP.userBiometrics.history?.slice(-1)[0];
        if (!latest) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Sin datos', canvas.width/2, canvas.height/2);
            return;
        }
        const muscleMass = (latest.weight * latest.muscle) / 100;
        const fatMass = (latest.weight * latest.fat) / 100;
        const waterMass = (latest.weight * latest.water) / 100;
        const boneMass = latest.bone;
        const otherMass = latest.weight - (muscleMass + fatMass + waterMass + boneMass);
        APP.biometryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Músculo', 'Grasa', 'Agua', 'Huesos', 'Otros'],
                datasets: [{
                    data: [muscleMass, fatMass, waterMass, boneMass, otherMass],
                    backgroundColor: ['#4CAF50', '#FF5252', '#2196F3', '#FF9800', '#9E9E9E'],
                    borderWidth: 2,
                    borderColor: '#1e293b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#e2e8f0', font: { size: 10 } } },
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(1)}kg (${((ctx.raw/latest.weight)*100).toFixed(1)}%)` } }
                }
            }
        });
    },

    // ---------- GRÁFICOS AVANZADOS (PESTAÑA PROGRESO) ----------
    renderAdvancedCharts() {
        this.renderWeightChartAdvanced();
        this.renderStrengthChart();
        this.renderCalorieChart();
    },

    renderWeightChartAdvanced() {
        const canvas = this.DOM.weightChartAdvanced;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (APP.weightChartAdvanced) { APP.weightChartAdvanced.destroy(); }
        const history = APP.userBiometrics.history || [];
        if (history.length === 0) {
            ctx.fillStyle = '#94a3b8';
            ctx.font = '14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Sin datos de peso', canvas.width/2, canvas.height/2);
            return;
        }
        const sorted = history.sort((a, b) => new Date(a.date) - new Date(b.date));
        const labels = sorted.map(r => new Date(r.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
        const weights = sorted.map(r => r.weight);
        const fats = sorted.map(r => r.fat);
        APP.weightChartAdvanced = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Peso (kg)', data: weights, borderColor: '#4CAF50', backgroundColor: '#4CAF5033', fill: true, tension: 0.2 },
                    { label: 'Grasa (%)', data: fats, borderColor: '#2196F3', backgroundColor: '#2196F333', fill: true, tension: 0.2 }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 10 } } } },
                scales: {
                    x: { ticks: { color: '#94a3b8', maxTicksLimit: 8 } },
                    y: { ticks: { color: '#94a3b8' } }
                }
            }
        });
    },

    renderStrengthChart() {
        const canvas = this.DOM.strengthChart;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (APP.strengthChart) { APP.strengthChart.destroy(); }

        const exerciseMap = {};
        const sortedExercises = [...APP.exercises].sort((a, b) => a.timestamp - b.timestamp);
        sortedExercises.forEach(ex => {
            if (!exerciseMap[ex.name]) {
                exerciseMap[ex.name] = { labels: [], data: [] };
            }
            if (ex.weight > 0) {
                exerciseMap[ex.name].labels.push(new Date(ex.timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }));
                exerciseMap[ex.name].data.push(ex.weight);
            }
        });

        const sortedNames = Object.keys(exerciseMap).sort((a, b) => exerciseMap[b].data.length - exerciseMap[a].data.length).slice(0, 5);
        const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];
        const datasets = sortedNames.map((name, i) => ({
            label: name,
            data: exerciseMap[name].data,
            borderColor: colors[i % colors.length],
            backgroundColor: colors[i % colors.length] + '33',
            tension: 0.2,
            fill: true,
            pointRadius: 3
        }));

        APP.strengthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: exerciseMap[sortedNames[0]]?.labels || [],
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 10 } } } },
                scales: {
                    x: { ticks: { color: '#94a3b8', maxTicksLimit: 6 } },
                    y: { ticks: { color: '#94a3b8' }, title: { display: true, text: 'Peso (kg)', color: '#94a3b8' } }
                }
            }
        });
    },

    renderCalorieChart() {
        const canvas = this.DOM.calorieChart;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (APP.calorieChart) { APP.calorieChart.destroy(); }

        const today = new Date();
        const days = [];
        const calorieData = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            days.push(dateStr);
            const dayMeals = APP.meals.filter(m => m.date === dateStr);
            const total = dayMeals.reduce((s, m) => s + m.calories, 0);
            calorieData.push(total);
        }

        APP.calorieChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days.map(d => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })),
                datasets: [{
                    label: 'Calorías',
                    data: calorieData,
                    backgroundColor: calorieData.map(v => v > APP.calorieGoal ? '#F4433666' : '#4CAF5066'),
                    borderColor: calorieData.map(v => v > APP.calorieGoal ? '#F44336' : '#4CAF50'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#e2e8f0', font: { size: 10 } } } },
                scales: {
                    x: { ticks: { color: '#94a3b8', maxTicksLimit: 10 } },
                    y: { ticks: { color: '#94a3b8' }, title: { display: true, text: 'Calorías (kcal)', color: '#94a3b8' } }
                }
            }
        });
    },

    // ---------- RUTINAS PERSONALIZADAS ----------
    renderCustomRoutines() {
        const container = document.getElementById('customRoutinesContainer');
        if (!container) return;
        if (APP.customRoutines.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column:1/-1;"><p>No tienes rutinas guardadas. ¡Crea una!</p></div>`;
            return;
        }
        container.innerHTML = APP.customRoutines.map((routine, idx) => `
            <div class="routine-card" style="border-color: var(--app-primary);">
                <button class="delete-routine" data-idx="${idx}" title="Eliminar rutina">×</button>
                <div class="routine-icon">📋</div>
                <h4>${this.escapeHTML(routine.name)}</h4>
                <p>${routine.exercises.length} ejercicios</p>
                <span class="routine-duration">~${routine.exercises.reduce((sum, ex) => sum + (ex.sets || 0), 0) * 2} min</span>
                <button onclick="UI.loadRoutine(${idx})" class="routine-btn">Cargar</button>
            </div>
        `).join('');

        container.querySelectorAll('.delete-routine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                UI.showConfirm(`¿Eliminar la rutina "${APP.customRoutines[idx].name}"?`, () => {
                    APP.customRoutines.splice(idx, 1);
                    Storage.save();
                    UI.renderCustomRoutines();
                    UI.showToast('Rutina eliminada', 'info');
                });
            });
        });
    },

    loadRoutine(idx) {
        const routine = APP.customRoutines[idx];
        if (!routine) return;
        const date = APP.selectedDate;
        routine.exercises.forEach(ex => {
            APP.exercises.push({
                id: Date.now() + Math.random(),
                name: ex.name,
                sets: parseInt(ex.sets) || 3,
                reps: parseInt(ex.reps) || 10,
                weight: parseFloat(ex.weight) || 0,
                rest: 60,
                notes: `Rutina: ${routine.name}`,
                date,
                time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
                timestamp: Date.now()
            });
        });
        Storage.save();
        UI.renderExercisesList();
        UI.renderExercisesForDate(date);
        UI.updateDashboard();
        UI.showToast(`✅ Rutina "${routine.name}" cargada (${routine.exercises.length} ejercicios)`, 'success');
    },

    // ---------- UTILIDADES ----------
    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>"]/g, (m) => {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }
};

/**********************
 *  NAVEGACIÓN
 **********************/
const Nav = {
    init() {
        const tabs = document.querySelectorAll('.nav-tab[data-target]');
        const sections = document.querySelectorAll('.content-section');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.target;
                if (!target) return;
                tabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
                sections.forEach(s => {
                    s.classList.remove('active');
                    if (s.id === target) {
                        s.classList.add('active');
                        s.removeAttribute('hidden');
                    } else {
                        s.setAttribute('hidden', 'true');
                    }
                });
                if (target === 'meals') UI.renderCalendar();
                if (target === 'workout') UI.renderExercisesList();
                if (target === 'body') UI.updateBiometryDisplay();
                if (target === 'dashboard') UI.updateDashboard();
                if (target === 'progress') {
                    setTimeout(() => UI.renderAdvancedCharts(), 100);
                }
                if (target === 'settings') {
                    UI.DOM.calorieGoalInput.value = APP.calorieGoal;
                    UI.DOM.proteinGoalInput.value = APP.proteinGoal;
                    UI.DOM.waterGoalInput.value = APP.waterGoal;
                }
            });
        });
    }
};

/**********************
 *  IA COACH REAL (OpenRouter API)
 **********************/
const CoachAI = {
    apiKey: localStorage.getItem('openrouter_api_key') || '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',
    model: 'openai/gpt-4o',
    systemPrompt: `Eres un entrenador personal experto en fitness, nutrición, motivación y salud. 
Respondes de forma clara, útil y motivadora. Ayudas a los usuarios a alcanzar sus objetivos de forma realista.
Puedes responder preguntas generales también, pero siempre con un enfoque en el bienestar y la ciencia del ejercicio.
Usa un tono profesional pero cercano. Formatea tus respuestas con saltos de línea y listas cuando sea necesario.`,
    conversation: [],

    init() {
        const saved = localStorage.getItem('coach_history');
        if (saved) {
            try {
                this.conversation = JSON.parse(saved);
            } catch (e) {
                this.conversation = [];
            }
        }
        if (this.conversation.length === 0) {
            this.conversation.push({
                role: 'assistant',
                content: '¡Hola! Soy tu entrenador personal con IA. Puedes preguntarme cualquier cosa sobre fitness, nutrición, rutinas, motivación o salud. ¿En qué puedo ayudarte hoy?'
            });
            this.saveHistory();
        }
        this.renderMessages();
        this.updateStatus('online');
    },

    saveHistory() {
        localStorage.setItem('coach_history', JSON.stringify(this.conversation));
    },

    clearHistory() {
        this.conversation = [];
        this.saveHistory();
        this.renderMessages();
        this.conversation.push({
            role: 'assistant',
            content: '¡Hola! He reiniciado nuestra conversación. ¿En qué puedo ayudarte?'
        });
        this.saveHistory();
        this.renderMessages();
    },

    updateStatus(status) {
        const dot = UI.DOM.statusDot;
        const text = UI.DOM.statusText;
        if (!dot) return;
        dot.className = `status-dot ${status}`;
        if (text) {
            if (status === 'online') text.textContent = 'Conectado';
            else if (status === 'loading') text.textContent = 'Pensando...';
            else text.textContent = 'Desconectado';
        }
    },

    async sendMessage(userMessage) {
        if (!userMessage.trim()) return;
        if (!this.apiKey) {
            UI.showToast('⚠️ API Key no configurada. Ve a Configuración.', 'warning');
            return;
        }

        this.conversation.push({ role: 'user', content: userMessage });
        this.saveHistory();
        this.renderMessages();

        this.showTyping(true);
        this.updateStatus('loading');

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'AI Fitness Tracker'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: this.systemPrompt },
                        ...this.conversation
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message || 'Error de la API');
            }

            const assistantReply = data.choices[0].message.content;

            this.conversation.push({ role: 'assistant', content: assistantReply });
            this.saveHistory();
            this.renderMessages();

        } catch (error) {
            console.error('Error en Coach AI:', error);
            UI.showToast('Error al conectar con la IA: ' + error.message, 'error');
            this.conversation.push({
                role: 'assistant',
                content: 'Lo siento, hubo un problema al procesar tu pregunta. Por favor, verifica tu conexión y API Key.'
            });
            this.saveHistory();
            this.renderMessages();
        } finally {
            this.showTyping(false);
            this.updateStatus('online');
        }
    },

    showTyping(show) {
        const container = UI.DOM.chatMessages;
        if (!container) return;
        const old = container.querySelector('.typing-indicator');
        if (old) old.remove();
        if (show) {
            const div = document.createElement('div');
            div.className = 'message ai-message typing-indicator';
            div.innerHTML = `
                <div class="avatar ai-avatar">AI</div>
                <div class="message-bubble">
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
    },

    renderMessages() {
        const container = UI.DOM.chatMessages;
        if (!container) return;
        container.innerHTML = '';
        this.conversation.forEach(msg => {
            const isAI = msg.role === 'assistant';
            const div = document.createElement('div');
            div.className = `message ${isAI ? 'ai-message' : 'user-message'}`;
            const avatarText = isAI ? 'AI' : 'Tú';
            const avatarClass = isAI ? 'ai-avatar' : 'user-avatar';
            const time = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            const formattedContent = this.formatMessage(msg.content);
            div.innerHTML = `
                <div class="avatar ${avatarClass}">${avatarText}</div>
                <div class="message-bubble">
                    <div>${formattedContent}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
            container.appendChild(div);
        });
        container.scrollTop = container.scrollHeight;
    },

    formatMessage(text) {
        let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\n/g, '<br>');
        return html;
    },

    exportChat() {
        const text = this.conversation.map(m => 
            `${m.role === 'assistant' ? 'AI Coach' : 'Usuario'}: ${m.content}`
        ).join('\n\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-coach-${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        UI.showToast('📥 Conversación exportada', 'success');
    }
};

/**********************
 *  IA REAL PARA COMIDAS Y CHEF (OpenRouter)
 **********************/
const AI = {
    apiKey: localStorage.getItem('openrouter_api_key') || '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',
    model: 'openai/gpt-4o',

    async analyzeMeal(description) {
        if (!description || description.length < 5) {
            UI.showToast('Describe la comida con más detalle', 'warning');
            return null;
        }
        if (!this.apiKey) {
            UI.showToast('⚠️ API Key no configurada', 'warning');
            return null;
        }

        const prompt = `Eres un nutricionista experto. Analiza la siguiente descripción de comida y devuelve SOLO un objeto JSON con las claves: calories (número), protein (número), carbs (número), fat (número). No añadas texto adicional. Descripción: "${description}"`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'AI Fitness Tracker'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                    max_tokens: 150
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            const result = JSON.parse(data.choices[0].message.content);
            return {
                calories: Math.round(result.calories),
                protein: Math.round(result.protein * 10) / 10,
                carbs: Math.round(result.carbs * 10) / 10,
                fat: Math.round(result.fat * 10) / 10
            };
        } catch (error) {
            console.error('Error en análisis IA:', error);
            UI.showToast('Error al analizar con IA: ' + error.message, 'error');
            return null;
        }
    },

    async generateMealPlan(objective, preferences, foods) {
        if (!this.apiKey) {
            UI.showToast('⚠️ API Key no configurada', 'warning');
            return null;
        }

        const prefText = preferences.join(', ');
        const foodText = foods.length ? foods.join(', ') : 'ingredientes comunes (pollo, arroz, verduras)';

        const prompt = `Eres un chef experto en nutrición deportiva. Genera un plan de comidas para un día completo (desayuno, almuerzo, cena y snack) basado en:
        - Objetivo: ${objective}
        - Preferencias dietéticas: ${prefText || 'ninguna'}
        - Alimentos disponibles: ${foodText}

        Devuelve SOLO un objeto JSON con esta estructura:
        {
            "breakfast": { "name": "nombre", "ingredients": ["ing1", "ing2"], "instructions": ["paso1", "paso2"], "calories": 0, "protein": 0, "carbs": 0, "fat": 0 },
            "lunch": { ... },
            "dinner": { ... },
            "snack": { ... }
        }
        No añadas texto adicional.`;

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': window.location.href,
                    'X-Title': 'AI Fitness Tracker'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.6,
                    max_tokens: 800
                })
            });
            const data = await response.json();
            if (data.error) throw new Error(data.error.message);
            const result = JSON.parse(data.choices[0].message.content);
            return result;
        } catch (error) {
            console.error('Error en Chef IA:', error);
            UI.showToast('Error al generar plan: ' + error.message, 'error');
            return null;
        }
    }
};

/**********************
 *  FUNCIONES GLOBALES
 **********************/
function clearCurrentSession() {
    UI.showConfirm('¿Vaciar todos los ejercicios de hoy?', () => {
        const today = new Date().toISOString().split('T')[0];
        APP.exercises = APP.exercises.filter(e => e.date !== today);
        Storage.save();
        UI.renderExercisesList();
        UI.renderExercisesForDate(APP.selectedDate);
        UI.updateDashboard();
        UI.showToast('Sesión vaciada', 'info');
    });
}

window.loadQuickRoutine = function(type) {
    const routines = {
        upper: [
            { name: 'Press de banca', sets: 3, reps: 10 },
            { name: 'Dominadas', sets: 3, reps: 8 },
            { name: 'Press militar', sets: 3, reps: 10 },
            { name: 'Remo con barra', sets: 3, reps: 10 }
        ],
        lower: [
            { name: 'Sentadillas', sets: 4, reps: 12 },
            { name: 'Peso muerto', sets: 3, reps: 8 },
            { name: 'Zancadas', sets: 3, reps: 12 }
        ],
        fullbody: [
            { name: 'Sentadillas', sets: 3, reps: 12 },
            { name: 'Press de banca', sets: 3, reps: 10 },
            { name: 'Remo con barra', sets: 3, reps: 10 },
            { name: 'Plancha', sets: 3, reps: 30 }
        ],
        core: [
            { name: 'Plancha', sets: 3, reps: 60 },
            { name: 'Crunch', sets: 3, reps: 15 },
            { name: 'Elevación piernas', sets: 3, reps: 12 }
        ],
        // NUEVA RUTINA PARKOUR
        parkour: [
            { name: 'Saltos de precisión', sets: 4, reps: 8 },
            { name: 'Trepa de muros', sets: 3, reps: 5 },
            { name: 'Equilibrio en barra', sets: 3, reps: 30 }, // 30 segundos
            { name: 'Rodamiento/voltereta', sets: 3, reps: 6 },
            { name: 'Flexiones de brazos', sets: 3, reps: 15 }
        ]
    };
    const routine = routines[type];
    if (!routine) return UI.showToast('Rutina no encontrada', 'error');
    const date = APP.selectedDate;
    routine.forEach(ex => {
        APP.exercises.push({
            id: Date.now() + Math.random(),
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps,
            weight: 0,
            rest: 60,
            notes: `Rutina ${type}`,
            date,
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
    });
    Storage.save();
    UI.renderExercisesList();
    UI.renderExercisesForDate(date);
    UI.updateDashboard();
    UI.showToast(`✅ Rutina ${type} cargada (${routine.length} ejercicios)`, 'success');
};

/**********************
 *  RUTINAS PERSONALIZADAS - MODAL
 **********************/
let editingRoutineIndex = -1;

function openRoutineModal(routineIndex = -1) {
    editingRoutineIndex = routineIndex;
    const modal = document.getElementById('routineModal');
    const title = document.getElementById('routineModalTitle');
    const nameInput = document.getElementById('routineNameInput');
    const list = document.getElementById('routineExerciseList');

    if (routineIndex >= 0 && routineIndex < APP.customRoutines.length) {
        const routine = APP.customRoutines[routineIndex];
        title.innerHTML = '<i class="fas fa-edit"></i> Editar Rutina';
        nameInput.value = routine.name;
        list.innerHTML = routine.exercises.map((ex, idx) => `
            <div class="routine-exercise-item" data-idx="${idx}">
                <input type="text" class="ex-name" value="${UI.escapeHTML(ex.name)}" placeholder="Ejercicio" style="flex:2;">
                <input type="number" class="ex-sets" value="${ex.sets || 3}" placeholder="S" style="flex:0.5; min-width:40px;">
                <input type="number" class="ex-reps" value="${ex.reps || 10}" placeholder="R" style="flex:0.5; min-width:40px;">
                <input type="number" class="ex-weight" value="${ex.weight || 0}" placeholder="kg" style="flex:0.5; min-width:40px;">
                <button class="remove-exercise" onclick="this.closest('.routine-exercise-item').remove()">×</button>
            </div>
        `).join('');
    } else {
        title.innerHTML = '<i class="fas fa-folder-plus"></i> Nueva Rutina';
        nameInput.value = '';
        list.innerHTML = '';
    }

    modal.style.display = 'flex';
    modal.removeAttribute('hidden');
}

function closeRoutineModal() {
    document.getElementById('routineModal').style.display = 'none';
    document.getElementById('routineModal').setAttribute('hidden', 'true');
}

function addExerciseToRoutineForm() {
    const list = document.getElementById('routineExerciseList');
    const div = document.createElement('div');
    div.className = 'routine-exercise-item';
    div.innerHTML = `
        <input type="text" class="ex-name" placeholder="Ejercicio" style="flex:2;">
        <input type="number" class="ex-sets" value="3" placeholder="S" style="flex:0.5; min-width:40px;">
        <input type="number" class="ex-reps" value="10" placeholder="R" style="flex:0.5; min-width:40px;">
        <input type="number" class="ex-weight" value="0" placeholder="kg" style="flex:0.5; min-width:40px;">
        <button class="remove-exercise" onclick="this.closest('.routine-exercise-item').remove()">×</button>
    `;
    list.appendChild(div);
}

function saveRoutine() {
    const name = document.getElementById('routineNameInput').value.trim();
    if (!name) {
        UI.showToast('Ingresa un nombre para la rutina', 'warning');
        return;
    }
    const items = document.querySelectorAll('#routineExerciseList .routine-exercise-item');
    const exercises = [];
    items.forEach(item => {
        const nameEl = item.querySelector('.ex-name');
        const setsEl = item.querySelector('.ex-sets');
        const repsEl = item.querySelector('.ex-reps');
        const weightEl = item.querySelector('.ex-weight');
        if (nameEl && nameEl.value.trim()) {
            exercises.push({
                name: nameEl.value.trim(),
                sets: parseInt(setsEl.value) || 3,
                reps: parseInt(repsEl.value) || 10,
                weight: parseFloat(weightEl.value) || 0
            });
        }
    });

    if (exercises.length === 0) {
        UI.showToast('Añade al menos un ejercicio', 'warning');
        return;
    }

    if (editingRoutineIndex >= 0 && editingRoutineIndex < APP.customRoutines.length) {
        APP.customRoutines[editingRoutineIndex] = { name, exercises };
        UI.showToast('✅ Rutina actualizada', 'success');
    } else {
        APP.customRoutines.push({ name, exercises });
        UI.showToast('✅ Rutina creada', 'success');
    }

    Storage.save();
    UI.renderCustomRoutines();
    closeRoutineModal();
}

/**********************
 *  AUTENTICACIÓN FIREBASE
 **********************/
function setupAuth() {
    if (!firebaseReady) return;

    const authBtn = document.getElementById('authBtn');
    const authText = document.getElementById('authText');

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            authText.textContent = 'Cerrar sesión';
            authBtn.style.borderColor = '#F44336';
            authBtn.style.color = '#F44336';
            await Storage.loadFromCloud();
            UI.showToast(`👋 Hola ${user.displayName || 'usuario'}`, 'success');
        } else {
            currentUser = null;
            authText.textContent = 'Iniciar sesión';
            authBtn.style.borderColor = '#4285F4';
            authBtn.style.color = '#4285F4';
            Storage.load();
            UI.refreshAll();
        }
    });

    authBtn.addEventListener('click', () => {
        if (currentUser) {
            auth.signOut();
            UI.showToast('Sesión cerrada', 'info');
        } else {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider).catch((error) => {
                UI.showToast('Error al iniciar sesión: ' + error.message, 'error');
            });
        }
    });
}

/**********************
 *  EVENTOS PRINCIPALES
 **********************/
function setupEvents() {
    const DOM = UI.DOM;

    // Tema
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        themeToggle.innerHTML = isLight ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        UI.showToast(isLight ? 'Modo claro' : 'Modo oscuro', 'info');
    });

    // Modo GYM
    document.getElementById('gymModeBtn').addEventListener('click', function() {
        this.classList.toggle('active');
        UI.showToast(this.classList.contains('active') ? 'Modo GYM activado' : 'Modo GYM desactivado', 'info');
    });

    // Refresh
    document.getElementById('refreshData').addEventListener('click', () => {
        UI.refreshAll();
        UI.showToast('Datos actualizados', 'success');
    });

    // Agua
    document.getElementById('addWaterBtn').addEventListener('click', () => {
        APP.waterGlasses++;
        Storage.save();
        UI.updateDashboard();
        UI.showToast(`💧 Agua: ${APP.waterGlasses} vasos`, 'success');
    });

    // Guardar comida
    DOM.saveMealBtn.addEventListener('click', () => {
        const name = DOM.mealNameInput.value.trim();
        const desc = DOM.mealDescription.value.trim();
        const cal = parseInt(DOM.mealCaloriesInput.value) || 0;
        const prot = parseFloat(DOM.mealProteinInput.value) || 0;
        const carbs = parseFloat(DOM.mealCarbsInput.value) || 0;
        const fat = parseFloat(DOM.mealFatInput.value) || 0;
        const date = DOM.mealDateInput.value || APP.selectedDate;
        if (!name || cal <= 0) {
            UI.showToast('Nombre y calorías obligatorios', 'error');
            return;
        }
        const meal = {
            id: Date.now(),
            name, description: desc, calories: cal,
            protein: prot, carbs, fat,
            date, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };
        APP.meals.push(meal);
        Storage.save();
        UI.renderMealsForDate(date);
        UI.updateDashboard();
        DOM.mealNameInput.value = '';
        DOM.mealDescription.value = '';
        DOM.mealCaloriesInput.value = '';
        DOM.mealProteinInput.value = '';
        DOM.mealCarbsInput.value = '';
        DOM.mealFatInput.value = '';
        document.getElementById('aiAnalysisResult').style.display = 'none';
        UI.showToast(`✅ ${name} guardado`, 'success');
    });

    // Limpiar formulario comida
    DOM.clearMealForm.addEventListener('click', () => {
        DOM.mealNameInput.value = '';
        DOM.mealDescription.value = '';
        DOM.mealCaloriesInput.value = '';
        DOM.mealProteinInput.value = '';
        DOM.mealCarbsInput.value = '';
        DOM.mealFatInput.value = '';
        document.getElementById('aiAnalysisResult').style.display = 'none';
    });

    // Añadir ejercicio
    DOM.addExerciseBtn.addEventListener('click', function() {
        const name = DOM.exerciseName.value.trim();
        const sets = parseInt(DOM.exerciseSets.value) || 0;
        const reps = parseInt(DOM.exerciseReps.value) || 0;
        const weight = parseFloat(DOM.exerciseWeight.value) || 0;
        const rest = parseInt(DOM.exerciseRest.value) || 60;
        const notes = DOM.exerciseNotes.value.trim();
        const date = DOM.exerciseDateInput.value || APP.selectedDate;
        if (!name || sets <= 0 || reps <= 0) {
            UI.showToast('Nombre, series y repeticiones válidos', 'error');
            return;
        }
        const ex = {
            id: Date.now(),
            name, sets, reps, weight, rest, notes,
            date, time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };
        APP.exercises.push(ex);
        Storage.save();
        UI.renderExercisesList();
        UI.renderExercisesForDate(date);
        UI.updateDashboard();
        DOM.exerciseName.value = '';
        DOM.exerciseNotes.value = '';
        // Feedback
        const btn = DOM.addExerciseBtn;
        btn.innerHTML = '<i class="fas fa-check"></i> Añadido';
        btn.style.background = '#4CAF50';
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-plus"></i> Añadir ejercicio';
            btn.style.background = '';
        }, 1200);
        UI.showToast(`💪 ${name} registrado`, 'success');
    });

    // Finalizar sesión
    DOM.finishWorkoutBtn.addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        const count = APP.exercises.filter(e => e.date === today).length;
        if (count === 0) {
            UI.showToast('No hay ejercicios hoy', 'warning');
            return;
        }
        UI.showToast(`🏋️ Sesión finalizada (${count} ejercicios)`, 'success');
    });

    // Vaciar sesión
    const clearSessionBtn = document.getElementById('clearSessionBtn');
    if (clearSessionBtn) clearSessionBtn.addEventListener('click', clearCurrentSession);

    // Guardar biometría
    DOM.saveBodyBtn.addEventListener('click', () => {
        const weight = parseFloat(DOM.bodyWeight.value);
        const fat = parseFloat(DOM.bodyFat.value) || 0;
        const muscle = parseFloat(DOM.bodyMusclePercent.value) || 0;
        const water = parseFloat(DOM.bodyWater.value) || 60;
        const bone = parseFloat(DOM.bodyBone.value) || 3;
        const date = DOM.bodyDateInput.value || APP.selectedDate;
        if (!weight || weight <= 0) {
            UI.showToast('Peso obligatorio', 'error');
            return;
        }
        const heightM = APP.userProfile.height / 100;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        const record = { date, weight, fat, muscle, water, bone, bmi };
        APP.userBiometrics.history.push(record);
        APP.userBiometrics.weight = weight;
        APP.userBiometrics.fat = fat;
        APP.userBiometrics.muscle = muscle;
        APP.userBiometrics.water = water;
        APP.userBiometrics.bone = bone;
        if (APP.userBiometrics.history.length > 30) APP.userBiometrics.history.shift();
        Storage.save();
        UI.updateBiometryDisplay();
        UI.updateWorkoutGoal();
        DOM.bodyWeight.value = '';
        DOM.bodyFat.value = '';
        DOM.bodyMusclePercent.value = '';
        DOM.bodyWater.value = '';
        DOM.bodyBone.value = '';
        UI.showToast('✅ Biometría guardada', 'success');
    });

    // Calcular biometría
    DOM.calculateBodyBtn.addEventListener('click', () => {
        const weight = parseFloat(DOM.bodyWeight.value);
        if (!weight || weight <= 0) {
            UI.showToast('Ingresa el peso primero', 'warning');
            return;
        }
        const bmi = weight / ((APP.userProfile.height / 100) ** 2);
        let fat, muscle;
        if (bmi < 18.5) { fat = 10 + Math.random()*5; muscle = 40 + Math.random()*5; }
        else if (bmi < 25) { fat = 15 + Math.random()*10; muscle = 35 + Math.random()*5; }
        else if (bmi < 30) { fat = 25 + Math.random()*10; muscle = 30 + Math.random()*5; }
        else { fat = 30 + Math.random()*15; muscle = 25 + Math.random()*5; }
        const water = 55 + Math.random()*10;
        const bone = (weight * 0.15).toFixed(1);
        DOM.bodyFat.value = fat.toFixed(1);
        DOM.bodyMusclePercent.value = muscle.toFixed(1);
        DOM.bodyWater.value = water.toFixed(1);
        DOM.bodyBone.value = bone;
        UI.showToast('📊 Valores estimados', 'info');
    });

    // Guardar metas
    DOM.saveGoalsBtn.addEventListener('click', () => {
        const cal = parseInt(DOM.calorieGoalInput.value);
        const prot = parseInt(DOM.proteinGoalInput.value);
        const water = parseInt(DOM.waterGoalInput.value);
        if (cal >= 1000) APP.calorieGoal = cal;
        if (prot >= 50) APP.proteinGoal = prot;
        if (water >= 1000) APP.waterGoal = water;
        Storage.save();
        UI.updateDashboard();
        UI.showToast('Metas guardadas', 'success');
    });

    // Test modal
    DOM.startTestBtn.addEventListener('click', startTest);
    DOM.testPrevBtn.addEventListener('click', prevTestQuestion);
    DOM.testNextBtn.addEventListener('click', nextTestQuestion);

    // Perfil modal
    DOM.editProfileBtn.addEventListener('click', openProfileModal);

    // Import/Export
    document.querySelector('.btn-secondary[onclick="backupData()"]')?.addEventListener('click', Storage.exportData);
    document.querySelector('.btn-secondary[onclick="importData()"]')?.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            if (e.target.files.length > 0) Storage.importData(e.target.files[0]);
        };
        input.click();
    });
    document.querySelector('.btn-secondary[onclick="clearAllData()"]')?.addEventListener('click', () => {
        UI.showConfirm('¿Eliminar todos los datos?', () => {
            localStorage.removeItem('fitnessTrackerData');
            location.reload();
        });
    });

    // ---- IA COACH ----
    DOM.sendMessageBtn.addEventListener('click', () => {
        const msg = DOM.chatInput.value.trim();
        if (msg.length < 3) {
            UI.showToast('Escribe al menos 3 caracteres', 'warning');
            return;
        }
        CoachAI.sendMessage(msg);
        DOM.chatInput.value = '';
    });

    DOM.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            DOM.sendMessageBtn.click();
        }
    });

    document.querySelectorAll('.quick-question-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const q = this.dataset.question || this.textContent.trim();
            DOM.chatInput.value = q;
            DOM.sendMessageBtn.click();
        });
    });

    DOM.clearChatBtn.addEventListener('click', () => {
        UI.showConfirm('¿Eliminar toda la conversación?', () => {
            CoachAI.clearHistory();
            UI.showToast('Chat limpiado', 'info');
        });
    });

    DOM.exportChatBtn.addEventListener('click', () => {
        CoachAI.exportChat();
    });

    DOM.saveApiKeyBtn.addEventListener('click', () => {
        const key = DOM.apiKeyInput.value.trim();
        if (key.length < 10) {
            UI.showToast('Introduce una API Key válida', 'error');
            return;
        }
        CoachAI.apiKey = key;
        AI.apiKey = key;
        localStorage.setItem('openrouter_api_key', key);
        UI.showToast('✅ API Key guardada', 'success');
    });

    // ---- RUTINAS PERSONALIZADAS ----
    document.getElementById('createRoutineBtn').addEventListener('click', () => openRoutineModal(-1));
    document.getElementById('addRoutineExerciseBtn').addEventListener('click', addExerciseToRoutineForm);
    document.getElementById('saveRoutineBtn').addEventListener('click', saveRoutine);

    // ---- ANÁLISIS DE COMIDAS CON IA REAL ----
    document.getElementById('analyzeMealBtn').addEventListener('click', async () => {
        const desc = DOM.mealDescription.value.trim();
        if (!desc || desc.length < 5) {
            UI.showToast('Describe la comida con más detalle', 'warning');
            return;
        }
        const result = document.getElementById('aiAnalysisResult');
        result.style.display = 'block';
        result.innerHTML = `<div class="ai-analysis"><p>🤖 Analizando con IA...</p></div>`;
        
        const analysis = await AI.analyzeMeal(desc);
        if (analysis) {
            result.innerHTML = `
                <div class="ai-analysis">
                    <h4><i class="fas fa-brain"></i> Análisis IA</h4>
                    <p>Valores estimados:</p>
                    <div class="ai-values">
                        <span>🔥 Calorías: <strong>${analysis.calories}</strong> kcal</span>
                        <span>💪 Proteína: <strong>${analysis.protein}</strong> g</span>
                        <span>🌾 Carbohidratos: <strong>${analysis.carbs}</strong> g</span>
                        <span>🥓 Grasas: <strong>${analysis.fat}</strong> g</span>
                    </div>
                    <div class="ai-actions">
                        <button id="applyAiValues" class="secondary-btn small-btn">Aplicar valores</button>
                        <button onclick="document.getElementById('aiAnalysisResult').style.display='none'" class="secondary-btn small-btn">Cerrar</button>
                    </div>
                </div>
            `;
            document.getElementById('applyAiValues').addEventListener('click', () => {
                DOM.mealCaloriesInput.value = analysis.calories;
                DOM.mealProteinInput.value = analysis.protein;
                DOM.mealCarbsInput.value = analysis.carbs;
                DOM.mealFatInput.value = analysis.fat;
                UI.showToast('✅ Valores aplicados', 'success');
                result.style.display = 'none';
            });
        } else {
            result.innerHTML = `<div class="ai-analysis"><p>❌ No se pudo analizar. Intenta de nuevo.</p></div>`;
        }
    });

    // ---- CHEF IA REAL ----
    document.getElementById('generate-meal-plan').addEventListener('click', async () => {
        const objective = document.querySelector('.objective-btn.active')?.dataset.objective || 'muscle-gain';
        const preferences = Array.from(document.querySelectorAll('.chip.active')).map(c => c.dataset.pref);
        const foods = document.getElementById('chefFoodInput')?.value.split(',').map(f => f.trim()).filter(Boolean) || [];
        
        UI.showToast('🤖 Generando plan con IA...', 'info');
        const plan = await AI.generateMealPlan(objective, preferences, foods);
        
        if (plan) {
            const slots = document.querySelectorAll('.meal-slot');
            const mealKeys = ['breakfast', 'lunch', 'dinner', 'snack'];
            slots.forEach((slot, idx) => {
                const key = mealKeys[idx];
                const meal = plan[key];
                if (meal) {
                    const content = slot.querySelector('.meal-content');
                    content.innerHTML = `
                        <div class="recipe-card">
                            <div>
                                <h4 style="color:var(--app-gold);">${UI.escapeHTML(meal.name)}</h4>
                                <div class="recipe-ingredients">
                                    <strong>Ingredientes:</strong>
                                    <ul>${meal.ingredients.map(i => `<li>${UI.escapeHTML(i)}</li>`).join('')}</ul>
                                </div>
                            </div>
                            <div>
                                <div class="recipe-instructions">
                                    <strong>Preparación:</strong>
                                    <ol>${meal.instructions.map(i => `<li>${UI.escapeHTML(i)}</li>`).join('')}</ol>
                                </div>
                                <div class="recipe-macros">
                                    <span>🔥 ${meal.calories || 0} kcal</span>
                                    <span>💪 ${meal.protein || 0}g P</span>
                                    <span>🌾 ${meal.carbs || 0}g C</span>
                                    <span>🥓 ${meal.fat || 0}g G</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
            document.querySelectorAll('.chef-results .card').forEach(c => c.classList.remove('hidden'));
            UI.showToast('✅ Plan generado con éxito', 'success');
        } else {
            UI.showToast('❌ Error al generar el plan', 'error');
        }
    });

    document.getElementById('import-shopping-list')?.addEventListener('click', () => {
        UI.showToast('📥 Importando lista de compras... (simulado)', 'info');
        const foods = ['pollo', 'arroz', 'huevos', 'tomate', 'lechuga'];
        document.getElementById('chefFoodInput').value = foods.join(', ');
        UI.showToast('✅ Alimentos importados', 'success');
    });

    // Calendario
    document.getElementById('prevMonth').addEventListener('click', () => {
        APP.currentCalendarMonth--;
        if (APP.currentCalendarMonth < 0) {
            APP.currentCalendarMonth = 11;
            APP.currentCalendarYear--;
        }
        UI.renderCalendar();
    });
    document.getElementById('nextMonth').addEventListener('click', () => {
        APP.currentCalendarMonth++;
        if (APP.currentCalendarMonth > 11) {
            APP.currentCalendarMonth = 0;
            APP.currentCalendarYear++;
        }
        UI.renderCalendar();
    });
    document.getElementById('todayBtn').addEventListener('click', () => {
        const now = new Date();
        APP.currentCalendarMonth = now.getMonth();
        APP.currentCalendarYear = now.getFullYear();
        UI.renderCalendar();
        UI.selectDate(new Date().toISOString().split('T')[0]);
    });
    document.querySelector('.month-select')?.addEventListener('change', function() {
        APP.currentCalendarMonth = parseInt(this.value);
        UI.renderCalendar();
    });
    document.querySelector('.year-input')?.addEventListener('change', function() {
        APP.currentCalendarYear = parseInt(this.value);
        UI.renderCalendar();
    });

    // Acciones rápidas
    document.getElementById('addQuickMealBtn').addEventListener('click', () => {
        UI.showToast('Función: Comida rápida (próximamente)', 'info');
    });
    document.getElementById('addQuickWorkoutBtn').addEventListener('click', () => {
        UI.showToast('Función: Ejercicio rápido (próximamente)', 'info');
    });

    // Generar reporte
    document.getElementById('generateReportBtn').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        const todayMeals = APP.meals.filter(m => m.date === today);
        const totalCal = todayMeals.reduce((s, m) => s + m.calories, 0);
        const totalProt = todayMeals.reduce((s, m) => s + m.protein, 0);
        const report = `
📊 REPORTE DIARIO - ${new Date().toLocaleDateString('es-ES')}
Calorías: ${totalCal}/${APP.calorieGoal} (${Math.round((totalCal/APP.calorieGoal)*100)}%)
Proteína: ${totalProt}/${APP.proteinGoal}g (${Math.round((totalProt/APP.proteinGoal)*100)}%)
Comidas: ${todayMeals.length}
Agua: ${APP.waterGlasses} vasos
        `;
        console.log(report);
        UI.showToast('Reporte generado (ver consola)', 'info');
    });

    // Chef IA - chips y skills (ya tienen eventos)
    document.querySelectorAll('.skill-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.skill-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.objective-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.objective-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
}

/**********************
 *  TEST DE PERSONALIZACIÓN
 **********************/
const testQuestions = [
    { id: 1, question: '¿Cuál es tu principal objetivo?', type: 'single', options: [
        { value: 'lose', label: 'Perder grasa' },
        { value: 'gain', label: 'Ganar músculo' },
        { value: 'maintain', label: 'Mantenerme' },
        { value: 'strength', label: 'Fuerza' }
    ]},
    { id: 2, question: 'Nivel de experiencia', type: 'single', options: [
        { value: 'beginner', label: 'Principiante' },
        { value: 'intermediate', label: 'Intermedio' },
        { value: 'advanced', label: 'Avanzado' }
    ]},
    { id: 3, question: 'Días de entrenamiento', type: 'single', options: [
        { value: '2', label: '2' }, { value: '3', label: '3' },
        { value: '4', label: '4' }, { value: '5', label: '5' },
        { value: '6', label: '6+' }
    ]},
    { id: 4, question: 'Dieta preferida', type: 'single', options: [
        { value: 'balanced', label: 'Balanceada' },
        { value: 'vegetarian', label: 'Vegetariana' },
        { value: 'vegan', label: 'Vegana' },
        { value: 'lowcarb', label: 'Baja en carbos' },
        { value: 'highprotein', label: 'Alta proteína' }
    ]},
    { id: 5, question: 'Actividad diaria', type: 'single', options: [
        { value: 'sedentary', label: 'Sedentario' },
        { value: 'light', label: 'Ligero' },
        { value: 'moderate', label: 'Moderado' },
        { value: 'active', label: 'Activo' },
        { value: 'very_active', label: 'Muy activo' }
    ]}
];
let testAnswers = {};
let currentTestQuestion = 0;

function startTest() {
    currentTestQuestion = 0;
    testAnswers = {};
    UI.DOM.testModal.style.display = 'flex';
    UI.DOM.testModal.removeAttribute('hidden');
    renderTestQuestion();
}
function closeTestModal() {
    UI.DOM.testModal.style.display = 'none';
    UI.DOM.testModal.setAttribute('hidden', 'true');
}
function renderTestQuestion() {
    if (currentTestQuestion >= testQuestions.length) { finishTest(); return; }
    const q = testQuestions[currentTestQuestion];
    const DOM = UI.DOM;
    DOM.currentQuestion.textContent = currentTestQuestion + 1;
    DOM.totalQuestions.textContent = testQuestions.length;
    DOM.testProgressFill.style.width = `${((currentTestQuestion+1)/testQuestions.length)*100}%`;
    DOM.testPrevBtn.disabled = currentTestQuestion === 0;
    DOM.testNextBtn.innerHTML = currentTestQuestion === testQuestions.length - 1 ? 'Finalizar' : 'Siguiente';

    let optionsHTML = '';
    if (q.type === 'single') {
        optionsHTML = q.options.map(opt => `
            <label class="test-option">
                <input type="radio" name="q${q.id}" value="${opt.value}" ${testAnswers[q.id] === opt.value ? 'checked' : ''}>
                <span>${opt.label}</span>
            </label>
        `).join('');
    }
    DOM.testContent.innerHTML = `
        <div class="test-question">
            <h4>${q.question}</h4>
            <div class="test-options">${optionsHTML}</div>
        </div>
    `;
    DOM.testContent.querySelectorAll('input[type="radio"]').forEach(inp => {
        inp.addEventListener('change', () => { testAnswers[q.id] = inp.value; });
    });
}
function nextTestQuestion() {
    const q = testQuestions[currentTestQuestion];
    if (!testAnswers[q.id]) {
        UI.showToast('Selecciona una opción', 'warning');
        return;
    }
    currentTestQuestion++;
    if (currentTestQuestion < testQuestions.length) renderTestQuestion();
    else finishTest();
}
function prevTestQuestion() {
    if (currentTestQuestion > 0) { currentTestQuestion--; renderTestQuestion(); }
}
function finishTest() {
    const p = APP.userProfile;
    if (testAnswers[1]) p.goal = testAnswers[1];
    if (testAnswers[2]) p.level = testAnswers[2];
    if (testAnswers[4]) p.diet = testAnswers[4];
    if (testAnswers[5]) p.activity = testAnswers[5];
    const bmr = p.gender === 'male' ?
        88.362 + 13.397 * (APP.userBiometrics.weight || 70) + 4.799 * p.height - 5.677 * p.age :
        447.593 + 9.247 * (APP.userBiometrics.weight || 60) + 3.098 * p.height - 4.330 * p.age;
    const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * (factors[p.activity] || 1.55);
    if (p.goal === 'gain') { APP.calorieGoal = Math.round(tdee * 1.1); APP.proteinGoal = Math.round((APP.userBiometrics.weight || 70) * 1.8); }
    else if (p.goal === 'lose') { APP.calorieGoal = Math.round(tdee * 0.85); APP.proteinGoal = Math.round((APP.userBiometrics.weight || 70) * 2.0); }
    else { APP.calorieGoal = Math.round(tdee); APP.proteinGoal = Math.round((APP.userBiometrics.weight || 70) * 1.6); }
    APP.waterGoal = Math.round((APP.userBiometrics.weight || 70) * 35);
    Storage.save();
    UI.updateDashboard();
    UI.updateUserProfileDisplay();
    closeTestModal();
    UI.showToast('✅ Configuración aplicada', 'success');
}

/**********************
 *  PERFIL MODAL
 **********************/
function openProfileModal() {
    const p = APP.userProfile;
    document.getElementById('editAge').value = p.age;
    document.getElementById('editHeight').value = p.height;
    document.getElementById('editGender').value = p.gender;
    document.getElementById('editGoal').value = p.goal;
    document.getElementById('editLevel').value = p.level;
    UI.DOM.profileModal.style.display = 'flex';
    UI.DOM.profileModal.removeAttribute('hidden');
}
function closeProfileModal() {
    UI.DOM.profileModal.style.display = 'none';
    UI.DOM.profileModal.setAttribute('hidden', 'true');
}
function saveProfile() {
    const p = APP.userProfile;
    p.age = parseInt(document.getElementById('editAge').value) || 25;
    p.height = parseInt(document.getElementById('editHeight').value) || 175;
    p.gender = document.getElementById('editGender').value;
    p.goal = document.getElementById('editGoal').value;
    p.level = document.getElementById('editLevel').value;
    const bmr = p.gender === 'male' ?
        88.362 + 13.397 * (APP.userBiometrics.weight || 70) + 4.799 * p.height - 5.677 * p.age :
        447.593 + 9.247 * (APP.userBiometrics.weight || 60) + 3.098 * p.height - 4.330 * p.age;
    const factors = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
    const tdee = bmr * (factors[p.activity] || 1.55);
    if (p.goal === 'gain') { APP.calorieGoal = Math.round(tdee * 1.1); APP.proteinGoal = Math.round((APP.userBiometrics.weight || 70) * 1.8); }
    else if (p.goal === 'lose') { APP.calorieGoal = Math.round(tdee * 0.85); APP.proteinGoal = Math.round((APP.userBiometrics.weight || 70) * 2.0); }
    else { APP.calorieGoal = Math.round(tdee); APP.proteinGoal = Math.round((APP.userBiometrics.weight || 70) * 1.6); }
    APP.waterGoal = Math.round((APP.userBiometrics.weight || 70) * 35);
    Storage.save();
    UI.updateDashboard();
    UI.updateUserProfileDisplay();
    closeProfileModal();
    UI.showToast('✅ Perfil actualizado', 'success');
}

/**********************
 *  INICIALIZACIÓN
 **********************/
document.addEventListener('DOMContentLoaded', function() {
    UI.initDOM();
    Storage.load();
    UI.refreshAll();
    Nav.init();
    setupEvents();
    setInterval(UI.updateClock.bind(UI), 1000);
    UI.updateClock();

    // Inicializar Coach AI
    CoachAI.init();

    // Inicializar Chef IA (si existe)
    if (typeof ChefIA !== 'undefined') {
        window.chefIA = new ChefIA();
    }

    // Configurar autenticación Firebase
    setupAuth();

    UI.showToast('🚀 AI Fitness Tracker Pro - Todas las funciones activas', 'success');
});

// Exponer globalmente
window.UI = UI;
window.Storage = Storage;
window.CoachAI = CoachAI;
window.AI = AI;
window.clearCurrentSession = clearCurrentSession;
window.openRoutineModal = openRoutineModal;
window.closeRoutineModal = closeRoutineModal;
window.addExerciseToRoutineForm = addExerciseToRoutineForm;
window.saveRoutine = saveRoutine;
