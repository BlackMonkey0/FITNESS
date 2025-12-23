/**********************
 * ESTADO GLOBAL Y CONFIGURACIÓN
 **********************/
let meals = [];
let exercises = [];
let waterGlasses = 0;
let streakDays = 0;
let calorieGoal = 2500;
let proteinGoal = 120;
let waterGoal = 3000;
let userBiometrics = { weight: 0, fat: 0, muscle: 0, history: [] };
let currentTab = 'dashboard';

// Gráficos
let weightChart = null;
let biometryChart = null;

// Caché de elementos DOM
const DOM = {};

/**********************
 * INICIALIZACIÓN DOM
 **********************/
function initDOM() {
    // Elementos principales
    DOM.mainContent = document.querySelector('.main-content');
    DOM.currentTime = document.getElementById('currentTime');
    DOM.currentDate = document.getElementById('currentDate');
    DOM.toastContainer = document.getElementById('toastContainer');
    
    // Dashboard
    DOM.todayCaloriesDisplay = document.getElementById('todayCaloriesDisplay');
    DOM.todayProteinDisplay = document.getElementById('todayProteinDisplay');
    DOM.calorieProgress = document.getElementById('calorieProgress');
    DOM.proteinProgress = document.getElementById('proteinProgress');
    DOM.caloriePercent = document.getElementById('caloriePercent');
    DOM.proteinPercent = document.getElementById('proteinPercent');
    DOM.caloriesRemaining = document.getElementById('caloriesRemaining');
    DOM.proteinRemaining = document.getElementById('proteinRemaining');
    DOM.mealsCount = document.getElementById('mealsCount');
    DOM.workoutsCount = document.getElementById('workoutsCount');
    DOM.waterCount = document.getElementById('waterCount');
    DOM.streakDays = document.getElementById('streakDays');
    DOM.calorieGoal = document.getElementById('calorieGoal');
    DOM.proteinGoal = document.getElementById('proteinGoal');
    
    // Gestión de comidas
    DOM.mealNameInput = document.getElementById('mealNameInput');
    DOM.mealDescription = document.getElementById('mealDescription');
    DOM.mealCaloriesInput = document.getElementById('mealCaloriesInput');
    DOM.mealProteinInput = document.getElementById('mealProteinInput');
    DOM.mealCarbsInput = document.getElementById('mealCarbsInput');
    DOM.mealFatInput = document.getElementById('mealFatInput');
    DOM.saveMealBtn = document.getElementById('saveMealBtn');
    DOM.clearMealForm = document.getElementById('clearMealForm');
    DOM.mealsListContainer = document.getElementById('mealsListContainer');
    DOM.todayTotalCalories = document.getElementById('todayTotalCalories');
    DOM.todayTotalProtein = document.getElementById('todayTotalProtein');
    DOM.totalCaloriesToday = document.getElementById('totalCaloriesToday');
    DOM.totalProteinToday = document.getElementById('totalProteinToday');
    DOM.totalCarbsToday = document.getElementById('totalCarbsToday');
    DOM.totalFatToday = document.getElementById('totalFatToday');
    DOM.mealsHistory = document.getElementById('mealsHistory');
    
    // Botones de acción rápida
    DOM.addWaterBtn = document.getElementById('addWaterBtn');
    DOM.addQuickMealBtn = document.getElementById('addQuickMealBtn');
    DOM.addQuickWorkoutBtn = document.getElementById('addQuickWorkoutBtn');
    DOM.generateReportBtn = document.getElementById('generateReportBtn');
    
    // Biometría
    DOM.bodyWeight = document.getElementById('bodyWeight');
    DOM.bodyFat = document.getElementById('bodyFat');
    DOM.bodyMuscle = document.getElementById('bodyMuscle');
    DOM.bodyWater = document.getElementById('bodyWater');
    DOM.saveBodyBtn = document.getElementById('saveBodyBtn');
    DOM.currentWeight = document.getElementById('currentWeight');
    DOM.currentFat = document.getElementById('currentFat');
    DOM.currentBMI = document.getElementById('currentBMI');
    DOM.currentMuscle = document.getElementById('currentMuscle');
    DOM.weightChange = document.getElementById('weightChange');
    DOM.fatChange = document.getElementById('fatChange');
    DOM.muscleChange = document.getElementById('muscleChange');
    DOM.bmiCategory = document.getElementById('bmiCategory');
    
    // Configuración
    DOM.calorieGoalInput = document.getElementById('calorieGoalInput');
    DOM.proteinGoalInput = document.getElementById('proteinGoalInput');
    DOM.waterGoalInput = document.getElementById('waterGoalInput');
    DOM.saveGoalsBtn = document.getElementById('saveGoalsBtn');
    
    // Modal
    DOM.confirmModal = document.getElementById('confirmModal');
    DOM.modalTitle = document.getElementById('modalTitle');
    DOM.modalMessage = document.getElementById('modalMessage');
    DOM.modalConfirm = document.getElementById('modalConfirm');
    DOM.modalCancel = document.getElementById('modalCancel');
    DOM.modalClose = document.querySelector('.modal-close');
}

/**********************
 * BASE DE DATOS DE COMIDAS MEJORADA
 **********************/
const foodDatabase = {
    // Comidas rápidas predefinidas
    'desayuno ligero': { name: 'Desayuno Ligero', calories: 350, protein: 20, carbs: 45, fat: 12 },
    'desayuno proteico': { name: 'Desayuno Proteico', calories: 450, protein: 35, carbs: 30, fat: 15 },
    'almuerzo saludable': { name: 'Almuerzo Saludable', calories: 550, protein: 40, carbs: 60, fat: 20 },
    'cena ligera': { name: 'Cena Ligera', calories: 400, protein: 30, carbs: 40, fat: 15 },
    'snack proteico': { name: 'Snack Proteico', calories: 200, protein: 25, carbs: 10, fat: 8 },
    'postre saludable': { name: 'Postre Saludable', calories: 250, protein: 15, carbs: 35, fat: 8 },
    
    // Comidas de restaurante (simplificado)
    'ensalada cesar': { name: 'Ensalada César', calories: 350, protein: 18, carbs: 12, fat: 25 },
    'pollo arroz': { name: 'Pollo con Arroz', calories: 650, protein: 40, carbs: 70, fat: 20 },
    'hamburguesa': { name: 'Hamburguesa Clásica', calories: 600, protein: 35, carbs: 45, fat: 30 },
    'pizza': { name: 'Porción de Pizza', calories: 300, protein: 12, carbs: 36, fat: 12 },
    'sopa verduras': { name: 'Sopa de Verduras', calories: 150, protein: 5, carbs: 25, fat: 3 },
    
    // Ingredientes individuales
    'huevo': { calories: 70, protein: 6, carbs: 0.6, fat: 5 },
    'pan integral': { calories: 80, protein: 4, carbs: 15, fat: 1 },
    'pechuga pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'arroz blanco': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'aguacate': { calories: 160, protein: 2, carbs: 9, fat: 15 },
    'plátano': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 }
};

/**********************
 * SISTEMA DE NAVEGACIÓN
 **********************/
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    const contentSections = document.querySelectorAll('.content-section');
    
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');
            
            // Actualizar tabs
            navTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            
            // Mostrar sección correspondiente
            contentSections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    currentTab = targetId;
                    
                    // Cargar datos específicos de la sección
                    loadSectionData(targetId);
                }
            });
        });
    });
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'meals':
            renderMealsList();
            renderMealsHistory();
            break;
        case 'workout':
            renderExercisesList();
            break;
        case 'body':
            updateBiometryDisplay();
            break;
        case 'dashboard':
            updateDashboard();
            break;
    }
}

/**********************
 * GESTIÓN DE COMIDAS COMPLETA
 **********************/
function saveMeal() {
    const name = DOM.mealNameInput?.value.trim();
    const description = DOM.mealDescription?.value.trim();
    const calories = parseInt(DOM.mealCaloriesInput?.value || 0);
    const protein = parseInt(DOM.mealProteinInput?.value || 0);
    const carbs = parseInt(DOM.mealCarbsInput?.value || 0);
    const fat = parseInt(DOM.mealFatInput?.value || 0);
    
    if (!name || calories <= 0) {
        showToast('Por favor, ingresa al menos un nombre y las calorías', 'error');
        return;
    }
    
    const meal = {
        id: Date.now(),
        name,
        description,
        calories,
        protein,
        carbs,
        fat,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().getTime()
    };
    
    meals.push(meal);
    renderMealsList();
    updateDashboard();
    saveToLocalStorage();
    
    // Limpiar formulario
    DOM.mealNameInput.value = '';
    DOM.mealDescription.value = '';
    DOM.mealCaloriesInput.value = '';
    DOM.mealProteinInput.value = '';
    DOM.mealCarbsInput.value = '';
    DOM.mealFatInput.value = '';
    
    showToast(`✅ ${name} añadido correctamente`);
}

function deleteMeal(mealId) {
    showConfirm('¿Eliminar esta comida?', () => {
        meals = meals.filter(meal => meal.id !== mealId);
        renderMealsList();
        updateDashboard();
        saveToLocalStorage();
        showToast('🗑️ Comida eliminada');
    });
}

function renderMealsList() {
    const container = DOM.mealsListContainer;
    if (!container) return;
    
    // Filtrar comidas de hoy
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(meal => meal.date === today);
    
    if (todayMeals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>No hay comidas registradas hoy</p>
                <small>¡Comienza agregando tu primera comida!</small>
            </div>
        `;
        return;
    }
    
    // Ordenar por hora (más reciente primero)
    todayMeals.sort((a, b) => b.timestamp - a.timestamp);
    
    // Calcular totales
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = todayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = todayMeals.reduce((sum, meal) => sum + meal.fat, 0);
    
    // Actualizar totales
    if (DOM.todayTotalCalories) DOM.todayTotalCalories.textContent = `${totalCalories} kcal`;
    if (DOM.todayTotalProtein) DOM.todayTotalProtein.textContent = `${totalProtein}g proteína`;
    if (DOM.totalCaloriesToday) DOM.totalCaloriesToday.textContent = totalCalories;
    if (DOM.totalProteinToday) DOM.totalProteinToday.textContent = `${totalProtein}g`;
    if (DOM.totalCarbsToday) DOM.totalCarbsToday.textContent = `${totalCarbs}g`;
    if (DOM.totalFatToday) DOM.totalFatToday.textContent = `${totalFat}g`;
    
    // Renderizar lista
    container.innerHTML = todayMeals.map(meal => `
        <div class="meal-item" data-id="${meal.id}">
            <div class="meal-item-header">
                <div class="meal-name-time">
                    <h4>${meal.name}</h4>
                    <span class="meal-time">${meal.time}</span>
                </div>
                <button class="delete-meal-btn" onclick="deleteMeal(${meal.id})" aria-label="Eliminar comida">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            ${meal.description ? `<p class="meal-description">${meal.description}</p>` : ''}
            <div class="meal-nutrition">
                <span class="nutrition-item calories">
                    <i class="fas fa-fire"></i>
                    <span>${meal.calories} kcal</span>
                </span>
                <span class="nutrition-item protein">
                    <i class="fas fa-dna"></i>
                    <span>${meal.protein}g P</span>
                </span>
                <span class="nutrition-item carbs">
                    <i class="fas fa-bread-slice"></i>
                    <span>${meal.carbs}g C</span>
                </span>
                <span class="nutrition-item fat">
                    <i class="fas fa-bacon"></i>
                    <span>${meal.fat}g G</span>
                </span>
            </div>
        </div>
    `).join('');
    
    // Actualizar contador
    if (DOM.mealsCount) {
        DOM.mealsCount.textContent = todayMeals.length;
    }
}

function renderMealsHistory() {
    const container = DOM.mealsHistory;
    if (!container) return;
    
    // Agrupar comidas por fecha
    const mealsByDate = {};
    meals.forEach(meal => {
        if (!mealsByDate[meal.date]) {
            mealsByDate[meal.date] = [];
        }
        mealsByDate[meal.date].push(meal);
    });
    
    // Ordenar fechas (más reciente primero)
    const sortedDates = Object.keys(mealsByDate).sort((a, b) => new Date(b) - new Date(a));
    
    if (sortedDates.length === 0) {
        container.innerHTML = '<p class="empty-history">No hay historial disponible</p>';
        return;
    }
    
    container.innerHTML = sortedDates.map(date => {
        const dateMeals = mealsByDate[date];
        const totalCalories = dateMeals.reduce((sum, meal) => sum + meal.calories, 0);
        const totalProtein = dateMeals.reduce((sum, meal) => sum + meal.protein, 0);
        
        // Formatear fecha
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
        
        return `
            <div class="history-day">
                <div class="history-date">
                    <h4>${formattedDate}</h4>
                    <span class="day-totals">${totalCalories} kcal • ${totalProtein}g proteína</span>
                </div>
                <div class="history-meals">
                    ${dateMeals.map(meal => `
                        <div class="history-meal">
                            <span class="meal-time-history">${meal.time}</span>
                            <span class="meal-name-history">${meal.name}</span>
                            <span class="meal-calories-history">${meal.calories} kcal</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

/**********************
 * GESTIÓN DE ENTRENAMIENTO
 **********************/
function saveExercise() {
    // Implementar similar a saveMeal()
    showToast('Funcionalidad de ejercicios en desarrollo');
}

function renderExercisesList() {
    // Implementar similar a renderMealsList()
}

/**********************
 * BIOMETRÍA
 **********************/
function saveBiometrics() {
    const weight = parseFloat(DOM.bodyWeight?.value);
    const fat = parseFloat(DOM.bodyFat?.value);
    const muscle = parseFloat(DOM.bodyMuscle?.value);
    const water = parseFloat(DOM.bodyWater?.value);
    
    if (!weight || weight <= 0) {
        showToast('Por favor, ingresa tu peso', 'error');
        return;
    }
    
    // Calcular IMC (peso en kg / (altura en m)^2)
    // Necesitaríamos la altura del usuario - por ahora asumimos 1.75m
    const height = 1.75; // en metros
    const bmi = weight / (height * height);
    
    const biometricData = {
        date: new Date().toISOString(),
        weight,
        fat: fat || 0,
        muscle: muscle || 0,
        water: water || 0,
        bmi: parseFloat(bmi.toFixed(1))
    };
    
    // Añadir al historial
    if (!userBiometrics.history) userBiometrics.history = [];
    userBiometrics.history.push(biometricData);
    
    // Mantener solo los últimos 30 registros
    if (userBiometrics.history.length > 30) {
        userBiometrics.history = userBiometrics.history.slice(-30);
    }
    
    // Actualizar datos actuales
    userBiometrics.weight = weight;
    userBiometrics.fat = fat || 0;
    userBiometrics.muscle = muscle || 0;
    
    updateBiometryDisplay();
    updateWeightChart();
    saveToLocalStorage();
    
    // Limpiar formulario
    DOM.bodyWeight.value = '';
    DOM.bodyFat.value = '';
    DOM.bodyMuscle.value = '';
    DOM.bodyWater.value = '';
    
    showToast('✅ Biometría guardada correctamente');
}

function updateBiometryDisplay() {
    if (userBiometrics.history && userBiometrics.history.length > 0) {
        const latest = userBiometrics.history[userBiometrics.history.length - 1];
        
        if (DOM.currentWeight) DOM.currentWeight.textContent = `${latest.weight} kg`;
        if (DOM.currentFat) DOM.currentFat.textContent = `${latest.fat}%`;
        if (DOM.currentBMI) DOM.currentBMI.textContent = latest.bmi;
        if (DOM.currentMuscle) DOM.currentMuscle.textContent = `${latest.muscle} kg`;
        
        // Calcular cambios desde la última medición
        if (userBiometrics.history.length >= 2) {
            const previous = userBiometrics.history[userBiometrics.history.length - 2];
            const weightDiff = latest.weight - previous.weight;
            const fatDiff = latest.fat - previous.fat;
            const muscleDiff = latest.muscle - previous.muscle;
            
            if (DOM.weightChange) {
                DOM.weightChange.innerHTML = `
                    <i class="fas fa-${weightDiff >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                    ${Math.abs(weightDiff).toFixed(1)} kg desde última medición
                `;
                DOM.weightChange.style.color = weightDiff >= 0 ? '#ef4444' : '#10b981';
            }
            
            if (DOM.fatChange) {
                DOM.fatChange.innerHTML = `
                    <i class="fas fa-${fatDiff >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                    ${Math.abs(fatDiff).toFixed(1)}% desde última medición
                `;
                DOM.fatChange.style.color = fatDiff >= 0 ? '#ef4444' : '#10b981';
            }
            
            if (DOM.muscleChange) {
                DOM.muscleChange.innerHTML = `
                    <i class="fas fa-${muscleDiff >= 0 ? 'arrow-up' : 'arrow-down'}"></i>
                    ${Math.abs(muscleDiff).toFixed(1)} kg desde última medición
                `;
                DOM.muscleChange.style.color = muscleDiff >= 0 ? '#10b981' : '#ef4444';
            }
        }
        
        // Categoría IMC
        if (DOM.bmiCategory) {
            let category = '';
            let color = '';
            
            if (latest.bmi < 18.5) {
                category = 'Bajo peso';
                color = '#f59e0b';
            } else if (latest.bmi < 25) {
                category = 'Normal';
                color = '#10b981';
            } else if (latest.bmi < 30) {
                category = 'Sobrepeso';
                color = '#f59e0b';
            } else {
                category = 'Obesidad';
                color = '#ef4444';
            }
            
            DOM.bmiCategory.textContent = category;
            DOM.bmiCategory.style.color = color;
        }
    }
}

/**********************
 * GRÁFICOS
 **********************/
function updateWeightChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas || !userBiometrics.history || userBiometrics.history.length < 2) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (weightChart) {
        weightChart.destroy();
    }
    
    // Preparar datos
    const labels = userBiometrics.history.map(entry => 
        new Date(entry.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
    );
    
    const weights = userBiometrics.history.map(entry => entry.weight);
    const fatPercentages = userBiometrics.history.map(entry => entry.fat);
    
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Peso (kg)',
                    data: weights,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y'
                },
                {
                    label: 'Grasa (%)',
                    data: fatPercentages,
                    borderColor: '#2196F3',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    title: {
                        display: true,
                        text: 'Peso (kg)',
                        color: '#94a3b8'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    title: {
                        display: true,
                        text: 'Grasa (%)',
                        color: '#94a3b8'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#cbd5e1',
                    borderColor: '#475569',
                    borderWidth: 1
                }
            }
        }
    });
}

/**********************
 * DASHBOARD
 **********************/
function updateDashboard() {
    // Calcular totales del día
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(meal => meal.date === today);
    
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    
    // Actualizar displays
    if (DOM.todayCaloriesDisplay) {
        DOM.todayCaloriesDisplay.textContent = `${totalCalories} kcal`;
    }
    
    if (DOM.todayProteinDisplay) {
        DOM.todayProteinDisplay.textContent = `${totalProtein}g`;
    }
    
    // Actualizar barras de progreso
    const caloriesPercent = Math.min(100, Math.round((totalCalories / calorieGoal) * 100));
    const proteinPercent = Math.min(100, Math.round((totalProtein / proteinGoal) * 100));
    
    if (DOM.calorieProgress) {
        DOM.calorieProgress.style.width = `${caloriesPercent}%`;
    }
    
    if (DOM.proteinProgress) {
        DOM.proteinProgress.style.width = `${proteinPercent}%`;
    }
    
    // Actualizar porcentajes
    if (DOM.caloriePercent) {
        DOM.caloriePercent.textContent = `${caloriesPercent}%`;
    }
    
    if (DOM.proteinPercent) {
        DOM.proteinPercent.textContent = `${proteinPercent}%`;
    }
    
    // Actualizar valores restantes
    const caloriesRemaining = Math.max(0, calorieGoal - totalCalories);
    const proteinRemaining = Math.max(0, proteinGoal - totalProtein);
    
    if (DOM.caloriesRemaining) {
        DOM.caloriesRemaining.textContent = `${caloriesRemaining} kcal restantes`;
    }
    
    if (DOM.proteinRemaining) {
        DOM.proteinRemaining.textContent = `${proteinRemaining}g restantes`;
    }
    
    // Actualizar contadores
    if (DOM.mealsCount) {
        DOM.mealsCount.textContent = todayMeals.length;
    }
    
    if (DOM.waterCount) {
        DOM.waterCount.textContent = waterGlasses;
    }
    
    if (DOM.streakDays) {
        DOM.streakDays.textContent = streakDays;
    }
    
    // Actualizar metas
    if (DOM.calorieGoal) {
        DOM.calorieGoal.textContent = calorieGoal;
    }
    
    if (DOM.proteinGoal) {
        DOM.proteinGoal.textContent = proteinGoal;
    }
}

function addWater() {
    waterGlasses++;
    updateDashboard();
    saveToLocalStorage();
    showToast(`💧 Vaso de agua añadido (Total: ${waterGlasses})`);
}

function addQuickMeal() {
    // Mostrar modal o desplegable con comidas rápidas
    showQuickMealSelector();
}

function addQuickWorkout() {
    // Implementar
    showToast('Funcionalidad de entrenamiento rápido en desarrollo');
}

function generateReport() {
    // Implementar generación de reporte
    showToast('Generando reporte diario...');
}

/**********************
 * CONFIGURACIÓN
 **********************/
function saveGoals() {
    const newCalorieGoal = parseInt(DOM.calorieGoalInput?.value);
    const newProteinGoal = parseInt(DOM.proteinGoalInput?.value);
    const newWaterGoal = parseInt(DOM.waterGoalInput?.value);
    
    if (newCalorieGoal && newCalorieGoal >= 1000) {
        calorieGoal = newCalorieGoal;
    }
    
    if (newProteinGoal && newProteinGoal >= 50) {
        proteinGoal = newProteinGoal;
    }
    
    if (newWaterGoal && newWaterGoal >= 1000) {
        waterGoal = newWaterGoal;
    }
    
    updateDashboard();
    saveToLocalStorage();
    showToast('🎯 Metas actualizadas correctamente');
}

/**********************
 * UTILIDADES
 **********************/
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    DOM.toastContainer.appendChild(toast);
    
    // Animación de entrada
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showConfirm(message, onConfirm) {
    if (!DOM.confirmModal) return;
    
    DOM.modalMessage.textContent = message;
    DOM.confirmModal.removeAttribute('hidden');
    
    const handleConfirm = () => {
        onConfirm();
        cleanup();
    };
    
    const handleCancel = () => {
        cleanup();
    };
    
    const cleanup = () => {
        DOM.modalConfirm.removeEventListener('click', handleConfirm);
        DOM.modalCancel.removeEventListener('click', handleCancel);
        DOM.modalClose.removeEventListener('click', handleCancel);
        DOM.confirmModal.setAttribute('hidden', 'true');
    };
    
    DOM.modalConfirm.addEventListener('click', handleConfirm);
    DOM.modalCancel.addEventListener('click', handleCancel);
    DOM.modalClose.addEventListener('click', handleCancel);
}

function updateClock() {
    const now = new Date();
    
    // Hora actual
    if (DOM.currentTime) {
        DOM.currentTime.textContent = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
    // Fecha actual
    if (DOM.currentDate) {
        DOM.currentDate.textContent = now.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }
}

/**********************
 * PERSISTENCIA
 **********************/
function saveToLocalStorage() {
    const data = {
        meals,
        exercises,
        waterGlasses,
        streakDays,
        calorieGoal,
        proteinGoal,
        waterGoal,
        userBiometrics,
        lastSave: new Date().toISOString()
    };
    
    try {
        localStorage.setItem('fitnessTrackerData', JSON.stringify(data));
    } catch (error) {
        console.error('Error guardando datos:', error);
        showToast('Error guardando datos', 'error');
    }
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('fitnessTrackerData');
    
    if (saved) {
        try {
            const data = JSON.parse(saved);
            
            meals = data.meals || [];
            exercises = data.exercises || [];
            waterGlasses = data.waterGlasses || 0;
            streakDays = data.streakDays || 0;
            calorieGoal = data.calorieGoal || 2500;
            proteinGoal = data.proteinGoal || 120;
            waterGoal = data.waterGoal || 3000;
            userBiometrics = data.userBiometrics || { history: [] };
            
            // Actualizar inputs de configuración
            if (DOM.calorieGoalInput) DOM.calorieGoalInput.value = calorieGoal;
            if (DOM.proteinGoalInput) DOM.proteinGoalInput.value = proteinGoal;
            if (DOM.waterGoalInput) DOM.waterGoalInput.value = waterGoal;
            
        } catch (error) {
            console.error('Error cargando datos:', error);
            showToast('Error cargando datos guardados', 'error');
        }
    }
}

/**********************
 * INICIALIZACIÓN
 **********************/
function initApp() {
    // Inicializar DOM
    initDOM();
    
    // Cargar datos guardados
    loadFromLocalStorage();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Actualizar reloj
    updateClock();
    setInterval(updateClock, 1000);
    
    // Inicializar dashboard
    updateDashboard();
    
    // Inicializar biometría si hay datos
    updateBiometryDisplay();
    updateWeightChart();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showToast('✅ AI Fitness Tracker cargado correctamente');
    }, 500);
}

function setupEventListeners() {
    // Botones de comidas
    if (DOM.saveMealBtn) {
        DOM.saveMealBtn.addEventListener('click', saveMeal);
    }
    
    if (DOM.clearMealForm) {
        DOM.clearMealForm.addEventListener('click', () => {
            DOM.mealNameInput.value = '';
            DOM.mealDescription.value = '';
            DOM.mealCaloriesInput.value = '';
            DOM.mealProteinInput.value = '';
            DOM.mealCarbsInput.value = '';
            DOM.mealFatInput.value = '';
        });
    }
    
    // Biometría
    if (DOM.saveBodyBtn) {
        DOM.saveBodyBtn.addEventListener('click', saveBiometrics);
    }
    
    // Botones de acción rápida
    if (DOM.addWaterBtn) {
        DOM.addWaterBtn.addEventListener('click', addWater);
    }
    
    if (DOM.addQuickMealBtn) {
        DOM.addQuickMealBtn.addEventListener('click', addQuickMeal);
    }
    
    if (DOM.addQuickWorkoutBtn) {
        DOM.addQuickWorkoutBtn.addEventListener('click', addQuickWorkout);
    }
    
    if (DOM.generateReportBtn) {
        DOM.generateReportBtn.addEventListener('click', generateReport);
    }
    
    // Configuración
    if (DOM.saveGoalsBtn) {
        DOM.saveGoalsBtn.addEventListener('click', saveGoals);
    }
}

/**********************
 * INICIO DE LA APLICACIÓN
 **********************/
document.addEventListener('DOMContentLoaded', initApp);
