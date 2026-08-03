/**
 * Hook de pantalla: "Mi proyecto de grado" — portal del estudiante (TIT).
 *
 * Rama estudiante del connector (patrón Mi boletín): SIN provider admin —
 * consume T4 (el backend resuelve el estudiante por token) y los satélites
 * del propio proyecto:
 *  - avances: historial (T18), subida PDF/Word (T20) y descarga (T21)
 *  - bitácora: historial de observaciones (T14) y confirmación de entradas
 *    (T17 — firma digital; guard de pertenencia en el servidor).
 *  - acta de defensa (D5, extensión 2026-08-01): solo lectura (P7: el
 *    estudiante ve calificación y resultado, sin descarga de PDF — no tiene
 *    `titulacion.proyecto`·EXPORTAR); se carga junto a los demás satélites
 *    (página plana sin tabs, a diferencia de la ficha admin no aplica carga
 *    lazy por tab).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { useGetMiProyectoGrado } from '@application-titulacion/proyectos-grado/hooks/api/useGetMiProyectoGrado';
import { useAvancesProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useAvancesProyectoApi';
import { useBitacoraProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useBitacoraProyectoApi';
import { useActaDefensaApi } from '@application-titulacion/proyectos-grado/hooks/api/useActaDefensaApi';

/** Extensiones permitidas por el contrato (uploadAvanceProyecto: PDF/Word). */
export const AVANCE_ACCEPT = '.pdf,.doc,.docx';

export const useMiProyectoGradoPage = () => {
  const { notification } = App.useApp();

  const { proyecto, sinProyecto, loading, error, refetch } = useGetMiProyectoGrado();
  const avancesApi = useAvancesProyectoApi();
  const bitacoraApi = useBitacoraProyectoApi();
  const actaDefensaApi = useActaDefensaApi();

  const proyectoId = proyecto?.id ?? null;

  const { cargar: cargarAvances } = avancesApi;
  const { cargar: cargarBitacora } = bitacoraApi;
  const { cargar: cargarActaDefensa } = actaDefensaApi;

  // Con el proyecto resuelto se cargan sus satélites (T18/T14) y el acta de defensa (D5).
  useEffect(() => {
    if (proyectoId == null) return;
    cargarAvances(proyectoId);
    cargarBitacora(proyectoId);
    cargarActaDefensa(proyectoId);
  }, [proyectoId, cargarAvances, cargarBitacora, cargarActaDefensa]);

  // ————— Subida de avance (T20, multipart) —————
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleSubirAvance = useCallback(
    async ({ file, titulo, descripcion }) => {
      if (proyectoId == null || !file) return { success: false };
      const result = await avancesApi.subirAvance(proyectoId, { file, titulo, descripcion });
      if (result?.success) {
        notification.success({
          title: 'Avance enviado',
          description: 'Su tutor recibirá el archivo para revisión.',
        });
        setUploadOpen(false);
        await cargarAvances(proyectoId);
      } else {
        notification.error({
          title: 'No se pudo subir el avance',
          description: result?.error || 'Verifique el archivo (PDF o Word) e intente nuevamente.',
        });
      }
      return result;
    },
    [proyectoId, avancesApi, notification, cargarAvances],
  );

  const handleDescargarAvance = useCallback(
    async (avance) => {
      const result = await avancesApi.descargarArchivo(proyectoId, avance);
      if (!result?.success) {
        notification.error({
          title: 'No se pudo descargar el archivo',
          description: result?.error || 'Intente nuevamente en unos instantes.',
        });
      }
    },
    [proyectoId, avancesApi, notification],
  );

  // ————— Confirmación de bitácora (T17, firma digital) —————
  const [confirmandoId, setConfirmandoId] = useState(null);

  const handleConfirmarEntrada = useCallback(
    async (entrada) => {
      if (proyectoId == null || !entrada?.id) return;
      setConfirmandoId(entrada.id);
      try {
        const result = await bitacoraApi.confirmarEntrada(proyectoId, entrada.id);
        if (result?.success) {
          notification.success({
            title: 'Entrada confirmada',
            description: 'Su confirmación equivale a la firma de la planilla de seguimiento.',
          });
          await cargarBitacora(proyectoId);
        } else {
          notification.error({
            title: 'No se pudo confirmar la entrada',
            description: result?.error || 'Intente nuevamente en unos instantes.',
          });
        }
      } finally {
        setConfirmandoId(null);
      }
    },
    [proyectoId, bitacoraApi, notification, cargarBitacora],
  );

  const breadcrumbItems = useMemo(
    () => [{ title: 'Inicio', href: '/' }, { title: 'Titulación' }, { title: 'Mi proyecto de grado' }],
    [],
  );

  return {
    proyecto,
    sinProyecto,
    loading,
    error,
    refetch,
    breadcrumbItems,
    // Avances
    avances: avancesApi.avances,
    loadingAvances: avancesApi.loading,
    descargandoId: avancesApi.descargandoId,
    subiendoAvance: avancesApi.subiendo,
    uploadOpen,
    setUploadOpen,
    handleSubirAvance,
    handleDescargarAvance,
    // Bitácora
    bitacoraEntradas: bitacoraApi.entradas,
    loadingBitacora: bitacoraApi.loading,
    confirmandoId,
    handleConfirmarEntrada,
    // Acta de defensa (D5, solo lectura — sin registrar ni exportar PDF)
    actaDefensa: {
      items: actaDefensaApi.actas,
      loading: actaDefensaApi.loading,
      error: actaDefensaApi.error,
    },
  };
};
