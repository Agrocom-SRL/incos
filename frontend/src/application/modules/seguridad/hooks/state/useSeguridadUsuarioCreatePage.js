import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { App, Form } from 'antd';
import { useUsuarioDetail } from '@/application/modules/seguridad/hooks/state/useUsuarioDetail';
import { useRolesList } from '@/application/modules/seguridad/hooks/state/useRolesList';
import {
  ROLES_POR_CATEGORIA,
  buildCreatePayload,
  categoriaDesdeUsuario,
  errMsg,
  fieldsToValidateOnFinish,
  fieldsToValidateOnFinishEdit,
  getCategoriaResetPatch,
  getCreatePageInitialValues,
  getEditPageInitialValues,
  loadRolesErrorMessage,
  perfilFieldNamesForCategory,
} from './useSeguridadUsuarioCreatePage.helpers.js';

export const useSeguridadUsuarioCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = Number.isFinite(Number(id)) && String(location.pathname).includes('/editar');
  const editingUserId = isEditMode ? Number(id) : null;
  const requestedInitialStepRaw = isEditMode
    ? location.state?.editInitialStep
    : location.state?.createInitialStep;
  const requestedInitialStep = Number(requestedInitialStepRaw);
  const forcedCategoriaCreacion = location.state?.forceCategoriaCreacion;
  const forcedRoleCode = location.state?.forceRoleCode;
  const prefillDocenteUsuario = location.state?.prefillDocenteUsuario;
  const prefillEstudianteUsuario = location.state?.prefillEstudianteUsuario;
  const isCreateFromDocenteDetail =
    !isEditMode &&
    forcedCategoriaCreacion === 'ASIGNAR_DOCENTE' &&
    Number.isFinite(Number(prefillDocenteUsuario?.docenteId));
  const isCreateFromEstudianteDetail =
    !isEditMode &&
    forcedCategoriaCreacion === 'ASIGNAR_ESTUDIANTE' &&
    Number.isFinite(Number(prefillEstudianteUsuario?.estudianteId));
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { crear, actualizar, cargar } = useUsuarioDetail();
  const { roles, cargar: cargarRoles } = useRolesList();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const categoria = Form.useWatch('categoria_creacion', form);
  const prevCategoriaRef = useRef(undefined);
  const categoriaFijada = useMemo(
    () => (isEditMode ? categoriaDesdeUsuario(usuarioEditando) : undefined),
    [isEditMode, usuarioEditando]
  );
  const wizardInitialStep = useMemo(() => {
    if (Number.isFinite(requestedInitialStep) && requestedInitialStep >= 0) {
      return requestedInitialStep;
    }
    if (isEditMode && categoriaFijada === 'ACCESO_SISTEMA') {
      return 1; // paso 2: Datos del perfil
    }
    return 0;
  }, [requestedInitialStep, isEditMode, categoriaFijada]);

  const usuarioAltaInitialValues = useMemo(() => {
    if (isEditMode) return getEditPageInitialValues(usuarioEditando);
    return getCreatePageInitialValues({
      prefillDocenteUsuario: location.state?.prefillDocenteUsuario,
      prefillEstudianteUsuario: location.state?.prefillEstudianteUsuario,
    });
  }, [isEditMode, usuarioEditando, location.state?.prefillDocenteUsuario, location.state?.prefillEstudianteUsuario]);

  const wizardFormMountKey = useMemo(() => {
    if (isEditMode) return `usuario-editar-${editingUserId}`;
    if (prefillDocenteUsuario?.docenteId) return `prefill-docente-${prefillDocenteUsuario.docenteId}`;
    if (prefillEstudianteUsuario?.estudianteId) return `prefill-estudiante-${prefillEstudianteUsuario.estudianteId}`;
    return 'usuario-nuevo';
  }, [isEditMode, editingUserId, prefillDocenteUsuario?.docenteId, prefillEstudianteUsuario?.estudianteId]);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: isEditMode ? `Editar Usuario #${editingUserId}` : 'Nuevo Usuario' },
    ],
    [isEditMode, editingUserId]
  );

  const rolesFiltrados = useMemo(() => {
    const codes = ROLES_POR_CATEGORIA[categoria];
    if (!codes) return roles;
    const set = new Set(codes);
    const filtered = roles.filter((r) => set.has(r.codigo));
    return filtered.length ? filtered : roles;
  }, [categoria, roles]);

  useEffect(() => {
    if (!isEditMode || !editingUserId) return;
    const run = async () => {
      setLoading(true);
      try {
        const usuario = await cargar(editingUserId);
        setUsuarioEditando(usuario || null);
        form.setFieldsValue(getEditPageInitialValues(usuario));
      } catch (e) {
        const text = errMsg(e);
        setSubmitError(text);
        message.error(text);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [isEditMode, editingUserId, cargar, form, message]);

  useEffect(() => {
    const run = async () => {
      try {
        await cargarRoles();
      } catch (e) {
        message.error(loadRolesErrorMessage(e));
      }
    };
    run();
  }, [cargarRoles, message]);

  useEffect(() => {
    const rid = form.getFieldValue('rol_id');
    if (!rid || !rolesFiltrados.length) return;
    const ok = rolesFiltrados.some((r) => r.id === rid);
    if (!ok) form.setFieldsValue({ rol_id: undefined });
  }, [categoria, rolesFiltrados, form]);

  useEffect(() => {
    if (isEditMode) return;
    if (!forcedCategoriaCreacion) return;
    const current = form.getFieldValue('categoria_creacion');
    if (current !== forcedCategoriaCreacion) {
      form.setFieldsValue({ categoria_creacion: forcedCategoriaCreacion });
    }
  }, [isEditMode, forcedCategoriaCreacion, form]);

  useEffect(() => {
    if (!isCreateFromDocenteDetail) return;
    const docenteId = Number(prefillDocenteUsuario?.docenteId);
    if (!Number.isFinite(docenteId) || docenteId < 1) return;
    const patch = {};
    const currentCategoria = form.getFieldValue('categoria_creacion');
    const currentDocenteId = Number(form.getFieldValue('docente_id'));
    const currentNombre = form.getFieldValue('vinculo_nombre_display');
    const currentEmail = form.getFieldValue('vinculo_email_display');
    const currentCi = form.getFieldValue('vinculo_ci_display');
    if (currentCategoria !== 'ASIGNAR_DOCENTE') {
      patch.categoria_creacion = 'ASIGNAR_DOCENTE';
    }
    if (!Number.isFinite(currentDocenteId) || currentDocenteId !== docenteId) {
      patch.docente_id = docenteId;
    }
    if (!currentNombre && prefillDocenteUsuario?.nombreCompleto) {
      patch.vinculo_nombre_display = prefillDocenteUsuario.nombreCompleto;
    }
    if (!currentEmail && prefillDocenteUsuario?.emailPersonal) {
      patch.vinculo_email_display = prefillDocenteUsuario.emailPersonal;
    }
    if (!currentCi && prefillDocenteUsuario?.ciCompleto) {
      patch.vinculo_ci_display = prefillDocenteUsuario.ciCompleto;
    }
    if (Object.keys(patch).length > 0) {
      form.setFieldsValue(patch);
    }
  }, [isCreateFromDocenteDetail, prefillDocenteUsuario, form]);

  useEffect(() => {
    if (!isCreateFromEstudianteDetail) return;
    const estudianteId = Number(prefillEstudianteUsuario?.estudianteId);
    if (!Number.isFinite(estudianteId) || estudianteId < 1) return;
    const patch = {};
    const currentCategoria = form.getFieldValue('categoria_creacion');
    const currentEstudianteId = Number(form.getFieldValue('estudiante_id'));
    const currentNombre = form.getFieldValue('vinculo_nombre_display');
    const currentEmail = form.getFieldValue('vinculo_email_display');
    const currentCi = form.getFieldValue('vinculo_ci_display');
    const currentCodigo = form.getFieldValue('vinculo_codigo_display');
    if (currentCategoria !== 'ASIGNAR_ESTUDIANTE') {
      patch.categoria_creacion = 'ASIGNAR_ESTUDIANTE';
    }
    if (!Number.isFinite(currentEstudianteId) || currentEstudianteId !== estudianteId) {
      patch.estudiante_id = estudianteId;
    }
    if (!currentNombre && prefillEstudianteUsuario?.nombreCompleto) {
      patch.vinculo_nombre_display = prefillEstudianteUsuario.nombreCompleto;
    }
    if (!currentEmail && prefillEstudianteUsuario?.emailPersonal) {
      patch.vinculo_email_display = prefillEstudianteUsuario.emailPersonal;
    }
    if (!currentCi && prefillEstudianteUsuario?.ciCompleto) {
      patch.vinculo_ci_display = prefillEstudianteUsuario.ciCompleto;
    }
    if (!currentCodigo && prefillEstudianteUsuario?.codigo) {
      patch.vinculo_codigo_display = prefillEstudianteUsuario.codigo;
    }
    if (Object.keys(patch).length > 0) {
      form.setFieldsValue(patch);
    }
  }, [isCreateFromEstudianteDetail, prefillEstudianteUsuario, form]);

  useEffect(() => {
    if (!isEditMode && forcedRoleCode && roles?.length) {
      const forced = roles.find((r) => r.codigo === forcedRoleCode);
      const rid = Number(form.getFieldValue('rol_id'));
      if (forced && rid !== forced.id) {
        form.setFieldsValue({ rol_id: forced.id });
      }
    }
    if (!roles?.length || !categoria) return;
    if (categoria === 'PERSONAL_INSTITUCIONAL') return;
    const allowed = ROLES_POR_CATEGORIA[categoria];
    if (!allowed?.length) return;
    const candidates = roles.filter((r) => allowed.includes(r.codigo));
    if (candidates.length === 0) return;
    const rid = form.getFieldValue('rol_id');
    const idNum = Number(rid);
    const stillValid = Number.isFinite(idNum) && candidates.some((r) => r.id === idNum);
    if (stillValid) return;
    if (!isEditMode && forcedRoleCode) {
      const forced = candidates.find((r) => r.codigo === forcedRoleCode);
      if (forced) {
        form.setFieldsValue({ rol_id: forced.id });
        return;
      }
    }
    form.setFieldsValue({ rol_id: candidates[0].id });
  }, [categoria, roles, form, isEditMode, forcedRoleCode]);

  useEffect(() => {
    if (isEditMode && categoriaFijada && categoria && categoria !== categoriaFijada) {
      form.setFieldsValue({ categoria_creacion: categoriaFijada });
    }
    const prev = prevCategoriaRef.current;
    prevCategoriaRef.current = categoria;
    if (isEditMode) return;
    form.setFieldsValue(getCategoriaResetPatch(categoria, prev));
  }, [categoria, form, isEditMode, categoriaFijada]);

  const wizardSteps = useMemo(
    () => [
      { title: 'Tipo de alta', formTitle: isEditMode ? 'Editar usuario' : 'Nuevo usuario', sections: ['categoria'], config: { categoria: {} } },
      { title: 'Datos del perfil', formTitle: 'Ficha o vínculo institucional', sections: ['perfil'], config: { perfil: {} } },
      { title: 'Credenciales', formTitle: 'Acceso al sistema', sections: ['cuenta'], config: { cuenta: {} } },
    ],
    [isEditMode]
  );

  const onValidateBeforeNext = useCallback((stepNumber, formInstance) => {
    const cat = formInstance.getFieldValue('categoria_creacion');
    if (stepNumber === 1) return formInstance.validateFields(['categoria_creacion']);
    if (stepNumber === 2) {
      const names = perfilFieldNamesForCategory(cat);
      if (!names.length) return Promise.resolve();
      return formInstance.validateFields(names);
    }
    if (stepNumber === 3) {
      if (isEditMode) {
        return formInstance.validateFields(['username', 'rol_id']);
      }
      return formInstance.validateFields(['username', 'password', 'password_confirm', 'rol_id']);
    }
    return Promise.resolve();
  }, [isEditMode]);

  const handleFinish = useCallback(async () => {
    setSubmitError('');
    const cat = form.getFieldValue('categoria_creacion');
    try {
      await form.validateFields(isEditMode ? fieldsToValidateOnFinishEdit(cat) : fieldsToValidateOnFinish(cat));
    } catch {
      message.error('Revise los campos obligatorios del último paso.');
      return;
    }
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
      const payload = buildCreatePayload(values, { isEditMode });
      if (isEditMode && editingUserId) {
        await actualizar(editingUserId, payload);
        message.success('Usuario actualizado');
        navigate(`/seguridad/usuarios/${editingUserId}`);
      } else {
        const data = await crear(payload);
        message.success('Usuario creado');
        navigate(`/seguridad/usuarios/${data?.id || ''}`);
      }
    } catch (e) {
      const text = errMsg(e);
      setSubmitError(text);
      message.error(text);
    } finally {
      setLoading(false);
    }
  }, [form, isEditMode, editingUserId, crear, actualizar, message, navigate]);

  const goToUsuariosList = useCallback(() => {
    const returnTo = location.state?.returnToPath;
    if (typeof returnTo === 'string' && returnTo.trim() !== '') {
      navigate(returnTo);
      return;
    }
    navigate('/seguridad/usuarios');
  }, [navigate, location.state]);

  return {
    form,
    roles,
    loading,
    submitError,
    prefillDocenteUsuario,
    prefillEstudianteUsuario,
    isEditMode,
    categoriaFijada,
    wizardInitialStep,
    wizardFormMountKey,
    breadcrumbItems,
    wizardSteps,
    usuarioAltaInitialValues,
    onValidateBeforeNext,
    handleFinish,
    goToUsuariosList,
  };
};
