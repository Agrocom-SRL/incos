/**
 * Hook de pantalla: listado del catálogo maestro Becas y descuentos
 * ("Configuración de becas", ítem de menú propio de Finanzas — antes vivía
 * embebido como 4to tab de "Config. de pagos"). Aplica el mismo filtro de
 * texto en cliente que `useDiscapacidadesList` (catálogo corto) y expone el
 * toggle rápido activo/inactivo de la columna "Estado"
 * (`useToggleEstadoCatalogo`, PATCH /becas-descuentos/:id/estado).
 */

import { useMemo } from 'react';
import { useTableData } from '@molecules';
import { useToggleEstadoCatalogo } from '@application-shared/hooks';
import { useBecaDescuentoContext } from '@application-finanzas/becas-descuentos/hooks/context/useBecaDescuentoContext';

export const useBecaDescuentoListPage = () => {
  const { becasDescuentos, loading, error, refetch, eliminar } = useBecaDescuentoContext();

  const getSearchFields = useMemo(
    () => (beca) => [beca.nombre, beca.codigo, beca.descripcion],
    [],
  );

  const { searchText, setSearchText, filteredData } = useTableData(becasDescuentos, getSearchFields);

  // Toggle rápido activo/inactivo (columna "Estado" del listado)
  const toggleEstado = useToggleEstadoCatalogo({
    useCaseKey: 'cambiarEstadoBecaDescuento',
    entidad: 'la beca o descuento',
    refetch,
  });

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Finanzas' }, { title: 'Config. de becas' }],
    [],
  );

  return {
    becasDescuentos: filteredData,
    loading,
    error,
    refetch,
    eliminar,
    searchText,
    setSearchText,
    toggleEstado,
    breadcrumbItems,
  };
};

export default useBecaDescuentoListPage;
