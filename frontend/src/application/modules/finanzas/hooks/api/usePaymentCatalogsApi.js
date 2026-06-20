/**
 * Hook de API: catálogos de pago (métodos, cuentas, bancos) — módulo Finanzas.
 *
 * Módulo independiente del legacy `@pagos`: consume directamente la INFRAESTRUCTURA
 * compartida — `PaymentMethodRepository`, `PaymentAccountRepository`,
 * `AuthorizedBankRepository`. Carga los tres catálogos al montar (lectura transparente
 * habilitada por `sistema.catalogo.referencia` en backend) y los normaliza a un DTO
 * estable para el formulario de registro.
 *
 * `dataKey` (front) coincide con `dataFieldName` (back): metodosPago, cuentasPago, etc.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import paymentMethodRepository from '@implementations/PaymentMethodRepository';
import paymentAccountRepository from '@implementations/PaymentAccountRepository';
import authorizedBankRepository from '@implementations/AuthorizedBankRepository';
import {
  mapMetodoPago,
  mapCuentaPago,
  mapBancoAutorizado,
} from '@application-finanzas/mappers/pagosRegistrarMapper';

/** Límite alto: el universo de catálogos es pequeño y se filtra en cliente. */
const CATALOG_PARAMS = { params: { pagina: 1, limite: 200 } };

export const usePaymentCatalogsApi = () => {
  const [metodosPago, setMetodosPago] = useState([]);
  const [cuentasPago, setCuentasPago] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Lectura pura de los tres catálogos (sin setState): segura para llamar desde el efecto. */
  const fetchCatalogos = useCallback(async () => {
    const [metodosRes, cuentasRes, bancosRes] = await Promise.all([
      paymentMethodRepository.obtenerTodos(CATALOG_PARAMS),
      paymentAccountRepository.obtenerTodos(CATALOG_PARAMS),
      authorizedBankRepository.obtenerTodos(CATALOG_PARAMS),
    ]);
    return { metodosRes, cuentasRes, bancosRes };
  }, []);

  const aplicarResultado = useCallback(({ metodosRes, cuentasRes, bancosRes }) => {
    if (!metodosRes?.success) {
      setError(metodosRes?.error || 'No se pudieron cargar los métodos de pago');
      setLoading(false);
      return;
    }

    const bancosList = bancosRes?.success && Array.isArray(bancosRes.data)
      ? bancosRes.data.map(mapBancoAutorizado).filter(Boolean)
      : [];
    const bancosMap = bancosList.reduce((acc, banco) => {
      acc[banco.id] = banco;
      return acc;
    }, {});

    const cuentasList = cuentasRes?.success && Array.isArray(cuentasRes.data)
      ? cuentasRes.data.map((cuenta) => mapCuentaPago(cuenta, bancosMap)).filter(Boolean)
      : [];

    setMetodosPago(Array.isArray(metodosRes.data) ? metodosRes.data.map(mapMetodoPago).filter(Boolean) : []);
    setCuentasPago(cuentasList);
    setBancos(bancosList);
    setLoading(false);
  }, []);

  /** Recarga manual (refetch): muestra loading y vuelve a leer los catálogos. */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchCatalogos();
    aplicarResultado(result);
  }, [fetchCatalogos, aplicarResultado]);

  // Carga inicial: `loading` ya arranca en true; el efecto solo lee y aplica
  // (sin setState síncrono antes del await).
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
    () => ({ metodosPago, cuentasPago, bancos, loading, error, refetch }),
    [metodosPago, cuentasPago, bancos, loading, error, refetch],
  );
};
