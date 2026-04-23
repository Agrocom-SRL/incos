/**
 * Catálogo visual del wizard «Cargo en el instituto» (icono, color, tint por código de rol).
 * Helpers: getInstitutionalCargoVisual, sortInstitutionalRoles, getWizardRoleResumenVisual.
 * Usado en: InstitutionalRoleRadioOption, paso credenciales (panel de rol: borde y textos por color).
 */
import {
  ApartmentOutlined,
  BookOutlined,
  CrownOutlined,
  FolderOpenOutlined,
  IdcardOutlined,
  ReadOutlined,
  SecurityScanOutlined,
  SolutionOutlined,
} from '@ant-design/icons';

/** Texto introductorio del bloque «Cargo en el instituto» (wizard alta usuario). */
export const CARGO_INSTITUCIONAL_WIZARD_INTRO =
  'Elija el cargo institucional: Rector, Dirección Académica o Administrativa, o Secretaría Académica o Administrativa. ' +
  'Las opciones corresponden a los roles institucionales del sistema (mismo catálogo que en base de datos). ' +
  'Quedará vinculado a la misma ficha de datos personales.';

/** Orden fijo en el listado (rector → directores → secretarías). */
export const INSTITUTIONAL_ROLE_ORDER = [
  'RECTOR',
  'DIR_ACADEMICO',
  'DIR_ADMIN',
  'SEC_ACADEMICA',
  'SEC_ADMIN',
];

/** Paleta de cargos institucionales (radios del paso perfil). */
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

/**
 * Roles no institucionales (admin, docente, estudiante): colores e iconos distintos a INSTITUTIONAL_CARGO_VISUAL.
 * Se usa en el paso credenciales para icono y color del rol asignado.
 */
export const WIZARD_OPERATIVE_ROLE_VISUAL = {
  ADMIN_SISTEMA: {
    color: '#4338ca',
    tint: 'rgba(67, 56, 202, 0.12)',
    Icon: SecurityScanOutlined,
  },
  DOCENTE: {
    color: '#047857',
    tint: 'rgba(4, 120, 87, 0.12)',
    Icon: SolutionOutlined,
  },
  ESTUDIANTE: {
    color: '#b45309',
    tint: 'rgba(180, 83, 9, 0.12)',
    Icon: IdcardOutlined,
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

/**
 * Visual para resumen de rol en wizard (credenciales): primero cargo institucional, luego rol operativo.
 * @returns {{ color: string, tint: string, Icon: import('react').ComponentType, group: 'cargo'|'operativo'|'default' }}
 */
export function getWizardRoleResumenVisual(codigo) {
  if (codigo && INSTITUTIONAL_CARGO_VISUAL[codigo]) {
    return { ...INSTITUTIONAL_CARGO_VISUAL[codigo], group: 'cargo' };
  }
  if (codigo && WIZARD_OPERATIVE_ROLE_VISUAL[codigo]) {
    return { ...WIZARD_OPERATIVE_ROLE_VISUAL[codigo], group: 'operativo' };
  }
  return { ...DEFAULT_VISUAL, group: 'default' };
}

export function sortInstitutionalRoles(roles) {
  return [...(roles || [])].sort(
    (a, b) =>
      INSTITUTIONAL_ROLE_ORDER.indexOf(a.codigo) - INSTITUTIONAL_ROLE_ORDER.indexOf(b.codigo)
  );
}
