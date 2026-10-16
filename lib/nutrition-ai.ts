export interface FoodItem {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
  quantity: string
  mealType: "breakfast" | "lunch" | "snack" | "dinner"
  date: Date
}

export interface UserProfile {
  weight: number
  height: number
  age: number
  gender: "male" | "female"
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active"
  goal: "lose" | "maintain" | "gain"
}

export interface Exercise {
  id: string
  name: string
  duration: number // minutes
  caloriesBurned: number
  date: Date
}

export interface WeightEntry {
  id: string
  weight: number
  date: Date
}

// Simula análise de comida com IA
export async function analyzeFoodWithAI(
  foodDescription: string,
  mealType: "breakfast" | "lunch" | "snack" | "dinner",
): Promise<FoodItem> {
  // Simula delay de API
  await new Promise((resolve) => setTimeout(resolve, 1000))

  if (!isValidFoodDescription(foodDescription)) {
    return {
      id: Date.now().toString(),
      name: "Entrada inválida",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      quantity: "Por favor, descreva um alimento válido",
      mealType,
      date: new Date(),
    }
  }

  // Base de dados expandida de alimentos comuns com mais variedade
  const foodDatabase: { [key: string]: Omit<FoodItem, "id" | "name" | "mealType" | "date"> } = {
    // Proteínas
    frango: { calories: 165, protein: 31, carbs: 0, fat: 3.6, quantity: "100g" },
    salmão: { calories: 208, protein: 20, carbs: 0, fat: 13, quantity: "100g" },
    atum: { calories: 144, protein: 30, carbs: 0, fat: 1, quantity: "100g" },
    ovo: { calories: 155, protein: 13, carbs: 1.1, fat: 11, quantity: "1 unidade" },
    carne: { calories: 250, protein: 26, carbs: 0, fat: 15, quantity: "100g" },
    peixe: { calories: 180, protein: 25, carbs: 0, fat: 8, quantity: "100g" },

    // Carboidratos
    arroz: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, quantity: "100g" },
    massa: { calories: 131, protein: 5, carbs: 25, fat: 1.1, quantity: "100g" },
    batata: { calories: 77, protein: 2, carbs: 17, fat: 0.1, quantity: "100g" },
    pão: { calories: 265, protein: 9, carbs: 49, fat: 3.2, quantity: "100g" },
    aveia: { calories: 389, protein: 17, carbs: 66, fat: 7, quantity: "100g" },
    quinoa: { calories: 120, protein: 4.4, carbs: 22, fat: 1.9, quantity: "100g" },

    // Frutas
    banana: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, quantity: "1 unidade" },
    maçã: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, quantity: "1 unidade" },
    laranja: { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, quantity: "1 unidade" },
    morango: { calories: 32, protein: 0.7, carbs: 8, fat: 0.3, quantity: "100g" },
    uva: { calories: 62, protein: 0.6, carbs: 16, fat: 0.2, quantity: "100g" },

    // Vegetais
    brócolos: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, quantity: "100g" },
    espinafre: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, quantity: "100g" },
    tomate: { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, quantity: "100g" },
    cenoura: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, quantity: "100g" },
    alface: { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.1, quantity: "100g" },

    // Laticínios
    leite: { calories: 42, protein: 3.4, carbs: 5, fat: 1, quantity: "100ml" },
    iogurte: { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, quantity: "100g" },
    queijo: { calories: 113, protein: 25, carbs: 4.1, fat: 0.2, quantity: "100g" },

    // Snacks e outros
    amendoim: { calories: 567, protein: 26, carbs: 16, fat: 49, quantity: "100g" },
    chocolate: { calories: 546, protein: 4.9, carbs: 61, fat: 31, quantity: "100g" },
    biscoito: { calories: 502, protein: 5.8, carbs: 62, fat: 25, quantity: "100g" },
    café: { calories: 2, protein: 0.3, carbs: 0, fat: 0, quantity: "1 chávena" },
    chá: { calories: 1, protein: 0, carbs: 0.3, fat: 0, quantity: "1 chávena" },
  }

  const searchTerm = foodDescription.toLowerCase()
  let matchedFood = null
  let confidence = 0

  // Procura por correspondências mais inteligentes
  for (const [key, value] of Object.entries(foodDatabase)) {
    if (searchTerm.includes(key)) {
      matchedFood = { name: key, ...value }
      confidence = 0.9
      break
    } else if (key.includes(searchTerm.split(" ")[0])) {
      matchedFood = { name: key, ...value }
      confidence = 0.7
    }
  }

  // Análise mais inteligente baseada em palavras-chave
  if (!matchedFood) {
    if (searchTerm.includes("grelhado") || searchTerm.includes("assado")) {
      matchedFood = { name: "Frango grelhado", calories: 165, protein: 31, carbs: 0, fat: 3.6, quantity: "100g" }
    } else if (searchTerm.includes("salada")) {
      matchedFood = { name: "Salada mista", calories: 25, protein: 2, carbs: 5, fat: 0.2, quantity: "100g" }
    } else if (searchTerm.includes("sopa")) {
      matchedFood = { name: "Sopa de legumes", calories: 45, protein: 2, carbs: 8, fat: 1, quantity: "100ml" }
    } else if (searchTerm.includes("sanduíche") || searchTerm.includes("sandwich")) {
      matchedFood = { name: "Sanduíche", calories: 250, protein: 12, carbs: 30, fat: 8, quantity: "1 unidade" }
    } else {
      // Valores estimados baseados no tipo de refeição
      const mealDefaults = {
        breakfast: { calories: 200, protein: 8, carbs: 30, fat: 6 },
        lunch: { calories: 400, protein: 25, carbs: 45, fat: 12 },
        snack: { calories: 100, protein: 3, carbs: 15, fat: 4 },
        dinner: { calories: 350, protein: 20, carbs: 35, fat: 10 },
      }

      const defaults = mealDefaults[mealType]
      matchedFood = {
        name: foodDescription,
        ...defaults,
        quantity: "porção estimada",
      }
    }
  }

  // Ajusta quantidades baseadas em números mencionados na descrição
  const quantityMatch = foodDescription.match(/(\d+)\s*(g|kg|ml|l|unidade|fatia)/i)
  if (quantityMatch) {
    const amount = Number.parseInt(quantityMatch[1])
    const unit = quantityMatch[2].toLowerCase()

    let multiplier = 1
    if (unit === "kg") multiplier = 10
    else if (unit === "l") multiplier = 10
    else if (amount !== 100 && (unit === "g" || unit === "ml")) multiplier = amount / 100

    if (multiplier !== 1) {
      matchedFood.calories = Math.round(matchedFood.calories * multiplier)
      matchedFood.protein = Math.round(matchedFood.protein * multiplier * 10) / 10
      matchedFood.carbs = Math.round(matchedFood.carbs * multiplier * 10) / 10
      matchedFood.fat = Math.round(matchedFood.fat * multiplier * 10) / 10
      matchedFood.quantity = `${amount}${unit}`
    }
  }

  return {
    id: Date.now().toString(),
    ...matchedFood,
    mealType,
    date: new Date(),
  }
}

// Calcula metabolismo basal (BMR)
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile

  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
  }
}

// Calcula gasto energético total diário (TDEE)
export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile)
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }

  return bmr * activityMultipliers[profile.activityLevel]
}

export function calculateExerciseCalories(exerciseName: string, duration: number, weight: number): number {
  // First validate if the exercise name is valid
  if (!isValidExercise(exerciseName)) {
    return 0 // Return 0 calories for invalid exercises
  }

  const metValues: { [key: string]: number } = {
    // Cardio básico
    caminhada: 3.5,
    andar: 3.5,
    walk: 3.5,
    corrida: 8.0,
    correr: 8.0,
    running: 8.0,
    jogging: 6.0,

    // Exercícios aquáticos
    hidroginástica: 4.0,
    hidroginastica: 4.0,
    aqua: 4.0,
    "aqua aeróbica": 4.0,
    "aqua aerobica": 4.0,
    natação: 6.0,
    nadar: 6.0,
    swimming: 6.0,
    "natação livre": 7.0,
    "natação costas": 5.5,
    "natação peito": 6.5,
    "natação borboleta": 9.0,

    // Ciclismo
    ciclismo: 7.5,
    bicicleta: 7.5,
    bike: 7.5,
    cycling: 7.5,
    pedalar: 7.5,
    "bicicleta estática": 6.0,
    spinning: 8.5,

    // Ginásio e musculação
    ginásio: 5.0,
    ginasio: 5.0,
    academia: 5.0,
    gym: 5.0,
    musculação: 5.5,
    musculacao: 5.5,
    weights: 5.5,
    pesos: 5.5,
    "treino de força": 6.0,
    "levantamento de pesos": 6.0,
    crossfit: 8.0,

    // Cardio equipamentos
    passadeira: 6.0,
    treadmill: 6.0,
    elíptica: 5.0,
    eliptica: 5.0,
    elliptical: 5.0,
    "máquina de remo": 6.0,
    remo: 6.0,
    rowing: 6.0,
    stepper: 5.5,

    // Exercícios de flexibilidade e mente-corpo
    yoga: 2.5,
    pilates: 3.0,
    stretching: 2.0,
    alongamento: 2.0,
    tai: 2.5,
    "tai chi": 2.5,
    meditação: 1.0,
    "meditação ativa": 1.5,

    // Dança e aeróbica
    dança: 4.5,
    dance: 4.5,
    zumba: 6.5,
    aeróbica: 5.0,
    aerobica: 5.0,
    aerobics: 5.0,
    "step aeróbica": 6.0,
    "step aerobica": 6.0,
    "dança de salão": 3.5,
    ballet: 4.0,

    // Desportos de equipa
    futebol: 7.0,
    football: 7.0,
    soccer: 7.0,
    basquetebol: 6.5,
    basketball: 6.5,
    voleibol: 4.0,
    volleyball: 4.0,
    andebol: 6.0,
    handball: 6.0,
    rugby: 8.0,

    // Desportos de raquete
    ténis: 5.0,
    tennis: 5.0,
    "ténis de mesa": 3.0,
    "ping pong": 3.0,
    badminton: 4.5,
    squash: 7.0,
    padel: 5.5,

    // Artes marciais e combate
    boxe: 9.0,
    boxing: 9.0,
    kickboxing: 8.0,
    karaté: 6.0,
    karate: 6.0,
    judo: 6.0,
    "jiu-jitsu": 6.5,
    taekwondo: 6.0,
    muay: 8.0,
    "muay thai": 8.0,

    // Atividades ao ar livre
    escalada: 8.0,
    climbing: 8.0,
    montanhismo: 7.0,
    hiking: 5.0,
    caminhada: 4.0,
    "caminhada montanha": 6.0,
    surf: 3.0,
    windsurf: 4.0,
    kitesurf: 5.0,
    esqui: 6.0,
    snowboard: 5.5,

    // Outros exercícios
    corda: 8.0,
    "saltar corda": 8.0,
    "jump rope": 8.0,
    trampolim: 4.0,
    trampoline: 4.0,
    patinagem: 4.0,
    skating: 4.0,
    "patins em linha": 6.0,
    rollerblading: 6.0,

    // Exercícios funcionais
    burpees: 8.0,
    "jumping jacks": 6.0,
    "mountain climbers": 7.0,
    plancha: 3.0,
    plank: 3.0,
    agachamentos: 4.0,
    squats: 4.0,
    flexões: 4.0,
    "push ups": 4.0,
    abdominais: 3.5,
    "sit ups": 3.5,

    // Atividades recreativas
    bowling: 2.5,
    golfe: 3.0,
    golf: 3.0,
    bilhar: 2.0,
    pool: 2.0,
    dardos: 2.0,
    darts: 2.0,

    // Trabalho doméstico ativo
    jardinagem: 3.0,
    gardening: 3.0,
    limpeza: 2.5,
    cleaning: 2.5,
    aspirar: 2.5,
    "passar ferro": 2.0,
    "lavar carro": 3.0,
  }

  const searchTerm = exerciseName.toLowerCase().trim()
  let met = 0

  // First try exact match
  if (metValues[searchTerm]) {
    met = metValues[searchTerm]
  } else {
    // Then try partial matches
    for (const [key, value] of Object.entries(metValues)) {
      if (searchTerm.includes(key) || key.includes(searchTerm)) {
        met = value
        break
      }
    }

    // Special cases for common variations
    if (met === 0) {
      if (searchTerm.includes("hidro")) {
        met = 4.0 // hidroginástica
      } else if (searchTerm.includes("aero")) {
        met = 5.0 // aeróbica
      } else if (searchTerm.includes("cardio")) {
        met = 5.5 // cardio genérico
      } else if (searchTerm.includes("treino")) {
        met = 5.0 // treino genérico
      }
    }
  }

  // If no match found, return 0 calories
  if (met === 0) {
    return 0
  }

  // Fórmula: Calorias = MET × peso (kg) × tempo (horas)
  return Math.round(met * weight * (duration / 60))
}

// Estima perda de peso baseada no défice calórico
export function estimateWeightLoss(dailyCalorieDeficit: number, days: number): number {
  // 1 kg de gordura ≈ 7700 calorias
  const totalDeficit = dailyCalorieDeficit * days
  return totalDeficit / 7700
}

// Gera dicas personalizadas
export function generateWeightLossTips(
  currentCalories: number,
  targetCalories: number,
  recentProgress: number,
): string[] {
  const tips = []

  if (currentCalories > targetCalories) {
    tips.push("Considere reduzir as porções ou escolher alimentos menos calóricos")
    tips.push("Adicione mais vegetais às suas refeições para se sentir saciado")
  }

  if (recentProgress < 0.1) {
    tips.push("Tente aumentar a atividade física diária")
    tips.push("Mantenha-se hidratado - beba pelo menos 2L de água por dia")
  }

  tips.push("Durma 7-8 horas por noite para otimizar o metabolismo")
  tips.push("Faça refeições regulares para manter o metabolismo ativo")

  return tips.slice(0, 3)
}

function isValidExercise(exerciseName: string): boolean {
  const text = exerciseName.toLowerCase().trim()

  // Reject very short entries (less than 3 characters)
  if (text.length < 3) return false

  // Reject single letters or just numbers
  if (/^[a-z]$/.test(text) || /^\d+$/.test(text)) return false

  // List of exercise-related keywords
  const exerciseKeywords = [
    "caminhada",
    "andar",
    "walk",
    "corrida",
    "correr",
    "running",
    "jogging",
    "hidroginástica",
    "hidroginastica",
    "aqua",
    "aqua aeróbica",
    "aqua aerobica",
    "natação",
    "nadar",
    "swimming",
    "natação livre",
    "natação costas",
    "natação peito",
    "natação borboleta",
    "ciclismo",
    "bicicleta",
    "bike",
    "cycling",
    "pedalar",
    "bicicleta estática",
    "ginásio",
    "ginasio",
    "academia",
    "gym",
    "musculação",
    "musculacao",
    "weights",
    "pesos",
    "treino de força",
    "levantamento de pesos",
    "crossfit",
    "passadeira",
    "treadmill",
    "elíptica",
    "eliptica",
    "elliptical",
    "máquina de remo",
    "remo",
    "rowing",
    "stepper",
    "yoga",
    "pilates",
    "stretching",
    "alongamento",
    "tai",
    "tai chi",
    "meditação",
    "meditação ativa",
    "dança",
    "dance",
    "zumba",
    "aeróbica",
    "aerobica",
    "aerobics",
    "step aeróbica",
    "step aerobica",
    "dança de salão",
    "ballet",
    "futebol",
    "football",
    "soccer",
    "basquetebol",
    "basketball",
    "voleibol",
    "volleyball",
    "andebol",
    "handball",
    "rugby",
    "ténis",
    "tennis",
    "ténis de mesa",
    "ping pong",
    "badminton",
    "squash",
    "padel",
    "boxe",
    "boxing",
    "kickboxing",
    "karaté",
    "karate",
    "judo",
    "jiu-jitsu",
    "taekwondo",
    "muay",
    "muay thai",
    "escalada",
    "climbing",
    "montanhismo",
    "hiking",
    "surf",
    "windsurf",
    "kitesurf",
    "esqui",
    "snowboard",
    "corda",
    "saltar corda",
    "jump rope",
    "trampolim",
    "trampoline",
    "patinagem",
    "skating",
    "patins em linha",
    "rollerblading",
    "burpees",
    "jumping jacks",
    "mountain climbers",
    "plancha",
    "plank",
    "agachamentos",
    "squats",
    "flexões",
    "push ups",
    "abdominais",
    "sit ups",
    "bowling",
    "golfe",
    "golf",
    "bilhar",
    "pool",
    "dardos",
    "darts",
    "jardinagem",
    "gardening",
    "limpeza",
    "cleaning",
    "aspirar",
    "passar ferro",
    "lavar carro",
  ]

  // Check if it contains at least one exercise-related keyword
  const hasValidKeyword = exerciseKeywords.some((keyword) => text.includes(keyword))

  // Check for common exercise patterns
  const hasValidPattern =
    /\b(treino|workout|exercício|atividade|desporto|sport)\b/.test(text) ||
    text.includes("minutos") ||
    text.includes("minutes") ||
    text.length > 6 // Longer descriptions are more likely to be valid

  return hasValidKeyword || hasValidPattern
}

function isValidFoodDescription(description: string): boolean {
  const text = description.toLowerCase().trim()

  // Rejeita entradas muito curtas (menos de 2 caracteres)
  if (text.length < 2) return false

  // Rejeita apenas letras isoladas ou números
  if (/^[a-z]$/.test(text) || /^\d+$/.test(text)) return false

  // Lista de palavras relacionadas com comida
  const foodKeywords = [
    "frango",
    "carne",
    "peixe",
    "ovo",
    "leite",
    "queijo",
    "iogurte",
    "arroz",
    "massa",
    "batata",
    "pão",
    "aveia",
    "quinoa",
    "banana",
    "maçã",
    "laranja",
    "morango",
    "uva",
    "tomate",
    "salada",
    "sopa",
    "sanduíche",
    "sandwich",
    "grelhado",
    "assado",
    "cozido",
    "frito",
    "fresco",
    "água",
    "sumo",
    "pequeno",
    "almoço",
    "jantar",
    "comida",
    "refeição",
    "lanche",
    "snack",
    "biscoito",
    "bolacha",
  ]

  // Verifica se contém pelo menos uma palavra relacionada com comida
  const hasValidKeyword = foodKeywords.some((keyword) => text.includes(keyword))

  // Verifica padrões comuns de descrição de comida
  const hasValidPattern =
    /\b(com|de|grelhado|assado|cozido|frito|fresco)\b/.test(text) ||
    /\d+\s*(g|kg|ml|l|unidade|fatia|chávena)/.test(text) ||
    text.includes(" e ") ||
    text.includes(" com ")

  return hasValidKeyword || hasValidPattern || text.length > 5
}
