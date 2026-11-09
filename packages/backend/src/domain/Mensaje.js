const { ValidationError } = require('../errors');

class Mensaje {
  constructor({ usuario, mensaje, enviado }) {
    if (!usuario) throw new ValidationError('El usuario es obligatorio');
    if (!mensaje || typeof mensaje !== 'string' || mensaje.trim() === '') {
      throw new ValidationError('El texto del mensaje no puede estar vacío');
    }

    this.usuario = usuario;
    this.mensaje = mensaje;
    this.enviado = enviado || new Date();
  }
}

module.exports = {
  Mensaje
};
