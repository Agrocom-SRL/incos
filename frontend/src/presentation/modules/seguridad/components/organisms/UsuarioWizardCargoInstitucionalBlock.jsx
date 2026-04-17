/**
 * Rol institucional y descripción del vínculo referencial (rectorado, directiva, secretaría).
 * Solo aplica a PERSONAL_INSTITUCIONAL; el administrador del sistema no usa este bloque.
 */
import { useMemo } from 'react';
import { Form, Row, Col, Select, Typography } from 'antd';
import { Card } from '@atoms';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';

const { Paragraph, Text } = Typography;

const CARGO_REFERENCIA = {
  RECTOR: {
    titulo: 'Vínculo en rectorado',
    descripcion: 'Quedará asignado como rector del instituto, con la cuenta de usuario vinculada a esta persona.',
  },
  DIR_ACADEMICO: {
    titulo: 'Vínculo en directiva (académico)',
    descripcion:
      'Quedará registrado como director académico del instituto, con la cuenta de usuario vinculada a esta persona.',
  },
  DIR_ADMIN: {
    titulo: 'Vínculo en directiva (administrativo)',
    descripcion:
      'Quedará registrado como director administrativo del instituto, con la cuenta de usuario vinculada a esta persona.',
  },
  SEC_ACADEMICA: {
    titulo: 'Vínculo en secretaría (académica)',
    descripcion:
      'Quedará registrada como secretaría académica del instituto, con la cuenta de usuario vinculada a esta persona.',
  },
  SEC_ADMIN: {
    titulo: 'Vínculo en secretaría (administrativa)',
    descripcion:
      'Quedará registrada como secretaría administrativa del instituto, con la cuenta de usuario vinculada a esta persona.',
  },
};

export default function UsuarioWizardCargoInstitucionalBlock({ form, rolesInstitucional = [] }) {
  const rolId = Form.useWatch('rol_id', form);
  const codigoRol = useMemo(() => {
    if (!rolId || !rolesInstitucional.length) return null;
    const r = rolesInstitucional.find((x) => x.id === rolId);
    return r?.codigo ?? null;
  }, [rolId, rolesInstitucional]);

  const refInfo = codigoRol ? CARGO_REFERENCIA[codigoRol] : null;

  return (
    <Card
      className="form-section"
      variant="outlined"
      shadow={false}
      headerColor="primary"
      title="Cargo en el instituto"
      style={{ marginTop: 24 }}
    >
      <Paragraph type="secondary" style={{ marginBottom: 16 }}>
        Elija el rol que tendrá en el sistema; según la opción quedará asignado al cargo correspondiente en el
        instituto (rectorado, dirección o secretaría), vinculado a la misma ficha de datos personales.
      </Paragraph>
      <Row gutter={[24, 16]}>
        <Col xs={24} md={14} lg={12}>
          <Form.Item
            name="rol_id"
            preserve
            label="Rol institucional"
            rules={[{ required: true, message: 'Seleccione un rol' }]}
          >
            <Select
              placeholder="Seleccionar rol"
              allowClear
              options={rolesInstitucional.map((r) => ({
                value: r.id,
                label: (
                  <span>
                    {r.nombre}{' '}
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      ({TIPO_CONFIG[r.tipo]?.label ?? r.tipo ?? '—'})
                    </Text>
                  </span>
                ),
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
      {refInfo ? (
        <div style={{ marginTop: 8, padding: '12px 16px', background: 'var(--color-bg-layout, #f5f5f5)', borderRadius: 8 }}>
          <Text strong>{refInfo.titulo}</Text>
          <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 8 }}>
            {refInfo.descripcion}
          </Paragraph>
        </div>
      ) : null}
    </Card>
  );
}
