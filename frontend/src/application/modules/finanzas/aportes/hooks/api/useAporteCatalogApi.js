/**
 * Hook de API: aporte de la gestión vigente — módulo Finanzas.
 *
 * Lee `configuracion_aportes` sobre la infraestructura compartida (mismo
 * repositorio que usaba el tab "Aporte" de "Config. de pagos"; ahora página
 * `/finanzas/configuracion/aportes` (sin ítem de menú propio) con su permiso
 * `finanzas.aporte`, independiente de `finanzas.configuracion.pago` que
 * quedó con bancos/cuentas/métodos).
 *
 * Resuelve el aporte de la GESTIÓN VIGENTE (para el upsert del hook de
 * mutación: si existe → PUT por id; si no → POST). La gestión vigente se
 * obtiene del catálogo compartido (`vigente: 1`) y la resuelve el provider.
 *
 * `dataKey` (front) coincide con `dataFieldName` (back): configuracionAporte.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import contributionConfigurationRepository from '@implementations/ContributionConfigurationRepository';
import { mapConfiguracionAporte } from '@application-finanzas/aportes/mappers/aporteMapper';

/** Límite alto: el universo de aportes por gestión es pequeño y se filtra en cliente. */
const CATALOG_PARAMS = { params: { pagina: 1, limite: 200 } };

export const useAporteCatalogApi = (gestionVigente = null) => {
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gestionVigenteId = useMemo(() => {
    const id = gestionVigente?.id;
    return id != null && Number.isFinite(Number(id)) ? Number(id) : null;
  }, [gestionVigente]);

  /** Lectura pura (sin setState): segura para el efecto. */
  const fetchAportes = useCallback(
    () => contributionConfigurationRepository.obtenerTodos(CATALOG_PARAMS),
    [],
  );

  const aplicarResultado = useCallback((resultado) => {
    if (!resultado?.success) {
      setError(resultado?.error || 'No se pudo cargar el aporte de la gestión');
      setLoading(false);
      return;
    }
    const lista = Array.isArray(resultado.data)
      ? resultado.data.map(mapConfiguracionAporte).filter(Boolean)
      : [];
    setAportes(lista);
    setError(null);
    setLoading(false);
  }, []);

  /** Recarga manual (refetch): muestra loading y vuelve a leer el aporte. */
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    aplicarResultado(await fetchAportes());
  }, [fetchAportes, aplicarResultado]);

  useEffect(() => {
    let activo = true;
    fetchAportes().then((resultado) => {
      if (activo) aplicarResultado(resultado);
    });
    return () => {
      activo = false;
    };
  }, [fetchAportes, aplicarResultado]);

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
    () => ({ aportes, aporteVigente, loading, error, refetch }),
    [aportes, aporteVigente, loading, error, refetch],
  );
};

export default useAporteCatalogApi;
