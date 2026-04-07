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
import { buildV1FetchUrl } from '@/infrastructure/http/apiClient.js';
import { AUTH_ENDPOINTS } from '@api/endpoints.js';
import './Login.css';

const { Text } = Typography;

function formatApiErrorMessage(json, status) {
  const err = json?.error;
  if (status === 422 && err?.details?.length) {
    return err.details.map((d) => d.message || d.msg || String(d)).join('. ');
  }
  if (typeof err === 'string') return err;
  return err?.message || 'No se pudo iniciar sesión';
}

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
      const res = await fetch(buildV1FetchUrl(AUTH_ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        const token = json.data?.token;
        const usuario = json.data?.usuario;
        if (!token || !usuario) {
          setError('Respuesta del servidor incompleta.');
          return;
        }

        localStorage.setItem('incos_token', token);

        const meRes = await fetch(buildV1FetchUrl(AUTH_ENDPOINTS.ME), {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const meJson = await meRes.json().catch(() => ({}));

        if (!meRes.ok) {
          localStorage.removeItem('incos_token');
          localStorage.removeItem('incos_usuario');
          setError(formatApiErrorMessage(meJson, meRes.status));
          return;
        }

        const permisos = meJson.data?.permisos ?? [];
        login(token, usuario, permisos);
        navigate('/dashboard', { replace: true });
        return;
      }

      if (res.status === 401) {
        setError('Usuario o contraseña incorrectos');
        return;
      }

      if (res.status === 403) {
        const msg =
          typeof json.error === 'string'
            ? json.error
            : json.error?.message || 'no disponible';
        setError(msg.startsWith('Cuenta ') ? msg : `Cuenta ${msg}`);
        return;
      }

      if (res.status === 422) {
        setError(formatApiErrorMessage(json, 422));
        return;
      }

      setError(formatApiErrorMessage(json, res.status));
    } catch (e) {
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
            <Alert type="error" message={error} showIcon closable onClose={() => setError(null)} />
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
              label={<span className="login-label">Usuario</span>}
              rules={[{ required: true, message: 'Por favor ingrese su usuario' }]}
            >
              <Input
                prefix={<UserOutlined className="login-input-icon" />}
                placeholder="Ingrese su usuario"
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
