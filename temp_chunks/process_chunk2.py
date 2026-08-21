import json

additions = {
  101: [
      "OLAP es solo para bases de datos NoSQL y OLTP para relacionales",
      "OLTP almacena datos en formato de columnas y OLAP en filas"
  ],
  102: [
      "Un sistema desarrollado usando metodologías ágiles",
      "Un sistema operativo basado en microkernel"
  ],
  103: [
      "Cliente, red de área local y servidor en la nube",
      "Entrada de datos, almacenamiento en memoria y exportación a disco"
  ],
  104: [
      "Administrar el ciclo de vida de los servidores físicos",
      "Optimizar las consultas SQL en la base de datos de producción"
  ],
  105: [
      "Una prueba de rendimiento del sistema bajo alta carga",
      "Un registro histórico de incidentes de seguridad"
  ],
  106: [
      "Un servidor caché para acelerar consultas web",
      "Un clúster de servidores de aplicación distribuidos"
  ],
  107: [
      "La velocidad a la que un sistema puede escalar horizontalmente",
      "La capacidad del sistema operativo para ejecutar múltiples hilos simultáneamente"
  ],
  108: [
      "El firmware embebido en la tarjeta de red",
      "La interfaz de línea de comandos de un servidor de bases de datos"
  ],
  109: [
      "Un protocolo de cifrado asimétrico para la capa de red",
      "Un modelo de diseño de bases de datos relacionales"
  ],
  110: [
      "Un diseño que prioriza el procesamiento en un único nodo de alto rendimiento",
      "Una arquitectura de red descentralizada tipo peer-to-peer"
  ],
  111: [
      "El compilado solo funciona en servidores; el interpretado en clientes",
      "El interpretado crea archivos binarios nativos temporales"
  ],
  112: [
      "Un método de clase en programación orientada a objetos",
      "Una directiva de compilación para definir constantes"
  ],
  113: [
      "Una técnica para paralelizar procesos en múltiples núcleos",
      "Un patrón de diseño para estructurar interfaces de usuario"
  ],
  114: [
      "La cantidad de memoria virtual máxima requerida por el programa",
      "El tiempo exacto en milisegundos que toma la compilación del código"
  ],
  115: [
      "O(n log n)",
      "O(2^n)"
  ],
  116: [
      "La búsqueda binaria no requiere conocer el tamaño del arreglo",
      "La búsqueda binaria utiliza múltiples hilos por defecto"
  ],
  117: [
      "Una estructura de árbol de búsqueda balanceada",
      "Una matriz bidimensional dinámica"
  ],
  118: [
      "Una estructura LIFO para gestionar memoria caché",
      "Un tipo especial de grafo dirigido acíclico"
  ],
  119: [
      "Un mecanismo para inyectar dependencias en tiempo de compilación",
      "La técnica de abstraer variables privadas en funciones estáticas"
  ],
  120: [
      "La capacidad de compilar código en múltiples plataformas simultáneamente",
      "La herencia forzada de interfaces gráficas y de consola"
  ],
  121: [
      "Agrupar múltiples bases de datos en un solo clúster unificado",
      "Compilar el código en un único archivo binario"
  ],
  122: [
      "Una función que se ejecuta con privilegios de administrador del sistema",
      "Una función que pertenece exclusivamente a la clase principal del programa"
  ],
  123: [
      "Un grafo donde cada nodo tiene conexiones a todos los demás nodos",
      "Una estructura en la que los nodos se ordenan secuencialmente en memoria contigua"
  ],
  124: [
      "Ocultar variables dentro de bucles anidados para optimizar memoria",
      "Cifrar el código fuente para prevenir la ingeniería inversa"
  ],
  125: [
      "=== asigna un nuevo valor; == solo lo compara",
      "=== comprueba el ámbito de la variable; == solo el valor"
  ],
  126: [
      "Una declaración de una función asíncrona pura",
      "Un objeto nativo para crear y gestionar bases de datos locales"
  ],
  127: [
      "Un algoritmo de ordenamiento de arreglos multidimensionales",
      "Una arquitectura de diseño orientada a servicios web"
  ],
  128: [
      "Documentar rigurosamente el código de forma anual",
      "Distribución de recursos de procesamiento en paralelo"
  ],
  129: [
      "Un tipo de variable booleana iterativa",
      "Un registro secuencial de memoria para tablas hash"
  ],
  130: [
      "Ordenar elementos comparándolos con una tabla hash de valores precalculados",
      "Reordenar en sitio usando una cola de prioridad mínima"
  ],
  131: [
      "Un framework para conectar bases de datos relacionales mediante ORM",
      "Un protocolo de encriptación simétrica para transferencias seguras"
  ],
  132: [
      "Un esquema estandarizado de colores para la interfaz de usuario",
      "Un estándar ISO para definir la sintaxis de lenguajes de programación"
  ],
  133: [
      "Sincroniza relojes entre varios servidores de base de datos",
      "Observa y corrige errores de sintaxis en tiempo de ejecución automáticamente"
  ],
  134: [
      "Un compilador JIT multiplataforma especializado en C++",
      "Un entorno de ejecución para aplicaciones desplegadas en contenedores"
  ],
  135: [
      "Programar exclusivamente usando objetos y métodos privados en memoria estática",
      "Un paradigma donde las funciones gestionan directamente la memoria del hardware"
  ],
  136: [
      "La interrupción temporal del sistema por falta de memoria virtual",
      "El fin inesperado de un bucle causado por un desbordamiento de pila"
  ],
  137: [
      "Paradigma donde el programa se ejecuta en intervalos de tiempo predefinidos (cron)",
      "Un modelo que compila funciones en el orden exacto en que fueron declaradas"
  ],
  138: [
      "Un proceso del sistema operativo para desfragmentar el disco duro",
      "Un componente de la base de datos diseñado para borrar registros huérfanos"
  ],
  139: [
      "AOT solo compila interfaces de usuario; JIT compila la lógica compleja de backend",
      "JIT requiere que el programa se reinicie tras cada compilación; AOT no"
  ],
  140: [
      "Añadir bibliotecas dinámicas de terceros en el entorno de ejecución del sistema operativo",
      "Inyectar consultas SQL externas en el código para mejorar drásticamente el rendimiento"
  ],
  141: [
      "Un escaneo automático de vulnerabilidades en los puertos de red",
      "Una prueba de aceptación global realizada exclusivamente por el usuario final"
  ],
  142: [
      "Desplegar el sistema en todos los servidores de producción simultáneamente cada hora",
      "Un mecanismo para compilar código únicamente en la máquina local del desarrollador principal"
  ],
  143: [
      "Detiene el programa completo devolviendo un código de error fatal",
      "Suspende la ejecución del bucle hasta que se cumpla una condición externa de red"
  ],
  144: [
      "Un tipo especial de bucle recursivo para matrices multidimensionales",
      "Una clase abstracta utilizada frecuentemente en la creación de interfaces gráficas"
  ],
  145: [
      "Reducir el tamaño de los operadores matemáticos para optimizar el consumo de memoria",
      "Forzar a un operador lógico a comportarse como un bucle condicional infinito"
  ],
  146: [
      "Por valor transmite la variable cifrada; por referencia la envía en texto plano",
      "Por referencia crea múltiples hilos de ejecución automáticamente en el fondo"
  ],
  147: [
      "Un paradigma centrado exclusivamente en optimizar las llamadas de sistema de bajo nivel",
      "Programar aplicaciones que únicamente reaccionan a fallos críticos del servidor"
  ],
  148: [
      "Un protocolo estructurado para transferir tipos de datos complejos entre servidores",
      "Una tabla de enrutamiento estática para redes de área local"
  ],
  149: [
      "Búsqueda Lineal",
      "Cifrado asimétrico RSA"
  ],
  150: [
      "Liberar automáticamente la memoria RAM asignada a variables globales",
      "Cargar todos los módulos del sistema al inicio para evitar esperas durante la ejecución"
  ]
}

input_file = "/home/vicky/.gemini/antigravity/scratch/snake-quiz/temp_chunks/questions_chunk_2.json"
output_file = "/home/vicky/.gemini/antigravity/scratch/snake-quiz/temp_chunks/questions_chunk_2_out.json"

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    qid = item['id']
    if qid in additions:
        item['options'].extend(additions[qid])

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done")
