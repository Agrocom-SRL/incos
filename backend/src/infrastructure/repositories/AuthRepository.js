import { sequelize } from '../database/sequelize.js';

/**
 * Repositorio de autenticación y permisos.
 * Consultas directas sobre SQL/vistas, sin asociaciones Sequelize.
 * No extiende BaseRepository (no es CRUD de una sola tabla; contrato en IAuthRepository).
 * Patrón de queries: igual que StudentRepository.obtenerDatosPersonales (vista SQL + sequelize.query).
 *
 * @implements {IAuthRepository}
 */
export class AuthRepository {
  /**
   * Busca usuario por username o email con su rol.
   */
  async findUsuarioParaLogin(usernameOrEmail) {
    const rows = await sequelize.query(
      `
            SELECT *
            FROM vista_auth_usuarios_login
            WHERE (username = :valor OR email = :valor)
            LIMIT 1
        `,
      {
        replacements: { valor: usernameOrEmail },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return rows[0] || null;
  }

  /**
   * Verifica si hay una sesión activa para el token dado.
   * Incluye datos del usuario para no hacer segunda query en el middleware.
   */
  async findSesionActiva(token) {
    const rows = await sequelize.query(
      `
            SELECT *
            FROM vista_auth_sesiones_activas
            WHERE token_sesion = :token
                AND (fecha_expiracion IS NULL OR fecha_expiracion > NOW())
        `,
      {
        replacements: { token },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return rows[0] || null;
  }

  /**
   * Obtiene permisos efectivos del usuario desde la vista.
   * Una fila por (permiso_codigo, accion).
   */
  async findPermisosEfectivos(usuarioId) {
    const userRows = await sequelize.query(
      `
            SELECT rol_id
            FROM vista_usuarios_admin_base
            WHERE id = :usuarioId
            LIMIT 1
        `,
      {
        replacements: { usuarioId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const userRow = userRows[0];
    if (!userRow) {
      return [];
    }

    // ADMIN_SISTEMA: obtiene todo el catálogo válido desde permiso_acciones
    if (Number(userRow.rol_id) === 1) {
      return sequelize.query(
        `
            SELECT codigo AS permiso_codigo, accion
            FROM vista_catalogo_acciones_permisos_activas
            ORDER BY permiso_id, accion
        `,
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
    }

    return sequelize.query(
      `
            SELECT permiso_codigo, accion
            FROM vista_usuario_permisos_efectivos
            WHERE usuario_id = :usuarioId
            ORDER BY permiso_codigo, accion
        `,
      {
        replacements: { usuarioId },
        type: sequelize.QueryTypes.SELECT,
      }
    );
  }

  /**
   * Verifica si un usuario tiene un permiso+acción específicos.
   */
  async tienePermiso(usuarioId, codigoPermiso, accion) {
    const userRows = await sequelize.query(
      `
            SELECT rol_id
            FROM vista_usuarios_admin_base
            WHERE id = :usuarioId
            LIMIT 1
        `,
      {
        replacements: { usuarioId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const userRow = userRows[0];
    if (!userRow) {
      return false;
    }

    if (Number(userRow.rol_id) === 1) {
      const rows = await sequelize.query(
        `
            SELECT 1 AS ok
            FROM vista_catalogo_acciones_permisos_activas
            WHERE codigo = :codigo
              AND accion = :accion
            LIMIT 1
        `,
        {
          replacements: { codigo: codigoPermiso, accion },
          type: sequelize.QueryTypes.SELECT,
        }
      );
      return rows.length > 0;
    }

    const rows = await sequelize.query(
      `
            SELECT 1 AS ok
            FROM vista_usuario_permisos_efectivos
            WHERE usuario_id = :usuarioId
                AND permiso_codigo = :codigo
                AND accion = :accion
            LIMIT 1
        `,
      {
        replacements: { usuarioId, codigo: codigoPermiso, accion },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    return rows.length > 0;
  }

  /**
   * Crea una nueva sesión en la tabla sesiones.
   */
  async createSesion({
    usuarioId,
    tokenSesion,
    fechaExpiracion,
    ultimoLogin,
    ipUltimoLogin,
    dispositivo,
  }) {
    await sequelize.query(
      `
            INSERT INTO sesiones
                (usuario_id, token_sesion, fecha_expiracion,
                 ultimo_login, ip_ultimo_login, dispositivo,
                 activo, created_at, updated_at)
            VALUES
                (:usuarioId, :tokenSesion, :fechaExpiracion,
                 :ultimoLogin, :ipUltimoLogin, :dispositivo,
                 TRUE, NOW(), NOW())
        `,
      {
        replacements: {
          usuarioId,
          tokenSesion,
          fechaExpiracion: fechaExpiracion || null,
          ultimoLogin,
          ipUltimoLogin: ipUltimoLogin || null,
          dispositivo: dispositivo || 'DESKTOP',
        },
        type: sequelize.QueryTypes.INSERT,
      }
    );
  }

  /**
   * Invalida una sesión por token (logout).
   */
  async invalidarSesion(token) {
    await sequelize.query(
      `
            UPDATE sesiones
            SET activo = FALSE,
                deleted_at = NOW(),
                updated_at = NOW()
            WHERE token_sesion = :token
                AND activo = TRUE
        `,
      {
        replacements: { token },
        type: sequelize.QueryTypes.UPDATE,
      }
    );
  }
}
