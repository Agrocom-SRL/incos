/**
 * Hook de pantalla: ficha-hub de un trámite de pasantía (TIT · DETALLE).
 *
 * Orquesta la ficha sobre el contexto del provider (breadcrumbs, volver,
 * editar) y las acciones de las pestañas:
 *  - sidebar (línea de tiempo): transición de estado por camino (P6,
 *    pasantia·APROBAR) — reincorporado 2026-08-11
 *  - cabecera: informe de verificación/convalidación — primer paso legal del
 *    trámite (emitir si no existe, descargar si ya fue emitido; P12/P14)
 *  - informes: editar (P13, drawer) y descargar PDF (P14, pasantia·EXPORTAR)
 *  - seguimientos: registrar / editar (P16/P17, drawer)
 * La página es "dumb"; los modales/drawers reciben estas props.
 *
 * Transición SOLICITADA → EN_CURSO/CONVALIDADA (2026-08-11, pedido explícito
 * del usuario): exige que el informe "primer paso legal" ya exista con
 * resultado VIABLE — `transicionModal.transiciones` llega YA FILTRADA sin ese
 * destino mientras falta el informe (mismo gate en `TransicionarPasantiaUseCase`,
 * backend, defensa en profundidad), y `avisoInforme` explica el porqué.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { usePasantiaDetailContext } from '@application-titulacion/pasantias/hooks/context/usePasantiaDetailContext';
import {
  TIPO_INFORME_POR_TIPO_PASANTIA,
  TRANSICIONES_PASANTIA,
  formatEstadoPasantia,
} from '@application-titulacion/utils/pasantiasPills';
import {
  PASANTIAS_LIST_PATH,
  TIT_PASANTIAS_MENU_KEY,
  pasantiaEditarPath,
} from '@application-titulacion/config/paths';

/** Destino "positivo" (autoriza) de la transición desde SOLICITADA, por camino. */
const ESTADO_POSITIVO_POR_TIPO = {
  PASANTIA: 'EN_CURSO',
  CONVALIDACION: 'CONVALIDADA',
};

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
    mutations,
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

  // ————— Transición de estado (P6, reincorporado 2026-08-11) —————
  const [transicionModalOpen, setTransicionModalOpen] = useState(false);
  const [transicionando, setTransicionando] = useState(false);

  const estadoPositivo = ESTADO_POSITIVO_POR_TIPO[pasantia?.tipo];
  const informeEsViable = informeVerificacion?.resultado === 'VIABLE';

  /** Estados destino válidos desde el estado actual, POR CAMINO, sin el destino
   * "positivo" mientras no exista el informe VIABLE (el backend valida igual). */
  const transicionesDisponibles = useMemo(() => {
    const todas = TRANSICIONES_PASANTIA[pasantia?.tipo]?.[pasantia?.estado] ?? [];
    if (informeEsViable || !estadoPositivo) return todas;
    return todas.filter((estado) => estado !== estadoPositivo);
  }, [pasantia?.tipo, pasantia?.estado, informeEsViable, estadoPositivo]);

  /** Explica por qué falta el destino "positivo" mientras no hay informe VIABLE. */
  const avisoInformePendiente = useMemo(() => {
    if (informeEsViable || !estadoPositivo) return null;
    const todas = TRANSICIONES_PASANTIA[pasantia?.tipo]?.[pasantia?.estado] ?? [];
    if (!todas.includes(estadoPositivo)) return null;
    const nombreInforme =
      pasantia?.tipo === 'CONVALIDACION' ? 'informe de convalidación' : 'informe de verificación';
    return `Para autorizar el trámite a «${formatEstadoPasantia(estadoPositivo)}» primero debe emitir el ${nombreInforme} con resultado «Viable».`;
  }, [informeEsViable, estadoPositivo, pasantia?.tipo, pasantia?.estado]);

  const abrirTransicionModal = useCallback(() => setTransicionModalOpen(true), []);
  const cerrarTransicionModal = useCallback(() => setTransicionModalOpen(false), []);

  const handleTransicionar = useCallback(
    async ({ estado, observaciones }) => {
      if (!pasantiaId || !estado) return;
      setTransicionando(true);
      try {
        const result = await mutations.transicionarEstado(pasantiaId, { estado, observaciones });
        if (result?.success) {
          notification.success({
            title: 'Transición registrada',
            description: 'El trámite cambió de estado.',
          });
          setTransicionModalOpen(false);
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo registrar la transición',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setTransicionando(false);
      }
    },
    [pasantiaId, mutations, notification, refetch],
  );

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

  const handleDescargarSeguimiento = useCallback(
    async (seguimiento) => {
      const result = await seguimientos.descargarPdf(pasantiaId, seguimiento);
      if (!result?.success) {
        notification.error({
          title: 'No se pudo descargar el PDF',
          description: result?.error || 'Intente nuevamente en unos instantes.',
        });
      }
    },
    [pasantiaId, seguimientos, notification],
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
    // Sidebar (línea de tiempo): transición de estado por camino (P6)
    transicionModal: {
      open: transicionModalOpen,
      abrir: abrirTransicionModal,
      cerrar: cerrarTransicionModal,
      submit: handleTransicionar,
      saving: transicionando,
      transiciones: transicionesDisponibles,
      avisoInforme: avisoInformePendiente,
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
      descargandoId: seguimientos.descargandoId,
      drawer: seguimientoDrawer,
      abrirNuevo: abrirNuevoSeguimiento,
      abrirEditar: abrirEditarSeguimiento,
      cerrarDrawer: cerrarSeguimientoDrawer,
      guardar: handleGuardarSeguimiento,
      guardando: guardandoSeguimiento,
      descargar: handleDescargarSeguimiento,
    },
  };
};
