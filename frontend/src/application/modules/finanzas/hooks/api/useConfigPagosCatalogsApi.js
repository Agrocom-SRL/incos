/**
 * Hook de API: catálogos de la configuración de pagos — módulo Finanzas.
 *
 * Lee de forma transparente las 4 entidades que componen la pantalla
 * "Config. de pagos" sobre la INFRAESTRUCTURA compartida (módulo independiente
 * del legacy `@pagos`):
 *   - configuracion_aportes → `ContributionConfigurationRepository`
 *   - metodos_pago          → `PaymentMethodRepository`
 *   - bancos_autorizados    → `AuthorizedBankRepository`
 *   - cuentas_pago          → `PaymentAccountRepository`
 *
 * Resuelve además la configuración de aporte de la GESTIÓN VIGENTE (para el
 * upsert: si existe → PUT por id; si no → POST). La gestión vigente se obtiene
 * del catálogo compartido (`vigente: 1`).
 *
 * `dataKey` (front) coincide con `dataFieldName` (back): configuracionAporte,
 * metodoPago, bancoAutorizado, cuentaPago.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import contributionConfigurationRepository from '@implementations/ContributionConfigurationRepository';
import paymentMethodRepository from '@implementations/PaymentMethodRepository';
import authorizedBankRepository from '@implementations/AuthorizedBankRepository';
import paymentAccountRepository from '@implementations/PaymentAccountRepository';
import {
  mapConfiguracionAporte,
  mapMetodoPago,
  mapBancoAutorizado,
  mapCuentaPago,
  ordenarMetodos,
  indexarBancos,
} from '@application-finanzas/mappers/configPagosMapper';

/** Límite alto: el universo de catálogos es pequeño y se filtra en cliente. */
const CATALOG_PARAMS = { params: { pagina: 1, limite: 200 } };

export const useConfigPagosCatalogsApi = (gestionVigente = null) => {
  const [aportes, setAportes] = useState([]);
  const [metodos, setMetodos] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gestionVigenteId = useMemo(() => {
    const id = gestionVigente?.id;
    return id != null && Number.isFinite(Number(id)) ? Number(id) : null;
  }, [gestionVigente]);

  /** Lectura pura de las 4 entidades (sin setState): segura para el efecto. */
  const fetchCatalogos = useCallback(async () => {
    const [aportesRes, metodosRes, bancosRes, cuentasRes] = await Promise.all([
      contributionConfigurationRepository.obtenerTodos(CATALOG_PARAMS),
      paymentMethodRepository.obtenerTodos(CATALOG_PARAMS),
      authorizedBankRepository.obtenerTodos(CATALOG_PARAMS),
      paymentAccountRepository.obtenerTodos(CATALOG_PARAMS),
    ]);
    return { aportesRes, metodosRes, bancosRes, cuentasRes };
  }, []);

  const aplicarResultado = useCallback(({ aportesRes, metodosRes, bancosRes, cuentasRes }) => {
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

    const aportesList =
      aportesRes?.success && Array.isArray(aportesRes.data)
        ? aportesRes.data.map(mapConfiguracionAporte).filter(Boolean)
        : [];

    setAportes(aportesList);
    setMetodos(metodosList);
    setBancos(bancosList);
    setCuentas(cuentasList);
    setError(null);
    setLoading(false);
  }, []);

  /** Recarga manual (refetch): muestra loading y vuelve a leer las 4 entidades. */
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

  /**
   * Aporte de la GESTIÓN VIGENTE (clave del upsert):
   *   - con gestionVigenteId → busca el aporte de esa gestión.
   *   - si ningún aporte tiene gestionId (config heredada/global) → toma el primero.
   * `null` ⇒ no existe configuración para la gestión vigente (alta vía POST).
   */
  const aporteVigente = useMemo(() => {
    if (!aportes.length) return null;
    if (gestionVigenteId != null) {
      const porGestion = aportes.find((a) => Number(a.gestionId) === gestionVigenteId);
      if (porGestion) return porGestion;
      const sinGestion = aportes.find((a) => a.gestionId == null);
      return sinGestion ?? null;
    }
    return aportes[0] ?? null;
  }, [aportes, gestionVigenteId]);

  return useMemo(
    () => ({
      aportes,
      aporteVigente,
      metodos,
      bancos,
      cuentas,
      loading,
      error,
      refetch,
    }),
    [aportes, aporteVigente, metodos, bancos, cuentas, loading, error, refetch],
  );
};

export default useConfigPagosCatalogsApi;
