/**
 * AuthLayout - Template para páginas de autenticación
 * 
 * Single Responsibility: Layout centrado para login y registro
 * 
 * Clean Architecture:
 * - Presentation Layer: Template para páginas de autenticación
 * - Diseño centrado y limpio para formularios de autenticación
 */

import { Layout } from 'antd';
import './AuthLayout.css';

const { Content } = Layout;

export const AuthLayout = ({ children }) => {
  return (
    <Layout className="auth-layout">
      <Content className="auth-content">
        <div className="auth-container">
          {children}
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout;
