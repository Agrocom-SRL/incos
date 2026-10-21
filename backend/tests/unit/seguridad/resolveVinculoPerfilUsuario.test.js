import { describe, it, expect, jest } from '@jest/globals';
import resolveDefault, { resolveVinculoPerfilUsuario } from '../../../src/application/use-cases/auth/resolveVinculoPerfilUsuario.js';

describe('resolveVinculoPerfilUsuario', () => {
  it('export por defecto es la misma función', () => {
    expect(resolveDefault).toBe(resolveVinculoPerfilUsuario);
  });

  it('resuelve el perfil con tipo y referencia del usuario', async () => {
    const userRepository = { findByIdWithRoleForAdmin: jest.fn().mockResolvedValue({ tipo_referencia: 'ESTUDIANTE', referencia_id: 4 }) };
    const usuarioReferenciaVinculoRepository = { findPerfilVinculado: jest.fn().mockResolvedValue({ ok: 1 }) };
    const res = await resolveVinculoPerfilUsuario({ userRepository, usuarioReferenciaVinculoRepository, usuarioId: 3 });
    expect(userRepository.findByIdWithRoleForAdmin).toHaveBeenCalledWith(3);
    expect(usuarioReferenciaVinculoRepository.findPerfilVinculado).toHaveBeenCalledWith('ESTUDIANTE', 4);
    expect(res).toEqual({ ok: 1 });
  });

  it('usuario inexistente: null', async () => {
    const userRepository = { findByIdWithRoleForAdmin: jest.fn().mockResolvedValue(null) };
    const usuarioReferenciaVinculoRepository = { findPerfilVinculado: jest.fn() };
    expect(await resolveVinculoPerfilUsuario({ userRepository, usuarioReferenciaVinculoRepository, usuarioId: 3 })).toBeNull();
    expect(usuarioReferenciaVinculoRepository.findPerfilVinculado).not.toHaveBeenCalled();
  });

  it('repositorios no inyectados: null sin romper', async () => {
    expect(await resolveVinculoPerfilUsuario({ usuarioId: 1 })).toBeNull();
    expect(await resolveVinculoPerfilUsuario({ userRepository: {}, usuarioId: 1 })).toBeNull();
  });
});
