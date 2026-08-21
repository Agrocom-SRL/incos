/**
 * Hook de API: autorregistro de modalidad de grado del estudiante autenticado
 * (módulo TIT, Fase B3, extensión 2026-08-17).
 *
 * POST /proyectos-grado/mi-proyecto — el backend resuelve el estudiante por
 * token y valida el prerrequisito (3er año, sin materias REPROBADO/ABANDONO
 * pendientes de 1º/2º); un 409 se propaga tal cual (`result.error`) para que
 * la pantalla lo muestre sin reimplementar la regla de negocio en frontend.
 * `dataKey` ('proyectoGrado') coincide con el `dataFieldName` del backend.
 */

import { useCallback, useMemo, useState } from 'react';
import proyectoGradoRepository from '@implementations/ProyectoGradoRepository';
import { mapProyectoGradoDetail } from '@application-titulacion/proyectos-grado/mappers/proyectoGradoMapper';
import { PROYECTO_GRADO_DATA_KEY } from './useGetProyectoGrado';

export const useRegistrarMiProyectoGradoApi = () => {
  const [registrando, setRegistrando] = useState(false);

  /**
   * @param {{titulo: string, objetivos?: string, modalidadId: number}} datos
   * @returns {Promise<{success: boolean, proyecto?: Object, error?: string}>}
   */
  const registrar = useCallback(async (datos) => {
    setRegistrando(true);
    try {
      const result = await proyectoGradoRepository.registrarMiProyecto(datos);
      if (result?.success) {
        const raw = result.data?.[PROYECTO_GRADO_DATA_KEY] ?? result.data;
        return { success: true, proyecto: mapProyectoGradoDetail(raw) };
      }
      return { success: false, error: result?.error || 'No se pudo registrar su modalidad de grado' };
    } finally {
      setRegistrando(false);
    }
  }, []);

  return useMemo(() => ({ registrando, registrar }), [registrando, registrar]);
};

export default useRegistrarMiProyectoGradoApi;
