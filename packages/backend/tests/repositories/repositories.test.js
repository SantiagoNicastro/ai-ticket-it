const EventoRepository = require('../../src/repositories/EventoRepository');
const CompraRepository = require('../../src/repositories/CompraRepository');

describe('Repositorios en memoria (T3)', () => {
  test('EventoRepository: agrega, busca, lista y guarda correctamente', () => {
    const repo = new EventoRepository();
    const evento = { id: 'evt-1', nombre: 'Recital' };

    expect(repo.buscar('evt-1')).toBeNull(); // ID inexistente devuelve null

    repo.agregar(evento);
    expect(repo.buscar('evt-1')).toEqual(evento);
    expect(repo.buscarTodos()).toHaveLength(1);

    const eventoActualizado = { id: 'evt-1', nombre: 'Recital Actualizado' };
    repo.guardar(eventoActualizado);
    expect(repo.buscar('evt-1').nombre).toBe('Recital Actualizado');
  });

  test('CompraRepository: maneja correctamente las compras en memoria', () => {
    const repo = new CompraRepository();
    const compra = { id: 'cmp-1', cantidad: 2 };

    repo.agregar(compra);
    expect(repo.buscar('cmp-1')).toEqual(compra);
    expect(repo.buscarTodos()).toHaveLength(1);
  });
});