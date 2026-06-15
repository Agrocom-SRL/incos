/**
 * 404 dentro del panel (MainLayout: menú lateral + cabecera).
 */

import { Card, Flex } from 'antd';
import { useNotFoundAuthenticatedPage } from '@application-auth';
import {
  allColors,
  componentConfig,
  shadows,
} from '@theme/tokens';
import NotFoundResult from '../components/molecules/NotFoundResult.jsx';
import '../styles/not-found.css';

export default function NotFoundAuthenticatedPage() {
  const { goHome, goBack } = useNotFoundAuthenticatedPage();

  return (
    <Flex className="not-found-page not-found-page--panel" justify="center" align="center">
      <Card
        className="not-found-page__card"
        variant="borderless"
        style={{
          maxWidth: 560,
          width: '100%',
          backgroundColor: componentConfig.Card.colorBgContainer,
          borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
          boxShadow: shadows.shadowElevation2,
          border: `1px solid ${allColors.colorBorder}`,
          borderLeft: `4px solid ${allColors.colorPrimary}`,
        }}
        styles={{ body: { padding: `${componentConfig.Card.paddingLG}px` } }}
      >
        <NotFoundResult variant="authenticated" onGoHome={goHome} onGoBack={goBack} />
      </Card>
    </Flex>
  );
}
