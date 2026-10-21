/**
 * Contrato de repositorio de autenticación y permisos efectivos.
 *
 * No extiende IRepository: no es CRUD de una sola entidad; combina tablas del
 * esquema database/01-schemas/04-sistema-seguridad.sql (usuarios, roles, sesiones)
 * y la vista database/03-views/25-vista-usuario-permisos-efectivos.sql.
 *
 * Implementación: infrastructure/repositories/AuthRepository.js (sequelize.query, sin includes).
 */
export class IAuthRepository {
  async findUsuarioParaLogin(usernameOrEmail) {
    throw new Error('Method findUsuarioParaLogin must be implemented');
  }

  async findSesionActiva(token) {
    throw new Error('Method findSesionActiva must be implemented');
  }

  async findPermisosEfectivos(usuarioId) {
    throw new Error('Method findPermisosEfectivos must be implemented');
  }

  async tienePermiso(usuarioId, codigoPermiso, accion) {
    throw new Error('Method tienePermiso must be implemented');
  }

  async createSesion(payload) {
    throw new Error('Method createSesion must be implemented');
  }

  async invalidarSesionesUsuario(usuarioId, opciones) {
    throw new Error('Method invalidarSesionesUsuario must be implemented');
  }

  async invalidarSesion(token) {
    throw new Error('Method invalidarSesion must be implemented');
  }
}
