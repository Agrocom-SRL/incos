/**
 * Catálogo visual del wizard «Cargo en el instituto» (icono, color, tint por código de rol).
 * Helpers: getInstitutionalCargoVisual, sortInstitutionalRoles.
 * Usado en: InstitutionalRoleRadioOption, UsuarioWizardCredencialesStepContent (resumen).
 */
import {
  ApartmentOutlined,
  BookOutlined,
  CrownOutlined,
  FolderOpenOutlined,
  ReadOutlined,
} from '@ant-design/icons';

/** Texto introductorio del bloque «Cargo en el instituto» (wizard alta usuario). */
export const CARGO_INSTITUCIONAL_WIZARD_INTRO =
  'Elija el rol que tendrá en el sistema; según la opción quedará asignado al cargo correspondiente en el ' +
  'instituto (rectorado, dirección o secretaría), vinculado a la misma ficha de datos personales.';

/** Orden fijo en el listado (rector → directores → secretarías). */
export const INSTITUTIONAL_ROLE_ORDER = [
  'RECTOR',
  'DIR_ACADEMICO',
  'DIR_ADMIN',
  'SEC_ACADEMICA',
  'SEC_ADMIN',
];

export const INSTITUTIONAL_CARGO_VISUAL = {
  RECTOR: {
    color: '#b91c1c',
    tint: 'rgba(185, 28, 28, 0.12)',
    Icon: CrownOutlined,
  },
  DIR_ACADEMICO: {
    color: '#1d4ed8',
    tint: 'rgba(29, 78, 216, 0.1)',
    Icon: ReadOutlined,
  },
  DIR_ADMIN: {
    color: '#f57f17',
    tint: 'rgba(245, 127, 23, 0.15)',
    Icon: ApartmentOutlined,
  },
  SEC_ACADEMICA: {
    color: '#0d9488',
    tint: 'rgba(13, 148, 136, 0.12)',
    Icon: BookOutlined,
  },
  SEC_ADMIN: {
    color: '#7c3aed',
    tint: 'rgba(124, 58, 237, 0.1)',
    Icon: FolderOpenOutlined,
  },
};

const DEFAULT_VISUAL = {
  color: '#64748b',
  tint: 'rgba(100, 116, 139, 0.1)',
  Icon: ApartmentOutlined,
};

export function getInstitutionalCargoVisual(codigo) {
  if (!codigo || !INSTITUTIONAL_CARGO_VISUAL[codigo]) {
    return DEFAULT_VISUAL;
  }
  return INSTITUTIONAL_CARGO_VISUAL[codigo];
}

export function sortInstitutionalRoles(roles) {
  return [...(roles || [])].sort(
    (a, b) =>
      INSTITUTIONAL_ROLE_ORDER.indexOf(a.codigo) - INSTITUTIONAL_ROLE_ORDER.indexOf(b.codigo)
  );
}
