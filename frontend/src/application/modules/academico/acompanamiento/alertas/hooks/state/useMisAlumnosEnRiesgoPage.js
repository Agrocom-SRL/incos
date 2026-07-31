/**
 * Hook de pantalla: "Mis alumnos en riesgo" — rama docente (TUT · A2).
 *
 * Rama docente self del connector (SIN provider admin): consume A2 (el
 * backend resuelve el docente por token), filtra por materia en cliente y
 * ofrece la acción "Programar sesión" que navega al formulario de sesiones
 * con el alumno preseleccionado.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMisAlumnosEnRiesgoApi } from '@application-academico/acompanamiento/alertas/hooks/api/useMisAlumnosEnRiesgoApi';
import { createMisAlumnosEnRiesgoTableColumns } from '@academico/acompanamiento/alertas/config/misAlumnosEnRiesgoTableColumns';
import {
  ALERTAS_RIESGO_LIST_PATH,
  TUT_ALERTAS_MENU_KEY,
  sesionProgramarPath,
} from '@application-academico/acompanamiento/config/paths';

export const useMisAlumnosEnRiesgoPage = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { alertas, loading, error, refetch } = useMisAlumnosEnRiesgoApi();

  const [materiaId, setMateriaId] = useState(null);
  const [searchText, setSearchText] = useState('');

  const alertasFiltradas = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return alertas.filter(
      (a) =>
        (materiaId == null || a.materiaId === materiaId) &&
        (!q || (a.estudianteNombre || '').toLowerCase().includes(q)),
    );
  }, [alertas, materiaId, searchText]);

  const materiaOptions = useMemo(() => {
    const porId = new Map();
    for (const a of alertas) {
      if (a.materiaId != null && !porId.has(a.materiaId)) {
        porId.set(a.materiaId, { value: a.materiaId, label: a.materiaNombre });
      }
    }
    return Array.from(porId.values()).sort((a, b) => (a.label || '').localeCompare(b.label, 'es'));
  }, [alertas]);

  /** Programar sesión con el alumno (y su curso) preseleccionados. */
  const handleProgramarSesion = useCallback(
    (alerta) => {
      navigate(sesionProgramarPath, {
        state: {
          menuSidebarKey: TUT_ALERTAS_MENU_KEY,
          returnListPath: pathname || ALERTAS_RIESGO_LIST_PATH,
          alertaPreseleccionada: {
            matriculaMateriaId: alerta.matriculaMateriaId,
            asignacionDocenteId: alerta.asignacionDocenteId,
            materiaId: alerta.materiaId,
          },
        },
      });
    },
    [navigate, pathname],
  );

  const tableColumns = useMemo(
    () => createMisAlumnosEnRiesgoTableColumns({ onProgramarSesion: handleProgramarSesion }),
    [handleProgramarSesion],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Académico' }, { title: 'Mis alumnos en riesgo' }],
    [],
  );

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  return {
    alertas: alertasFiltradas,
    loading,
    error,
    refetch,
    searchText,
    handleSearchChange,
    materiaId,
    setMateriaId,
    materiaOptions,
    tableColumns,
    breadcrumbItems,
  };
};
