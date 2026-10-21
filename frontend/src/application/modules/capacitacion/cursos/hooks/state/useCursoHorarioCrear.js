/**
 * Hook de pantalla: alta de un horario desde el grupo del formulario de curso (CAP).
 *
 * Los horarios existentes se eligen con casillas dentro de cada grupo; solo cuando falta
 * el horario necesario se abre el modal «Crear horario» (día + hora inicio + hora fin; el
 * código interno lo genera el backend). Al crearlo queda marcado en el grupo desde el que
 * se abrió el modal. La lista de grupos vive en el Form (`grupos`); aquí solo el estado
 * transitorio del modal.
 */

import { useCallback, useState } from 'react';
import { reconciliarHorariosGrupo } from '@application-capacitacion/utils/gruposCapacitacion';
import { actualizarItem } from '@application-capacitacion/utils/requisitosCapacitacion';
import { validarHorarioNuevo } from '@application-capacitacion/utils/horarioCapacitacion';

/**
 * @param {Object} params
 * @param {Object} params.form - instancia de AntD Form del curso
 * @param {Function} params.crearHorario - ({dia, horaInicio, horaFin}) => {success, data|error}
 */
export const useCursoHorarioCrear = ({ form, crearHorario }) => {
  const [grupoIndex, setGrupoIndex] = useState(null);
  const [errorCrear, setErrorCrear] = useState(null);

  const abrirCrear = useCallback((index) => {
    setErrorCrear(null);
    setGrupoIndex(index);
  }, []);

  const cerrarCrear = useCallback(() => setGrupoIndex(null), []);

  /** Crea el horario y lo marca en el grupo de origen; devuelve `{success}` para limpiar el modal. */
  const handleCrearHorario = useCallback(
    async (values) => {
      setErrorCrear(null);
      const mensaje = validarHorarioNuevo(values);
      if (mensaje) {
        setErrorCrear(mensaje);
        return { success: false, error: mensaje };
      }
      const result = await crearHorario(values);
      if (!result?.success) {
        setErrorCrear(result?.error || 'No se pudo crear el horario');
        return result;
      }
      const grupos = form.getFieldValue('grupos') ?? [];
      const grupo = grupos[grupoIndex];
      if (grupo) {
        const ids = [...(grupo.horarios ?? []).map((h) => Number(h.horarioId)), Number(result.data.horarioId)];
        const horarios = reconciliarHorariosGrupo(grupo.horarios, [...new Set(ids)]);
        form.setFieldsValue({ grupos: actualizarItem(grupos, grupoIndex, { horarios }) });
      }
      setGrupoIndex(null);
      return result;
    },
    [form, crearHorario, grupoIndex],
  );

  return { crearOpen: grupoIndex !== null, errorCrear, abrirCrear, cerrarCrear, handleCrearHorario };
};
