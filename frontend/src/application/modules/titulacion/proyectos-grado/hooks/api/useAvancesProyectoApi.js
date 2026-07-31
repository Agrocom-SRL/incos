/**
 * Hook de API: avances de un proyecto de grado (módulo TUT · T18-T21).
 *
 * Lectura (T18), subida multipart PDF/Word (T20, avance·CREAR — el guard de
 * integrante lo aplica el servidor) y descarga por endpoint AUTENTICADO con
 * blob (T21) — nunca por URL estática /uploads.
 *
 * `dataKey` de lectura ('avances') y de subida ('avance') coinciden con los
 * `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { downloadBlob } from '@application/utils';
import { mapAvancesList } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';

/** Claves de datos = dataFieldName del backend (contrato T18/T19-T20). */
export const AVANCES_DATA_KEY = 'avances';
export const AVANCE_DATA_KEY = 'avance';

export const useAvancesProyectoApi = () => {
  const [avances, setAvances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [descargandoId, setDescargandoId] = useState(null);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (proyectoId) => {
    if (proyectoId == null) return { success: false, error: 'Proyecto inválido' };
    setLoading(true);
    setError(null);
    const result = await proyectoGradoRepository.obtenerAvances(proyectoId);
    if (result?.success) {
      const raw = result.data?.[AVANCES_DATA_KEY] ?? result.data;
      setAvances(mapAvancesList(raw));
    } else {
      setAvances([]);
      setError(result?.error || 'No se pudieron cargar los avances del proyecto');
    }
    setLoading(false);
    return result;
  }, []);

  /**
   * Sube el archivo del avance (multipart `uploadAvanceProyecto`).
   * @param {number} proyectoId
   * @param {{file: File, titulo?: string, descripcion?: string}} datos
   */
  const subirAvance = useCallback(async (proyectoId, { file, titulo, descripcion }) => {
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      if (titulo) formData.append('titulo', titulo);
      if (descripcion) formData.append('descripcion', descripcion);
      return await proyectoGradoRepository.subirAvance(proyectoId, formData);
    } finally {
      setSubiendo(false);
    }
  }, []);

  /** Descarga el archivo de un avance (blob autenticado, T21). */
  const descargarArchivo = useCallback(async (proyectoId, avance) => {
    setDescargandoId(avance.id);
    try {
      const result = await proyectoGradoRepository.descargarAvanceArchivo(proyectoId, avance.id);
      if (result?.success && result.blob) {
        downloadBlob(result.blob, result.fileName || avance.nombreArchivo || 'avance.pdf');
        return { success: true };
      }
      return { success: false, error: result?.error || 'No se pudo descargar el archivo' };
    } finally {
      setDescargandoId(null);
    }
  }, []);

  return useMemo(
    () => ({
      avances,
      loading,
      subiendo,
      descargandoId,
      error,
      cargar,
      subirAvance,
      descargarArchivo,
    }),
    [avances, loading, subiendo, descargandoId, error, cargar, subirAvance, descargarArchivo],
  );
};
