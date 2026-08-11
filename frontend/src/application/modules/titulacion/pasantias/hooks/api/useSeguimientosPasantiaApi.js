/**
 * Hook de API: seguimientos de un trámite de pasantía (módulo TIT · P15-P17).
 *
 * Lectura en orden cronológico (P15), registro (P16) y edición (P17) de la
 * hoja de seguimiento (FORMULARIO DE SEGUIMIENTO DE PASANTÍA, escala
 * ALTO/MEDIO/BAJO), más descarga de la hoja por endpoint autenticado con blob
 * (extensión 2026-08-11, pasantia·EXPORTAR) — nunca por URL estática /uploads.
 *
 * `dataKey` de lectura ('seguimientos') y de escritura ('seguimiento')
 * coinciden con los `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import pasantiaRepository from '@implementations/PasantiaRepository';
import { downloadBlob } from '@application/utils';
import { mapSeguimientosList } from '@application-titulacion/pasantias/mappers/pasantiaMapper';

/** Claves de datos = dataFieldName del backend (contrato P15/P16-P17). */
export const SEGUIMIENTOS_DATA_KEY = 'seguimientos';
export const SEGUIMIENTO_DATA_KEY = 'seguimiento';

export const useSeguimientosPasantiaApi = () => {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (pasantiaId) => {
    if (pasantiaId == null) return { success: false, error: 'Trámite inválido' };
    setLoading(true);
    setError(null);
    const result = await pasantiaRepository.obtenerSeguimientos(pasantiaId);
    if (result?.success) {
      const raw = result.data?.[SEGUIMIENTOS_DATA_KEY] ?? result.data;
      setSeguimientos(mapSeguimientosList(raw));
    } else {
      setSeguimientos([]);
      setError(result?.error || 'No se pudieron cargar los seguimientos del trámite');
    }
    setLoading(false);
    return result;
  }, []);

  /** Registra un seguimiento nuevo (P16) o edita uno existente (P17). */
  const guardarSeguimiento = useCallback(
    (pasantiaId, seguimientoId, payload) =>
      seguimientoId != null
        ? pasantiaRepository.actualizarSeguimiento(pasantiaId, seguimientoId, payload)
        : pasantiaRepository.crearSeguimiento(pasantiaId, payload),
    [],
  );

  /** Descarga la hoja de seguimiento (blob autenticado, extensión 2026-08-11). */
  const descargarPdf = useCallback(async (pasantiaId, seguimiento) => {
    setDescargandoId(seguimiento.id);
    try {
      const result = await pasantiaRepository.descargarSeguimientoPdf(pasantiaId, seguimiento.id);
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || 'seguimiento_pasantia.pdf');
        return { success: true };
      }
      return { success: false, error: result?.error || 'No se pudo descargar la hoja de seguimiento' };
    } finally {
      setDescargandoId(null);
    }
  }, []);

  return useMemo(
    () => ({ seguimientos, loading, descargandoId, error, cargar, guardarSeguimiento, descargarPdf }),
    [seguimientos, loading, descargandoId, error, cargar, guardarSeguimiento, descargarPdf],
  );
};
