/**
 * Hook de pantalla: seguimiento de tutorías a docentes (TIT ·
 * `proyecto·LISTAR`/`EXPORTAR`, extensión 2026-08-10 — reemplaza la planilla
 * de avance "10 en 10" de 3er año).
 *
 * Consume el contexto del provider (filtros docente/carrera/periodo + reporte
 * + exportación) y arma breadcrumb/opciones/handlers. Los 3 filtros son
 * OPCIONALES: la pantalla carga siempre, con los defaults que resuelva el
 * servidor (mes/año actual) — a diferencia de la planilla retirada, que
 * exigía carrera + bimestre antes de consultar.
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useSeguimientoTutoriaDocentesContext } from '@application-titulacion/proyectos-grado/hooks/context/useSeguimientoTutoriaDocentesContext';
import { PROYECTOS_GRADO_LIST_PATH } from '@application-titulacion/config/paths';

export const useSeguimientoTutoriaDocentesPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { message } = App.useApp();
  const {
    seguimiento,
    loading,
    error,
    exportar,
    exportando,
    carreras,
    loadingCarreras,
    docentes,
    loadingDocentes,
    docenteId,
    setDocenteId,
    carreraId,
    setCarreraId,
    periodo,
    setPeriodo,
  } = useSeguimientoTutoriaDocentesContext();

  const carreraOptions = useMemo(
    () => carreras.map((c) => ({ value: c.id, label: c.nombre })),
    [carreras],
  );

  const anio = periodo ? periodo.year() : undefined;
  const mes = periodo ? periodo.month() + 1 : undefined;

  const handleExportar = useCallback(async () => {
    const result = await exportar({ docenteId, carreraId, anio, mes });
    if (!result?.success) {
      message.error(result?.error || 'No se pudo exportar el seguimiento de tutorías a docentes');
    }
  }, [exportar, docenteId, carreraId, anio, mes, message]);

  const handleVolver = useCallback(() => {
    navigate(state?.returnListPath || PROYECTOS_GRADO_LIST_PATH);
  }, [navigate, state]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Proyectos de grado', href: PROYECTOS_GRADO_LIST_PATH },
      { title: 'Seguimiento de tutorías a docentes' },
    ],
    [],
  );

  return {
    seguimiento,
    loading,
    error,
    handleExportar,
    exportando,
    handleVolver,
    breadcrumbItems,
    carreraOptions,
    loadingCarreras,
    docentes,
    loadingDocentes,
    docenteId,
    setDocenteId,
    carreraId,
    setCarreraId,
    periodo,
    setPeriodo,
  };
};

export default useSeguimientoTutoriaDocentesPage;
