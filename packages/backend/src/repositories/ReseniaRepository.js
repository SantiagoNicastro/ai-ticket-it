class ReseniaRepository {
  constructor() {
    this.resenias = new Map();
  }

  agregar(resenia) {
    if (!resenia.id) {
      throw new Error('La reseña debe tener un ID');
    }
    this.resenias.set(resenia.id, resenia);
    return resenia;
  }

  buscar(id) {
    return this.resenias.get(id) || null;
  }

  buscarTodos() {
    return Array.from(this.resenias.values());
  }

  guardar(resenia) {
    this.resenias.set(resenia.id, resenia);
    return resenia;
  }
}

module.exports = ReseniaRepository;