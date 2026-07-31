/**
 * Hook de pantalla: bandeja del docente tutor (TUT · "Mis tutorados").
 *
 * Rama docente self del connector (patrón MisEstudiantesDocentePage de
 * Matrícula): SIN provider admin — consume directamente T3 (el backend
 * resuelve el docente por token). Ofrece:
 *  - abrir la ficha del proyecto (bitácora completa),
 *  - registrar una entrada rápida de bitácora (drawer, T15),
 *  - aprobación final (T11 → estado APROBADO; ActionButton gated por
 *    proyecto·APROBAR — fail-closed si el rol no tiene la acción).
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useMisTutoradosApi } from '@application-titulacion/proyectos-grado/hooks/api/useMisTutoradosApi';
import { useBitacoraProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useBitacoraProyectoApi';
import { useProyectoGradoMutations } from '@application-titulacion/proyectos-grado/hooks/api/useProyectoGradoMutations';
import { createMisTutoradosTableColumns } from '@titulacion/proyectos-grado/config/misTutoradosTableColumns';
import {
  PROYECTOS_GRADO_LIST_PATH,
  TUT_TITULACION_MENU_KEY,
  proyectoGradoDetallePath,
} from '@application-titulacion/config/paths';

export const useMisTutoradosPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { modal, notification } = App.useApp();

  const { proyectos, loading, error, refetch } = useMisTutoradosApi();
  const bitacora = useBitacoraProyectoApi();
  const { aprobarEtapa } = useProyectoGradoMutations();

  const [searchText, setSearchText] = useState('');

  const proyectosFiltrados = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return proyectos;
    return proyectos.filter(
      (p) =>
        (p.titulo || '').toLowerCase().includes(q) ||
        (p.integrantesResumen || '').toLowerCase().includes(q) ||
        (p.carreraNombre || '').toLowerCase().includes(q),
    );
  }, [proyectos, searchText]);

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: TUT_TITULACION_MENU_KEY,
      returnListPath: pathname || PROYECTOS_GRADO_LIST_PATH,
    }),
    [pathname],
  );

  const handleVerProyecto = useCallback(
    (proyecto) => {
      navigate(proyectoGradoDetallePath(proyecto.id), { state: listNavState });
    },
    [navigate, listNavState],
  );

  // ————— Entrada rápida de bitácora (drawer, T15) —————
  const [bitacoraDrawer, setBitacoraDrawer] = useState({ open: false, proyecto: null });
  const [guardandoBitacora, setGuardandoBitacora] = useState(false);

  const abrirBitacora = useCallback(
    (proyecto) => setBitacoraDrawer({ open: true, proyecto }),
    [],
  );
  const cerrarBitacora = useCallback(() => setBitacoraDrawer({ open: false, proyecto: null }), []);

  const handleGuardarBitacora = useCallback(
    async (payload) => {
      const proyectoId = bitacoraDrawer.proyecto?.id;
      if (!proyectoId) return;
      setGuardandoBitacora(true);
      try {
        const result = await bitacora.crearEntrada(proyectoId, payload);
        if (result?.success) {
          notification.success({
            title: 'Entrada registrada',
            description: `Bitácora de «${bitacoraDrawer.proyecto.titulo}» actualizada.`,
          });
          cerrarBitacora();
          await refetch();
        } else {
          notification.error({
            title: 'No se pudo registrar la entrada',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setGuardandoBitacora(false);
      }
    },
    [bitacoraDrawer.proyecto, bitacora, notification, cerrarBitacora, refetch],
  );

  // ————— Aprobación final (T11 → APROBADO) —————
  const [aprobandoId, setAprobandoId] = useState(null);

  const handleAprobacionFinal = useCallback(
    (proyecto) => {
      modal.confirm({
        title: 'Aprobación final del proyecto',
        content:
          `Se registrará la aprobación final de «${proyecto.titulo}» y se emitirá el informe ` +
          'de viabilidad técnica. Esta acción no se puede deshacer. ¿Desea continuar?',
        okText: 'Aprobar proyecto',
        cancelText: 'Volver',
        onOk: async () => {
          setAprobandoId(proyecto.id);
          try {
            const result = await aprobarEtapa(proyecto.id, { estado: 'APROBADO' });
            if (result?.success) {
              notification.success({
                title: 'Proyecto aprobado',
                description: 'Se emitió el informe de viabilidad técnica.',
              });
              await refetch();
            } else {
              notification.error({
                title: 'No se pudo aprobar el proyecto',
                description: result?.error || 'Intente nuevamente en unos instantes.',
              });
            }
          } finally {
            setAprobandoId(null);
          }
        },
      });
    },
    [modal, aprobarEtapa, notification, refetch],
  );

  const tableColumns = useMemo(
    () =>
      createMisTutoradosTableColumns({
        onVerProyecto: handleVerProyecto,
        onRegistrarBitacora: abrirBitacora,
        onAprobacionFinal: handleAprobacionFinal,
        aprobandoId,
      }),
    [handleVerProyecto, abrirBitacora, handleAprobacionFinal, aprobandoId],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Titulación' }, { title: 'Mis tutorados' }],
    [],
  );

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  return {
    proyectos: proyectosFiltrados,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    bitacoraDrawer,
    cerrarBitacora,
    handleGuardarBitacora,
    guardandoBitacora,
  };
};
