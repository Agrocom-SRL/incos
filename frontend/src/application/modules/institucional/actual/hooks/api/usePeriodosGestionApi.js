/**
 * API de periodos/etapas de la gestión vigente (configuración de bimestres).
 * Reutiliza el backend de calificaciones (gestion-bimestres/periodos):
 * - GET    /periodos                 → lista de periodos de la gestión vigente
 * - PUT    /periodos/:id/fechas      → edita fechas inicio/fin
 * - POST   /periodos                 → alta de etapa
 * - DELETE /periodos/:id             → baja de etapa (no estructural)
 */

import { useCallback } from 'react';
import CalificacionRepository from '@infrastructure/repositories/CalificacionRepository.js';

export const usePeriodosGestionApi = () => {
  const fetchPeriodos = useCallback(() => CalificacionRepository.listarPeriodosGestion(), []);

  const actualizarFechasPeriodo = useCallback(
    (id, fechas) => CalificacionRepository.actualizarFechasPeriodo(id, fechas),
    [],
  );

  const crearEtapaPeriodo = useCallback(
    (payload) => CalificacionRepository.crearEtapaPeriodo(payload),
    [],
  );

  const eliminarEtapaPeriodo = useCallback(
    (id) => CalificacionRepository.eliminarEtapaPeriodo(id),
    [],
  );

  return { fetchPeriodos, actualizarFechasPeriodo, crearEtapaPeriodo, eliminarEtapaPeriodo };
};
