/**
 * Estado de activación del cursado en la ficha de matrícula.
 *
 * El estado de cursado se deriva de las materias (`subjectEnrollments[].status`),
 * que es la fuente de verdad: no hay un estado a nivel de inscripción.
 */

import { useCallback, useMemo } from 'react';
import { App } from 'antd';
import { useActivarCursadoInscripcion } from '../../api/useActivarCursadoInscripcion';

export const useMatriculaDetailActivation = ({
  inscripcionId,
  subjectEnrollments = [],
  refetch,
}) => {
  const { modal, message } = App.useApp();
  const { activarCursado, activating } = useActivarCursadoInscripcion();

  const puedeActivar = useMemo(
    () => (subjectEnrollments || []).some((m) => String(m?.status).toUpperCase() === 'INSCRITO'),
    [subjectEnrollments],
  );

  const estadoCursado = useMemo(() => {
    const list = subjectEnrollments || [];
    if (list.length === 0) return null;
    const enCursado = list.some((m) =>
      ['CURSANDO', 'APROBADO', 'REPROBADO'].includes(String(m?.status).toUpperCase()),
    );
    return enCursado ? 'CURSANDO' : 'INSCRITO';
  }, [subjectEnrollments]);

  const handleActivarCursado = useCallback(() => {
    if (!inscripcionId || !puedeActivar) return;

    modal.confirm({
      title: 'Activar cursado del estudiante',
      content:
        'Las materias inscritas pasarán al estado «Cursando» y se abrirán sus bimestres. ' +
        'El estudiante podrá ver su horario y registrar calificaciones. ¿Desea continuar?',
      okText: 'Activar cursado',
      cancelText: 'Cancelar',
      onOk: async () => {
        const result = await activarCursado(inscripcionId);
        if (result.success) {
          message.success('Cursado activado. Las materias están en curso.');
          if (typeof refetch === 'function') await refetch();
        } else {
          message.error(result.error || 'No se pudo activar el cursado.');
        }
      },
    });
  }, [inscripcionId, puedeActivar, modal, message, activarCursado, refetch]);

  return { estadoCursado, puedeActivar, activating, handleActivarCursado };
};
