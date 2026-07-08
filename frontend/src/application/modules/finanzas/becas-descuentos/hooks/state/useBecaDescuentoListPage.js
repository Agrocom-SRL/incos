/**
 * Hook de pantalla: listado del catálogo maestro Becas y descuentos. Se
 * consume desde `BecasDescuentosTabPanel` (Config. de pagos · Finanzas): el
 * listado vive EMBEBIDO como 4to tab (no es una ruta propia). Aplica el mismo
 * filtro de texto en cliente que `useDiscapacidadesList` (catálogo corto) y
 * expone el toggle rápido activo/inactivo de la columna "Estado"
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

  return {
    becasDescuentos: filteredData,
    loading,
    error,
    refetch,
    eliminar,
    searchText,
    setSearchText,
    toggleEstado,
  };
};

export default useBecaDescuentoListPage;
