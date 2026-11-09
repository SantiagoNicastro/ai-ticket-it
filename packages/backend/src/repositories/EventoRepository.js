// packages/backend/src/repositories/EventoRepository.js
class EventoRepository {
  constructor() {
    this.eventos = new Map();
  }

  agregar(evento) {
    if (!evento.id) {
      throw new Error('El evento debe tener un ID');
    }
    this.eventos.set(evento.id, evento);
    return evento;
  }

  buscar(id) {
    return this.eventos.get(id) || null;
  }

  buscarTodos() {
    return Array.from(this.eventos.values());
  }

  guardar(evento) {
    
    this.eventos.set(evento.id, evento);
    return evento;
  }
}

module.exports = EventoRepository;