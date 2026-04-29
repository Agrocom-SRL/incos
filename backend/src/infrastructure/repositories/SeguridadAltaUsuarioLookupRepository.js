import { QueryTypes } from 'sequelize';
import { sequelize } from '../database/sequelize.js';

function normalizeLimit(limit, fallback = 20) {
  return Math.min(Math.max(parseInt(limit, 10) || fallback, 1), 50);
}

function normalizeSearch(searchTerm) {
  const raw = String(searchTerm || '').trim();
  if (raw.length < 2) return null;
  const safe = raw.replace(/%/g, '').replace(/_/g, '');
  return `%${safe}%`;
}

export class SeguridadAltaUsuarioLookupRepository {
  async buscarEstudiantesSinCuenta(searchTerm, limit = 20) {
    const term = normalizeSearch(searchTerm);
    if (!term) return [];
    const lim = normalizeLimit(limit);

    return sequelize.query(
      `
      SELECT
        id,
        codigo_estudiante AS codigoEstudiante,
        nombres,
        apellido_paterno AS apellidoPaterno,
        apellido_materno AS apellidoMaterno,
        ci,
        expedicion,
        email_personal AS emailPersonal,
        celular,
        telefono_fijo AS telefonoFijo
      FROM vista_seguridad_alta_usuario_estudiantes_sin_cuenta
      WHERE (
        COALESCE(codigo_estudiante, '') LIKE :term
        OR COALESCE(ci, '') LIKE :term
        OR COALESCE(nombres, '') LIKE :term
        OR COALESCE(apellido_paterno, '') LIKE :term
        OR COALESCE(apellido_materno, '') LIKE :term
        OR CONCAT_WS(' ', nombres, apellido_paterno, apellido_materno) LIKE :term
      )
      ORDER BY created_at DESC
      LIMIT :lim
      `,
      {
        replacements: { term, lim },
        type: QueryTypes.SELECT,
      }
    );
  }

  async buscarDocentesSinCuenta(searchTerm, limit = 20) {
    const term = normalizeSearch(searchTerm);
    if (!term) return [];
    const lim = normalizeLimit(limit);

    return sequelize.query(
      `
      SELECT
        id,
        nombres,
        apellido_paterno AS apellidoPaterno,
        apellido_materno AS apellidoMaterno,
        ci,
        expedicion,
        email_personal AS emailPersonal,
        estado_laboral AS estadoLaboral,
        celular,
        telefono
      FROM vista_seguridad_alta_usuario_docentes_sin_cuenta
      WHERE (
        COALESCE(ci, '') LIKE :term
        OR COALESCE(nombres, '') LIKE :term
        OR COALESCE(apellido_paterno, '') LIKE :term
        OR COALESCE(apellido_materno, '') LIKE :term
        OR CONCAT_WS(' ', nombres, apellido_paterno, apellido_materno) LIKE :term
      )
      ORDER BY created_at DESC
      LIMIT :lim
      `,
      {
        replacements: { term, lim },
        type: QueryTypes.SELECT,
      }
    );
  }
}
