/**
 * Hook de pantalla: marcar requisitos entregados desde el listado de inscripciones
 * (CAP · capacitacion.inscripcion EDITAR), sin entrar a «Editar inscripción».
 *
 * Al abrir (`inscripcionId` != null) carga la ficha (el listado no trae el checklist),
 * edita un borrador local y guarda con `PUT /:id/requisitos` (el backend recalcula el
 * estado: PENDIENTE → INSCRITO si ya no falta nada). `onGuardado` refresca el listado.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import dayjs from 'dayjs';
import { useGetInscripcionCapacitacion } from '@application-capacitacion/inscripciones/hooks/api/useGetInscripcionCapacitacion';
import { useInscripcionCapacitacionMutations } from '@application-capacitacion/inscripciones/hooks/api/useInscripcionCapacitacionMutations';
import { mapRequisitosToPayload } from '@application-capacitacion/inscripciones/mappers/inscripcionCapacitacionMapper';
import {
  alternarEntregado,
  hayCambiosRequisitos,
} from '@application-capacitacion/utils/requisitosCapacitacion';
import { calcularPendientesInscripcion } from '@application-capacitacion/utils/inscripcionPendientes';

export const useInscripcionRequisitosRapido = ({ inscripcionId = null, onGuardado, onCerrar }) => {
  const { message } = App.useApp();
  const { inscripcion, loading, error, cargar } = useGetInscripcionCapacitacion();
  const { actualizarRequisitos, guardandoRequisitos } = useInscripcionCapacitacionMutations();

  // Borrador atado a la inscripción abierta: al cambiar de id deja de aplicar (sin reset en efecto).
  const [borrador, setBorrador] = useState(null);
  const requisitosEditados = borrador?.inscripcionId === inscripcionId ? borrador.requisitos : null;

  useEffect(() => {
    if (inscripcionId != null) cargar(inscripcionId);
  }, [inscripcionId, cargar]);

  const abierto = inscripcionId != null;
  // Evita mostrar la ficha de la inscripción anterior mientras carga la nueva.
  const ficha = abierto && inscripcion?.id === inscripcionId ? inscripcion : null;

  const requisitos = useMemo(
    () => requisitosEditados ?? ficha?.requisitos ?? [],
    [requisitosEditados, ficha?.requisitos],
  );
  const hayCambios = useMemo(
    () => hayCambiosRequisitos(ficha?.requisitos, requisitosEditados ?? []),
    [ficha?.requisitos, requisitosEditados],
  );
  /** Qué falta para INSCRITO con el estado persistido (informativo). */
  const pendientes = useMemo(() => calcularPendientesInscripcion(ficha), [ficha]);

  const handleToggle = useCallback(
    (requisitoId, entregado) => {
      setBorrador((prev) => ({
        inscripcionId,
        requisitos: alternarEntregado(
          (prev?.inscripcionId === inscripcionId ? prev.requisitos : null) ?? ficha?.requisitos ?? [],
          requisitoId,
          entregado,
          dayjs().format('YYYY-MM-DD'),
        ),
      }));
    },
    [inscripcionId, ficha?.requisitos],
  );

  const handleGuardar = useCallback(async () => {
    const result = await actualizarRequisitos(inscripcionId, mapRequisitosToPayload(requisitos));
    if (!result?.success) {
      message.error(result?.error || 'No se pudieron guardar los requisitos');
      return;
    }
    message.success('Requisitos actualizados');
    onGuardado?.();
    onCerrar?.();
  }, [actualizarRequisitos, inscripcionId, requisitos, message, onGuardado, onCerrar]);

  return {
    abierto,
    ficha,
    requisitos,
    loading,
    error,
    hayCambios,
    pendientes,
    guardando: guardandoRequisitos,
    handleToggle,
    handleGuardar,
  };
};
