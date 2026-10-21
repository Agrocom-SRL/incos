import bcrypt from 'bcryptjs';
import {
  ConflictError,
  NotFoundError,
  UnprocessableEntityError,
} from '../../../domain/errors/AppError.js';
import { mapUsuarioAdminRow } from './usuario-admin.mapper.js';
import { ROL_ADMIN_SISTEMA_CODIGO, exigirActorAdminSistema } from './rol-admin-sistema.guard.js';
import {
  CATEGORIAS_CREACION_USUARIO,
  TIPOS_REFERENCIA,
  TIPOS_REFERENCIA_VALUES,
} from '../../../domain/constants/usuarios.constants.js';
import {
  TIPOS_DIRECTOR,
  TIPOS_SECRETARIA,
} from '../../../domain/constants/docentes.constants.js';

function personalPayloadToStaff(p) {
  const o = p || {};
  const ci = o.ci;
  const expedition = o.expedition ?? o.expedicion;
  const firstName = o.firstName ?? o.nombres;
  const lastName = o.lastName ?? o.apellido_paterno;
  const motherLastName = o.motherLastName ?? o.apellido_materno;
  const birthDate = o.birthDate ?? o.fecha_nacimiento;
  const gender = o.gender ?? o.genero;
  const civilStatusId = o.civilStatusId ?? o.estado_civil_id;
  const personalEmail = o.personalEmail ?? o.email_personal;
  const phone = o.phone ?? o.telefono;
  const mobilePhone = o.mobilePhone ?? o.celular;
  const address = o.address ?? o.direccion;
  const municipalityId = o.municipalityId ?? o.municipio_id;

  const expeditionRaw = expedition != null ? String(expedition).trim() : '';
  const expeditionNorm = expeditionRaw !== '' ? expeditionRaw.toUpperCase() : null;

  return {
    ci: String(ci ?? '').trim(),
    expedition: expeditionNorm,
    firstName: String(firstName ?? '').trim(),
    lastName: String(lastName ?? '').trim(),
    motherLastName: motherLastName != null && String(motherLastName).trim() !== ''
      ? String(motherLastName).trim()
      : null,
    birthDate: birthDate || null,
    gender: gender || null,
    civilStatusId: civilStatusId ?? null,
    personalEmail: personalEmail ? String(personalEmail).trim().toLowerCase() : null,
    phone: phone || null,
    mobilePhone: mobilePhone || null,
    address: address || null,
    municipalityId: municipalityId ?? null,
  };
}

function tipoReferenciaUsuarioDesdeRol(codigoRol) {
  switch (codigoRol) {
    case 'RECTOR':
      return TIPOS_REFERENCIA.RECTOR;
    case 'DIR_ACADEMICO':
    case 'DIR_ADMIN':
      return TIPOS_REFERENCIA.DIRECTOR;
    case 'SEC_ACADEMICA':
    case 'SEC_ADMIN':
      return TIPOS_REFERENCIA.SECRETARIA;
    case 'DOCENTE':
      return TIPOS_REFERENCIA.DOCENTE;
    case 'ESTUDIANTE':
      return TIPOS_REFERENCIA.ESTUDIANTE;
    default:
      return null;
  }
}

const ROLES_PERSONAL = new Set(['RECTOR', 'DIR_ACADEMICO', 'DIR_ADMIN', 'SEC_ACADEMICA', 'SEC_ADMIN']);

function toPlain(entity) {
  return entity?.toPlainObject ? entity.toPlainObject() : entity || {};
}

async function runWithCompensation(work) {
  const rollbackSteps = [];
  const registerRollback = (fn) => {
    if (typeof fn === 'function') rollbackSteps.push(fn);
  };

  try {
    return await work(registerRollback);
  } catch (error) {
    for (let i = rollbackSteps.length - 1; i >= 0; i -= 1) {
      try {
        await rollbackSteps[i]();
      } catch {
        // Rollback best-effort: no ocultar error original de negocio.
      }
    }
    throw error;
  }
}

export class CrearUsuarioUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} deps.userRepository
   * @param {import('../../../infrastructure/repositories/RoleRepository.js').RoleRepository} deps.roleRepository
   * @param {import('../../../infrastructure/repositories/StaffRepository.js').StaffRepository} deps.staffRepository
   * @param {import('../../../infrastructure/repositories/StudentRepository.js').StudentRepository} deps.studentRepository
   * @param {import('../../../infrastructure/repositories/TeacherRepository.js').TeacherRepository} deps.teacherRepository
   * @param {import('../../../infrastructure/repositories/RectorRepository.js').RectorRepository} deps.rectorRepository
   * @param {import('../../../infrastructure/repositories/DirectorRepository.js').DirectorRepository} deps.directorRepository
   * @param {import('../../../infrastructure/repositories/SecretaryRepository.js').SecretaryRepository} deps.secretaryRepository
   */
  constructor({
    userRepository,
    roleRepository,
    staffRepository,
    studentRepository,
    teacherRepository,
    rectorRepository,
    directorRepository,
    secretaryRepository,
  }) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.staffRepository = staffRepository;
    this.studentRepository = studentRepository;
    this.teacherRepository = teacherRepository;
    this.rectorRepository = rectorRepository;
    this.directorRepository = directorRepository;
    this.secretaryRepository = secretaryRepository;
  }

  /**
   * Crea usuario y relaciones según `categoria_creacion` (orquestación secuencial, sin transacción global).
   * Compatibilidad: si no hay categoría pero vienen `tipo_referencia` y `referencia_id`, solo persiste `usuarios` (comportamiento histórico).
   *
   * @param {Object} input
   */
  async execute(input, actorId = null) {
    const username = String(input.username || '').trim();
    if (username === '') {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'username', message: 'username es requerido' },
      ]);
    }
    const password = input.password;
    const rolId = input.rol_id;

    if (!password || String(password).length < 8) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        { field: 'password', message: 'password debe tener al menos 8 caracteres' },
      ]);
    }

    const role = await this.roleRepository.findById(rolId);
    if (!role) {
      throw new NotFoundError('Rol');
    }

    if (
      input.tipo_referencia != null &&
      input.tipo_referencia !== '' &&
      !TIPOS_REFERENCIA_VALUES.includes(input.tipo_referencia)
    ) {
      throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
        {
          field: 'tipo_referencia',
          message: `tipo_referencia debe ser uno de: ${TIPOS_REFERENCIA_VALUES.join(', ')}`,
        },
      ]);
    }

    if (role.code === ROL_ADMIN_SISTEMA_CODIGO) {
      await exigirActorAdminSistema(this.userRepository, actorId);
    }

    if (await this.userRepository.existsUsername(username)) {
      throw new ConflictError('El nombre de usuario ya está en uso');
    }

    const passwordHash = await bcrypt.hash(String(password), 12);
    const userPayloadBase = {
      username,
      passwordHash,
      roleId: rolId,
    };

    const legacyRef =
      input.tipo_referencia != null &&
      input.tipo_referencia !== '' &&
      input.referencia_id != null &&
      Number.isFinite(Number(input.referencia_id));

    let categoria = input.categoria_creacion;
    if (!categoria) {
      if (role.code === 'ADMIN_SISTEMA') {
        categoria = CATEGORIAS_CREACION_USUARIO.ACCESO_SISTEMA;
      } else if (legacyRef) {
        const created = await this.userRepository.create({
          ...userPayloadBase,
          referenceId: Number(input.referencia_id),
          referenceType: input.tipo_referencia,
        });
        const row = await this.userRepository.findByIdWithRoleForAdmin(created.id);
        return mapUsuarioAdminRow(row);
      } else {
        throw new UnprocessableEntityError('Los datos proporcionados son inválidos', [
          {
            field: 'categoria_creacion',
            message:
              'Indique categoria_creacion (ACCESO_SISTEMA, PERSONAL_INSTITUCIONAL, ASIGNAR_ESTUDIANTE, ASIGNAR_DOCENTE) o tipo_referencia + referencia_id para el modo anterior.',
          },
        ]);
      }
    }

    if (categoria === CATEGORIAS_CREACION_USUARIO.ACCESO_SISTEMA) {
      if (role.code !== 'ADMIN_SISTEMA') {
        throw new UnprocessableEntityError('Solo el rol Administrador del sistema aplica a cuenta de acceso al sistema.', [
          { field: 'rol_id', message: 'Rol no válido para cuenta solo sistema' },
        ]);
      }
      const personalIn = input.personal;
      if (!personalIn || typeof personalIn !== 'object') {
        throw new UnprocessableEntityError('Debe enviar el objeto personal con los datos de ficha del administrador.', [
          { field: 'personal', message: 'personal requerido' },
        ]);
      }
      const staffData = personalPayloadToStaff(personalIn);
      if (!staffData.ci || !staffData.firstName || !staffData.lastName) {
        throw new UnprocessableEntityError('Datos de personal incompletos (CI, nombres y apellido paterno).', [
          { field: 'personal', message: 'Campos requeridos faltantes' },
        ]);
      }

      return runWithCompensation(async (registerRollback) => {
        const personalEntity = await this.staffRepository.create({
          ...staffData,
          userId: null,
        });
        const personalId = personalEntity.id;
        registerRollback(() => this.staffRepository.delete(personalId));

        const created = await this.userRepository.create({
          ...userPayloadBase,
          referenceId: personalId,
          referenceType: null,
        });
        registerRollback(() => this.userRepository.delete(created.id));

        await this.staffRepository.update(personalId, { userId: created.id });
        registerRollback(() => this.staffRepository.update(personalId, { userId: null }));

        const row = await this.userRepository.findByIdWithRoleForAdmin(created.id);
        return mapUsuarioAdminRow(row);
      });
    }

    if (categoria === CATEGORIAS_CREACION_USUARIO.ASIGNAR_ESTUDIANTE) {
      if (role.code !== 'ESTUDIANTE') {
        throw new UnprocessableEntityError('El rol debe ser Estudiante para asignar acceso a un estudiante.', [
          { field: 'rol_id', message: 'Rol incorrecto' },
        ]);
      }
      const estudianteId = Number(input.estudiante_id);
      if (!Number.isFinite(estudianteId) || estudianteId < 1) {
        throw new UnprocessableEntityError('Debe indicar estudiante_id válido', [
          { field: 'estudiante_id', message: 'estudiante_id requerido' },
        ]);
      }

      const estudiante = await this.studentRepository.findById(estudianteId);
      if (!estudiante) {
        throw new NotFoundError('Estudiante');
      }
      const ep = toPlain(estudiante);
      if (ep.userId != null) {
        throw new UnprocessableEntityError('El estudiante ya tiene una cuenta de acceso asignada.', [
          { field: 'estudiante_id', message: 'No asignable' },
        ]);
      }

      return runWithCompensation(async (registerRollback) => {
        const created = await this.userRepository.create({
          ...userPayloadBase,
          referenceId: estudianteId,
          referenceType: TIPOS_REFERENCIA.ESTUDIANTE,
        });
        registerRollback(() => this.userRepository.delete(created.id));

        await this.studentRepository.update(estudianteId, { userId: created.id });
        registerRollback(() => this.studentRepository.update(estudianteId, { userId: null }));

        const row = await this.userRepository.findByIdWithRoleForAdmin(created.id);
        return mapUsuarioAdminRow(row);
      });
    }

    if (categoria === CATEGORIAS_CREACION_USUARIO.ASIGNAR_DOCENTE) {
      if (role.code !== 'DOCENTE') {
        throw new UnprocessableEntityError('El rol debe ser Docente para asignar acceso a un docente.', [
          { field: 'rol_id', message: 'Rol incorrecto' },
        ]);
      }
      const docenteId = Number(input.docente_id);
      if (!Number.isFinite(docenteId) || docenteId < 1) {
        throw new UnprocessableEntityError('Debe indicar docente_id válido', [
          { field: 'docente_id', message: 'docente_id requerido' },
        ]);
      }

      const docente = await this.teacherRepository.findById(docenteId);
      if (!docente) {
        throw new NotFoundError('Docente');
      }
      const dp = toPlain(docente);
      if (dp.userId != null) {
        throw new UnprocessableEntityError('El docente ya tiene una cuenta de acceso asignada.', [
          { field: 'docente_id', message: 'No asignable' },
        ]);
      }

      return runWithCompensation(async (registerRollback) => {
        const created = await this.userRepository.create({
          ...userPayloadBase,
          referenceId: docenteId,
          referenceType: TIPOS_REFERENCIA.DOCENTE,
        });
        registerRollback(() => this.userRepository.delete(created.id));

        await this.teacherRepository.update(docenteId, { userId: created.id });
        registerRollback(() => this.teacherRepository.update(docenteId, { userId: null }));

        const row = await this.userRepository.findByIdWithRoleForAdmin(created.id);
        return mapUsuarioAdminRow(row);
      });
    }

    if (categoria === CATEGORIAS_CREACION_USUARIO.PERSONAL_INSTITUCIONAL) {
      if (!ROLES_PERSONAL.has(role.code)) {
        throw new UnprocessableEntityError(
          'El rol seleccionado no corresponde a personal institucional (rector, director o secretaría).',
          [{ field: 'rol_id', message: 'Rol incorrecto' }]
        );
      }
      const personalIn = input.personal;
      if (!personalIn || typeof personalIn !== 'object') {
        throw new UnprocessableEntityError('Debe enviar el objeto personal con los datos de la ficha.', [
          { field: 'personal', message: 'personal requerido' },
        ]);
      }

      const staffData = personalPayloadToStaff(personalIn);
      if (!staffData.ci || !staffData.firstName || !staffData.lastName) {
        throw new UnprocessableEntityError('Datos de personal incompletos (CI, nombres y apellido paterno).', [
          { field: 'personal', message: 'Campos requeridos faltantes' },
        ]);
      }

      const tipoRef = tipoReferenciaUsuarioDesdeRol(role.code);
      if (!tipoRef) {
        throw new UnprocessableEntityError('No se pudo determinar el tipo de referencia del rol.', [
          { field: 'rol_id', message: 'Rol no soportado' },
        ]);
      }

      return runWithCompensation(async (registerRollback) => {
        const personalEntity = await this.staffRepository.create({
          ...staffData,
          userId: null,
        });
        const personalId = personalEntity.id;
        registerRollback(() => this.staffRepository.delete(personalId));

        if (role.code === 'RECTOR') {
          const rector = await this.rectorRepository.create({ staffId: personalId });
          registerRollback(() => this.rectorRepository.delete(rector.id));
        } else if (role.code === 'DIR_ACADEMICO') {
          const director = await this.directorRepository.create({
            staffId: personalId,
            type: TIPOS_DIRECTOR.ACADEMICO,
          });
          registerRollback(() => this.directorRepository.delete(director.id));
        } else if (role.code === 'DIR_ADMIN') {
          const director = await this.directorRepository.create({
            staffId: personalId,
            type: TIPOS_DIRECTOR.ADMINISTRATIVO,
          });
          registerRollback(() => this.directorRepository.delete(director.id));
        } else if (role.code === 'SEC_ACADEMICA') {
          const secretary = await this.secretaryRepository.create({
            staffId: personalId,
            type: TIPOS_SECRETARIA.ACADEMICA,
          });
          registerRollback(() => this.secretaryRepository.delete(secretary.id));
        } else if (role.code === 'SEC_ADMIN') {
          const secretary = await this.secretaryRepository.create({
            staffId: personalId,
            type: TIPOS_SECRETARIA.ADMINISTRATIVA,
          });
          registerRollback(() => this.secretaryRepository.delete(secretary.id));
        }

        const created = await this.userRepository.create({
          ...userPayloadBase,
          referenceId: personalId,
          referenceType: tipoRef,
        });
        registerRollback(() => this.userRepository.delete(created.id));

        await this.staffRepository.update(personalId, { userId: created.id });
        registerRollback(() => this.staffRepository.update(personalId, { userId: null }));

        const row = await this.userRepository.findByIdWithRoleForAdmin(created.id);
        return mapUsuarioAdminRow(row);
      });
    }

    throw new UnprocessableEntityError('categoria_creacion no reconocida', [
      { field: 'categoria_creacion', message: 'Valor inválido' },
    ]);
  }
}
