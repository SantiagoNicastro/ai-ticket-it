class UsuarioRepository {
  constructor() {
    this.usuarios = new Map();
  }

  agregar(usuario) {
    if (!usuario.id) {
      throw new Error('El usuario debe tener un ID');
    }
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }

  buscar(id) {
    return this.usuarios.get(id) || null;
  }

  buscarTodos() {
    return Array.from(this.usuarios.values());
  }

  guardar(usuario) {
    this.usuarios.set(usuario.id, usuario);
    return usuario;
  }
}

module.exports = UsuarioRepository;