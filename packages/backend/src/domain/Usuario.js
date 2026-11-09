class Usuario {
  constructor({ id, nombre, apellido, eventosFavoritos = [] }) {
    this.id = id;
    this.nombre = nombre;
    this.apellido = apellido;
    this.eventosFavoritos = eventosFavoritos;
  }
}

module.exports = {
  Usuario
};
