import { describe, it, expect, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { CrearUsuarioUseCase } from '../../../src/application/use-cases/seguridad/CrearUsuarioUseCase.js';
import { ConflictError, ForbiddenError, NotFoundError, UnprocessableEntityError } from '../../../src/domain/errors/AppError.js';

describe('CrearUsuarioUseCase', () => {
  const crear = ({ rol = { id: 1, code: 'ADMIN_SISTEMA' }, existe = false } = {}) => {
    const deps = {
      userRepository: {
        existsUsername: jest.fn().mockResolvedValue(existe),
        create: jest.fn().mockResolvedValue({ id: 50 }),
        delete: jest.fn().mockResolvedValue(true),
        findByIdWithRoleForAdmin: jest.fn().mockResolvedValue({ id: 50, username: 'nuevo', rol_id: 1, rol_codigo: 'ADMIN_SISTEMA' }),
      },
      roleRepository: { findById: jest.fn().mockResolvedValue(rol) },
      staffRepository: {
        create: jest.fn().mockResolvedValue({ id: 70 }),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(true),
      },
      studentRepository: { findById: jest.fn(), update: jest.fn().mockResolvedValue(undefined) },
      teacherRepository: { findById: jest.fn(), update: jest.fn().mockResolvedValue(undefined) },
      rectorRepository: { create: jest.fn().mockResolvedValue({ id: 1 }), delete: jest.fn() },
      directorRepository: { create: jest.fn().mockResolvedValue({ id: 2 }), delete: jest.fn() },
      secretaryRepository: { create: jest.fn().mockResolvedValue({ id: 3 }), delete: jest.fn() },
    };
    const useCase = new CrearUsuarioUseCase(deps);
    // Por defecto actúa un ADMIN_SISTEMA (actorId 1: el mock lo resuelve con rol_codigo ADMIN_SISTEMA).
    const ejecutar = useCase.execute.bind(useCase);
    useCase.execute = (input, actorId = 1) => ejecutar(input, actorId);
    return { deps, useCase };
  };
  const personal = { ci: '123', nombres: 'Ana', apellido_paterno: 'Perez', email_personal: 'A@X.bo' };
  const entrada = (extra = {}) => ({ username: ' nuevo ', password: 'clave-segura-1', rol_id: 1, ...extra });

  describe('seguridad del alta', () => {
    it.each([['   '], [''], [undefined]])('username %p vacío: 422 antes de tocar repos', async (username) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(entrada({ username }))).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('tipo_referencia fuera del catálogo: 422', async () => {
      const { deps, useCase } = crear({ rol: { id: 2, code: 'DOCENTE' } });
      await expect(useCase.execute(entrada({ rol_id: 2, tipo_referencia: 'HACKER', referencia_id: 3 }))).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it.each([[null], [undefined], [99]])('solo un ADMIN_SISTEMA crea otro ADMIN_SISTEMA (actor %p): 403', async (actor) => {
      const { deps, useCase } = crear();
      deps.userRepository.findByIdWithRoleForAdmin.mockResolvedValue(actor === 99 ? { id: 99, rol_codigo: 'SEC_ADMIN' } : null);
      await expect(useCase.execute(entrada(), actor)).rejects.toBeInstanceOf(ForbiddenError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('validación común', () => {
    it.each([[undefined], [null], [''], ['1234567']])('password %p inválida: 422 antes de tocar repos', async (password) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(entrada({ password }))).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.roleRepository.findById).not.toHaveBeenCalled();
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('rol inexistente: NotFoundError', async () => {
      const { deps, useCase } = crear({ rol: null });
      await expect(useCase.execute(entrada({ rol_id: NaN }))).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('username en uso: ConflictError', async () => {
      const { deps, useCase } = crear({ existe: true });
      await expect(useCase.execute(entrada())).rejects.toBeInstanceOf(ConflictError);
      expect(deps.userRepository.existsUsername).toHaveBeenCalledWith('nuevo');
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('sin categoría ni referencia para un rol no admin: 422', async () => {
      const { deps, useCase } = crear({ rol: { id: 2, code: 'DOCENTE' } });
      await expect(useCase.execute(entrada({ rol_id: 2 }))).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('categoría desconocida: 422', async () => {
      const { useCase } = crear();
      await expect(useCase.execute(entrada({ categoria_creacion: 'OTRA' }))).rejects.toBeInstanceOf(
        UnprocessableEntityError,
      );
    });

    it('la contraseña se guarda solo como hash bcrypt y no se devuelve', async () => {
      const { deps, useCase } = crear();
      const res = await useCase.execute(entrada({ categoria_creacion: 'ACCESO_SISTEMA', personal }));
      const payload = deps.userRepository.create.mock.calls[0][0];
      expect(payload).not.toHaveProperty('password');
      expect(payload.passwordHash).not.toContain('clave-segura-1');
      expect(await bcrypt.compare('clave-segura-1', payload.passwordHash)).toBe(true);
      expect(JSON.stringify(res)).not.toMatch(/password|clave-segura-1/);
    });
  });

  describe('ACCESO_SISTEMA', () => {
    it('crea ficha de personal, usuario y enlaza userId', async () => {
      const { deps, useCase } = crear();
      const res = await useCase.execute(entrada({ personal }));
      expect(deps.staffRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ci: '123', firstName: 'Ana', lastName: 'Perez', personalEmail: 'a@x.bo', userId: null }),
      );
      expect(deps.userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'nuevo', roleId: 1, referenceId: 70, referenceType: null }),
      );
      expect(deps.staffRepository.update).toHaveBeenCalledWith(70, { userId: 50 });
      expect(res.id).toBe(50);
    });

    it('rol distinto de ADMIN_SISTEMA: 422', async () => {
      const { deps, useCase } = crear({ rol: { id: 2, code: 'DOCENTE' } });
      await expect(
        useCase.execute(entrada({ rol_id: 2, categoria_creacion: 'ACCESO_SISTEMA', personal })),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it.each([
      [undefined],
      ['texto'],
      [{ nombres: 'Ana', apellido_paterno: 'P' }],
      [{ ci: '1', apellido_paterno: 'P' }],
      [{ ci: '1', nombres: 'Ana' }],
      [{ ci: '   ', nombres: 'Ana', apellido_paterno: 'P' }],
    ])('personal %j inválido: 422 sin crear nada', async (p) => {
      const { deps, useCase } = crear();
      await expect(useCase.execute(entrada({ personal: p }))).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.staffRepository.create).not.toHaveBeenCalled();
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('si falla el enlace final, compensa en orden inverso y propaga el error original', async () => {
      const { deps, useCase } = crear();
      deps.staffRepository.update.mockRejectedValueOnce(new Error('boom'));
      await expect(useCase.execute(entrada({ personal }))).rejects.toThrow('boom');
      expect(deps.userRepository.delete).toHaveBeenCalledWith(50);
      expect(deps.staffRepository.delete).toHaveBeenCalledWith(70);
    });

    it('un rollback que falla no oculta el error original', async () => {
      const { deps, useCase } = crear();
      deps.staffRepository.update.mockRejectedValueOnce(new Error('boom'));
      deps.userRepository.delete.mockRejectedValue(new Error('rollback roto'));
      await expect(useCase.execute(entrada({ personal }))).rejects.toThrow('boom');
      expect(deps.staffRepository.delete).toHaveBeenCalledWith(70);
    });
  });

  describe('ASIGNAR_ESTUDIANTE', () => {
    const rolEst = { id: 4, code: 'ESTUDIANTE' };
    const base = () => entrada({ rol_id: 4, categoria_creacion: 'ASIGNAR_ESTUDIANTE', estudiante_id: '12' });

    it('crea usuario referenciado y enlaza al estudiante', async () => {
      const { deps, useCase } = crear({ rol: rolEst });
      deps.studentRepository.findById.mockResolvedValue({ userId: null });
      await useCase.execute(base());
      expect(deps.userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ referenceId: 12, referenceType: 'ESTUDIANTE' }),
      );
      expect(deps.studentRepository.update).toHaveBeenCalledWith(12, { userId: 50 });
    });

    it('rol distinto: 422', async () => {
      const { useCase } = crear({ rol: { id: 2, code: 'DOCENTE' } });
      await expect(useCase.execute(base())).rejects.toBeInstanceOf(UnprocessableEntityError);
    });

    it.each([[undefined], ['abc'], [0], [-1], [NaN]])('estudiante_id %p inválido: 422', async (estudiante_id) => {
      const { deps, useCase } = crear({ rol: rolEst });
      await expect(useCase.execute({ ...base(), estudiante_id })).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.studentRepository.findById).not.toHaveBeenCalled();
    });

    it('estudiante inexistente: NotFoundError', async () => {
      const { deps, useCase } = crear({ rol: rolEst });
      deps.studentRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(base())).rejects.toBeInstanceOf(NotFoundError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('estudiante que ya tiene cuenta (también vía toPlainObject): 422', async () => {
      const { deps, useCase } = crear({ rol: rolEst });
      deps.studentRepository.findById.mockResolvedValue({ toPlainObject: () => ({ userId: 3 }) });
      await expect(useCase.execute(base())).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });

    it('si falla el enlace al estudiante, elimina el usuario creado', async () => {
      const { deps, useCase } = crear({ rol: rolEst });
      deps.studentRepository.findById.mockResolvedValue({ userId: null });
      deps.studentRepository.update.mockRejectedValueOnce(new Error('boom'));
      await expect(useCase.execute(base())).rejects.toThrow('boom');
      expect(deps.userRepository.delete).toHaveBeenCalledWith(50);
    });
  });

  describe('ASIGNAR_DOCENTE', () => {
    const rolDoc = { id: 3, code: 'DOCENTE' };
    const base = () => entrada({ rol_id: 3, categoria_creacion: 'ASIGNAR_DOCENTE', docente_id: 9 });

    it('crea usuario referenciado y enlaza al docente', async () => {
      const { deps, useCase } = crear({ rol: rolDoc });
      deps.teacherRepository.findById.mockResolvedValue({ userId: null });
      await useCase.execute(base());
      expect(deps.userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ referenceId: 9, referenceType: 'DOCENTE' }),
      );
      expect(deps.teacherRepository.update).toHaveBeenCalledWith(9, { userId: 50 });
    });

    it('rol distinto: 422', async () => {
      const { useCase } = crear({ rol: rolEstudiante() });
      await expect(useCase.execute(base())).rejects.toBeInstanceOf(UnprocessableEntityError);
    });

    it.each([[undefined], ['x'], [0], [NaN]])('docente_id %p inválido: 422', async (docente_id) => {
      const { useCase } = crear({ rol: rolDoc });
      await expect(useCase.execute({ ...base(), docente_id })).rejects.toBeInstanceOf(UnprocessableEntityError);
    });

    it('docente inexistente: NotFoundError', async () => {
      const { deps, useCase } = crear({ rol: rolDoc });
      deps.teacherRepository.findById.mockResolvedValue(null);
      await expect(useCase.execute(base())).rejects.toBeInstanceOf(NotFoundError);
    });

    it('docente con cuenta: 422', async () => {
      const { deps, useCase } = crear({ rol: rolDoc });
      deps.teacherRepository.findById.mockResolvedValue({ userId: 2 });
      await expect(useCase.execute(base())).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('PERSONAL_INSTITUCIONAL', () => {
    const base = (code, id = 5) => ({
      rol: { id, code },
      input: entrada({ rol_id: id, categoria_creacion: 'PERSONAL_INSTITUCIONAL', personal }),
    });

    it.each([
      ['RECTOR', 'rectorRepository', 'RECTOR', { staffId: 70 }],
      ['DIR_ACADEMICO', 'directorRepository', 'DIRECTOR', expect.objectContaining({ staffId: 70 })],
      ['DIR_ADMIN', 'directorRepository', 'DIRECTOR', expect.objectContaining({ staffId: 70 })],
      ['SEC_ACADEMICA', 'secretaryRepository', 'SECRETARIA', expect.objectContaining({ staffId: 70 })],
      ['SEC_ADMIN', 'secretaryRepository', 'SECRETARIA', expect.objectContaining({ staffId: 70 })],
    ])('rol %s crea cargo en %s y usuario con tipo %s', async (code, repo, tipoRef, cargoArgs) => {
      const { rol, input } = base(code);
      const { deps, useCase } = crear({ rol });
      await useCase.execute(input);
      expect(deps[repo].create).toHaveBeenCalledWith(cargoArgs);
      expect(deps.userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ referenceId: 70, referenceType: tipoRef }),
      );
      expect(deps.staffRepository.update).toHaveBeenCalledWith(70, { userId: 50 });
    });

    it('rol no institucional (DOCENTE): 422', async () => {
      const { input } = base('DOCENTE');
      const { deps, useCase } = crear({ rol: { id: 5, code: 'DOCENTE' } });
      await expect(useCase.execute(input)).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.staffRepository.create).not.toHaveBeenCalled();
    });

    it('sin personal o con datos incompletos: 422', async () => {
      const { rol, input } = base('RECTOR');
      const { deps, useCase } = crear({ rol });
      await expect(useCase.execute({ ...input, personal: undefined })).rejects.toBeInstanceOf(UnprocessableEntityError);
      await expect(useCase.execute({ ...input, personal: { ci: '1' } })).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.staffRepository.create).not.toHaveBeenCalled();
    });

    it('si falla crear usuario, revierte cargo y personal', async () => {
      const { rol, input } = base('RECTOR');
      const { deps, useCase } = crear({ rol });
      deps.userRepository.create.mockRejectedValue(new Error('boom'));
      await expect(useCase.execute(input)).rejects.toThrow('boom');
      expect(deps.rectorRepository.delete).toHaveBeenCalledWith(1);
      expect(deps.staffRepository.delete).toHaveBeenCalledWith(70);
    });
  });

  describe('modo histórico (tipo_referencia + referencia_id)', () => {
    it('rol no admin: solo crea el usuario con la referencia', async () => {
      const { deps, useCase } = crear({ rol: { id: 2, code: 'DOCENTE' } });
      await useCase.execute(entrada({ rol_id: 2, tipo_referencia: 'DOCENTE', referencia_id: '9' }));
      expect(deps.userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ referenceId: 9, referenceType: 'DOCENTE', roleId: 2 }),
      );
      expect(deps.staffRepository.create).not.toHaveBeenCalled();
    });

    it('referencia_id NaN no se considera referencia válida: 422', async () => {
      const { deps, useCase } = crear({ rol: { id: 2, code: 'DOCENTE' } });
      await expect(
        useCase.execute(entrada({ rol_id: 2, tipo_referencia: 'DOCENTE', referencia_id: 'abc' })),
      ).rejects.toBeInstanceOf(UnprocessableEntityError);
      expect(deps.userRepository.create).not.toHaveBeenCalled();
    });
  });
});

function rolEstudiante() {
  return { id: 4, code: 'ESTUDIANTE' };
}
