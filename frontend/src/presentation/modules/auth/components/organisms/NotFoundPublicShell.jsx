/**
 * Organismo — layout público 404 (sin panel admin).
 */

import { Card, Divider, Space } from 'antd';
import { AuthLayout } from '@templates';
import { Logo } from '@atoms';
import NotFoundResult from '../molecules/NotFoundResult.jsx';
import '../../styles/login.css';

const NotFoundPublicShell = ({ onGoLogin }) => (
  <AuthLayout>
    <Card className="not-found-page__card not-found-page--public login-card" variant="borderless">
      <Space orientation="vertical" size="large" style={{ width: '100%' }}>
        <div className="not-found-page__brand login-header">
          <div className="login-logo-wrapper">
            <Logo variant="horizontal" size="large" />
          </div>
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <NotFoundResult variant="public" onGoHome={onGoLogin} />
      </Space>
    </Card>
  </AuthLayout>
);

export default NotFoundPublicShell;
