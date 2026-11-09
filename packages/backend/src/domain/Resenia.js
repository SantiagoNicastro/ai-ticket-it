const { ValidationError } = require('../errors');

class Resenia {
  constructor({ comprador, evento, detalle, puntuacion }) {
    if (!comprador) throw new ValidationError('El comprador es obligatorio');
    if (!evento) throw new ValidationError('El evento es obligatorio');
    if (puntuacion === undefined || !Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
      throw new ValidationError('La puntuación debe ser un número entero entre 1 y 5');
    }
    if (!detalle || typeof detalle !== 'string' || detalle.trim() === '') {
      throw new ValidationError('El detalle de la reseña es obligatorio');
    }

    this.comprador = comprador;
    this.evento = evento;
    this.detalle = detalle;
    this.puntuacion = puntuacion;
  }
}

module.exports = {
  Resenia
};
