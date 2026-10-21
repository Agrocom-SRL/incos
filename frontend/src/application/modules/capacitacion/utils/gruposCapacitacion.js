/**
 * Utilidades puras para la lista de grupos de un curso y sus horarios (editor
 * «Grupos y horarios» del formulario de curso). Cada grupo del formulario:
 * `{ key, id, nombre, cupoMaximo, aulaId, horarios: [{ horarioId }] }`.
 * Reordenar/quitar/actualizar reutilizan `requisitosCapacitacion` (misma
 * mecánica de lista editable).
 */

import { actualizarItem } from '@application-capacitacion/utils/requisitosCapacitacion';

let contadorGrupos = 0;

/**
 * Grupo nuevo vacío con `key` local única para React. `cupoMaximo` arranca con el cupo del
 * curso (paso 1) para no pedirlo grupo por grupo; se edita solo para ampliar o reducir.
 *
 * @param {number|null} [cupoMaximo] cupo por defecto (el del curso)
 */
export const crearGrupoVacio = (cupoMaximo = null) => {
  contadorGrupos += 1;
  return {
    key: `grupo-local-${contadorGrupos}`,
    id: null,
    nombre: '',
    cupoMaximo: cupoMaximo ?? null,
    aulaId: null,
    horarios: [],
  };
};

/**
 * Reconcilia los horarios de un grupo con la selección del modal: conserva los
 * que siguen seleccionados, agrega los nuevos y descarta los desmarcados. El
 * orden sigue al de la selección.
 *
 * @param {Array<{horarioId: number}>} actuales
 * @param {number[]} idsSeleccionados
 */
export const reconciliarHorariosGrupo = (actuales = [], idsSeleccionados = []) =>
  idsSeleccionados.map((id) => {
    const existente = actuales.find((h) => Number(h.horarioId) === Number(id));
    return existente ?? { horarioId: Number(id) };
  });

/** Quita un horario del grupo `index`. */
export const quitarHorarioDeGrupo = (grupos = [], index, horarioId) =>
  actualizarItem(grupos, index, {
    horarios: grupos[index].horarios.filter((h) => Number(h.horarioId) !== Number(horarioId)),
  });

/** ¿Algún grupo sin nombre? (el editor exige nombre en todos). */
export const hayGrupoSinNombre = (grupos = []) =>
  grupos.some((g) => String(g?.nombre ?? '').trim() === '');
