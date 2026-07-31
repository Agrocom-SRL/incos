/**
 * Hook de API: trámite de pasantía del estudiante autenticado (módulo TUT · P19).
 *
 * GET /pasantias/mi-pasantia — objeto COMPUESTO `{ pasantia, informes,
 * seguimientos }` (el backend resuelve el estudiante por token,
 * resolveEstudianteIdForUsuario). `pasantia = null` NO es error de pantalla:
 * el estudiante simplemente aún no tiene trámite (`sinPasantia`).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import {
  mapInformesList,
  mapPasantiaDetail,
  mapSeguimientosList,
} from '@application-titulacion/pasantias/mappers/pasantiaMapper';

export const useGetMiPasantia = () => {
  const [pasantia, setPasantia] = useState(null);
  const [informes, setInformes] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [sinPasantia, setSinPasantia] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Sin setState previo al await: apto para dispararse desde el efecto de montaje. */
  const cargar = useCallback(async () => {
    const result = await pasantiaRepository.obtenerMiPasantia();
    if (result?.success) {
      // Contrato P19: objeto compuesto { pasantia, informes, seguimientos }.
      const raw = result.data ?? {};
      const mapped = mapPasantiaDetail(raw.pasantia);
      setPasantia(mapped);
      setInformes(mapInformesList(raw.informes));
      setSeguimientos(mapSeguimientosList(raw.seguimientos));
      setSinPasantia(mapped == null);
      setError(null);
    } else {
      setPasantia(null);
      setInformes([]);
      setSeguimientos([]);
      setSinPasantia(false);
      setError(result?.error || 'No se pudo cargar su trámite de pasantía');
    }
    setLoading(false);
    return result;
  }, []);

  /** Recarga manual (handlers): reactiva el spinner antes de volver a pedir. */
  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    setSinPasantia(false);
    return cargar();
  }, [cargar]);

  useEffect(() => {
    // Deferido a microtarea: el efecto no ejecuta setState de forma síncrona.
    Promise.resolve().then(cargar);
  }, [cargar]);

  return useMemo(
    () => ({ pasantia, informes, seguimientos, sinPasantia, loading, error, refetch }),
    [pasantia, informes, seguimientos, sinPasantia, loading, error, refetch],
  );
};
