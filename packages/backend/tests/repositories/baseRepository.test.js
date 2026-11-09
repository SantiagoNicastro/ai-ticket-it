// packages/backend/tests/repositories/baseRepository.test.js
const BaseRepository = require('../../src/repositories/BaseRepository');

describe('BaseRepository (In-Memory)', () => {
  let repository;

  beforeEach(() => {
    repository = new BaseRepository();
  });

  test('debe agregar un elemento y poder buscarlo por su ID', () => {
    const item = { id: '123', nombre: 'Test Item' };
    repository.agregar(item);

    const encontrado = repository.buscar('123');
    expect(encontrado).toEqual(item);
  });

  test('debe retornar null al buscar un ID inexistente', () => {
    const encontrado = repository.buscar('id-que-no-existe');
    expect(encontrado).toBeNull();
  });

  test('debe retornar todos los elementos con buscarTodos', () => {
    repository.agregar({ id: '1', nombre: 'Item 1' });
    repository.agregar({ id: '2', nombre: 'Item 2' });

    const todos = repository.buscarTodos();
    expect(todos).toHaveLength(2);
    expect(todos).toEqual(
      expect.arrayContaining([
        { id: '1', nombre: 'Item 1' },
        { id: '2', nombre: 'Item 2' }
      ])
    );
  });

  test('debe actualizar/guardar un elemento correctamente (upsert)', () => {
    const item = { id: '123', nombre: 'Original' };
    repository.agregar(item);

    const itemModificado = { id: '123', nombre: 'Actualizado' };
    repository.guardar(itemModificado);

    expect(repository.buscar('123').nombre).toBe('Actualizado');
    expect(repository.buscarTodos()).toHaveLength(1);
  });
});