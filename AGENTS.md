gi## Arquitectura
- Monorepo: packages/backend, packages/mobile, packages/docs
- Backend en capas: Controller > Service > Repository
- Lógica de negocio e invariantes en las entidades de dominio (modelo no anémico)
- Persistencia en memoria. Dependencias e inyección de reloj por constructor
- Errores propios (ValidationError, NotFoundError, ForbiddenError, ConflictError) con middleware global

## Fuente de verdad
- packages/docs/spec.md (qué) y packages/docs/plan.md (cómo y tareas)

## Comandos
- Tests backend: npm test --workspace=backend

## Reglas
- Una tarea por vez, tests primero
- Todo cambio incluye tests
- Rutas REST con sustantivos, sin verbos en la URL
- No agregar dependencias sin avisar
- Configuración y secretos por process.env, nunca en el repo
````
````

Cuando guardes `spec.md`, `plan.md` y `AGENTS.md`, hacé un commit (`docs: spec y plan`) y anotá esta sesión en la bitácora, incluyendo tu corrección sobre los verbos en los endpoints, que es un buen ejemplo de "qué cambié yo". Después arrancamos con T1.