import json

new_options_map = {
    51: ["Aislar completamente al sistema de su entorno", "Incrementar la variabilidad estructural"],
    52: ["Ley de los rendimientos decrecientes", "Principio de complejidad organizada"],
    53: ["Elementos indivisibles sin estructura interna", "Fronteras aislantes del sistema global"],
    54: ["La teoría de autómatas celulares", "El concepto de autopoiesis en biología"],
    55: ["Un ciclo repetitivo que colapsa el sistema", "La cantidad total de flujos de salida"],
    56: ["La tendencia natural hacia la homogeneidad", "El estado de equilibrio termodinámico absoluto"],
    57: ["La tasa constante de decaimiento", "El límite máximo de la simulación"],
    58: ["El aislamiento termodinámico completo", "La tendencia a la máxima desorganización"],
    59: ["Homeostasis institucional", "Teleología estructural"],
    60: ["Eficacia se refiere a sistemas cerrados; eficiencia a abiertos", "Eficacia evalúa procesos; eficiencia evalúa resultados finales"],
    61: ["Optimizar procesos puramente algorítmicos", "Eliminar todas las jerarquías organizacionales"],
    62: ["El aislamiento absoluto de un organismo", "La tendencia hacia el caos determinista"],
    63: ["El estado final de equilibrio termodinámico", "La frontera física del sistema bajo estudio"],
    64: ["Aceleran los ciclos de retroalimentación", "Eliminan la necesidad de un controlador"],
    65: ["Un sistema estático predecible linealmente", "Un modelo computacional sin agentes autónomos"],
    66: ["La rigidez estructural absoluta", "La eliminación total de la entropía"],
    67: ["El punto de ruptura estructural", "Una variable exclusivamente exógena"],
    68: ["La convergencia forzada hacia un estado único", "La sincronización lineal de subsistemas"],
    69: ["El centro geográfico de sus operaciones", "La suma total de su retroalimentación interna"],
    70: ["Un modelo ignora por completo la retroalimentación", "El sistema real no experimenta entropía"],
    71: ["Sistema estocástico sin estado", "Sistema autopoiético biológico"],
    72: ["Agregación de variables independientes y aleatorias", "Sistemas completamente desprovistos de jerarquía"],
    73: ["Isomorfismo funcional", "Sincronicidad temporal"],
    74: ["La causa circular es unidireccional estocástica", "La causa lineal implica múltiples bucles anidados"],
    75: ["Un sistema operado exclusivamente por humanos en turno", "Un sistema de predicción del futuro basado en IA"],
    76: ["El grado de resiliencia estructural", "La capacidad de replicación independiente"],
    77: ["Descomponer el sistema desde su entorno hacia adentro", "Centrarse en las restricciones del supra-sistema primero"],
    78: ["La evolución de una red neuronal", "Un ecosistema tropical no intervenido"],
    79: ["La variable objetivo de la simulación", "El valor constante inicial del modelo"],
    80: ["Un mensaje de alerta del controlador central", "La reducción de la complejidad algorítmica"],
    81: ["La suma de todos los subsistemas cerrados", "La dispersión de los datos estadísticos"],
    82: ["Sistema semicerrado", "Sistema hiper-aislado"],
    83: ["La dispersión de control entre componentes paralelos", "La inexistencia de fronteras inter-sistémicas"],
    84: ["La dependencia estocástica de variables aisladas", "La anulación de los bucles de retroalimentación"],
    85: ["El punto de falla crítica", "La variable dependiente principal"],
    86: ["La información requiere de sensores físicos; los datos no", "El dato es información estructurada jerárquicamente"],
    87: ["El volumen total de datos almacenados", "La velocidad de procesamiento algorítmico"],
    88: ["Una epidemia propagándose sin restricciones", "El efecto bola de nieve en un mercado alcista"],
    89: ["La división jerárquica de tareas y funciones", "La eliminación de los recursos redundantes"],
    90: ["Un modelo matemático lineal y determinista", "El diseño de la base de datos subyacente"],
    91: ["Exclusivamente el equipo de desarrollo de software", "Servidores en la nube y clientes locales únicamente"],
    92: ["ERP es solo para recursos humanos; CRM para inventario", "ERP gestiona redes físicas; CRM aplicaciones en la nube"],
    93: ["Un antivirus que previene intrusiones corporativas", "Un sistema operativo diseñado para servidores de alta carga"],
    94: ["La compresión de la base de datos para ahorrar espacio", "La capacidad de procesar transacciones en tiempo real"],
    95: ["Hardware, software, y validación", "Ventas, mercadotecnia, e implementación técnica"],
    96: ["Un sistema de respaldo en la nube estático", "Una red P2P (Peer-to-Peer) descentralizada"],
    97: ["La capacidad gráfica de la interfaz del usuario", "La tasa de transmisión máxima de los routers"],
    98: ["Una metodología para ensamblaje de hardware", "Un estándar de compresión de archivos multimedia"],
    99: ["La actualización automática de su interfaz gráfica", "El grado de ofuscación del código binario"],
    100: ["La habilidad de compilar código fuente velozmente", "La tolerancia a fallos del hardware subyacente"]
}

input_file = '/home/vicky/.gemini/antigravity/scratch/snake-quiz/temp_chunks/questions_chunk_1.json'
output_file = '/home/vicky/.gemini/antigravity/scratch/snake-quiz/temp_chunks/questions_chunk_1_out.json'

with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data:
    q_id = item['id']
    if q_id in new_options_map:
        item['options'].extend(new_options_map[q_id])

with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Done processing 50 questions!")
