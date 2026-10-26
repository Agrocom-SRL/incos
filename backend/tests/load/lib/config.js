// Configuración compartida de las pruebas de carga (k6). Solo lecturas.
// Variables de entorno: BASE_URL (sin /api/v1), K6_PASSWORD (clave de los usuarios test.*).
export const BASE_URL = (__ENV.BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
export const API = `${BASE_URL}/api/v1`;
export const PASSWORD = __ENV.K6_PASSWORD;

// Salvaguarda: estas pruebas generan carga real; jamás contra producción.
const PROHIBIDOS = ['incos-santacruz.edu.bo'];
if (PROHIBIDOS.some((h) => BASE_URL.includes(h))) {
  throw new Error(`BASE_URL apunta a un host productivo (${BASE_URL}). Abortado.`);
}
if (!PASSWORD) {
  throw new Error('Defina K6_PASSWORD (clave de los usuarios test.* del seed 04-test-seeds).');
}

// Mismos usuarios que backend/tests/integration/helpers/sistema.js
export const USUARIOS = {
  ADMIN_SISTEMA: 'test.admin',
  RECTOR: 'test.rector',
  DIR_ACADEMICO: 'test.dir_academico',
  DIR_ADMIN: 'test.dir_admin',
  SEC_ACADEMICA: 'test.sec_academica',
  SEC_ADMIN: 'test.sec_admin',
  DOCENTE: 'test.docente',
  ESTUDIANTE: 'test.estudiante',
};
export const ROLES = Object.keys(USUARIOS);

// [ruta, rol con permiso]: listados principales de tests/integration/listados.test.js.
export const LISTADOS = [
  ['/usuarios', 'ADMIN_SISTEMA'],
  ['/carreras', 'RECTOR'],
  ['/materias', 'RECTOR'],
  ['/docentes', 'DIR_ACADEMICO'],
  ['/estudiantes', 'SEC_ACADEMICA'],
  ['/inscripciones', 'SEC_ACADEMICA'],
  ['/pagos-aportes', 'DIR_ADMIN'],
];

// Exportación Excel (tests/integration/exportaciones.test.js)
export const EXPORTACION = ['/estudiantes/export/estadistica-inscritos', 'SEC_ACADEMICA'];

// Dashboard: general y portales (ruta, rol)
export const DASHBOARDS = [
  ['/dashboard/resumen', 'RECTOR'],
  ['/dashboard/mi-resumen', 'ESTUDIANTE'],
  ['/dashboard/mi-resumen-docente', 'DOCENTE'],
];
