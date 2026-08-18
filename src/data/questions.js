/**
 * @file questions.js
 * @description Banco de preguntas para el Quiz de Snake.
 * Categorías:
 *   - "sistemas"  → Teoría General de Sistemas
 *   - "prog"      → Introducción a Programación
 *
 * Cada pregunta tiene:
 *   id        : identificador único
 *   category  : "sistemas" | "prog"
 *   question  : texto de la pregunta
 *   options   : array de 4 opciones [string]
 *   answer    : índice (0-3) de la opción correcta
 *   explanation: breve explicación de la respuesta
 */

export const QUESTIONS = [
  // ─────────────────────────────────────────────
  // TEORÍA DE SISTEMAS
  // ─────────────────────────────────────────────
  {
    id: 1,
    category: "sistemas",
    question: "¿Quién es considerado el padre de la Teoría General de Sistemas (TGS)?",
    options: [
      "Norbert Wiener",
      "Ludwig von Bertalanffy",
      "Claude Shannon",
      "Niklas Luhmann",
    ],
    answer: 1,
    explanation: "Ludwig von Bertalanffy formuló la TGS en los años 40 buscando principios aplicables a todos los sistemas.",
  },
  {
    id: 2,
    category: "sistemas",
    question: "¿Cómo se denomina la propiedad de un sistema donde el todo es mayor que la suma de sus partes?",
    options: [
      "Homeostasis",
      "Entropía",
      "Sinergia",
      "Retroalimentación",
    ],
    answer: 2,
    explanation: "La sinergia indica que la interacción entre partes produce efectos que no existirían por separado.",
  },
  {
    id: 3,
    category: "sistemas",
    question: "En un sistema cerrado, la entropía tiende a:",
    options: [
      "Disminuir con el tiempo",
      "Permanecer constante",
      "Aumentar con el tiempo",
      "Oscilar periódicamente",
    ],
    answer: 2,
    explanation: "Segunda ley de la termodinámica: en sistemas cerrados la entropía (desorden) siempre aumenta.",
  },
  {
    id: 4,
    category: "sistemas",
    question: "¿Qué tipo de retroalimentación busca mantener el equilibrio del sistema?",
    options: [
      "Retroalimentación positiva",
      "Retroalimentación negativa",
      "Retroalimentación circular",
      "Retroalimentación lineal",
    ],
    answer: 1,
    explanation: "La retroalimentación negativa corrige desviaciones y mantiene la homeostasis del sistema.",
  },
  {
    id: 5,
    category: "sistemas",
    question: "¿Cuál de los siguientes es un ejemplo de sistema abierto?",
    options: [
      "Un termostato aislado",
      "Una reacción química sellada",
      "Un ecosistema",
      "Un circuito eléctrico cerrado",
    ],
    answer: 2,
    explanation: "Un ecosistema intercambia materia y energía con su entorno, característica de sistemas abiertos.",
  },
  {
    id: 6,
    category: "sistemas",
    question: "La homeostasis en un sistema biológico es un ejemplo de:",
    options: [
      "Entropía creciente",
      "Sistema cerrado",
      "Retroalimentación negativa",
      "Ruptura del equilibrio",
    ],
    answer: 2,
    explanation: "La homeostasis usa retroalimentación negativa para mantener variables internas estables.",
  },
  {
    id: 7,
    category: "sistemas",
    question: "¿Qué significa 'equifinalidad' en la Teoría General de Sistemas?",
    options: [
      "Todo sistema termina en el mismo estado",
      "Un mismo resultado puede lograrse por distintos caminos",
      "Los sistemas cerrados tienen un único fin",
      "La entropía lleva a un estado final único",
    ],
    answer: 1,
    explanation: "Equifinalidad: sistemas abiertos pueden alcanzar el mismo estado final desde condiciones iniciales diferentes.",
  },
  {
    id: 8,
    category: "sistemas",
    question: "Un subsistema es:",
    options: [
      "Un sistema que no interactúa con otros",
      "Un componente del entorno externo",
      "Un sistema que forma parte de otro sistema mayor",
      "Un sistema sin entradas ni salidas",
    ],
    answer: 2,
    explanation: "Los subsistemas son partes del sistema total que tienen sus propias entradas, procesos y salidas.",
  },
  {
    id: 9,
    category: "sistemas",
    question: "¿Cuál es la función del 'límite' o 'frontera' de un sistema?",
    options: [
      "Eliminar las entradas no deseadas",
      "Definir qué pertenece al sistema y qué al entorno",
      "Aumentar la entropía interna",
      "Convertir salidas en entradas",
    ],
    answer: 1,
    explanation: "El límite separa el sistema de su entorno y controla el flujo de información/energía/materia.",
  },
  {
    id: 10,
    category: "sistemas",
    question: "En cibernética, el 'feedback' negativo fue estudiado principalmente por:",
    options: [
      "Ludwig von Bertalanffy",
      "Norbert Wiener",
      "Herbert Simon",
      "Peter Senge",
    ],
    answer: 1,
    explanation: "Norbert Wiener fundó la cibernética y estudió los mecanismos de retroalimentación y control.",
  },
  {
    id: 11,
    category: "sistemas",
    question: "La 'caja negra' en teoría de sistemas se refiere a:",
    options: [
      "Un sistema sin salidas",
      "Un sistema cuyo proceso interno es desconocido",
      "Un sistema cerrado herméticamente",
      "Un sistema con retroalimentación positiva",
    ],
    answer: 1,
    explanation: "Black Box: solo se conocen entradas y salidas; el proceso interno no es observable.",
  },
  {
    id: 12,
    category: "sistemas",
    question: "¿Qué propiedad describe la capacidad de un sistema de adaptarse a cambios del entorno?",
    options: [
      "Entropía",
      "Rigidez sistémica",
      "Adaptabilidad o resiliencia",
      "Homeostasis estática",
    ],
    answer: 2,
    explanation: "La adaptabilidad (resiliencia) permite al sistema sobrevivir perturbaciones externas.",
  },
  {
    id: 13,
    category: "sistemas",
    question: "¿Cuál de estos conceptos pertenece a la dinámica de sistemas de Jay Forrester?",
    options: [
      "Diagrama de flujo de datos",
      "Bucles causales y stocks-flows",
      "Diagrama entidad-relación",
      "Árbol de decisión binario",
    ],
    answer: 1,
    explanation: "Forrester desarrolló los diagramas de bucles causales y los modelos stocks-flows para simular sistemas.",
  },
  {
    id: 14,
    category: "sistemas",
    question: "El concepto de 'negentropía' significa:",
    options: [
      "Incremento del desorden en un sistema",
      "Importación de orden desde el entorno para sobrevivir",
      "Estado de máxima entropía",
      "Tendencia de sistemas cerrados al equilibrio",
    ],
    answer: 1,
    explanation: "Los sistemas abiertos importan negentropía (orden/energía) para contrarrestar la entropía interna.",
  },
  // ─────────────────────────────────────────────
  // INTRODUCCIÓN A PROGRAMACIÓN
  // ─────────────────────────────────────────────
  {
    id: 15,
    category: "prog",
    question: "¿Cuál es la diferencia entre una variable y una constante?",
    options: [
      "Las variables ocupan más memoria",
      "Una constante no puede cambiar su valor una vez asignado",
      "Las constantes solo existen en lenguajes compilados",
      "No existe diferencia real entre ambas",
    ],
    answer: 1,
    explanation: "Una constante (const) mantiene su valor fijo durante toda la ejecución del programa.",
  },
  {
    id: 16,
    category: "prog",
    question: "¿Qué estructura de control permite repetir un bloque de código mientras se cumpla una condición?",
    options: [
      "if-else",
      "switch",
      "while / for",
      "return",
    ],
    answer: 2,
    explanation: "Los bucles while y for ejecutan código repetidamente mientras la condición sea verdadera.",
  },
  {
    id: 17,
    category: "prog",
    question: "¿Qué es un algoritmo?",
    options: [
      "Un lenguaje de programación específico",
      "Un conjunto finito de pasos ordenados para resolver un problema",
      "Un tipo de base de datos",
      "Un componente de hardware del procesador",
    ],
    answer: 1,
    explanation: "Un algoritmo es una secuencia finita, ordenada y precisa de pasos que resuelve un problema.",
  },
  {
    id: 18,
    category: "prog",
    question: "¿Cuál es el tipo de dato adecuado para almacenar el valor verdadero/falso?",
    options: [
      "int",
      "float",
      "string",
      "boolean",
    ],
    answer: 3,
    explanation: "El tipo booleano (bool) solo puede tomar los valores true o false.",
  },
  {
    id: 19,
    category: "prog",
    question: "En programación, ¿qué es la recursión?",
    options: [
      "Un bucle infinito sin condición de parada",
      "Una función que se llama a sí misma",
      "Un método de ordenamiento de datos",
      "Una estructura de datos en forma de árbol",
    ],
    answer: 1,
    explanation: "La recursión ocurre cuando una función se invoca a sí misma con un caso base que detiene la cadena.",
  },
  {
    id: 20,
    category: "prog",
    question: "¿Qué significa 'compilar' un programa?",
    options: [
      "Ejecutar el programa directamente en el navegador",
      "Traducir el código fuente a lenguaje máquina",
      "Depurar errores de ejecución manualmente",
      "Guardar el archivo de código fuente",
    ],
    answer: 1,
    explanation: "Compilar traduce el código de alto nivel (ej: C++) a instrucciones que el procesador puede ejecutar.",
  },
  {
    id: 21,
    category: "prog",
    question: "¿Cuál de los siguientes es un lenguaje interpretado?",
    options: [
      "C",
      "C++",
      "Python",
      "Rust",
    ],
    answer: 2,
    explanation: "Python es interpretado: el intérprete ejecuta el código línea a línea sin compilación previa.",
  },
  {
    id: 22,
    category: "prog",
    question: "¿Qué es una función en programación?",
    options: [
      "Un tipo de variable global",
      "Un bloque de código reutilizable que realiza una tarea específica",
      "Un operador matemático especial",
      "Una instrucción de control de flujo",
    ],
    answer: 1,
    explanation: "Las funciones agrupan código reutilizable, reciben parámetros y pueden retornar valores.",
  },
  {
    id: 23,
    category: "prog",
    question: "¿Qué es una estructura de datos?",
    options: [
      "Un diagrama de flujo del programa",
      "Una forma organizada de almacenar y gestionar datos",
      "Un tipo de base de datos relacional",
      "Un patrón de diseño orientado a objetos",
    ],
    answer: 1,
    explanation: "Las estructuras de datos (arrays, listas, pilas, colas, árboles) organizan datos para un acceso eficiente.",
  },
  {
    id: 24,
    category: "prog",
    question: "¿Qué operador se usa comúnmente para verificar igualdad en la mayoría de lenguajes?",
    options: [
      "= (asignación)",
      "== (comparación)",
      ":= (asignación walrus)",
      "=== solo en C++",
    ],
    answer: 1,
    explanation: "El operador == compara valores; no confundir con = que asigna valores a variables.",
  },
  {
    id: 25,
    category: "prog",
    question: "¿Qué es la Programación Orientada a Objetos (POO)?",
    options: [
      "Escribir código usando solo funciones matemáticas",
      "Un paradigma que organiza el software en objetos con atributos y métodos",
      "Programar exclusivamente en lenguaje C",
      "Usar exclusivamente bucles y condicionales",
    ],
    answer: 1,
    explanation: "POO agrupa datos (atributos) y comportamiento (métodos) en objetos basados en clases.",
  },
  {
    id: 26,
    category: "prog",
    question: "¿Cuál es la complejidad temporal de una búsqueda binaria en un arreglo ordenado?",
    options: [
      "O(n)",
      "O(n²)",
      "O(log n)",
      "O(1)",
    ],
    answer: 2,
    explanation: "La búsqueda binaria divide el espacio de búsqueda a la mitad en cada paso: O(log n).",
  },
  {
    id: 27,
    category: "prog",
    question: "En Git, ¿qué comando crea un nuevo repositorio local?",
    options: [
      "git clone",
      "git init",
      "git push",
      "git commit",
    ],
    answer: 1,
    explanation: "'git init' inicializa un repositorio Git vacío en el directorio actual.",
  },
  {
    id: 28,
    category: "prog",
    question: "¿Qué es la notación Big-O?",
    options: [
      "Un lenguaje de scripting para shell",
      "Una forma de describir el rendimiento de un algoritmo según el tamaño de entrada",
      "Una convención de nombres para variables",
      "Un sistema de versionado de software",
    ],
    answer: 1,
    explanation: "Big-O describe el peor caso de crecimiento en tiempo/espacio de un algoritmo al escalar la entrada.",
  },
  {
    id: 29,
    category: "prog",
    question: "¿Qué significa 'depurar' (debugging) un programa?",
    options: [
      "Compilar el programa para producción",
      "Identificar y corregir errores en el código",
      "Documentar las funciones del programa",
      "Optimizar la velocidad del algoritmo",
    ],
    answer: 1,
    explanation: "Debugging es el proceso de encontrar, analizar y corregir bugs (errores) en el código fuente.",
  },
  {
    id: 30,
    category: "prog",
    question: "¿Cuál de las siguientes es una característica de los lenguajes de programación de alto nivel?",
    options: [
      "Interactúan directamente con el hardware",
      "Son más cercanos al lenguaje humano y más abstractos",
      "Solo pueden ejecutarse sin compilar",
      "No permiten el uso de funciones",
    ],
    answer: 1,
    explanation: "Los lenguajes de alto nivel (Python, Java, JS) abstraen detalles de hardware y son más legibles.",
  },
  {
    id: 31,
    category: "sistemas",
    question: "¿Qué es la 'emergencia' en un sistema complejo?",
    options: [
      "La falla catastrófica del sistema",
      "Propiedades que surgen de la interacción de componentes y no existen en ellos individualmente",
      "El proceso de inicio del sistema",
      "La respuesta del sistema a una entrada externa",
    ],
    answer: 1,
    explanation: "La emergencia describe cómo el comportamiento colectivo produce propiedades no presentes en las partes.",
  },
  {
    id: 32,
    category: "sistemas",
    question: "En el modelo IDEF0, las entradas de un proceso se ubican en:",
    options: [
      "La parte superior del bloque",
      "La parte derecha del bloque",
      "La parte izquierda del bloque",
      "La parte inferior del bloque",
    ],
    answer: 2,
    explanation: "En IDEF0: Inputs (izquierda), Controls (arriba), Outputs (derecha), Mechanisms (abajo).",
  },
  {
    id: 33,
    category: "sistemas",
    question: "¿Cuál de los siguientes es un ejemplo de retroalimentación positiva?",
    options: [
      "El termostato que apaga la calefacción al llegar a la temperatura deseada",
      "El crecimiento exponencial de una población sin límites",
      "El sistema inmunológico que elimina patógenos",
      "El piloto automático de un avión",
    ],
    answer: 1,
    explanation: "La retroalimentación positiva amplifica las desviaciones; el crecimiento exponencial es un ejemplo clásico.",
  },
  {
    id: 34,
    category: "prog",
    question: "¿Qué es un 'stack overflow' en programación?",
    options: [
      "Un sitio web de preguntas y respuestas",
      "Un error que ocurre cuando la pila de llamadas supera su límite (generalmente por recursión infinita)",
      "Un tipo de estructura de datos dinámica",
      "Una técnica de optimización de memoria",
    ],
    answer: 1,
    explanation: "Stack overflow ocurre cuando la pila de llamadas se llena, frecuentemente por recursión sin caso base.",
  },
  {
    id: 35,
    category: "prog",
    question: "¿Cuál es la diferencia entre una lista (array) y una pila (stack)?",
    options: [
      "Una lista es más rápida que una pila",
      "Una pila sigue LIFO (último en entrar, primero en salir) y una lista permite acceso aleatorio",
      "No existe diferencia funcional entre ambas",
      "Una pila permite más elementos que una lista",
    ],
    answer: 1,
    explanation: "Stack: LIFO — solo se accede al elemento del tope. Array: acceso aleatorio por índice.",
  },
  {
    id: 36,
    category: "sistemas",
    question: "Los 'sistemas adaptativos complejos' (CAS) se caracterizan principalmente por:",
    options: [
      "Tener un controlador central único",
      "Agentes que interactúan localmente generando comportamiento global emergente",
      "Ser completamente predecibles con suficiente información",
      "No tener retroalimentación entre componentes",
    ],
    answer: 1,
    explanation: "Los CAS (como mercados, ecosistemas) tienen agentes autónomos que interactúan y producen emergencia.",
  },
  {
    id: 37,
    category: "prog",
    question: "¿Qué es una API (Application Programming Interface)?",
    options: [
      "Un lenguaje de programación para interfaces gráficas",
      "Un conjunto de definiciones y protocolos para integrar software",
      "Un tipo de base de datos NoSQL",
      "Un framework de pruebas unitarias",
    ],
    answer: 1,
    explanation: "Una API define cómo interactuar con un servicio/librería, abstrayendo su implementación interna.",
  },
  {
    id: 38,
    category: "sistemas",
    question: "¿Qué es la 'cibernética de segundo orden'?",
    options: [
      "El estudio de sistemas de control de segunda generación",
      "El estudio del observador como parte del sistema observado",
      "Un método avanzado de retroalimentación negativa",
      "La aplicación de cibernética a sistemas artificiales",
    ],
    answer: 1,
    explanation: "La cibernética de segundo orden (Heinz von Foerster) incluye al observador dentro del sistema analizado.",
  },
  {
    id: 39,
    category: "prog",
    question: "¿Cuál es el propósito del paradigma de programación funcional?",
    options: [
      "Usar solo bucles for en lugar de recursión",
      "Tratar la computación como evaluación de funciones matemáticas evitando estados mutables",
      "Programar hardware directamente con funciones de bajo nivel",
      "Crear interfaces de usuario funcionales",
    ],
    answer: 1,
    explanation: "La programación funcional usa funciones puras, inmutabilidad y evita efectos secundarios.",
  },
  {
    id: 40,
    category: "sistemas",
    question: "En la Teoría de Sistemas, ¿qué describe el concepto de 'morfogénesis'?",
    options: [
      "La tendencia del sistema a mantener su forma actual",
      "Los procesos que cambian la estructura o forma del sistema",
      "La capacidad del sistema de reproducirse",
      "El equilibrio entre entradas y salidas",
    ],
    answer: 1,
    explanation: "Morfogénesis: procesos que modifican la estructura del sistema, en contraste con la morfostasis (mantenimiento).",
  },
];

/**
 * Retorna una pregunta aleatoria del banco, opcionalmente excluyendo IDs ya usados.
 * @param {number[]} usedIds - IDs de preguntas ya mostradas
 * @returns {object} Pregunta aleatoria
 */
export function getRandomQuestion(usedIds = []) {
  const available = QUESTIONS.filter((q) => !usedIds.includes(q.id));
  if (available.length === 0) return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
  return available[Math.floor(Math.random() * available.length)];
}
