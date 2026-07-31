/**
 * Provider: programar/editar una sesión de refuerzo (ACA · Acompañamiento).
 *
 * Provider DELGADO: ensambla la ficha (solo edición A7), las mutaciones, los
 * catálogos reutilizados (cursos = asignaciones docentes vista 130; aulas del
 * catálogo institucional, ambos con degradación por permiso) y las alertas de
 * riesgo que alimentan el preseleccionable de estudiantes:
 *   - DOCENTE → A2 (sus alumnos en riesgo; el backend resuelve el docente)
 *   - resto   → A1 (alertas institucionales)
 * La orquestación (filtrar candidatos por curso elegido) vive en
 * `useSesionRefuerzoFormPage`.
 */

import { useEffect, useMemo, useState } from 'react';
import { useAuth, esDocente } from '@application-auth';
import { useGetSesionRefuerzo } from '@application-academico/acompanamiento/sesiones/hooks/api/useGetSesionRefuerzo';
import { useSesionRefuerzoMutations } from '@application-academico/acompanamiento/sesiones/hooks/api/useSesionRefuerzoMutations';
import { useAsignacionesCatalogoAcaApi } from '@application-academico/acompanamiento/sesiones/hooks/api/useAsignacionesCatalogoAcaApi';
import { useAulasCatalogoAcaApi } from '@application-academico/acompanamiento/sesiones/hooks/api/useAulasCatalogoAcaApi';
import { useAlertasRiesgoApi } from '@application-academico/acompanamiento/alertas/hooks/api/useAlertasRiesgoApi';
import { useMisAlumnosEnRiesgoApi } from '@application-academico/acompanamiento/alertas/hooks/api/useMisAlumnosEnRiesgoApi';
import { SesionRefuerzoFormContext } from '@application-academico/acompanamiento/sesiones/context/SesionRefuerzoFormContext';

export const SesionRefuerzoFormProvider = ({ children, sesionId = null }) => {
  const { usuario } = useAuth();
  const docente = esDocente(usuario);

  const { sesion, loading: loadingSesion, error: errorSesion, cargar } = useGetSesionRefuerzo();
  const { saving, guardarSesion } = useSesionRefuerzoMutations();
  const asignacionesCatalogo = useAsignacionesCatalogoAcaApi();
  const aulasCatalogo = useAulasCatalogoAcaApi();

  // Candidatos a estudiantes: rama docente (A2, auto-fetch) o admin (A1).
  const misAlumnos = useMisAlumnosEnRiesgoApi({ autoFetch: docente });
  const { fetch: fetchAlertasAdmin } = useAlertasRiesgoApi();
  const [alertasAdmin, setAlertasAdmin] = useState([]);
  const [loadingAlertasAdmin, setLoadingAlertasAdmin] = useState(!docente);

  useEffect(() => {
    if (docente) return undefined;
    let activo = true;
    (async () => {
      const result = await fetchAlertasAdmin({});
      if (!activo) return;
      setAlertasAdmin(result?.success ? result.data : []);
      setLoadingAlertasAdmin(false);
    })();
    return () => {
      activo = false;
    };
  }, [docente, fetchAlertasAdmin]);

  const id = sesionId != null ? Number(sesionId) : null;
  const idValido = id != null && Number.isFinite(id) && id > 0;

  // Solo el modo edición precarga la ficha.
  useEffect(() => {
    if (idValido) {
      cargar(id);
    }
  }, [idValido, id, cargar]);

  const alertasCandidatas = docente ? misAlumnos.alertas : alertasAdmin;
  const loadingAlertas = docente ? misAlumnos.loading : loadingAlertasAdmin;

  const value = useMemo(
    () => ({
      sesionId: idValido ? id : null,
      sesion,
      loadingSesion: idValido ? loadingSesion : false,
      errorSesion,
      saving,
      guardarSesion,
      // Catálogos reutilizados
      asignacionOptions: asignacionesCatalogo.options,
      asignacionById: asignacionesCatalogo.asignacionById,
      loadingAsignaciones: asignacionesCatalogo.loading,
      asignacionesDisponible: asignacionesCatalogo.disponible,
      aulas: aulasCatalogo.aulas,
      loadingAulas: aulasCatalogo.loading,
      aulasDisponible: aulasCatalogo.disponible,
      // Candidatos a estudiantes (alertas de riesgo)
      alertasCandidatas,
      loadingAlertas,
    }),
    [
      idValido,
      id,
      sesion,
      loadingSesion,
      errorSesion,
      saving,
      guardarSesion,
      asignacionesCatalogo,
      aulasCatalogo,
      alertasCandidatas,
      loadingAlertas,
    ],
  );

  return (
    <SesionRefuerzoFormContext.Provider value={value}>
      {children}
    </SesionRefuerzoFormContext.Provider>
  );
};
