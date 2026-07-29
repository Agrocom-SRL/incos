/**
 * Hook de pantalla: ficha-hub de un proyecto de grado (TUT · DETALLE).
 *
 * Orquesta la ficha sobre el contexto del provider (breadcrumbs, volver,
 * editar) y las acciones de las pestañas:
 *  - cabecera: asignar tutor (T10) y aprobar etapa (T11) — gated por APROBAR
 *  - integrantes: agregar (T12) y retirar/reactivar (T13) — gated por EDITAR
 *  - bitácora: nueva entrada / editar (T15/T16) — permiso bitacora
 *  - avances: descargar (T21) y revisar → entrada REVISION_AVANCE (T15)
 *  - dictámenes: descargar PDF (T23) — gated por EXPORTAR
 * La página es "dumb"; los modales/drawers reciben estas props.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useProyectoGradoDetailContext } from '@application-tutorias/titulacion/hooks/context/useProyectoGradoDetailContext';
import { TRANSICIONES_PROYECTO } from '@application-tutorias/utils/tutoriasPills';
import {
  PROYECTOS_GRADO_LIST_PATH,
  TUT_TITULACION_MENU_KEY,
  proyectoGradoEditarPath,
} from '@application-tutorias/config/paths';

export const useProyectoGradoDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modal, notification } = App.useApp();

  const {
    proyectoId,
    proyecto,
    loading,
    error,
    refetch,
    mutations,
    bitacora,
    avances,
    dictamenes,
    docentesCatalogo,
  } = useProyectoGradoDetailContext();

  const returnListPath = location.state?.returnListPath || PROYECTOS_GRADO_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TUT_TITULACION_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Proyectos de grado', href: returnListPath },
      { title: 'Detalle de proyecto' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!proyectoId) return;
    navigate(proyectoGradoEditarPath(proyectoId), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [navigate, proyectoId, returnListPath, menuSidebarKey]);

  // ————— Asignar tutor (T10) —————
  const [tutorModalOpen, setTutorModalOpen] = useState(false);
  const [asignandoTutor, setAsignandoTutor] = useState(false);

  const handleAsignarTutor = useCallback(
    async (tutorId) => {
      if (!proyectoId || tutorId == null) return;
      setAsignandoTutor(true);
      try {
        const result = await mutations.asignarTutor(proyectoId, tutorId);
        if (result?.success) {
          notification.success({
            title: 'Tutor asignado',
            description:
              'Se registró la designación y se generó el informe oficial para la DDE.',
          });
          setTutorModalOpen(false);
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo asignar el tutor',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setAsignandoTutor(false);
      }
    },
    [proyectoId, mutations, notification, refetch],
  );

  // ————— Aprobar etapa (T11) —————
  const [etapaModalOpen, setEtapaModalOpen] = useState(false);
  const [aprobandoEtapa, setAprobandoEtapa] = useState(false);

  /** Estados destino permitidos desde el estado actual (el backend valida igual). */
  const transicionesDisponibles = useMemo(
    () => TRANSICIONES_PROYECTO[proyecto?.estado] ?? [],
    [proyecto?.estado],
  );

  const handleAprobarEtapa = useCallback(
    async ({ estado, observaciones }) => {
      if (!proyectoId || !estado) return;
      setAprobandoEtapa(true);
      try {
        const result = await mutations.aprobarEtapa(proyectoId, { estado, observaciones });
        if (result?.success) {
          notification.success({
            title: 'Transición registrada',
            description: 'El proyecto avanzó de etapa.',
          });
          setEtapaModalOpen(false);
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo registrar la transición',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setAprobandoEtapa(false);
      }
    },
    [proyectoId, mutations, notification, refetch],
  );

  // ————— Integrantes (T12/T13) —————
  const [integranteModalOpen, setIntegranteModalOpen] = useState(false);
  const [guardandoIntegrante, setGuardandoIntegrante] = useState(false);

  const handleAgregarIntegrante = useCallback(
    async (estudianteId) => {
      if (!proyectoId || estudianteId == null) return;
      setGuardandoIntegrante(true);
      try {
        const result = await mutations.agregarIntegrante(proyectoId, {
          estudianteId,
          rol: 'INTEGRANTE',
        });
        if (result?.success) {
          notification.success({ title: 'Integrante agregado' });
          setIntegranteModalOpen(false);
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo agregar el integrante',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setGuardandoIntegrante(false);
      }
    },
    [proyectoId, mutations, notification, refetch],
  );

  /** Retira (o reincorpora) a un integrante con confirmación. */
  const handleToggleIntegrante = useCallback(
    (integrante) => {
      if (!proyectoId || !integrante?.id) return;
      const retirar = integrante.estado === 'ACTIVO';
      modal.confirm({
        title: retirar ? 'Retirar integrante' : 'Reincorporar integrante',
        content: retirar
          ? `${integrante.nombreCompleto} quedará como retirado del proyecto. ¿Desea continuar?`
          : `${integrante.nombreCompleto} volverá a figurar como integrante activo. ¿Desea continuar?`,
        okText: retirar ? 'Retirar' : 'Reincorporar',
        okType: retirar ? 'danger' : 'primary',
        cancelText: 'Volver',
        onOk: async () => {
          const result = await mutations.actualizarIntegrante(proyectoId, integrante.id, {
            estado: retirar ? 'RETIRADO' : 'ACTIVO',
          });
          if (result?.success) {
            notification.success({
              title: retirar ? 'Integrante retirado' : 'Integrante reincorporado',
            });
            await refetch();
          } else {
            notification.error({
              title: 'No se pudo actualizar el integrante',
              description: result?.error || 'Intente nuevamente en unos instantes.',
            });
          }
        },
      });
    },
    [proyectoId, mutations, modal, notification, refetch],
  );

  // ————— Bitácora (T15/T16) + revisión de avances —————
  /** { open, entrada (edición), avance (REVISION_AVANCE) } */
  const [bitacoraDrawer, setBitacoraDrawer] = useState({ open: false, entrada: null, avance: null });
  const [guardandoBitacora, setGuardandoBitacora] = useState(false);

  const abrirNuevaEntrada = useCallback(
    () => setBitacoraDrawer({ open: true, entrada: null, avance: null }),
    [],
  );
  const abrirEditarEntrada = useCallback(
    (entrada) => setBitacoraDrawer({ open: true, entrada, avance: null }),
    [],
  );
  /** Revisar un avance = nueva entrada REVISION_AVANCE vinculada (T15). */
  const abrirRevisionAvance = useCallback(
    (avance) => setBitacoraDrawer({ open: true, entrada: null, avance }),
    [],
  );
  const cerrarBitacoraDrawer = useCallback(
    () => setBitacoraDrawer({ open: false, entrada: null, avance: null }),
    [],
  );

  const handleGuardarBitacora = useCallback(
    async (payload) => {
      if (!proyectoId) return;
      setGuardandoBitacora(true);
      try {
        const entradaId = bitacoraDrawer.entrada?.id ?? null;
        const result = entradaId
          ? await bitacora.actualizarEntrada(proyectoId, entradaId, payload)
          : await bitacora.crearEntrada(proyectoId, payload);
        if (result?.success) {
          notification.success({
            title: entradaId ? 'Entrada actualizada' : 'Entrada registrada',
            description: 'La bitácora de tutoría fue actualizada.',
          });
          cerrarBitacoraDrawer();
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo guardar la entrada',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setGuardandoBitacora(false);
      }
    },
    [proyectoId, bitacoraDrawer.entrada, bitacora, notification, cerrarBitacoraDrawer, refetch],
  );

  // ————— Avances (T21) y dictámenes (T23) —————
  const handleDescargarAvance = useCallback(
    async (avance) => {
      const result = await avances.descargarArchivo(proyectoId, avance);
      if (!result?.success) {
        notification.error({
          title: 'No se pudo descargar el archivo',
          description: result?.error || 'Intente nuevamente en unos instantes.',
        });
      }
    },
    [proyectoId, avances, notification],
  );

  const handleDescargarDictamen = useCallback(
    async (dictamen) => {
      const result = await dictamenes.descargarDictamen(proyectoId, dictamen);
      if (!result?.success) {
        notification.error({
          title: 'No se pudo descargar el dictamen',
          description: result?.error || 'Intente nuevamente en unos instantes.',
        });
      }
    },
    [proyectoId, dictamenes, notification],
  );

  return {
    proyectoId,
    proyecto,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    // Cabecera (APROBAR)
    tutorModal: {
      open: tutorModalOpen,
      abrir: () => setTutorModalOpen(true),
      cerrar: () => setTutorModalOpen(false),
      submit: handleAsignarTutor,
      saving: asignandoTutor,
      docentes: docentesCatalogo.docentes,
      loadingDocentes: docentesCatalogo.loading,
      docentesDisponible: docentesCatalogo.disponible,
    },
    etapaModal: {
      open: etapaModalOpen,
      abrir: () => setEtapaModalOpen(true),
      cerrar: () => setEtapaModalOpen(false),
      submit: handleAprobarEtapa,
      saving: aprobandoEtapa,
      transiciones: transicionesDisponibles,
    },
    // Integrantes
    integrantes: {
      modalOpen: integranteModalOpen,
      abrirModal: () => setIntegranteModalOpen(true),
      cerrarModal: () => setIntegranteModalOpen(false),
      agregar: handleAgregarIntegrante,
      guardando: guardandoIntegrante,
      toggleEstado: handleToggleIntegrante,
    },
    // Bitácora
    bitacora: {
      entradas: bitacora.entradas,
      loading: bitacora.loading,
      error: bitacora.error,
      drawer: bitacoraDrawer,
      abrirNuevaEntrada,
      abrirEditarEntrada,
      abrirRevisionAvance,
      cerrarDrawer: cerrarBitacoraDrawer,
      guardar: handleGuardarBitacora,
      guardando: guardandoBitacora,
    },
    // Avances
    avances: {
      items: avances.avances,
      loading: avances.loading,
      error: avances.error,
      descargandoId: avances.descargandoId,
      descargar: handleDescargarAvance,
      revisar: abrirRevisionAvance,
    },
    // Dictámenes
    dictamenes: {
      items: dictamenes.dictamenes,
      loading: dictamenes.loading,
      error: dictamenes.error,
      descargandoId: dictamenes.descargandoId,
      descargar: handleDescargarDictamen,
    },
  };
};
