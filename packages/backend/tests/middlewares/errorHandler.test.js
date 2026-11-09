const errorHandler = require('../../src/middlewares/errorHandler');
const {
  ValidationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require('../../src/errors');

function crearRes() {
  return { status: jest.fn().mockReturnThis(), json: jest.fn() };
}

describe('errorHandler', () => {
  test.each([
    [new ValidationError('datos inválidos'), 400],
    [new ForbiddenError('sin permiso'), 403],
    [new NotFoundError('no existe'), 404],
    [new ConflictError('transición inválida'), 409],
  ])('traduce %p a su código HTTP', (error, status) => {
    const res = crearRes();

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({ error: error.message });
  });

  test('un JSON mal formado en el body responde 400', () => {
    const res = crearRes();
    const error = Object.assign(new SyntaxError('Unexpected token'), {
      type: 'entity.parse.failed',
    });

    errorHandler(error, {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('un error desconocido responde 500 sin exponer el detalle', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const res = crearRes();

    errorHandler(new Error('detalle interno secreto'), {}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
    consoleSpy.mockRestore();
  });
});