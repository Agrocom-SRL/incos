/**
 * Orquestación ABM de un tipo de documentación (página completa crear/editar),
 * parametrizada por `tipoConfig` (tipoDocumento fijo, no editable en el form).
 * Gemelo de `academico/hooks/state/useMateriaForm.js`.
 *
 * Selector de `documentoPadreId`: opciones = otros documentos del MISMO
 * tipoDocumento, excluyendo `esDocumentoSistema` y el propio registro en
 * edición. Se resuelve reutilizando el mismo endpoint de listado (filtrado por
 * tipoDocumento) y filtrando client-side — no hace falta otro endpoint.
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
  documentacionListPath,
  documentacionDetallePath,
  resolveMenuSidebarKey,
  resolveReturnListPath,
} from '@application-configuracion/documentacion/config/paths';

const MIN_TEXT = { min: 2, message: 'Mínimo 2 caracteres' };

const createDocumentacionFormSections = (documentoPadreOptions) => ({
  datosDocumentacion: {
    title: 'Datos del documento',
    description:
      'Documento requerido en el trámite. El estado activo se asigna al crear; la activación/desactivación se gestiona desde el listado.',
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
        name: 'documentoPadreId',
        label: 'Documento padre',
        type: 'select',
        span: 12,
        placeholder: 'Ninguno (documento raíz)',
        allowClear: true,
        showSearch: true,
        options: documentoPadreOptions,
        extra: 'Solo documentos del mismo trámite que no sean generados por el sistema.',
      },
      {
        name: 'orden',
        label: 'Orden',
        type: 'number',
        span: 6,
        min: 0,
        step: 1,
        placeholder: '0',
      },
      {
        name: 'requerido',
        label: '¿Es requerido?',
        type: 'switch',
        span: 6,
        checkedChildren: 'Sí',
        unCheckedChildren: 'No',
      },
      {
        name: 'aceptaFotocopia',
        label: '¿Acepta fotocopia?',
        type: 'switch',
        span: 6,
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

export const useDocumentacionForm = (mode = 'create', tipoConfig) => {
  const { tipoKey, tipoDocumento, label } = tipoConfig ?? {};
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const documentacionId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const location = useLocation();
  const { notification } = App.useApp();
  const [form] = Form.useForm();

  const listPath = documentacionListPath(tipoKey);
  const returnListPath = resolveReturnListPath(location, listPath);
  const menuSidebarKey = resolveMenuSidebarKey(location);

  const [loading, setLoading] = useState(isEditMode);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documentoPadreOptions, setDocumentoPadreOptions] = useState([]);

  const pageTitle = isEditMode ? `Editar documento (${label})` : `Nuevo documento (${label})`;
  const permisoAccion = isEditMode ? 'EDITAR' : 'CREAR';
  const isInvalidEditId = isEditMode && (!Number.isFinite(documentacionId) || documentacionId < 1);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Configuración', href: '/configuracion' },
      { title: 'Documentación', href: returnListPath },
      { title: label, href: returnListPath },
      { title: pageTitle },
    ],
    [pageTitle, returnListPath, label],
  );

  const loadDocumentoPadreOptions = useCallback(async () => {
    if (!tipoDocumento) return;
    const result = await useCasesFactory
      .obtenerTodaDocumentacion()
      .ejecutar({ params: { tipoDocumento, limit: 10000 } });
    if (!result?.success) return;
    const lista = mapDocumentacionList(result.data);
    const options = lista
      .filter((d) => !d.esDocumentoSistema && d.id !== documentacionId)
      .map((d) => ({ value: d.id, label: d.nombre }));
    setDocumentoPadreOptions(options);
  }, [tipoDocumento, documentacionId]);

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
    loadDocumentoPadreOptions();
  }, [loadDocumentoPadreOptions]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleSubmit = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      const values = await form.validateFields();
      const payload = mapFormValuesToDocumentacionPayload(values, tipoDocumento);
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
        navigate(documentacionDetallePath(tipoKey, savedId), {
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
    tipoDocumento,
    tipoKey,
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
