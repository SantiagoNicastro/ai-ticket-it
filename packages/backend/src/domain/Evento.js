const { ValidationError } = require('../errors');

class Evento {
  constructor({ id, nombre, descripcion, categoria, fecha, multimedia = [], tiposEntrada = [], organizador, reloj }) {
    if (!nombre) throw new ValidationError('El nombre del evento es obligatorio');
    if (!fecha) throw new ValidationError('La fecha del evento es obligatoria');
    if (!organizador) throw new ValidationError('El organizador es obligatorio');
    if (!tiposEntrada || tiposEntrada.length === 0) {
      throw new ValidationError('El evento debe tener al menos un tipo de entrada');
    }

    const fechaActual = reloj ? reloj.ahora() : new Date();
    if (new Date(fecha) <= fechaActual) {
      throw new ValidationError('La fecha del evento debe ser futura');
    }

    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.categoria = categoria;
    this.fecha = new Date(fecha);
    this.multimedia = multimedia;
    this.tiposEntrada = tiposEntrada;
    this.organizador = organizador;
  }

  tuPrecioEstaEntre(min, max) {
    return this.tiposEntrada.some(t => t.precio >= min && t.precio <= max);
  }
}

module.exports = {
  Evento
};
