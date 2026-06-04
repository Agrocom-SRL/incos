/**
 * errorElement raíz: reemplaza el mensaje técnico de React Router.
 */

import { Navigate } from 'react-router-dom';
import { Flex, Spin } from 'antd';
import { useNotFoundRouteError } from '@application-auth';
import NotFoundPublicPage from './NotFoundPublicPage.jsx';

export default function NotFoundRouteError() {
  const { isLoading, redirectTo, showPublicNotFound } = useNotFoundRouteError();

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  if (showPublicNotFound) {
    return <NotFoundPublicPage />;
  }

  return <NotFoundPublicPage />;
}
