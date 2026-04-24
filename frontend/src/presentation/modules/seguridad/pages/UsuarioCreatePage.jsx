import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Form, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useUsuarioDetail, useRolesList } from '@/application/modules/seguridad/hooks';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button } from '@atoms';
import { WizardForm } from '@organisms';
import UsuarioCategoriaCreacionStepContent from '@modules/seguridad/components/organisms/UsuarioCategoriaCreacionStepContent.jsx';
import UsuarioWizardPerfilStepContent from '@modules/seguridad/components/organisms/UsuarioWizardPerfilStepContent.jsx';
import UsuarioWizardCredencialesStepContent from '@modules/seguridad/components/organisms/UsuarioWizardCredencialesStepContent.jsx';
import '@modules/seguridad/styles/seguridad.css';

const ROLES_POR_CATEGORIA = {
  ACCESO_SISTEMA: ['ADMIN_SISTEMA'],
  PERSONAL_INSTITUCIONAL: ['RECTOR', 'DIR_ACADEMICO', 'DIR_ADMIN', 'SEC_ACADEMICA', 'SEC_ADMIN'],
  ASIGNAR_ESTUDIANTE: ['ESTUDIANTE'],
  ASIGNAR_DOCENTE: ['DOCENTE'],
};

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

function loadRolesErrorMessage(e) {
  const msg = e?.message || '';
  if (e?.name === 'TypeError' && (msg.includes('fetch') || msg.includes('Load failed'))) {
    return 'No se pudo conectar con el API. Inicie el backend en el puerto 3000 (p. ej. npm run dev en la carpeta backend) o revise VITE_API_URL / VITE_API_BASE_URL.';
  }
  return errMsg(e);
}

function personalPayloadFromForm(personal) {
  if (!personal || typeof personal !== 'object') return undefined;
  const p = { ...personal };
  delete p.departamentoId;
  delete p.provinciaId;

  const birth = p.birthDate;
  if (birth) {
    try {
      if (typeof birth === 'object' && typeof birth.format === 'function') {
        p.birthDate = birth.format('YYYY-MM-DD');
      } else if (birth instanceof Date && !Number.isNaN(birth.getTime())) {
        p.birthDate = birth.toISOString().slice(0, 10);
      } else if (typeof birth === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(birth)) {
        const [dd, mm, yyyy] = birth.split('-');
        p.birthDate = `${yyyy}-${mm}-${dd}`;
      }
    } catch {
      // El backend validará el formato
    }
  }

  Object.keys(p).forEach((k) => {
    if (p[k] === '' || p[k] === undefined) delete p[k];
  });
  return Object.keys(p).length ? p : undefined;
}

function buildCreatePayload(values) {
  const {
    username,
    password,
    password_confirm: _passwordConfirm,
    vinculo_nombre_display: _vinculoNombre,
    vinculo_email_display: _vinculoEmail,
    rol_id,
    categoria_creacion,
    estudiante_id,
    docente_id,
    personal,
  } = values;

  const base = {
    username: String(username || '').trim(),
    password,
    rol_id,
    categoria_creacion,
  };

  const out = { ...base };
  if (categoria_creacion === 'ASIGNAR_ESTUDIANTE') {
    out.estudiante_id = estudiante_id != null ? Number(estudiante_id) : undefined;
  }
  if (categoria_creacion === 'ASIGNAR_DOCENTE') {
    out.docente_id = docente_id != null ? Number(docente_id) : undefined;
  }
  if (
    (categoria_creacion === 'PERSONAL_INSTITUCIONAL' || categoria_creacion === 'ACCESO_SISTEMA') &&
    personal &&
    typeof personal === 'object'
  ) {
    const cleaned = personalPayloadFromForm(personal);
    if (cleaned) out.personal = cleaned;
  }
  return out;
}

const PERSONAL_FIELD_NAMES = [
  ['personal', 'ci'],
  ['personal', 'expedition'],
  ['personal', 'firstName'],
  ['personal', 'lastName'],
];

function fieldsToValidateOnFinish(categoria) {
  const base = ['categoria_creacion', 'username', 'password', 'password_confirm', 'rol_id'];
  if (categoria === 'ASIGNAR_ESTUDIANTE') base.push('estudiante_id');
  if (categoria === 'ASIGNAR_DOCENTE') base.push('docente_id');
  if (categoria === 'PERSONAL_INSTITUCIONAL' || categoria === 'ACCESO_SISTEMA') {
    base.push(...PERSONAL_FIELD_NAMES);
  }
  return base;
}

function perfilFieldNamesForCategory(categoria) {
  if (categoria === 'ASIGNAR_ESTUDIANTE') return ['estudiante_id'];
  if (categoria === 'ASIGNAR_DOCENTE') return ['docente_id'];
  if (categoria === 'PERSONAL_INSTITUCIONAL') {
    return [...PERSONAL_FIELD_NAMES, 'rol_id'];
  }
  if (categoria === 'ACCESO_SISTEMA') {
    return [...PERSONAL_FIELD_NAMES];
  }
  return [];
}

export default function UsuarioCreatePage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { crear } = useUsuarioDetail();
  const { roles, cargar: cargarRoles } = useRolesList();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const categoria = Form.useWatch('categoria_creacion', form);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: 'Nuevo Usuario' },
    ],
    []
  );

  const rolesFiltrados = useMemo(() => {
    const codes = ROLES_POR_CATEGORIA[categoria];
    if (!codes) return roles;
    const set = new Set(codes);
    const filtered = roles.filter((r) => set.has(r.codigo));
    return filtered.length ? filtered : roles;
  }, [categoria, roles]);

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

  /** Admin / docente / estudiante: un solo rol permitido por categoría; se fija sin selector en credenciales. */
  useEffect(() => {
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
    form.setFieldsValue({ rol_id: candidates[0].id });
  }, [categoria, roles, form]);

  useEffect(() => {
    form.setFieldsValue({
      estudiante_id: undefined,
      docente_id: undefined,
      vinculo_email_display: undefined,
      vinculo_nombre_display: undefined,
      password_confirm: undefined,
    });
  }, [categoria, form]);

  const wizardSteps = useMemo(
    () => [
      {
        title: 'Tipo de alta',
        formTitle: 'Nuevo usuario',
        sections: ['categoria'],
        config: { categoria: {} },
      },
      {
        title: 'Datos del perfil',
        formTitle: 'Ficha o vínculo institucional',
        sections: ['perfil'],
        config: { perfil: {} },
      },
      {
        title: 'Credenciales y rol',
        formTitle: 'Acceso al sistema',
        sections: ['cuenta'],
        config: { cuenta: {} },
      },
    ],
    []
  );

  const onValidateBeforeNext = useCallback((stepNumber, formInstance) => {
    const cat = formInstance.getFieldValue('categoria_creacion');

    if (stepNumber === 1) {
      return formInstance.validateFields(['categoria_creacion']);
    }

    if (stepNumber === 2) {
      const names = perfilFieldNamesForCategory(cat);
      if (!names.length) return Promise.resolve();
      return formInstance.validateFields(names);
    }

    if (stepNumber === 3) {
      return formInstance.validateFields(['username', 'password', 'password_confirm', 'rol_id']);
    }

    return Promise.resolve();
  }, []);

  const handleFinish = useCallback(async () => {
    setSubmitError('');
    const cat = form.getFieldValue('categoria_creacion');
    try {
      await form.validateFields(fieldsToValidateOnFinish(cat));
    } catch {
      message.error('Revise los campos obligatorios del último paso.');
      return;
    }
    setLoading(true);
    try {
      const values = form.getFieldsValue(true);
      const data = await crear(buildCreatePayload(values));
      setLoading(false);
      message.success('Usuario creado');
      navigate(`/seguridad/usuarios/${data?.id || ''}`);
    } catch (e) {
      setLoading(false);
      const text = errMsg(e);
      setSubmitError(text);
      message.error(text);
    }
  }, [form, crear, message, navigate]);

  const renderSectionContent = useCallback(
    (_stepIndex, sectionKey, _section, formInstance) => {
      if (sectionKey === 'categoria') {
        return <UsuarioCategoriaCreacionStepContent key="categoria" form={formInstance} />;
      }
      if (sectionKey === 'perfil') {
        return <UsuarioWizardPerfilStepContent key="perfil" form={formInstance} rolesCatalog={roles} />;
      }
      if (sectionKey === 'cuenta') {
        return (
          <UsuarioWizardCredencialesStepContent
            key="cuenta"
            form={formInstance}
            rolesCatalog={roles}
          />
        );
      }
      return null;
    },
    [roles]
  );

  return (
    <PermisoGuard
      codigo="seguridad.usuario.crear"
      accion="CREAR"
      fallback={
        <Typography.Text type="danger">No tiene permiso para crear usuarios.</Typography.Text>
      }
    >
      <PageTemplate
        header={
          <PageHeader
            title="Nuevo Usuario"
            breadcrumbItems={breadcrumbItems}
            actions={
              <Button variant="default" icon={<ArrowLeftOutlined />} onClick={() => navigate('/seguridad/usuarios')}>
                Volver
              </Button>
            }
          />
        }
      >
        {submitError ? (
          <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} />
        ) : null}
        <WizardForm
          className="seg-usuario-create-wizard"
          steps={wizardSteps}
          form={form}
          loading={loading}
          viewMode={false}
          resolveOptions={() => []}
          initialValues={{ categoria_creacion: 'ACCESO_SISTEMA' }}
          onFinish={handleFinish}
          showSaveButton={false}
          renderSectionContent={renderSectionContent}
          onValidateBeforeNext={onValidateBeforeNext}
          finishLabel="Crear usuario"
          nextLabel="Siguiente"
          prevLabel="Anterior"
        />
      </PageTemplate>
    </PermisoGuard>
  );
}
