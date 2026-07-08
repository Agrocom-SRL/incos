/**
 * Orquestación ABM de un documento (página completa crear/editar, pantalla
 * única para los 9 tipos del ENUM). Gemelo de
 * `actividades/hooks/state/useActividadForm.js`.
 *
 * Selector de «Reemplaza a» (`documentoPadreId`): un documento con padre es de
 * SEGUNDO ORDEN y REEMPLAZA al padre si este no se presenta (semántica de
 * reemplazo, no herencia). Opciones = documentos BASE (sin padre) activos DEL
 * MISMO tipoDocumento seleccionado y que no sean documentos del sistema —
 * mismas reglas que `validarDocumentoPadre` del backend — excluyendo el propio
 * registro en edición. Reutiliza el endpoint de listado (activos por defecto)
 * y filtra client-side; si el usuario cambia el tipo, el padre elegido que ya
 * no corresponde se limpia.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useCasesFactory } from '@container';
import {
  mapDocumentacionToFormValues,
  mapFormValuesToDocumentacionPayload,
  mapDocumentacionList,
} from '@application-configuracion/documentacion/mappers';
import {
  DOCUMENTACION_BASE,
  documentacionDetallePath,
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/documentacion/config/paths';
import {
  TIPOS_DOCUMENTO_OPTIONS,
  getTipoDocumentoLabel,
} from '@application-configuracion/documentacion/config/tipos';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createDocumentacionFormSections = (documentoPadreOptions) => ({
  datosDocumentacion: {
    title: 'Datos del documento',
    description:
      'Catálogo de tipos de documentos del instituto para todos los trámites. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre',
        type: 'input',
        required: true,
        span: 12,
        placeholder: 'Ej. Fotocopia de cédula de identidad',
        maxLength: 255,
        rules: [MIN_TEXT],
      },
      {
        name: 'tipoDocumento',
        label: 'Tipo de documento',
        type: 'select',
        required: true,
        span: 12,
        placeholder: 'Seleccione…',
        options: TIPOS_DOCUMENTO_OPTIONS,
        showSearch: true,
      },
      {
        name: 'documentoPadreId',
        label: 'Reemplaza a',
        type: 'select',
        span: 12,
        placeholder: 'Ninguno (documento base)',
        allowClear: true,
        showSearch: true,
        options: documentoPadreOptions,
        extra:
          'Documento de segundo orden: si el documento seleccionado no se presenta, este lo reemplaza. Solo documentos base activos del mismo tipo.',
      },
      {
        name: 'orden',
        label: 'Orden',
        type: 'number',
        span: 12,
        min: 0,
        step: 1,
        placeholder: '0',
      },
      {
        name: 'requerido',
        label: '¿Es requerido?',
        type: 'switch',
        span: 12,
        checkedChildren: 'Sí',
        unCheckedChildren: 'No',
      },
      {
        name: 'aceptaFotocopia',
        label: '¿Acepta fotocopia?',
        type: 'switch',
        span: 12,
        checkedChildren: 'Sí',
        unCheckedChildren: 'No',
      },
      {
        name: 'descripcion',
        label: 'Descripción',
        type: 'textarea',
        span: 24,
        rows: 4,
        placeholder: 'Descripción del documento (opcional)',
      },
    ],
  },
});

export const useDocumentacionForm = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const documentacionId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const returnListPath = resolveReturnListPath(location, DOCUMENTACION_BASE);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentosBase, setDocumentosBase] = useState([]);

  // El backend exige que el padre pertenezca al MISMO tipoDocumento
  // (`validarDocumentoPadre`): las opciones reaccionan al tipo elegido.
  const tipoDocumentoSeleccionado = Form.useWatch('tipoDocumento', form);

  const pageTitle = isEditMode ? 'Editar documento' : 'Nuevo documento';
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(documentacionId) || documentacionId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Documentación', href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath],
  );

  const loadDocumentosBase = useCallback(async () => {
    // Sin `incluirInactivos`: el backend devuelve solo activos (candidatos válidos a padre)
    const result = await useCasesFactory
      .obtenerTodaDocumentacion()
      .ejecutar({ params: { limit: 10000 } });
    if (!result?.success) return;
    const lista = mapDocumentacionList(result.data);
    setDocumentosBase(
      lista.filter(
        (d) => d.documentoPadreId == null && !d.esDocumentoSistema && d.id !== documentacionId,
      ),
    );
  }, [documentacionId]);

  const documentoPadreOptions = useMemo(
    () =>
      documentosBase
        .filter((d) => tipoDocumentoSeleccionado && d.tipoDocumento === tipoDocumentoSeleccionado)
        .map((d) => ({
          value: d.id,
          label: `${d.nombre} · ${getTipoDocumentoLabel(d.tipoDocumento)}`,
        })),
    [documentosBase, tipoDocumentoSeleccionado],
  );

  // Si el usuario cambia el tipo, un padre elegido de otro tipo deja de ser
  // válido para el backend: se limpia. (Si el padre no está en la lista — p. ej.
  // quedó inactivo — no se toca, para no perder el dato al editar otra cosa.)
  useEffect(() => {
    const padreId = form.getFieldValue('documentoPadreId');
    if (padreId == null) return;
    const padre = documentosBase.find((d) => d.id === padreId);
    if (padre && padre.tipoDocumento !== tipoDocumentoSeleccionado) {
      form.setFieldValue('documentoPadreId', undefined);
    }
  }, [tipoDocumentoSeleccionado, documentosBase, form]);

  const loadDocumentacion = useCallback(async () => {
    if (!isEditMode) {
      form.setFieldsValue(mapDocumentacionToFormValues(null));
      setLoading(false);
      return;
    }
    if (isInvalidEditId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await useCasesFactory.obtenerDocumentacionPorId().ejecutar(documentacionId);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo cargar el documento');
      }
      form.setFieldsValue(
        mapDocumentacionToFormValues(result.data?.documentacion ?? result.data),
      );
    } catch (e) {
      setError(e?.message || 'Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, isInvalidEditId, documentacionId]);

  useEffect(() => {
    loadDocumentacion();
  }, [loadDocumentacion]);

  useEffect(() => {
    loadDocumentosBase();
  }, [loadDocumentosBase]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToDocumentacionPayload(values);
      const useCase = isEditMode
        ? useCasesFactory.actualizarDocumentacion()
        : useCasesFactory.crearDocumentacion();
      const result = isEditMode
        ? await useCase.ejecutar(documentacionId, payload)
        : await useCase.ejecutar(payload);
      if (!result?.success) {
        throw new Error(result?.error || 'No se pudo guardar el documento');
      }
      notification.success({
        title: isEditMode ? 'Documento actualizado' : 'Documento creado',
      });
      const raw = result.data?.documentacion ?? result.data;
      const savedId = raw?.id ?? documentacionId;
      if (savedId) {
        navigate(documentacionDetallePath(savedId), {
          state: { returnListPath, menuSidebarKey },
          replace: !isEditMode,
        });
      } else {
        handleVolver();
      }
    } catch (e) {
      if (e?.errorFields) {
        setError('Revise los campos obligatorios');
      } else {
        const msg = e?.message || 'No se pudo guardar el documento';
        setError(msg);
        notification.error({ title: 'Error al guardar', description: msg });
      }
    } finally {
      setSubmitLoading(false);
    }
  }, [
    form,
    handleVolver,
    isEditMode,
    documentacionId,
    notification,
    navigate,
    menuSidebarKey,
    returnListPath,
  ]);

  const initialValues = useMemo(() => mapDocumentacionToFormValues(null), []);
  const formSections = useMemo(
    () => createDocumentacionFormSections(documentoPadreOptions),
    [documentoPadreOptions],
  );

  return {
    form,
    pageTitle,
    breadcrumbItems,
    permisoAccion,
    isEditMode,
    loading,
    submitLoading,
    error,
    initialValues,
    formSections,
    handleVolver,
    handleSubmit,
    isInvalidEditId,
  };
};
