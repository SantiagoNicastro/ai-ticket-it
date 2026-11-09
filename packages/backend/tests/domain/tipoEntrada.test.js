const { TipoEntrada } = require('../../src/domain/TipoEntrada');
const { ValidationError } = require('../../src/errors');

describe('Dominio - TipoEntrada', () => {
  test('debe crearse correctamente con datos válidos', () => {
    const tipo = new TipoEntrada({
      id: 'te-1',
      nombre: 'General',
      descripcion: 'Entrada general',
      precio: 1500,
      cupo: 100
    });

    expect(tipo.nombre).toBe('General');
    expect(tipo.precio).toBe(1500);
    expect(tipo.cupo).toBe(100);
  });

  test('falla si el precio es negativo o el cupo es inválido', () => {
    expect(() => {
      new TipoEntrada({ nombre: 'VIP', precio: -10, cupo: 10 });
    }).toThrow(ValidationError);

    expect(() => {
      new TipoEntrada({ nombre: 'VIP', precio: 100, cupo: 0 });
    }).toThrow(ValidationError);
  });

  test('calcula correctamente el cupo disponible considerando compras confirmadas y utilizadas', () => {
    const tipo = new TipoEntrada({ id: 'te-1', nombre: 'VIP', precio: 5000, cupo: 10 });

    const comprasAsociadas = [
      { tipoEntrada: { id: 'te-1' }, estado: 'CONFIRMADA', cantidad: 3 },
      { tipoEntrada: { id: 'te-1' }, estado: 'UTILIZADA', cantidad: 2 },
      { tipoEntrada: { id: 'te-1' }, estado: 'CANCELADA', cantidad: 4 }, // No debe restar
      { tipoEntrada: { id: 'te-2' }, estado: 'CONFIRMADA', cantidad: 5 }  // De otro tipo de entrada
    ];

    expect(tipo.calcularCupoDisponible(comprasAsociadas)).toBe(5); // 10 - (3 + 2)
    expect(tipo.hayCupoPara(5, comprasAsociadas)).toBe(true);
    expect(tipo.hayCupoPara(6, comprasAsociadas)).toBe(false);
  });
});
