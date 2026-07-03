/**
 * Resumen del docente para el hub de "Mi perfil".
 *
 * Compone, SOLO cuando el usuario es docente (`enabled`), la fuente ya
 * existente `useDocenteHome` (GET /dashboard/mi-resumen-docente) para alimentar
 * las métricas ligeras del perfil (cursos, horas semanales, gestión vigente)
 * sin duplicar llamadas ni mapeos.
 *
 * SOLO LECTURA y tolerante a fallos: si la fuente falla, los datos quedan en
 * `null` (la UI muestra "—") y el hub se sigue mostrando sin métricas.
 */

import { useDocenteHome } from '@application-dashboard/hooks/useDocenteHome.js';

export const usePerfilDocenteResumen = (enabled = false) => {
  const { gestion, carga, loading, error } = useDocenteHome(enabled);

  // Error silencioso: el hub del perfil no muestra alertas, solo omite métricas.
  const sinDatos = !enabled || Boolean(error);

  return {
    cursos: sinDatos ? null : carga.totalAsignaciones,
    horasSemanales: sinDatos ? null : carga.horasSemanales,
    gestion: sinDatos ? null : gestion.nombre || (gestion.anio != null ? String(gestion.anio) : null),
    bimestreNombre: sinDatos ? null : gestion.bimestreNombre,
    loadingResumen: loading,
  };
};

export default usePerfilDocenteResumen;
