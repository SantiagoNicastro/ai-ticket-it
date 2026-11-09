## 1. Alcance
- Plataforma de publicación de eventos y venta de entradas.
- Backend Node + Express en capas, persistencia en memoria. Front React Native.
- Sin login: el usuario que actúa se identifica con el header `x-usuario-id`.
- Un único `Usuario`. El rol (comprador u organizador) lo da la relación con el evento o la compra.

## 2. Entidades y reglas de negocio

### Usuario
- Tiene nombre, apellido y lista de eventos favoritos.
- Puede ser organizador de unos eventos y comprador de otros.

### Evento
- Tiene nombre, descripción, categoría, fecha, multimedia, organizador y al menos un tipo de entrada.
- La fecha debe ser futura al momento de crearlo.
- Solo el organizador puede crearlo y modificarlo.

### TipoEntrada
- Tiene nombre, descripción, precio y cupo.
- Precio >= 0. Cupo entero > 0.
- Cupo disponible = cupo - suma de las cantidades de compras en estado CONFIRMADA o UTILIZADA.
- `hayCupoPara(n)` es verdadero si n <= cupo disponible.

### Compra
- Tiene comprador, evento, tipo de entrada, cantidad, total, estado, mensajes e historial.
- Cantidad entera > 0.
- El tipo de entrada debe pertenecer al evento.
- Total = precio del tipo de entrada x cantidad, calculado al crearla.
- El evento debe ser futuro al crearla.
- Nace en PENDIENTE y no descuenta cupo.
- Solo cambia de estado mediante `actualizarEstado`, que valida la transición (sección 3).
- Cada cambio de estado genera un registro en `CambioEstadoCompra`.

### CambioEstadoCompra
- Registra compra, nuevo estado, quién y fechaHora.
- `quien` es null cuando la transición la hace el Sistema.

### Mensaje
- Solo pueden enviarlos el comprador y el organizador del evento de esa compra.
- Texto no vacío.
- Se pueden enviar en cualquier estado de la compra, incluso cancelada o utilizada.

### Reseña
- Solo la puede crear el comprador de la compra.
- La compra debe estar UTILIZADA.
- Una reseña por compra.
- Puntuación entera de 1 a 5. Detalle (comentario) de texto.
- Puntaje del organizador = promedio de las puntuaciones de las reseñas de todos sus eventos. Sin reseñas, no tiene puntaje.

### Búsqueda de eventos
- Búsqueda textual por nombre o descripción, sin distinguir mayúsculas.
- Filtro por categoría.
- Orden por precio (el menor precio de sus tipos de entrada), fecha del evento o puntaje del organizador, ascendente o descendente.
- Los organizadores sin puntaje van al final al ordenar por puntaje.
- El detalle de un evento muestra las reseñas de los eventos del organizador.

## 3. Estados de Compra

### Transiciones válidas
- (nueva) -> PENDIENTE
  - Dispara: comprador.
  - Condición: cantidad > 0, tipo de entrada del evento, hay cupo para la cantidad, evento futuro.
  - Efecto: no descuenta cupo.
- 
- PENDIENTE -> CONFIRMADA
  - Dispara: Sistema (pago simulado aprobado).
  - Condición: sigue habiendo cupo para la cantidad.
  - Efecto: descuenta el cupo.
  - Si ya no hay cupo: error 409 y la compra queda PENDIENTE.
- 
- CONFIRMADA -> UTILIZADA
  - Dispara: organizador del evento de la compra.
  - Condición: el evento es hoy o ya empezó.
  
- CONFIRMADA -> CANCELADA
  - Dispara: comprador de la compra.
  - Condición: la compra no está UTILIZADA y el evento todavía no se realizó.
  - Efecto: devuelve el cupo.
  
- CANCELADA -> REEMBOLSADA
  - Dispara: Sistema (reembolso simulado, paso aparte).
  - Condición: la compra está CANCELADA.

### Reglas generales
- UTILIZADA y REEMBOLSADA son estados terminales.
- Toda transición que no figure arriba falla con 409.
- Si quien dispara no es el actor permitido, falla con 403.

### Decisiones de diseño
- No se puede cancelar desde PENDIENTE: sin pago no hay nada que cancelar ni reembolsar. Se aparta de la lectura literal del enunciado y queda justificado acá.
- Cupo al confirmar: una compra impaga no bloquea entradas. Contrapartida: el pago puede llegar sin cupo disponible.
- Reembolso como paso aparte: CANCELADA es un estado observable porque los reembolsos son asíncronos. El organizador no decide si se reembolsa.
- Una compra PENDIENTE sin pagar queda así indefinidamente (sin expiración). No toma cupo, así que no molesta.
- "Compró y no fue": la compra queda CONFIRMADA. No se puede cancelar porque el evento pasó. No existe estado de ausente.
- Concurrencia: verificar y descontar cupo ocurre en código síncrono, sin await en el medio. Con persistencia en memoria y un solo hilo no hay condición de carrera. Con base de datos real habría que usar transacciones o actualizaciones atómicas.

### Fuera de alcance
- Cancelación de eventos completos por parte del organizador.
- Pasarela de pago real (el pago y el reembolso son simulados).
- Expiración automática de compras PENDIENTE.
- Login y autenticación.

## 4. Códigos de error
- 400: datos inválidos o campos faltantes (ValidationError).
- 403: el usuario no tiene permiso para la acción.
- 404: recurso inexistente (NotFoundError).
- 409: transición inválida, cupo insuficiente o reseña duplicada (ConflictError).

## 5. Criterios de aceptación

### Flujo 1: Crear evento (organizador)
- Dado un organizador y un evento con fecha futura y al menos un tipo de entrada válido
  Cuando lo crea
  Entonces recibe 201 con el evento.
- Dado un tipo de entrada con cupo 0 o precio negativo
  Cuando crea el evento
  Entonces recibe 400.

### Flujo 2: Buscar y explorar eventos (comprador)
- Dado que existen eventos
  Cuando busco por texto o filtro por categoría
  Entonces recibo solo los que coinciden.
- Dado que existen eventos
  Cuando ordeno por precio, fecha o puntaje del organizador
  Entonces recibo la lista en ese orden.
- Dado un evento de un organizador con reseñas
  Cuando veo su detalle
  Entonces veo las reseñas de los eventos de ese organizador.

### Flujo 3: Comprar entradas
- Dado un tipo de entrada con cupo suficiente
  Cuando compro una cantidad válida
  Entonces recibo 201 con la compra en PENDIENTE y el cupo no cambia.
- Dado una cantidad mayor al cupo disponible
  Cuando compro
  Entonces recibo 409.
- Dada una compra PENDIENTE y cupo suficiente
  Cuando el Sistema la confirma
  Entonces pasa a CONFIRMADA y el cupo disponible baja en esa cantidad.
- Dada una compra PENDIENTE sin cupo suficiente
  Cuando el Sistema intenta confirmarla
  Entonces recibo 409 y sigue PENDIENTE.

### Flujo 4: Ver compras
- Dado un comprador con compras
  Cuando consulta sus compras
  Entonces ve el estado de cada una y, en las CONFIRMADA, los días que faltan para el evento.
- Dado un organizador
  Cuando consulta las compras de su evento
  Entonces ve el estado de cada una y las entradas disponibles por tipo.
- Dado un usuario que no es el organizador del evento
  Cuando consulta sus compras
  Entonces recibe 403.

### Flujo 5: Cancelar y reembolsar
- Dada una compra CONFIRMADA y un evento futuro
  Cuando el comprador cancela
  Entonces pasa a CANCELADA y el cupo se devuelve.
- Dada una compra UTILIZADA, o un evento ya realizado
  Cuando el comprador cancela
  Entonces recibe 409.
- Dada una compra PENDIENTE
  Cuando el comprador cancela
  Entonces recibe 409.
- Dada una compra CANCELADA
  Cuando el Sistema procesa el reembolso
  Entonces pasa a REEMBOLSADA.

### Flujo 6: Utilizar entrada y reseñar
- Dada una compra CONFIRMADA y un evento que es hoy o ya empezó
  Cuando el organizador la marca como utilizada
  Entonces pasa a UTILIZADA.
- Dada una compra UTILIZADA
  Cuando el comprador la reseña con puntuación de 1 a 5 y comentario
  Entonces recibe 201.
- Dada una compra que no está UTILIZADA, o que ya tiene reseña
  Cuando el comprador intenta reseñar
  Entonces recibe 409.

### Flujo 7: Chat de la compra
- Dado el comprador o el organizador de una compra
  Cuando envía un mensaje no vacío
  Entonces recibe 201 y el mensaje queda en la compra.
- Dado un usuario ajeno a la compra
  Cuando intenta enviar o leer mensajes
  Entonces recibe 403.