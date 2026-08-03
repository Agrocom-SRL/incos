/**
 * Hook de API: informes de un trámite de pasantía (módulo TIT · P11-P14).
 *
 * Lectura (P11), emisión (P12 — el backend genera el PDF institucional),
 * edición (P13 — regenera el PDF) y descarga del PDF por endpoint AUTENTICADO
 * con blob (P14, pasantia·EXPORTAR) — nunca por URL estática /uploads.
 *
 * `dataKey` de lectura ('informes') y de escritura ('informe') coinciden con
 * los `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { downloadBlob } from '@application/utils';
import { mapInformesList } from '@application-titulacion/pasantias/mappers/pasantiaMapper';

/** Claves de datos = dataFieldName del backend (contrato P11/P12-P13). */
export const INFORMES_DATA_KEY = 'informes';
export const INFORME_DATA_KEY = 'informe';

export const useInformesPasantiaApi = () => {
  const [informes, setInformes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (pasantiaId) => {
    if (pasantiaId == null) return { success: false, error: 'Trámite inválido' };
    setLoading(true);
    setError(null);
    const result = await pasantiaRepository.obtenerInformes(pasantiaId);
    if (result?.success) {
      const raw = result.data?.[INFORMES_DATA_KEY] ?? result.data;
      setInformes(mapInformesList(raw));
    } else {
      setInformes([]);
      setError(result?.error || 'No se pudieron cargar los informes del trámite');
    }
    setLoading(false);
    return result;
  }, []);

  /** Emite un informe nuevo (P12) o edita uno existente (P13). */
  const guardarInforme = useCallback(
    (pasantiaId, informeId, payload) =>
      informeId != null
        ? pasantiaRepository.actualizarInforme(pasantiaId, informeId, payload)
        : pasantiaRepository.crearInforme(pasantiaId, payload),
    [],
  );

  /** Descarga el PDF del informe (blob autenticado, P14). */
  const descargarPdf = useCallback(async (pasantiaId, informe) => {
    setDescargandoId(informe.id);
    try {
      const result = await pasantiaRepository.descargarInformePdf(pasantiaId, informe.id);
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || informe.nombreArchivo || 'informe_pasantia.pdf');
        return { success: true };
      }
      return { success: false, error: result?.error || 'No se pudo descargar el PDF del informe' };
    } finally {
      setDescargandoId(null);
    }
  }, []);

  return useMemo(
    () => ({ informes, loading, descargandoId, error, cargar, guardarInforme, descargarPdf }),
    [informes, loading, descargandoId, error, cargar, guardarInforme, descargarPdf],
  );
};
