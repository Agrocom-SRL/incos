import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, App, Col, Form, Input, Row, Select, Tag, Typography } from 'antd';
import { MailOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import { PermisoGuard } from '@/presentation/guards/PermisoGuard.jsx';
import { useUsuarios } from '@modules/seguridad/hooks/useUsuarios.js';
import { useRoles } from '@modules/seguridad/hooks/useRoles.js';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { Button, Card } from '@atoms';
import '@modules/seguridad/styles/seguridad.css';

function errMsg(json) {
  const e = json?.error;
  if (json?.error?.details?.length) {
    return json.error.details.map((d) => d.message).join('. ');
  }
  return typeof e === 'string' ? e : e?.message || 'Error';
}

export default function UsuarioCreatePage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const usuariosApi = useUsuarios();
  const rolesApi = useRoles();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const tipoReferencia = Form.useWatch('tipo_referencia', form);

  const breadcrumbItems = useMemo(
    () => [
      { title: 'Inicio', href: '/' },
      { title: 'Seguridad', href: '/seguridad/usuarios' },
      { title: 'Usuarios', href: '/seguridad/usuarios' },
      { title: 'Nuevo Usuario' },
    ],
    []
  );

  useEffect(() => {
    const run = async () => {
      const w = await rolesApi.listRoles();
      if (!w) return;
      const { res, json } = w;
      if (res.ok) {
        setRoles(json.data?.roles || []);
      }
    };
    run();
  }, [rolesApi]);

  const onFinish = async (values) => {
    setSubmitError('');
    setLoading(true);
    const w = await usuariosApi.createUser(values);
    setLoading(false);
    if (!w) return;
    const { res, json } = w;
    if (res.ok) {
      message.success('Usuario creado');
      navigate(`/seguridad/usuarios/${json.data?.id || ''}`);
    } else {
      const text = errMsg(json);
      setSubmitError(text);
      message.error(text);
    }
  };

  return (
    <PermisoGuard
      codigo="seguridad.usuario.crear"
      accion="CREAR"
      fallback={
        <Typography.Text type="danger">No tiene permiso para crear usuarios.</Typography.Text>
      }
    >
      <PageTemplate header={<PageHeader title="Nuevo Usuario" breadcrumbItems={breadcrumbItems} />}>
        <Card
          title={
            <span>
              <UserOutlined /> Datos del Usuario
            </span>
          }
          headerColor="primary"
        >
          {submitError ? <Alert type="error" showIcon message={submitError} style={{ marginBottom: 16 }} /> : null}
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
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
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Contraseña"
                  rules={[{ required: true }, { min: 8, message: 'Mínimo 8 caracteres' }]}
                >
                  <Input.Password placeholder="Mínimo 8 caracteres" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="rol_id" label="Rol" rules={[{ required: true }]}>
                  <Select
                    placeholder="Seleccionar rol"
                    options={roles.map((r) => ({
                      value: r.id,
                      label: (
                        <span>
                          {r.nombre} ({r.codigo}) <Tag color={r.nivel_acceso >= 5 ? 'purple' : 'blue'}>{r.nivel_acceso}</Tag>
                        </span>
                      ),
                    }))}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="tipo_referencia" label="Tipo referencia">
                  <Select
                    allowClear
                    options={['RECTOR', 'DIRECTOR', 'SECRETARIA', 'DOCENTE', 'ESTUDIANTE'].map((v) => ({
                      value: v,
                      label: v,
                    }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                {tipoReferencia ? (
                  <Form.Item name="referencia_id" label={`Referencia ID (${tipoReferencia})`}>
                    <Input type="number" />
                  </Form.Item>
                ) : null}
              </Col>
            </Row>

            <div className="seg-actions">
              <Button variant="default" onClick={() => navigate('/seguridad/usuarios')}>
                Cancelar
              </Button>
              <Button variant="primary" icon={<SaveOutlined />} loading={loading} onClick={() => form.submit()}>
                Crear Usuario
              </Button>
            </div>
          </Form>
        </Card>
      </PageTemplate>
    </PermisoGuard>
  );
}
