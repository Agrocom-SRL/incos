/**
 * Escalada vertical de privilegios y mass assignment sobre la administración de usuarios.
 * Bug corregido: un rol con EDITAR/ELIMINAR en usuarios (RECTOR, DIR_*) podía cambiar la clave,
 * suspender o eliminar a un ADMIN_SISTEMA (toma de cuenta). Solo un ADMIN_SISTEMA puede hacerlo.
 */
import { describe, it, expect, jest } from '@jest/globals';
import { CambiarPasswordUsuarioUseCase } from '../../../src/application/use-cases/seguridad/CambiarPasswordUsuarioUseCase.js';
import { CambiarEstadoUsuarioUseCase } from '../../../src/application/use-cases/seguridad/CambiarEstadoUsuarioUseCase.js';
import { EliminarUsuarioUseCase } from '../../../src/application/use-cases/seguridad/EliminarUsuarioUseCase.js';
import { ActualizarUsuarioUseCase } from '../../../src/application/use-cases/seguridad/ActualizarUsuarioUseCase.js';
import { SeguridadUsuariosController } from '../../../src/presentation/controllers/seguridad/usuarios.controller.js';
import { ForbiddenError } from '../../../src/domain/errors/AppError.js';

const ADMIN = { id: 1, username: 'root', rol_codigo: 'ADMIN_SISTEMA' };
const RECTOR = { id: 2, username: 'rector', rol_codigo: 'RECTOR' };
const DOCENTE_OBJETIVO = { id: 9, username: 'doc', rol_codigo: 'DOCENTE' };

/** userRepository falso: busca por id en un catálogo en memoria. */
function repoCon(...usuarios) {
  return {
    findByIdWithRoleForAdmin: jest.fn(async (id) => usuarios.find((u) => u.id === Number(id)) ?? null),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(true),
    existsUsername: jest.fn().mockResolvedValue(false),
  };
}
const authRepository = () => ({ invalidarSesionesUsuario: jest.fn().mockResolvedValue(undefined) });

describe('Un no-admin no puede operar sobre un ADMIN_SISTEMA', () => {
  it('cambiar clave: ForbiddenError y no escribe', async () => {
    const userRepository = repoCon(ADMIN, RECTOR);
    const uc = new CambiarPasswordUsuarioUseCase({ userRepository, authRepository: authRepository() });
    await expect(uc.execute(1, 'ClaveNueva-2026', 2)).rejects.toBeInstanceOf(ForbiddenError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('cambiar clave sin actor identificado: falla cerrado', async () => {
    const userRepository = repoCon(ADMIN);
    const uc = new CambiarPasswordUsuarioUseCase({ userRepository, authRepository: authRepository() });
    await expect(uc.execute(1, 'ClaveNueva-2026')).rejects.toBeInstanceOf(ForbiddenError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('suspender/bloquear: ForbiddenError y no escribe ni cierra sesiones', async () => {
    const userRepository = repoCon(ADMIN, RECTOR);
    const auth = authRepository();
    const uc = new CambiarEstadoUsuarioUseCase({ userRepository, authRepository: auth });
    await expect(uc.execute(1, { estado: 'BLOQUEADO' }, 2)).rejects.toBeInstanceOf(ForbiddenError);
    expect(userRepository.update).not.toHaveBeenCalled();
    expect(auth.invalidarSesionesUsuario).not.toHaveBeenCalled();
  });

  it('eliminar: ForbiddenError y no hace la baja', async () => {
    const userRepository = repoCon(ADMIN, RECTOR);
    const uc = new EliminarUsuarioUseCase({ userRepository });
    await expect(uc.execute(1, 2)).rejects.toBeInstanceOf(ForbiddenError);
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('un ADMIN_SISTEMA sí puede operar sobre otro ADMIN_SISTEMA', async () => {
    const otroAdmin = { id: 3, username: 'root2', rol_codigo: 'ADMIN_SISTEMA' };
    const userRepository = repoCon(ADMIN, otroAdmin);
    await expect(new EliminarUsuarioUseCase({ userRepository }).execute(3, 1)).resolves.toEqual({ id: 3 });
    await expect(
      new CambiarEstadoUsuarioUseCase({ userRepository, authRepository: authRepository() }).execute(
        3,
        { estado: 'SUSPENDIDO' },
        1
      )
    ).resolves.toBeDefined();
  });

  it('operar sobre usuarios que no son admin no exige ser admin', async () => {
    const userRepository = repoCon(RECTOR, DOCENTE_OBJETIVO);
    await expect(new EliminarUsuarioUseCase({ userRepository }).execute(9, 2)).resolves.toEqual({ id: 9 });
  });
});

describe('Mass assignment en ActualizarUsuarioUseCase', () => {
  it('ignora campos no previstos (id, is_system, estado, rol_codigo, deleted_at, password_hash)', async () => {
    const current = { id: 5, username: 'ana', rol_id: 3, rol_codigo: 'DOCENTE', tipo_referencia: 'DOCENTE' };
    const userRepository = repoCon(current);
    const uc = new ActualizarUsuarioUseCase({
      userRepository,
      roleRepository: { findById: jest.fn() },
      staffRepository: { update: jest.fn() },
      authRepository: authRepository(),
    });

    await uc.execute(
      5,
      {
        username: 'ana2',
        id: 1,
        is_system: true,
        estado: null,
        rol_codigo: 'ADMIN_SISTEMA',
        deleted_at: null,
        password_hash: '$2a$12$x',
        passwordHash: '$2a$12$x',
        roleId: 1,
        state: null,
      },
      99
    );

    expect(userRepository.update).toHaveBeenCalledTimes(1);
    expect(userRepository.update).toHaveBeenCalledWith(5, { username: 'ana2' });
  });

  it('no permite cambiar el propio rol (auto-escalada a ADMIN)', async () => {
    const current = { id: 5, username: 'ana', rol_id: 3, rol_codigo: 'DOCENTE' };
    const userRepository = repoCon(current);
    const uc = new ActualizarUsuarioUseCase({
      userRepository,
      roleRepository: { findById: jest.fn().mockResolvedValue({ id: 1, code: 'ADMIN_SISTEMA' }) },
      staffRepository: { update: jest.fn() },
      authRepository: authRepository(),
    });
    await expect(uc.execute(5, { rol_id: 1 }, 5)).rejects.toBeInstanceOf(ForbiddenError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('un no-admin no puede asignar el rol ADMIN_SISTEMA a otro usuario', async () => {
    const userRepository = repoCon({ id: 5, username: 'ana', rol_id: 3, rol_codigo: 'DOCENTE' }, RECTOR);
    const uc = new ActualizarUsuarioUseCase({
      userRepository,
      roleRepository: { findById: jest.fn().mockResolvedValue({ id: 1, code: 'ADMIN_SISTEMA' }) },
      staffRepository: { update: jest.fn() },
      authRepository: authRepository(),
    });
    await expect(uc.execute(5, { rol_id: 1 }, 2)).rejects.toBeInstanceOf(ForbiddenError);
    expect(userRepository.update).not.toHaveBeenCalled();
  });
});

describe('SeguridadUsuariosController propaga al actor autenticado (req.usuario)', () => {
  const res = {};
  const responseFormatter = { deleted: jest.fn(), updated: jest.fn() };

  it('delete pasa req.usuario.id (antes leía req.user, siempre null: el chequeo de auto-eliminación no corría)', async () => {
    const eliminarUsuarioUseCase = { execute: jest.fn().mockResolvedValue({ id: 4 }) };
    const ctrl = new SeguridadUsuariosController({ eliminarUsuarioUseCase, responseFormatter });
    await ctrl.delete({ params: { id: '4' }, usuario: { id: 77 } }, res, jest.fn());
    expect(eliminarUsuarioUseCase.execute).toHaveBeenCalledWith(4, 77);
  });

  it('patchPassword pasa el actor al caso de uso', async () => {
    const cambiarPasswordUsuarioUseCase = { execute: jest.fn().mockResolvedValue({ id: 4 }) };
    const ctrl = new SeguridadUsuariosController({ cambiarPasswordUsuarioUseCase, responseFormatter });
    await ctrl.patchPassword(
      { params: { id: '4' }, body: { password_nuevo: 'ClaveNueva-2026' }, usuario: { id: 77 } },
      res,
      jest.fn()
    );
    expect(cambiarPasswordUsuarioUseCase.execute).toHaveBeenCalledWith(4, 'ClaveNueva-2026', 77);
  });
});
