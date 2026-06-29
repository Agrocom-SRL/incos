import { ConflictError, UnprocessableEntityError } from '../../../domain/errors/AppError.js';

/**
 * Caso de uso: crear un rol no protegido del sistema (is_system = false).
 *
 * Reglas:
 * - El código se normaliza (trim + mayúsculas) y debe ser único.
 * - tipo es opcional (null por defecto).
 */
export class CrearRolUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.rolRepository
   */
  constructor({ rolRepository }) {
    this.rolRepository = rolRepository;
  }

  /**
   * @param {Object} body
   * @param {string} body.codigo
   * @param {string} body.nombre
   * @param {string} [body.tipo]
   */
  async execute(body) {
    const codigo = body.codigo ? String(body.codigo).trim().toUpperCase() : '';
    const nombre = body.nombre ? String(body.nombre).trim() : '';
    const tipo =
      body.tipo !== undefined && body.tipo !== null && String(body.tipo).trim() !== ''
        ? String(body.tipo).trim()
        : null;

    if (!codigo) {
      throw new UnprocessableEntityError('codigo es requerido');
    }
    if (!nombre) {
      throw new UnprocessableEntityError('nombre es requerido');
    }

    const yaExiste = await this.rolRepository.existsCodigo(codigo);
    if (yaExiste) {
      throw new ConflictError(`Ya existe un rol con el código '${codigo}'`);
    }

    const rol = await this.rolRepository.crear({ codigo, nombre, tipo });

    return {
      id: rol.id,
      codigo: rol.code,
      nombre: rol.name,
      tipo: rol.tipo ?? null,
      is_system: Boolean(rol.isSystem),
    };
  }
}
