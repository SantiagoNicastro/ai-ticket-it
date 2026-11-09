# Plan técnico - AI Ticket It

Fuente de verdad: docs/spec.md. Este plan define el cómo, en capas, y las tareas.

## 1. Arquitectura backend

Capas: Controller -> Service -> Repository, con dominio rico (las entidades validan sus invariantes).

packages/backend/
- src/domain/        Usuario, Evento, TipoEntrada, Compra, CambioEstadoCompra, Mensaje, Resenia, EstadoCompra
- src/repositories/  repositorios en memoria (un Map por entidad)
- src/services/      EventoService, CompraService, MensajeService, ReseniaService
- src/controllers/   un controller por recurso, con su router
- src/errors/        ValidationError, NotFoundError, ForbiddenError, ConflictError
- src/middlewares/   identificarUsuario (header x-usuario-id), errorHandler
- src/seed/          datos iniciales en memoria
- src/app.js         arma Express con las dependencias inyectadas
- src/server.js      levanta el servidor
- tests/             espeja la estructura de src/

## 2. Decisiones técnicas

- Persistencia en memoria. Los repositorios exponen agregar, buscar, buscarTodos, guardar.
- Ids con crypto.randomUUID().
- Reloj inyectable: objeto con ahora() que devuelve la fecha actual. El dominio y los services lo reciben, así los tests controlan la fecha ("evento ya realizado", "evento hoy") sin depender de la hora real.
- Dependencias inyectadas por constructor (Dependency Inversion): los services reciben repositorios y reloj.
- Errores propios mapeados a HTTP en un middleware global: Validation 400, Forbidden 403, NotFound 404, Conflict 409.
- Verificar cupo y descontarlo ocurre en código síncrono, sin await en el medio.
- El controller solo valida forma (campos, tipos), traduce y delega. Ninguna regla de negocio en controllers.
- Rutas con sustantivos. Las acciones se modelan como recursos o como cambio de estado, nunca como verbos en la URL.

## 3. API REST

Eventos
- POST   /eventos                   Crea evento con tipos de entrada (organizador = usuario del header)
- GET    /eventos                   Búsqueda: ?q=&categoria=&orden=precio|fecha|puntaje&direccion=asc|desc
- GET    /eventos/:id               Detalle, incluye reseñas del organizador y cupo disponible por tipo
- GET    /eventos/:id/compras       Compras del evento con estado (solo organizador)

Compras
- POST   /compras                   Crea compra en PENDIENTE (eventoId, tipoEntradaId, cantidad)
- GET    /compras                   Compras del usuario del header, con días restantes en las CONFIRMADA
- GET    /compras/:id               Detalle con historial de estados (solo comprador u organizador)
- PATCH  /compras/:id/estado        Body { estado }. Solo acepta CANCELADA (comprador) y UTILIZADA (organizador)
- POST   /compras/:id/pagos         Pago simulado, lo hace el Sistema. Lleva la compra a CONFIRMADA
- POST   /compras/:id/reembolsos    Reembolso simulado, lo hace el Sistema. Lleva la compra a REEMBOLSADA

Mensajes y reseñas
- GET    /compras/:id/mensajes
- POST   /compras/:id/mensajes
- POST   /compras/:id/resenias      Una por compra, solo con compra UTILIZADA

Utilitarios
- GET    /health                    Health check
- GET    /categorias                Para el filtro del front

Notas:
- Pagos y reembolsos no requieren x-usuario-id: representan al Sistema y registran quien = null.
- PATCH /compras/:id/estado con CONFIRMADA o REEMBOLSADA responde 409: esas transiciones solo se hacen por sus recursos.

## 4. Tareas del backend

Cada tarea: se hace en una rama feat/tN-..., con tests escritos primero, y un commit por tarea.

### T1 - Errores y middleware
- Entregable: clases de error, errorHandler, middleware identificarUsuario.
- Verificación: tests unitarios del errorHandler (cada error -> su código; error desconocido -> 500).

### T2 - Dominio
- Entregable: TipoEntrada (hayCupoPara, cupo disponible), Evento (tuPrecioEstaEntre, validaciones), Compra (total, actualizarEstado con tabla de transiciones, actor y reloj), CambioEstadoCompra, Mensaje, Resenia.
- Verificación: tests unitarios de dominio.
  - Cada transición válida pasa; cada inválida lanza ConflictError.
  - Cancelar con evento pasado o UTILIZADA falla.
  - Cantidad 0, precio negativo y puntuación fuera de 1-5 fallan.
  - Cupo disponible se calcula bien con compras en distintos estados.

### T3 - Repositorios en memoria
- Entregable: un repositorio por entidad.
- Verificación: tests simples de agregar, buscar y guardar. Buscar un id inexistente devuelve null.

### T4 - Services
- Entregable: EventoService (crear, buscar, ordenar, detalle), CompraService (crear, pagar, cancelar, utilizar, reembolsar, listar con días restantes), MensajeService, ReseniaService.
- Verificación: tests unitarios con repositorios reales en memoria y reloj falso.
  - Pagar con cupo agotado lanza ConflictError y la compra sigue PENDIENTE.
  - Cancelar devuelve el cupo.
  - Un usuario ajeno recibe ForbiddenError.
  - Una segunda reseña lanza ConflictError.
  - El orden por puntaje deja al final a los organizadores sin reseñas.

### T5 - Controllers y rutas
- Entregable: routers según la sección 3, validación superficial de body y params.
- Verificación: 1 o 2 tests de controller con supertest (por ejemplo, POST /compras con cantidad mayor al cupo da 409; PATCH /compras/:id/estado por un usuario ajeno da 403).

### T6 - Seed y arranque
- Entregable: seed con usuarios, un evento con 2 tipos de entrada y compras en distintos estados; GET /health; servidor escuchando en 0.0.0.0.
- Verificación: manual, recorrer el flujo completo con Postman o curl.

## 5. Tareas del mobile (React Native con Expo)

Se detallan cuando termine el backend. Orden previsto:
- T7  Proyecto Expo, apiClient central (URL base configurable) y componentes de estado (cargando, error con reintentar, vacío).
- T8  Catálogo con búsqueda, categorías y orden.
- T9  Detalle de evento, reseñas del organizador y compra.
- T10 Mis compras: estado, días restantes y cancelar con confirmación.
- T11 Chat de la compra y reseña.
- T12 Vista del organizador: compras de su evento y cupo por tipo.

Verificación mobile: manual en el celular, con las 4 estados de UI en cada pantalla que llama al backend.

## 6. Prompt base por tarea (RCT dentro de SDD)

Rol: dev backend senior en Node + Express.
Contexto: spec.md y plan.md adjuntos, arquitectura en capas, reglas de AGENTS.md.
Tarea: implementar SOLO la tarea TN. Escribir primero los tests. No modificar otras capas ni agregar dependencias sin avisar.
Criterio de listo: los tests de TN pasan y el diff no toca archivos fuera de la tarea.

## 7. Proceso por tarea
1. Crear rama feat/tN-nombre.
2. Pasar a la IA spec, plan y la tarea con el prompt base.
3. Revisar el código como si fuera de un tercero: validaciones, reglas fuera de lugar, dependencias inventadas.
4. Correr tests y commit.
5. Anotar la entrada en BITACORA_IA.md: qué pedí, qué rechacé o cambié y por qué.