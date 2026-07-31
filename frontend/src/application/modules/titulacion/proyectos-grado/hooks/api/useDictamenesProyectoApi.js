/**
 * Hook de API: dictámenes de un proyecto de grado (módulo TUT · T22-T23).
 *
 * Lectura (T22, proyecto·DETALLE) y descarga del PDF por endpoint autenticado
 * (T23, proyecto·EXPORTAR, blob). Los dictámenes los GENERA el backend
 * (asignación de tutor T10 y transiciones T11) — aquí no hay escritura.
 *
 * `dataKey` ('dictamenes') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { downloadBlob } from '@application/utils';
import { mapDictamenesList } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';

/** Clave de datos = dataFieldName del backend (contrato T22). */
export const DICTAMENES_DATA_KEY = 'dictamenes';

export const useDictamenesProyectoApi = () => {
  const [dictamenes, setDictamenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (proyectoId) => {
    if (proyectoId == null) return { success: false, error: 'Proyecto inválido' };
    setLoading(true);
    setError(null);
    const result = await proyectoGradoRepository.obtenerDictamenes(proyectoId);
    if (result?.success) {
      const raw = result.data?.[DICTAMENES_DATA_KEY] ?? result.data;
      setDictamenes(mapDictamenesList(raw));
    } else {
      setDictamenes([]);
      setError(result?.error || 'No se pudieron cargar los dictámenes del proyecto');
    }
    setLoading(false);
    return result;
  }, []);

  /** Descarga el PDF del dictamen (blob autenticado, T23). */
  const descargarDictamen = useCallback(async (proyectoId, dictamen) => {
    setDescargandoId(dictamen.id);
    try {
      const result = await proyectoGradoRepository.descargarDictamenArchivo(
        proyectoId,
        dictamen.id,
      );
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || dictamen.nombreArchivo || 'dictamen.pdf');
        return { success: true };
      }
      return { success: false, error: result?.error || 'No se pudo descargar el dictamen' };
    } finally {
      setDescargandoId(null);
    }
  }, []);

  return useMemo(
    () => ({ dictamenes, loading, descargandoId, error, cargar, descargarDictamen }),
    [dictamenes, loading, descargandoId, error, cargar, descargarDictamen],
  );
};
