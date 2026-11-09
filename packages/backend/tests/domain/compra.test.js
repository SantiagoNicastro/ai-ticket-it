const { Evento } = require('../../src/domain/Evento');
const { TipoEntrada } = require('../../src/domain/TipoEntrada');
const { Compra } = require('../../src/domain/Compra');
const { EstadoCompra } = require('../../src/domain/EstadoCompra');
const { ConflictError, ValidationError } = require('../../src/errors');

describe('Dominio - Compra y Máquina de Estados', () => {
  const relojFalso = { ahora: () => new Date('2026-01-01T10:00:00Z') };
  const organizador = { id: 'org-1', nombre: 'Org' };
  const comprador = { id: 'comp-1', nombre: 'Comprador' };
  const otroUsuario = { id: 'user-ajeno', nombre: 'Ajeno' };

  const crearEventoFuturo = () => new Evento({
    id: 'ev-1',
    nombre: 'Festival',
    fecha: '2026-06-01T20:00:00Z',
    organizador,
    tiposEntrada: [new TipoEntrada({ id: 'te-1', nombre: 'General', precio: 1000, cupo: 5 })],
    reloj: relojFalso
  });

  test('nace en estado PENDIENTE con cantidad y total correctos', () => {
    const evento = crearEventoFuturo();
    const compra = new Compra({
      id: 'c-1',
      comprador,
      evento,
      tipoEntrada: evento.tiposEntrada[0],
      cantidad: 2,
      reloj: relojFalso
    });

    expect(compra.estado).toBe(EstadoCompra.PENDIENTE);
    expect(compra.total).toBe(2000);
    expect(compra.historial.length).toBe(1);
  });

  test('cantidad inválida lanza ValidationError', () => {
    const evento = crearEventoFuturo();
    expect(() => {
      new Compra({
        id: 'c-1',
        comprador,
        evento,
        tipoEntrada: evento.tiposEntrada[0],
        cantidad: 0,
        reloj: relojFalso
      });
    }).toThrow(ValidationError);
  });

  test('transición válida: PENDIENTE a CONFIRMADA (verificando cupo)', () => {
    const evento = crearEventoFuturo();
    const compra = new Compra({
      id: 'c-1',
      comprador,
      evento,
      tipoEntrada: evento.tiposEntrada[0],
      cantidad: 3,
      reloj: relojFalso
    });

    compra.actualizarEstado(EstadoCompra.CONFIRMADA, null, relojFalso, []);
    expect(compra.estado).toBe(EstadoCompra.CONFIRMADA);
    expect(compra.historial.length).toBe(2);
  });

  test('confirmar compra con cupo insuficiente lanza ConflictError', () => {
    const evento = crearEventoFuturo();
    const compra = new Compra({
      id: 'c-1',
      comprador,
      evento,
      tipoEntrada: evento.tiposEntrada[0],
      cantidad: 6, // Supera el cupo de 5
      reloj: relojFalso
    });

    expect(() => {
      compra.actualizarEstado(EstadoCompra.CONFIRMADA, null, relojFalso, []);
    }).toThrow(ConflictError);
  });

  test('transición válida: CONFIRMADA a CANCELADA por el comprador (evento futuro)', () => {
    const evento = crearEventoFuturo();
    const compra = new Compra({
      id: 'c-1',
      comprador,
      evento,
      tipoEntrada: evento.tiposEntrada[0],
      cantidad: 2,
      reloj: relojFalso
    });

    compra.actualizarEstado(EstadoCompra.CONFIRMADA, null, relojFalso, []);
    compra.actualizarEstado(EstadoCompra.CANCELADA, comprador, relojFalso, []);

    expect(compra.estado).toBe(EstadoCompra.CANCELADA);
  });

  test('cancelar una compra confirmada por un usuario ajeno lanza ConflictError', () => {
    const evento = crearEventoFuturo();
    const compra = new Compra({
      id: 'c-1',
      comprador,
      evento,
      tipoEntrada: evento.tiposEntrada[0],
      cantidad: 2,
      reloj: relojFalso
    });

    compra.actualizarEstado(EstadoCompra.CONFIRMADA, null, relojFalso, []);

    expect(() => {
      compra.actualizarEstado(EstadoCompra.CANCELADA, otroUsuario, relojFalso, []);
    }).toThrow(ConflictError);
  });

  test('transición inválida genérica lanza ConflictError', () => {
    const evento = crearEventoFuturo();
    const compra = new Compra({
      id: 'c-1',
      comprador,
      evento,
      tipoEntrada: evento.tiposEntrada[0],
      cantidad: 2,
      reloj: relojFalso
    });

    // Intentar pasar de PENDIENTE directo a UTILIZADA
    expect(() => {
      compra.actualizarEstado(EstadoCompra.UTILIZADA, organizador, relojFalso, []);
    }).toThrow(ConflictError);
  });
});
