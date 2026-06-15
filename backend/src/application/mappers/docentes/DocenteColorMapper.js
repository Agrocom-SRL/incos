import { DOCENTE_COLOR_HEX_REGEX } from '../../../domain/constants/docentes.constants.js';

export function normalizeDocenteColorHex(value) {
  if (value == null || value === '') return null;
  const s = String(value).trim();
  if (DOCENTE_COLOR_HEX_REGEX.test(s)) return s.toUpperCase();
  if (/^[0-9A-F]{6}$/i.test(s)) return `#${s.toUpperCase()}`;
  return null;
}

export class DocenteColorMapper {
  static toColorEnUsoPresentation(rows = []) {
    return rows.map((row) => ({
      docente_id: row.docenteId,
      color_hex: row.colorHex,
      docente_nombre: row.docenteNombre,
    }));
  }

  static toColoresSugeridosPresentation(palette, usedByColor = new Map()) {
    return palette.map((rawHex) => {
      const colorHex = normalizeDocenteColorHex(rawHex);
      const usedBy = usedByColor.get(colorHex);
      return {
        color_hex: colorHex,
        disponible: !usedBy,
        docente_id: usedBy?.docenteId ?? null,
        docente_nombre: usedBy?.docenteNombre ?? null,
      };
    });
  }

  static toDocenteColorPresentation(teacher) {
    const plain = teacher?.toPlainObject ? teacher.toPlainObject() : teacher;
    return {
      docente_id: plain?.id ?? null,
      color_hex: normalizeDocenteColorHex(plain?.colorHex),
    };
  }
}
