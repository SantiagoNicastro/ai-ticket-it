const {
  AppError,
  ValidationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} = require('../../src/errors');

describe('errores propios', () => {
  test.each([
    [ValidationError, 400],
    [ForbiddenError, 403],
    [NotFoundError, 404],
    [ConflictError, 409],
  ])('%p tiene el statusCode %i y es un AppError', (ErrorClase, status) => {
    const error = new ErrorClase('mensaje de prueba');

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(status);
    expect(error.message).toBe('mensaje de prueba');
    expect(error.name).toBe(ErrorClase.name);
  });
});