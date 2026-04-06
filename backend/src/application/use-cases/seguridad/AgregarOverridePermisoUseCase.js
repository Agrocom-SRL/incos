import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import {
  ACCIONES_PERMISOS_VALUES,
  TIPOS_USUARIO_PERMISO_VALUES,
} from '../../../domain/constants/usuarios.constants.js';

export class AgregarOverridePermisoUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/PermissionRepository.js').PermissionRepository} deps.permissionRepository
   * @param {import('../../../infrastructure/repositories/UserPermissionRepository.js').UserPermissionRepository} deps.userPermissionRepository
   */
  constructor({ userRepository, permissionRepository, userPermissionRepository }) {
    this.userRepository = userRepository;
    this.permissionRepository = permissionRepository;
    this.userPermissionRepository = userPermissionRepository;
  }

  async execute(usuarioId, body) {
    const user = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!user) {
      throw new NotFoundError('Usuario');
    }

    const permisoId = body.permiso_id;
    const accion = body.accion;
    const tipo = body.tipo;

    if (!ACCIONES_PERMISOS_VALUES.includes(accion)) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        {
          field: 'accion',
          message: `accion debe ser una de: ${ACCIONES_PERMISOS_VALUES.join(', ')}`,
        },
      ]);
    }
    if (!TIPOS_USUARIO_PERMISO_VALUES.includes(tipo)) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        {
          field: 'tipo',
          message: `tipo debe ser GRANT o REVOKE`,
        },
      ]);
    }

    const perm = await this.permissionRepository.findById(permisoId);
    if (!perm) {
      throw new NotFoundError('Permiso');
    }

    const dup = await this.userPermissionRepository.existsActiveDuplicate(
      usuarioId,
      permisoId,
      accion,
      tipo
    );
    if (dup) {
      throw new ConflictError(
        'Ya existe un override activo con el mismo permiso, acción y tipo'
      );
    }

    const created = await this.userPermissionRepository.create({
      userId: usuarioId,
      permissionId: permisoId,
      action: accion,
      overrideType: tipo,
      reason: body.motivo ?? null,
    });

    return {
      id: created.id,
      permiso_id: permisoId,
      codigo: perm.code,
      accion,
      tipo,
      motivo: body.motivo ?? null,
    };
  }
}
