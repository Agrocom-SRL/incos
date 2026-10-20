import { jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { LoginUseCase } from '../../../src/application/use-cases/auth/LoginUseCase.js';
import { UnauthorizedError, ForbiddenError } from '../../../src/domain/errors/AppError.js';

describe('LoginUseCase', () => {
  let usuario;
  let authRepository;
  let useCase;

  beforeAll(async () => {
    usuario = {
      id: 7,
      username: 'test_admin',
      email: 'admin@test.local',
      foto_url: null,
      estado: null,
      password_hash: await bcrypt.hash('clave-correcta', 4),
      rol_id: 1,
      rol_codigo: 'ADMIN',
      rol_nombre: 'Administrador',
      rol_is_system: 1,
    };
  });

  beforeEach(() => {
    authRepository = {
      findUsuarioParaLogin: jest.fn().mockResolvedValue(usuario),
      createSesion: jest.fn().mockResolvedValue(undefined),
      findPermisosEfectivos: jest.fn().mockResolvedValue([
        { permiso_codigo: 'CARRERAS', accion: 'LISTAR' },
        { permiso_codigo: 'CARRERAS', accion: 'CREAR' },
      ]),
    };
    useCase = new LoginUseCase({ authRepository });
  });

  it('credenciales válidas: devuelve token, permisos agrupados y usuario', async () => {
    const res = await useCase.execute({ username: 'test_admin', password: 'clave-correcta', ip: '1.2.3.4' });

    expect(jwt.verify(res.token, process.env.JWT_SECRET)).toMatchObject({ userId: 7, rolCodigo: 'ADMIN' });
    expect(res.permisos).toEqual([{ codigo: 'CARRERAS', acciones: ['LISTAR', 'CREAR'] }]);
    expect(res.usuario).toMatchObject({
      id: 7,
      username: 'test_admin',
      rol: { codigo: 'ADMIN', is_system: true },
      vinculo_perfil: null,
    });
    expect(authRepository.createSesion).toHaveBeenCalledWith(
      expect.objectContaining({ usuarioId: 7, tokenSesion: res.token, ipUltimoLogin: '1.2.3.4', dispositivo: 'DESKTOP' }),
    );
  });

  it('usuario inexistente: UnauthorizedError sin crear sesión', async () => {
    authRepository.findUsuarioParaLogin.mockResolvedValue(null);
    await expect(useCase.execute({ username: 'x', password: 'y' })).rejects.toBeInstanceOf(UnauthorizedError);
    expect(authRepository.createSesion).not.toHaveBeenCalled();
  });

  it('contraseña incorrecta: UnauthorizedError sin crear sesión', async () => {
    await expect(useCase.execute({ username: 'test_admin', password: 'mala' })).rejects.toBeInstanceOf(UnauthorizedError);
    expect(authRepository.createSesion).not.toHaveBeenCalled();
  });

  it('cuenta con estado (suspendida): ForbiddenError, aunque la contraseña sea correcta', async () => {
    authRepository.findUsuarioParaLogin.mockResolvedValue({
      ...usuario, estado: 'SUSPENDIDO', motivo_cambio_estado: 'mora',
    });
    const promesa = useCase.execute({ username: 'test_admin', password: 'clave-correcta' });
    await expect(promesa).rejects.toBeInstanceOf(ForbiddenError);
    await expect(promesa).rejects.toThrow('Cuenta suspendido');
    expect(authRepository.createSesion).not.toHaveBeenCalled();
  });

  it('un fallo al resolver el vínculo no rompe el login', async () => {
    const userRepository = { findByIdWithRoleForAdmin: jest.fn().mockRejectedValue(new Error('boom')) };
    const uc = new LoginUseCase({ authRepository, userRepository, usuarioReferenciaVinculoRepository: {} });
    const res = await uc.execute({ username: 'test_admin', password: 'clave-correcta' });
    expect(res.usuario.vinculo_perfil).toBeNull();
  });
});
