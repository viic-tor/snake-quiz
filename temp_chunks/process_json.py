import json

new_options = [
    ["Karl Popper", "Talcott Parsons"],
    ["Morfogénesis", "Resiliencia estructural"],
    ["Alcanzar el cero absoluto", "Fluctuar de manera caótica"],
    ["Retroalimentación divergente", "Retroalimentación estocástica"],
    ["Un motor térmico ideal", "Un reloj de péndulo en el vacío"],
    ["Entropía negativa pura", "Mutación genética aleatoria"],
    ["La entropía final es idéntica al inicio", "Todo sistema cerrado tiende al mismo estado de desorden"],
    ["Un modelo teórico de simulación matemática", "Un elemento externo que no interactúa con el sistema principal"],
    ["Acelerar los procesos entrópicos del sistema", "Transformar la información en energía térmica"],
    ["John von Neumann", "Heinz von Foerster"],
    ["Un sistema sin ningún límite definido", "Un proceso estático que no requiere energía"],
    ["Negentropía estructural", "Equifinalidad estricta"],
    ["Redes de Petri y autómatas celulares", "Diagramas de estado UML"],
    ["Estado de máxima entropía", "Intercambio nulo de energía"],
    ["Las variables ocupan menos memoria temporal", "Las constantes solo pueden almacenar valores numéricos"],
    ["try-catch", "continue-break"],
    ["Un módulo del compilador de C", "Una estructura de datos jerárquica"],
    ["char", "double"],
    ["Un bucle infinito generado por un error de sintaxis", "La optimización de código mediante reducción de variables"],
    ["Transformar el código en un diagrama de flujo", "Ejecutar el código paso a paso en modo de depuración"],
    ["Java", "Go"],
    ["Un tipo especial de bucle anidado", "Una directiva de preprocesamiento del compilador"],
    ["Un paradigma de programación concurrente", "Una librería estándar de entrada y salida"],
    ["!== (desigualdad estricta)", "=> (función flecha)"],
    ["Un estilo que evita completamente el uso de variables globales", "La técnica de ejecutar programas distribuidos en múltiples nodos"],
    ["O(n log n)", "O(2^n)"],
    ["git start", "git create"],
    ["Una notación para representar números en formato binario", "Un estándar de formato para intercambio de archivos JSON"],
    ["Convertir el código a lenguaje ensamblador", "Comprimir el código fuente para ahorrar espacio en disco"],
    ["No pueden manejar estructuras de control de flujo", "Son totalmente dependientes de la arquitectura del procesador"],
    ["La reducción de la complejidad a un componente aislado", "El proceso de interrupción abrupta del sistema"],
    ["El interior del bloque", "Las flechas diagonales del modelo"],
    ["Un controlador PID ajustando una válvula proporcional", "La sudoración del cuerpo humano para reducir la temperatura"],
    ["Una falla catastrófica en la memoria caché del disco duro", "Un desbordamiento del buffer de red al recibir demasiados paquetes"],
    ["Una lista solo puede almacenar números enteros", "Una pila requiere punteros dobles mientras que una lista no"],
    ["Estar completamente aislados de su entorno", "Funcionar bajo principios de termodinámica clásica exclusivamente"],
    ["Una red privada virtual para conectar desarrolladores", "Un entorno de desarrollo integrado (IDE)"],
    ["El estudio de la retroalimentación en sistemas mecánicos simples", "La cibernética aplicada estrictamente a la inteligencia artificial"],
    ["Minimizar el uso de estructuras de datos complejas", "Orientar el diseño a la herencia múltiple de clases abstractas"],
    ["El mantenimiento rígido de la estructura actual sin cambios", "La tendencia natural y espontánea hacia el desorden absoluto"],
    ["Un sistema cerrado siempre alcanza la entropía máxima", "Todos los subsistemas comparten exactamente el mismo límite"],
    ["La cantidad de energía potencial que pueden almacenar", "La complejidad computacional de sus algoritmos internos"],
    ["La optimización rigurosa de procesos industriales", "El estudio de las órbitas de sistemas planetarios"],
    ["Amplifica la señal de ruido inherente al sistema", "Registra los datos de salida en la memoria permanente del sistema"],
    ["Negentropía", "Equifinalidad adaptativa"],
    ["Los componentes internos que procesan activamente las entradas", "Los límites físicos inmutables del sistema"],
    ["Jerarquía multinivel estricta", "Interacciones no lineales impredecibles"],
    ["Sistemas mecánicos de precisión (relojería)", "Sistemas biológicos simples como las células"],
    ["Un modelo donde todas las variables internas son perfectamente conocidas", "Un subsistema secundario que almacena datos críticos de respaldo"],
    ["Estática", "Disipativa"]
]

with open('/home/vicky/.gemini/antigravity/scratch/snake-quiz/temp_chunks/questions_chunk_0.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for i, q in enumerate(data):
    if len(q.get('options', [])) == 4:
        q['options'].extend(new_options[i])

with open('/home/vicky/.gemini/antigravity/scratch/snake-quiz/temp_chunks/questions_chunk_0_out.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

