/**
 * Organismo — formulario de inicio de sesión (solo presentación).
 */

import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Input,
  Space,
  Typography,
} from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { AuthLayout } from '@templates';
import { Logo } from '@atoms';

const { Text } = Typography;

/**
 * @param {import('antd').FormInstance} form
 * @param {boolean} loading
 * @param {string|null} error
 * @param {() => void} clearError
 * @param {boolean} remember
 * @param {(checked: boolean) => void} onRememberChange
 * @param {(values: { username: string, password: string }) => void} onSubmit
 * @param {{ username?: string, password?: string }} initialValues
 * @param {number} minPasswordLength
 */
const LoginFormCard = ({
  form,
  loading,
  error,
  clearError,
  remember,
  onRememberChange,
  onSubmit,
  initialValues,
  minPasswordLength,
}) => (
  <AuthLayout>
    <Card className="login-card" variant="borderless">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div className="login-header">
          <div className="login-logo-wrapper">
            <Logo variant="horizontal" size="large" />
          </div>
          <div className="login-institute-name">
            Instituto Comercial Superior de la Nación INCOS Santa Cruz
          </div>
          <div className="login-tagline">PIONEROS EN EDUCACIÓN SUPERIOR</div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        {error ? (
          <Alert type="error" title={error} showIcon closable onClose={clearError} />
        ) : null}

        <Form
          form={form}
          name="login"
          onFinish={onSubmit}
          layout="vertical"
          size="large"
          autoComplete="on"
          className="login-form"
          initialValues={initialValues}
          validateTrigger={['onBlur', 'onSubmit']}
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
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span className="login-label">Contraseña</span>}
            rules={[{ required: true, message: 'Por favor ingrese su contraseña' }]}
            hasFeedback={false}
          >
            <Input.Password
              prefix={<LockOutlined className="login-input-icon" />}
              placeholder="Ingrese su contraseña"
              autoComplete="current-password"
              className="login-input"
              visibilityToggle
            />
          </Form.Item>

          <div className="login-remember">
            <Checkbox checked={remember} onChange={(e) => onRememberChange(e.target.checked)}>
              Recordar usuario y contraseña en este equipo
            </Checkbox>
          </div>
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 16 }}>
            La sesión del sistema puede vencer por seguridad; esta opción solo evita volver a
            escribir los datos al reingresar (mínimo {minPasswordLength} caracteres al enviar).
          </Text>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
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
          <Text className="login-footer-text">Sistema de gestión académica</Text>
        </div>
      </Space>
    </Card>
  </AuthLayout>
);

export default LoginFormCard;
