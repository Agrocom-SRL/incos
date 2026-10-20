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
 *  - autorregistro (Fase B3, extensión 2026-08-17): con `sinProyecto`, el
 *    propio estudiante registra su modalidad de grado (T·CREAR, POST
 *    /mi-proyecto). El backend valida el prerrequisito (3er año, sin
 *    pendientes de 1º/2º) — un 409 se muestra tal cual, sin reimplementar la
 *    regla en frontend. La modalidad PSP (grupal) se excluye del catálogo:
 *    el autorregistro es siempre individual.
 *  - formulario de modalidad de graduación FMDG-1 (Requisito 1, extensión
 *    2026-07-31): reutiliza el mismo export que la ficha admin, disponible
 *    apenas el proyecto existe.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App, Form } from 'antd';
import { useGetMiProyectoGrado } from '@application-titulacion/proyectos-grado/hooks/api/useGetMiProyectoGrado';
import { useAvancesProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useAvancesProyectoApi';
import { useBitacoraProyectoApi } from '@application-titulacion/proyectos-grado/hooks/api/useBitacoraProyectoApi';
import { useActaDefensaApi } from '@application-titulacion/proyectos-grado/hooks/api/useActaDefensaApi';
import { useModalidadesGradoApi } from '@application-titulacion/proyectos-grado/hooks/api/useModalidadesGradoApi';
import { useRegistrarMiProyectoGradoApi } from '@application-titulacion/proyectos-grado/hooks/api/useRegistrarMiProyectoGradoApi';
import { useExportFormularioModalidadPdf } from '@application-titulacion/proyectos-grado/hooks/api/useExportFormularioModalidadPdf';
import { esModalidadGrupal } from '@application-titulacion/utils/titulacionPills';

/** Extensiones permitidas por el contrato (uploadAvanceProyecto: PDF/Word). */
export const AVANCE_ACCEPT = '.pdf,.doc,.docx';

export const useMiProyectoGradoPage = () => {
  const { notification } = App.useApp();
  const [registroForm] = Form.useForm();

  const { proyecto, sinProyecto, loading, error, refetch } = useGetMiProyectoGrado();
  const avancesApi = useAvancesProyectoApi();
  const bitacoraApi = useBitacoraProyectoApi();
  const actaDefensaApi = useActaDefensaApi();
  const modalidadesApi = useModalidadesGradoApi();
  const registrarMiProyectoApi = useRegistrarMiProyectoGradoApi();
  const formularioModalidadApi = useExportFormularioModalidadPdf();

  /** Autorregistro siempre INDIVIDUAL: la modalidad grupal (PSP) se excluye del catálogo. */
  const modalidadOptions = useMemo(
    () => modalidadesApi.options.filter((o) => !esModalidadGrupal(modalidadesApi.modalidadById[o.value]?.codigo)),
    [modalidadesApi.options, modalidadesApi.modalidadById],
  );

  const handleRegistrarProyecto = useCallback(async () => {
    const values = await registroForm.validateFields();
    const result = await registrarMiProyectoApi.registrar({
      titulo: (values.titulo || '').trim(),
      objetivos: (values.objetivos || '').trim() || undefined,
      modalidadId: Number(values.modalidadId),
    });
    if (result?.success) {
      notification.success({
        title: 'Modalidad de grado registrada',
        description: 'Su proyecto de grado quedó registrado. Ya puede descargar el formulario FMDG-1.',
      });
      registroForm.resetFields();
      await refetch();
    } else {
      notification.error({
        title: 'No se pudo registrar su modalidad de grado',
        description: result?.error || 'Intente nuevamente en unos instantes.',
      });
    }
    return result;
  }, [registroForm, registrarMiProyectoApi, notification, refetch]);

  // ————— Formulario de modalidad de graduación FMDG-1 (Requisito 1) —————
  const handleExportarFormularioModalidad = useCallback(async () => {
    const result = await formularioModalidadApi.exportarPdf(proyecto?.id);
    if (!result?.success) {
      notification.error({
        title: 'No se pudo exportar el formulario de modalidad de graduación',
        description: result?.error || 'Intente nuevamente en unos instantes.',
      });
    }
  }, [proyecto?.id, formularioModalidadApi, notification]);

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
    // Autorregistro de modalidad de grado (Fase B3, extensión 2026-08-17)
    registro: {
      form: registroForm,
      modalidadOptions,
      loadingModalidades: modalidadesApi.loading,
      registrando: registrarMiProyectoApi.registrando,
      submit: handleRegistrarProyecto,
    },
    // Formulario de modalidad de graduación FMDG-1 (Requisito 1)
    formularioModalidad: {
      descargando: formularioModalidadApi.descargando,
      exportar: handleExportarFormularioModalidad,
    },
    // Acta de defensa (D5, solo lectura — sin registrar ni exportar PDF)
    actaDefensa: {
      items: actaDefensaApi.actas,
      loading: actaDefensaApi.loading,
      error: actaDefensaApi.error,
    },
  };
};
