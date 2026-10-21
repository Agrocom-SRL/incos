import { describe, it, expect, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { ActualizarUsuarioUseCase } from '../../../src/application/use-cases/seguridad/ActualizarUsuarioUseCase.js';
import { ConflictError, ForbiddenError, NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('ActualizarUsuarioUseCase', () => {
  const crear = (actual = { id: 5, username: 'ana', tipo_referencia: 'RECTOR', referencia_id: 8 }) => {
    const deps = {
      userRepository: {
        findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(actual),
        existsUsername: jest.fn().mockResolvedValue(false),
        update: jest.fn().mockResolvedValue(undefined),
      },
      roleRepository: { findById: jest.fn().mockResolvedValue({ id: 2 }) },
      staffRepository: { update: jest.fn().mockResolvedValue(undefined) },
      authRepository: { invalidarSesionesUsuario: jest.fn().mockResolvedValue(undefined) },
    };
    return { deps, useCase: new ActualizarUsuarioUseCase(deps) };
  };

  it('usuario inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(5, { username: 'x' })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('body vacío: no escribe y devuelve el usuario actual', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(5, {});
    expect(deps.userRepository.update).not.toHaveBeenCalled();
    expect(res.id).toBe(5);
  });

  it('actualiza username (trim), rol y foto', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { username: '  nuevo  ', rol_id: 2, foto_url: '/f.png' });
    expect(deps.userRepository.existsUsername).toHaveBeenCalledWith('nuevo', 5);
    expect(deps.roleRepository.findById).toHaveBeenCalledWith(2);
    expect(deps.userRepository.update).toHaveBeenCalledWith(5, { username: 'nuevo', roleId: 2, photoUrl: '/f.png' });
  });

  it('mismo username: no consulta duplicado', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { username: 'ana ' });
    expect(deps.userRepository.existsUsername).not.toHaveBeenCalled();
  });

  it('username en uso: ConflictError', async () => {
    const { deps, useCase } = crear();
    deps.userRepository.existsUsername.mockResolvedValue(true);
    await expect(useCase.execute(5, { username: 'otro' })).rejects.toBeInstanceOf(ConflictError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('rol inexistente: NotFoundError', async () => {
    const { deps, useCase } = crear();
    deps.roleRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(5, { rol_id: 99 })).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('contraseña válida: se guarda hasheada y no se devuelve', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(5, { password: 'clave-segura-1' });
    const patch = deps.userRepository.update.mock.calls[0][1];
    expect(patch.passwordHash).not.toContain('clave-segura-1');
    expect(await bcrypt.compare('clave-segura-1', patch.passwordHash)).toBe(true);
    expect(JSON.stringify(res)).not.toMatch(/password|clave-segura-1/);
  });

  it.each([[''], [null]])('password %p se ignora (no cambia la clave)', async (password) => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { password });
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('cambiar la clave cierra las sesiones del usuario', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { password: 'clave-segura-1' });
    expect(deps.authRepository.invalidarSesionesUsuario).toHaveBeenCalledWith(5);
  });

  it('sin cambio de clave no cierra sesiones', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, { foto_url: '/f.png' });
    expect(deps.authRepository.invalidarSesionesUsuario).not.toHaveBeenCalled();
  });

  it.each([[''], ['   ']])('username %p vacío: 422 sin escribir', async (username) => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { username })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  describe('cambio de rol', () => {
    const admin = { id: 1, rol_codigo: 'ADMIN_SISTEMA' };
    const usuario = { id: 5, username: 'ana', rol_id: 3, rol_codigo: 'SEC_ADMIN' };

    it('nadie cambia su propio rol: 403', async () => {
      const { deps, useCase } = crear(usuario);
      await expect(useCase.execute(5, { rol_id: 2 }, 5)).rejects.toBeInstanceOf(ForbiddenError);
      expect(deps.userRepository.update).not.toHaveBeenCalled();
    });

    it('reenviar el mismo rol propio no es un cambio', async () => {
      const { deps, useCase } = crear(usuario);
      await useCase.execute(5, { rol_id: 3 }, 5);
      expect(deps.userRepository.update).toHaveBeenCalledWith(5, { roleId: 3 });
    });

    it('asignar ADMIN_SISTEMA sin ser ADMIN_SISTEMA: 403', async () => {
      const { deps, useCase } = crear(usuario);
      deps.roleRepository.findById.mockResolvedValue({ id: 1, code: 'ADMIN_SISTEMA' });
      deps.userRepository.findByIdWithRoleForAdmin.mockImplementation(async (id) => (id === 5 ? usuario : { id: 7, rol_codigo: 'DIR_ADMIN' }));
      await expect(useCase.execute(5, { rol_id: 1 }, 7)).rejects.toBeInstanceOf(ForbiddenError);
      expect(deps.userRepository.update).not.toHaveBeenCalled();
    });

    it('sin actor identificado: 403 (falla cerrado)', async () => {
      const { deps, useCase } = crear(usuario);
      deps.roleRepository.findById.mockResolvedValue({ id: 1, code: 'ADMIN_SISTEMA' });
      await expect(useCase.execute(5, { rol_id: 1 })).rejects.toBeInstanceOf(ForbiddenError);
    });

    it('un ADMIN_SISTEMA puede asignar ADMIN_SISTEMA', async () => {
      const { deps, useCase } = crear(usuario);
      deps.roleRepository.findById.mockResolvedValue({ id: 1, code: 'ADMIN_SISTEMA' });
      deps.userRepository.findByIdWithRoleForAdmin.mockImplementation(async (id) => (id === 5 ? usuario : admin));
      await useCase.execute(5, { rol_id: 1 }, 1);
      expect(deps.userRepository.update).toHaveBeenCalledWith(5, { roleId: 1 });
    });

    it('degradar a un ADMIN_SISTEMA exige ser ADMIN_SISTEMA: 403', async () => {
      const { deps, useCase } = crear({ id: 5, rol_id: 1, rol_codigo: 'ADMIN_SISTEMA' });
      deps.userRepository.findByIdWithRoleForAdmin.mockImplementation(async (id) => (id === 5 ? { id: 5, rol_id: 1, rol_codigo: 'ADMIN_SISTEMA' } : { id: 7, rol_codigo: 'DIR_ADMIN' }));
      await expect(useCase.execute(5, { rol_id: 2 }, 7)).rejects.toBeInstanceOf(ForbiddenError);
      expect(deps.userRepository.update).not.toHaveBeenCalled();
    });
  });

  it('contraseña de más de 72 bytes: 422 sin actualizar', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { password: 'ñ'.repeat(40) })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('contraseña corta: 422 sin actualizar', async () => {
    const { deps, useCase } = crear();
    await expect(useCase.execute(5, { password: '1234567' })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
  });

  it('personal: mapea alias y actualiza la ficha del staff vinculado', async () => {
    const { deps, useCase } = crear();
    await useCase.execute(5, {
      personal: { ci: ' 123 ', expedicion: ' lp ', nombres: ' Ana ', email_personal: ' A@X.BO ', apellido_materno: '  ' },
    });
    expect(deps.staffRepository.update).toHaveBeenCalledWith(8, {
      ci: '123', expedition: 'LP', firstName: 'Ana', personalEmail: 'a@x.bo', motherLastName: null,
    });
    expect(deps.userRepository.update).toHaveBeenCalledWith(5, {});
  });

  it('personal en usuario DOCENTE/ESTUDIANTE: 422 sin escribir', async () => {
    const { deps, useCase } = crear({ id: 5, username: 'ana', tipo_referencia: 'DOCENTE', referencia_id: 8 });
    await expect(useCase.execute(5, { personal: { ci: '1' } })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.userRepository.update).not.toHaveBeenCalled();
    expect(deps.staffRepository.update).not.toHaveBeenCalled();
  });

  it('personal en usuario sin referencia: 422', async () => {
    const { deps, useCase } = crear({ id: 5, username: 'ana', tipo_referencia: null, referencia_id: null });
    await expect(useCase.execute(5, { personal: { ci: '1' } })).rejects.toBeInstanceOf(UnprocessableEntityError);
    expect(deps.staffRepository.update).not.toHaveBeenCalled();
  });
});
