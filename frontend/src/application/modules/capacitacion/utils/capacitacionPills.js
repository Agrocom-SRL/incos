/**
 * Estados del dominio Capacitación → etiqueta legible + clase de StatusPill.
 *
 * Mismo enfoque que `pagosPills` de Finanzas, pero sobre las clases GLOBALES
 * `cfg-materia-pill--*` (styles/components/atoms/table-cells.css) — sin CSS
 * propio del módulo. Tres vocabularios:
 *   - estado del CURSO (ENUM capacitaciones.estado)
 *   - estado de la INSCRIPCIÓN (ENUM capacitacion_inscritos.estado — 4
 *     valores: PENDIENTE/INSCRITO/RETIRADO/ANULADO)
 *   - estado de PAGO de la inscripción (PERSISTIDO, no derivado —
 *     PARCIAL/CANCELADO según total pagado vs `monto_obligatorio`; nunca
 *     existe "sin pagos": toda inscripción con costo nace con el pago inicial)
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

/**
 * Estado de pago (2 valores persistidos, ver `capacitacion.constants.js`
 * ESTADOS_PAGO_INSCRITO_CAPACITACION del backend). Ya no existe "PENDIENTE"
 * como estado de pago (ese caso no puede ocurrir: toda inscripción con costo
 * nace con al menos el pago inicial) — no confundir con `estado` de la
 * inscripción, que sí tiene un valor PENDIENTE (ver `ESTADO_INSCRIPCION_META`).
 */
const ESTADO_PAGO_META = {
  PARCIAL: { label: 'Parcial', pill: 'cfg-materia-pill--warning' },
  CANCELADO: { label: 'Cancelado', pill: 'cfg-materia-pill--success' },
};

/** Etiqueta legible del estado de pago de la inscripción. */
export const formatEstadoPagoCap = (estadoPago) =>
  ESTADO_PAGO_META[estadoPago]?.label ?? estadoPago ?? '—';

/** Clase completa del StatusPill para el estado de pago de la inscripción. */
export const getEstadoPagoCapPillClass = (estadoPago) =>
  `cfg-materia-pill ${ESTADO_PAGO_META[estadoPago]?.pill ?? 'cfg-materia-pill--default'}`;

/** ENUM del backend (capacitacion.constants.js ESTADOS_INSCRIPCION_CAPACITACION). */
export const ESTADOS_INSCRIPCION_CAP = ['PENDIENTE', 'INSCRITO', 'RETIRADO', 'ANULADO'];

/**
 * Estado de la INSCRIPCIÓN (4 valores, no confundir con el estado de pago):
 * PENDIENTE = falta saldar el monto obligatorio o entregar requisitos (por eso
 * se rotula solo «Pendiente», no «Pendiente de pago») | INSCRITO = monto
 * obligatorio cancelado y requisitos entregados | RETIRADO = se retiró estando inscrito
 * (decisión del participante) | ANULADO = decisión administrativa manual
 * (nunca automática por incumplir el compromiso de pago).
 *
 * Colores: RETIRADO usa el mismo gris "inactiva" que un catálogo desactivado
 * (es una baja voluntaria, no una falta). ANULADO usa rojo/danger, igual que
 * CANCELADO de curso (`CURSO_ESTADO_META`): es una decisión administrativa
 * que además deja constancia de que el monto pagado no se devuelve — amerita
 * la misma severidad visual que un curso cancelado, no un simple "inactivo".
 */
const ESTADO_INSCRIPCION_META = {
  PENDIENTE: { label: 'Pendiente', pill: 'cfg-materia-pill--warning' },
  INSCRITO: { label: 'Inscrito', pill: 'cfg-materia-pill--success' },
  RETIRADO: { label: 'Retirado', pill: 'cfg-materia-pill--inactiva' },
  ANULADO: { label: 'Anulado', pill: 'cfg-materia-pill--danger' },
};

/** Etiqueta legible del estado de la inscripción. */
export const formatEstadoInscripcionCap = (estado) =>
  ESTADO_INSCRIPCION_META[estado]?.label ?? estado ?? '—';

/** Clase completa del StatusPill para el estado de la inscripción. */
export const getEstadoInscripcionCapPillClass = (estado) =>
  `cfg-materia-pill ${ESTADO_INSCRIPCION_META[estado]?.pill ?? 'cfg-materia-pill--default'}`;

/** Estados de inscripción desde los que se puede registrar un pago o anular. */
export const ESTADOS_INSCRIPCION_CAP_VIGENTES = ['PENDIENTE', 'INSCRITO'];

/** Saldo pendiente → pill por severidad (saldado = success, debe = danger). */
export const getSaldoCapPillClass = (saldo) =>
  `cfg-materia-pill ${Number(saldo) > 0 ? 'cfg-materia-pill--danger' : 'cfg-materia-pill--success'}`;

/** Curso sin costo asociado (Bs 0): en toda vista se muestra pill "Gratis", no "Bs 0". */
export const esCursoGratuito = (costo) => Number(costo ?? 0) <= 0;

/** Clase del StatusPill "Gratis" (mismo verde que ABIERTO/CANCELADO/Saldado). */
export const COSTO_GRATUITO_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--success';

/**
 * Costo del curso EXTERNO (curso con entidad certificadora): el instituto no lo
 * cobra, se deposita a la entidad. Se reutilizan los valores del enum de
 * `estadoPagoCurso`: CANCELADO = pagado a la entidad (requisito de depósito
 * entregado) | cualquier otro (PARCIAL) = pendiente de acreditar con depósito.
 */
export const esCursoExternoPagado = (estadoPagoCurso) => estadoPagoCurso === 'CANCELADO';

/** Etiqueta del costo del curso externo según su estado de acreditación. */
export const formatEstadoCursoExterno = (estadoPagoCurso) =>
  esCursoExternoPagado(estadoPagoCurso)
    ? 'Pagado a la entidad'
    : 'Pendiente de acreditar con depósito';

/** Clase del StatusPill del costo del curso externo (pagado = success, pendiente = warning). */
export const getEstadoCursoExternoPillClass = (estadoPagoCurso) =>
  `cfg-materia-pill ${esCursoExternoPagado(estadoPagoCurso) ? 'cfg-materia-pill--success' : 'cfg-materia-pill--warning'}`;

/** Pill «Anulado» de un pago anulado (conservado como historial). */
export const PAGO_ANULADO_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--danger';

/** Pill «Acredita pago del curso» del requisito que prueba el depósito a la entidad. */
export const REQUISITO_ACREDITA_PILL_CLASS = 'cfg-materia-pill cfg-materia-pill--info';

/** Nota breve del formulario de pago cuando el curso se paga a la entidad. */
export const NOTA_CURSO_EXTERNO = 'El costo del curso se deposita a la entidad certificadora.';

/** Ayuda del requisito que acredita el depósito del curso. */
export const AYUDA_REQUISITO_ACREDITA =
  'Al entregarlo, el costo del curso queda acreditado como pagado a la entidad certificadora.';
