/**
 * Último paso del wizard de alta de usuario: credenciales y rol.
 * Con vínculo estudiante/docente: el correo viene del registro elegido; se muestra nombre y email de referencia.
 */
import { Form, Row, Col, Input, Select, Tag, Typography } from 'antd';
import { MailOutlined, UserOutlined } from '@ant-design/icons';
import { Card } from '@atoms';
import { TIPO_CONFIG } from '@modules/seguridad/constants/rolTipoConfig.js';
import { getInstitutionalCargoVisual } from '@modules/seguridad/constants/usuarioCargoInstitucionalVisual.jsx';

const { Paragraph, Text } = Typography;

export default function UsuarioWizardCredencialesStepContent({ form, rolesFiltrados = [] }) {
  const watchedCategoria = Form.useWatch('categoria_creacion', form);
  const categoria = watchedCategoria ?? form?.getFieldValue('categoria_creacion');
  const mostrarSelectorRol = categoria !== 'PERSONAL_INSTITUCIONAL';
  const esVinculoReferencia =
    categoria === 'ASIGNAR_ESTUDIANTE' || categoria === 'ASIGNAR_DOCENTE';
  const vinculoNombre = Form.useWatch('vinculo_nombre_display', form);
  const emailVinculo = Form.useWatch('email', form);

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
          {esVinculoReferencia
            ? 'Usuario y contraseña de acceso. El correo institucional es el registrado en la ficha de la persona elegida en el paso anterior.'
            : 'Usuario, correo institucional y contraseña con la que ingresará al sistema.'}
        </Paragraph>
        {esVinculoReferencia ? (
          <Form.Item name="email" preserve hidden rules={[{ required: true, type: 'email' }]}>
            <Input type="hidden" />
          </Form.Item>
        ) : null}
        {esVinculoReferencia && (vinculoNombre || emailVinculo) ? (
          <Paragraph style={{ marginBottom: 16 }}>
            <Text type="secondary">Persona vinculada: </Text>
            <Text strong>{vinculoNombre || '—'}</Text>
            {emailVinculo ? (
              <>
                <br />
                <Text type="secondary">Correo en datos referenciales: </Text>
                <Text strong>{emailVinculo}</Text>
              </>
            ) : null}
          </Paragraph>
        ) : null}
        <Row gutter={[24, 16]}>
          <Col xs={24} md={12}>
            <Form.Item name="username" label="Usuario" rules={[{ required: true }, { max: 50 }]}>
              <Input placeholder="ej: jperez" suffix={<UserOutlined />} />
            </Form.Item>
          </Col>
          {!esVinculoReferencia ? (
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input placeholder="ej: juan.perez@incos-santacruz.edu.bo" suffix={<MailOutlined />} />
              </Form.Item>
            </Col>
          ) : null}
          <Col xs={24} md={12}>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[
                { required: true, message: 'Ingrese la contraseña' },
                { min: 8, message: 'Mínimo 8 caracteres' },
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="password_confirm"
              label="Confirmar contraseña"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Confirme la contraseña' },
                { min: 8, message: 'Mínimo 8 caracteres' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const pwd = getFieldValue('password');
                    if (!value || pwd === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password placeholder="Repita la contraseña" autoComplete="new-password" />
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
                  if (!r) {
                    return (
                      <Text type="warning">Vuelva al paso anterior y elija un rol institucional.</Text>
                    );
                  }
                  const visual = getInstitutionalCargoVisual(r.codigo);
                  const { Icon } = visual;
                  return (
                    <div className="seg-cargo-resumen" style={{ borderColor: visual.color, background: visual.tint }}>
                      <div
                        className="seg-cargo-resumen__icon"
                        style={{ background: visual.tint, color: visual.color }}
                      >
                        <Icon style={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                          Rol institucional elegido
                        </Text>
                        <Text strong style={{ fontSize: 16, display: 'block', marginTop: 2 }}>
                          {r.nombre}
                        </Text>
                        <Tag color={TIPO_CONFIG[r.tipo]?.color ?? 'default'} style={{ marginTop: 6 }}>
                          {TIPO_CONFIG[r.tipo]?.label ?? r.tipo ?? '—'}
                        </Tag>
                      </div>
                    </div>
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
