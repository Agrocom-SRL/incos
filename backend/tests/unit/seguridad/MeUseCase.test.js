import { describe, it, expect, jest } from '@jest/globals';
import { MeUseCase } from '../../../src/application/use-cases/auth/MeUseCase.js';

describe('MeUseCase', () => {
  const sesion = {
    usuario_id: 5,
username: 'ana',
email: 'a@x',
foto_url: null,
    rol_id: 2,
rol_codigo: 'DOCENTE',
rol_nombre: 'Docente',
rol_is_system: 0,
    password_hash: 'h',
token_sesion: 'tok-secreto',
  };
  const crear = (fila = { tipo_referencia: 'DOCENTE', referencia_id: 9 }) => {
    const deps = {
      authRepository: { findPermisosEfectivos: jest.fn().mockResolvedValue([{ permiso_codigo: 'A', accion: 'LISTAR' }]) },
      userRepository: { findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(fila) },
      usuarioReferenciaVinculoRepository: { findPerfilVinculado: jest.fn().mockResolvedValue({ nombre_completo: 'Ana' }) },
    };
    return { deps, useCase: new MeUseCase(deps) };
  };

  it('devuelve perfil, permisos efectivos y vínculo', async () => {
    const { deps, useCase } = crear();
    const res = await useCase.execute(5, sesion);
    expect(deps.authRepository.findPermisosEfectivos).toHaveBeenCalledWith(5);
    expect(deps.usuarioReferenciaVinculoRepository.findPerfilVinculado).toHaveBeenCalledWith('DOCENTE', 9);
    expect(res.permisos).toEqual([{ codigo: 'A', acciones: ['LISTAR'] }]);
    expect(res.usuario).toMatchObject({
      id: 5,
username: 'ana',
rol: { id: 2, codigo: 'DOCENTE', is_system: false, tipo: null },
      vinculo_perfil: { nombre_completo: 'Ana' },
    });
  });

  it('no filtra campos sensibles de la sesión (hash ni token)', async () => {
    const { useCase } = crear();
    const res = await useCase.execute(5, sesion);
    expect(JSON.stringify(res)).not.toMatch(/password|tok-secreto/);
  });

  it('usuario sin ficha: vinculo_perfil null', async () => {
    const { deps, useCase } = crear(null);
    const res = await useCase.execute(5, sesion);
    expect(res.usuario.vinculo_perfil).toBeNull();
    expect(deps.usuarioReferenciaVinculoRepository.findPerfilVinculado).not.toHaveBeenCalled();
  });

  it('sin permisos efectivos: lista vacía', async () => {
    const { deps, useCase } = crear();
    deps.authRepository.findPermisosEfectivos.mockResolvedValue([]);
    expect((await useCase.execute(5, sesion)).permisos).toEqual([]);
  });
});
