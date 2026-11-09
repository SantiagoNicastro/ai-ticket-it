## Agente : Claude

---

##  - Planificación del TP con la clase de IA como guía

- **Prompt:** Le pasé el enunciado del TP individual y el material de la materia, y le pedí los pasos para hacerlo aplicando las prácticas de la clase de IA en desarrollo.
  
- **Resultado:** Un plan por fases: especificar (SDD), backend en capas con tareas chicas y tests, front en React Native, y armado del video. También sugirió llevar esta bitácora desde el día 1.
  
- **Qué decidí:** Seguir el enfoque SDD: spec primero, código después. La bitácora la arranqué desde el inicio.

##  - Análisis del diagrama tentativo

- **Prompt:** Subí la imagen del diagrama y pregunté por dónde arrancar.
  
- **Resultado:** Detectó que hay un único `Usuario` (el rol lo da la relación), que `EstadoCompra` tiene 5 valores, que `CambioEstadoCompra` es el historial y que `actualizarEstado` no define transiciones válidas. Propuso una primera máquina de estados.
  
- **Qué decidí:** Tomar la máquina de estados como borrador y completarla yo, empezando por las decisiones abiertas (reembolso, cancelar desde PENDIENTE, cupo).
  

##  - Estructura del repo y confusión con el TP grupal

- **Prompt:** Pregunté si el TP individual pedía front, porque estaba copiando la estructura del repo del TP grupal.
  
- **Resultado:** Aclaró que sí pide front, pero en React Native (no React web), con persistencia en memoria y sin despliegue. Me marcó qué cosas del grupal sobran: Mongoose, Atlas, Docker, Swagger, login.
  
- **Qué decidí:** Mantener la estructura de monorepo con `packages/` y limpiar lo heredado que no aplica.


##  - AGENTS.md en lugar de CLAUDE.md

- **Prompt:** Como tener prompts uni
- **Resultado:** Explicó que es el archivo de reglas del proyecto que lee la herramienta de IA, y que `AGENTS.md` es el nombre genérico que leen otros agentes. Me dio un ejemplo de contenido.
- **Qué decidí:** Usar `AGENTS.md`, por ser más genérico y no depender de una sola herramienta.
- **Aprendizaje:** Las reglas del proyecto se escriben una vez y evitan repetirlas en cada prompt.

##  - Diseño de la máquina de estados de Compra

- **Prompt:** Le conté mi razonamiento estado por estado (quién dispara cada transición y por qué) y le pedí validación.
  
- **Resultado:** Validó mi enfoque y marcó huecos. Propuso que el pago lo dispare el Sistema, que el comprador sea quien cancela, y que el reembolso sea un paso aparte disparado por el Sistema. Señaló que "cancelar desde PENDIENTE" se aparta del enunciado, que el actor "Sistema" no entra en `CambioEstadoCompra.quien`, y que el caso "compró y no fue" queda CONFIRMADA para siempre.
  
- **Qué decidí yo (mis ideas):**
  - No se puede cancelar desde PENDIENTE: sin pago no hay nada que cancelar ni reembolsar.
  - El cupo se descuenta al confirmar, no al crear la compra.
  - El organizador marca UTILIZADA, verificando quién usó la entrada.
  
- **Qué acepté de la IA:** Sistema como disparador de la confirmación y del reembolso; reembolso como paso aparte.

- **Qué traté con cuidado:** Mi decisión de no cancelar desde PENDIENTE contradice la lectura literal del enunciado, así que la dejo justificada en la spec.

##  - Generación de spec.md

- **Prompt:** Le pedí que armara el contenido del spec con lo debatido, en formato de bullets  y con las demás secciones (reglas de negocio, errores, criterios de aceptación).

- **Resultado:** Un `spec.md` con alcance, entidades y reglas, transiciones, decisiones de diseño, fuera de alcance, códigos de error y criterios Dado/Cuando/Entonces agrupados en 7 flujos.

- **Valores por defecto que puso la IA (no los pedí):** puntuación de reseña de 1 a 5, sin expiración de PENDIENTE, `quien = null` para el Sistema, identificación por header `x-usuario-id`, UTILIZADA permitida desde el día del evento, chat permitido en cualquier estado.
  
- **Qué cambié yo:** [completar: qué defaults modifiqué o confirmé, y por qué] !!
  
- **Aprendizaje:** La IA rellena huecos con supuestos propios. Conviene revisarlos uno por uno, porque quedan en la spec como si fueran decisiones mías.

##  - Diferencia entre AGENTS.md y la bitácora

- **Prompt:** Pregunté en qué se diferencian ambos archivos.
- **Resultado:** `AGENTS.md` son instrucciones hacia la IA (futuro, corto, prescriptivo); la bitácora es un registro hacia humanos (pasado, crece con cada sesión). Se alimentan entre sí: un error recurrente de la IA se convierte en una regla de `AGENTS.md`.
- **Qué decidí:** Mantener los dos archivos separados con esos roles.

##  - Decisiones técnicas previas al plan

- **Prompt:** Le pedí armar el `plan.md` con capas y tareas. Antes de escribirlo, la IA me hizo 7 preguntas técnicas, cada una con un valor por defecto.
- **Resultado:** Defaults propuestos: carpetas por capa, endpoints simulados para pago y reembolso, fecha inyectable en el dominio, ids con `crypto.randomUUID()`, Jest en dominio y services más 1 o 2 tests de controller, y un seed en memoria para la demo.
- **Qué acepté:** Todos los defaults.
- **Qué corregí yo:** Los endpoints propuestos eran `POST /compras/:id/pago` y `POST /compras/:id/reembolso`, y los rechacé porque ponían acciones (verbos) en la URL, lo cual es mala práctica REST. La clase lo dice en "Procesos": una acción que no es un ABM se modela como un recurso.
- **Cómo quedó:** `POST /compras/:id/pagos` y `POST /compras/:id/reembolsos` (recursos hijos) para lo que dispara el Sistema, y `PATCH /compras/:id/estado` para cancelar y utilizar.

##  - Generación de plan.md

- **Prompt:** Con los defaults ya aprobados, le pedí el `plan.md` con la arquitectura, la API y las tareas T1 a T6, cada una con su forma de verificación, más el esquema de tareas del mobile.
  
- **Resultado:** Un plan con estructura de carpetas, decisiones técnicas, lista de endpoints, tareas del backend con verificación, un prompt base RCT dentro de SDD y un proceso de trabajo por tarea
  
- **Observaciones de la IA que anoto:**
  - El plan asume `supertest` para el test de controller, una dependencia nueva. [completar: la dejé o la reemplacé, y por qué]
  - Que el front llame a `POST /compras/:id/pagos` es una simulación: en un sistema real el pago lo dispararía la pasarela, no el cliente. Lo voy a aclarar en el video.

- **Qué decidí:** Aceptar el plan como base y ajustarlo a medida que implemente cada tarea.


##  - Cierre de la fase de especificación

- **Estado:** `spec.md`, `plan.md` y `AGENTS.md` terminados y commiteados.
- **Próximo paso:** Implementar T1 (errores y middleware) con el prompt base del plan, escribiendo los tests primero.

---

