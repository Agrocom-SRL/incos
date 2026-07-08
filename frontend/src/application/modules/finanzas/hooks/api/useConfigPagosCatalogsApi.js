/**
 * Hook de API: catálogos de la configuración de pagos — módulo Finanzas.
 *
 * Lee de forma transparente las 3 entidades que componen la pantalla
 * "Config. de pagos" sobre la INFRAESTRUCTURA compartida (módulo independiente
 * del legacy `@pagos`):
 *   - metodos_pago          → `PaymentMethodRepository`
 *   - bancos_autorizados    → `AuthorizedBankRepository`
 *   - cuentas_pago          → `PaymentAccountRepository`
 *
 * El aporte de la gestión vigente vive en la página
 * `/finanzas/configuracion/aportes` (sin ítem de menú propio, permiso
 * `finanzas.aporte`, ver
 * `application/modules/finanzas/aportes/hooks/api/useAporteCatalogApi.js`).
 *
 * `dataKey` (front) coincide con `dataFieldName` (back): metodoPago,
 * bancoAutorizado, cuentaPago.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import paymentMethodRepository from '@implementations/PaymentMethodRepository';
import authorizedBankRepository from '@implementations/AuthorizedBankRepository';
import paymentAccountRepository from '@implementations/PaymentAccountRepository';
import {
  mapMetodoPago,
  mapBancoAutorizado,
  mapCuentaPago,
  ordenarMetodos,
  indexarBancos,
} from '@application-finanzas/mappers/configPagosMapper';

/**
 * Límite alto: el universo de catálogos es pequeño y se filtra en cliente.
 * `incluirInactivos`: la pantalla de configuración gestiona el toggle
 * activo/inactivo (columna "Estado"), así que lista TODO el catálogo.
 */
const CATALOG_PARAMS = { params: { pagina: 1, limite: 200, incluirInactivos: true } };

export const useConfigPagosCatalogsApi = () => {
  const [metodos, setMetodos] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Lectura pura de las 3 entidades (sin setState): segura para el efecto. */
  const fetchCatalogos = useCallback(async () => {
    const [metodosRes, bancosRes, cuentasRes] = await Promise.all([
      paymentMethodRepository.obtenerTodos(CATALOG_PARAMS),
      authorizedBankRepository.obtenerTodos(CATALOG_PARAMS),
      paymentAccountRepository.obtenerTodos(CATALOG_PARAMS),
    ]);
    return { metodosRes, bancosRes, cuentasRes };
  }, []);

  const aplicarResultado = useCallback(({ metodosRes, bancosRes, cuentasRes }) => {
    if (!metodosRes?.success) {
      setError(metodosRes?.error || 'No se pudieron cargar los catálogos de pago');
      setLoading(false);
      return;
    }

    const bancosList =
      bancosRes?.success && Array.isArray(bancosRes.data)
        ? bancosRes.data.map(mapBancoAutorizado).filter(Boolean)
        : [];
    const bancosMap = indexarBancos(bancosList);

    const cuentasList =
      cuentasRes?.success && Array.isArray(cuentasRes.data)
        ? cuentasRes.data.map((cuenta) => mapCuentaPago(cuenta, bancosMap)).filter(Boolean)
        : [];

    const metodosList = Array.isArray(metodosRes.data)
      ? ordenarMetodos(metodosRes.data.map(mapMetodoPago).filter(Boolean))
      : [];

    setMetodos(metodosList);
    setBancos(bancosList);
    setCuentas(cuentasList);
    setError(null);
    setLoading(false);
  }, []);

  /** Recarga manual (refetch): actualiza datos en background; el loading lo
   * consume cada tab vía `TableListView` (no bloquea la página). */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCatalogos();
    aplicarResultado(result);
  }, [fetchCatalogos, aplicarResultado]);

  useEffect(() => {
    let activo = true;
    fetchCatalogos().then((result) => {
      if (activo) {
        aplicarResultado(result);
      }
    });
    return () => {
      activo = false;
    };
  }, [fetchCatalogos, aplicarResultado]);

  return useMemo(
    () => ({
      metodos,
      bancos,
      cuentas,
      loading,
      error,
      refetch,
    }),
    [metodos, bancos, cuentas, loading, error, refetch],
  );
};

export default useConfigPagosCatalogsApi;
