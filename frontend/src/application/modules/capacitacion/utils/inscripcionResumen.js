/**
 * Datos del resumen de cierre de «Inscribir participante» (CAP): reglas puras
 * (sin React) que arman lo que lee `InscripcionCapSeleccionResumen`.
 *
 * Solo lectura de lo elegido en los pasos anteriores; el payload que viaja al
 * backend lo sigue armando `buildInscripcionPayload`.
 */

import { buildCompleteCI, buildFullName } from '@application/utils/formatters';

/** Modos del paso participante (espejo de `MODO_PARTICIPANTE` del hook, sin importarlo). */
const MODO_NUEVO = 'nuevo';

const limpiar = (valor) => {
  const texto = valor == null ? '' : String(valor).trim();
  return texto === '' ? null : texto;
};

/**
 * Participante a mostrar en el resumen: el elegido en la búsqueda o, en modo
 * «nuevo», el que se está tipeando en el formulario (valores del `Form`).
 *
 * @param {Object} params
 * @param {string} params.modoParticipante - 'existente' | 'nuevo'
 * @param {Object|null} params.participanteSeleccionado - DTO del mapper de participantes
 * @param {Object} [params.values] - valores del Form (`getFieldsValue(true)`)
 * @returns {{nombreCompleto: string|null, ciCompleto: string|null, esNuevo: boolean}|null}
 */
export const buildParticipanteResumen = ({
  modoParticipante,
  participanteSeleccionado,
  values = {},
}) => {
  if (modoParticipante === MODO_NUEVO) {
    const nombres = limpiar(values.nombres);
    const ci = limpiar(values.ci);
    if (!nombres && !ci) return null;
    return {
      nombreCompleto: nombres
        ? buildFullName(nombres, limpiar(values.apellidoPaterno), limpiar(values.apellidoMaterno), null)
        : null,
      ciCompleto: ci ? buildCompleteCI(ci, limpiar(values.expedicion)?.toUpperCase() ?? null) : null,
      esNuevo: true,
    };
  }
  if (!participanteSeleccionado?.id) return null;
  return {
    nombreCompleto: participanteSeleccionado.nombreCompleto ?? null,
    ciCompleto: participanteSeleccionado.ciCompleto ?? null,
    esNuevo: false,
  };
};

/**
 * Estado del costo del curso EXTERNO al inscribir (curso con entidad
 * certificadora, el costo se deposita a la entidad): se acredita si el
 * requisito `acreditaPagoCurso` se marca como entregado. Usa los mismos valores
 * de `estadoPagoCurso` que la ficha (CANCELADO = pagado, PARCIAL = pendiente).
 *
 * @returns {'CANCELADO'|'PARCIAL'|null} `null` si el curso no es externo
 */
export const resolverEstadoPagoCursoExterno = (curso, requisitos = [], entregadosIds = []) => {
  if (!curso?.pagoCursoExterno) return null;
  const acreditador = requisitos.find((r) => r.acreditaPagoCurso);
  return acreditador && entregadosIds.includes(acreditador.id) ? 'CANCELADO' : 'PARCIAL';
};

/**
 * Separa los requisitos del curso en entregados / pendientes según el
 * checklist del paso «Grupo y requisitos».
 *
 * @param {Array<{id: number, obligatorio: boolean}>} requisitos
 * @param {number[]} entregadosIds
 * @returns {{entregados: Array, pendientes: Array, obligatoriosPendientes: number}}
 */
export const splitRequisitosResumen = (requisitos = [], entregadosIds = []) => {
  const entregados = requisitos.filter((r) => entregadosIds.includes(r.id));
  const pendientes = requisitos.filter((r) => !entregadosIds.includes(r.id));
  return {
    entregados,
    pendientes,
    obligatoriosPendientes: pendientes.filter((r) => r.obligatorio).length,
  };
};
