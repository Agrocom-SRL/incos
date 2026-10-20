import { describe, it, expect, jest } from '@jest/globals';
import { ObtenerUsuarioUseCase } from '../../../src/application/use-cases/seguridad/ObtenerUsuarioUseCase.js';
import { NotFoundError } from '../../../src/domain/errors/AppError.js';

describe('ObtenerUsuarioUseCase', () => {
  const crear = (fila) => {
    const deps = {
      userRepository: { findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(fila) },
      userPermissionRepository: {
        findOverridesRawByUsuarioId: jest.fn().mockResolvedValue([
          { id: 1, codigo: 'u', accion: 'LISTAR', tipo: 'GRANT', permiso_id: 7, extra: 'no' },
        ]),
      },
      usuarioReferenciaVinculoRepository: { findPerfilVinculado: jest.fn().mockResolvedValue({ nombre_completo: 'Ana' }) },
      staffRepository: {
        findById: jest.fn().mockResolvedValue({ ci: '123', firstName: 'Ana', lastName: 'P', userId: 5 }),
      },
    };
    return { deps, useCase: new ObtenerUsuarioUseCase(deps) };
  };

  it('devuelve usuario sin password, overrides normalizados y vínculo', async () => {
    const { deps, useCase } = crear({
      id: 5, username: 'ana', password_hash: 'h', tipo_referencia: 'RECTOR', referencia_id: 8, rol_id: 3,
    });
    const res = await useCase.execute(5);
    expect(JSON.stringify(res)).not.toMatch(/password|"h"/);
    expect(res.overrides).toEqual([{ id: 1, codigo: 'u', accion: 'LISTAR', tipo: 'GRANT', motivo: null, permiso_id: 7 }]);
    expect(res.usuario.vinculo_perfil).toEqual({ nombre_completo: 'Ana' });
    expect(deps.usuarioReferenciaVinculoRepository.findPerfilVinculado).toHaveBeenCalledWith('RECTOR', 8);
    expect(deps.staffRepository.findById).toHaveBeenCalledWith(8);
    expect(res.usuario.personal).toMatchObject({ ci: '123', firstName: 'Ana', motherLastName: null });
  });

  it('personal editable también cuando tipo_referencia es null y hay referencia', async () => {
    const { deps, useCase } = crear({ id: 5, tipo_referencia: null, referencia_id: 2 });
    const res = await useCase.execute(5);
    expect(deps.staffRepository.findById).toHaveBeenCalledWith(2);
    expect(res.usuario.personal).not.toBeNull();
  });

  it.each([
    ['DOCENTE', 4],
    ['ESTUDIANTE', 4],
    [null, null],
  ])('tipo %p ref %p: sin ficha de personal', async (tipo, ref) => {
    const { deps, useCase } = crear({ id: 5, tipo_referencia: tipo, referencia_id: ref });
    const res = await useCase.execute(5);
    expect(deps.staffRepository.findById).not.toHaveBeenCalled();
    expect(res.usuario.personal).toBeNull();
  });

  it('usuario inexistente: NotFoundError sin consultar overrides', async () => {
    const { deps, useCase } = crear(null);
    await expect(useCase.execute(5)).rejects.toBeInstanceOf(NotFoundError);
    expect(deps.userPermissionRepository.findOverridesRawByUsuarioId).not.toHaveBeenCalled();
  });
});
