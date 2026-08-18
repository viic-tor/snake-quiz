<<<<<<< HEAD
# snake-quiz
=======
# 🐍 Snake Quiz

Juego de la culebrita con preguntas de **Teoría General de Sistemas** e **Introducción a Programación**. Compite por el top del leaderboard.

![Snake Quiz Dark Theme](https://img.shields.io/badge/tema-oscuro%20premium-00ff88?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite)

---

## 🎮 Características

| Característica | Detalle |
|---|---|
| 🐍 **Snake clásico** | Crece al comer, muere al chocar consigo mismo |
| 🧠 **Quiz cada 3 comidas** | 40+ preguntas de Sistemas y Programación |
| ⏱️ **Temporizador** | 15 segundos por pregunta |
| ❤️ **3 vidas** | Máximo 5. Bonus +1 vida cada 10 correctas sin perder |
| ⚡ **Velocidad creciente** | Aumenta cada 5 preguntas contestadas |
| 📊 **Estadísticas** | Score, vidas, nivel, precisión, próximos eventos |
| 🏆 **Leaderboard** | Top 10 persistente en localStorage |
| 📋 **Reglas** | Modal completo con todas las mecánicas |
| 🎨 **Diseño oscuro** | Glassmorphism, neones, animaciones |

---

## 🚀 Instalación y uso local

### Requisitos
- Node.js 18+
- npm 9+

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/TU_USUARIO/snake-quiz.git
cd snake-quiz

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev
```

Abre [http://localhost:5173/snake-quiz/](http://localhost:5173/snake-quiz/) en tu navegador.

---

## 🏗️ Build de producción

```bash
npm run build
```

Los archivos compilados quedan en `dist/`.

---

## 🌐 Publicar en GitHub Pages

### Opción A — Manual

```bash
# Build
npm run build

# Instalar gh-pages (una sola vez)
npm install -D gh-pages

# Deploy
npx gh-pages -d dist
```

Luego en tu repositorio de GitHub:  
**Settings → Pages → Source → gh-pages branch**

### Opción B — GitHub Actions (automático)

Crea el archivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

> **Importante**: En `vite.config.js`, el `base` debe coincidir con el nombre exacto de tu repositorio:
> ```js
> base: '/nombre-de-tu-repo/',
> ```

---

## 🎯 Reglas del juego

### Controles
| Tecla | Acción |
|---|---|
| `↑ ↓ ← →` | Mover serpiente |
| `W A S D` | Mover serpiente (alternativo) |
| `P` / `Espacio` | Pausar / Reanudar |

### Puntuación
- 🍎 **Comer**: `10 + (Nivel × 5)` puntos
- ✅ **Quiz correcto**: `150 + (Nivel × 25)` puntos bonus
- ❌ **Quiz incorrecto**: sin puntos + −1 vida

### Vidas
- Inicias con **3 vidas** (máximo 5)
- Pierdes vida al: responder incorrectamente o chocarte
- **Bonus vida**: 10 respuestas correctas consecutivas sin perder vidas

### Velocidad
- Aumenta cada **5 preguntas contestadas**

### Niveles
- Sube cada **10 comidas**

---

## 📁 Estructura del proyecto

```
snake-quiz/
├── public/
│   └── snake.svg              # Favicon
├── src/
│   ├── components/
│   │   ├── GameBoard.jsx      # Canvas del juego (serpiente + comida)
│   │   ├── GameOver.jsx       # Pantalla de fin de partida
│   │   ├── Leaderboard.jsx    # Tabla de clasificación
│   │   ├── QuizModal.jsx      # Modal de preguntas
│   │   ├── RulesModal.jsx     # Modal de reglas
│   │   ├── StartScreen.jsx    # Pantalla de inicio
│   │   └── StatsPanel.jsx     # Panel de estadísticas en tiempo real
│   ├── data/
│   │   └── questions.js       # Banco de 40+ preguntas
│   ├── hooks/
│   │   └── useSnakeGame.js    # Hook principal con toda la lógica
│   ├── utils/
│   │   └── leaderboard.js     # CRUD localStorage leaderboard
│   ├── App.jsx                # Componente raíz y routing de vistas
│   ├── index.css              # Sistema de diseño global
│   └── main.jsx               # Entry point React
├── index.html                 # HTML base con SEO
├── vite.config.js             # Configuración Vite
└── package.json
```

---

## 🧠 Banco de preguntas

**40 preguntas** en dos categorías:

### 🖥️ Teoría General de Sistemas (TGS)
- Ludwig von Bertalanffy y los orígenes de la TGS
- Sinergia, entropía, negentropía, equifinalidad
- Retroalimentación positiva y negativa (homeostasis)
- Sistemas abiertos vs cerrados
- Cibernética (Norbert Wiener)
- Subsistemas, fronteras del sistema, caja negra
- Adaptabilidad, morfogénesis
- Dinámica de sistemas (Jay Forrester)
- Sistemas adaptativos complejos (CAS)
- Cibernética de segundo orden

### 💻 Introducción a Programación
- Variables, constantes y tipos de datos
- Estructuras de control (condicionales, bucles)
- Funciones y recursión
- Algoritmos y complejidad (Big-O)
- Paradigmas: POO y programación funcional
- Compilación vs interpretación
- Estructuras de datos (arrays, pilas, colas)
- Git básico
- APIs
- Depuración (debugging)

---

## 🛠️ Tecnologías

- **React 18** — UI declarativa con hooks
- **Vite 5** — Build tool ultrarrápido
- **CSS vanilla** — Sistema de diseño con variables CSS
- **Canvas API** — Renderizado del tablero de juego
- **localStorage** — Persistencia del leaderboard
- **Google Fonts** — Orbitron + Inter

---

## 📄 Licencia

MIT © 2024 — Libre para uso educativo y personal.
>>>>>>> a373d6c (feat: Snake Quiz)
