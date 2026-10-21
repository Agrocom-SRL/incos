import {
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import {
  ACCIONES_PERMISOS_VALUES,
  PERMISO_CATALOGO_REFERENCIA_ID,
} from '../../../domain/constants/usuarios.constants.js';

export class ActualizarPermisosRolUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.roleRepository
   * @param {import('../../../infrastructure/repositories/PermissionRepository.js').PermissionRepository} deps.permissionRepository
   * @param {import('../../../infrastructure/repositories/RolePermissionRepository.js').RolePermissionRepository} deps.rolePermissionRepository
   * @param {import('./ObtenerPermisosRolUseCase.js').ObtenerPermisosRolUseCase} deps.obtenerPermisosRolUseCase
   */
  constructor({
    roleRepository,
    permissionRepository,
    rolePermissionRepository,
    obtenerPermisosRolUseCase,
  }) {
    this.roleRepository = roleRepository;
    this.permissionRepository = permissionRepository;
    this.rolePermissionRepository = rolePermissionRepository;
    this.obtenerPermisosRolUseCase = obtenerPermisosRolUseCase;
  }

  /**
   * @param {number} rolId
   * @param {{ asignaciones: { permiso_id: number, accion: string }[] }} body
   */
  async execute(rolId, body) {
    const rol = await this.roleRepository.findById(rolId);
    if (!rol) {
      throw new NotFoundError('Rol');
    }

    if (Number(rolId) === 1) {
      throw new ForbiddenError('Los permisos del ADMIN_SISTEMA no pueden modificarse');
    }

    const asignacionesRaw = Array.isArray(body.asignaciones) ? body.asignaciones : null;
    if (asignacionesRaw === null) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'asignaciones', message: 'asignaciones debe ser un array' },
      ]);
    }

    const asignaciones = asignacionesRaw.filter(
      (row) => Number(row?.permiso_id) !== PERMISO_CATALOGO_REFERENCIA_ID
    );

    const seen = new Set();
    for (let i = 0; i < asignaciones.length; i++) {
      const row = asignaciones[i];
      if (!row || row.permiso_id == null || !row.accion) {
        throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
          {
            field: `asignaciones[${i}]`,
            message: 'cada elemento requiere permiso_id y accion',
          },
        ]);
      }
      if (!ACCIONES_PERMISOS_VALUES.includes(row.accion)) {
        throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
          {
            field: `asignaciones[${i}].accion`,
            message: `accion debe ser una de: ${ACCIONES_PERMISOS_VALUES.join(', ')}`,
          },
        ]);
      }
      const dedupeKey = `${row.permiso_id}:${row.accion}`;
      if (seen.has(dedupeKey)) {
        throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
          {
            field: 'asignaciones',
            message: `combinación duplicada permiso_id ${row.permiso_id} con accion ${row.accion}`,
          },
        ]);
      }
      seen.add(dedupeKey);
      const perm = await this.permissionRepository.findById(row.permiso_id);
      if (!perm) {
        throw new NotFoundError(`Permiso ${row.permiso_id}`);
      }
      const accionValida = await this.permissionRepository.existsPermisoAccionValida(
        row.permiso_id,
        row.accion
      );
      if (!accionValida) {
        throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
          {
            field: `asignaciones[${i}]`,
            message: `accion '${row.accion}' no es válida para el permiso ${row.permiso_id}`,
          },
        ]);
      }
    }

    await this.rolePermissionRepository.replaceAllAssignmentsForRol(rolId, asignaciones);

    return this.obtenerPermisosRolUseCase.execute(rolId);
  }
}
