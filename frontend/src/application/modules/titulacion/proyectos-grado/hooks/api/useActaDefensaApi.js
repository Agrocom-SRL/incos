/**
 * Hook de API: actas de defensa de un proyecto de grado (módulo TIT,
 * extensión 2026-08-01 · proyecto·DETALLE).
 *
 * Lectura de N actas (PSP grupal: una por integrante ACTIVO) con tribunal
 * anidado. Carga LAZY: a diferencia de bitácora/avances/dictámenes (que se
 * cargan en paralelo al montar la ficha), esta tab la dispara recién
 * `useProyectoGradoDetailPage` al abrirse por primera vez — de ahí el flag
 * `cargado`, que permite al hook de estado no repetir el fetch.
 *
 * `dataKey` ('actasDefensa') coincide con el `dataFieldName` del backend
 * (contrato C7/C12).
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapActasDefensaList } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';

/** Clave de datos = dataFieldName del backend (contrato C12). */
export const ACTAS_DEFENSA_DATA_KEY = 'actasDefensa';

export const useActaDefensaApi = () => {
  const [actas, setActas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargado, setCargado] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (proyectoId) => {
    if (proyectoId == null) return { success: false, error: 'Proyecto inválido' };
    setLoading(true);
    setError(null);
    const result = await proyectoGradoRepository.obtenerActasDefensa(proyectoId);
    if (result?.success) {
      const raw = result.data?.[ACTAS_DEFENSA_DATA_KEY] ?? result.data;
      setActas(mapActasDefensaList(raw));
    } else {
      setActas([]);
      setError(result?.error || 'No se pudo cargar el acta de defensa del proyecto');
    }
    setCargado(true);
    setLoading(false);
    return result;
  }, []);

  return useMemo(
    () => ({ actas, loading, error, cargado, cargar }),
    [actas, loading, error, cargado, cargar],
  );
};

export default useActaDefensaApi;
