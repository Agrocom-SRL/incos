/**
 * Hook de pantalla: catálogo de empresas de pasantía (TIT · empresa·LISTAR).
 *
 * ABM de catálogo (patrón catálogos de Configuración): búsqueda en cliente,
 * columnas con toggle de estado (P10, `EstadoTogglePill` — feedback con
 * message y recarga, mismo criterio que `useToggleEstadoCatalogo`; aquí sin
 * container: la mutación viene del provider) y navegación a alta/edición.
 */

import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { usePasantiasEmpresasListContext } from '@application-titulacion/pasantias/hooks/context/usePasantiasEmpresasListContext';
import { createPasantiasEmpresasTableColumns } from '@titulacion/pasantias/config/pasantiasEmpresasTableColumns';
import {
  PASANTIAS_EMPRESAS_PATH,
  PASANTIAS_LIST_PATH,
  TIT_PASANTIAS_MENU_KEY,
  pasantiaEmpresaDetallePath,
  pasantiaEmpresaEditarPath,
  pasantiaEmpresaRegistrarPath,
} from '@application-titulacion/config/paths';

export const usePasantiasEmpresasListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();

  const {
    empresas = [],
    loading = false,
    error = null,
    refetch,
    cambiarEstadoEmpresa,
    eliminarEmpresa,
  } = usePasantiasEmpresasListContext();

  const [searchText, setSearchText] = useState('');

  const empresasFiltradas = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return empresas;
    return empresas.filter(
      (e) =>
        (e.nombre || '').toLowerCase().includes(q) ||
        (e.nombreComercial || '').toLowerCase().includes(q) ||
        (e.nit || '').toLowerCase().includes(q) ||
        (e.sectorActividad || '').toLowerCase().includes(q),
    );
  }, [empresas, searchText]);

  const returnListPath = location.state?.returnListPath || PASANTIAS_LIST_PATH;

  const listNavState = useMemo(
    () => ({
      menuSidebarKey: TIT_PASANTIAS_MENU_KEY,
      returnListPath: PASANTIAS_EMPRESAS_PATH,
    }),
    [],
  );

  /** onToggle de la columna Estado (P10) — feedback + recarga. */
  const handleToggleEstado = useCallback(
    async (record, nuevoActivo) => {
      const result = await cambiarEstadoEmpresa(record.id, nuevoActivo);
      if (!result?.success) {
        message.error(result?.error || 'No se pudo cambiar el estado de la empresa');
        return;
      }
      message.success(`Se ${nuevoActivo ? 'activó' : 'desactivó'} la empresa «${record.nombre}»`);
      await refetch();
    },
    [cambiarEstadoEmpresa, message, refetch],
  );

  const tableColumns = useMemo(
    () =>
      createPasantiasEmpresasTableColumns({
        onVer: (record) => navigate(pasantiaEmpresaDetallePath(record.id), { state: listNavState }),
        onEditar: (record) => navigate(pasantiaEmpresaEditarPath(record.id), { state: listNavState }),
        onToggleEstado: handleToggleEstado,
        eliminarEmpresa,
        refetch,
      }),
    [navigate, listNavState, handleToggleEstado, eliminarEmpresa, refetch],
  );

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Titulación' },
      { title: 'Pasantías', href: returnListPath },
      { title: 'Empresas' },
    ],
    [returnListPath],
  );

  const handleRegistrar = useCallback(() => {
    navigate(pasantiaEmpresaRegistrarPath, { state: listNavState });
  }, [navigate, listNavState]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, { state: { menuSidebarKey: TIT_PASANTIAS_MENU_KEY } });
  }, [navigate, returnListPath]);

  const handleSearchChange = useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  return {
    empresas: empresasFiltradas,
    loading,
    error,
    searchText,
    handleSearchChange,
    tableColumns,
    breadcrumbItems,
    handleRegistrar,
    handleVolver,
  };
};
