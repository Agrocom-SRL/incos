import bcrypt from 'bcryptjs';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import { validarPasswordNueva } from '../../utils/passwordPolicy.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';
import { ROL_ADMIN_SISTEMA_CODIGO, exigirActorAdminSistema } from './rol-admin-sistema.guard.js';

function personalPayloadToStaffPatch(p) {
  const o = p || {};
  const patch = {};
  if ('ci' in o) patch.ci = String(o.ci ?? '').trim();
  if ('expedition' in o || 'expedicion' in o) {
    const expedition = o.expedition ?? o.expedicion;
    const expeditionRaw = expedition != null ? String(expedition).trim() : '';
    patch.expedition = expeditionRaw !== '' ? expeditionRaw.toUpperCase() : null;
  }
  if ('firstName' in o || 'nombres' in o) patch.firstName = String(o.firstName ?? o.nombres ?? '').trim();
  if ('lastName' in o || 'apellido_paterno' in o) {
    patch.lastName = String(o.lastName ?? o.apellido_paterno ?? '').trim();
  }
  if ('motherLastName' in o || 'apellido_materno' in o) {
    const value = o.motherLastName ?? o.apellido_materno;
    patch.motherLastName = value != null && String(value).trim() !== '' ? String(value).trim() : null;
  }
  if ('birthDate' in o || 'fecha_nacimiento' in o) patch.birthDate = o.birthDate ?? o.fecha_nacimiento ?? null;
  if ('gender' in o || 'genero' in o) patch.gender = o.gender ?? o.genero ?? null;
  if ('civilStatusId' in o || 'estado_civil_id' in o) {
    patch.civilStatusId = o.civilStatusId ?? o.estado_civil_id ?? null;
  }
  if ('personalEmail' in o || 'email_personal' in o) {
    const personalEmail = o.personalEmail ?? o.email_personal;
    patch.personalEmail = personalEmail ? String(personalEmail).trim().toLowerCase() : null;
  }
  if ('phone' in o || 'telefono' in o) patch.phone = o.phone ?? o.telefono ?? null;
  if ('mobilePhone' in o || 'celular' in o) patch.mobilePhone = o.mobilePhone ?? o.celular ?? null;
  if ('address' in o || 'direccion' in o) patch.address = o.address ?? o.direccion ?? null;
  if ('municipalityId' in o || 'municipio_id' in o) {
    patch.municipalityId = o.municipalityId ?? o.municipio_id ?? null;
  }
  return patch;
}

export class ActualizarUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.roleRepository
   * @param {import('../../../infrastructure/repositories/StaffRepository.js').StaffRepository} deps.staffRepository
   * @param {import('../../../domain/interfaces/repositories/IAuthRepository.js').IAuthRepository} deps.authRepository
   */
  constructor({ userRepository, roleRepository, staffRepository, authRepository }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.staffRepository = staffRepository;
    this.authRepository = authRepository;
  }

  /**
   * @param {number} usuarioId
   * @param {Object} body
   * @param {number|null} actorId usuario autenticado que ejecuta el cambio
   */
  async execute(usuarioId, body, actorId = null) {
    const current = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    if (!current) {
      throw new NotFoundError('Usuario');
    }

    const patch = {};
    if (body.username !== undefined) {
      patch.username = String(body.username).trim();
      if (patch.username === '') {
        throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
          { field: 'username', message: 'username no puede estar vacío' },
        ]);
      }
      if (patch.username !== current.username) {
        if (await this.userRepository.existsUsername(patch.username, usuarioId)) {
          throw new ConflictError('El nombre de usuario ya está en uso');
        }
      }
    }
    if (body.rol_id !== undefined) {
      const role = await this.roleRepository.findById(body.rol_id);
      if (!role) {
        throw new NotFoundError('Rol');
      }
      if (Number(body.rol_id) !== Number(current.rol_id)) {
        if (actorId != null && Number(actorId) === Number(usuarioId)) {
          throw new ForbiddenError('No puede cambiar su propio rol');
        }
        if (
          role.code === ROL_ADMIN_SISTEMA_CODIGO ||
          current.rol_codigo === ROL_ADMIN_SISTEMA_CODIGO
        ) {
          await exigirActorAdminSistema(this.userRepository, actorId);
        }
      }
      patch.roleId = body.rol_id;
    }
    if (body.foto_url !== undefined) {
      patch.photoUrl = body.foto_url;
    }
    if (body.password !== undefined && body.password !== null && body.password !== '') {
      const password = String(body.password);
      validarPasswordNueva(password, 'password');
      patch.passwordHash = await bcrypt.hash(password, 12);
    }

    const canEditPersonal =
      current.referencia_id != null &&
      (current.tipo_referencia == null ||
        current.tipo_referencia === 'RECTOR' ||
        current.tipo_referencia === 'DIRECTOR' ||
        current.tipo_referencia === 'SECRETARIA');
    const personalPatch =
      body.personal && typeof body.personal === 'object'
        ? personalPayloadToStaffPatch(body.personal)
        : null;
    if (personalPatch && Object.keys(personalPatch).length > 0 && !canEditPersonal) {
      throw new UnprocessableEntityError(
        'Solo los usuarios vinculados a personal institucional pueden editar ficha personal desde este formulario.',
        [{ field: 'personal', message: 'No editable para este tipo de usuario' }]
      );
    }

    if (Object.keys(patch).length === 0 && (!personalPatch || Object.keys(personalPatch).length === 0)) {
      return mapUsuarioAdminRow(current);
    }

    await this.userRepository.update(usuarioId, patch);
    if (patch.passwordHash) {
      await this.authRepository.invalidarSesionesUsuario(usuarioId);
    }
    if (personalPatch && Object.keys(personalPatch).length > 0) {
      await this.staffRepository.update(Number(current.referencia_id), personalPatch);
    }
    const row = await this.userRepository.findByIdWithRoleForAdmin(usuarioId);
    return mapUsuarioAdminRow(row);
  }
}
