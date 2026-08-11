/**
 * Hook de pantalla: ficha de una empresa del catálogo de pasantías
 * (TIT · empresa·DETALLE/EDITAR/ELIMINAR).
 *
 * Orquesta la ficha sobre el contexto del provider (breadcrumbs, volver,
 * editar) y la eliminación (soft-delete, irreversible desde la UI): única
 * acción destructiva de la pantalla, pide confirmación con `modal.confirm`
 * (mismo criterio que `useCursoCapacitacionDetailPage`).
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { usePasantiaEmpresaDetailContext } from '@application-titulacion/pasantias/hooks/context/usePasantiaEmpresaDetailContext';
import { usePasantiaEmpresaMutations } from '@application-titulacion/pasantias/hooks/api/usePasantiaEmpresaMutations';
import {
  PASANTIAS_EMPRESAS_PATH,
  TIT_PASANTIAS_MENU_KEY,
  pasantiaEmpresaEditarPath,
} from '@application-titulacion/config/paths';

export const usePasantiaEmpresaDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { modal, notification } = App.useApp();

  const { empresaId, empresa, loading, error, refetch } = usePasantiaEmpresaDetailContext();
  const { eliminarEmpresa } = usePasantiaEmpresaMutations();
  const [eliminando, setEliminando] = useState(false);

  const returnListPath = location.state?.returnListPath || PASANTIAS_EMPRESAS_PATH;
  const menuSidebarKey = location.state?.menuSidebarKey ?? TIT_PASANTIAS_MENU_KEY;

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Empresas de pasantía', href: returnListPath },
      { title: 'Detalle de empresa' },
    ],
    [returnListPath],
  );

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey } });
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleEditar = useCallback(() => {
    if (!empresaId) return;
    navigate(pasantiaEmpresaEditarPath(empresaId), {
      state: { returnListPath, menuSidebarKey },
    });
  }, [navigate, empresaId, returnListPath, menuSidebarKey]);

  const handleEliminar = useCallback(() => {
    if (!empresaId) return;
    modal.confirm({
      title: 'Eliminar empresa',
      content: `Se eliminará «${empresa?.nombre || 'esta empresa'}» del catálogo. Esta acción no se puede deshacer. ¿Desea continuar?`,
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Volver',
      onOk: async () => {
        setEliminando(true);
        try {
          const result = await eliminarEmpresa(empresaId);
          if (result?.success) {
            notification.success({
              title: 'Empresa eliminada',
              description: 'La empresa fue eliminada del catálogo.',
            });
            handleVolver();
          } else {
            notification.error({
              title: 'No se pudo eliminar la empresa',
              description: result?.error || 'Intente nuevamente en unos instantes.',
            });
          }
        } finally {
          setEliminando(false);
        }
      },
    });
  }, [empresaId, empresa?.nombre, modal, eliminarEmpresa, notification, handleVolver]);

  return {
    empresaId,
    empresa,
    loading,
    error,
    refetch,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    handleEliminar,
    eliminando,
  };
};
