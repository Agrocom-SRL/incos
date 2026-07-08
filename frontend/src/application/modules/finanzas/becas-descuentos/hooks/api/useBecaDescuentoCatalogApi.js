/**
 * Hook de API: catálogo maestro Becas y descuentos (`becas_descuentos`) — módulo
 * Finanzas. Mismo criterio que `useConfigPagosCatalogsApi` (repositorio directo,
 * sin `useCasesFactory`): catálogo corto, límite alto, filtrado en cliente.
 *
 * `dataKey` (front) coincide con `dataFieldName` (back): becasDescuentos.
 */

import { useCallback, useEffect, useState } from 'react';
import becaDescuentoRepository from '@implementations/BecaDescuentoRepository';
import { mapBecasDescuentosList } from '@application-finanzas/becas-descuentos/mappers/becaDescuentoListMapper';

/**
 * Límite alto: el universo del catálogo maestro es pequeño y se filtra en cliente.
 * `incluirInactivos`: la pantalla de configuración gestiona el toggle
 * activo/inactivo (columna "Estado"), así que lista TODO el catálogo.
 */
const CATALOG_PARAMS = { params: { pagina: 1, limite: 200, incluirInactivos: true } };

export const useBecaDescuentoCatalogApi = () => {
  const [becasDescuentos, setBecasDescuentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const aplicarResultado = useCallback((resultado) => {
    if (!resultado?.success) {
      setError(resultado?.error || 'No se pudo cargar el catálogo de becas y descuentos');
      setLoading(false);
      return;
    }
    setBecasDescuentos(mapBecasDescuentosList(resultado.data));
    setError(null);
    setLoading(false);
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    aplicarResultado(await becaDescuentoRepository.obtenerTodos(CATALOG_PARAMS));
  }, [aplicarResultado]);

  useEffect(() => {
    let activo = true;
    becaDescuentoRepository.obtenerTodos(CATALOG_PARAMS).then((resultado) => {
      if (activo) aplicarResultado(resultado);
    });
    return () => {
      activo = false;
    };
  }, [aplicarResultado]);

  return { becasDescuentos, loading, error, refetch };
};

export default useBecaDescuentoCatalogApi;
