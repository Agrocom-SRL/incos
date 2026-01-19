/**
 * Login - Página de inicio de sesión
 * 
 * Single Responsibility: Mostrar formulario de login y manejar autenticación
 * 
 * Clean Architecture:
 * - Presentation Layer: Página de autenticación
 * - Usa: AuthLayout template, useAuthContext hook
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { AuthLayout } from '@templates';
import { useAuthContext } from '@application-auth';
import { Logo } from '@atoms';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      
      if (result.success) {
        message.success('Inicio de sesión exitoso');
        // Redirigir al dashboard después del login
        navigate('/dashboard', { replace: true });
      } else {
        message.error(result.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      message.error('Error al iniciar sesión. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card
        className="login-card"
        bordered={false}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header con logo */}
          <div className="login-header">
            <div className="login-logo-wrapper">
              <Logo variant="horizontal" size="large" />
            </div>
            <div className="login-institute-name">
              El Instituto Comercial Superior de la Nación INCOS Santa Cruz
            </div>
            <div className="login-tagline">
              PIONEROS EN EDUCACIÓN SUPERIOR
            </div>
          </div>

          <Divider style={{ margin: '8px 0' }} />

          {/* Formulario */}
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
              rules={[
                { required: true, message: 'Por favor ingrese su usuario' },
              ]}
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
                icon={<LoginOutlined />}
                className="login-button"
                size="large"
              >
                Iniciar Sesión
              </Button>
            </Form.Item>
          </Form>

          {/* Información adicional */}
          <div className="login-footer">
            <Text className="login-footer-text">
              Sistema de Gestión Académica
            </Text>
          </div>
        </Space>
      </Card>
    </AuthLayout>
  );
};

export default Login;
