const { ValidationError } = require('../errors');

class TipoEntrada {
  constructor({ id, nombre, descripcion, precio, cupo }) {
    if (!nombre || typeof nombre !== 'string') {
      throw new ValidationError('El nombre del tipo de entrada es obligatorio');
    }
    if (precio === undefined || precio < 0) {
      throw new ValidationError('El precio debe ser mayor o igual a 0');
    }
    if (cupo === undefined || !Number.isInteger(cupo) || cupo <= 0) {
      throw new ValidationError('El cupo debe ser un número entero mayor a 0');
    }

    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.precio = precio;
    this.cupo = cupo;
  }

  calcularCupoDisponible(comprasAsociadas = []) {
    const ocupado = comprasAsociadas
      .filter(c => c.tipoEntrada && c.tipoEntrada.id === this.id && (c.estado === 'CONFIRMADA' || c.estado === 'UTILIZADA'))
      .reduce((acc, c) => acc + c.cantidad, 0);

    return this.cupo - ocupado;
  }

  hayCupoPara(cantidad, comprasAsociadas = []) {
    return cantidad <= this.calcularCupoDisponible(comprasAsociadas);
  }
}

module.exports = {
  TipoEntrada
};
