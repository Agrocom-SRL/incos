/**
 * Último paso del wizard de alta de usuario: rol asignado (card aparte) + credenciales (FormSection).
 * El rol se muestra en panel blanco con borde y textos en color del catálogo (`getWizardRoleResumenVisual`);
 * no hay selector de `rol_id` aquí. El valor queda por el paso perfil o por reglas en `UsuarioCreatePage`.
 */
import { useMemo } from 'react';
import { Form, Typography, Input } from 'antd';
import { Card } from '@atoms';
import { FormSection } from '@molecules';
import { createUsuarioWizardCredencialesFields } from '@modules/seguridad/config/usuarioWizardCredencialesFields.jsx';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';
import { getWizardRoleResumenVisual } from '@modules/seguridad/constants/usuarioCargoInstitucionalVisual.jsx';

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
    <div
      className="seg-wizard-rol-asignado-panel"
      style={{ borderColor: visual.color }}
      role="status"
      aria-label={`Rol asignado: ${role.nombre}`}
    >
      <div
        className="seg-wizard-rol-asignado-panel__icon"
        style={{ borderColor: visual.color, color: visual.color }}
      >
        <Icon style={{ fontSize: 24 }} />
      </div>
      <div className="seg-wizard-rol-asignado-panel__body">
        <Text strong className="seg-wizard-rol-asignado-panel__nombre" style={{ color: visual.color }}>
          {role.nombre}
        </Text>
        <Text className="seg-wizard-rol-asignado-panel__tipo" style={{ color: visual.color }}>
          {tipoLabel}
        </Text>
      </div>
    </div>
  );
}

export default function UsuarioWizardCredencialesStepContent({ form, rolesCatalog = [] }) {
  const watchedCategoria = Form.useWatch('categoria_creacion', form);
  const categoria = watchedCategoria ?? form?.getFieldValue('categoria_creacion');
  const esVinculoReferencia =
    categoria === 'ASIGNAR_ESTUDIANTE' || categoria === 'ASIGNAR_DOCENTE';
  const vinculoNombre = Form.useWatch('vinculo_nombre_display', form);
  const vinculoEmail = Form.useWatch('vinculo_email_display', form);
  const estudianteId = Form.useWatch('estudiante_id', form);
  const docenteId = Form.useWatch('docente_id', form);
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

    if (esVinculoReferencia && (estudianteId != null || docenteId != null)) {
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
    estudianteId,
    docenteId,
    vinculoNombre,
    vinculoEmail,
    personalEmail,
  ]);

  const flatFields = useMemo(() => createUsuarioWizardCredencialesFields(), []);

  return (
    <div className="usuario-wizard-step">
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

      <Card
        className="form-section"
        variant="outlined"
        shadow={false}
        headerColor="primary"
        title="Rol de acceso al sistema"
      >
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {mensajeOrigenRolAsignacion(categoria)}
        </Paragraph>
        <CredencialesRolAsignadoPanel role={selectedRole} />
      </Card>

      <div style={{ marginTop: 24 }}>
        <FormSection
          title="Credenciales y acceso al sistema"
          description={credencialesDescription}
          fields={flatFields}
          form={form}
          resolveOptions={() => []}
        />
      </div>
    </div>
  );
}
