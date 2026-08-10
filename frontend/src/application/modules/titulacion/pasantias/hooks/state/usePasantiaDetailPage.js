/**
 * Hook de pantalla: ficha-hub de un trámite de pasantía (TIT · DETALLE).
 *
 * Orquesta la ficha sobre el contexto del provider (breadcrumbs, volver,
 * editar) y las acciones de las pestañas:
 *  - cabecera: informe de verificación/convalidación — primer paso legal del
 *    trámite (emitir si no existe, descargar si ya fue emitido; P12/P14)
 *  - informes: emitir / editar (P12/P13, drawer) y descargar PDF (P14,
 *    pasantia·EXPORTAR)
 *  - seguimientos: registrar / editar (P16/P17, drawer)
 * La página es "dumb"; los modales/drawers reciben estas props.
 *
 * NOTA (2026-08-09): se retiró la transición de estado manual (P6, modal +
 * botón "Transición de estado") de esta ficha — la máquina de estados se
 * gobernará de otra forma (por definir). El endpoint y `mutations.
 * transicionarEstado` siguen intactos en el backend/mutations por si el
 * nuevo mecanismo los reutiliza; `PasantiaTimeline` (línea de tiempo,
 * solo lectura) tampoco se toca.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { usePasantiaDetailContext } from '@application-titulacion/pasantias/hooks/context/usePasantiaDetailContext';
import { TIPO_INFORME_POR_TIPO_PASANTIA } from '@application-titulacion/utils/pasantiasPills';
import {
  PASANTIAS_LIST_PATH,
  TIT_PASANTIAS_MENU_KEY,
  pasantiaEditarPath,
} from '@application-titulacion/config/paths';

export const usePasantiaDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();

  const {
    pasantiaId,
    pasantia,
    loading,
    error,
    refetch,
    informes,
    seguimientos,
  } = usePasantiaDetailContext();

  const returnListPath = location.state?.returnListPath || PASANTIAS_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TIT_PASANTIAS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Pasantías', href: returnListPath },
      { title: 'Detalle del trámite' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!pasantiaId) return;
    navigate(pasantiaEditarPath(pasantiaId), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [navigate, pasantiaId, returnListPath, menuSidebarKey]);

  // ————— Informes (P12/P13 drawer + P14 descarga) —————
  /** { open, informe (edición) } */
  const [informeDrawer, setInformeDrawer] = useState({ open: false, informe: null });
  const [guardandoInforme, setGuardandoInforme] = useState(false);

  const abrirNuevoInforme = useCallback(() => setInformeDrawer({ open: true, informe: null }), []);
  const abrirEditarInforme = useCallback(
    (informe) => setInformeDrawer({ open: true, informe }),
    [],
  );
  const cerrarInformeDrawer = useCallback(() => setInformeDrawer({ open: false, informe: null }), []);

  const handleGuardarInforme = useCallback(
    async (payload) => {
      if (!pasantiaId) return;
      setGuardandoInforme(true);
      try {
        const informeId = informeDrawer.informe?.id ?? null;
        const result = await informes.guardarInforme(pasantiaId, informeId, payload);
        if (result?.success) {
          notification.success({
            title: informeId ? 'Informe actualizado' : 'Informe emitido',
            description: 'El PDF institucional del informe fue generado.',
          });
          cerrarInformeDrawer();
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo guardar el informe',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setGuardandoInforme(false);
      }
    },
    [pasantiaId, informeDrawer.informe, informes, notification, cerrarInformeDrawer, refetch],
  );

  const handleDescargarInforme = useCallback(
    async (informe) => {
      const result = await informes.descargarPdf(pasantiaId, informe);
      if (!result?.success) {
        notification.error({
          title: 'No se pudo descargar el PDF',
          description: result?.error || 'Intente nuevamente en unos instantes.',
        });
      }
    },
    [pasantiaId, informes, notification],
  );

  /** Tipo de informe "primer paso legal" según el camino del trámite. */
  const tipoInformeEsperado =
    TIPO_INFORME_POR_TIPO_PASANTIA[pasantia?.tipo] ?? 'VERIFICACION_EMPRESA';

  /** Ya emitido para este trámite, si existe (cabecera: emitir vs. descargar). */
  const informeVerificacion = useMemo(
    () => informes.informes.find((i) => i.tipo === tipoInformeEsperado) ?? null,
    [informes.informes, tipoInformeEsperado],
  );

  const handleDescargarInformeVerificacion = useCallback(() => {
    if (informeVerificacion) handleDescargarInforme(informeVerificacion);
  }, [informeVerificacion, handleDescargarInforme]);

  // ————— Seguimientos (P16/P17 drawer) —————
  /** { open, seguimiento (edición) } */
  const [seguimientoDrawer, setSeguimientoDrawer] = useState({ open: false, seguimiento: null });
  const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false);

  const abrirNuevoSeguimiento = useCallback(
    () => setSeguimientoDrawer({ open: true, seguimiento: null }),
    [],
  );
  const abrirEditarSeguimiento = useCallback(
    (seguimiento) => setSeguimientoDrawer({ open: true, seguimiento }),
    [],
  );
  const cerrarSeguimientoDrawer = useCallback(
    () => setSeguimientoDrawer({ open: false, seguimiento: null }),
    [],
  );

  const handleGuardarSeguimiento = useCallback(
    async (payload) => {
      if (!pasantiaId) return;
      setGuardandoSeguimiento(true);
      try {
        const seguimientoId = seguimientoDrawer.seguimiento?.id ?? null;
        const result = await seguimientos.guardarSeguimiento(pasantiaId, seguimientoId, payload);
        if (result?.success) {
          notification.success({
            title: seguimientoId ? 'Seguimiento actualizado' : 'Seguimiento registrado',
            description: 'La hoja de seguimiento del trámite fue actualizada.',
          });
          cerrarSeguimientoDrawer();
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo guardar el seguimiento',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setGuardandoSeguimiento(false);
      }
    },
    [
      pasantiaId,
      seguimientoDrawer.seguimiento,
      seguimientos,
      notification,
      cerrarSeguimientoDrawer,
      refetch,
    ],
  );

  return {
    pasantiaId,
    pasantia,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    // Cabecera: informe de verificación/convalidación (primer paso legal)
    informeVerificacion: {
      informe: informeVerificacion,
      descargando: informeVerificacion ? informes.descargandoId === informeVerificacion.id : false,
      onEmitir: abrirNuevoInforme,
      onDescargar: handleDescargarInformeVerificacion,
    },
    // Informes
    informes: {
      items: informes.informes,
      loading: informes.loading,
      error: informes.error,
      descargandoId: informes.descargandoId,
      drawer: informeDrawer,
      abrirNuevo: abrirNuevoInforme,
      abrirEditar: abrirEditarInforme,
      cerrarDrawer: cerrarInformeDrawer,
      guardar: handleGuardarInforme,
      guardando: guardandoInforme,
      descargar: handleDescargarInforme,
    },
    // Seguimientos
    seguimientos: {
      items: seguimientos.seguimientos,
      loading: seguimientos.loading,
      error: seguimientos.error,
      drawer: seguimientoDrawer,
      abrirNuevo: abrirNuevoSeguimiento,
      abrirEditar: abrirEditarSeguimiento,
      cerrarDrawer: cerrarSeguimientoDrawer,
      guardar: handleGuardarSeguimiento,
      guardando: guardandoSeguimiento,
    },
  };
};
