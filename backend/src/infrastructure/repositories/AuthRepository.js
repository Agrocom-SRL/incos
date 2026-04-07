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
            SELECT
                u.id,
                u.username,
                u.email,
                u.password_hash,
                u.foto_url,
                u.estado,
                u.motivo_cambio_estado,
                u.activo,
                u.rol_id,
                r.codigo AS rol_codigo,
                r.nombre AS rol_nombre,
                r.nivel_acceso AS rol_nivel
            FROM usuarios u
            LEFT JOIN roles r ON r.id = u.rol_id
                AND r.activo = TRUE AND r.deleted_at IS NULL
            WHERE (u.username = :valor OR u.email = :valor)
                AND u.activo = TRUE
                AND u.deleted_at IS NULL
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
            SELECT
                s.id AS sesion_id,
                s.usuario_id,
                u.activo AS usuario_activo,
                u.estado AS usuario_estado,
                u.motivo_cambio_estado,
                u.rol_id,
                r.codigo AS rol_codigo,
                r.nombre AS rol_nombre,
                r.nivel_acceso AS rol_nivel,
                u.username,
                u.email,
                u.foto_url
            FROM sesiones s
            JOIN usuarios u ON u.id = s.usuario_id
            LEFT JOIN roles r ON r.id = u.rol_id
                AND r.activo = TRUE AND r.deleted_at IS NULL
            WHERE s.token_sesion = :token
                AND s.activo = TRUE
                AND s.deleted_at IS NULL
                AND (s.fecha_expiracion IS NULL OR s.fecha_expiracion > NOW())
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
            FROM usuarios
            WHERE id = :usuarioId
              AND activo = TRUE
              AND deleted_at IS NULL
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
    if (Number(userRow.rol_id) === 8) {
      return sequelize.query(
        `
            SELECT p.codigo AS permiso_codigo, pa.accion
            FROM permiso_acciones pa
            JOIN permisos p ON p.id = pa.permiso_id
            WHERE pa.activo = TRUE
              AND pa.deleted_at IS NULL
              AND p.activo = TRUE
              AND p.deleted_at IS NULL
            ORDER BY p.id, pa.accion
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
            FROM usuarios
            WHERE id = :usuarioId
              AND activo = TRUE
              AND deleted_at IS NULL
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

    if (Number(userRow.rol_id) === 8) {
      const rows = await sequelize.query(
        `
            SELECT 1 AS ok
            FROM permiso_acciones pa
            JOIN permisos p ON p.id = pa.permiso_id
            WHERE p.codigo = :codigo
              AND pa.accion = :accion
              AND pa.activo = TRUE
              AND pa.deleted_at IS NULL
              AND p.activo = TRUE
              AND p.deleted_at IS NULL
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
