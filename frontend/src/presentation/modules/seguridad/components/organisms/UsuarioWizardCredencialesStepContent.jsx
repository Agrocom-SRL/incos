/**
 * Último paso del wizard de alta de usuario: credenciales y rol.
 * El rol institucional (rector, directivo, secretaría) se elige en el paso de perfil.
 */
import { Form, Row, Col, Input, Select, Tag, Typography } from 'antd';
import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';

const { Paragraph } = Typography;

export default function UsuarioWizardCredencialesStepContent({ form, rolesFiltrados = [] }) {
  const watchedCategoria = Form.useWatch('categoria_creacion', form);
  const categoria = watchedCategoria ?? form?.getFieldValue('categoria_creacion');
  const mostrarSelectorRol = categoria !== 'PERSONAL_INSTITUCIONAL';

  return (
    <div className="usuario-wizard-step">
      <Card
        className="form-section"
        variant="outlined"
        shadow={false}
        headerColor="primary"
        title="Credenciales de acceso"
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Usuario, correo institucional y contraseña con la que ingresará al sistema.
        </Paragraph>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item name="username" label="Usuario" rules={[{ required: true }, { max: 50 }]}>
              <Input placeholder="ej: jperez" suffix={<UserOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
              <Input placeholder="ej: juan.perez@incos-santacruz.edu.bo" suffix={<MailOutlined />} />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true }, { min: 8, message: 'Mínimo 8 caracteres' }]}
            >
              <Input.Password placeholder="Mínimo 8 caracteres" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        className="form-section"
        variant="outlined"
        shadow={false}
        headerColor="primary"
        title="Rol en el sistema"
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          {mostrarSelectorRol
            ? 'El rol determina los permisos y debe ser coherente con el tipo de alta elegido en el primer paso.'
            : 'El rol institucional ya se definió en el paso «Datos del perfil» junto con la ficha de personal.'}
        </Paragraph>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12} lg={10}>
            {mostrarSelectorRol ? (
              <Form.Item name="rol_id" label="Rol" rules={[{ required: true, message: 'Seleccione un rol' }]}>
                <Select
                  placeholder="Seleccionar rol"
                  options={rolesFiltrados.map((r) => ({
                    value: r.id,
                    label: (
                      <span>
                        {r.nombre}{' '}
                        <Tag color={TIPO_CONFIG[r.tipo]?.color ?? 'default'}>
                          {TIPO_CONFIG[r.tipo]?.label ?? r.tipo ?? '—'}
                        </Tag>
                      </span>
                    ),
                  }))}
                />
              </Form.Item>
            ) : (
              <Form.Item shouldUpdate={(prev, cur) => prev.rol_id !== cur.rol_id} noStyle>
                {() => {
                  const rid = form.getFieldValue('rol_id');
                  const r = rolesFiltrados.find((x) => x.id === rid);
                  return r ? (
                    <div style={{ marginBottom: 8 }}>
                      <Typography.Text type="secondary">Rol seleccionado: </Typography.Text>
                      <Tag color={TIPO_CONFIG[r.tipo]?.color ?? 'default'}>{r.nombre}</Tag>
                    </div>
                  ) : (
                    <Typography.Text type="warning">Vuelva al paso anterior y elija un rol institucional.</Typography.Text>
                  );
                }}
              </Form.Item>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
}
