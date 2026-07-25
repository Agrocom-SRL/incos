/**
 * Hook de API: bitácora de tutoría de un proyecto (módulo TUT · T14-T17).
 *
 * Lectura (T14) + mutaciones: crear entrada (T15, bitacora·CREAR — una
 * REVISION_AVANCE actualiza además tutoria_avances.estado_revision en el
 * backend), editar (T16, bitacora·EDITAR) y confirmación del estudiante
 * (T17 — firma digital de la planilla; guard de pertenencia en el servidor).
 *
 * `dataKey` de lectura ('bitacoraEntradas') y de mutación ('bitacoraEntrada')
 * coinciden con los `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapBitacoraList } from '@application-tutorias/titulacion/mappers/proyectoGradoMapper';

/** Claves de datos = dataFieldName del backend (contrato T14/T15-T17). */
export const BITACORA_ENTRADAS_DATA_KEY = 'bitacoraEntradas';
export const BITACORA_ENTRADA_DATA_KEY = 'bitacoraEntrada';

export const useBitacoraProyectoApi = () => {
  const [entradas, setEntradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async (proyectoId) => {
    if (proyectoId == null) return { success: false, error: 'Proyecto inválido' };
    setLoading(true);
    setError(null);
    const result = await proyectoGradoRepository.obtenerBitacora(proyectoId);
    if (result?.success) {
      const raw = result.data?.[BITACORA_ENTRADAS_DATA_KEY] ?? result.data;
      setEntradas(mapBitacoraList(raw));
    } else {
      setEntradas([]);
      setError(result?.error || 'No se pudo cargar la bitácora del proyecto');
    }
    setLoading(false);
    return result;
  }, []);

  const crearEntrada = useCallback(
    (proyectoId, payload) => proyectoGradoRepository.crearBitacoraEntrada(proyectoId, payload),
    [],
  );

  const actualizarEntrada = useCallback(
    (proyectoId, entradaId, payload) =>
      proyectoGradoRepository.actualizarBitacoraEntrada(proyectoId, entradaId, payload),
    [],
  );

  const confirmarEntrada = useCallback(
    (proyectoId, entradaId) =>
      proyectoGradoRepository.confirmarBitacoraEntrada(proyectoId, entradaId),
    [],
  );

  return useMemo(
    () => ({
      entradas,
      loading,
      error,
      cargar,
      crearEntrada,
      actualizarEntrada,
      confirmarEntrada,
    }),
    [entradas, loading, error, cargar, crearEntrada, actualizarEntrada, confirmarEntrada],
  );
};
