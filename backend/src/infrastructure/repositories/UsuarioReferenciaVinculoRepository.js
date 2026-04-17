import { sequelize } from '../database/sequelize.js';
import { TIPOS_REFERENCIA } from '../../domain/constants/usuarios.constants.js';

const TIPO_ETIQUETA = {
  [TIPOS_REFERENCIA.ESTUDIANTE]: 'Estudiante',
  [TIPOS_REFERENCIA.DOCENTE]: 'Docente',
  [TIPOS_REFERENCIA.RECTOR]: 'Rector',
  [TIPOS_REFERENCIA.DIRECTOR]: 'Director',
  [TIPOS_REFERENCIA.SECRETARIA]: 'Secretaría',
};

function nombreCompleto(row) {
  const parts = [row.nombres, row.apellido_paterno, row.apellido_materno].filter(Boolean);
  const s = parts.join(' ').trim();
  return s || null;
}

function ciTexto(ci, expedicion) {
  if (ci == null || ci === '') return null;
  const exp = expedicion ? String(expedicion).trim() : '';
  return exp ? `${ci} ${exp}` : String(ci);
}

/**
 * Resuelve tipo_referencia + referencia_id a datos legibles para administración SEG.
 * No expone IDs internos; solo etiquetas y texto para UI.
 */
export class UsuarioReferenciaVinculoRepository {
  /**
   * @returns {Promise<{
   *   tipo_etiqueta: string,
   *   nombre_completo: string,
   *   lineas: { etiqueta: string, valor: string }[]
   * } | null>}
   */
  async findPerfilVinculado(tipoReferencia, referenciaId) {
    if (referenciaId == null) return null;
    const id = Number(referenciaId);
    if (!Number.isFinite(id) || id < 1) return null;

    // Usuario con ficha en personal pero sin tipo_referencia (p. ej. administrador del sistema con simetría de alta)
    if (!tipoReferencia || String(tipoReferencia).trim() === '') {
      return this.#perfilDesdePersonalId(id, 'Personal');
    }

    const tipoEtiqueta = TIPO_ETIQUETA[tipoReferencia];
    if (!tipoEtiqueta) return null;

    let row = null;
    switch (tipoReferencia) {
      case TIPOS_REFERENCIA.ESTUDIANTE:
        row = await this.#selectOne(
          `
          SELECT nombres, apellido_paterno, apellido_materno, ci, expedicion, codigo_estudiante
          FROM estudiantes
          WHERE id = :id AND deleted_at IS NULL
          LIMIT 1
          `,
          { id }
        );
        break;
      case TIPOS_REFERENCIA.DOCENTE:
        row = await this.#selectOne(
          `
          SELECT nombres, apellido_paterno, apellido_materno, ci, expedicion, titulo_profesional
          FROM docentes
          WHERE id = :id AND deleted_at IS NULL
          LIMIT 1
          `,
          { id }
        );
        break;
      case TIPOS_REFERENCIA.RECTOR:
      case TIPOS_REFERENCIA.DIRECTOR:
      case TIPOS_REFERENCIA.SECRETARIA:
        return this.#perfilDesdePersonalId(id, tipoEtiqueta);
      default:
        return null;
    }

    if (!row) return null;

    const nombre = nombreCompleto(row);
    if (!nombre) return null;

    const lineas = [];

    const ci = ciTexto(row.ci, row.expedicion);
    if (ci) lineas.push({ etiqueta: 'CI', valor: ci });

    if (tipoReferencia === TIPOS_REFERENCIA.ESTUDIANTE && row.codigo_estudiante) {
      lineas.push({ etiqueta: 'Código estudiante', valor: String(row.codigo_estudiante) });
    }
    if (tipoReferencia === TIPOS_REFERENCIA.DOCENTE && row.titulo_profesional) {
      lineas.push({ etiqueta: 'Título profesional', valor: String(row.titulo_profesional) });
    }

    return {
      tipo_etiqueta: tipoEtiqueta,
      nombre_completo: nombre,
      lineas,
    };
  }

  /**
   * Perfil legible desde tabla personal (misma consulta para RECTOR/DIRECTOR/SECRETARIA y tipo_referencia NULL).
   */
  async #perfilDesdePersonalId(id, tipoEtiqueta) {
    const row = await this.#selectOne(
      `
      SELECT nombres, apellido_paterno, apellido_materno, ci, expedicion, email_personal, celular
      FROM personal
      WHERE id = :id AND deleted_at IS NULL
      LIMIT 1
      `,
      { id }
    );
    if (!row) return null;
    const nombre = nombreCompleto(row);
    if (!nombre) return null;
    const lineas = [];
    const ci = ciTexto(row.ci, row.expedicion);
    if (ci) lineas.push({ etiqueta: 'CI', valor: ci });
    if (row.email_personal) {
      lineas.push({ etiqueta: 'Email personal', valor: String(row.email_personal) });
    }
    if (row.celular) {
      lineas.push({ etiqueta: 'Celular', valor: String(row.celular) });
    }
    return {
      tipo_etiqueta: tipoEtiqueta,
      nombre_completo: nombre,
      lineas,
    };
  }

  async #selectOne(sql, replacements) {
    const rows = await sequelize.query(sql, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    return rows[0] || null;
  }
}
