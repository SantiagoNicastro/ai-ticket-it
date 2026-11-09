const identificarUsuario = require('../../src/middlewares/identificarUsuario');

function crearReq(headers = {}) {
  return { header: (nombre) => headers[nombre.toLowerCase()] };
}

describe('identificarUsuario', () => {
  test('con el header x-usuario-id guarda el id en req.usuarioId', () => {
    const req = crearReq({ 'x-usuario-id': 'u-123' });
    const next = jest.fn();

    identificarUsuario(req, {}, next);

    expect(req.usuarioId).toBe('u-123');
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('sin el header deja req.usuarioId en null y sigue (representa al Sistema)', () => {
    const req = crearReq();
    const next = jest.fn();

    identificarUsuario(req, {}, next);

    expect(req.usuarioId).toBeNull();
    expect(next).toHaveBeenCalledTimes(1);
  });

  test('un header vacío o con espacios cuenta como ausente', () => {
    const req = crearReq({ 'x-usuario-id': '   ' });

    identificarUsuario(req, {}, jest.fn());

    expect(req.usuarioId).toBeNull();
  });
});