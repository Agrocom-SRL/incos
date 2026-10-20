import { describe, it, expect, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { ActualizarUsuarioUseCase } from '../../../src/application/use-cases/seguridad/ActualizarUsuarioUseCase.js';
import { ConflictError, NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

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
