import bcrypt from 'bcryptjs';
import {
  UnauthorizedError,
  ForbiddenError,
} from '../../../domain/errors/AppError.js';
import { calcularFechaExpiracion, generarToken } from '../../../infrastructure/utils/jwt.utils.js';
import { mapPermisosEfectivos } from './mapPermisosEfectivos.js';
import { resolveVinculoPerfilUsuario } from './resolveVinculoPerfilUsuario.js';

/**
 * Caso de uso: inicio de sesión (JWT + fila en sesiones).
 *
 * La respuesta incluye `vinculo_perfil` (mismo shape que /auth/me) para que el
 * frontend muestre el nombre de la persona vinculada desde el primer render,
 * sin esperar al bootstrap de /auth/me.
 */
export class LoginUseCase {
  /**
   * @param {Object} deps
   * @param {import('../../../domain/interfaces/repositories/IAuthRepository.js').IAuthRepository} deps.authRepository
   * @param {import('../../../infrastructure/repositories/UserRepository.js').UserRepository} [deps.userRepository]
   * @param {import('../../../infrastructure/repositories/views/UsuarioReferenciaVinculoRepository.js').UsuarioReferenciaVinculoRepository} [deps.usuarioReferenciaVinculoRepository]
   */
  constructor({ authRepository, userRepository, usuarioReferenciaVinculoRepository }) {
    this.authRepository = authRepository;
    this.userRepository = userRepository;
    this.usuarioReferenciaVinculoRepository = usuarioReferenciaVinculoRepository;
  }

  /**
   * @param {Object} input
   * @param {string} input.username
   * @param {string} input.password
   * @param {string|null} [input.ip]
   * @param {string} [input.dispositivo]
   */
  async execute({ username, password, ip, dispositivo }) {
    const usuario = await this.authRepository.findUsuarioParaLogin(username);
    if (!usuario) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (usuario.estado !== null && usuario.estado !== undefined) {
      const estadoStr = String(usuario.estado).toLowerCase();
      throw new ForbiddenError(`Cuenta ${estadoStr}`, {
        motivo: usuario.motivo_cambio_estado ?? null,
      });
    }

    const ok = await bcrypt.compare(password, usuario.password_hash);
    if (!ok) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = generarToken({
      userId: usuario.id,
      rolId: usuario.rol_id,
      rolCodigo: usuario.rol_codigo,
    });
    const fechaExpiracion = calcularFechaExpiracion();

    await this.authRepository.createSesion({
      usuarioId: usuario.id,
      tokenSesion: token,
      fechaExpiracion,
      ultimoLogin: new Date(),
      ipUltimoLogin: ip || null,
      dispositivo: dispositivo || 'DESKTOP',
    });

    const filasPermisos = await this.authRepository.findPermisosEfectivos(usuario.id);
    const permisos = mapPermisosEfectivos(filasPermisos);

    // Vínculo persona↔usuario (defensivo: el login nunca falla por esto).
    let vinculoPerfil = null;
    try {
      vinculoPerfil = await resolveVinculoPerfilUsuario({
        userRepository: this.userRepository,
        usuarioReferenciaVinculoRepository: this.usuarioReferenciaVinculoRepository,
        usuarioId: usuario.id,
      });
    } catch {
      vinculoPerfil = null;
    }

    return {
      token,
      permisos,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        foto_url: usuario.foto_url,
        rol: {
          id: usuario.rol_id,
          codigo: usuario.rol_codigo,
          nombre: usuario.rol_nombre,
          is_system: Boolean(usuario.rol_is_system),
          tipo: usuario.rol_tipo ?? null,
        },
        vinculo_perfil: vinculoPerfil,
      },
    };
  }
}
