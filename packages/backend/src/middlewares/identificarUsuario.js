function identificarUsuario(req, res, next) {
  const id = req.header('x-usuario-id');
  req.usuarioId = id && id.trim() !== '' ? id.trim() : null;
  next();
}

module.exports = identificarUsuario;