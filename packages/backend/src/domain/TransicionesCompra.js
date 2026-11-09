const { ConflictError } = require('../errors');
const { EstadoCompra } = require('./EstadoCompra');

const TRANSICIONES_VALIDAS = {
  [EstadoCompra.PENDIENTE]: {
    [EstadoCompra.CONFIRMADA]: {
      validar: (compra, actor, reloj, comprasDelEvento) => {
        if (!compra.tipoEntrada.hayCupoPara(compra.cantidad, comprasDelEvento)) {
          throw new ConflictError('Cupo insuficiente para confirmar la compra');
        }
      }
    }
  },
  [EstadoCompra.CONFIRMADA]: {
    [EstadoCompra.UTILIZADA]: {
      validar: (compra, actor) => {
        if (actor?.id !== compra.evento.organizador.id) {
          throw new ConflictError('Solo el organizador puede marcar la entrada como utilizada');
        }
      }
    },
    [EstadoCompra.CANCELADA]: {
      validar: (compra, actor, reloj) => {
        const fechaActual = reloj ? reloj.ahora() : new Date();
        if (new Date(compra.evento.fecha) <= fechaActual) {
          throw new ConflictError('No se puede cancelar una compra de un evento pasado');
        }
        if (actor?.id !== compra.comprador.id) {
          throw new ConflictError('Solo el comprador puede cancelar la compra');
        }
      }
    },
    [EstadoCompra.REEMBOLSADA]: {
      validar: () => {}
    }
  },
  [EstadoCompra.CANCELADA]: {
    [EstadoCompra.REEMBOLSADA]: {
      validar: () => {}
    }
  }
};

function validarYObtenerTransicion(estadoActual, nuevoEstado, compra, actor, reloj, comprasDelEvento) {
  const transicionesDesdeActual = TRANSICIONES_VALIDAS[estadoActual];
  const transicionDefinida = transicionesDesdeActual && transicionesDesdeActual[nuevoEstado];

  if (!transicionDefinida) {
    throw new ConflictError(`Transición de estado de ${estadoActual} a ${nuevoEstado} no permitida`);
  }

  transicionDefinida.validar(compra, actor, reloj, comprasDelEvento);
}

module.exports = {
  TRANSICIONES_VALIDAS,
  validarYObtenerTransicion
};
