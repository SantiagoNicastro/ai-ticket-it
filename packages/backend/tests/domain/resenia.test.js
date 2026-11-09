const { Resenia } = require('../../src/domain/Resenia');
const { ValidationError } = require('../../src/errors');

describe('Dominio - Resenia', () => {
  const comprador = { id: 'comp-1', nombre: 'Comprador' };
  const evento = { id: 'ev-1', nombre: 'Evento' };

  test('se crea correctamente con puntuación válida (1 a 5)', () => {
    const resenia = new Resenia({
      comprador,
      evento,
      detalle: 'Excelente evento',
      puntuacion: 5
    });

    expect(resenia.puntuacion).toBe(5);
    expect(resenia.detalle).toBe('Excelente evento');
  });

  test('puntuación fuera de rango o detalle vacío lanza ValidationError', () => {
    expect(() => {
      new Resenia({ comprador, evento, detalle: 'Malísimo', puntuacion: 6 });
    }).toThrow(ValidationError);

    expect(() => {
      new Resenia({ comprador, evento, detalle: '', puntuacion: 3 });
    }).toThrow(ValidationError);
  });
});
