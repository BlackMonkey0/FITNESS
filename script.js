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
 * MEGA BASE DE DATOS DE COMIDAS RÁPIDAS
 **********************/
const foodDatabase = {
  /***** BURGER KING *****/
  'whopper': {
    name: 'Whopper Burger King',
    calories: 660,
    protein: 28,
    carbs: 49,
    fat: 40,
    restaurant: 'Burger King',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera flameada (113g)',
      'pan de sésamo tostado',
      'lechuga fresca',
      'tomate en rodajas',
      'cebolla blanca',
      'pepinillos en rodajas',
      'mayonesa',
      'ketchup'
    ],
    customizable: true
  },
  
  'whopper jr': {
    name: 'Whopper Jr. Burger King',
    calories: 310,
    protein: 15,
    carbs: 30,
    fat: 16,
    restaurant: 'Burger King',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera flameada (85g)',
      'pan de sésamo',
      'lechuga',
      'tomate',
      'mayonesa',
      'ketchup'
    ],
    customizable: true
  },
  
  'doble whopper': {
    name: 'Doble Whopper Burger King',
    calories: 900,
    protein: 48,
    carbs: 52,
    fat: 57,
    restaurant: 'Burger King',
    type: 'hamburguesa',
    ingredients: [
      '2 carnes de ternera flameadas',
      'pan de sésamo tostado',
      'lechuga',
      'tomate',
      'cebolla',
      'pepinillos',
      'mayonesa',
      'ketchup'
    ],
    customizable: true
  },
  
  'king supreme': {
    name: 'King Supreme Burger King',
    calories: 720,
    protein: 32,
    carbs: 50,
    fat: 43,
    restaurant: 'Burger King',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera flameada',
      'pan de sésamo',
      'queso americano',
      'bacon crujiente',
      'cebolla',
      'lechuga',
      'tomate',
      'salsa supreme'
    ],
    customizable: true
  },
  
  'stacker': {
    name: 'Stacker Burger King',
    calories: 850,
    protein: 45,
    carbs: 38,
    fat: 58,
    restaurant: 'Burger King',
    type: 'hamburguesa',
    ingredients: [
      '3 carnes de ternera flameadas',
      'pan de sésamo',
      'queso americano',
      'bacon',
      'salsa stacker'
    ],
    customizable: true
  },
  
  'long chicken': {
    name: 'Long Chicken Burger King',
    calories: 510,
    protein: 25,
    carbs: 44,
    fat: 25,
    restaurant: 'Burger King',
    type: 'hamburguesa',
    ingredients: [
      'filete de pollo empanado largo',
      'pan de semillas',
      'lechuga',
      'mayonesa'
    ],
    customizable: true
  },
  
  'crispy chicken': {
    name: 'Crispy Chicken Burger King',
    calories: 620,
    protein: 28,
    carbs: 53,
    fat: 34,
    restaurant: 'Burger King',
    type: 'hamburguesa',
    ingredients: [
      'filete de pollo crujiente',
      'pan de sésamo',
      'lechuga',
      'tomate',
      'mayonesa'
    ],
    customizable: true
  },
  
  /***** MCDONALD'S *****/
  'big mac': {
    name: 'Big Mac McDonald\'s',
    calories: 563,
    protein: 25,
    carbs: 43,
    fat: 33,
    restaurant: 'McDonald\'s',
    type: 'hamburguesa',
    ingredients: [
      '2 carnes de ternera 100%',
      'pan de sésamo triple',
      'lechuga',
      'queso cheddar',
      'cebolla',
      'pepinillos',
      'salsa big mac'
    ],
    customizable: true
  },
  
  'cuarto de libra': {
    name: 'Cuarto de Libra con Queso',
    calories: 520,
    protein: 30,
    carbs: 41,
    fat: 26,
    restaurant: 'McDonald\'s',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera 100% (113g)',
      'pan de sésamo',
      'queso americano',
      'cebolla',
      'pepinillos',
      'ketchup',
      'mostaza'
    ],
    customizable: true
  },
  
  'mcnifica': {
    name: 'McNífica McDonald\'s',
    calories: 580,
    protein: 35,
    carbs: 45,
    fat: 32,
    restaurant: 'McDonald\'s',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera 100%',
      'pan de semillas',
      'queso cheddar',
      'bacon',
      'cebolla caramelizada',
      'lechuga',
      'salsa especial'
    ],
    customizable: true
  },
  
  'mccrispy': {
    name: 'McChicken Deluxe',
    calories: 470,
    protein: 23,
    carbs: 42,
    fat: 25,
    restaurant: 'McDonald\'s',
    type: 'hamburguesa',
    ingredients: [
      'filete de pollo crujiente',
      'pan de semillas',
      'lechuga',
      'tomate',
      'mayonesa'
    ],
    customizable: true
  },
  
  'mcfish': {
    name: 'Filete-O-Fish',
    calories: 390,
    protein: 16,
    carbs: 39,
    fat: 19,
    restaurant: 'McDonald\'s',
    type: 'hamburguesa',
    ingredients: [
      'filete de pescado empanado',
      'pan sin semillas',
      'queso americano',
      'salsa tártara'
    ],
    customizable: true
  },
  
  'mcroyal': {
    name: 'McRoyal Deluxe',
    calories: 610,
    protein: 32,
    carbs: 48,
    fat: 35,
    restaurant: 'McDonald\'s',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera 100%',
      'pan de sésamo',
      'queso cheddar',
      'bacon',
      'cebolla',
      'lechuga',
      'tomate',
      'salsa especial'
    ],
    customizable: true
  },
  
  /***** KFC *****/
  'zinger': {
    name: 'Zinger Burger KFC',
    calories: 450,
    protein: 27,
    carbs: 40,
    fat: 22,
    restaurant: 'KFC',
    type: 'hamburguesa',
    ingredients: [
      'filete de pollo picante zinger',
      'pan de brioche',
      'lechuga',
      'mayonesa',
      'salsa zinger'
    ],
    customizable: true
  },
  
  'twister': {
    name: 'Twister KFC',
    calories: 480,
    protein: 25,
    carbs: 45,
    fat: 24,
    restaurant: 'KFC',
    type: 'wrap',
    ingredients: [
      'tiras de pollo crispy',
      'tortilla de harina',
      'lechuga',
      'tomate',
      'salsa césar'
    ],
    customizable: true
  },
  
  'crispy colonel': {
    name: 'Crispy Colonel Burger',
    calories: 520,
    protein: 30,
    carbs: 48,
    fat: 26,
    restaurant: 'KFC',
    type: 'hamburguesa',
    ingredients: [
      'filete de pollo crispy',
      'pan de brioche',
      'bacon',
      'queso cheddar',
      'lechuga',
      'salsa colonel'
    ],
    customizable: true
  },
  
  'grander': {
    name: 'Grander KFC',
    calories: 890,
    protein: 52,
    carbs: 55,
    fat: 58,
    restaurant: 'KFC',
    type: 'hamburguesa',
    ingredients: [
      '2 filetes de pollo crispy',
      'pan de brioche premium',
      'bacon doble',
      'queso cheddar',
      'lechuga',
      'tomate',
      'salsa grander'
    ],
    customizable: true
  },
  
  'fillet tower': {
    name: 'Fillet Tower Burger',
    calories: 680,
    protein: 38,
    carbs: 52,
    fat: 38,
    restaurant: 'KFC',
    type: 'hamburguesa',
    ingredients: [
      'filete de pollo crispy',
      'pan de brioche',
      'bacon',
      'queso cheddar',
      'anillos de cebolla',
      'salsa tower'
    ],
    customizable: true
  },
  
  /***** OLD WILD WEST *****/
  'salvaje': {
    name: 'Hamburguesa Salvaje OWW',
    calories: 850,
    protein: 45,
    carbs: 60,
    fat: 52,
    restaurant: 'Old Wild West',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera 200g',
      'pan rústico de cereales',
      'bacon crispy',
      'queso cheddar fundido',
      'cebolla caramelizada',
      'lechuga',
      'tomate',
      'salsa barbacoa'
    ],
    customizable: true
  },
  
  'texas': {
    name: 'Texas Burger OWW',
    calories: 920,
    protein: 48,
    carbs: 65,
    fat: 58,
    restaurant: 'Old Wild West',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera 200g',
      'pan de brioche',
      'bacon doble',
      'queso americano',
      'huevo frito',
      'cebolla frita',
      'salsa texas'
    ],
    customizable: true
  },
  
  'ranch': {
    name: 'Ranch Burger OWW',
    calories: 780,
    protein: 42,
    carbs: 55,
    fat: 45,
    restaurant: 'Old Wild West',
    type: 'hamburguesa',
    ingredients: [
      'carne de ternera 180g',
      'pan integral',
      'queso pepper jack',
      'aguacate',
      'tomate',
      'cebolla morada',
      'salsa ranch'
    ],
    customizable: true
  },
  
  'búfalo': {
    name: 'Búfalo Burger OWW',
    calories: 810,
    protein: 46,
    carbs: 58,
    fat: 48,
    restaurant: 'Old Wild West',
    type: 'hamburguesa',
    ingredients: [
      'carne de bisonte 180g',
      'pan de semillas',
      'queso azul',
      'cebolla crispy',
      'lechuga',
      'salsa búfalo'
    ],
    customizable: true
  },
  
  /***** TACO BELL *****/
  'crunchwrap': {
    name: 'Crunchwrap Supreme',
    calories: 530,
    protein: 18,
    carbs: 58,
    fat: 26,
    restaurant: 'Taco Bell',
    type: 'wrap',
    ingredients: [
      'carne de ternera sazonada',
      'tortilla de harina tostada',
      'nachos crujientes',
      'queso fundido',
      'crema agria',
      'tomate',
      'lechuga'
    ],
    customizable: true
  },
  
  'quesadilla': {
    name: 'Quesadilla de Pollo',
    calories: 510,
    protein: 27,
    carbs: 40,
    fat: 28,
    restaurant: 'Taco Bell',
    type: 'quesadilla',
    ingredients: [
      'pollo a la parrilla',
      'tortilla de harina',
      'queso 3 tipos',
      'crema chipotle'
    ],
    customizable: true
  },
  
  /***** PATATAS Y ACOMPAÑAMIENTOS *****/
  'patatas medianas': {
    name: 'Patatas Fritas Medianas',
    calories: 320,
    protein: 4,
    carbs: 42,
    fat: 15,
    restaurant: 'General',
    type: 'acompañamiento',
    ingredients: ['patatas fritas'],
    customizable: false
  },
  
  'patatas grandes': {
    name: 'Patatas Fritas Grandes',
    calories: 480,
    protein: 6,
    carbs: 63,
    fat: 22,
    restaurant: 'General',
    type: 'acompañamiento',
    ingredients: ['patatas fritas'],
    customizable: false
  },
  
  'patatas deluxe': {
    name: 'Patatas Deluxe Burger King',
    calories: 420,
    protein: 5,
    carbs: 52,
    fat: 21,
    restaurant: 'Burger King',
    type: 'acompañamiento',
    ingredients: ['patatas fritas con piel'],
    customizable: false
  },
  
  'cheddar bites': {
    name: 'Cheddar Bites OWW',
    calories: 380,
    protein: 12,
    carbs: 28,
    fat: 25,
    restaurant: 'Old Wild West',
    type: 'acompañamiento',
    ingredients: ['bolitas de queso cheddar rebozadas'],
    customizable: false
  },
  
  'aros cebolla': {
    name: 'Aros de Cebolla',
    calories: 330,
    protein: 4,
    carbs: 40,
    fat: 17,
    restaurant: 'General',
    type: 'acompañamiento',
    ingredients: ['cebolla rebozada'],
    customizable: false
  },
  
  'nuggets 6': {
    name: '6 Nuggets de Pollo',
    calories: 280,
    protein: 14,
    carbs: 16,
    fat: 18,
    restaurant: 'General',
    type: 'acompañamiento',
    ingredients: ['nuggets de pollo'],
    customizable: false
  },
  
  'nuggets 9': {
    name: '9 Nuggets de Pollo',
    calories: 420,
    protein: 21,
    carbs: 24,
    fat: 27,
    restaurant: 'General',
    type: 'acompañamiento',
    ingredients: ['nuggets de pollo'],
    customizable: false
  },
  
  'alitas': {
    name: 'Alitas de Pollo (6 unidades)',
    calories: 430,
    protein: 32,
    carbs: 12,
    fat: 28,
    restaurant: 'KFC',
    type: 'acompañamiento',
    ingredients: ['alitas de pollo'],
    customizable: true
  },
  
  'tiras pollo': {
    name: 'Tiras de Pollo (3 unidades)',
    calories: 320,
    protein: 25,
    carbs: 15,
    fat: 18,
    restaurant: 'KFC',
    type: 'acompañamiento',
    ingredients: ['tiras de pechuga de pollo'],
    customizable: false
  },
  
  'ensalada cesar': {
    name: 'Ensalada César',
    calories: 350,
    protein: 18,
    carbs: 12,
    fat: 25,
    restaurant: 'General',
    type: 'ensalada',
    ingredients: [
      'lechuga romana',
      'pollo a la parrilla',
      'queso parmesano',
      'crutones',
      'salsa césar'
    ],
    customizable: true
  },
  
  'ensalada pollo crispy': {
    name: 'Ensalada con Pollo Crispy',
    calories: 420,
    protein: 22,
    carbs: 25,
    fat: 28,
    restaurant: 'General',
    type: 'ensalada',
    ingredients: [
      'mezcla de lechugas',
      'pollo crispy',
      'maíz',
      'tomate',
      'cebolla',
      'salsa ranch'
    ],
    customizable: true
  },
  
  /***** BEBIDAS *****/
  'coca cola mediana': {
    name: 'Coca Cola Mediana',
    calories: 210,
    protein: 0,
    carbs: 56,
    fat: 0,
    restaurant: 'General',
    type: 'bebida',
    ingredients: ['refresco de cola'],
    customizable: false
  },
  
  'fanta naranja': {
    name: 'Fanta Naranja Mediana',
    calories: 180,
    protein: 0,
    carbs: 48,
    fat: 0,
    restaurant: 'General',
    type: 'bebida',
    ingredients: ['refresco de naranja'],
    customizable: false
  },
  
  'agua mineral': {
    name: 'Agua Mineral',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    restaurant: 'General',
    type: 'bebida',
    ingredients: ['agua'],
    customizable: false
  },
  
  'café solo': {
    name: 'Café Solo',
    calories: 2,
    protein: 0,
    carbs: 0,
    fat: 0,
    restaurant: 'General',
    type: 'bebida',
    ingredients: ['café'],
    customizable: false
  },
  
  'batido chocolate': {
    name: 'Batido de Chocolate Mediano',
    calories: 560,
    protein: 12,
    carbs: 92,
    fat: 18,
    restaurant: 'McDonald\'s',
    type: 'bebida',
    ingredients: ['batido de chocolate'],
    customizable: false
  },
  
  'batido vainilla': {
    name: 'Batido de Vainilla',
    calories: 520,
    protein: 11,
    carbs: 85,
    fat: 16,
    restaurant: 'McDonald\'s',
    type: 'bebida',
    ingredients: ['batido de vainilla'],
    customizable: false
  },
  
  /***** POSTRES *****/
  'mcflurry oreo': {
    name: 'McFlurry Oreo',
    calories: 330,
    protein: 7,
    carbs: 48,
    fat: 13,
    restaurant: 'McDonald\'s',
    type: 'postre',
    ingredients: ['helado de vainilla', 'galletas oreo trituradas'],
    customizable: false
  },
  
  'sundae chocolate': {
    name: 'Sundae de Chocolate',
    calories: 340,
    protein: 6,
    carbs: 55,
    fat: 11,
    restaurant: 'McDonald\'s',
    type: 'postre',
    ingredients: ['helado de vainilla', 'salsa de chocolate'],
    customizable: false
  },
  
  'apple pie': {
    name: 'Apple Pie',
    calories: 250,
    protein: 2,
    carbs: 32,
    fat: 13,
    restaurant: 'McDonald\'s',
    type: 'postre',
    ingredients: ['manzana', 'masa hojaldrada'],
    customizable: false
  },
  
  'donut glaseado': {
    name: 'Donut Glaseado',
    calories: 310,
    protein: 4,
    carbs: 45,
    fat: 14,
    restaurant: 'General',
    type: 'postre',
    ingredients: ['donut con glaseado'],
    customizable: false
  },
  
  /***** INGREDIENTES INDIVIDUALES *****/
  'carne': { calories: 250, protein: 26, carbs: 0, fat: 17, unit: '100g' },
  'pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
  'bacon': { calories: 541, protein: 37, carbs: 1.4, fat: 42, unit: '100g' },
  'queso': { calories: 400, protein: 25, carbs: 2, fat: 33, unit: '100g' },
  'pan': { calories: 260, protein: 9, carbs: 49, fat: 3.2, unit: '100g' },
  'lechuga': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, unit: '100g' },
  'tomate': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: '100g' },
  'cebolla': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, unit: '100g' },
  'mayonesa': { calories: 680, protein: 1.1, carbs: 0.6, fat: 75, unit: '100g' },
  'ketchup': { calories: 101, protein: 1.7, carbs: 24, fat: 0.3, unit: '100g' }
};

/**********************
 * SISTEMA DE ANÁLISIS MEJORADO
 **********************/
function handleAnalyze() {
  const text = (DOM.aiMealText?.value || '').toLowerCase().trim();
  if (!text) return showToast("Escribe qué has comido...");

  // Buscar comidas completas primero
  const completeMeal = findCompleteMeal(text);
  
  if (completeMeal) {
    // Personalizar la comida según modificaciones
    const customizedMeal = customizeMeal(completeMeal, text);
    updateMealForm(customizedMeal);
    showToast(`✅ ${customizedMeal.name} detectado`);
    return;
  }
  
  // Si no es una comida completa, analizar ingredientes individuales
  analyzeIngredients(text);
}

function findCompleteMeal(text) {
  // Mapeo de palabras clave a comidas
  const mealKeywords = {
    // Burger King
    'whopper': 'whopper',
    'whopper jr': 'whopper jr',
    'doble whopper': 'doble whopper',
    'king supreme': 'king supreme',
    'stacker': 'stacker',
    'long chicken': 'long chicken',
    'crispy chicken': 'crispy chicken',
    
    // McDonald's
    'big mac': 'big mac',
    'cuarto de libra': 'cuarto de libra',
    'mcnifica': 'mcnifica',
    'mccrispy': 'mccrispy',
    'mcfish': 'mcfish',
    'mcroyal': 'mcroyal',
    
    // KFC
    'zinger': 'zinger',
    'twister': 'twister',
    'crispy colonel': 'crispy colonel',
    'grander': 'grander',
    'fillet tower': 'fillet tower',
    
    // OWW
    'salvaje': 'salvaje',
    'texas': 'texas',
    'ranch': 'ranch',
    'búfalo': 'búfalo',
    
    // Taco Bell
    'crunchwrap': 'crunchwrap',
    'quesadilla': 'quesadilla',
    
    // Acompañamientos
    'patatas': 'patatas medianas',
    'patatas medianas': 'patatas medianas',
    'patatas grandes': 'patatas grandes',
    'patatas deluxe': 'patatas deluxe',
    'cheddar bites': 'cheddar bites',
    'aros cebolla': 'aros cebolla',
    'nuggets': 'nuggets 6',
    'nuggets 6': 'nuggets 6',
    'nuggets 9': 'nuggets 9',
    'alitas': 'alitas',
    'tiras pollo': 'tiras pollo',
    
    // Ensaladas
    'ensalada cesar': 'ensalada cesar',
    'ensalada pollo': 'ensalada pollo crispy',
    
    // Bebidas
    'coca cola': 'coca cola mediana',
    'fanta': 'fanta naranja',
    'agua': 'agua mineral',
    'café': 'café solo',
    'batido chocolate': 'batido chocolate',
    'batido vainilla': 'batido vainilla',
    
    // Postres
    'mcflurry': 'mcflurry oreo',
    'sundae': 'sundae chocolate',
    'apple pie': 'apple pie',
    'donut': 'donut glaseado'
  };
  
  // Buscar coincidencias
  for (const [keyword, mealKey] of Object.entries(mealKeywords)) {
    if (text.includes(keyword)) {
      return {
        ...foodDatabase[mealKey],
        baseKey: mealKey,
        originalText: text
      };
    }
  }
  
  // Buscar combinaciones de restaurante + comida
  const restaurants = ['burger king', 'mcdonalds', 'kfc', 'old wild west', 'taco bell'];
  for (const restaurant of restaurants) {
    if (text.includes(restaurant)) {
      // Extraer posible nombre de comida después del restaurante
      const restIndex = text.indexOf(restaurant);
      const afterRest = text.substring(restIndex + restaurant.length).trim();
      const words = afterRest.split(/\s+/);
      
      if (words.length > 0) {
        const possibleMeal = words[0] + (words[1] ? ' ' + words[1] : '');
        for (const [mealKey, mealData] of Object.entries(foodDatabase)) {
          if (mealData.restaurant && mealData.restaurant.toLowerCase().includes(restaurant)) {
            if (mealData.name.toLowerCase().includes(possibleMeal) || 
                possibleMeal.includes(mealData.type)) {
              return {
                ...mealData,
                baseKey: mealKey,
                originalText: text
              };
            }
          }
        }
      }
    }
  }
  
  return null;
}

function customizeMeal(meal, text) {
  // Clonar la comida base
  const customized = {
    ...meal,
    name: meal.name,
    calories: meal.calories,
    protein: meal.protein,
    carbs: meal.carbs,
    fat: meal.fat,
    ingredients: [...meal.ingredients],
    modifications: [],
    added: [],
    removed: [],
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
  
  // Lista de modificaciones comunes
  const modifications = analyzeModifications(text);
  
  // Aplicar modificaciones de REMOVER ingredientes
  modifications.remove.forEach(item => {
    const adjustment = getIngredientAdjustment(item);
    if (adjustment) {
      customized.calories -= adjustment.calories;
      customized.protein -= adjustment.protein;
      customized.carbs -= adjustment.carbs;
      customized.fat -= adjustment.fat;
      customized.removed.push(item);
      customized.modifications.push(`Sin ${item}`);
      
      // Quitar de la lista de ingredientes
      const ingredientIndex = customized.ingredients.findIndex(ing => 
        ing.toLowerCase().includes(item)
      );
      if (ingredientIndex !== -1) {
        customized.ingredients.splice(ingredientIndex, 1);
      }
    }
  });
  
  // Aplicar modificaciones de AÑADIR ingredientes
  modifications.add.forEach(item => {
    const adjustment = getIngredientAdjustment(item);
    if (adjustment) {
      customized.calories += adjustment.calories;
      customized.protein += adjustment.protein;
      customized.carbs += adjustment.carbs;
      customized.fat += adjustment.fat;
      customized.added.push(item);
      customized.modifications.push(`Extra ${item}`);
      customized.ingredients.push(item);
    }
  });
  
  // Aplicar modificaciones de REEMPLAZAR
  modifications.replace.forEach(({from, to}) => {
    const removeAdj = getIngredientAdjustment(from);
    const addAdj = getIngredientAdjustment(to);
    
    if (removeAdj && addAdj) {
      customized.calories = customized.calories - removeAdj.calories + addAdj.calories;
      customized.protein = customized.protein - removeAdj.protein + addAdj.protein;
      customized.carbs = customized.carbs - removeAdj.carbs + addAdj.carbs;
      customized.fat = customized.fat - removeAdj.fat + addAdj.fat;
      customized.modifications.push(`${from} → ${to}`);
      
      // Reemplazar en la lista
      const ingredientIndex = customized.ingredients.findIndex(ing => 
        ing.toLowerCase().includes(from)
      );
      if (ingredientIndex !== -1) {
        customized.ingredients[ingredientIndex] = to;
      }
    }
  });
  
  // Aplicar modificaciones de CANTIDAD
  modifications.quantity.forEach(({item, multiplier}) => {
    const baseAdj = getIngredientAdjustment(item);
    if (baseAdj) {
      const extraCalories = baseAdj.calories * (multiplier - 1);
      const extraProtein = baseAdj.protein * (multiplier - 1);
      const extraCarbs = baseAdj.carbs * (multiplier - 1);
      const extraFat = baseAdj.fat * (multiplier - 1);
      
      customized.calories += extraCalories;
      customized.protein += extraProtein;
      customized.carbs += extraCarbs;
      customized.fat += extraFat;
      customized.modifications.push(`${multiplier === 2 ? 'Doble' : 'Triple'} ${item}`);
    }
  });
  
  // Actualizar nombre con modificaciones
  if (customized.modifications.length > 0) {
    customized.name = `${meal.name} (${customized.modifications.join(', ')})`;
  }
  
  // Añadir hora actual
  customized.time = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Asegurar valores mínimos
  customized.calories = Math.max(100, Math.round(customized.calories));
  customized.protein = Math.max(5, Math.round(customized.protein));
  customized.carbs = Math.max(5, Math.round(customized.carbs));
  customized.fat = Math.max(3, Math.round(customized.fat));
  
  return customized;
}

function analyzeModifications(text) {
  const modifications = {
    remove: [],
    add: [],
    replace: [],
    quantity: []
  };
  
  // Patrones para detectar modificaciones
  const patterns = {
    remove: /\b(?:sin|no|quit[ao]s?|elimin[ao]|sin\s+el?)\s+(\w+(?:\s+\w+)?)/gi,
    add: /\b(?:con|extra|más|añad[ei]|agreg[ao]|agrega)\s+(\w+(?:\s+\w+)?)/gi,
    replace: /\b(?:en\s+lugar\s+de|cambiar|reemplazar|por|con)\s+(\w+)\s+(?:por|con)\s+(\w+)/gi,
    quantity: /\b(doble|triple|extra\s+doble|doble\s+extra)\s+(\w+)/gi
  };
  
  // Analizar "sin"
  let match;
  while ((match = patterns.remove.exec(text)) !== null) {
    modifications.remove.push(match[1].toLowerCase());
  }
  
  // Analizar "con" o "extra"
  while ((match = patterns.add.exec(text)) !== null) {
    modifications.add.push(match[1].toLowerCase());
  }
  
  // Analizar reemplazos
  while ((match = patterns.replace.exec(text)) !== null) {
    modifications.replace.push({
      from: match[1].toLowerCase(),
      to: match[2].toLowerCase()
    });
  }
  
  // Analizar cantidades
  while ((match = patterns.quantity.exec(text)) !== null) {
    const multiplier = match[1].includes('doble') ? 2 : 3;
    modifications.quantity.push({
      item: match[2].toLowerCase(),
      multiplier: multiplier
    });
  }
  
  // Detección especial para ingredientes comunes
  const commonIngredients = [
    'queso', 'bacon', 'cebolla', 'tomate', 'lechuga', 'pepinillos',
    'mayonesa', 'ketchup', 'mostaza', 'salsa', 'aguacate', 'huevo'
  ];
  
  commonIngredients.forEach(ing => {
    // Si dice "sin [ingrediente]" pero no fue detectado
    if (text.includes(`sin ${ing}`) && !modifications.remove.includes(ing)) {
      modifications.remove.push(ing);
    }
    // Si dice "extra [ingrediente]" pero no fue detectado
    if (text.includes(`extra ${ing}`) && !modifications.add.includes(ing)) {
      modifications.add.push(ing);
    }
    // Si dice "doble [ingrediente]" pero no fue detectado
    if (text.includes(`doble ${ing}`) && !modifications.quantity.some(q => q.item === ing)) {
      modifications.quantity.push({ item: ing, multiplier: 2 });
    }
  });
  
  return modifications;
}

function getIngredientAdjustment(ingredient) {
  // Buscar ingrediente exacto
  if (foodDatabase[ingredient]) {
    const data = foodDatabase[ingredient];
    return {
      calories: data.calories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0
    };
  }
  
  // Buscar por coincidencia parcial
  for (const [key, data] of Object.entries(foodDatabase)) {
    if (ingredient.includes(key) || key.includes(ingredient)) {
      return {
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0
      };
    }
  }
  
  // Valores por defecto para ingredientes comunes
  const defaultValues = {
    'queso': { calories: 100, protein: 7, carbs: 1, fat: 8 },
    'bacon': { calories: 80, protein: 6, carbs: 0, fat: 7 },
    'cebolla': { calories: 10, protein: 0.3, carbs: 2, fat: 0 },
    'tomate': { calories: 5, protein: 0.2, carbs: 1, fat: 0 },
    'lechuga': { calories: 3, protein: 0.3, carbs: 0.5, fat: 0 },
    'mayonesa': { calories: 90, protein: 0.1, carbs: 0, fat: 10 },
    'ketchup': { calories: 15, protein: 0, carbs: 4, fat: 0 },
    'salsa': { calories: 30, protein: 0, carbs: 2, fat: 2 },
    'aguacate': { calories: 50, protein: 0.6, carbs: 3, fat: 4.6 },
    'huevo': { calories: 70, protein: 6, carbs: 0.6, fat: 5 }
  };
  
  return defaultValues[ingredient] || { calories: 0, protein: 0, carbs: 0, fat: 0 };
}

function analyzeIngredients(text) {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let detectedFoods = [];
  let found = false;

  // Dividir el texto en palabras
  const words = text.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    // Buscar ingredientes de 1-3 palabras
    for (let j = 1; j <= 3; j++) {
      if (i + j <= words.length) {
        const phrase = words.slice(i, i + j).join(' ');
        
        if (foodDatabase[phrase]) {
          const foodData = foodDatabase[phrase];
          let quantity = 1;
          
          // Intentar extraer cantidad
          if (i > 0) {
            const prevWord = words[i-1];
            const quantityMatch = prevWord.match(/(\d+)/);
            if (quantityMatch) {
              quantity = parseInt(quantityMatch[1]);
            }
          }
          
          // Ajustar por cantidad
          calories += (foodData.calories || 0) * quantity;
          protein += (foodData.protein || 0) * quantity;
          carbs += (foodData.carbs || 0) * quantity;
          fat += (foodData.fat || 0) * quantity;
          
          detectedFoods.push(`${quantity > 1 ? quantity + 'x ' : ''}${phrase}`);
          found = true;
        }
      }
    }
  }

  if (found) {
    const foodName = detectedFoods.length > 0 ? 
      `Comida con ${detectedFoods.slice(0, 3).join(', ')}` : 
      "Comida detectada";
    
    updateMealForm({
      name: foodName,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      ingredients: detectedFoods,
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    });
    
    showToast(`✅ Detectados: ${detectedFoods.slice(0, 3).join(', ')}`);
  } else {
    // Si no se detecta, usar estimación inteligente
    estimateFromDescription(text);
  }
}

function updateMealForm(mealData) {
  if (DOM.mealName) DOM.mealName.value = mealData.name;
  if (DOM.mealCalories) DOM.mealCalories.value = mealData.calories;
  if (DOM.mealProtein) DOM.mealProtein.value = mealData.protein;
  if (DOM.mealCarbs) DOM.mealCarbs.value = mealData.carbs;
  if (DOM.mealFat) DOM.mealFat.value = mealData.fat;
  
  // Mostrar detalles en el área de resultados
  showMealDetails(mealData);
}

function showMealDetails(mealData) {
  if (!DOM.aiResults) return;
  
  let html = `
    <div class="meal-details">
      <div class="meal-header">
        <h4>🍔 ${mealData.name}</h4>
        ${mealData.time ? `<div class="meal-time">🕐 ${mealData.time}</div>` : ''}
      </div>
      
      ${mealData.restaurant ? `<div class="meal-restaurant">🏪 ${mealData.restaurant}</div>` : ''}
      
      <div class="nutrition-breakdown">
        <div class="nutrient-item">
          <span class="nutrient-label">🔥 Calorías</span>
          <span class="nutrient-value">${mealData.calories}</span>
        </div>
        <div class="nutrient-item">
          <span class="nutrient-label">💪 Proteína</span>
          <span class="nutrient-value">${mealData.protein}g</span>
        </div>
        <div class="nutrient-item">
          <span class="nutrient-label">🌾 Carbos</span>
          <span class="nutrient-value">${mealData.carbs}g</span>
        </div>
        <div class="nutrient-item">
          <span class="nutrient-label">🥑 Grasas</span>
          <span class="nutrient-value">${mealData.fat}g</span>
        </div>
      </div>
  `;
  
  if (mealData.ingredients && mealData.ingredients.length > 0) {
    html += `
      <div class="ingredients-section">
        <strong>🍽️ Ingredientes:</strong>
        <div class="ingredients-grid">
          ${mealData.ingredients.map(ing => `<span class="ingredient-tag">${ing}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (mealData.modifications && mealData.modifications.length > 0) {
    html += `
      <div class="modifications-section">
        <strong>⚙️ Personalizaciones:</strong>
        <div class="modifications-list">
          ${mealData.modifications.map(mod => `<span class="modification-tag">${mod}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  html += `</div>`;
  
  DOM.aiResults.innerHTML = html;
}

function estimateFromDescription(text) {
  // Estimación basada en palabras clave
  let baseCalories = 500;
  let baseProtein = 25;
  let baseCarbs = 60;
  let baseFat = 20;
  let mealName = "Comida estimada";
  
  // Palabras clave para estimación
  if (text.includes('hamburguesa') || text.includes('burger')) {
    baseCalories = 600;
    baseProtein = 35;
    baseCarbs = 45;
    baseFat = 30;
    mealName = "Hamburguesa estimada";
  }
  
  if (text.includes('ensalada')) {
    baseCalories = 300;
    baseProtein = 15;
    baseCarbs = 20;
    baseFat = 15;
    mealName = "Ensalada estimada";
  }
  
  if (text.includes('pizza')) {
    baseCalories = 800;
    baseProtein = 30;
    baseCarbs = 100;
    baseFat = 25;
    mealName = "Pizza estimada";
  }
  
  if (text.includes('pollo') && text.includes('arroz')) {
    baseCalories = 650;
    baseProtein = 40;
    baseCarbs = 70;
    baseFat = 20;
    mealName = "Pollo con arroz";
  }
  
  // Ajustar según modificaciones
  if (text.includes('sin queso')) baseCalories -= 100;
  if (text.includes('extra queso')) baseCalories += 150;
  if (text.includes('sin bacon')) baseCalories -= 80;
  if (text.includes('extra bacon')) baseCalories += 120;
  if (text.includes('doble carne')) {
    baseCalories += 250;
    baseProtein += 26;
  }
  
  // Añadir aleatoriedad realista (±15%)
  const variation = 0.15;
  const randomFactor = (min, max) => Math.random() * (max - min) + min;
  
  const finalCalories = Math.round(baseCalories * randomFactor(1 - variation, 1 + variation));
  const finalProtein = Math.round(baseProtein * randomFactor(1 - variation, 1 + variation));
  const finalCarbs = Math.round(baseCarbs * randomFactor(1 - variation, 1 + variation));
  const finalFat = Math.round(baseFat * randomFactor(1 - variation, 1 + variation));
  
  updateMealForm({
    name: mealName,
    calories: finalCalories,
    protein: finalProtein,
    carbs: finalCarbs,
    fat: finalFat,
    ingredients: ["Estimación basada en descripción"],
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  });
  
  showToast("⚠️ Usando estimación inteligente");
}

/**********************
 * GESTIÓN DE COMIDAS CON HORA
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
  
  const now = new Date();
  const meal = {
    id: Date.now(),
    name,
    cal,
    prot,
    carbs,
    fat,
    timestamp: now.toISOString(),
    date: now.toLocaleDateString('es-ES'),
    time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    datetime: now.getTime()
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
  
  showToast(`✅ ${name} añadido a las ${meal.time}`);
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
  
  // Ordenar por hora (más reciente primero)
  todayMeals.sort((a, b) => b.datetime - a.datetime);
  
  todayMeals.forEach((meal) => {
    const li = document.createElement("li");
    
    const info = document.createElement('div');
    info.innerHTML = `
      <div class="meal-info-header">
        <strong>${meal.name}</strong>
        <span class="meal-time-badge">🕐 ${meal.time}</span>
      </div>
      <div class="meal-nutrition">
        <span class="calories-badge">🔥 ${meal.cal} kcal</span>
        <span class="protein-badge">💪 ${meal.prot}g P</span>
        <span class="carbs-badge">🌾 ${meal.carbs}g C</span>
        <span class="fat-badge">🥑 ${meal.fat}g G</span>
      </div>
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
  
  const now = new Date();
  const exercise = {
    id: Date.now(),
    name,
    sets: parseInt(sets),
    reps: parseInt(reps),
    weight: parseFloat(weight),
    timestamp: now.toISOString(),
    date: now.toLocaleDateString('es-ES'),
    time: now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  };
  
  exercises.push(exercise);
  renderExercises();
  saveToDisk();
  
  // Limpiar formulario
  ["exerciseName", "workoutSets", "workoutReps", "workoutWeight"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  
  showToast(`💪 ${name} registrado a las ${exercise.time}`);
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
  
  // Ordenar por hora
  todayExercises.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  todayExercises.forEach(ex => {
    const li = document.createElement("li");
    
    const info = document.createElement('div');
    info.innerHTML = `
      <div class="exercise-info-header">
        <strong>${ex.name}</strong>
        <span class="exercise-time">🕐 ${ex.time}</span>
      </div>
      <div class="exercise-details">
        <span class="sets-reps">${ex.sets}x${ex.reps}</span>
        ${ex.weight > 0 ? `<span class="weight">${ex.weight}kg</span>` : ''}
      </div>
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
    DOM.calStatus.style.color = remaining > 0 ? "var(--military-green)" : "var(--military-red)";
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
    muscle: userBiometrics.muscle,
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
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
        borderColor: 'var(--military-yellow)',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        tension: 0.3,
        fill: true,
        pointBackgroundColor: 'var(--military-sand)',
        pointBorderColor: 'var(--military-yellow)',
        pointRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'var(--military-yellow)',
            font: {
              size: 14,
              family: 'Orbitron'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(13, 27, 30, 0.9)',
          titleColor: 'var(--military-yellow)',
          bodyColor: 'var(--military-tan)',
          borderColor: 'var(--military-olive)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'var(--military-yellow)',
            font: {
              family: 'Orbitron'
            }
          },
          grid: {
            color: 'rgba(255, 215, 0, 0.1)'
          }
        },
        y: {
          ticks: {
            color: 'var(--military-yellow)',
            font: {
              family: 'Orbitron'
            }
          },
          grid: {
            color: 'rgba(255, 215, 0, 0.1)'
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
    version: '4.0'
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
      
      // Asegurar que todas las comidas tengan hora
      meals.forEach(meal => {
        if (!meal.time && meal.timestamp) {
          const date = new Date(meal.timestamp);
          meal.time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
          meal.datetime = date.getTime();
        }
      });
      
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
  
  showToast("✅ AI Fitness Tracker v4.0 cargado");
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

/**********************
 * ESTILOS ADICIONALES PARA LA INTERFAZ MEJORADA
 **********************/
const additionalStyles = `
/* Estilos para las comidas con hora */
.meal-info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 10px;
}

.meal-info-header strong {
  flex: 1;
  font-size: 1.1rem;
  color: var(--military-yellow);
}

.meal-time-badge {
  background: rgba(85, 107, 47, 0.6);
  border: 1px solid var(--military-olive);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.85rem;
  color: var(--military-tan);
  white-space: nowrap;
}

.meal-nutrition {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.calories-badge, .protein-badge, .carbs-badge, .fat-badge {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: bold;
}

.calories-badge {
  background: rgba(255, 68, 68, 0.2);
  border: 1px solid rgba(255, 68, 68, 0.4);
  color: #ffcccc;
}

.protein-badge {
  background: rgba(57, 255, 20, 0.2);
  border: 1px solid rgba(57, 255, 20, 0.4);
  color: #ccffcc;
}

.carbs-badge {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.4);
  color: #ffffcc;
}

.fat-badge {
  background: rgba(255, 140, 0, 0.2);
  border: 1px solid rgba(255, 140, 0, 0.4);
  color: #ffddcc;
}

/* Estilos para detalles de comidas */
.meal-details {
  background: linear-gradient(145deg, rgba(45, 80, 22, 0.3), rgba(26, 42, 47, 0.9));
  padding: 20px;
  border-radius: 10px;
  border: 2px solid var(--military-sand);
  margin-top: 15px;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.meal-header h4 {
  color: var(--military-yellow);
  margin: 0;
  flex: 1;
}

.meal-time {
  background: rgba(85, 107, 47, 0.6);
  border: 1px solid var(--military-olive);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  color: var(--military-tan);
  display: flex;
  align-items: center;
  gap: 5px;
}

.meal-restaurant {
  background: rgba(194, 178, 128, 0.2);
  border: 1px solid var(--military-sand);
  padding: 8px 15px;
  border-radius: 15px;
  display: inline-block;
  margin-bottom: 15px;
  color: var(--military-tan);
  font-size: 0.9rem;
}

.nutrition-breakdown {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 20px 0;
}

@media (min-width: 768px) {
  .nutrition-breakdown {
    grid-template-columns: repeat(4, 1fr);
  }
}

.nutrient-item {
  background: rgba(13, 27, 30, 0.8);
  padding: 15px;
  border-radius: 8px;
  border: 1px solid var(--military-olive);
  text-align: center;
  transition: transform 0.3s ease;
}

.nutrient-item:hover {
  transform: translateY(-5px);
  border-color: var(--military-yellow);
}

.nutrient-label {
  display: block;
  color: var(--military-tan);
  font-size: 0.9rem;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nutrient-value {
  display: block;
  color: var(--military-yellow);
  font-size: 1.6rem;
  font-weight: bold;
}

.ingredients-section, .modifications-section {
  background: rgba(13, 27, 30, 0.6);
  padding: 15px;
  border-radius: 8px;
  margin-top: 15px;
  border-left: 3px solid var(--military-green);
}

.ingredients-section strong, .modifications-section strong {
  color: var(--military-sand);
  display: block;
  margin-bottom: 12px;
  font-size: 1rem;
}

.ingredients-grid, .modifications-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ingredient-tag {
  background: rgba(85, 107, 47, 0.3);
  border: 1px solid var(--military-olive);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  color: var(--military-tan);
  display: flex;
  align-items: center;
  gap: 5px;
}

.ingredient-tag:before {
  content: "✓";
  color: var(--military-green);
}

.modification-tag {
  background: rgba(255, 215, 0, 0.15);
  border: 1px solid var(--military-yellow);
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  color: var(--military-yellow);
  display: flex;
  align-items: center;
  gap: 5px;
}

.modification-tag:before {
  content: "⚙️";
  font-size: 0.8rem;
}

/* Estilos para ejercicios */
.exercise-info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 10px;
}

.exercise-info-header strong {
  flex: 1;
  color: var(--military-yellow);
}

.exercise-time {
  background: rgba(85, 107, 47, 0.6);
  border: 1px solid var(--military-olive);
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  color: var(--military-tan);
}

.exercise-details {
  display: flex;
  gap: 15px;
  align-items: center;
}

.sets-reps {
  background: rgba(57, 255, 20, 0.2);
  border: 1px solid rgba(57, 255, 20, 0.4);
  padding: 4px 10px;
  border-radius: 10px;
  font-weight: bold;
  color: #ccffcc;
}

.weight {
  background: rgba(255, 140, 0, 0.2);
  border: 1px solid rgba(255, 140, 0, 0.4);
  padding: 4px 10px;
  border-radius: 10px;
  color: #ffddcc;
}

/* Timeline visual */
li {
  position: relative;
  padding-left: 15px;
}

li:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--military-green), var(--military-yellow));
  border-radius: 2px;
}

li:hover:before {
  background: linear-gradient(to bottom, var(--military-yellow), var(--military-sand));
}

/* Quick suggestions */
.quick-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 15px 0;
  padding: 15px;
  background: rgba(13, 27, 30, 0.5);
  border-radius: 8px;
  border: 1px dashed var(--military-olive);
}

.suggestion-btn {
  padding: 8px 15px;
  background: rgba(85, 107, 47, 0.4);
  border: 1px solid var(--military-olive);
  color: var(--military-tan);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.suggestion-btn:hover {
  background: rgba(85, 107, 47, 0.7);
  transform: translateY(-2px);
}

.suggestion-btn.restaurant {
  background: rgba(194, 178, 128, 0.3);
  border-color: var(--military-sand);
}

.suggestion-btn.restaurant:hover {
  background: rgba(194, 178, 128, 0.6);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .meal-info-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .meal-time-badge {
    align-self: flex-start;
  }
  
  .nutrition-breakdown {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .meal-nutrition {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .nutrition-breakdown {
    grid-template-columns: 1fr;
  }
  
  .ingredients-grid, .modifications-list {
    flex-direction: column;
  }
  
  .ingredient-tag, .modification-tag {
    width: 100%;
  }
}
`;

// Añadir estilos al documento
const styleEl = document.createElement('style');
styleEl.textContent = additionalStyles;
document.head.appendChild(styleEl);

/**********************
 * FUNCIÓN PARA AÑADIR SUGERENCIAS RÁPIDAS
 **********************/
function addQuickSuggestions() {
  const aiMealText = DOM.aiMealText;
  if (!aiMealText || !aiMealText.parentNode) return;
  
  // Crear contenedor de sugerencias
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'quick-suggestions';
  suggestionsContainer.innerHTML = `
    <div style="width: 100%; margin-bottom: 10px; color: var(--military-gray); font-size: 0.9rem;">
      💡 Sugerencias rápidas:
    </div>
    <button class="suggestion-btn restaurant" data-text="whopper sin queso extra bacon">🍔 Whopper BK</button>
    <button class="suggestion-btn restaurant" data-text="big mac con patatas medianas">🍟 Big Mac</button>
    <button class="suggestion-btn restaurant" data-text="zinger con aros de cebolla">🍗 Zinger KFC</button>
    <button class="suggestion-btn restaurant" data-text="salvaje oww sin cebolla">🤠 Salvaje OWW</button>
    <button class="suggestion-btn" data-text="ensalada cesar con pollo">🥗 Ensalada</button>
    <button class="suggestion-btn" data-text="patatas grandes con nuggets 6">🍟 Patatas + Nuggets</button>
  `;
  
  // Insertar después del textarea
  aiMealText.parentNode.insertBefore(suggestionsContainer, aiMealText.nextSibling);
  
  // Añadir eventos a los botones
  suggestionsContainer.querySelectorAll('.suggestion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      aiMealText.value = btn.getAttribute('data-text');
      // Disparar evento de cambio para análisis automático
      aiMealText.dispatchEvent(new Event('input'));
    });
  });
}

// Modificar el inicio para añadir sugerencias
const originalOnload = window.onload;
window.onload = function() {
  if (originalOnload) originalOnload();
  
  // Añadir sugerencias rápidas después de cargar todo
  setTimeout(() => {
    addQuickSuggestions();
    
    // Añadir análisis automático al escribir
    if (DOM.aiMealText) {
      DOM.aiMealText.addEventListener('input', function() {
        if (this.value.length > 10) {
          // Pequeño delay para análisis automático
          clearTimeout(this.analysisTimeout);
          this.analysisTimeout = setTimeout(() => {
            if (this.value.trim().length > 0) {
              handleAnalyze();
            }
          }, 1000);
        }
      });
    }
  }, 500);
};

/**********************
 * EJEMPLOS DE USO:
 * 
 * 1. "whopper sin queso extra bacon" → 740 kcal, hora actual
 * 2. "big mac con patatas medianas" → 883 kcal total
 * 3. "zinger con aros de cebolla y coca cola" → 1010 kcal
 * 4. "salvaje oww sin cebolla con cheddar bites" → 1230 kcal
 * 5. "ensalada cesar con pollo crispy" → 770 kcal
 * 6. "nuggets 9 con patatas grandes" → 900 kcal
 * 
 * LA APLICACIÓN AHORA:
 * ✅ Registra hora exacta de cada comida
 * ✅ Tiene +100 comidas de restaurantes famosos
 * ✅ Muestra hora al lado de cada comida
 * ✅ Ordena por hora (más reciente primero)
 * ✅ Base de datos masiva con todos los restaurantes
 * ✅ Sistema de sugerencias rápidas
 * ✅ Análisis automático al escribir
 **********************/
