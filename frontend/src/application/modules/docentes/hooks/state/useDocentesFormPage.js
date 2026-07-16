import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { App, Form } from 'antd';
import dayjs from 'dayjs';
import apiClient from '@api-client';
import { ESTADOS_CIVILES_ENDPOINTS } from '@api/endpoints';
import { useCasesFactory } from '@container';
import { useStudentGeographicApi } from '@application-estudiantes/hooks/api';
import { EXPEDICIONES, GENEROS } from '@infrastructure/config/constants';
import {
  createDocenteWizardSteps,
  DOCENTE_DATOS_PERSONALES_FIELD_NAMES,
  DOCENTE_RESIDENCIA_DEPARTAMENTO_ID,
  DOCENTE_WIZARD_ALL_FIELD_NAMES,
} from '@docentes/config';

const toLabelValueOptions = (values = []) =>
  (Array.isArray(values) ? values : []).map((value) => ({
    label: String(value),
    value: String(value),
  }));

/** ENUM en MAYÚSCULAS → etiqueta legible (solo display; el value no cambia). */
const toCapitalizedLabelOptions = (values = []) =>
  (Array.isArray(values) ? values : []).map((value) => ({
    label: `${String(value).charAt(0)}${String(value).slice(1).toLowerCase()}`,
    value: String(value),
  }));

const toDayjs = (value) => {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
};

const toIsoDate = (value) => {
  if (!value) return null;
  if (typeof value?.format === 'function') return value.format('YYYY-MM-DD');
  return value;
};

const extractProfileFromDocenteApiData = (data) => {
  if (!data || typeof data !== 'object') return {};
  return data.profile ?? data.docente?.profile ?? data.docente ?? data;
};

const mapDetailToForm = (profile = {}) => {
  const deptRes = profile.residenciaDepartamentoId;
  const provinciaEnSantaCruz =
    deptRes == null || Number(deptRes) === DOCENTE_RESIDENCIA_DEPARTAMENTO_ID ? profile.residenciaProvinciaId : undefined;

  const expRaw = profile.expedicion ?? profile.expedicion_ci ?? null;
  const expStr = expRaw != null && String(expRaw).trim() !== '' ? String(expRaw).trim().toUpperCase() : undefined;
  const genStr =
    profile.genero != null && String(profile.genero).trim() !== '' ? String(profile.genero).trim().toUpperCase() : undefined;

  return {
    ci: profile.ci || '',
    expedicion: expStr,
    nombres: profile.nombres || '',
    apellidoPaterno: profile.apellidoPaterno || '',
    apellidoMaterno: profile.apellidoMaterno || '',
    fechaNacimiento: toDayjs(profile.fechaNacimiento),
    genero: genStr,
    estadoCivilId: profile.estadoCivilId ?? undefined,
    nacionalidad: profile.nacionalidad || 'Boliviana',
    celular: profile.celular || '',
    telefono: profile.telefono || '',
    emailPersonal: profile.emailPersonal || '',
    direccion: profile.direccion || '',
    residenciaProvinciaId: provinciaEnSantaCruz ?? undefined,
    municipioResidenciaId: profile.municipioResidenciaId ?? undefined,
    zona: profile.zona || '',
    tituloProfesional: profile.tituloProfesional || '',
    especialidad: profile.especialidad || '',
    nivelAcademico: profile.nivelAcademico || undefined,
    institucionEgreso: profile.institucionEgreso || '',
    anioEgreso: profile.anioEgreso ?? undefined,
    aniosExperiencia: profile.aniosExperiencia ?? 0,
    fechaContratacion: toDayjs(profile.fechaContratacion),
    fechaRetiro: toDayjs(profile.fechaRetiro),
    tipoContrato: profile.tipoContrato || undefined,
    estadoLaboral: profile.estadoLaboral || undefined,
    observaciones: profile.observaciones || '',
    activo: profile.registroActivo !== false,
    maxHorasSemana: profile.maxHorasSemana ?? profile.max_horas_semana ?? 20,
    maxHorasMes: profile.maxHorasMes ?? profile.max_horas_mes ?? 80,
  };
};

const toOptionalInt = (v) => {
  if (v === '' || v === undefined || v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const mapFormToPayload = (values) => ({
  ci: values.ci?.trim(),
  expedicion: values.expedicion || null,
  nombres: values.nombres?.trim(),
  apellidoPaterno: values.apellidoPaterno?.trim() || null,
  apellidoMaterno: values.apellidoMaterno?.trim() || null,
  fechaNacimiento: toIsoDate(values.fechaNacimiento),
  genero: values.genero,
  estadoCivilId: values.estadoCivilId ?? null,
  nacionalidad: values.nacionalidad?.trim() || 'Boliviana',
  celular: values.celular?.trim(),
  telefono: values.telefono?.trim() || null,
  emailPersonal: values.emailPersonal?.trim() || null,
  direccion: values.direccion?.trim() || null,
  municipioResidenciaId: values.municipioResidenciaId ?? null,
  zona: values.zona?.trim() || null,
  tituloProfesional: values.tituloProfesional?.trim() || null,
  especialidad: values.especialidad?.trim() || null,
  nivelAcademico: values.nivelAcademico || null,
  institucionEgreso: values.institucionEgreso?.trim() || null,
  anioEgreso: toOptionalInt(values.anioEgreso),
  aniosExperiencia: toOptionalInt(values.aniosExperiencia) ?? 0,
  fechaContratacion: toIsoDate(values.fechaContratacion),
  fechaRetiro: toIsoDate(values.fechaRetiro),
  tipoContrato: values.tipoContrato || null,
  estadoLaboral: values.estadoLaboral || null,
  observaciones: values.observaciones?.trim() || null,
  activo: values.activo !== false,
  maxHorasSemana: toOptionalInt(values.maxHorasSemana) ?? 20,
  maxHorasMes: toOptionalInt(values.maxHorasMes) ?? 80,
});

export const useDocentesFormPage = (mode = 'create') => {
  const isEditMode = mode === 'edit';
  const { id } = useParams();
  const docenteId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const returnListPath = location.state?.returnListPath || '/docentes/listar';
  const menuSidebarKey = location.state?.menuSidebarKey;

  const { message } = App.useApp();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [estadosCiviles, setEstadosCiviles] = useState([]);
  const [wizardInitialValues, setWizardInitialValues] = useState({
    activo: true,
    nacionalidad: 'Boliviana',
    maxHorasSemana: 20,
    maxHorasMes: 80,
  });
  const [wizardMountKey, setWizardMountKey] = useState(0);

  const wizardSteps = useMemo(() => createDocenteWizardSteps(), []);
  const { provinciasResidencia, municipiosResidencia, loadProvincias, loadMunicipios } = useStudentGeographicApi();
  const prevResidenciaProvinciaRef = useRef(undefined);

  const pageTitle = isEditMode ? 'Editar docente' : 'Registrar docente';
  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Docentes', href: '/docentes/listar' },
      { title: pageTitle },
    ],
    [pageTitle]
  );

  const resolveOptions = useCallback(
    (key) => {
      if (key === 'estadosCivilesDocente') return estadosCiviles.map((x) => ({ value: x.id, label: x.nombre }));
      if (key === 'expedicionesDocente') return toLabelValueOptions(EXPEDICIONES);
      if (key === 'generosDocente') return toCapitalizedLabelOptions(GENEROS);
      if (key === 'docenteProvinciasResidencia') return provinciasResidencia.map((x) => ({ value: x.id, label: x.nombre }));
      if (key === 'docenteMunicipiosResidencia') return municipiosResidencia.map((x) => ({ value: x.id, label: x.nombre }));
      return [];
    },
    [estadosCiviles, provinciasResidencia, municipiosResidencia]
  );

  const loadCatalogs = useCallback(async () => {
    const civilRes = await apiClient.get(ESTADOS_CIVILES_ENDPOINTS.BASE, { params: { limit: 1000 } });
    const civilData = civilRes?.data?.data || [];
    setEstadosCiviles(Array.isArray(civilData) ? civilData : []);
  }, []);

  const loadEditData = useCallback(async () => {
    if (!isEditMode || !Number.isFinite(docenteId) || docenteId < 1) return null;
    const useCase = useCasesFactory.obtenerDocentePorId();
    const result = await useCase.ejecutar(docenteId);
    if (!result?.success) throw new Error(result?.error || 'No se pudo cargar el docente');
    return extractProfileFromDocenteApiData(result.data);
  }, [docenteId, isEditMode]);

  useEffect(() => {
    prevResidenciaProvinciaRef.current = undefined;
  }, [wizardMountKey]);

  useEffect(() => {
    loadProvincias(DOCENTE_RESIDENCIA_DEPARTAMENTO_ID, 'residencia');
  }, [loadProvincias, wizardMountKey]);

  const residenciaProvinciaId = Form.useWatch('residenciaProvinciaId', form);

  useEffect(() => {
    if (!residenciaProvinciaId) {
      loadMunicipios(null, 'residencia');
      prevResidenciaProvinciaRef.current = undefined;
      return;
    }
    loadMunicipios(residenciaProvinciaId, 'residencia');
    if (prevResidenciaProvinciaRef.current !== undefined && prevResidenciaProvinciaRef.current !== residenciaProvinciaId) {
      form.setFieldsValue({ municipioResidenciaId: undefined });
    }
    prevResidenciaProvinciaRef.current = residenciaProvinciaId;
  }, [residenciaProvinciaId, loadMunicipios, form]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadCatalogs();
        await loadProvincias(DOCENTE_RESIDENCIA_DEPARTAMENTO_ID, 'residencia');
        if (isEditMode) {
          const profile = await loadEditData();
          const mapped = mapDetailToForm(profile);
          if (mapped.residenciaProvinciaId) await loadMunicipios(mapped.residenciaProvinciaId, 'residencia');
          else await loadMunicipios(null, 'residencia');
          setWizardInitialValues(mapped);
          form.resetFields();
          form.setFieldsValue(mapped);
          setWizardMountKey((k) => k + 1);
        } else {
          const defaults = {
            activo: true,
            nacionalidad: 'Boliviana',
            maxHorasSemana: 20,
            maxHorasMes: 80,
          };
          setWizardInitialValues(defaults);
          form.resetFields();
          form.setFieldsValue(defaults);
          setWizardMountKey((k) => k + 1);
        }
      } catch (e) {
        setError(e?.message || 'No se pudo cargar el formulario');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isEditMode, loadCatalogs, loadEditData, form, loadMunicipios, loadProvincias]);

  const handleVolver = useCallback(() => {
    navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
  }, [navigate, returnListPath, menuSidebarKey]);

  const handleFinish = useCallback(async () => {
    setSubmitLoading(true);
    setError(null);
    try {
      await form.validateFields(DOCENTE_WIZARD_ALL_FIELD_NAMES);
      const values = form.getFieldsValue(true);
      const payload = mapFormToPayload(values);
      const useCase = isEditMode ? useCasesFactory.actualizarDocente() : useCasesFactory.crearDocente();
      const result = isEditMode ? await useCase.ejecutar(docenteId, payload) : await useCase.ejecutar(payload);
      if (!result?.success) throw new Error(result?.error || 'No se pudo guardar el docente');

      const savedId = result?.data?.id || result?.data?.docente?.id || docenteId;
      message.success(isEditMode ? 'Docente actualizado' : 'Docente creado');
      if (savedId) navigate(`/docentes/${savedId}`, { state: { returnListPath, menuSidebarKey } });
      else navigate(returnListPath, menuSidebarKey != null ? { state: { menuSidebarKey } } : undefined);
    } catch (e) {
      const msg = e?.errorFields ? 'Revise los campos obligatorios del formulario' : e?.message;
      setError(msg || 'No se pudo guardar el docente');
      if (!e?.errorFields) message.error(msg || 'No se pudo guardar el docente');
    } finally {
      setSubmitLoading(false);
    }
  }, [docenteId, form, isEditMode, message, navigate, returnListPath, menuSidebarKey]);

  const onValidateBeforeNext = useCallback((stepNumber, formInstance) => {
    if (stepNumber === 1) return formInstance.validateFields(DOCENTE_DATOS_PERSONALES_FIELD_NAMES);
    return Promise.resolve();
  }, []);

  const finishLabel = isEditMode ? 'Guardar cambios' : 'Registrar docente';
  const isInvalidEditId = isEditMode && (!Number.isFinite(docenteId) || docenteId < 1);

  return {
    isEditMode,
    pageTitle,
    breadcrumbItems,
    loading,
    error,
    submitLoading,
    form,
    wizardMountKey,
    wizardSteps,
    wizardInitialValues,
    resolveOptions,
    onValidateBeforeNext,
    finishLabel,
    handleVolver,
    handleFinish,
    isInvalidEditId,
  };
};

