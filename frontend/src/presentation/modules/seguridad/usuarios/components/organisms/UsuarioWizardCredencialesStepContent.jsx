/**
 * Último paso del wizard de alta de usuario: rol asignado (card aparte) + credenciales (FormSection).
 * El rol se muestra en panel blanco con borde y textos en color del catálogo (`getWizardRoleResumenVisual`);
 * no hay selector de `rol_id` aquí. El valor queda por el paso perfil o por reglas en `UsuarioCreatePage`.
 */
import { useMemo } from 'react';
import { Col, Flex, Form, Input, Row, Space, Typography } from 'antd';
import UsuarioFormSection from './UsuarioFormSection.jsx';
import { createUsuarioWizardCredencialesFields } from '@modules/seguridad/usuarios/config/usuarioWizardCredencialesFields.jsx';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';
import { getWizardRoleResumenVisual } from '@modules/seguridad/usuarios/constants/usuarioCargoInstitucionalVisual.jsx';

const { Paragraph, Text } = Typography;

function resolveSelectedRole(rolId, rolesCatalog) {
  if (rolId == null || rolId === '') return null;
  const id = Number(rolId);
  if (!Number.isFinite(id)) return null;
  return rolesCatalog.find((r) => r.id === id) || null;
}

/** Texto de contexto: cómo se obtuvo el rol según el tipo de alta (paso 1 y, si aplica, paso 2). */
function mensajeOrigenRolAsignacion(categoria) {
  switch (categoria) {
    case 'PERSONAL_INSTITUCIONAL':
      return (
        <>
          El rol de acceso es el <strong>cargo institucional</strong> que eligió en el paso anterior
          («Datos del perfil»): rectorado, dirección académica o administrativa, o secretaría académica o
          administrativa. No puede cambiarse aquí.
        </>
      );
    case 'ACCESO_SISTEMA':
      return (
        <>
          Al elegir <strong>Cuenta solo sistema</strong> en el primer paso, el sistema asigna el rol de{' '}
          <strong>administrador del sistema</strong> de forma automática.
        </>
      );
    case 'ASIGNAR_ESTUDIANTE':
      return (
        <>
          Al elegir <strong>Acceso a estudiante</strong> y vincular una ficha en el paso anterior, el rol de
          acceso es el de <strong>estudiante</strong>, asignado automáticamente.
        </>
      );
    case 'ASIGNAR_DOCENTE':
      return (
        <>
          Al elegir <strong>Acceso a docente</strong> y vincular una ficha en el paso anterior, el rol de
          acceso es el de <strong>docente</strong>, asignado automáticamente.
        </>
      );
    default:
      return 'El rol de acceso se definió en los pasos anteriores según el tipo de alta.';
  }
}

/**
 * Panel de solo lectura: fondo blanco, borde y textos en color del rol (`usuarioCargoInstitucionalVisual`).
 */
function CredencialesRolAsignadoPanel({ role }) {
  if (!role?.codigo) {
    return (
      <Paragraph type="warning" style={{ marginBottom: 0, marginTop: 12 }}>
        No hay rol asignado aún. Revise el paso anterior (cargo institucional o tipo de alta) y que el catálogo
        de roles haya cargado.
      </Paragraph>
    );
  }

  const visual = getWizardRoleResumenVisual(role.codigo);
  const { Icon } = visual;
  const tipoLabel = TIPO_CONFIG[role.tipo]?.label ?? role.tipo ?? '—';

  return (
    <Flex
      className="seg-wizard-rol-asignado-panel"
      style={{ borderColor: visual.color }}
      role="status"
      aria-label={`Rol asignado: ${role.nombre}`}
      align="center"
      gap={12}
    >
      <Flex
        className="seg-wizard-rol-asignado-panel__icon"
        style={{ borderColor: visual.color, color: visual.color }}
        align="center"
        justify="center"
      >
        <Icon style={{ fontSize: 24 }} />
      </Flex>
      <Flex className="seg-wizard-rol-asignado-panel__body" vertical>
        <Text strong className="seg-wizard-rol-asignado-panel__nombre" style={{ color: visual.color }}>
          {role.nombre}
        </Text>
        <Text className="seg-wizard-rol-asignado-panel__tipo" style={{ color: visual.color }}>
          {tipoLabel}
        </Text>
      </Flex>
    </Flex>
  );
}

function adaptFieldsForEdit(flatFields, isEditMode, esVinculoReferencia = false) {
  return flatFields.map((field) => {
    const esPassword = field.name === 'password' || field.name === 'password_confirm';
    if (!esPassword) return field;

    if (isEditMode) {
      return {
        ...field,
        required: false,
        rules: [],
        placeholder: field.name === 'password' ? 'Dejar vacío para conservar actual' : 'Solo si cambia contraseña',
      };
    }

    // Alta de estudiante/docente: la credencial por defecto es el C.I. (sin extensión), que puede
    // tener menos de 8 dígitos. Se relaja el mínimo para que el admin solo confirme; sigue editable.
    if (esVinculoReferencia) {
      const confirmRule =
        field.name === 'password_confirm'
          ? [
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const pwd = getFieldValue('password');
                  if (!value || pwd === value) return Promise.resolve();
                  return Promise.reject(new Error('Las contraseñas no coinciden'));
                },
              }),
            ]
          : [];
      return {
        ...field,
        rules: [{ min: 4, message: 'Mínimo 4 caracteres' }, ...confirmRule],
        placeholder: field.name === 'password' ? 'Por defecto el C.I. (editable)' : 'Repita la contraseña',
      };
    }

    return field;
  });
}

export default function UsuarioWizardCredencialesStepContent({ form, rolesCatalog = [], isEditMode = false }) {
  const watchedCategoria = Form.useWatch('categoria_creacion', form);
  const categoria = watchedCategoria ?? form?.getFieldValue('categoria_creacion');
  const esVinculoReferencia =
    categoria === 'ASIGNAR_ESTUDIANTE' || categoria === 'ASIGNAR_DOCENTE';
  const watchedVinculoNombre = Form.useWatch('vinculo_nombre_display', form);
  const watchedVinculoEmail = Form.useWatch('vinculo_email_display', form);
  const watchedEstudianteId = Form.useWatch('estudiante_id', form);
  const watchedDocenteId = Form.useWatch('docente_id', form);
  const watchedVinculoCi = Form.useWatch('vinculo_ci_display', form);
  const watchedVinculoCodigo = Form.useWatch('vinculo_codigo_display', form);
  const vinculoNombre = watchedVinculoNombre ?? form?.getFieldValue('vinculo_nombre_display');
  const vinculoEmail = watchedVinculoEmail ?? form?.getFieldValue('vinculo_email_display');
  const estudianteId = watchedEstudianteId ?? form?.getFieldValue('estudiante_id');
  const docenteId = watchedDocenteId ?? form?.getFieldValue('docente_id');
  const vinculoCi = watchedVinculoCi ?? form?.getFieldValue('vinculo_ci_display');
  const vinculoCodigo = watchedVinculoCodigo ?? form?.getFieldValue('vinculo_codigo_display');
  const personalEmail = Form.useWatch(['personal', 'personalEmail'], form);
  const rolId = Form.useWatch('rol_id', form);

  const selectedRole = useMemo(
    () => resolveSelectedRole(rolId, rolesCatalog),
    [rolId, rolesCatalog]
  );

  const credencialesDescription = useMemo(() => {
    const lines = [];

    lines.push(
      <Paragraph key="intro" type="secondary" style={{ marginBottom: 0 }}>
        {esVinculoReferencia
          ? 'Defina el usuario y la contraseña de acceso. El correo de contacto es el de la ficha de la persona elegida en el paso anterior (no se guarda en la cuenta).'
          : 'Defina el usuario y la contraseña con la que ingresará al sistema. El correo de contacto queda en la ficha personal del paso anterior, si lo registró.'}
      </Paragraph>
    );
    if (isEditMode) {
      lines.push(
        <Paragraph key="edit-help" type="secondary" style={{ marginBottom: 0, marginTop: 8 }}>
          Puede cambiar usuario y rol. La contraseña es opcional: solo complete ambos campos si desea reemplazarla.
        </Paragraph>
      );
    }

    const tieneVinculoSeleccionado =
      estudianteId != null ||
      docenteId != null ||
      Boolean(vinculoNombre) ||
      Boolean(vinculoEmail) ||
      Boolean(vinculoCi) ||
      Boolean(vinculoCodigo);

    if (esVinculoReferencia && tieneVinculoSeleccionado) {
      lines.push(
        <Paragraph key="vinc-nom" style={{ marginBottom: 4, marginTop: 12 }}>
          <Text type="secondary">Persona vinculada: </Text>
          <Text strong>{vinculoNombre || '—'}</Text>
        </Paragraph>
      );
      lines.push(
        <Paragraph key="vinc-mail" style={{ marginBottom: 0 }}>
          <Text type="secondary">Correo en ficha: </Text>
          {vinculoEmail ? (
            <Text strong>{vinculoEmail}</Text>
          ) : (
            <Text type="warning">Sin correo registrado en la ficha</Text>
          )}
        </Paragraph>
      );
    } else if (!esVinculoReferencia && personalEmail) {
      lines.push(
        <Paragraph key="ficha-mail" type="secondary" style={{ marginBottom: 0, marginTop: 12 }}>
          Correo en ficha: <Text strong>{String(personalEmail).trim()}</Text>
        </Paragraph>
      );
    }

    return <>{lines}</>;
  }, [
    esVinculoReferencia,
    isEditMode,
    estudianteId,
    docenteId,
    vinculoNombre,
    vinculoEmail,
    vinculoCi,
    vinculoCodigo,
    personalEmail,
  ]);

  const vinculoResumenDescription = useMemo(() => {
    const lines = [];
    if (vinculoNombre) lines.push(`Nombre: ${vinculoNombre}`);
    if (vinculoCi) lines.push(`CI: ${vinculoCi}`);
    if (vinculoCodigo) lines.push(`Código: ${vinculoCodigo}`);
    if (vinculoEmail) lines.push(`Correo: ${vinculoEmail}`);
    return lines.join(' | ');
  }, [vinculoNombre, vinculoCi, vinculoCodigo, vinculoEmail]);

  const mostrarResumenVinculo = useMemo(() => {
    if (!esVinculoReferencia) return false;
    return Boolean(estudianteId || docenteId || vinculoNombre || vinculoEmail || vinculoCi || vinculoCodigo);
  }, [esVinculoReferencia, estudianteId, docenteId, vinculoNombre, vinculoEmail, vinculoCi, vinculoCodigo]);

  const flatFields = useMemo(
    () => adaptFieldsForEdit(createUsuarioWizardCredencialesFields(), isEditMode, esVinculoReferencia),
    [isEditMode, esVinculoReferencia]
  );

  return (
    <Space orientation="vertical" size={24} style={{ width: '100%' }} className="usuario-wizard-step">
      <Form.Item
        name="rol_id"
        preserve
        hidden
        rules={[
          {
            required: true,
            message: 'Falta el rol de acceso. Complete el paso anterior o espere a cargar los roles.',
          },
        ]}
      >
        <Input type="hidden" />
      </Form.Item>

      <UsuarioFormSection
        title="Rol de acceso al sistema"
        beforeFields={
          <>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {mensajeOrigenRolAsignacion(categoria)}
            </Paragraph>
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {mostrarResumenVinculo ? (
                <Col xs={24} md={12}>
                  <div className="seg-wizard-vinculo-resumen">
                    <Text type="secondary">
                      {estudianteId ? 'Estudiante vinculado' : 'Docente vinculado'}
                    </Text>
                    <Text strong>
                      {vinculoResumenDescription || 'Se vinculó una persona en el paso anterior.'}
                    </Text>
                  </div>
                </Col>
              ) : null}
              <Col xs={24} md={mostrarResumenVinculo ? 12 : 24}>
                <CredencialesRolAsignadoPanel role={selectedRole} />
              </Col>
            </Row>
          </>
        }
      />

      <UsuarioFormSection
        title="Credenciales y acceso al sistema"
        description={credencialesDescription}
        fields={flatFields}
        form={form}
        resolveOptions={() => []}
      />
    </Space>
  );
}
