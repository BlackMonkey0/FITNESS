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
let userBiometrics = { 
    weight: 0, 
    fat: 0, 
    muscle: 0, 
    water: 60, 
    bone: 3, 
    history: [] 
};
let currentTab = 'dashboard';
let selectedCalendarDate = new Date().toISOString().split('T')[0]; // Fecha seleccionada en calendario

// Datos del usuario para personalización
let userProfile = {
    age: 25,
    height: 175,
    gender: 'male',
    goal: 'gain',
    level: 'beginner',
    activity: 'moderate',
    diet: 'balanced'
};

// Gráficos
let weightChart = null;
let biometryChart = null;

// Caché de elementos DOM
const DOM = {};

/**********************
 * BASE DE DATOS DE ALIMENTOS MEJORADA PARA IA
 **********************/
const enhancedFoodDatabase = {
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
    'plátano': { calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
    
    // NUEVOS ALIMENTOS PARA IA
    'kebab': { calories: 850, protein: 45, carbs: 80, fat: 35 },
    'döner': { calories: 850, protein: 45, carbs: 80, fat: 35 },
    'salsa': { calories: 150, protein: 2, carbs: 8, fat: 12 },
    'salsa yogur': { calories: 100, protein: 3, carbs: 6, fat: 8 },
    'salsa tomate': { calories: 30, protein: 1, carbs: 7, fat: 0.3 },
    'salsa mayonesa': { calories: 200, protein: 1, carbs: 2, fat: 22 },
    'arroz': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'arroz blanco': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
    'maíz': { calories: 86, protein: 3.2, carbs: 19, fat: 1.2 },
    'ensalada': { calories: 50, protein: 2, carbs: 10, fat: 1 },
    'lechuga': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
    'pepino': { calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
    'cebolla': { calories: 40, protein: 1.1, carbs: 9, fat: 0.1 },
    'tomate': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
    'zanahoria': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2 },
    'pimiento': { calories: 20, protein: 0.9, carbs: 4.6, fat: 0.2 },
    'aceitunas': { calories: 115, protein: 0.8, carbs: 6, fat: 11 },
    'queso': { calories: 402, protein: 25, carbs: 1.3, fat: 33 },
    'jamón': { calories: 145, protein: 21, carbs: 1.5, fat: 6 },
    'pavo': { calories: 135, protein: 29, carbs: 0, fat: 2 },
    'ternera': { calories: 250, protein: 26, carbs: 0, fat: 15 },
    'cordero': { calories: 294, protein: 25, carbs: 0, fat: 21 },
    'pan pita': { calories: 165, protein: 5.5, carbs: 33, fat: 1.7 },
    'pan de pita': { calories: 165, protein: 5.5, carbs: 33, fat: 1.7 },
    'tortilla': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    'patatas fritas': { calories: 312, protein: 3.4, carbs: 41, fat: 15 },
    'patatas': { calories: 77, protein: 2, carbs: 17, fat: 0.1 },
    'guacamole': { calories: 160, protein: 2, carbs: 9, fat: 15 },
    'falafel': { calories: 333, protein: 13, carbs: 31, fat: 18 },
    'hummus': { calories: 166, protein: 8, carbs: 14, fat: 9 },
    'yogur': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    'tahini': { calories: 595, protein: 17, carbs: 21, fat: 53 },
    'pasta': { calories: 131, protein: 5, carbs: 25, fat: 1 },
    'sándwich': { calories: 300, protein: 15, carbs: 35, fat: 12 },
    'sandwich': { calories: 300, protein: 15, carbs: 35, fat: 12 },
    'bocadillo': { calories: 350, protein: 20, carbs: 40, fat: 15 },
    'manzana': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
    'pera': { calories: 57, protein: 0.4, carbs: 15, fat: 0.1 },
    'naranja': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1 },
    'plátano': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
    'uvas': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2 },
    'fresas': { calories: 32, protein: 0.7, carbs: 8, fat: 0.3 },
    'kiwi': { calories: 61, protein: 1.1, carbs: 15, fat: 0.5 },
    'mango': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4 },
    'piña': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
    'melón': { calories: 34, protein: 0.8, carbs: 8, fat: 0.2 },
    'sandía': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2 },
    'aguacate': { calories: 160, protein: 2, carbs: 9, fat: 15 },
    'aceite de oliva': { calories: 884, protein: 0, carbs: 0, fat: 100 },
    'aceite': { calories: 884, protein: 0, carbs: 0, fat: 100 },
    'vinagre': { calories: 18, protein: 0, carbs: 5, fat: 0 },
    'limón': { calories: 29, protein: 1.1, carbs: 9, fat: 0.3 },
    'sal': { calories: 0, protein: 0, carbs: 0, fat: 0 },
    'pimienta': { calories: 251, protein: 10, carbs: 64, fat: 3.3 },
    'especias': { calories: 200, protein: 5, carbs: 40, fat: 5 },
    'perejil': { calories: 36, protein: 3, carbs: 6, fat: 0.8 },
    'cilantro': { calories: 23, protein: 2.1, carbs: 3.7, fat: 0.5 },
    'menta': { calories: 44, protein: 3.3, carbs: 8.4, fat: 0.7 },
    'albahaca': { calories: 23, protein: 3.2, carbs: 2.7, fat: 0.6 },
    'pollo': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    'pescado': { calories: 206, protein: 22, carbs: 0, fat: 12 },
    'salmón': { calories: 208, protein: 20, carbs: 0, fat: 13 },
    'atún': { calories: 132, protein: 29, carbs: 0, fat: 1 },
    'gambas': { calories: 85, protein: 18, carbs: 0.2, fat: 0.5 },
    'calamar': { calories: 92, protein: 16, carbs: 3.1, fat: 1.4 },
    'huevos': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
    'tocino': { calories: 541, protein: 37, carbs: 1.4, fat: 42 },
    'salchicha': { calories: 301, protein: 12, carbs: 2.1, fat: 27 },
    'chorizo': { calories: 455, protein: 24, carbs: 1.9, fat: 38 },
    'leche': { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
    'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4 },
    'queso fresco': { calories: 72, protein: 12, carbs: 4.1, fat: 0.7 },
    'mantequilla': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
    'margarina': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81 },
    'miel': { calories: 304, protein: 0.3, carbs: 82, fat: 0 },
    'azúcar': { calories: 387, protein: 0, carbs: 100, fat: 0 },
    'chocolate': { calories: 546, protein: 4.9, carbs: 61, fat: 31 },
    'galletas': { calories: 500, protein: 6, carbs: 65, fat: 24 },
    'pastel': { calories: 350, protein: 5, carbs: 45, fat: 17 },
    'helado': { calories: 207, protein: 3.5, carbs: 24, fat: 11 },
    'frutos secos': { calories: 607, protein: 20, carbs: 21, fat: 54 },
    'almendras': { calories: 579, protein: 21, carbs: 22, fat: 50 },
    'nueces': { calories: 654, protein: 15, carbs: 14, fat: 65 },
    'cacahuetes': { calories: 567, protein: 26, carbs: 16, fat: 49 },
    'pistachos': { calories: 562, protein: 20, carbs: 28, fat: 45 },
    'avellanas': { calories: 628, protein: 15, carbs: 17, fat: 61 },
    'anacardos': { calories: 553, protein: 18, carbs: 30, fat: 44 },
    'pasas': { calories: 299, protein: 3.1, carbs: 79, fat: 0.5 },
    'dátiles': { calories: 282, protein: 2.5, carbs: 75, fat: 0.4 },
    'higos': { calories: 74, protein: 0.8, carbs: 19, fat: 0.3 },
    'ciruelas': { calories: 46, protein: 0.7, carbs: 11, fat: 0.3 },
    'albaricoques': { calories: 48, protein: 1.4, carbs: 11, fat: 0.4 },
    'melocotón': { calories: 39, protein: 0.9, carbs: 10, fat: 0.3 },
    'ciruela pasa': { calories: 240, protein: 2.2, carbs: 64, fat: 0.4 },
    'cerezas': { calories: 50, protein: 1, carbs: 12, fat: 0.3 },
    'frambuesas': { calories: 52, protein: 1.2, carbs: 12, fat: 0.7 },
    'moras': { calories: 43, protein: 1.4, carbs: 10, fat: 0.5 },
    'arándanos': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3 },
    'granada': { calories: 83, protein: 1.7, carbs: 19, fat: 1.2 },
    'papaya': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3 },
    'coco': { calories: 354, protein: 3.3, carbs: 15, fat: 33 },
    'piñones': { calories: 673, protein: 14, carbs: 13, fat: 68 },
    'semillas de girasol': { calories: 584, protein: 21, carbs: 20, fat: 51 },
    'semillas de chía': { calories: 486, protein: 17, carbs: 42, fat: 31 },
    'semillas de lino': { calories: 534, protein: 18, carbs: 29, fat: 42 },
    'sésamo': { calories: 573, protein: 18, carbs: 23, fat: 50 },
    'garbanzos': { calories: 364, protein: 19, carbs: 61, fat: 6 },
    'lentejas': { calories: 116, protein: 9, carbs: 20, fat: 0.4 },
    'judías': { calories: 127, protein: 9, carbs: 23, fat: 0.5 },
    'guisantes': { calories: 81, protein: 5, carbs: 14, fat: 0.4 },
    'soja': { calories: 446, protein: 36, carbs: 30, fat: 20 },
    'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8 },
    'tempeh': { calories: 193, protein: 19, carbs: 9, fat: 11 },
    'seitán': { calories: 120, protein: 24, carbs: 4, fat: 1 },
    'brocoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
    'coliflor': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3 },
    'espinacas': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
    'acelgas': { calories: 19, protein: 1.8, carbs: 3.7, fat: 0.2 },
    'apio': { calories: 16, protein: 0.7, carbs: 3, fat: 0.2 },
    'calabacín': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
    'calabaza': { calories: 26, protein: 1, carbs: 7, fat: 0.1 },
    'berenjena': { calories: 25, protein: 1, carbs: 6, fat: 0.2 },
    'setas': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
    'champiñones': { calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
    'patata dulce': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
    'boniato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
    'remolacha': { calories: 43, protein: 1.6, carbs: 10, fat: 0.2 },
    'rábano': { calories: 16, protein: 0.7, carbs: 3.4, fat: 0.1 },
    'nabo': { calories: 28, protein: 0.9, carbs: 6, fat: 0.1 },
    'alcachofa': { calories: 47, protein: 3.3, carbs: 11, fat: 0.2 },
    'espárragos': { calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1 },
    'puerro': { calories: 61, protein: 1.5, carbs: 14, fat: 0.3 },
    'ajo': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5 },
    'jengibre': { calories: 80, protein: 1.8, carbs: 18, fat: 0.8 },
    'cúrcuma': { calories: 354, protein: 7.8, carbs: 65, fat: 10 },
    'canela': { calories: 247, protein: 4, carbs: 81, fat: 1.2 },
    'comino': { calories: 375, protein: 18, carbs: 44, fat: 22 },
    'pimentón': { calories: 282, protein: 14, carbs: 54, fat: 13 },
    'curry': { calories: 325, protein: 14, carbs: 58, fat: 14 },
    'mostaza': { calories: 66, protein: 4.4, carbs: 5, fat: 3.3 },
    'salsa de soja': { calories: 53, protein: 8, carbs: 5, fat: 0.1 },
    'ketchup': { calories: 101, protein: 1.2, carbs: 25, fat: 0.1 },
    'mayonesa': { calories: 680, protein: 1.1, carbs: 2.6, fat: 75 },
    'salsa barbacoa': { calories: 150, protein: 1, carbs: 30, fat: 3 },
    'salsa picante': { calories: 20, protein: 1, carbs: 4, fat: 0.1 },
    'salsa tabasco': { calories: 12, protein: 1, carbs: 2, fat: 0.1 },
    'salsa worcestershire': { calories: 78, protein: 0, carbs: 20, fat: 0 },
    'salsa teriyaki': { calories: 89, protein: 4, carbs: 16, fat: 0.9 },
    'salsa pesto': { calories: 496, protein: 6, carbs: 6, fat: 50 },
    'salsa bechamel': { calories: 200, protein: 5, carbs: 15, fat: 12 },
    'salsa holandesa': { calories: 350, protein: 3, carbs: 3, fat: 37 },
    'salsa carbonara': { calories: 450, protein: 10, carbs: 15, fat: 35 },
    'salsa boloñesa': { calories: 120, protein: 8, carbs: 10, fat: 5 },
    'salsa alfredo': { calories: 400, protein: 8, carbs: 10, fat: 35 },
    'salsa napolitana': { calories: 50, protein: 2, carbs: 10, fat: 0.5 },
    'salsa rosa': { calories: 300, protein: 2, carbs: 8, fat: 28 },
    'salsa tártara': { calories: 350, protein: 1, carbs: 5, fat: 36 },
    'salsa agridulce': { calories: 150, protein: 0.5, carbs: 35, fat: 0.5 },
    'salsa curry': { calories: 200, protein: 3, carbs: 15, fat: 13 },
    'salsa miel y mostaza': { calories: 180, protein: 1, carbs: 20, fat: 10 },
    'salsa chimichurri': { calories: 180, protein: 1, carbs: 5, fat: 18 },
    'salsa romesco': { calories: 250, protein: 3, carbs: 10, fat: 22 },
    'salsa mojo': { calories: 200, protein: 1, carbs: 8, fat: 18 },
    'salsa guacamole': { calories: 160, protein: 2, carbs: 9, fat: 15 },
    'salsa hummus': { calories: 166, protein: 8, carbs: 14, fat: 9 },
    'salsa tzatziki': { calories: 100, protein: 4, carbs: 5, fat: 8 },
    'salsa skordalia': { calories: 300, protein: 6, carbs: 20, fat: 22 },
    'salsa tarator': { calories: 250, protein: 5, carbs: 10, fat: 22 },
    'salsa muhammara': { calories: 200, protein: 3, carbs: 15, fat: 15 },
    'salsa baba ganoush': { calories: 180, protein: 3, carbs: 10, fat: 15 },
    'salsa labneh': { calories: 150, protein: 8, carbs: 5, fat: 12 },
    'salsa harissa': { calories: 80, protein: 2, carbs: 10, fat: 4 },
    'salsa chermoula': { calories: 120, protein: 2, carbs: 5, fat: 11 },
    'salsa zhoug': { calories: 100, protein: 2, carbs: 8, fat: 8 },
    'salsa amba': { calories: 60, protein: 1, carbs: 10, fat: 2 },
    'salsa shatta': { calories: 40, protein: 1, carbs: 5, fat: 2 },
    'salsa skhug': { calories: 80, protein: 2, carbs: 8, fat: 5 },
    'salsa zhug': { calories: 80, protein: 2, carbs: 8, fat: 5 },
    'salsa charmoula': { calories: 120, protein: 2, carbs: 5, fat: 11 },
    'salsa chermula': { calories: 120, protein: 2, carbs: 5, fat: 11 },
    'salsa ras el hanout': { calories: 300, protein: 10, carbs: 40, fat: 15 },
    'salsa baharat': { calories: 250, protein: 8, carbs: 35, fat: 12 },
    'salsa zaatar': { calories: 400, protein: 10, carbs: 30, fat: 30 },
    'salsa dukkah': { calories: 450, protein: 15, carbs: 25, fat: 35 },
    'salsa sumac': { calories: 300, protein: 8, carbs: 40, fat: 15 },
    'salsa piri piri': { calories: 60, protein: 1, carbs: 10, fat: 2 },
    'salsa peri peri': { calories: 60, protein: 1, carbs: 10, fat: 2 },
    'salsa nando': { calories: 60, protein: 1, carbs: 10, fat: 2 },
    'salsa sriracha': { calories: 50, protein: 1, carbs: 8, fat: 2 },
    'salsa gochujang': { calories: 150, protein: 3, carbs: 30, fat: 2 },
    'salsa doenjang': { calories: 100, protein: 5, carbs: 15, fat: 3 }
};

// Palabras clave y sus valores
const foodKeywords = {
    'pequeño': 0.7,
    'pequeña': 0.7,
    'pequeños': 0.7,
    'pequeñas': 0.7,
    'mediano': 1,
    'mediana': 1,
    'medianos': 1,
    'medianas': 1,
    'grande': 1.3,
    'grandes': 1.3,
    'extra grande': 1.5,
    'extra grandes': 1.5,
    'porción': 1,
    'porciones': 1,
    'ración': 1,
    'raciones': 1,
    'taza': 1,
    'tazas': 1,
    'vaso': 1,
    'vasos': 1,
    'cucharada': 0.1,
    'cucharadas': 0.1,
    'cucharadita': 0.05,
    'cucharaditas': 0.05,
    'gramo': 0.001,
    'gramos': 0.001,
    'g': 0.001,
    'kilo': 1,
    'kilos': 1,
    'kg': 1,
    'mililitro': 0.001,
    'mililitros': 0.001,
    'ml': 0.001,
    'litro': 1,
    'litros': 1,
    'l': 1,
    'un': 1,
    'una': 1,
    'unos': 1,
    'unas': 1,
    'trozo': 0.5,
    'trozos': 0.5,
    'pedazo': 0.5,
    'pedazos': 0.5,
    'rebanada': 0.3,
    'rebanadas': 0.3,
    'rodaja': 0.3,
    'rodajas': 0.3,
    'filete': 1,
    'filetes': 1,
    'pieza': 1,
    'piezas': 1,
    'unidad': 1,
    'unidades': 1
};

// Modificadores de preparación
const preparationModifiers = {
    'frito': 1.4,
    'frita': 1.4,
    'fritos': 1.4,
    'fritas': 1.4,
    'freír': 1.4,
    'asado': 1.1,
    'asada': 1.1,
    'asados': 1.1,
    'asadas': 1.1,
    'asar': 1.1,
    'hervido': 0.9,
    'hervida': 0.9,
    'hervidos': 0.9,
    'hervidas': 0.9,
    'hervir': 0.9,
    'al vapor': 0.8,
    'crudo': 1,
    'cruda': 1,
    'crudos': 1,
    'crudas': 1,
    'a la parrilla': 1.05,
    'parrillada': 1.05,
    'a la plancha': 1.02,
    'plancha': 1.02,
    'al horno': 1.08,
    'horneado': 1.08,
    'horneada': 1.08,
    'empanado': 1.3,
    'empanada': 1.3,
    'empanados': 1.3,
    'empanadas': 1.3,
    'relleno': 1.2,
    'rellena': 1.2,
    'rellenos': 1.2,
    'rellenas': 1.2
};

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
    DOM.mealDateInput = document.getElementById('mealDateInput');
    DOM.saveMealBtn = document.getElementById('saveMealBtn');
    DOM.clearMealForm = document.getElementById('clearMealForm');
    DOM.mealsListContainer = document.getElementById('mealsListContainer');
    DOM.totalCaloriesDay = document.getElementById('totalCaloriesDay');
    DOM.totalProteinDay = document.getElementById('totalProteinDay');
    DOM.totalCarbsDay = document.getElementById('totalCarbsDay');
    DOM.totalFatDay = document.getElementById('totalFatDay');
    DOM.mealsHistory = document.getElementById('mealsHistory');
    
    // Calendario de comidas
    DOM.calendarDays = document.getElementById('calendarDays');
    DOM.currentMonthYear = document.getElementById('currentMonthYear');
    DOM.prevMonth = document.getElementById('prevMonth');
    DOM.nextMonth = document.getElementById('nextMonth');
    DOM.selectedDateText = document.getElementById('selectedDateText');
    DOM.selectedDateStats = document.getElementById('selectedDateStats');
    
    // Botones de acción rápida
    DOM.addWaterBtn = document.getElementById('addWaterBtn');
    DOM.addQuickMealBtn = document.getElementById('addQuickMealBtn');
    DOM.addQuickWorkoutBtn = document.getElementById('addQuickWorkoutBtn');
    DOM.generateReportBtn = document.getElementById('generateReportBtn');
    
    // Biometría
    DOM.bodyWeight = document.getElementById('bodyWeight');
    DOM.bodyFat = document.getElementById('bodyFat');
    DOM.bodyMusclePercent = document.getElementById('bodyMusclePercent');
    DOM.bodyWater = document.getElementById('bodyWater');
    DOM.bodyBone = document.getElementById('bodyBone');
    DOM.bodyDateInput = document.getElementById('bodyDateInput');
    DOM.saveBodyBtn = document.getElementById('saveBodyBtn');
    DOM.calculateBodyBtn = document.getElementById('calculateBodyBtn');
    
    // Elementos de biometría expandida
    DOM.currentWeight = document.getElementById('currentWeight');
    DOM.currentFat = document.getElementById('currentFat');
    DOM.currentBMI = document.getElementById('currentBMI');
    DOM.currentMusclePercent = document.getElementById('currentMusclePercent');
    DOM.currentWater = document.getElementById('currentWater');
    DOM.currentBone = document.getElementById('currentBone');
    DOM.weightChange = document.getElementById('weightChange');
    DOM.fatChange = document.getElementById('fatChange');
    DOM.muscleChange = document.getElementById('muscleChange');
    DOM.waterChange = document.getElementById('waterChange');
    DOM.boneChange = document.getElementById('boneChange');
    DOM.bmiCategory = document.getElementById('bmiCategory');
    
    // Configuración
    DOM.calorieGoalInput = document.getElementById('calorieGoalInput');
    DOM.proteinGoalInput = document.getElementById('proteinGoalInput');
    DOM.waterGoalInput = document.getElementById('waterGoalInput');
    DOM.saveGoalsBtn = document.getElementById('saveGoalsBtn');
    DOM.startTestBtn = document.getElementById('startTestBtn');
    DOM.editProfileBtn = document.getElementById('editProfileBtn');
    
    // Modal de test
    DOM.testModal = document.getElementById('testModal');
    DOM.testContent = document.getElementById('testContent');
    DOM.testPrevBtn = document.getElementById('testPrevBtn');
    DOM.testNextBtn = document.getElementById('testNextBtn');
    DOM.testProgressFill = document.getElementById('testProgressFill');
    DOM.currentQuestion = document.getElementById('currentQuestion');
    DOM.totalQuestions = document.getElementById('totalQuestions');
    
    // Modal de perfil
    DOM.profileModal = document.getElementById('profileModal');
    
    // IA Coach
    DOM.chatMessages = document.getElementById('chatMessages');
    DOM.chatInput = document.getElementById('chatInput');
    DOM.sendMessageBtn = document.getElementById('sendMessageBtn');
    DOM.clearChatBtn = document.getElementById('clearChatBtn');
    DOM.saveChatBtn = document.getElementById('saveChatBtn');
    DOM.generatePlanBtn = document.getElementById('generatePlanBtn');
    DOM.recommendationsList = document.getElementById('recommendationsList');
    
    // Modal
    DOM.confirmModal = document.getElementById('confirmModal');
    DOM.modalTitle = document.getElementById('modalTitle');
    DOM.modalMessage = document.getElementById('modalMessage');
    DOM.modalConfirm = document.getElementById('modalConfirm');
    DOM.modalCancel = document.getElementById('modalCancel');
    DOM.modalClose = document.querySelector('.modal-close');
    
    // Elementos de entrenamiento
    DOM.exerciseName = document.getElementById('exerciseName');
    DOM.exerciseSets = document.getElementById('exerciseSets');
    DOM.exerciseReps = document.getElementById('exerciseReps');
    DOM.exerciseWeight = document.getElementById('exerciseWeight');
    DOM.exerciseRest = document.getElementById('exerciseRest');
    DOM.exerciseNotes = document.getElementById('exerciseNotes');
    DOM.exerciseDateInput = document.getElementById('exerciseDateInput');
    DOM.addExerciseBtn = document.getElementById('addExerciseBtn');
    DOM.finishWorkoutBtn = document.getElementById('finishWorkoutBtn');
    DOM.exercisesListContainer = document.getElementById('exercisesListContainer');
    DOM.dayExercisesContainer = document.getElementById('dayExercisesContainer');
    
    // Elementos de objetivo
    DOM.daysRemaining = document.getElementById('daysRemaining');
    DOM.currentWeightGoal = document.getElementById('currentWeightGoal');
    DOM.weightRemaining = document.getElementById('weightRemaining');
    DOM.goalProgressBar = document.getElementById('goalProgressBar');
    DOM.goalProgressPercent = document.getElementById('goalProgressPercent');
    
    // Elementos IA
    DOM.analyzeMealBtn = document.getElementById('analyzeMealBtn');
    DOM.aiAnalysisResult = document.getElementById('aiAnalysisResult');
}

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
                    
                    // Actualizar atributo hidden para accesibilidad
                    contentSections.forEach(s => s.setAttribute('hidden', 'true'));
                    section.removeAttribute('hidden');
                    
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
            renderCalendar();
            renderMealsForSelectedDate();
            renderExercisesForSelectedDate();
            break;
        case 'workout':
            renderExercisesList();
            updateWorkoutGoal();
            break;
        case 'body':
            updateBiometryDisplay();
            updateWeightChart();
            updateBodyCompositionChart();
            renderBiometryHistory();
            break;
        case 'dashboard':
            updateDashboard();
            updateWeightChart();
            break;
        case 'coach':
            updateCoachRecommendations();
            break;
        case 'settings':
            // Cargar valores actuales en los inputs
            if (DOM.calorieGoalInput) DOM.calorieGoalInput.value = calorieGoal;
            if (DOM.proteinGoalInput) DOM.proteinGoalInput.value = proteinGoal;
            if (DOM.waterGoalInput) DOM.waterGoalInput.value = waterGoal;
            updateUserProfileDisplay();
            break;
    }
}

/**********************
 * CALENDARIO PARA COMIDAS
 **********************/
function renderCalendar() {
    if (!DOM.calendarDays) return;
    
    const now = new Date();
    const currentMonth = currentCalendarMonth || now.getMonth();
    const currentYear = currentCalendarYear || now.getFullYear();
    
    // Actualizar mes/año en pantalla
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    if (DOM.currentMonthYear) {
        DOM.currentMonthYear.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    // Primer día del mes
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Último día del mes
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    // Días en el mes
    const daysInMonth = lastDay.getDate();
    // Día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
    const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    let calendarHTML = '';
    
    // Espacios vacíos antes del primer día
    for (let i = 0; i < firstDayIndex; i++) {
        calendarHTML += '<div class="calendar-day empty"></div>';
    }
    
    // Días del mes
    const today = new Date().toISOString().split('T')[0];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayMeals = meals.filter(meal => meal.date === dateStr);
        const dayExercises = exercises.filter(ex => ex.date === dateStr);
        const hasData = dayMeals.length > 0 || dayExercises.length > 0;
        const isToday = dateStr === today;
        const isSelected = dateStr === selectedCalendarDate;
        
        let dayClass = 'calendar-day';
        if (isToday) dayClass += ' today';
        if (isSelected) dayClass += ' selected';
        if (hasData) dayClass += ' has-data';
        
        calendarHTML += `
            <div class="${dayClass}" data-date="${dateStr}" onclick="selectCalendarDate('${dateStr}')">
                <div class="day-number">${day}</div>
                ${hasData ? '<div class="day-indicator"></div>' : ''}
            </div>
        `;
    }
    
    DOM.calendarDays.innerHTML = calendarHTML;
    
    // Actualizar información de fecha seleccionada
    updateSelectedDateInfo();
}

function selectCalendarDate(dateStr) {
    selectedCalendarDate = dateStr;
    renderCalendar();
    renderMealsForSelectedDate();
    renderExercisesForSelectedDate();
    
    // Actualizar inputs de fecha en formularios
    if (DOM.mealDateInput) DOM.mealDateInput.value = dateStr;
    if (DOM.exerciseDateInput) DOM.exerciseDateInput.value = dateStr;
    if (DOM.bodyDateInput) DOM.bodyDateInput.value = dateStr;
}

function updateSelectedDateInfo() {
    if (!DOM.selectedDateText || !DOM.selectedDateStats) return;
    
    const date = new Date(selectedCalendarDate);
    const today = new Date().toISOString().split('T')[0];
    
    // Formatear fecha
    const formattedDate = date.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    DOM.selectedDateText.textContent = selectedCalendarDate === today ? 'Hoy' : formattedDate;
    
    // Obtener datos del día
    const dayMeals = meals.filter(meal => meal.date === selectedCalendarDate);
    const dayExercises = exercises.filter(ex => ex.date === selectedCalendarDate);
    
    const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    
    DOM.selectedDateStats.innerHTML = `
        ${dayMeals.length} comidas • ${dayExercises.length} ejercicios<br>
        ${totalCalories} kcal • ${totalProtein}g proteína
    `;
}

function navigateCalendarMonth(direction) {
    const now = new Date();
    let currentMonth = currentCalendarMonth || now.getMonth();
    let currentYear = currentCalendarYear || now.getFullYear();
    
    if (direction === 'next') {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    } else if (direction === 'prev') {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
    }
    
    currentCalendarMonth = currentMonth;
    currentCalendarYear = currentYear;
    renderCalendar();
}

function renderMealsForSelectedDate() {
    if (!DOM.mealsListContainer) return;
    
    const dayMeals = meals.filter(meal => meal.date === selectedCalendarDate);
    
    if (dayMeals.length === 0) {
        DOM.mealsListContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>No hay comidas registradas este día</p>
                <small>¡Añade una nueva comida!</small>
            </div>
        `;
    } else {
        // Ordenar por hora (más reciente primero)
        dayMeals.sort((a, b) => b.timestamp - a.timestamp);
        
        DOM.mealsListContainer.innerHTML = dayMeals.map(meal => `
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
    }
    
    // Actualizar totales del día
    updateDayTotals();
}

function renderExercisesForSelectedDate() {
    if (!DOM.dayExercisesContainer) return;
    
    const dayExercises = exercises.filter(ex => ex.date === selectedCalendarDate);
    
    if (dayExercises.length === 0) {
        DOM.dayExercisesContainer.innerHTML = `
            <div class="empty-state small">
                <i class="fas fa-dumbbell"></i>
                <p>No hay ejercicios registrados</p>
            </div>
        `;
    } else {
        DOM.dayExercisesContainer.innerHTML = dayExercises.map(ex => `
            <div class="exercise-item">
                <div class="exercise-name">${ex.name}</div>
                <div class="exercise-details">
                    ${ex.sets} × ${ex.reps}${ex.weight > 0 ? ` @ ${ex.weight}kg` : ''}
                </div>
            </div>
        `).join('');
    }
}

function updateDayTotals() {
    const dayMeals = meals.filter(meal => meal.date === selectedCalendarDate);
    
    const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    const totalCarbs = dayMeals.reduce((sum, meal) => sum + meal.carbs, 0);
    const totalFat = dayMeals.reduce((sum, meal) => sum + meal.fat, 0);
    
    if (DOM.totalCaloriesDay) DOM.totalCaloriesDay.textContent = totalCalories;
    if (DOM.totalProteinDay) DOM.totalProteinDay.textContent = `${totalProtein}g`;
    if (DOM.totalCarbsDay) DOM.totalCarbsDay.textContent = `${totalCarbs}g`;
    if (DOM.totalFatDay) DOM.totalFatDay.textContent = `${totalFat}g`;
}

/**********************
 * ANÁLISIS DE COMIDA CON IA - SISTEMA MEJORADO
 **********************/
function analyzeMealWithAI() {
    const description = DOM.mealDescription?.value.trim();
    
    if (!description || description.length < 5) {
        showToast('Por favor, describe tu comida con más detalle (ej: "kebab con salsa, arroz blanco con maíz")', 'warning');
        return;
    }
    
    // Mostrar indicador de carga
    showAILoading(true);
    
    // Simular procesamiento de IA
    setTimeout(() => {
        const analysis = analyzeFoodDescription(description);
        showAIAnalysis(analysis);
        showAILoading(false);
    }, 1200);
}

function analyzeFoodDescription(description) {
    const text = description.toLowerCase();
    
    // Detectar alimentos y cantidades
    const detectedFoods = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    // Primero, buscar alimentos compuestos
    const compoundFoods = findCompoundFoods(text);
    if (compoundFoods.length > 0) {
        compoundFoods.forEach(food => {
            detectedFoods.push(food);
            totalCalories += food.calories;
            totalProtein += food.protein;
            totalCarbs += food.carbs;
            totalFat += food.fat;
        });
    }
    
    // Si no se encontraron alimentos compuestos, buscar ingredientes individuales
    if (detectedFoods.length === 0) {
        const ingredients = findIngredients(text);
        ingredients.forEach(ingredient => {
            detectedFoods.push(ingredient);
            totalCalories += ingredient.calories;
            totalProtein += ingredient.protein;
            totalCarbs += ingredient.carbs;
            totalFat += ingredient.fat;
        });
    }
    
    // Ajustar basado en palabras clave de tamaño y cantidad
    const sizeMultiplier = detectSizeMultiplier(text);
    totalCalories *= sizeMultiplier;
    totalProtein *= sizeMultiplier;
    totalCarbs *= sizeMultiplier;
    totalFat *= sizeMultiplier;
    
    // Aplicar modificadores de preparación
    const prepMultiplier = detectPreparationMultiplier(text);
    totalCalories *= prepMultiplier;
    totalFat *= prepMultiplier; // La preparación afecta principalmente a las grasas
    
    // Determinar confianza
    let confidence = 'low';
    if (detectedFoods.length >= 3) {
        confidence = 'high';
    } else if (detectedFoods.length >= 1) {
        confidence = 'medium';
    }
    
    return {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        detectedFoods: detectedFoods,
        confidence: confidence
    };
}

function findCompoundFoods(text) {
    const compoundPatterns = [
        // Kebab patterns
        { pattern: /kebab|döner|shwarma/i, name: 'Kebab/Döner', calories: 850, protein: 45, carbs: 80, fat: 35 },
        { pattern: /kebab con salsa/i, name: 'Kebab con salsa', calories: 900, protein: 45, carbs: 85, fat: 38 },
        { pattern: /kebab con salsa de yogur/i, name: 'Kebab con salsa de yogur', calories: 920, protein: 46, carbs: 85, fat: 39 },
        { pattern: /kebab con arroz y ensalada/i, name: 'Kebab completo', calories: 1100, protein: 55, carbs: 120, fat: 42 },
        
        // Arroz patterns
        { pattern: /arroz blanco con ma[íi]z/i, name: 'Arroz con maíz', calories: 250, protein: 5, carbs: 55, fat: 2 },
        { pattern: /arroz con pollo/i, name: 'Arroz con pollo', calories: 450, protein: 30, carbs: 50, fat: 12 },
        { pattern: /arroz tres delicias/i, name: 'Arroz tres delicias', calories: 350, protein: 8, carbs: 70, fat: 5 },
        { pattern: /arroz frito/i, name: 'Arroz frito', calories: 400, protein: 10, carbs: 65, fat: 12 },
        
        // Ensalada patterns
        { pattern: /ensalada de lechuga, pepino, cebolla y tomate/i, name: 'Ensalada mixta', calories: 120, protein: 4, carbs: 20, fat: 3 },
        { pattern: /ensalada mixta/i, name: 'Ensalada mixta', calories: 150, protein: 6, carbs: 15, fat: 8 },
        { pattern: /ensalada cesar/i, name: 'Ensalada César', calories: 350, protein: 18, carbs: 12, fat: 25 },
        { pattern: /ensalada griega/i, name: 'Ensalada griega', calories: 280, protein: 12, carbs: 18, fat: 18 },
        
        // Sandwich patterns
        { pattern: /s[áa]ndwich de jam[óo]n y queso/i, name: 'Sándwich jamón y queso', calories: 400, protein: 22, carbs: 40, fat: 18 },
        { pattern: /bocadillo de tortilla/i, name: 'Bocadillo de tortilla', calories: 450, protein: 25, carbs: 45, fat: 20 },
        { pattern: /bocadillo de pollo/i, name: 'Bocadillo de pollo', calories: 500, protein: 35, carbs: 45, fat: 20 },
        
        // Pasta patterns
        { pattern: /pasta carbonara/i, name: 'Pasta carbonara', calories: 650, protein: 20, carbs: 75, fat: 30 },
        { pattern: /pasta bolo[ñn]esa/i, name: 'Pasta boloñesa', calories: 550, protein: 25, carbs: 70, fat: 18 },
        { pattern: /pasta con tomate/i, name: 'Pasta con tomate', calories: 400, protein: 12, carbs: 70, fat: 8 },
        
        // Comidas rápidas
        { pattern: /hamburguesa con patatas/i, name: 'Hamburguesa con patatas', calories: 850, protein: 40, carbs: 80, fat: 40 },
        { pattern: /pizza margarita/i, name: 'Pizza margarita', calories: 800, protein: 30, carbs: 100, fat: 25 },
        { pattern: /burrito de pollo/i, name: 'Burrito de pollo', calories: 700, protein: 35, carbs: 75, fat: 25 },
        
        // Comidas típicas
        { pattern: /paella/i, name: 'Paella', calories: 600, protein: 35, carbs: 75, fat: 15 },
        { pattern: /tortilla de patatas/i, name: 'Tortilla de patatas', calories: 350, protein: 20, carbs: 30, fat: 18 },
        { pattern: /lentejas estofadas/i, name: 'Lentejas estofadas', calories: 400, protein: 25, carbs: 60, fat: 8 }
    ];
    
    const foundFoods = [];
    
    compoundPatterns.forEach(pattern => {
        if (pattern.pattern.test(text)) {
            foundFoods.push({
                name: pattern.name,
                quantity: 1,
                calories: pattern.calories,
                protein: pattern.protein,
                carbs: pattern.carbs,
                fat: pattern.fat
            });
        }
    });
    
    return foundFoods;
}

function findIngredients(text) {
    const words = text.split(/[,\s]+/);
    const detectedIngredients = [];
    
    // Buscar cada palabra en la base de datos
    for (const [foodName, foodData] of Object.entries(enhancedFoodDatabase)) {
        // Verificar si el nombre del alimento está en el texto
        const regex = new RegExp(`\\b${foodName}\\b`, 'i');
        if (regex.test(text)) {
            // Buscar cantidad antes del alimento
            let quantity = 1;
            const foodIndex = words.findIndex(w => w.toLowerCase().includes(foodName));
            
            if (foodIndex > 0) {
                const prevWord = words[foodIndex - 1].toLowerCase();
                if (foodKeywords[prevWord]) {
                    quantity = foodKeywords[prevWord];
                } else if (!isNaN(parseFloat(prevWord))) {
                    quantity = parseFloat(prevWord);
                }
            }
            
            // Buscar cantidad después del alimento
            if (foodIndex < words.length - 1) {
                const nextWord = words[foodIndex + 1].toLowerCase();
                if (foodKeywords[nextWord] && !isNaN(parseFloat(words[foodIndex]))) {
                    quantity = parseFloat(words[foodIndex]);
                }
            }
            
            detectedIngredients.push({
                name: foodName,
                quantity: quantity,
                calories: Math.round(foodData.calories * quantity),
                protein: Math.round(foodData.protein * quantity * 10) / 10,
                carbs: Math.round(foodData.carbs * quantity * 10) / 10,
                fat: Math.round(foodData.fat * quantity * 10) / 10
            });
        }
    }
    
    return detectedIngredients;
}

function detectSizeMultiplier(text) {
    let multiplier = 1;
    
    if (text.includes('pequeño') || text.includes('pequeña') || text.includes('pequeños') || text.includes('pequeñas')) {
        multiplier = 0.7;
    } else if (text.includes('mediano') || text.includes('mediana') || text.includes('medianos') || text.includes('medianas')) {
        multiplier = 1;
    } else if (text.includes('grande') || text.includes('grandes') || text.includes('extra grande') || text.includes('extra grandes')) {
        multiplier = 1.3;
    } else if (text.includes('doble') || text.includes('triple') || text.includes('extra')) {
        multiplier = text.includes('triple') ? 2 : 1.5;
    }
    
    return multiplier;
}

function detectPreparationMultiplier(text) {
    let multiplier = 1;
    
    for (const [prep, mod] of Object.entries(preparationModifiers)) {
        if (text.includes(prep)) {
            multiplier *= mod;
        }
    }
    
    return multiplier;
}

function showAILoading(show) {
    const analyzeBtn = DOM.analyzeMealBtn;
    const analysisContainer = DOM.aiAnalysisResult;
    
    if (!analysisContainer || !analyzeBtn) return;
    
    if (show) {
        analyzeBtn.classList.add('analyzing');
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizando...';
        
        analysisContainer.innerHTML = `
            <div class="ai-loading">
                <div class="spinner"></div>
                <span>Analizando tu comida con IA...</span>
            </div>
        `;
        analysisContainer.style.display = 'block';
    } else {
        analyzeBtn.classList.remove('analyzing');
        analyzeBtn.innerHTML = '<i class="fas fa-robot"></i> Analizar';
    }
}

function showAIAnalysis(analysis) {
    const analysisContainer = DOM.aiAnalysisResult;
    if (!analysisContainer) return;
    
    let detailsHTML = '';
    if (analysis.detectedFoods && analysis.detectedFoods.length > 0) {
        detailsHTML = `
            <div class="ai-detected-foods">
                <p><strong>🍽️ Alimentos detectados:</strong></p>
                <ul>
                    ${analysis.detectedFoods.map(food => `
                        <li><strong>${food.name}</strong>${food.quantity > 1 ? ` (x${food.quantity})` : ''}: 
                            ${food.calories} kcal, ${food.protein}g P, ${food.carbs}g C, ${food.fat}g G</li>
                    `).join('')}
                </ul>
                <p><small>Total calculado: ${analysis.calories} kcal</small></p>
            </div>
        `;
    }
    
    const confidenceBadge = analysis.confidence === 'high' ? 
        '<span class="confidence-badge high">✓ Alta precisión</span>' :
        analysis.confidence === 'medium' ?
        '<span class="confidence-badge medium">⚠ Estimación media</span>' :
        '<span class="confidence-badge low">? Estimación general</span>';
    
    analysisContainer.innerHTML = `
        <h4><i class="fas fa-brain"></i> Análisis IA ${confidenceBadge}</h4>
        <div class="ai-suggestions">
            <p>Valores nutricionales sugeridos:</p>
            <div class="ai-values">
                <span>🔥 Calorías: <strong id="aiCalories">${analysis.calories}</strong> kcal</span>
                <span>💪 Proteína: <strong id="aiProtein">${analysis.protein}</strong> g</span>
                <span>🌾 Carbohidratos: <strong id="aiCarbs">${analysis.carbs}</strong> g</span>
                <span>🥓 Grasas: <strong id="aiFat">${analysis.fat}</strong> g</span>
            </div>
            ${detailsHTML}
            <div class="ai-actions">
                <button id="applyAiValues" class="secondary-btn small-btn">
                    <i class="fas fa-check"></i> Aplicar valores
                </button>
                <button id="retryAnalysis" class="secondary-btn small-btn">
                    <i class="fas fa-redo"></i> Re-analizar
                </button>
            </div>
        </div>
    `;
    
    analysisContainer.style.display = 'block';
    
    // Configurar eventos de los botones
    document.getElementById('applyAiValues').addEventListener('click', () => {
        applyAIAnalysis(analysis);
    });
    
    document.getElementById('retryAnalysis').addEventListener('click', analyzeMealWithAI);
}

function applyAIAnalysis(analysis) {
    // Aplicar valores a los campos del formulario
    if (DOM.mealCaloriesInput) DOM.mealCaloriesInput.value = analysis.calories;
    if (DOM.mealProteinInput) DOM.mealProteinInput.value = analysis.protein;
    if (DOM.mealCarbsInput) DOM.mealCarbsInput.value = analysis.carbs;
    if (DOM.mealFatInput) DOM.mealFatInput.value = analysis.fat;
    
    // Generar nombre automático si no hay
    if (DOM.mealNameInput && !DOM.mealNameInput.value.trim()) {
        const detectedNames = analysis.detectedFoods.map(f => f.name);
        if (detectedNames.length > 0) {
            const mainFoods = detectedNames.slice(0, 3).join(' + ');
            DOM.mealNameInput.value = `Comida: ${mainFoods}`;
        }
    }
    
    // Ocultar el panel de análisis
    DOM.aiAnalysisResult.style.display = 'none';
    
    showToast('✅ Valores de IA aplicados al formulario', 'success');
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
    const date = DOM.mealDateInput?.value || selectedCalendarDate;
    
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
        date: date,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().getTime()
    };
    
    meals.push(meal);
    renderMealsForSelectedDate();
    updateDashboard();
    saveToLocalStorage();
    
    // Limpiar formulario
    if (DOM.mealNameInput) DOM.mealNameInput.value = '';
    if (DOM.mealDescription) DOM.mealDescription.value = '';
    if (DOM.mealCaloriesInput) DOM.mealCaloriesInput.value = '';
    if (DOM.mealProteinInput) DOM.mealProteinInput.value = '';
    if (DOM.mealCarbsInput) DOM.mealCarbsInput.value = '';
    if (DOM.mealFatInput) DOM.mealFatInput.value = '';
    
    // Ocultar análisis IA
    if (DOM.aiAnalysisResult) {
        DOM.aiAnalysisResult.style.display = 'none';
    }
    
    showToast(`✅ ${name} añadido correctamente`);
}

function deleteMeal(mealId) {
    showConfirm('¿Eliminar esta comida?', () => {
        meals = meals.filter(meal => meal.id !== mealId);
        renderMealsForSelectedDate();
        updateDashboard();
        saveToLocalStorage();
        showToast('🗑️ Comida eliminada');
    });
}

/**********************
 * BIOMETRÍA EXPANDIDA
 **********************/
function saveBiometrics() {
    const weight = parseFloat(DOM.bodyWeight?.value);
    const fat = parseFloat(DOM.bodyFat?.value);
    const muscle = parseFloat(DOM.bodyMusclePercent?.value);
    const water = parseFloat(DOM.bodyWater?.value);
    const bone = parseFloat(DOM.bodyBone?.value);
    const date = DOM.bodyDateInput?.value || new Date().toISOString().split('T')[0];
    
    if (!weight || weight <= 0) {
        showToast('Por favor, ingresa tu peso', 'error');
        return;
    }
    
    // Calcular IMC (peso en kg / (altura en m)^2)
    const heightInMeters = userProfile.height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    const biometricData = {
        date: date,
        weight,
        fat: fat || 0,
        muscle: muscle || 0,
        water: water || 60,
        bone: bone || 3,
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
    userBiometrics.water = water || 60;
    userBiometrics.bone = bone || 3;
    
    updateBiometryDisplay();
    updateWeightChart();
    updateBodyCompositionChart();
    updateWorkoutGoal();
    saveToLocalStorage();
    
    // Limpiar formulario
    if (DOM.bodyWeight) DOM.bodyWeight.value = '';
    if (DOM.bodyFat) DOM.bodyFat.value = '';
    if (DOM.bodyMusclePercent) DOM.bodyMusclePercent.value = '';
    if (DOM.bodyWater) DOM.bodyWater.value = '';
    if (DOM.bodyBone) DOM.bodyBone.value = '';
    
    showToast('✅ Biometría guardada correctamente');
}

function calculateBodyComposition() {
    // Calculadora automática basada en peso y altura
    const weight = parseFloat(DOM.bodyWeight?.value);
    const height = userProfile.height / 100; // en metros
    
    if (!weight || weight <= 0) {
        showToast('Ingresa tu peso primero', 'warning');
        return;
    }
    
    // Fórmulas aproximadas (simplificadas)
    const bmi = weight / (height * height);
    
    // Estimaciones basadas en IMC
    let fat, muscle, water, bone;
    
    if (bmi < 18.5) {
        fat = 10 + (Math.random() * 5); // 10-15%
        muscle = 40 + (Math.random() * 5); // 40-45%
    } else if (bmi < 25) {
        fat = 15 + (Math.random() * 10); // 15-25%
        muscle = 35 + (Math.random() * 5); // 35-40%
    } else if (bmi < 30) {
        fat = 25 + (Math.random() * 10); // 25-35%
        muscle = 30 + (Math.random() * 5); // 30-35%
    } else {
        fat = 30 + (Math.random() * 15); // 30-45%
        muscle = 25 + (Math.random() * 5); // 25-30%
    }
    
    // Agua y huesos relativamente constantes
    water = 55 + (Math.random() * 10); // 55-65%
    bone = (weight * 0.15).toFixed(1); // Aprox 15% del peso
    
    // Llenar campos
    if (DOM.bodyFat) DOM.bodyFat.value = fat.toFixed(1);
    if (DOM.bodyMusclePercent) DOM.bodyMusclePercent.value = muscle.toFixed(1);
    if (DOM.bodyWater) DOM.bodyWater.value = water.toFixed(1);
    if (DOM.bodyBone) DOM.bodyBone.value = bone;
    
    showToast('📊 Valores calculados automáticamente', 'info');
}

function updateBiometryDisplay() {
    if (userBiometrics.history && userBiometrics.history.length > 0) {
        const latest = userBiometrics.history[userBiometrics.history.length - 1];
        
        // Actualizar valores principales
        if (DOM.currentWeight) DOM.currentWeight.textContent = `${latest.weight.toFixed(1)} kg`;
        if (DOM.currentFat) DOM.currentFat.textContent = `${latest.fat.toFixed(1)}%`;
        if (DOM.currentBMI) DOM.currentBMI.textContent = latest.bmi.toFixed(1);
        if (DOM.currentMusclePercent) DOM.currentMusclePercent.textContent = `${latest.muscle.toFixed(1)}%`;
        if (DOM.currentWater) DOM.currentWater.textContent = `${latest.water.toFixed(1)}%`;
        if (DOM.currentBone) DOM.currentBone.textContent = `${latest.bone.toFixed(1)} kg`;
        
        // Calcular cambios desde la última medición
        if (userBiometrics.history.length >= 2) {
            const previous = userBiometrics.history[userBiometrics.history.length - 2];
            
            updateChangeDisplay(DOM.weightChange, latest.weight - previous.weight, 'kg');
            updateChangeDisplay(DOM.fatChange, latest.fat - previous.fat, '%');
            updateChangeDisplay(DOM.muscleChange, latest.muscle - previous.muscle, '%');
            updateChangeDisplay(DOM.waterChange, latest.water - previous.water, '%');
            updateChangeDisplay(DOM.boneChange, latest.bone - previous.bone, 'kg');
        } else {
            // Si es la primera medición
            const elements = [DOM.weightChange, DOM.fatChange, DOM.muscleChange, DOM.waterChange, DOM.boneChange];
            elements.forEach(el => {
                if (el) el.textContent = 'Primera medición';
            });
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
} else {
    // Si no hay datos
    if (DOM.currentWeight) DOM.currentWeight.textContent = '-- kg';
    if (DOM.currentFat) DOM.currentFat.textContent = '--%';
    if (DOM.currentBMI) DOM.currentBMI.textContent = '--';
    if (DOM.currentMusclePercent) DOM.currentMusclePercent.textContent = '--%';
    if (DOM.currentWater) DOM.currentWater.textContent = '--%';
    if (DOM.currentBone) DOM.currentBone.textContent = '-- kg';

    if (DOM.weightChange) DOM.weightChange.textContent = 'Sin datos';
    if (DOM.fatChange) DOM.fatChange.textContent = 'Sin datos';
    if (DOM.muscleChange) DOM.muscleChange.textContent = 'Sin datos';
    if (DOM.waterChange) DOM.waterChange.textContent = 'Sin datos';
    if (DOM.boneChange) DOM.boneChange.textContent = 'Sin datos';

    if (DOM.bmiCategory) DOM.bmiCategory.textContent = '--';
}

        
        for (const [element, value] of Object.entries(elements)) {
            if (window[element]) window[element].textContent = value;
        }
    }


function updateChangeDisplay(element, change, unit) {
    if (!element) return;
    
    const absChange = Math.abs(change);
    const arrow = change >= 0 ? 'arrow-up' : 'arrow-down';
    const color = change >= 0 ? 
        (unit === 'kg' && element === DOM.weightChange ? '#ef4444' : '#10b981') : 
        (unit === 'kg' && element === DOM.weightChange ? '#10b981' : '#ef4444');
    
    element.innerHTML = `
        <i class="fas fa-${arrow}"></i>
        ${absChange.toFixed(1)}${unit} desde última medición
    `;
    element.style.color = color;
}

function updateBodyCompositionChart() {
    const canvas = document.getElementById('bodyCompositionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (biometryChart) {
        biometryChart.destroy();
    }
    
    if (!userBiometrics.history || userBiometrics.history.length === 0) {
        // Mostrar mensaje de no datos
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '16px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('No hay datos biométricos', canvas.width/2, canvas.height/2);
        return;
    }
    
    const latest = userBiometrics.history[userBiometrics.history.length - 1];
    
    // Calcular composición (simplificado)
    const muscleMass = (latest.weight * latest.muscle) / 100;
    const fatMass = (latest.weight * latest.fat) / 100;
    const waterMass = (latest.weight * latest.water) / 100;
    const boneMass = latest.bone;
    const otherMass = latest.weight - (muscleMass + fatMass + waterMass + boneMass);
    
    biometryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Músculo', 'Grasa', 'Agua', 'Huesos', 'Otros'],
            datasets: [{
                data: [muscleMass, fatMass, waterMass, boneMass, otherMass],
                backgroundColor: [
                    '#4CAF50', // Músculo - verde
                    '#FF5252', // Grasa - rojo
                    '#2196F3', // Agua - azul
                    '#FF9800', // Huesos - naranja
                    '#9E9E9E'  // Otros - gris
                ],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e2e8f0',
                        font: {
                            size: 12
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / latest.weight) * 100).toFixed(1);
                            return `${context.label}: ${value.toFixed(1)}kg (${percentage}%)`;
                        }
                    },
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#cbd5e1'
                }
            }
        }
    });
}

function renderBiometryHistory() {
    const container = document.getElementById('biometryHistoryContainer');
    if (!container) return;
    
    if (!userBiometrics.history || userBiometrics.history.length === 0) {
        container.innerHTML = '<p class="empty-history">No hay mediciones registradas</p>';
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    const sortedHistory = [...userBiometrics.history].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    container.innerHTML = sortedHistory.map((record, index) => {
        const date = new Date(record.date);
        const formattedDate = date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        
        return `
            <div class="biometry-record">
                <div class="record-date">
                    <strong>${formattedDate}</strong>
                    ${index === 0 ? '<span class="latest-badge">ÚLTIMO</span>' : ''}
                </div>
                <div class="record-stats">
                    <span class="stat-item">📊 ${record.weight} kg</span>
                    <span class="stat-item">📈 ${record.bmi} IMC</span>
                    <span class="stat-item">💪 ${record.muscle}% músculo</span>
                    <span class="stat-item">📉 ${record.fat}% grasa</span>
                    <span class="stat-item">💧 ${record.water}% agua</span>
                </div>
            </div>
        `;
    }).join('');
}

/**********************
 * IA COACH FUNCIONAL
 **********************/
function setupIACoach() {
    // Configurar opciones del coach
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const option = card.getAttribute('data-option');
            selectCoachOption(option);
        });
    });
    
    // Configurar botón de enviar mensaje
    if (DOM.sendMessageBtn) {
        DOM.sendMessageBtn.addEventListener('click', sendCoachMessage);
    }
    
    // Configurar entrada con Enter
    if (DOM.chatInput) {
        DOM.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendCoachMessage();
            }
        });
    }
    
    // Configurar preguntas rápidas
    const quickQuestions = document.querySelectorAll('.quick-question');
    quickQuestions.forEach(button => {
        button.addEventListener('click', () => {
            const question = button.getAttribute('data-question');
            if (DOM.chatInput) {
                DOM.chatInput.value = question;
                sendCoachMessage();
            }
        });
    });
    
    // Configurar botón de generar plan
    if (DOM.generatePlanBtn) {
        DOM.generatePlanBtn.addEventListener('click', generatePersonalizedPlan);
    }
    
    // Configurar botón de limpiar chat
    if (DOM.clearChatBtn) {
        DOM.clearChatBtn.addEventListener('click', () => {
            if (DOM.chatMessages) {
                // Mantener solo el primer mensaje del sistema
                const systemMessage = DOM.chatMessages.querySelector('.message.ai');
                DOM.chatMessages.innerHTML = '';
                if (systemMessage) {
                    DOM.chatMessages.appendChild(systemMessage);
                }
                showToast('Chat limpiado', 'info');
            }
        });
    }
}

function selectCoachOption(option) {
    let message = '';
    
    switch(option) {
        case 'diet':
            message = 'Necesito ayuda con mi dieta. ';
            break;
        case 'exercise':
            message = 'Necesito ayuda con ejercicio y rutinas. ';
            break;
        case 'supplements':
            message = 'Quiero información sobre suplementos. ';
            break;
        case 'motivation':
            message = 'Necesito motivación y consejos. ';
            break;
        case 'planning':
            message = 'Necesito ayuda para planificar mis objetivos. ';
            break;
        case 'recovery':
            message = 'Necesito consejos sobre recuperación. ';
            break;
    }
    
    if (DOM.chatInput) {
        DOM.chatInput.value = message;
        DOM.chatInput.focus();
    }
}

function sendCoachMessage() {
    if (!DOM.chatInput || !DOM.chatMessages) return;
    
    const message = DOM.chatInput.value.trim();
    if (!message) return;
    
    // Añadir mensaje del usuario
    addMessageToChat(message, 'user');
    
    // Limpiar input
    DOM.chatInput.value = '';
    
    // Mostrar indicador de "escribiendo"
    showTypingIndicator();
    
    // Simular respuesta de IA después de un delay
    setTimeout(() => {
        removeTypingIndicator();
        const response = generateCoachResponse(message);
        addMessageToChat(response, 'ai');
    }, 1500);
}

function addMessageToChat(message, sender) {
    if (!DOM.chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (sender === 'user') {
        messageDiv.innerHTML = `
            <div class="message-content user">
                <div class="message-text">${message}</div>
                <div class="message-time">${timeString}</div>
            </div>
            <div class="message-avatar">👤</div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="message-text">${message}</div>
                <div class="message-time">${timeString}</div>
            </div>
        `;
    }
    
    DOM.chatMessages.appendChild(messageDiv);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

function showTypingIndicator() {
    if (!DOM.chatMessages) return;
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="message-text">
                <span class="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                </span>
            </div>
        </div>
    `;
    
    DOM.chatMessages.appendChild(typingDiv);
    DOM.chatMessages.scrollTop = DOM.chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function generateCoachResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Respuestas basadas en categorías
    if (message.includes('dieta') || message.includes('comida') || message.includes('nutrición') || message.includes('aliment')) {
        return generateDietResponse(message);
    } else if (message.includes('ejercicio') || message.includes('rutina') || message.includes('entrenamiento') || message.includes('gimnasio')) {
        return generateExerciseResponse(message);
    } else if (message.includes('suplemento') || message.includes('proteína') || message.includes('creatina') || message.includes('vitamina')) {
        return generateSupplementResponse(message);
    } else if (message.includes('motivación') || message.includes('ánimo') || message.includes('desanimado') || message.includes('constante')) {
        return generateMotivationResponse(message);
    } else if (message.includes('objetivo') || message.includes('meta') || message.includes('plan') || message.includes('progreso')) {
        return generatePlanningResponse(message);
    } else if (message.includes('recuperación') || message.includes('descanso') || message.includes('sueño') || message.includes('lesión')) {
        return generateRecoveryResponse(message);
    } else {
        return generateGeneralResponse(message);
    }
}

function generateDietResponse(message) {
    const responses = [
        `Basándome en tu objetivo de ${userProfile.goal === 'gain' ? 'ganar músculo' : userProfile.goal === 'lose' ? 'perder grasa' : 'mantener peso'}, te recomiendo:\n\n• ${userProfile.goal === 'gain' ? 'Superávit calórico de 300-500 kcal diarias' : userProfile.goal === 'lose' ? 'Déficit calórico de 300-500 kcal diarias' : 'Mantenimiento calórico'}\n• ${proteinGoal}g de proteína diaria (1.6-2.2g por kg)\n• 5 comidas al día para mejor distribución\n• Hidratación constante (${waterGoal}ml mínimo)`,
        
        `Para optimizar tu dieta:\n\n1. Desayuno rico en proteínas (huevos, yogurt griego)\n2. Almuerzo equilibrado (proteína + carbohidratos complejos + vegetales)\n3. Cena ligera con proteína y vegetales\n4. 2 snacks proteicos entre comidas\n5. Evitar alimentos procesados y azúcares refinados`,
        
        `Recomendaciones específicas para tu nivel ${userProfile.level}:\n\n• Principiante: Enfoque en consistencia, no en perfección\n• Intermedio: Ajusta macros según progreso semanal\n• Avanzado: Ciclización de carbohidratos según entrenamiento`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function generateExerciseResponse(message) {
    const levelRoutines = {
        'beginner': 'Rutina fullbody 3x/semana, enfocada en técnica y aprendizaje de movimientos básicos.',
        'intermediate': 'Rutina dividida (push/pull/legs) 4-5x/semana, con progresión lineal de pesos.',
        'advanced': 'Rutina especializada según debilidades, alta frecuencia, técnicas de intensificación.'
    };
    
    const goalRoutines = {
        'gain': 'Enfoque en ejercicios compuestos, 8-12 repeticiones, descansos 60-90s, volumen progresivo.',
        'lose': 'Combinación de fuerza y cardio, circuitos, descansos cortos, alta intensidad.',
        'strength': 'Bajas repeticiones (3-6), altos pesos, descansos largos (2-3min), técnica perfecta.',
        'endurance': 'Altas repeticiones (15-20), superseries, descansos mínimos, cardio regular.'
    };
    
    return `Para tu nivel (${userProfile.level}) y objetivo (${userProfile.goal}):\n\n${levelRoutines[userProfile.level] || ''}\n\n${goalRoutines[userProfile.goal] || ''}\n\nRecuerda: Calentamiento adecuado, técnica > peso, progresión gradual.`;
}

function generateSupplementResponse(message) {
    const supplements = {
        'beginner': '• Proteína en polvo (post-entreno)\n• Multivitamínico\n• Omega-3',
        'intermediate': '• Proteína en polvo\n• Creatina monohidrato (5g/día)\n• Cafeína (pre-entreno)\n• BCAA (opcional)',
        'advanced': '• Proteína en polvo\n• Creatina\n• Beta-alanina\n• Citrulina malato\n• ZMA (para sueño)\n• Glutamina (recuperación)'
    };
    
    return `Suplementos recomendados para nivel ${userProfile.level}:\n\n${supplements[userProfile.level] || supplements['beginner']}\n\nImportante: Los suplementos complementan, no sustituyen, una dieta adecuada. Consulta con profesional.`;
}

function generateMotivationResponse(message) {
    const motivations = [
        "El progreso no es lineal. Habrá días buenos y malos. Lo importante es la consistencia, no la perfección.",
        "Recuerda tu 'por qué'. Visualiza tu objetivo cada mañana. Pequeños pasos diarios llevan a grandes cambios.",
        "Compara tu versión de hoy con la de ayer, no con la de los demás. Tu viaje es único.",
        "La disciplina es hacer lo que debes hacer, incluso cuando no quieres. Esa disciplina construye carácter y resultados.",
        "Celebra las pequeñas victorias: un entrenamiento completado, una comida saludable, un día más siendo consistente."
    ];
    
    return motivations[Math.floor(Math.random() * motivations.length)];
}

function generatePlanningResponse(message) {
    return `Planificación para objetivo: ${userProfile.goal}\n\n• Calorías diarias: ${calorieGoal} kcal\n• Proteína: ${proteinGoal}g/día\n• Entrenamiento: ${userProfile.level === 'beginner' ? '3-4 días/semana' : userProfile.level === 'intermediate' ? '4-5 días/semana' : '5-6 días/semana'}\n• Descanso: 7-8 horas sueño mínimo\n• Evaluación: Revisar progreso cada 2 semanas\n\n¿Necesitas ajustar alguno de estos parámetros?`;
}

function generateRecoveryResponse(message) {
    return `Claves para recuperación óptima:\n\n1. Sueño (7-9 horas/noche)\n2. Hidratación (${waterGoal}ml mínimo)\n3. Nutrición post-entreno (proteína + carbos en ventana de 2 horas)\n4. Movilidad y estiramientos diarios\n5. Días de descanso activo (caminar, yoga)\n6. Gestión del estrés (meditación, respiración)\n\nLa recuperación es donde ocurre el crecimiento real.`;
}

function generateGeneralResponse(message) {
    const responses = [
        "Entiendo tu pregunta. Para darte una respuesta más precisa, ¿podrías especificar si necesitas ayuda con dieta, ejercicio, suplementos o planificación?",
        "Como tu coach de IA, puedo ayudarte con: planificación de dieta, rutinas de ejercicio, recomendaciones de suplementos, motivación y recuperación. ¿En qué área necesitas asistencia específica?",
        "Basándome en tus datos actuales, veo que estás progresando bien. ¿Hay algo específico en lo que te gustaría que te ayude hoy?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

function generatePersonalizedPlan() {
    const plan = generateCompletePlan();
    addMessageToChat(plan, 'ai');
    showToast('Plan personalizado generado', 'success');
}

function generateCompletePlan() {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    return `📋 PLAN PERSONALIZADO - ${userProfile.goal.toUpperCase()}

👤 PERFIL:
• Edad: ${userProfile.age} años
• Altura: ${userProfile.height} cm
• Nivel: ${userProfile.level}
• Objetivo: ${userProfile.goal}
• Fecha inicio: ${today.toLocaleDateString('es-ES')}
• Fecha revisión: ${nextMonth.toLocaleDateString('es-ES')}

🍽️ PLAN DE NUTRICIÓN:
• Calorías diarias: ${calorieGoal} kcal
• Proteína: ${proteinGoal}g (${Math.round(proteinGoal/6)}g por comida en 6 comidas)
• Carbohidratos: ${Math.round(calorieGoal * 0.5 / 4)}g (50% calorías)
• Grasas: ${Math.round(calorieGoal * 0.3 / 9)}g (30% calorías)
• Agua: ${waterGoal}ml (${Math.round(waterGoal/250)} vasos)

💪 PLAN DE ENTRENAMIENTO (${userProfile.level === 'beginner' ? '3 días' : userProfile.level === 'intermediate' ? '4 días' : '5 días'}/semana):
${generateWorkoutPlan()}

📊 METAS MENSUALES:
• ${userProfile.goal === 'gain' ? 'Ganar 1-2kg de masa muscular' : userProfile.goal === 'lose' ? 'Perder 2-4kg de grasa' : 'Mantener composición corporal'}
• Aumentar fuerza en ejercicios clave en 5-10%
• Mejorar resistencia cardiovascular en 15%
• Dormir 7+ horas/noche regularmente

🔔 RECOMENDACIONES:
1. Registrar todo en la app diariamente
2. Pesarse cada semana mismo día/hora
3. Ajustar calorías según progreso semanal
4. Priorizar sueño y recuperación
5. Mantener consistencia sobre perfección

¿Te gustaría ajustar algún aspecto de este plan?`;
}

function generateWorkoutPlan() {
    const plans = {
        'beginner': `DÍA A (Fullbody):
• Sentadillas 3x10-12
• Press banca 3x10-12
• Remo con barra 3x10-12
• Press hombros 3x10-12
• Curl bíceps 3x12-15
• Extensión tríceps 3x12-15

DÍA B (Descanso activo):
• Caminata 30 min
• Estiramientos 15 min

Repetir A-B-A la semana siguiente`,

        'intermediate': `DÍA 1: PUSH
• Press banca 4x8-10
• Press hombros 4x8-10
• Fondos 3x10-12
• Extensiones tríceps 3x12-15
• Elevaciones laterales 3x15-20

DÍA 2: PULL
• Dominadas/Remo 4x8-10
• Remo sentado 3x10-12
• Face pulls 3x15-20
• Curl bíceps 4x10-12
• Martillo 3x12-15

DÍA 3: PIERNAS
• Sentadillas 4x8-10
• Peso muerto 3x8-10
• Prensa 3x10-12
• Curl femoral 3x12-15
• Gemelos 4x15-20

DÍA 4: CARDIO/CORE
• HIIT 20 min
• Plancha 3x60s
• Crunch 3x20
• Piernas elevadas 3x15`,

        'advanced': `SEMANA 1: VOLUMEN
D1: Pecho/Hombros (8-12 reps)
D2: Espalda (8-12 reps) 
D3: Piernas (8-12 reps)
D4: Brazos/Core (12-15 reps)
D5: Fullbody ligero

SEMANA 2: FUERZA
D1: Compuestos pesados (3-6 reps)
D2: Accesorios (8-10 reps)
D3: Compuestos pesados (3-6 reps)
D4: Accesorios (8-10 reps)
D5: Cardio intenso

Ciclar volumen/fuerza cada 2 semanas`
    };

    return plans[userProfile.level] || plans['beginner'];
}

function updateCoachRecommendations() {
    if (!DOM.recommendationsList) return;
    
    const recommendations = [
        {
            icon: '📊',
            title: 'Análisis de progreso',
            content: getProgressAnalysis()
        },
        {
            icon: '💧',
            title: 'Hidratación',
            content: waterGlasses >= 8 ? 
                '¡Excelente! Mantén tu hidratación.' : 
                `Necesitas beber ${8 - waterGlasses} vasos más hoy.`
        },
        {
            icon: '🍗',
            title: 'Proteína',
            content: getProteinRecommendation()
        },
        {
            icon: '🏋️',
            title: 'Entrenamiento',
            content: getWorkoutRecommendation()
        },
        {
            icon: '🛌',
            title: 'Recuperación',
            content: 'Recuerda dormir 7-8 horas para óptima recuperación muscular.'
        }
    ];
    
    DOM.recommendationsList.innerHTML = recommendations.map(rec => `
        <div class="recommendation">
            <div class="recommendation-icon">${rec.icon}</div>
            <div class="recommendation-content">
                <h4>${rec.title}</h4>
                <p>${rec.content}</p>
            </div>
        </div>
    `).join('');
}

function getProgressAnalysis() {
    const todayMeals = meals.filter(meal => meal.date === new Date().toISOString().split('T')[0]);
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    
    if (totalCalories === 0) return 'Aún no has registrado comidas hoy.';
    
    const progress = (totalCalories / calorieGoal) * 100;
    
    if (progress < 70) return 'Vas por buen camino, aún tienes margen para más calorías.';
    if (progress < 90) return 'Estás cerca de tu objetivo diario.';
    if (progress <= 100) return '¡Perfecto! Estás en tu objetivo calórico.';
    return 'Has superado tu objetivo calórico. Considera ajustar mañana.';
}

function getProteinRecommendation() {
    const todayMeals = meals.filter(meal => meal.date === new Date().toISOString().split('T')[0]);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    
    if (totalProtein === 0) return 'Intenta consumir 30g de proteína en cada comida principal.';
    
    const remaining = proteinGoal - totalProtein;
    if (remaining > 0) {
        return `Te faltan ${remaining}g de proteína. Añade una fuente proteica en tu próxima comida.`;
    }
    return '¡Meta de proteína alcanzada! Excelente trabajo.';
}

function getWorkoutRecommendation() {
    const todayExercises = exercises.filter(ex => ex.date === new Date().toISOString().split('T')[0]);
    
    if (todayExercises.length === 0) {
        return 'No has registrado ejercicio hoy. ¡Muévete al menos 30 minutos!';
    }
    
    const totalSets = todayExercises.reduce((sum, ex) => sum + ex.sets, 0);
    if (totalSets < 10) {
        return 'Puedes añadir 2-3 ejercicios más para un entrenamiento completo.';
    }
    return 'Entrenamiento completo registrado. ¡Buen trabajo!';
}

/**********************
 * TEST DE PERSONALIZACIÓN
 **********************/
const testQuestions = [
    {
        id: 1,
        question: "¿Cuál es tu principal objetivo fitness?",
        type: "single",
        options: [
            { value: "lose", label: "Perder grasa y definir músculo" },
            { value: "gain", label: "Ganar masa muscular" },
            { value: "maintain", label: "Mantenerme en forma" },
            { value: "strength", label: "Aumentar mi fuerza" },
            { value: "health", label: "Mejorar mi salud general" }
        ]
    },
    {
        id: 2,
        question: "¿Cuál es tu nivel de experiencia con el entrenamiento?",
        type: "single",
        options: [
            { value: "beginner", label: "Principiante - Poca o ninguna experiencia" },
            { value: "intermediate", label: "Intermedio - Entreno regularmente (6-12 meses)" },
            { value: "advanced", label: "Avanzado - Entreno consistentemente (+1 año)" }
        ]
    },
    {
        id: 3,
        question: "¿Cuántos días a la semana puedes entrenar?",
        type: "single",
        options: [
            { value: "2", label: "2 días" },
            { value: "3", label: "3 días" },
            { value: "4", label: "4 días" },
            { value: "5", label: "5 días" },
            { value: "6", label: "6+ días" }
        ]
    },
    {
        id: 4,
        question: "¿Cuál es tu tipo de dieta preferida?",
        type: "single",
        options: [
            { value: "balanced", label: "Dieta balanceada (de todo)" },
            { value: "vegetarian", label: "Vegetariana" },
            { value: "vegan", label: "Vegana" },
            { value: "lowcarb", label: "Baja en carbohidratos" },
            { value: "highprotein", label: "Alta en proteína" },
            { value: "flexible", label: "Flexible (IIFYM)" }
        ]
    },
    {
        id: 5,
        question: "¿Tienes alguna restricción alimentaria o alergia?",
        type: "multi",
        options: [
            { value: "gluten", label: "Sin gluten" },
            { value: "lactose", label: "Sin lactosa" },
            { value: "nuts", label: "Sin frutos secos" },
            { value: "seafood", label: "Sin mariscos" },
            { value: "none", label: "Ninguna" }
        ]
    },
    {
        id: 6,
        question: "¿Cuál es tu nivel de actividad diaria (fuera del gimnasio)?",
        type: "single",
        options: [
            { value: "sedentary", label: "Sedentario (oficina, poco movimiento)" },
            { value: "light", label: "Ligero (caminar regularmente)" },
            { value: "moderate", label: "Moderado (trabajo activo o ejercicio ligero diario)" },
            { value: "active", label: "Activo (trabajo físico o ejercicio regular)" },
            { value: "very_active", label: "Muy activo (atleta o trabajo muy físico)" }
        ]
    },
    {
        id: 7,
        question: "¿Cuántas horas duermes normalmente por noche?",
        type: "single",
        options: [
            { value: "less6", label: "Menos de 6 horas" },
            { value: "6-7", label: "6-7 horas" },
            { value: "7-8", label: "7-8 horas" },
            { value: "8plus", label: "Más de 8 horas" }
        ]
    },
    {
        id: 8,
        question: "¿Tienes acceso a equipamiento de gimnasio?",
        type: "single",
        options: [
            { value: "full", label: "Gimnasio completo" },
            { value: "home", label: "Equipo básico en casa" },
            { value: "minimal", label: "Mínimo (bandas, peso corporal)" },
            { value: "none", label: "Solo peso corporal" }
        ]
    },
    {
        id: 9,
        question: "¿Qué áreas del cuerpo te gustaría enfocar más?",
        type: "multi",
        options: [
            { value: "chest", label: "Pecho" },
            { value: "back", label: "Espalda" },
            { value: "arms", label: "Brazos" },
            { value: "shoulders", label: "Hombros" },
            { value: "legs", label: "Piernas" },
            { value: "core", label: "Core/Abdomen" },
            { value: "balanced", label: "Equilibrado" }
        ]
    },
    {
        id: 10,
        question: "¿Cuál es tu mayor desafío para mantener la consistencia?",
        type: "single",
        options: [
            { value: "time", label: "Falta de tiempo" },
            { value: "motivation", label: "Falta de motivación" },
            { value: "knowledge", label: "Falta de conocimiento" },
            { value: "nutrition", label: "Dificultad con la nutrición" },
            { value: "energy", label: "Falta de energía" },
            { value: "none", label: "Ninguno, soy consistente" }
        ]
    }
];

let currentTestQuestion = 0;
let testAnswers = {};

function startTest() {
    currentTestQuestion = 0;
    testAnswers = {};
    showTestModal();
    renderTestQuestion();
}

function showTestModal() {
    if (DOM.testModal) {
        DOM.testModal.style.display = 'flex';
        DOM.testModal.removeAttribute('hidden');
    }
}

function closeTestModal() {
    if (DOM.testModal) {
        DOM.testModal.style.display = 'none';
        DOM.testModal.setAttribute('hidden', 'true');
    }
}

function renderTestQuestion() {
    if (!DOM.testContent || currentTestQuestion >= testQuestions.length) {
        finishTest();
        return;
    }
    
    const question = testQuestions[currentTestQuestion];
    
    // Actualizar progreso
    if (DOM.currentQuestion) DOM.currentQuestion.textContent = currentTestQuestion + 1;
    if (DOM.totalQuestions) DOM.totalQuestions.textContent = testQuestions.length;
    if (DOM.testProgressFill) {
        const progress = ((currentTestQuestion + 1) / testQuestions.length) * 100;
        DOM.testProgressFill.style.width = `${progress}%`;
    }
    
    // Actualizar botones
    if (DOM.testPrevBtn) {
        DOM.testPrevBtn.disabled = currentTestQuestion === 0;
    }
    if (DOM.testNextBtn) {
        const nextText = currentTestQuestion === testQuestions.length - 1 ? 'Finalizar' : 'Siguiente';
        DOM.testNextBtn.innerHTML = `${nextText} <i class="fas fa-arrow-right"></i>`;
    }
    
    // Renderizar pregunta
    let optionsHTML = '';
    
    if (question.type === 'single') {
        optionsHTML = question.options.map(option => `
            <label class="test-option">
                <input type="radio" name="testQuestion${question.id}" value="${option.value}" 
                       ${testAnswers[question.id] === option.value ? 'checked' : ''}>
                <span class="option-label">${option.label}</span>
            </label>
        `).join('');
    } else if (question.type === 'multi') {
        optionsHTML = question.options.map(option => {
            const isChecked = testAnswers[question.id] && 
                             (testAnswers[question.id].includes(option.value) || 
                              (Array.isArray(testAnswers[question.id]) && testAnswers[question.id].includes(option.value)));
            return `
                <label class="test-option">
                    <input type="checkbox" name="testQuestion${question.id}" value="${option.value}" 
                           ${isChecked ? 'checked' : ''}>
                    <span class="option-label">${option.label}</span>
                </label>
            `;
        }).join('');
    }
    
    DOM.testContent.innerHTML = `
        <div class="test-question">
            <h4>${question.question}</h4>
            <div class="test-options">
                ${optionsHTML}
            </div>
        </div>
    `;
    
    // Configurar eventos para opciones
    const inputs = DOM.testContent.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('change', (e) => {
            if (question.type === 'single') {
                testAnswers[question.id] = e.target.value;
            } else {
                if (!testAnswers[question.id]) {
                    testAnswers[question.id] = [];
                }
                if (e.target.checked) {
                    if (!testAnswers[question.id].includes(e.target.value)) {
                        testAnswers[question.id].push(e.target.value);
                    }
                } else {
                    testAnswers[question.id] = testAnswers[question.id].filter(v => v !== e.target.value);
                }
            }
        });
    });
}

function nextTestQuestion() {
    const question = testQuestions[currentTestQuestion];
    
    // Validar respuesta
    if (!testAnswers[question.id] || 
        (Array.isArray(testAnswers[question.id]) && testAnswers[question.id].length === 0)) {
        showToast('Por favor, selecciona una opción', 'warning');
        return;
    }
    
    currentTestQuestion++;
    
    if (currentTestQuestion < testQuestions.length) {
        renderTestQuestion();
    } else {
        finishTest();
    }
}

function prevTestQuestion() {
    if (currentTestQuestion > 0) {
        currentTestQuestion--;
        renderTestQuestion();
    }
}

function finishTest() {
    // Procesar respuestas y crear perfil personalizado
    processTestAnswers();
    
    // Mostrar resultados
    const results = generateTestResults();
    
    if (DOM.testContent) {
        DOM.testContent.innerHTML = `
            <div class="test-results">
                <h4><i class="fas fa-check-circle"></i> Test Completado</h4>
                <div class="results-summary">
                    ${results}
                </div>
                <div class="test-actions">
                    <button onclick="applyTestResults()" class="btn-primary">
                        <i class="fas fa-check"></i> Aplicar Configuración
                    </button>
                    <button onclick="closeTestModal()" class="btn-secondary">
                        Cerrar
                    </button>
                </div>
            </div>
        `;
    }
    
    // Actualizar botones
    if (DOM.testPrevBtn) DOM.testPrevBtn.style.display = 'none';
    if (DOM.testNextBtn) DOM.testNextBtn.style.display = 'none';
}

function processTestAnswers() {
    // Procesar respuestas y actualizar userProfile
    
    // Objetivo
    if (testAnswers[1]) {
        userProfile.goal = testAnswers[1];
    }
    
    // Nivel
    if (testAnswers[2]) {
        userProfile.level = testAnswers[2];
    }
    
    // Actividad
    if (testAnswers[6]) {
        userProfile.activity = testAnswers[6];
    }
    
    // Dieta
    if (testAnswers[4]) {
        userProfile.diet = testAnswers[4];
    }
    
    // Calcular calorías basales
    calculateCaloriesFromTest();
}

function calculateCaloriesFromTest() {
    // Fórmula simplificada para calcular calorías basales
    let bmr;
    
    // Fórmula de Harris-Benedict simplificada
    if (userProfile.gender === 'male') {
        bmr = 88.362 + (13.397 * (userBiometrics.weight || 70)) + (4.799 * userProfile.height) - (5.677 * userProfile.age);
    } else {
        bmr = 447.593 + (9.247 * (userBiometrics.weight || 60)) + (3.098 * userProfile.height) - (4.330 * userProfile.age);
    }
    
    // Factor de actividad
    const activityFactors = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    };
    
    const tdee = bmr * (activityFactors[userProfile.activity] || 1.55);
    
    // Ajustar según objetivo
    if (userProfile.goal === 'gain') {
        calorieGoal = Math.round(tdee * 1.1); // +10% para ganar músculo
        proteinGoal = Math.round((userBiometrics.weight || 70) * 1.8);
    } else if (userProfile.goal === 'lose') {
        calorieGoal = Math.round(tdee * 0.85); // -15% para perder grasa
        proteinGoal = Math.round((userBiometrics.weight || 70) * 2.0);
    } else {
        calorieGoal = Math.round(tdee);
        proteinGoal = Math.round((userBiometrics.weight || 70) * 1.6);
    }
    
    // Agua (35ml por kg de peso)
    waterGoal = Math.round((userBiometrics.weight || 70) * 35);
}

function generateTestResults() {
    const goalText = {
        'lose': 'Pérdida de grasa y definición muscular',
        'gain': 'Aumento de masa muscular',
        'maintain': 'Mantenimiento y tonificación',
        'strength': 'Aumento de fuerza',
        'health': 'Mejora de salud general'
    };
    
    const levelText = {
        'beginner': 'Principiante',
        'intermediate': 'Intermedio',
        'advanced': 'Avanzado'
    };
    
    return `
        <div class="result-item">
            <strong>Objetivo:</strong> ${goalText[userProfile.goal] || userProfile.goal}
        </div>
        <div class="result-item">
            <strong>Nivel:</strong> ${levelText[userProfile.level] || userProfile.level}
        </div>
        <div class="result-item">
            <strong>Calorías diarias:</strong> ${calorieGoal} kcal
        </div>
        <div class="result-item">
            <strong>Proteína diaria:</strong> ${proteinGoal}g
        </div>
        <div class="result-item">
            <strong>Agua diaria:</strong> ${waterGoal}ml
        </div>
        <div class="result-item">
            <strong>Dieta recomendada:</strong> ${userProfile.diet}
        </div>
        <div class="result-note">
            <p>Esta configuración se ha calculado basándose en tus respuestas. Puedes ajustarla manualmente en cualquier momento.</p>
        </div>
    `;
}

function applyTestResults() {
    // Aplicar resultados a la configuración
    if (DOM.calorieGoalInput) DOM.calorieGoalInput.value = calorieGoal;
    if (DOM.proteinGoalInput) DOM.proteinGoalInput.value = proteinGoal;
    if (DOM.waterGoalInput) DOM.waterGoalInput.value = waterGoal;
    
    // Actualizar perfil
    updateUserProfileDisplay();
    
    // Guardar
    saveToLocalStorage();
    
    // Cerrar modal
    closeTestModal();
    
    showToast('✅ Configuración personalizada aplicada', 'success');
    
    // Actualizar recomendaciones del coach
    updateCoachRecommendations();
}

/**********************
 * PERFIL DE USUARIO
 **********************/
function updateUserProfileDisplay() {
    const elements = {
        'userAge': `${userProfile.age} años`,
        'userHeight': `${userProfile.height} cm`,
        'userGoal': getGoalText(userProfile.goal),
        'userLevel': getLevelText(userProfile.level)
    };
    
    for (const [id, text] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) element.textContent = text;
    }
}

function getGoalText(goal) {
    const goals = {
        'lose': 'Perder grasa',
        'gain': 'Ganar músculo',
        'maintain': 'Mantenerse',
        'strength': 'Aumentar fuerza',
        'endurance': 'Mejorar resistencia',
        'health': 'Mejorar salud'
    };
    return goals[goal] || goal;
}

function getLevelText(level) {
    const levels = {
        'beginner': 'Principiante',
        'intermediate': 'Intermedio',
        'advanced': 'Avanzado'
    };
    return levels[level] || level;
}

function openProfileModal() {
    if (!DOM.profileModal) return;
    
    // Llenar campos con datos actuales
    document.getElementById('editAge').value = userProfile.age;
    document.getElementById('editHeight').value = userProfile.height;
    document.getElementById('editGender').value = userProfile.gender;
    document.getElementById('editGoal').value = userProfile.goal;
    document.getElementById('editLevel').value = userProfile.level;
    document.getElementById('editActivity').value = userProfile.activity;
    document.getElementById('editDiet').value = userProfile.diet;
    
    DOM.profileModal.style.display = 'flex';
    DOM.profileModal.removeAttribute('hidden');
}

function closeProfileModal() {
    if (DOM.profileModal) {
        DOM.profileModal.style.display = 'none';
        DOM.profileModal.setAttribute('hidden', 'true');
    }
}

function saveProfile() {
    // Obtener valores del formulario
    userProfile.age = parseInt(document.getElementById('editAge').value) || 25;
    userProfile.height = parseInt(document.getElementById('editHeight').value) || 175;
    userProfile.gender = document.getElementById('editGender').value;
    userProfile.goal = document.getElementById('editGoal').value;
    userProfile.level = document.getElementById('editLevel').value;
    userProfile.activity = document.getElementById('editActivity').value;
    userProfile.diet = document.getElementById('editDiet').value;
    
    // Actualizar display
    updateUserProfileDisplay();
    
    // Recalcular calorías basales
    calculateCaloriesFromTest();
    
    // Actualizar inputs de configuración
    if (DOM.calorieGoalInput) DOM.calorieGoalInput.value = calorieGoal;
    if (DOM.proteinGoalInput) DOM.proteinGoalInput.value = proteinGoal;
    if (DOM.waterGoalInput) DOM.waterGoalInput.value = waterGoal;
    
    // Guardar
    saveToLocalStorage();
    
    // Cerrar modal
    closeProfileModal();
    
    showToast('✅ Perfil actualizado correctamente', 'success');
}

/**********************
 * GESTIÓN DE ENTRENAMIENTO (MEJORADA)
 **********************/
function addExercise() {
    const name = DOM.exerciseName?.value.trim();
    const sets = parseInt(DOM.exerciseSets?.value || 0);
    const reps = parseInt(DOM.exerciseReps?.value || 0);
    const weight = parseFloat(DOM.exerciseWeight?.value || 0);
    const rest = parseInt(DOM.exerciseRest?.value || 0);
    const notes = DOM.exerciseNotes?.value.trim();
    const date = DOM.exerciseDateInput?.value || selectedCalendarDate;

    if (!name) {
        showToast('Por favor, indica el nombre del ejercicio', 'error');
        return;
    }

    if (sets <= 0 || reps <= 0) {
        showToast('Por favor, ingresa series y repeticiones válidas', 'error');
        return;
    }

    const exercise = {
        id: Date.now(),
        name,
        sets,
        reps,
        weight,
        rest,
        notes,
        date: date,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().getTime()
    };

    exercises.push(exercise);
    saveToLocalStorage();
    renderExercisesList();
    updateDashboard();
    
    // Si es para la fecha seleccionada, actualizar también esa vista
    if (date === selectedCalendarDate) {
        renderExercisesForSelectedDate();
    }
    
    // Limpiar campos
    if (DOM.exerciseName) DOM.exerciseName.value = '';
    if (DOM.exerciseSets) DOM.exerciseSets.value = '3';
    if (DOM.exerciseReps) DOM.exerciseReps.value = '10';
    if (DOM.exerciseWeight) DOM.exerciseWeight.value = '0';
    if (DOM.exerciseRest) DOM.exerciseRest.value = '60';
    if (DOM.exerciseNotes) DOM.exerciseNotes.value = '';

    showToast(`💪 ${name} registrado`);
}

function renderExercisesList() {
    const container = DOM.exercisesListContainer;
    if (!container) return;

    const today = new Date().toISOString().split('T')[0];
    const todayExercises = exercises.filter(ex => ex.date === today);

    if (todayExercises.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No hay ejercicios hoy</p></div>';
        return;
    }

    // Ordenar por hora (más reciente primero)
    todayExercises.sort((a, b) => b.timestamp - a.timestamp);
    
    container.innerHTML = todayExercises.map(ex => `
        <div class="session-exercise">
            <div class="session-exercise-info">
                <strong>${ex.name}</strong>
                <span>${ex.sets} × ${ex.reps}${ex.weight > 0 ? ` @ ${ex.weight}kg` : ''}</span>
                ${ex.notes ? `<small>${ex.notes}</small>` : ''}
            </div>
            <button class="complete-btn" onclick="deleteExercise(${ex.id})" title="Eliminar">
                <i class="fas fa-check"></i>
            </button>
        </div>
    `).join('');
    
    // Actualizar contador
    if (DOM.workoutsCount) {
        DOM.workoutsCount.textContent = todayExercises.length;
    }
}

function deleteExercise(id) {
    showConfirm('¿Eliminar este ejercicio?', () => {
        exercises = exercises.filter(ex => ex.id !== id);
        saveToLocalStorage();
        renderExercisesList();
        renderExercisesForSelectedDate();
        updateDashboard();
        showToast('🗑️ Ejercicio eliminado');
    });
}

function finishWorkout() {
    const todayExercises = exercises.filter(ex => ex.date === new Date().toISOString().split('T')[0]);
    
    if (todayExercises.length === 0) {
        showToast('No hay ejercicios para finalizar', 'warning');
        return;
    }
    
    showToast(`🏋️‍♂️ Entrenamiento finalizado: ${todayExercises.length} ejercicios`, 'success');
}

function loadQuickRoutine(routineType) {
    const routines = {
        'upper': [
            { name: 'Press de banca', sets: 3, reps: 10, weight: 0 },
            { name: 'Dominadas', sets: 3, reps: 8, weight: 0 },
            { name: 'Press militar', sets: 3, reps: 10, weight: 0 },
            { name: 'Remo con barra', sets: 3, reps: 10, weight: 0 }
        ],
        'lower': [
            { name: 'Sentadillas', sets: 4, reps: 12, weight: 0 },
            { name: 'Peso muerto', sets: 3, reps: 8, weight: 0 },
            { name: 'Zancadas', sets: 3, reps: 12, weight: 0 }
        ],
        'fullbody': [
            { name: 'Sentadillas', sets: 3, reps: 12, weight: 0 },
            { name: 'Press de banca', sets: 3, reps: 10, weight: 0 },
            { name: 'Remo con barra', sets: 3, reps: 10, weight: 0 },
            { name: 'Plancha', sets: 3, reps: 30, weight: 0 }
        ],
        'core': [
            { name: 'Plancha', sets: 3, reps: 60, weight: 0 },
            { name: 'Crunch abdominal', sets: 3, reps: 15, weight: 0 },
            { name: 'Elevación de piernas', sets: 3, reps: 12, weight: 0 }
        ]
    };
    
    const routine = routines[routineType];
    if (!routine) {
        showToast('Rutina no encontrada', 'error');
        return;
    }
    
    // Agregar cada ejercicio de la rutina
    routine.forEach(exercise => {
        const newExercise = {
            id: Date.now() + Math.random(),
            name: exercise.name,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            rest: 60,
            notes: `Rutina rápida: ${routineType}`,
            date: selectedCalendarDate,
            time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date().getTime()
        };
        exercises.push(newExercise);
    });
    
    saveToLocalStorage();
    renderExercisesList();
    renderExercisesForSelectedDate();
    updateDashboard();
    showToast(`✅ Rutina ${routineType} cargada: ${routine.length} ejercicios`);
}

function updateWorkoutGoal() {
    // Supongamos que el objetivo es 80kg y empezamos en 58kg
    const startWeight = 58.0;
    const goalWeight = 80.0;
    const currentWeight = userBiometrics.weight || startWeight;
    
    // Calcular progreso
    const progress = Math.min(100, ((currentWeight - startWeight) / (goalWeight - startWeight)) * 100);
    const remaining = goalWeight - currentWeight;
    
    // Días restantes (estimado: ganar 0.5kg por semana)
    const weeklyGain = 0.5;
    const daysRemaining = Math.ceil((remaining / weeklyGain) * 7);
    
    // Actualizar DOM
    if (DOM.currentWeightGoal) DOM.currentWeightGoal.textContent = `${currentWeight.toFixed(1)} kg`;
    if (DOM.weightRemaining) DOM.weightRemaining.textContent = `${remaining.toFixed(1)} kg`;
    if (DOM.daysRemaining) DOM.daysRemaining.textContent = daysRemaining;
    if (DOM.goalProgressBar) DOM.goalProgressBar.style.width = `${progress}%`;
    if (DOM.goalProgressPercent) DOM.goalProgressPercent.textContent = `${progress.toFixed(1)}% completado`;
}

/**********************
 * DASHBOARD
 **********************/
function updateDashboard() {
    // Calcular totales del día
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(meal => meal.date === today);
    const todayExercises = exercises.filter(ex => ex.date === today);
    
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
    
    if (DOM.workoutsCount) {
        DOM.workoutsCount.textContent = todayExercises.length;
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
    showQuickMealSelector();
}

function addQuickWorkout() {
    const quickExercises = [
        'Flexiones (3x15)',
        'Sentadillas (3x20)',
        'Plancha (3x30s)',
        'Dominadas (3x5)'
    ];
    
    const randomExercise = quickExercises[Math.floor(Math.random() * quickExercises.length)];
    const [name, reps] = randomExercise.split(' (');
    
    const exercise = {
        id: Date.now(),
        name: name,
        sets: 3,
        reps: parseInt(reps) || 10,
        weight: 0,
        rest: 60,
        notes: 'Ejercicio rápido',
        date: selectedCalendarDate,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().getTime()
    };
    
    exercises.push(exercise);
    saveToLocalStorage();
    renderExercisesList();
    renderExercisesForSelectedDate();
    updateDashboard();
    showToast(`🏃 ${name} agregado como ejercicio rápido`);
}

function generateReport() {
    const today = new Date().toISOString().split('T')[0];
    const todayMeals = meals.filter(meal => meal.date === today);
    const todayExercises = exercises.filter(ex => ex.date === today);
    
    const totalCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = todayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    
    const report = `
📊 REPORTE DIARIO - ${new Date().toLocaleDateString('es-ES')}
===============================

🔥 NUTRICIÓN:
• Calorías: ${totalCalories}/${calorieGoal} (${Math.round((totalCalories/calorieGoal)*100)}%)
• Proteína: ${totalProtein}/${proteinGoal}g (${Math.round((totalProtein/proteinGoal)*100)}%)
• Comidas registradas: ${todayMeals.length}

💪 ENTRENAMIENTO:
• Ejercicios realizados: ${todayExercises.length}
• Series totales: ${todayExercises.reduce((sum, ex) => sum + ex.sets, 0)}

💧 HIDRATACIÓN:
• Vasos de agua: ${waterGlasses}
• ${waterGlasses >= 8 ? '✅ Excelente hidratación' : '⚠️ Necesitas beber más agua'}

📈 BIOMETRÍA:
• Peso actual: ${userBiometrics.weight || '--'} kg
• Grasa corporal: ${userBiometrics.fat || '--'}%
• IMC: ${userBiometrics.history && userBiometrics.history.length > 0 ? 
    userBiometrics.history[userBiometrics.history.length - 1].bmi : '--'}

${totalCalories <= calorieGoal ? '✅' : '⚠️'} CALORÍAS: ${totalCalories <= calorieGoal ? 'Dentro del objetivo' : 'Superaste el objetivo'}
    `;
    
    showToast('Reporte generado (ver consola)', 'info');
    console.log(report);
    
    // También podríamos mostrar en un modal
    alert('Reporte generado en consola (F12 para ver)');
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
        showToast('Meta de calorías actualizada', 'success');
    }
    
    if (newProteinGoal && newProteinGoal >= 50) {
        proteinGoal = newProteinGoal;
        showToast('Meta de proteína actualizada', 'success');
    }
    
    if (newWaterGoal && newWaterGoal >= 1000) {
        waterGoal = newWaterGoal;
        showToast('Meta de agua actualizada', 'success');
    }
    
    updateDashboard();
    saveToLocalStorage();
}

/**********************
 * COMIDAS RÁPIDAS
 **********************/
function showQuickMealSelector() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Seleccionar Comida Rápida</h3>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="quick-meals-grid">
                    ${Object.entries({
                        'desayuno ligero': { name: 'Desayuno Ligero', calories: 350, protein: 20 },
                        'desayuno proteico': { name: 'Desayuno Proteico', calories: 450, protein: 35 },
                        'almuerzo saludable': { name: 'Almuerzo Saludable', calories: 550, protein: 40 },
                        'cena ligera': { name: 'Cena Ligera', calories: 400, protein: 30 },
                        'snack proteico': { name: 'Snack Proteico', calories: 200, protein: 25 },
                        'postre saludable': { name: 'Postre Saludable', calories: 250, protein: 15 }
                    }).map(([key, food]) => `
                        <div class="quick-meal-item" onclick="addQuickMealFromDatabase('${key}')">
                            <div class="quick-meal-name">${food.name}</div>
                            <div class="quick-meal-nutrition">
                                <span>${food.calories} kcal</span>
                                <span>${food.protein}g P</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cancelar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function addQuickMealFromDatabase(foodKey) {
    const foodData = {
        'desayuno ligero': { calories: 350, protein: 20, carbs: 45, fat: 12 },
        'desayuno proteico': { calories: 450, protein: 35, carbs: 30, fat: 15 },
        'almuerzo saludable': { calories: 550, protein: 40, carbs: 60, fat: 20 },
        'cena ligera': { calories: 400, protein: 30, carbs: 40, fat: 15 },
        'snack proteico': { calories: 200, protein: 25, carbs: 10, fat: 8 },
        'postre saludable': { calories: 250, protein: 15, carbs: 35, fat: 8 }
    };
    
    const food = foodData[foodKey];
    
    if (!food) return;
    
    const meal = {
        id: Date.now(),
        name: foodKey.charAt(0).toUpperCase() + foodKey.slice(1),
        description: `Comida rápida: ${foodKey}`,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        date: selectedCalendarDate,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().getTime()
    };
    
    meals.push(meal);
    renderMealsForSelectedDate();
    updateDashboard();
    saveToLocalStorage();
    
    document.querySelector('.modal')?.remove();
    
    showToast(`✅ ${meal.name} añadido correctamente`);
}

/**********************
 * UTILIDADES
 **********************/
function showToast(message, type = 'success') {
    if (!DOM.toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    DOM.toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode === DOM.toastContainer) {
                DOM.toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function showConfirm(message, onConfirm) {
    if (!DOM.confirmModal) return;
    
    DOM.modalMessage.textContent = message;
    DOM.confirmModal.style.display = 'flex';
    
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
        DOM.confirmModal.style.display = 'none';
    };
    
    DOM.modalConfirm.onclick = handleConfirm;
    DOM.modalCancel.onclick = handleCancel;
    DOM.modalClose.onclick = handleCancel;
}

function updateClock() {
    const now = new Date();
    
    if (DOM.currentTime) {
        DOM.currentTime.textContent = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    
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
        userProfile,
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
            userProfile = data.userProfile || {
                age: 25,
                height: 175,
                gender: 'male',
                goal: 'gain',
                level: 'beginner',
                activity: 'moderate',
                diet: 'balanced'
            };
            
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
    initDOM();
    loadFromLocalStorage();
    setupNavigation();
    setupEventListeners();
    setupIACoach();
    
    updateClock();
    setInterval(updateClock, 1000);
    
    updateDashboard();
    updateBiometryDisplay();
    updateWeightChart();
    updateBodyCompositionChart();
    updateWorkoutGoal();
    updateCoachRecommendations();
    updateUserProfileDisplay();
    
    // Inicializar fecha actual en inputs
    const today = new Date().toISOString().split('T')[0];
    if (DOM.mealDateInput) DOM.mealDateInput.value = today;
    if (DOM.exerciseDateInput) DOM.exerciseDateInput.value = today;
    if (DOM.bodyDateInput) DOM.bodyDateInput.value = today;
    
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
            if (DOM.mealNameInput) DOM.mealNameInput.value = '';
            if (DOM.mealDescription) DOM.mealDescription.value = '';
            if (DOM.mealCaloriesInput) DOM.mealCaloriesInput.value = '';
            if (DOM.mealProteinInput) DOM.mealProteinInput.value = '';
            if (DOM.mealCarbsInput) DOM.mealCarbsInput.value = '';
            if (DOM.mealFatInput) DOM.mealFatInput.value = '';
            
            if (DOM.aiAnalysisResult) {
                DOM.aiAnalysisResult.style.display = 'none';
            }
        });
    }
    
    // Botón de análisis IA
    if (DOM.analyzeMealBtn) {
        DOM.analyzeMealBtn.addEventListener('click', analyzeMealWithAI);
    }
    
    if (DOM.mealDescription) {
        let typingTimer;
        DOM.mealDescription.addEventListener('input', () => {
            clearTimeout(typingTimer);
            if (DOM.mealDescription.value.length > 20) {
                typingTimer = setTimeout(() => {
                    analyzeMealWithAI();
                }, 1500);
            }
        });
    }
    
    // Calendario
    if (DOM.prevMonth) {
        DOM.prevMonth.addEventListener('click', () => navigateCalendarMonth('prev'));
    }
    if (DOM.nextMonth) {
        DOM.nextMonth.addEventListener('click', () => navigateCalendarMonth('next'));
    }
    
    // Biometría
    if (DOM.saveBodyBtn) {
        DOM.saveBodyBtn.addEventListener('click', saveBiometrics);
    }
    
    if (DOM.calculateBodyBtn) {
        DOM.calculateBodyBtn.addEventListener('click', calculateBodyComposition);
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
    
    if (DOM.startTestBtn) {
        DOM.startTestBtn.addEventListener('click', startTest);
    }
    
    if (DOM.editProfileBtn) {
        DOM.editProfileBtn.addEventListener('click', openProfileModal);
    }
    
    // Test
    if (DOM.testPrevBtn) {
        DOM.testPrevBtn.addEventListener('click', prevTestQuestion);
    }
    
    if (DOM.testNextBtn) {
        DOM.testNextBtn.addEventListener('click', nextTestQuestion);
    }
    
    // Botón refresh del dashboard
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            updateDashboard();
            updateWeightChart();
            showToast('Datos actualizados');
        });
    }
    
    // Botones del header
    const gymModeBtn = document.getElementById('gymModeBtn');
    if (gymModeBtn) {
        gymModeBtn.addEventListener('click', () => {
            gymModeBtn.classList.toggle('active');
            showToast(gymModeBtn.classList.contains('active') ? 'Modo GYM activado' : 'Modo GYM desactivado');
        });
    }
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            themeToggle.innerHTML = document.body.classList.contains('light-mode') ? 
                '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            showToast(document.body.classList.contains('light-mode') ? 'Modo claro activado' : 'Modo oscuro activado');
        });
    }
    
    // Botón de añadir ejercicio
    if (DOM.addExerciseBtn) {
        DOM.addExerciseBtn.addEventListener('click', addExercise);
    }
    
    // Botón de finalizar entrenamiento
    if (DOM.finishWorkoutBtn) {
        DOM.finishWorkoutBtn.addEventListener('click', finishWorkout);
    }
}

/**********************
 * FUNCIONES GLOBALES
 **********************/
window.deleteMeal = deleteMeal;
window.deleteExercise = deleteExercise;
window.addQuickMealFromDatabase = addQuickMealFromDatabase;
window.showQuickMealSelector = showQuickMealSelector;
window.loadQuickRoutine = loadQuickRoutine;
window.addExercise = addExercise;
window.finishWorkout = finishWorkout;
window.addQuickWorkout = addQuickWorkout;
window.analyzeMealWithAI = analyzeMealWithAI;
window.selectCalendarDate = selectCalendarDate;
window.navigateCalendarMonth = navigateCalendarMonth;
window.startTest = startTest;
window.closeTestModal = closeTestModal;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;
window.saveProfile = saveProfile;
window.applyTestResults = applyTestResults;
window.nextTestQuestion = nextTestQuestion;
window.prevTestQuestion = prevTestQuestion;

/**********************
 * INICIO DE LA APLICACIÓN
 **********************/
document.addEventListener('DOMContentLoaded', initApp);
// Sistema de Logros Gamificado
class AchievementSystem {
    constructor() {
        this.achievements = [];
        this.userLevel = 1;
        this.userXP = 0;
        this.dailyStreak = 0;
        this.lastActivityDate = null;
        this.initialize();
    }

    initialize() {
        this.loadUserProgress();
        this.checkDailyStreak();
        this.setupAchievements();
        this.startRewardCountdown();
    }

    loadUserProgress() {
        const savedProgress = localStorage.getItem('fitnessAchievements');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            this.userLevel = progress.level || 1;
            this.userXP = progress.xp || 0;
            this.dailyStreak = progress.streak || 0;
            this.lastActivityDate = progress.lastActivity ? new Date(progress.lastActivity) : null;
            this.updateDisplay();
        }
    }

    saveUserProgress() {
        const progress = {
            level: this.userLevel,
            xp: this.userXP,
            streak: this.dailyStreak,
            lastActivity: new Date().toISOString(),
            achievements: this.achievements.filter(a => a.unlocked)
        };
        localStorage.setItem('fitnessAchievements', JSON.stringify(progress));
    }

    checkDailyStreak() {
        const today = new Date().toDateString();
        if (!this.lastActivityDate) {
            this.dailyStreak = 1;
            this.lastActivityDate = new Date();
        } else {
            const lastDate = new Date(this.lastActivityDate).toDateString();
            if (today === lastDate) {
                // Ya registrado hoy
                return;
            }
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastDate === yesterday.toDateString()) {
                this.dailyStreak++;
            } else {
                this.dailyStreak = 1; // Rompió la racha
            }
            this.lastActivityDate = new Date();
        }
        this.saveUserProgress();
        this.updateDisplay();
    }

    setupAchievements() {
        this.achievements = [
            {
                id: 'first_steps',
                name: 'PRIMEROS PASOS',
                description: 'Completa 5 entrenamientos consecutivos',
                category: 'strength',
                target: 5,
                current: 5,
                unlocked: true,
                xpReward: 50,
                icon: 'fa-fist-raised'
            },
            {
                id: 'mountain_climb',
                name: 'ASCENSO AL MONTE',
                description: 'Alcanza 100kg en press banca',
                category: 'strength',
                target: 100,
                current: 65,
                unlocked: false,
                xpReward: 200,
                icon: 'fa-mountain'
            },
            {
                id: 'gym_legend',
                name: 'LEYENDA DEL GIMNASIO',
                description: 'Más de 1000 entrenamientos registrados',
                category: 'strength',
                target: 1000,
                current: 128,
                unlocked: false,
                xpReward: 1000,
                icon: 'fa-crown'
            },
            {
                id: 'mindful_eater',
                name: 'ALIMENTO CONSCIENTE',
                description: 'Registra comidas por 30 días seguidos',
                category: 'nutrition',
                target: 30,
                current: 22,
                unlocked: false,
                xpReward: 150,
                icon: 'fa-seedling'
            },
            {
                id: 'macro_precision',
                name: 'PRECISIÓN DE MACROS',
                description: 'Mantén tus macros dentro del ±5% por 2 semanas',
                category: 'nutrition',
                target: 14,
                current: 6,
                unlocked: false,
                xpReward: 300,
                icon: 'fa-balance-scale'
            },
            {
                id: 'steel_streak',
                name: 'RACHA DE ACERO',
                description: '30 días seguidos sin saltarte un entrenamiento',
                category: 'consistency',
                target: 30,
                current: 21,
                unlocked: false,
                xpReward: 500,
                icon: 'fa-calendar-check'
            }
        ];
    }

    addXP(amount, source) {
        const oldLevel = this.userLevel;
        this.userXP += amount;
        
        // Subir de nivel cada 1000 XP
        const newLevel = Math.floor(this.userXP / 1000) + 1;
        if (newLevel > this.userLevel) {
            this.userLevel = newLevel;
            this.showLevelUpNotification(oldLevel, newLevel);
        }
        
        this.saveUserProgress();
        this.updateDisplay();
        this.showXPGainedNotification(amount, source);
    }

    updateAchievementProgress(achievementId, increment = 1) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlocked) return;
        
        achievement.current += increment;
        if (achievement.current >= achievement.target) {
            achievement.unlocked = true;
            this.addXP(achievement.xpReward, `Logro: ${achievement.name}`);
            this.showAchievementUnlockedNotification(achievement);
        }
        
        this.saveUserProgress();
        this.updateDisplay();
    }

    updateDisplay() {
        // Actualizar nivel y XP
        const levelElement = document.querySelector('.level-number');
        const xpElement = document.querySelector('.current-xp');
        const nextLevelElement = document.querySelector('.next-level');
        const xpFillElement = document.querySelector('.xp-fill');
        const streakElement = document.querySelector('.streak-count');
        
        if (levelElement) levelElement.textContent = this.userLevel;
        if (xpElement) xpElement.textContent = `${this.userXP.toLocaleString()} XP`;
        
        const xpForNextLevel = this.userLevel * 1000;
        const xpInCurrentLevel = this.userXP % 1000;
        const percentage = (xpInCurrentLevel / 1000) * 100;
        
        if (nextLevelElement) nextLevelElement.textContent = `${xpForNextLevel - this.userXP} XP para nivel ${this.userLevel + 1}`;
        if (xpFillElement) xpFillElement.style.width = `${percentage}%`;
        if (streakElement) streakElement.textContent = this.dailyStreak;
        
        // Actualizar logros
        this.updateAchievementsDisplay();
    }

    updateAchievementsDisplay() {
        // Esta función actualiza los logros en la UI
        // Implementar según la estructura específica
    }

    showLevelUpNotification(oldLevel, newLevel) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <i class="fas fa-arrow-up"></i>
                <h3>¡NIVEL SUBIDO!</h3>
                <p>Has alcanzado el nivel <strong>${newLevel}</strong></p>
                <div class="level-badge">${newLevel}</div>
                <button onclick="this.parentElement.parentElement.remove()">OK</button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    showXPGainedNotification(amount, source) {
        const notification = document.createElement('div');
        notification.className = 'xp-notification';
        notification.innerHTML = `
            <div class="xp-content">
                <i class="fas fa-star"></i>
                <span>+${amount} XP</span>
                <small>${source}</small>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    showAchievementUnlockedNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <div class="achievement-icon-large">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>¡LOGRO DESBLOQUEADO!</h4>
                    <p><strong>${achievement.name}</strong></p>
                    <p>${achievement.description}</p>
                    <div class="achievement-reward-large">
                        <i class="fas fa-trophy"></i>
                        <span>+${achievement.xpReward} XP</span>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }

    claimDailyReward() {
        const today = new Date().toDateString();
        const lastClaim = localStorage.getItem('lastDailyReward');
        
        if (lastClaim === today) {
            showNotification('Ya has reclamado tu recompensa diaria hoy', 'warning');
            return;
        }
        
        // Recompensa base + bonus por racha
        const baseReward = 50;
        const streakBonus = Math.min(this.dailyStreak * 10, 200);
        const totalReward = baseReward + streakBonus;
        
        this.addXP(totalReward, 'Recompensa diaria');
        localStorage.setItem('lastDailyReward', today);
        
        showNotification(`¡Recompensa diaria reclamada! +${totalReward} XP (${streakBonus} por racha)`, 'success');
    }

    startRewardCountdown() {
        const countdownElement = document.querySelector('.countdown');
        if (!countdownElement) return;
        
        const updateCountdown = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const diff = tomorrow - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            countdownElement.textContent = `${hours}h ${minutes}m`;
        };
        
        updateCountdown();
        setInterval(updateCountdown, 60000);
    }
}

// Inicializar el sistema de logros
let achievementSystem;

document.addEventListener('DOMContentLoaded', function() {
    achievementSystem = new AchievementSystem();
    
    // Ejemplo: Añadir XP cuando se complete un entrenamiento
    document.addEventListener('workoutCompleted', function(e) {
        const xpGained = e.detail.duration * 2; // 2 XP por minuto
        achievementSystem.addXP(xpGained, 'Entrenamiento completado');
        achievementSystem.updateAchievementProgress('first_steps');
    });
    
    // Ejemplo: Añadir XP cuando se registre una comida
    document.addEventListener('mealLogged', function() {
        achievementSystem.addXP(10, 'Comida registrada');
        achievementSystem.updateAchievementProgress('mindful_eater');
    });
});

// Funciones globales
function claimDailyReward() {
    if (achievementSystem) {
        achievementSystem.claimDailyReward();
    }
}

function claimReward(type) {
    let xpAmount = 0;
    let message = '';
    
    switch(type) {
        case 'daily':
            xpAmount = 50;
            message = 'Recompensa diaria reclamada';
            break;
        case 'weekly':
            xpAmount = 200;
            message = 'Recompensa semanal reclamada';
            break;
        case 'milestone':
            xpAmount = 500;
            message = 'Hito mensual alcanzado';
            break;
    }
    
    if (achievementSystem) {
        achievementSystem.addXP(xpAmount, message);
        showNotification(`+${xpAmount} XP reclamados!`, 'success');
    }
}

// Eventos personalizados para integrar con otras funciones
function triggerWorkoutCompleted(duration) {
    const event = new CustomEvent('workoutCompleted', {
        detail: { duration: duration }
    });
    document.dispatchEvent(event);
}

function triggerMealLogged() {
    const event = new CustomEvent('mealLogged');
    document.dispatchEvent(event);
}
// ChefIA.js - Sistema completo de Chef Inteligente

class ChefIA {
    constructor() {
        this.userProfile = {
            objective: 'muscle-gain',
            preferences: ['high-protein'],
            skillLevel: 1,
            availableFoods: [],
            calories: 2500,
            macros: { protein: 120, carbs: 250, fat: 83 }
        };
        
        this.recipeDatabase = this.initializeRecipeDatabase();
        this.workoutDatabase = this.initializeWorkoutDatabase();
        this.currentDay = 0;
        
        this.initializeEventListeners();
        this.loadUserPreferences();
    }
    
    initializeEventListeners() {
        // Botones de objetivo
        document.querySelectorAll('.objective-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setObjective(e.target.dataset.objective);
            });
        });
        
        // Chips de preferencias
        document.querySelectorAll('.chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                this.togglePreference(e.target.dataset.pref);
            });
        });
        
        // Slider de nivel
        document.querySelector('.skill-slider-input').addEventListener('input', (e) => {
            this.setSkillLevel(e.target.value);
        });
        
        // Importar lista de compras
        document.getElementById('import-shopping-list').addEventListener('click', () => {
            this.importShoppingList();
        });
        
        // Generar plan de comidas
        document.getElementById('generate-meal-plan').addEventListener('click', () => {
            this.generateDailyPlan();
        });
        
        // Navegación días
        document.getElementById('prev-day').addEventListener('click', () => {
            this.changeDay(-1);
        });
        
        document.getElementById('next-day').addEventListener('click', () => {
            this.changeDay(1);
        });
    }
    
    setObjective(objective) {
        this.userProfile.objective = objective;
        
        // Actualizar UI
        document.querySelectorAll('.objective-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.objective === objective);
        });
        
        // Actualizar macros según objetivo
        this.updateMacrosForObjective();
    }
    
    togglePreference(pref) {
        const index = this.userProfile.preferences.indexOf(pref);
        const chip = document.querySelector(`.chip[data-pref="${pref}"]`);
        
        if (index === -1) {
            this.userProfile.preferences.push(pref);
            chip.classList.add('active');
        } else {
            this.userProfile.preferences.splice(index, 1);
            chip.classList.remove('active');
        }
    }
    
    setSkillLevel(level) {
        this.userProfile.skillLevel = parseInt(level);
        
        // Actualizar niveles visibles
        document.querySelectorAll('.skill-level').forEach((el, idx) => {
            el.classList.toggle('active', idx === level - 1);
        });
    }
    
    importShoppingList() {
        // Obtener alimentos de la lista de compras
        const shoppingItems = JSON.parse(localStorage.getItem('shoppingList') || '[]');
        this.userProfile.availableFoods = shoppingItems.map(item => item.name.toLowerCase());
        
        // Actualizar UI
        this.updateAvailableFoodsDisplay();
        
        // Mostrar notificación
        this.showMessage(`Importados ${shoppingItems.length} alimentos de tu lista de compras`, 'success');
    }
    
    updateAvailableFoodsDisplay() {
        const container = document.querySelector('.selected-foods');
        container.innerHTML = '';
        
        this.userProfile.availableFoods.forEach(food => {
            const foodEl = document.createElement('div');
            foodEl.className = 'food-item';
            foodEl.innerHTML = `
                <i class="fas fa-carrot"></i>
                <span>${food}</span>
                <button class="remove-food" data-food="${food}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(foodEl);
        });
        
        // Añadir event listeners para remover
        document.querySelectorAll('.remove-food').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const food = e.target.closest('.remove-food').dataset.food;
                this.removeFood(food);
            });
        });
    }
    
    removeFood(food) {
        const index = this.userProfile.availableFoods.indexOf(food);
        if (index > -1) {
            this.userProfile.availableFoods.splice(index, 1);
            this.updateAvailableFoodsDisplay();
        }
    }
    
    updateMacrosForObjective() {
        switch(this.userProfile.objective) {
            case 'muscle-gain':
                this.userProfile.macros = { protein: 140, carbs: 300, fat: 90 };
                this.userProfile.calories = 2800;
                break;
            case 'fat-loss':
                this.userProfile.macros = { protein: 130, carbs: 150, fat: 70 };
                this.userProfile.calories = 2000;
                break;
            case 'maintenance':
                this.userProfile.macros = { protein: 120, carbs: 250, fat: 83 };
                this.userProfile.calories = 2500;
                break;
            case 'performance':
                this.userProfile.macros = { protein: 130, carbs: 350, fat: 80 };
                this.userProfile.calories = 3000;
                break;
        }
    }
    
    async generateDailyPlan() {
        // Mostrar estado de carga
        this.showLoading(true);
        
        try {
            // Generar recetas para cada comida
            const breakfast = this.generateRecipe('breakfast');
            const lunch = this.generateRecipe('lunch');
            const dinner = this.generateRecipe('dinner');
            const snacks = this.generateRecipe('snack');
            
            // Generar rutina de ejercicios si está marcado
            let workout = null;
            if (document.getElementById('include-workout').checked) {
                workout = this.generateWorkout();
            }
            
            // Actualizar UI
            await this.updateMealDisplay('breakfast', breakfast);
            await this.updateMealDisplay('lunch', lunch);
            await this.updateMealDisplay('dinner', dinner);
            await this.updateMealDisplay('snacks', snacks);
            
            if (workout) {
                this.updateWorkoutDisplay(workout);
            }
            
            // Calcular y mostrar macros
            this.updateNutritionSummary([breakfast, lunch, dinner, snacks]);
            
            // Mostrar resultados
            this.showResults();
            
            // Guardar en historial
            this.saveToHistory({
                date: new Date().toISOString(),
                meals: { breakfast, lunch, dinner, snacks },
                workout,
                profile: { ...this.userProfile }
            });
            
            this.showMessage('¡Plan generado con éxito!', 'success');
            
        } catch (error) {
            console.error('Error generando plan:', error);
            this.showMessage('Error al generar el plan. Intenta de nuevo.', 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    generateRecipe(mealType) {
        // Filtrar recetas por tipo de comida, nivel de habilidad y alimentos disponibles
        const availableRecipes = this.recipeDatabase.filter(recipe => {
            if (recipe.mealType !== mealType) return false;
            if (recipe.difficulty > this.userProfile.skillLevel) return false;
            
            // Verificar si tenemos ingredientes
            const hasIngredients = recipe.ingredients.every(ing => 
                this.hasIngredient(ing.name.toLowerCase())
            );
            
            // Para snacks, ser más flexible
            if (mealType === 'snack' && !hasIngredients) {
                return recipe.ingredients.length <= 3; // Snacks simples
            }
            
            return hasIngredients;
        });
        
        if (availableRecipes.length === 0) {
            // Si no hay recetas exactas, buscar las más cercanas
            return this.findClosestRecipe(mealType);
        }
        
        // Seleccionar receta aleatoria ponderada por adecuación al objetivo
        const scoredRecipes = availableRecipes.map(recipe => ({
            recipe,
            score: this.calculateRecipeScore(recipe)
        }));
        
        // Ordenar por score y tomar la mejor
        scoredRecipes.sort((a, b) => b.score - a.score);
        return scoredRecipes[0].recipe;
    }
    
    calculateRecipeScore(recipe) {
        let score = 100;
        
        // Ajustar según objetivo
        switch(this.userProfile.objective) {
            case 'muscle-gain':
                score += recipe.macros.protein * 2;
                break;
            case 'fat-loss':
                score -= recipe.calories / 10;
                score += recipe.macros.protein;
                break;
            case 'performance':
                score += recipe.macros.carbs;
                break;
        }
        
        // Ajustar según preferencias
        if (this.userProfile.preferences.includes('high-protein') && recipe.macros.protein > 20) {
            score += 50;
        }
        
        if (this.userProfile.preferences.includes('low-carb') && recipe.macros.carbs < 30) {
            score += 30;
        }
        
        if (this.userProfile.preferences.includes('quick') && recipe.prepTime <= 20) {
            score += 40;
        }
        
        return score;
    }
    
    hasIngredient(ingredientName) {
        // Buscar ingrediente en alimentos disponibles (con flexibilidad)
        return this.userProfile.availableFoods.some(food => {
            // Verificar si el alimento contiene el ingrediente o viceversa
            return food.includes(ingredientName) || ingredientName.includes(food);
        });
    }
    
    findClosestRecipe(mealType) {
        // Encontrar receta que use ingredientes similares
        const allRecipes = this.recipeDatabase.filter(r => r.mealType === mealType);
        
        const scoredRecipes = allRecipes.map(recipe => ({
            recipe,
            matchScore: this.calculateIngredientMatch(recipe.ingredients)
        }));
        
        scoredRecipes.sort((a, b) => b.matchScore - a.matchScore);
        
        // Si hay al menos un 50% de coincidencia, usar esa receta
        if (scoredRecipes[0].matchScore >= 50) {
            return scoredRecipes[0].recipe;
        }
        
        // Si no, generar receta simple con lo que tenemos
        return this.generateSimpleRecipe(mealType);
    }
    
    calculateIngredientMatch(ingredients) {
        const totalIngredients = ingredients.length;
        const matchingIngredients = ingredients.filter(ing => 
            this.hasIngredient(ing.name.toLowerCase())
        ).length;
        
        return (matchingIngredients / totalIngredients) * 100;
    }
    
    generateSimpleRecipe(mealType) {
        // Crear receta simple con ingredientes disponibles
        const availableIngredients = this.userProfile.availableFoods.slice(0, 5);
        
        return {
            id: 'simple-' + Date.now(),
            name: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Simple con ${availableIngredients[0]}`,
            description: `Receta rápida usando lo que tienes disponible`,
            mealType,
            difficulty: 1,
            prepTime: 15,
            servings: 1,
            ingredients: availableIngredients.map((ing, idx) => ({
                name: ing,
                quantity: idx === 0 ? '200g' : 'al gusto',
                unit: idx === 0 ? 'g' : ''
            })),
            instructions: this.generateSimpleInstructions(availableIngredients, mealType),
            macros: this.estimateMacros(availableIngredients),
            calories: this.estimateCalories(availableIngredients),
            tags: ['simple', 'rápido', 'con-ingredientes-disponibles']
        };
    }
    
    generateSimpleInstructions(ingredients, mealType) {
        const instructions = [];
        
        if (mealType === 'breakfast') {
            instructions.push(
                "En un bol, mezcla todos los ingredientes disponibles",
                "Calienta una sartén antiadherente a fuego medio",
                "Cocina la mezcla por ambos lados hasta que esté dorada",
                "Sirve caliente y disfruta"
            );
        } else if (mealType === 'lunch' || mealType === 'dinner') {
            instructions.push(
                "Prepara todos los ingredientes: lava y corta lo necesario",
                "En una sartén grande, saltea los ingredientes más duros primero",
                "Añade el resto de ingredientes y cocina hasta que estén tiernos",
                "Ajusta la sazón al gusto y sirve"
            );
        } else {
            instructions.push(
                "Mezcla todos los ingredientes en un recipiente",
                "Si es necesario, refrigera por 10 minutos",
                "Sirve y disfruta como snack saludable"
            );
        }
        
        return instructions.map((text, idx) => ({
            step: idx + 1,
            title: `Paso ${idx + 1}`,
            description: text,
            tip: idx === 0 ? "Usa ingredientes frescos para mejor sabor" : ""
        }));
    }
    
    estimateMacros(ingredients) {
        // Estimación simple basada en ingredientes comunes
        let protein = 0, carbs = 0, fat = 0;
        
        ingredients.forEach(ing => {
            if (ing.includes('pollo') || ing.includes('ternera') || ing.includes('pescado')) {
                protein += 25;
                fat += 5;
            } else if (ing.includes('huevo')) {
                protein += 6;
                fat += 5;
            } else if (ing.includes('arroz') || ing.includes('pasta') || ing.includes('patata')) {
                carbs += 30;
                protein += 3;
            } else if (ing.includes('queso')) {
                protein += 7;
                fat += 9;
            } else if (ing.includes('aguacate') || ing.includes('aceite')) {
                fat += 15;
            } else if (ing.includes('legumbre')) {
                protein += 8;
                carbs += 20;
            }
        });
        
        return { protein, carbs, fat };
    }
    
    estimateCalories(ingredients) {
        const macros = this.estimateMacros(ingredients);
        return (macros.protein * 4) + (macros.carbs * 4) + (macros.fat * 9);
    }
    
    generateWorkout() {
        // Generar rutina basada en objetivo
        const workouts = this.workoutDatabase[this.userProfile.objective];
        
        if (!workouts || workouts.length === 0) {
            return this.generateDefaultWorkout();
        }
        
        // Seleccionar workout aleatorio
        const randomIndex = Math.floor(Math.random() * workouts.length);
        return workouts[randomIndex];
    }
    
    generateDefaultWorkout() {
        return {
            focus: 'Full Body',
            duration: '45-60 minutos',
            exercises: [
                {
                    name: 'Sentadillas',
                    sets: '3x10-12',
                    rest: '60s',
                    target: 'Piernas y glúteos',
                    tips: 'Mantén la espalda recta y baja hasta que los muslos estén paralelos al suelo'
                },
                {
                    name: 'Flexiones',
                    sets: '3x8-12',
                    rest: '45s',
                    target: 'Pecho y tríceps',
                    tips: 'Mantén el cuerpo recto como una tabla'
                },
                {
                    name: 'Dominadas asistidas',
                    sets: '3x6-8',
                    rest: '90s',
                    target: 'Espalda y bíceps',
                    tips: 'Concéntrate en apretar los omóplatos'
                },
                {
                    name: 'Plancha',
                    sets: '3x30-45s',
                    rest: '30s',
                    target: 'Core completo',
                    tips: 'Mantén las caderas alineadas con los hombros'
                }
            ]
        };
    }
    
    async updateMealDisplay(mealType, recipe) {
        const container = document.querySelector(`.meal-slot[data-meal="${mealType}"] .meal-content`);
        
        if (!container) return;
        
        container.innerHTML = this.createRecipeHTML(recipe);
        
        // Añadir event listeners a los botones de la receta
        this.addRecipeEventListeners(recipe);
    }
    
    createRecipeHTML(recipe) {
        return `
            <div class="recipe-card" data-recipe-id="${recipe.id}">
                <div class="recipe-info">
                    <h3 class="recipe-title">${recipe.name}</h3>
                    <p class="recipe-description">${recipe.description}</p>
                    
                    <div class="recipe-meta">
                        <span class="recipe-difficulty ${this.getDifficultyClass(recipe.difficulty)}">
                            ${this.getDifficultyText(recipe.difficulty)}
                        </span>
                        <span class="recipe-time">
                            <i class="far fa-clock"></i> ${recipe.prepTime} min
                        </span>
                        <span class="recipe-servings">
                            <i class="fas fa-users"></i> ${recipe.servings} persona(s)
                        </span>
                    </div>
                    
                    <div class="recipe-instructions">
                        <h4><i class="fas fa-list-ol"></i> Preparación paso a paso:</h4>
                        ${recipe.instructions.map(step => `
                            <div class="instruction-step">
                                <div class="step-number">${step.step}</div>
                                <div class="step-content">
                                    <h4>${step.title}</h4>
                                    <p>${step.description}</p>
                                    ${step.tip ? `<p class="step-tip"><i class="fas fa-lightbulb"></i> ${step.tip}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="recipe-actions">
                        <button class="btn btn-primary save-recipe" data-recipe-id="${recipe.id}">
                            <i class="far fa-bookmark"></i> Guardar Receta
                        </button>
                        <button class="btn btn-secondary generate-variation" data-recipe-id="${recipe.id}">
                            <i class="fas fa-random"></i> Variación
                        </button>
                        <button class="btn btn-secondary add-to-shopping" data-recipe-id="${recipe.id}">
                            <i class="fas fa-cart-plus"></i> Comprar ingredientes
                        </button>
                    </div>
                </div>
                
                <div class="recipe-sidebar">
                    <h4><i class="fas fa-carrot"></i> Ingredientes:</h4>
                    <ul class="ingredients-list">
                        ${recipe.ingredients.map(ing => `
                            <li class="ingredient-item" data-ingredient="${ing.name.toLowerCase()}">
                                <span class="ingredient-name">
                                    <i class="fas fa-check-circle"></i>
                                    ${ing.name}
                                </span>
                                <span class="ingredient-quantity">${ing.quantity} ${ing.unit}</span>
                            </li>
                        `).join('')}
                    </ul>
                    
                    <div class="nutrition-facts">
                        <h4><i class="fas fa-chart-pie"></i> Información Nutricional (por porción):</h4>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Calorías</span>
                            <span class="nutrition-value">${recipe.calories} kcal</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Proteína</span>
                            <span class="nutrition-value">${recipe.macros.protein}g</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Carbohidratos</span>
                            <span class="nutrition-value">${recipe.macros.carbs}g</span>
                        </div>
                        <div class="nutrition-item">
                            <span class="nutrition-label">Grasas</span>
                            <span class="nutrition-value">${recipe.macros.fat}g</span>
                        </div>
                    </div>
                    
                    <div class="recipe-tags">
                        ${recipe.tags.map(tag => `
                            <span class="tag">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    addRecipeEventListeners(recipe) {
        // Guardar receta
        const saveBtn = document.querySelector(`.save-recipe[data-recipe-id="${recipe.id}"]`);
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveRecipe(recipe));
        }
        
        // Generar variación
        const variationBtn = document.querySelector(`.generate-variation[data-recipe-id="${recipe.id}"]`);
        if (variationBtn) {
            variationBtn.addEventListener('click', () => this.generateVariation(recipe));
        }
        
        // Añadir a lista de compras
        const shoppingBtn = document.querySelector(`.add-to-shopping[data-recipe-id="${recipe.id}"]`);
        if (shoppingBtn) {
            shoppingBtn.addEventListener('click', () => this.addToShoppingList(recipe));
        }
        
        // Resaltar ingredientes que tenemos
        document.querySelectorAll('.ingredient-item').forEach(item => {
            const ingredient = item.dataset.ingredient;
            if (this.hasIngredient(ingredient)) {
                item.classList.add('highlight');
            }
        });
    }
    
    updateWorkoutDisplay(workout) {
        const container = document.getElementById('workout-content');
        const focusEl = document.getElementById('workout-focus');
        
        if (!container || !focusEl) return;
        
        focusEl.textContent = workout.focus;
        
        container.innerHTML = `
            <div class="workout-info">
                <p><i class="far fa-clock"></i> Duración: ${workout.duration}</p>
                <p><i class="fas fa-fire"></i> Enfoque: ${workout.focus}</p>
            </div>
            
            <div class="exercises-list">
                ${workout.exercises.map((ex, idx) => `
                    <div class="exercise-item">
                        <div class="exercise-icon">
                            ${idx + 1}
                        </div>
                        <div class="exercise-details">
                            <h4 class="exercise-name">${ex.name}</h4>
                            <div class="exercise-sets">${ex.sets} - Descanso: ${ex.rest}</div>
                            <div class="exercise-target">${ex.target}</div>
                            ${ex.tips ? `<div class="exercise-tips"><i class="fas fa-lightbulb"></i> ${ex.tips}</div>` : ''}
                        </div>
                        <button class="btn btn-sm btn-secondary exercise-demo" data-exercise="${ex.name}">
                            <i class="fas fa-play"></i> Demo
                        </button>
                    </div>
                `).join('')}
            </div>
            
            <div class="workout-notes">
                <h4><i class="fas fa-sticky-note"></i> Notas importantes:</h4>
                <ul>
                    <li>Calienta 5-10 minutos antes de empezar</li>
                    <li>Mantén buena forma en todos los ejercicios</li>
                    <li>Hidrátate durante el entrenamiento</li>
                    <li>Estira después de terminar</li>
                </ul>
            </div>
        `;
        
        // Añadir event listeners para demos
        document.querySelectorAll('.exercise-demo').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exercise = e.target.closest('.exercise-demo').dataset.exercise;
                this.showExerciseDemo(exercise);
            });
        });
    }
    
    updateNutritionSummary(meals) {
        // Calcular totales
        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0
        };
        
        meals.forEach(meal => {
            totals.calories += meal.calories;
            totals.protein += meal.macros.protein;
            totals.carbs += meal.macros.carbs;
            totals.fat += meal.macros.fat;
        });
        
        // Calcular porcentajes
        const totalCals = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
        const proteinPercent = (totals.protein * 4 / totalCals) * 100;
        const carbsPercent = (totals.carbs * 4 / totalCals) * 100;
        const fatPercent = (totals.fat * 9 / totalCals) * 100;
        
        // Actualizar UI
        const container = document.querySelector('.macros-overview');
        if (!container) return;
        
        container.innerHTML = `
            <div class="macro-item">
                <div class="macro-label">Calorías</div>
                <div class="macro-value">${Math.round(totals.calories)} kcal</div>
            </div>
            <div class="macro-item">
                <div class="macro-label">Proteína</div>
                <div class="macro-bar">
                    <div class="macro-fill protein" style="width: ${proteinPercent}%"></div>
                </div>
                <div class="macro-value">${Math.round(totals.protein)}g (${Math.round(proteinPercent)}%)</div>
            </div>
            <div class="macro-item">
                <div class="macro-label">Carbohidratos</div>
                <div class="macro-bar">
                    <div class="macro-fill carbs" style="width: ${carbsPercent}%"></div>
                </div>
                <div class="macro-value">${Math.round(totals.carbs)}g (${Math.round(carbsPercent)}%)</div>
            </div>
            <div class="macro-item">
                <div class="macro-label">Grasas</div>
                <div class="macro-bar">
                    <div class="macro-fill fat" style="width: ${fatPercent}%"></div>
                </div>
                <div class="macro-value">${Math.round(totals.fat)}g (${Math.round(fatPercent)}%)</div>
            </div>
        `;
    }
    
    showResults() {
        // Mostrar todas las secciones de resultados
        document.querySelectorAll('.chef-results .card').forEach(card => {
            card.classList.remove('hidden');
        });
    }
    
    showLoading(show) {
        const resultsSection = document.querySelector('.chef-results');
        
        if (show) {
            resultsSection.innerHTML = `
                <div class="chef-loading">
                    <i class="fas fa-utensils fa-spin"></i>
                    <p>El Chef IA está preparando tu plan personalizado...</p>
                    <p class="loading-sub">Analizando alimentos disponibles y generando recetas</p>
                </div>
            `;
        }
    }
    
    showMessage(text, type = 'info') {
        const container = document.querySelector('.chef-config');
        
        // Remover mensajes existentes
        const existingMsg = container.querySelector('.chef-message');
        if (existingMsg) existingMsg.remove();
        
        // Crear nuevo mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `chef-message ${type}`;
        messageEl.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${text}</span>
        `;
        
        container.insertBefore(messageEl, container.firstChild);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }
    
    saveRecipe(recipe) {
        const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
        
        // Verificar si ya está guardada
        if (!savedRecipes.some(r => r.id === recipe.id)) {
            savedRecipes.push({
                ...recipe,
                savedDate: new Date().toISOString(),
                savedWith: this.userProfile.objective
            });
            
            localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
            this.showMessage('¡Receta guardada en tu colección!', 'success');
        } else {
            this.showMessage('Esta receta ya está en tu colección', 'info');
        }
    }
    
    generateVariation(originalRecipe) {
        // Crear variación cambiando algunos ingredientes
        const variation = { ...originalRecipe };
        variation.id = originalRecipe.id + '-var-' + Date.now();
        variation.name = originalRecipe.name + ' (Variación)';
        
        // Modificar algunos ingredientes
        if (variation.ingredients.length > 2) {
            const indexToChange = Math.floor(Math.random() * variation.ingredients.length);
            const alternatives = this.findIngredientAlternatives(variation.ingredients[indexToChange].name);
            
            if (alternatives.length > 0) {
                const newIngredient = alternatives[Math.floor(Math.random() * alternatives.length)];
                variation.ingredients[indexToChange] = {
                    name: newIngredient,
                    quantity: variation.ingredients[indexToChange].quantity,
                    unit: variation.ingredients[indexToChange].unit
                };
                
                variation.description = `Variación de ${originalRecipe.name} con ${newIngredient}`;
            }
        }
        
        // Actualizar la receta en pantalla
        this.updateMealDisplay(originalRecipe.mealType, variation);
        this.showMessage('¡Variación generada!', 'success');
    }
    
    findIngredientAlternatives(ingredient) {
        // Mapeo de alternativas comunes
        const alternatives = {
            'pollo': ['pavo', 'ternera', 'tofu', 'seitán'],
            'ternera': ['pollo', 'pavo', 'cerdo', 'tofu'],
            'pescado': ['pollo', 'tofu', 'gambas', 'calamar'],
            'huevo': ['tofu', 'garbanzos', 'linaza'],
            'arroz': ['quinoa', 'bulgur', 'couscous', 'mijo'],
            'pasta': ['arroz', 'quinoa', 'pasta de lentejas', 'calabacín espiralizado'],
            'patata': ['boniato', 'calabaza', 'zanahoria', 'ñame'],
            'queso': ['tofu', 'levadura nutricional', 'queso vegano'],
            'leche': ['leche de almendras', 'leche de avena', 'leche de coco']
        };
        
        const lowerIngredient = ingredient.toLowerCase();
        
        for (const [key, values] of Object.entries(alternatives)) {
            if (lowerIngredient.includes(key)) {
                return values.filter(alt => this.hasIngredient(alt));
            }
        }
        
        return [];
    }
    
    addToShoppingList(recipe) {
        const shoppingList = JSON.parse(localStorage.getItem('shoppingList') || '[]');
        
        recipe.ingredients.forEach(ing => {
            // Verificar si ya está en la lista
            const exists = shoppingList.some(item => 
                item.name.toLowerCase() === ing.name.toLowerCase()
            );
            
            if (!exists) {
                shoppingList.push({
                    name: ing.name,
                    quantity: ing.quantity,
                    category: this.categorizeIngredient(ing.name),
                    priority: 'medium',
                    addedFrom: 'chef-ia'
                });
            }
        });
        
        localStorage.setItem('shoppingList', JSON.stringify(shoppingList));
        
        // Actualizar alimentos disponibles
        this.userProfile.availableFoods = [
            ...this.userProfile.availableFoods,
            ...recipe.ingredients.map(ing => ing.name.toLowerCase())
        ];
        this.updateAvailableFoodsDisplay();
        
        this.showMessage(`${recipe.ingredients.length} ingredientes añadidos a la lista de compras`, 'success');
    }
    
    categorizeIngredient(ingredient) {
        const lower = ingredient.toLowerCase();
        
        if (lower.includes('pollo') || lower.includes('ternera') || lower.includes('pescado') || lower.includes('huevo')) {
            return 'proteina';
        } else if (lower.includes('arroz') || lower.includes('pasta') || lower.includes('patata') || lower.includes('pan')) {
            return 'carbohidratos';
        } else if (lower.includes('aceite') || lower.includes('aguacate') || lower.includes('fruto seco')) {
            return 'grasas';
        } else if (lower.includes('brócoli') || lower.includes('espinaca') || lower.includes('pimiento') || lower.includes('cebolla')) {
            return 'vegetales';
        } else if (lower.includes('queso') || lower.includes('yogur') || lower.includes('leche')) {
            return 'lacteos';
        } else {
            return 'otros';
        }
    }
    
    showExerciseDemo(exerciseName) {
        // Aquí podrías integrar con una API de videos o mostrar GIFs
        const demoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' ejercicio correcta forma')}`;
        
        this.showMessage(`Buscando demostración de ${exerciseName}... Abriendo en nueva pestaña`, 'info');
        
        // Abrir en nueva pestaña
        window.open(demoUrl, '_blank');
    }
    
    saveToHistory(plan) {
        const history = JSON.parse(localStorage.getItem('chefHistory') || '[]');
        history.unshift(plan); // Añadir al inicio
        
        // Mantener solo los últimos 50 planes
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem('chefHistory', JSON.stringify(history));
    }
    
    loadUserPreferences() {
        const saved = localStorage.getItem('chefPreferences');
        if (saved) {
            this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
            this.updateUIFromProfile();
        }
    }
    
    saveUserPreferences() {
        localStorage.setItem('chefPreferences', JSON.stringify(this.userProfile));
    }
    
    updateUIFromProfile() {
        // Actualizar botones de objetivo
        document.querySelectorAll('.objective-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.objective === this.userProfile.objective);
        });
        
        // Actualizar chips de preferencias
        document.querySelectorAll('.chip').forEach(chip => {
            chip.classList.toggle('active', 
                this.userProfile.preferences.includes(chip.dataset.pref)
            );
        });
        
        // Actualizar slider de nivel
        document.querySelector('.skill-slider-input').value = this.userProfile.skillLevel;
        document.querySelectorAll('.skill-level').forEach((el, idx) => {
            el.classList.toggle('active', idx === this.userProfile.skillLevel - 1);
        });
        
        // Actualizar alimentos disponibles
        this.updateAvailableFoodsDisplay();
    }
    
    changeDay(delta) {
        this.currentDay += delta;
        this.updateDateDisplay();
        
        // Aquí podrías cargar un plan diferente para ese día
        // Por ahora, solo actualizamos la fecha
    }
    
    updateDateDisplay() {
        const date = new Date();
        date.setDate(date.getDate() + this.currentDay);
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = date.toLocaleDateString('es-ES', options);
        
        const dateEl = document.getElementById('current-date');
        if (dateEl) {
            dateEl.textContent = dateStr;
        }
    }
    
    getDifficultyClass(level) {
        switch(level) {
            case 1: return 'beginner';
            case 2: return 'intermediate';
            case 3: return 'advanced';
            default: return 'beginner';
        }
    }
    
    getDifficultyText(level) {
        switch(level) {
            case 1: return 'Principiante';
            case 2: return 'Intermedio';
            case 3: return 'Avanzado';
            default: return 'Principiante';
        }
    }
    
    initializeRecipeDatabase() {
        // Base de datos de recetas (se puede ampliar mucho más)
        return [
            {
                id: 'recipe-1',
                name: 'Tortilla de Espinacas y Queso Feta',
                description: 'Tortilla esponjosa cargada de espinacas frescas y queso feta desmenuzado. Perfecta para un desayuno proteico.',
                mealType: 'breakfast',
                difficulty: 1,
                prepTime: 15,
                servings: 1,
                ingredients: [
                    { name: 'Huevos', quantity: '2', unit: 'unidades' },
                    { name: 'Espinacas frescas', quantity: '50', unit: 'g' },
                    { name: 'Queso feta', quantity: '30', unit: 'g' },
                    { name: 'Aceite de oliva', quantity: '1', unit: 'cucharada' },
                    { name: 'Sal', quantity: 'al gusto', unit: '' },
                    { name: 'Pimienta', quantity: 'al gusto', unit: '' }
                ],
                instructions: [
                    {
                        step: 1,
                        title: 'Preparar los ingredientes',
                        description: 'Lava bien las espinacas y pícalas groseramente. Desmenuza el queso feta con las manos.',
                        tip: 'Secar bien las espinacas para que no suelten agua en la tortilla'
                    },
                    {
                        step: 2,
                        title: 'Batir los huevos',
                        description: 'En un bol, casca los dos huevos. Añade una pizca de sal y pimienta. Bate vigorosamente con un tenedor hasta que estén bien mezclados.',
                        tip: 'Batir bien los huevos hace que la tortilla quede más esponjosa'
                    },
                    {
                        step: 3,
                        title: 'Mezclar con verduras y queso',
                        description: 'Añade las espinacas picadas y el queso feta desmenuzado a los huevos batidos. Mezcla suavemente.',
                        tip: 'No mezcles demasiado para no romper las espinacas'
                    },
                    {
                        step: 4,
                        title: 'Cocinar la tortilla',
                        description: 'Calienta una sartén antiadherente a fuego medio-bajo con el aceite de oliva. Cuando esté caliente, vierte la mezcla. Cocina 3-4 minutos hasta que los bordes empiecen a cuajar.',
                        tip: 'Fuego bajo para que se cocine uniformemente sin quemarse'
                    },
                    {
                        step: 5,
                        title: 'Dar la vuelta y terminar',
                        description: 'Con una espátula, voltea la tortilla con cuidado. Cocina otros 2-3 minutos hasta que esté completamente cuajada pero jugosa.',
                        tip: 'Si te cuesta voltearla, puedes cortarla en cuartos y darles la vuelta por separado'
                    },
                    {
                        step: 6,
                        title: 'Servir',
                        description: 'Desliza la tortilla a un plato. Sirve inmediatamente, caliente. Puedes acompañar con una rebanada de pan integral tostado.',
                        tip: 'Añadir unas gotas de limón fresco realza los sabores'
                    }
                ],
                macros: { protein: 22, carbs: 3, fat: 18 },
                calories: 280,
                tags: ['rápido', 'proteico', 'vegetariano', 'desayuno']
            },
            {
                id: 'recipe-2',
                name: 'Pollo al Curry con Arroz',
                description: 'Pollo tierno en salsa de curry cremosa con especias, servido con arroz blanco esponjoso.',
                mealType: 'lunch',
                difficulty: 2,
                prepTime: 30,
                servings: 2,
                ingredients: [
                    { name: 'Pechuga de pollo', quantity: '300', unit: 'g' },
                    { name: 'Arroz blanco', quantity: '150', unit: 'g' },
                    { name: 'Cebolla', quantity: '1', unit: 'unidad' },
                    { name: 'Ajo', quantity: '2', unit: 'dientes' },
                    { name: 'Leche de coco', quantity: '200', unit: 'ml' },
                    { name: 'Pasta de curry', quantity: '2', unit: 'cucharadas' },
                    { name: 'Aceite de oliva', quantity: '2', unit: 'cucharadas' },
                    { name: 'Sal', quantity: 'al gusto', unit: '' }
                ],
                instructions: [
                    {
                        step: 1,
                        title: 'Cocinar el arroz',
                        description: 'Lava el arroz bajo el grifo hasta que el agua salga clara. Hierve 2 tazas de agua con una pizca de sal, añade el arroz, tapa y cocina a fuego bajo 15 minutos. Apaga y deja reposar 5 minutos.',
                        tip: 'No destapar el arroz mientras se cocina para que quede esponjoso'
                    },
                    {
                        step: 2,
                        title: 'Preparar el pollo',
                        description: 'Corta el pollo en cubos de 2-3 cm. Sazona con sal. Pica finamente la cebolla y el ajo.',
                        tip: 'Cortar el pollo en piezas uniformes para que se cocinen igual'
                    },
                    {
                        step: 3,
                        title: 'Sofreír cebolla y ajo',
                        description: 'Calienta el aceite en una sartén grande. Añade la cebolla y cocina a fuego medio 5 minutos hasta que esté transparente. Añade el ajo y cocina 1 minuto más.',
                        tip: 'No dejar que el ajo se queme o amargará el plato'
                    },
                    {
                        step: 4,
                        title: 'Cocinar el pollo',
                        description: 'Añade el pollo a la sartén y sube el fuego. Dorar por todos lados durante 5-6 minutos hasta que esté sellado.',
                        tip: 'No mover el pollo demasiado para que se dore bien'
                    },
                    {
                        step: 5,
                        title: 'Añadir el curry',
                        description: 'Baja el fuego. Añade la pasta de curry y mezcla bien con el pollo durante 1 minuto para que libere sus aromas.',
                        tip: 'Tostar la pasta de curry realza su sabor'
                    },
                    {
                        step: 6,
                        title: 'Crear la salsa',
                        description: 'Vierte la leche de coco. Remueve bien para desglasar el fondo de la sartén. Deja cocer a fuego lento 10 minutos hasta que la salsa espese.',
                        tip: 'Raspar el fondo de la sartén para incorporar todos los sabores'
                    },
                    {
                        step: 7,
                        title: 'Servir',
                        description: 'Sirve el pollo al curry sobre el arroz. Decora con cilantro fresco si lo tienes.',
                        tip: 'Dejar reposar 2 minutos antes de servir para que los sabores se integren'
                    }
                ],
                macros: { protein: 45, carbs: 70, fat: 25 },
                calories: 680,
                tags: ['completo', 'especiado', 'sabroso', 'almuerzo']
            },
            {
                id: 'recipe-3',
                name: 'Salmón al Horno con Brócoli',
                description: 'Filete de salmón horneado con limón y eneldo, acompañado de brócoli al dente.',
                mealType: 'dinner',
                difficulty: 1,
                prepTime: 25,
                servings: 1,
                ingredients: [
                    { name: 'Filete de salmón', quantity: '200', unit: 'g' },
                    { name: 'Brócoli', quantity: '200', unit: 'g' },
                    { name: 'Limón', quantity: '0.5', unit: 'unidad' },
                    { name: 'Aceite de oliva', quantity: '2', unit: 'cucharadas' },
                    { name: 'Eneldo seco', quantity: '1', unit: 'cucharadita' },
                    { name: 'Ajo en polvo', quantity: '0.5', unit: 'cucharadita' },
                    { name: 'Sal', quantity: 'al gusto', unit: '' }
                ],
                instructions: [
                    {
                        step: 1,
                        title: 'Precalentar el horno',
                        description: 'Precalienta el horno a 200°C (400°F). Forra una bandeja de horno con papel de hornear.',
                        tip: 'Precalentar bien el horno es clave para una cocción uniforme'
                    },
                    {
                        step: 2,
                        title: 'Preparar el brócoli',
                        description: 'Lava el brócoli y sepáralo en floretes pequeños. Colócalo en un bol y mezcla con 1 cucharada de aceite de oliva, ajo en polvo y sal.',
                        tip: 'Floretes pequeños se cocinan más rápido y uniformemente'
                    },
                    {
                        step: 3,
                        title: 'Sazonar el salmón',
                        description: 'Coloca el filete de salmón en la bandeja de horno. Rocía con el resto del aceite de oliva. Espolvorea con eneldo y sal. Corta el limón en rodajas finas.',
                        tip: 'Secar el salmón con papel de cocina para que se dore mejor'
                    },
                    {
                        step: 4,
                        title: 'Colocar las rodajas de limón',
                        description: 'Coloca 2-3 rodajas de limón sobre el salmón. Las demás rodajas repártelas alrededor en la bandeja.',
                        tip: 'El limón bajo el salmón también le da sabor'
                    },
                    {
                        step: 5,
                        title: 'Hornear',
                        description: 'Coloca el brócoli alrededor del salmón. Hornea durante 12-15 minutos. El salmón debe estar opaco y desmenuzarse fácilmente.',
                        tip: 'No sobrecocinar el salmón o quedará seco'
                    },
                    {
                        step: 6,
                        title: 'Servir',
                        description: 'Sirve inmediatamente. Exprime el jugo del limón restante sobre el plato al servir.',
                        tip: 'El salmón debe estar jugoso por dentro'
                    }
                ],
                macros: { protein: 42, carbs: 12, fat: 28 },
                calories: 480,
                tags: ['ligero', 'omega-3', 'saludable', 'cena']
            },
            {
                id: 'recipe-4',
                name: 'Yogur con Frutos Secos y Miel',
                description: 'Yogur griego cremoso con mezcla de frutos secos crujientes y un toque de miel natural.',
                mealType: 'snack',
                difficulty: 1,
                prepTime: 5,
                servings: 1,
                ingredients: [
                    { name: 'Yogur griego natural', quantity: '200', unit: 'g' },
                    { name: 'Almendras', quantity: '15', unit: 'g' },
                    { name: 'Nueces', quantity: '10', unit: 'g' },
                    { name: 'Miel', quantity: '1', unit: 'cucharadita' },
                    { name: 'Canela en polvo', quantity: 'una pizca', unit: '' }
                ],
                instructions: [
                    {
                        step: 1,
                        title: 'Preparar los frutos secos',
                        description: 'Pica groseramente las almendras y nueces. Puedes tostarlas ligeramente en una sartén sin aceite durante 2 minutos para realzar su sabor.',
                        tip: 'Tostar los frutos secos los hace más digestivos y sabrosos'
                    },
                    {
                        step: 2,
                        title: 'Montar el yogur',
                        description: 'Coloca el yogur griego en un bol o tarro de cristal.',
                        tip: 'Usar yogur griego para mayor proteína y cremosidad'
                    },
                    {
                        step: 3,
                        title: 'Añadir los toppings',
                        description: 'Esparce los frutos secos picados sobre el yogur. Rocía con la miel y espolvorea con canela.',
                        tip: 'Colocar la miel en el centro para que se distribuya al comer'
                    },
                    {
                        step: 4,
                        title: 'Servir',
                        description: 'Mezcla justo antes de comer para mantener los frutos secos crujientes.',
                        tip: 'Puedes añadir fruta fresca como plátano o frutos rojos'
                    }
                ],
                macros: { protein: 20, carbs: 18, fat: 15 },
                calories: 280,
                tags: ['rápido', 'proteico', 'dulce', 'snack']
            }
            // Se pueden añadir muchas más recetas aquí
        ];
    }
    
    initializeWorkoutDatabase() {
        return {
            'muscle-gain': [
                {
                    focus: 'Fuerza e Hipertrofia',
                    duration: '60-75 minutos',
                    exercises: [
                        { name: 'Press de Banca', sets: '4x6-8', rest: '120s', target: 'Pecho, hombros, tríceps' },
                        { name: 'Sentadillas con Barra', sets: '4x6-8', rest: '120s', target: 'Piernas completas' },
                        { name: 'Peso Muerto', sets: '3x5', rest: '150s', target: 'Espalda baja, glúteos' },
                        { name: 'Dominadas con Peso', sets: '3x6-8', rest: '90s', target: 'Espalda, bíceps' },
                        { name: 'Press Militar', sets: '3x8-10', rest: '90s', target: 'Hombros' }
                    ]
                }
            ],
            'fat-loss': [
                {
                    focus: 'Quema de Grasa - Circuito',
                    duration: '45 minutos',
                    exercises: [
                        { name: 'Burpees', sets: '3x15', rest: '30s', target: 'Full body, cardio' },
                        { name: 'Mountain Climbers', sets: '3x30s', rest: '20s', target: 'Core, cardio' },
                        { name: 'Saltos de Caja', sets: '3x12', rest: '45s', target: 'Piernas, potencia' },
                        { name: 'Kettlebell Swings', sets: '3x20', rest: '40s', target: 'Glúteos, cardio' },
                        { name: 'Battle Ropes', sets: '3x30s', rest: '30s', target: 'Brazos, cardio' }
                    ]
                }
            ],
            'maintenance': [
                {
                    focus: 'Full Body Mantenimiento',
                    duration: '50 minutos',
                    exercises: [
                        { name: 'Press Inclinado con Mancuernas', sets: '3x10-12', rest: '75s', target: 'Pecho superior' },
                        { name: 'Prensa de Piernas', sets: '3x12-15', rest: '75s', target: 'Cuádriceps' },
                        { name: 'Remo con Barra', sets: '3x10-12', rest: '75s', target: 'Espalda media' },
                        { name: 'Curl de Bíceps', sets: '3x12-15', rest: '60s', target: 'Bíceps' },
                        { name: 'Extensiones de Tríceps', sets: '3x12-15', rest: '60s', target: 'Tríceps' }
                    ]
                }
            ],
            'performance': [
                {
                    focus: 'Rendimiento Deportivo',
                    duration: '70 minutos',
                    exercises: [
                        { name: 'Power Cleans', sets: '5x3', rest: '180s', target: 'Potencia explosiva' },
                        { name: 'Box Jumps', sets: '4x6', rest: '90s', target: 'Potencia de piernas' },
                        { name: 'Push Press', sets: '4x5', rest: '120s', target: 'Fuerza explosiva de hombros' },
                        { name: 'Sprints en Cuesta', sets: '8x20m', rest: '60s', target: 'Velocidad, potencia' },
                        { name: 'Plank con Toques de Hombro', sets: '3x45s', rest: '45s', target: 'Core estabilidad' }
                    ]
                }
            ]
        };
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const chefIA = new ChefIA();
    window.chefIA = chefIA; // Hacer accesible desde la consola si es necesario
    
    // Actualizar fecha actual
    chefIA.updateDateDisplay();
});
