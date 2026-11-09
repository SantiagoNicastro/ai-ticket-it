class CambioEstadoCompra {
  constructor({ compra, estado, quien, fechaHora }) {
    this.compra = compra;
    this.estado = estado;
    this.quien = quien || null;
    this.fechaHora = fechaHora || new Date();
  }
}

module.exports = {
  CambioEstadoCompra
};
