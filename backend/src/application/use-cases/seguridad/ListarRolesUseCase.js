export class ListarRolesUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.roleRepository
   */
  constructor({ roleRepository }) {
    this.roleRepository = roleRepository;
  }

  async execute() {
    const roles = await this.roleRepository.findAllOrderedByNivelDesc();
    return {
      roles: roles.map((r) => ({
        id: r.id,
        codigo: r.code,
        nombre: r.name,
        nivel_acceso: r.accessLevel,
      })),
    };
  }
}
