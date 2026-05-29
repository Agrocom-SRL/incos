import { body } from 'express-validator';
import { idValidator } from '../common/id.validator.js';
import { DOCENTE_COLOR_HEX_REGEX } from '../../../domain/constants/docentes.constants.js';

export const putDocenteColorValidator = [
  ...idValidator,
  body('color_hex')
    .optional()
    .custom((value, { req }) => {
      const raw = value ?? req.body?.colorHex;
      if (raw == null || String(raw).trim() === '') {
        throw new Error('color_hex es requerido');
      }
      const s = String(raw).trim();
      if (DOCENTE_COLOR_HEX_REGEX.test(s) || /^[0-9A-F]{6}$/i.test(s)) return true;
      throw new Error('color_hex debe tener formato #RRGGBB');
    }),
];
