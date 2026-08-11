/**
 * Hook de API: catálogo de empresas de pasantía (módulo TIT · P7).
 *
 * Dos consumidores con el mismo endpoint:
 *  - ABM del catálogo (`incluirInactivos: true` — administra el toggle de
 *    estado, patrón catálogos de Configuración),
 *  - select del formulario de trámite (solo activas, por defecto).
 *
 * `dataKey` ('pasantiasEmpresas') coincide con el `dataFieldName` del backend
 * (ListPasantiasEmpresasUseCase).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { mapEmpresasList } from '@application-titulacion/pasantias/mappers/pasantiaMapper';

/** Clave de datos = dataFieldName del backend (contrato P7). */
export const PASANTIAS_EMPRESAS_DATA_KEY = 'pasantiasEmpresas';

/** Universo pequeño de catálogo: se pide completo y se filtra en cliente. */
const CATALOGO_LIMIT = 1000;

export const usePasantiasEmpresasApi = ({ incluirInactivos = false } = {}) => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Sin setState previo al await: apto para dispararse desde el efecto de montaje. */
  const cargar = useCallback(async () => {
    const result = await pasantiaRepository.obtenerEmpresas({
      params: {
        limit: CATALOGO_LIMIT,
        ...(incluirInactivos ? { incluirInactivos: true } : {}),
      },
    });
    if (result?.success) {
      const raw = result.data?.[PASANTIAS_EMPRESAS_DATA_KEY] ?? result.data;
      setEmpresas(mapEmpresasList(raw));
      setError(null);
    } else {
      setEmpresas([]);
      setError(result?.error || 'No se pudieron cargar las empresas de pasantía');
    }
    setLoading(false);
    return result;
  }, [incluirInactivos]);

  /** Recarga manual (handlers, toggle de estado): reactiva el spinner. */
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return cargar();
  }, [cargar]);

  useEffect(() => {
    // Deferido a microtarea: el efecto no ejecuta setState de forma síncrona.
    Promise.resolve().then(cargar);
  }, [cargar]);

  /** Opciones para el select del formulario de trámite (solo activas). */
  const options = useMemo(
    () =>
      empresas
        .filter((e) => e.activo)
        .map((e) => {
          const nombrePrincipal = e.nombreComercial || e.nombre;
          const partes = [
            nombrePrincipal,
            e.nombreComercial ? e.nombre : null,
            e.nit ? `NIT ${e.nit}` : null,
          ].filter(Boolean);
          return { value: e.id, label: partes.join(' · ') };
        }),
    [empresas],
  );

  return useMemo(
    () => ({ empresas, options, loading, error, refetch }),
    [empresas, options, loading, error, refetch],
  );
};
