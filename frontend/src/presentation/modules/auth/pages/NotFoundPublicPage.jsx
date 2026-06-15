/**
 * 404 sin panel administrativo.
 */

import { Navigate } from 'react-router-dom';
import { Flex, Spin } from 'antd';
import { useNotFoundPublicPage } from '@application-auth';
import NotFoundPublicShell from '../components/organisms/NotFoundPublicShell.jsx';
import '../styles/not-found.css';

export default function NotFoundPublicPage() {
  const { isLoading, redirectToPanelNotFound, goLogin } = useNotFoundPublicPage();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (redirectToPanelNotFound) {
    return <Navigate to={redirectToPanelNotFound} replace />;
  }

  return <NotFoundPublicShell onGoLogin={goLogin} />;
}
