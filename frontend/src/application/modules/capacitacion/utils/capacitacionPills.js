/**
 * Estados del dominio Capacitación → etiqueta legible + clase de StatusPill.
 *
 * Mismo enfoque que `pagosPills` de Finanzas, pero sobre las clases GLOBALES
 * `cfg-materia-pill--*` (styles/components/atoms/table-cells.css) — sin CSS
 * propio del módulo. Dos vocabularios:
 *   - estado del CURSO (ENUM capacitaciones.estado)
 *   - estado de PAGO de la inscripción (derivado por el backend:
 *     PENDIENTE/PARCIAL/PAGADO según total pagado vs costo)
 */

/** ENUM del backend (capacitacion.constants.js) — fuente del select del formulario. */
export const ESTADOS_CURSO_CAP = ['PROPUESTO', 'ABIERTO', 'EN_CURSO', 'CERRADO', 'CANCELADO'];

const CURSO_ESTADO_META = {
  PROPUESTO: { label: 'Propuesto', pill: 'cfg-materia-pill--default' },
  ABIERTO: { label: 'Abierto', pill: 'cfg-materia-pill--success' },
  EN_CURSO: { label: 'En curso', pill: 'cfg-materia-pill--info' },
  CERRADO: { label: 'Cerrado', pill: 'cfg-materia-pill--inactiva' },
  CANCELADO: { label: 'Cancelado', pill: 'cfg-materia-pill--danger' },
};

/** Etiqueta legible del estado del curso. */
export const formatEstadoCurso = (estado) => CURSO_ESTADO_META[estado]?.label ?? estado ?? '—';

/** Clase completa del StatusPill para el estado del curso. */
export const getEstadoCursoPillClass = (estado) =>
  `cfg-materia-pill ${CURSO_ESTADO_META[estado]?.pill ?? 'cfg-materia-pill--default'}`;

/** Opciones del select de estado del formulario de curso. */
export const ESTADO_CURSO_OPTIONS = ESTADOS_CURSO_CAP.map((estado) => ({
  value: estado,
  label: formatEstadoCurso(estado),
}));

const ESTADO_PAGO_META = {
  PENDIENTE: { label: 'Sin pagos', pill: 'cfg-materia-pill--danger' },
  PARCIAL: { label: 'Parcial', pill: 'cfg-materia-pill--warning' },
  PAGADO: { label: 'Pagado', pill: 'cfg-materia-pill--success' },
};

/** Etiqueta legible del estado de pago de la inscripción. */
export const formatEstadoPagoCap = (estadoPago) =>
  ESTADO_PAGO_META[estadoPago]?.label ?? estadoPago ?? '—';

/** Clase completa del StatusPill para el estado de pago de la inscripción. */
export const getEstadoPagoCapPillClass = (estadoPago) =>
  `cfg-materia-pill ${ESTADO_PAGO_META[estadoPago]?.pill ?? 'cfg-materia-pill--default'}`;

/** Saldo pendiente → pill por severidad (saldado = success, debe = danger). */
export const getSaldoCapPillClass = (saldo) =>
  `cfg-materia-pill ${Number(saldo) > 0 ? 'cfg-materia-pill--danger' : 'cfg-materia-pill--success'}`;

/** Curso sin costo asociado (Bs 0): en toda vista se muestra pill "Gratis", no "Bs 0". */
export const esCursoGratuito = (costo) => Number(costo ?? 0) <= 0;

/** Clase del StatusPill "Gratis" (mismo verde que ABIERTO/PAGADO/Saldado). */
export const COSTO_GRATUITO_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--success';
