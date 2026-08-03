/**
 * Hook de pantalla: ficha de seguimiento en clase (DOC ·
 * docentes.supervision.ficha·DETALLE).
 *
 * Orquesta la navegación (volver, editar) y la exportación a PDF (S6,
 * EXPORTAR); la carga y el estado viven en el provider/contexto.
 */

import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { useFichaSeguimientoDetailContext } from '@application-docentes/supervision/hooks/context/useFichaSeguimientoDetailContext';
import {
  SUPERVISION_LIST_PATH,
  DOC_SUPERVISION_MENU_KEY,
  fichaSeguimientoEditarPath,
} from '@application-docentes/supervision/config/paths';

export const useFichaSeguimientoDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();

  const { fichaId, ficha, loading, error, descargandoPdf, exportarPdf } =
    useFichaSeguimientoDetailContext();

  const returnListPath = location.state?.returnListPath || SUPERVISION_LIST_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? DOC_SUPERVISION_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes' },
      { title: 'Supervisión docente', href: returnListPath },
      { title: 'Ficha de seguimiento' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!fichaId) return;
    navigate(fichaSeguimientoEditarPath(fichaId), { state: { returnListPath, menuSidebarKey } });
  }, [navigate, fichaId, returnListPath, menuSidebarKey]);

  const handleExportarPdf = useCallback(async () => {
    if (!fichaId) return;
    const result = await exportarPdf(fichaId);
    if (result?.success) {
      notification.success({ title: 'PDF generado', description: 'Se descargó la ficha de seguimiento.' });
    } else {
      notification.error({
        title: 'No se pudo exportar la ficha',
        description: result?.error || 'Intente nuevamente en unos instantes.',
      });
    }
  }, [fichaId, exportarPdf, notification]);

  return {
    fichaId,
    ficha,
    loading,
    error,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    descargandoPdf,
    handleExportarPdf,
  };
};
