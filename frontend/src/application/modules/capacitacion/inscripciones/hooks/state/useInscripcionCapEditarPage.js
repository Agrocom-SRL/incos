/**
 * Hook de pantalla: «Editar inscripción» de capacitación (CAP · capacitacion.inscripcion
 * EDITAR, `PUT /:id`), como página propia con el mismo formulario del alta.
 *
 * Regla de negocio: en una inscripción existente SOLO se puede cambiar el GRUPO. El
 * participante y el curso quedan bloqueados (solo lectura): corregir un curso ya cobrado
 * o reemplazar al participante rompería los pagos y el historial. El grupo solo se edita
 * con la inscripción PENDIENTE/INSCRITO y el curso con grupos (`motivoGrupoNoEditable`).
 *
 * Consume el contexto de la ficha (`InscripcionCapacitacionDetailProvider`); carga los
 * grupos del curso de la inscripción, envía únicamente `capacitacionGrupoId` si cambió
 * y, en éxito, vuelve al detalle. Los errores del servidor (409: grupo lleno) quedan
 * visibles en la página.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useInscripcionCapacitacionDetailContext } from '@application-capacitacion/inscripciones/hooks/context/useInscripcionCapacitacionDetailContext';
import { motivoGrupoNoEditable } from '@application-capacitacion/utils/inscripcionGrupos';
import {
  INSCRIPCIONES_CAP_LIST_PATH,
  CAP_INSCRIPCIONES_MENU_KEY,
  inscripcionCapDetallePath,
} from '@application-capacitacion/config/paths';

export const useInscripcionCapEditarPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();

  const {
    inscripcionId,
    inscripcion,
    loading,
    error: fichaError,
    actualizarInscripcion,
    actualizandoInscripcion,
    cursoDetalle,
    loadingCursoDetalle,
    errorCursoDetalle,
    cargarCursoDetalle,
  } = useInscripcionCapacitacionDetailContext();

  // `null` = sin tocar: se muestra el grupo actual de la inscripción.
  const [grupoElegido, setGrupoElegido] = useState(null);
  const [formError, setFormError] = useState(null);
  const cursoSolicitadoRef = useRef(null);

  const returnListPath = location.state?.returnListPath || INSCRIPCIONES_CAP_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? CAP_INSCRIPCIONES_MENU_KEY;
  const detallePath = inscripcionId ? inscripcionCapDetallePath(inscripcionId) : returnListPath;
  const cursoId = inscripcion?.capacitacionId ?? null;

  const grupoId = grupoElegido ?? inscripcion?.capacitacionGrupoId ?? null;

  // Grupos del curso de ESTA inscripción (una carga por curso).
  useEffect(() => {
    if (cursoId == null || cursoSolicitadoRef.current === cursoId) return;
    cursoSolicitadoRef.current = cursoId;
    cargarCursoDetalle(cursoId);
  }, [cursoId, cargarCursoDetalle]);

  const grupos = useMemo(
    () => (cursoDetalle?.id === cursoId ? (cursoDetalle?.grupos ?? []) : []),
    [cursoDetalle, cursoId],
  );
  const grupoMotivoDeshabilitado = useMemo(
    () => (inscripcion && !loadingCursoDetalle ? motivoGrupoNoEditable(inscripcion, grupos) : null),
    [inscripcion, grupos, loadingCursoDetalle],
  );
  const hayCambios = grupoId != null && grupoId !== (inscripcion?.capacitacionGrupoId ?? null);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Capacitación' },
      { title: 'Inscripciones', href: returnListPath },
      { title: 'Detalle de inscripción', href: detallePath },
      { title: 'Editar inscripción' },
    ],
    [returnListPath, detallePath],
  );

  const handleVolver = useCallback(() => {
    navigate(detallePath, { state: { returnListPath, menuSidebarKey } });
  }, [navigate, detallePath, returnListPath, menuSidebarKey]);

  const handleGrupoChange = useCallback((id) => {
    setFormError(null);
    setGrupoElegido(id);
  }, []);

  const handleGuardar = useCallback(async () => {
    setFormError(null);
    if (!hayCambios) {
      notification.info({ title: 'Sin cambios', description: 'No hay cambios que guardar.' });
      handleVolver();
      return;
    }
    const result = await actualizarInscripcion({ capacitacionGrupoId: grupoId });
    if (!result?.success) {
      const msg = result?.error || 'No se pudo cambiar el grupo';
      setFormError(msg);
      notification.error({ title: 'Error al editar la inscripción', description: msg });
      return;
    }
    notification.success({ title: 'Inscripción actualizada', description: 'El grupo se cambió correctamente.' });
    navigate(detallePath, { replace: true, state: { returnListPath, menuSidebarKey } });
  }, [
    hayCambios,
    grupoId,
    actualizarInscripcion,
    notification,
    handleVolver,
    navigate,
    detallePath,
    returnListPath,
    menuSidebarKey,
  ]);

  return {
    inscripcion,
    loading,
    error: formError || fichaError,
    isInvalidInscripcionId: !inscripcionId,
    breadcrumbItems,
    handleVolver,
    handleGuardar,
    guardando: actualizandoInscripcion,
    grupos,
    grupoId,
    handleGrupoChange,
    grupoMotivoDeshabilitado,
    hayCambios,
    loadingGrupos: loadingCursoDetalle,
    errorGrupos: errorCursoDetalle,
  };
};
