class CompraRepository {
  constructor() {
    this.compras = new Map();
  }

  agregar(compra) {
    if (!compra.id) {
      throw new Error('La compra debe tener un ID');
    }
    this.compras.set(compra.id, compra);
    return compra;
  }

  buscar(id) {
    return this.compras.get(id) || null;
  }

  buscarTodos() {
    return Array.from(this.compras.values());
  }

  guardar(compra) {
    this.compras.set(compra.id, compra);
    return compra;
  }
}

module.exports = CompraRepository;