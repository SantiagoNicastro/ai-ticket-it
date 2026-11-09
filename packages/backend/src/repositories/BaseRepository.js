// packages/backend/src/repositories/BaseRepository.js
class BaseRepository {
  constructor() {
    this.items = new Map();
  }

  agregar(item) {
    if (!item.id) {
      throw new Error('El elemento a agregar debe poseer un ID');
    }
    this.items.set(item.id, item);
    return item;
  }

  buscar(id) {
    return this.items.get(id) || null;
  }

  buscarTodos() {
    return Array.from(this.items.values());
  }

  guardar(item) {
    if (!item.id) {
      throw new Error('El elemento a guardar debe poseer un ID');
    }
    this.items.set(item.id, item);
    return item;
  }

  limpiar() {
    this.items.clear();
  }
}

module.exports = BaseRepository;