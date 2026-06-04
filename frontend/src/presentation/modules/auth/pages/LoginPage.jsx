import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { AuthLayout } from '@templates';
import { Logo } from '@atoms';
import { useAuth } from '@application-auth';
import { authenticateCredentials } from '@application/modules/auth/utils/authenticateCredentials.js';
import './Login.css';

const { Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  const handleSubmit = async ({ username, password }) => {
    setError(null);
    setLoading(true);

    try {
      const { token, usuario, permisos } = await authenticateCredentials({ username, password });
      login(token, usuario, permisos);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      const status = e?.status;
      const payload = e?.payload;

      if (status === 401) {
        setError('Usuario o contraseña incorrectos');
        return;
      }

      if (status === 403) {
        const msg =
          typeof payload?.error === 'string'
            ? payload.error
            : payload?.error?.message || e?.message || 'no disponible';
        setError(msg.startsWith('Cuenta ') ? msg : `Cuenta ${msg}`);
        return;
      }

      if (status === 422) {
        setError(e.message);
        return;
      }

      if (status) {
        setError(e.message);
        return;
      }

      console.error(e);
      setError('Error de red. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="login-card" variant="borderless">
        <Space orientation="vertical" size="large" style={{ width: '100%' }}>
          <div className="login-header">
            <div className="login-logo-wrapper">
              <Logo variant="horizontal" size="large" />
            </div>
            <div className="login-institute-name">
              El Instituto Comercial Superior de la Nación INCOS Santa Cruz
            </div>
            <div className="login-tagline">PIONEROS EN EDUCACIÓN SUPERIOR</div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {error ? (
            <Alert type="error" title={error} showIcon closable onClose={() => setError(null)} />
          ) : null}

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            autoComplete="off"
            className="login-form"
          >
            <Form.Item
              name="username"
              label={<span className="login-label">Usuario o correo</span>}
              rules={[{ required: true, message: 'Por favor ingrese su usuario o correo' }]}
            >
              <Input
                prefix={<UserOutlined className="login-input-icon" />}
                placeholder="Usuario o correo de su ficha"
                autoComplete="username"
                className="login-input"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="login-label">Contraseña</span>}
              rules={[
                { required: true, message: 'Por favor ingrese su contraseña' },
                { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="login-input-icon" />}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                className="login-input"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                disabled={loading}
                icon={<LoginOutlined />}
                className="login-button"
                size="large"
              >
                Ingresar
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <Text className="login-footer-text">Sistema de Gestión Académica</Text>
          </div>
        </Space>
      </Card>
    </AuthLayout>
  );
}
