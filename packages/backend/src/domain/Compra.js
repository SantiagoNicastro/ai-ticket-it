const { ValidationError } = require('../errors');
const { EstadoCompra } = require('./EstadoCompra');
const { CambioEstadoCompra } = require('./CambioEstadoCompra');
const { validarYObtenerTransicion } = require('./TransicionesCompra');

class Compra {
  constructor({ id, comprador, evento, tipoEntrada, cantidad, reloj }) {
    if (!comprador) throw new ValidationError('El comprador es obligatorio');
    if (!evento) throw new ValidationError('El evento es obligatorio');
    if (!tipoEntrada) throw new ValidationError('El tipo de entrada es obligatorio');
    if (!cantidad || !Number.isInteger(cantidad) || cantidad <= 0) {
      throw new ValidationError('La cantidad debe ser un entero mayor a 0');
    }

    const fechaActual = reloj ? reloj.ahora() : new Date();
    if (new Date(evento.fecha) <= fechaActual) {
      throw new ValidationError('No se puede comprar para un evento pasado');
    }

    this.id = id;
    this.comprador = comprador;
    this.evento = evento;
    this.tipoEntrada = tipoEntrada;
    this.cantidad = cantidad;
    this.total = tipoEntrada.precio * cantidad;
    this.estado = EstadoCompra.PENDIENTE;
    this.mensajes = [];
    this.historial = [
      new CambioEstadoCompra({
        compra: this,
        estado: EstadoCompra.PENDIENTE,
        quien: comprador,
        fechaHora: fechaActual
      })
    ];
  }

  actualizarEstado(nuevoEstado, actor, reloj, comprasDelEvento = []) {
    const fechaActual = reloj ? reloj.ahora() : new Date();

    validarYObtenerTransicion(this.estado, nuevoEstado, this, actor, reloj, comprasDelEvento);

    this.estado = nuevoEstado;
    this.historial.push(
      new CambioEstadoCompra({
        compra: this,
        estado: nuevoEstado,
        quien: actor,
        fechaHora: fechaActual
      })
    );
  }
}

module.exports = {
  Compra
};
