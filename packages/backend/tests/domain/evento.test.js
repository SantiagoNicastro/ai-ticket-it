const { Evento } = require('../../src/domain/Evento');
const { TipoEntrada } = require('../../src/domain/TipoEntrada');
const { ValidationError } = require('../../src/errors');

describe('Dominio - Evento', () => {
  const relojFalso = { ahora: () => new Date('2026-01-01T10:00:00Z') };
  const organizador = { id: 'org-1', nombre: 'Organizador' };

  test('debe crearse correctamente si la fecha es futura', () => {
    const tipo = new TipoEntrada({ id: 'te-1', nombre: 'General', precio: 1000, cupo: 10 });
    const evento = new Evento({
      id: 'ev-1',
      nombre: 'Concierto',
      fecha: '2026-06-01T20:00:00Z',
      organizador,
      tiposEntrada: [tipo],
      reloj: relojFalso
    });

    expect(evento.nombre).toBe('Concierto');
    expect(evento.tuPrecioEstaEntre(500, 1500)).toBe(true);
    expect(evento.tuPrecioEstaEntre(2000, 3000)).toBe(false);
  });

  test('falla al crear un evento con fecha pasada o sin tipos de entrada', () => {
    const tipo = new TipoEntrada({ id: 'te-1', nombre: 'General', precio: 1000, cupo: 10 });

    expect(() => {
      new Evento({
        id: 'ev-1',
        nombre: 'Pasado',
        fecha: '2025-12-31T20:00:00Z',
        organizador,
        tiposEntrada: [tipo],
        reloj: relojFalso
      });
    }).toThrow(ValidationError);

    expect(() => {
      new Evento({
        id: 'ev-1',
        nombre: 'Sin entradas',
        fecha: '2026-06-01T20:00:00Z',
        organizador,
        tiposEntrada: [],
        reloj: relojFalso
      });
    }).toThrow(ValidationError);
  });
});
