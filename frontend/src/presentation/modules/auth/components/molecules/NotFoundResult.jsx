/**
 * Molécula — mensaje y acciones de página no encontrada.
 * Tipografía y botones alineados con tarjetas del dashboard (INCOS).
 */

import { Button, Flex, Typography } from 'antd';
import {
  FileSearchOutlined,
  HomeOutlined,
  LoginOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import {
  allColors,
  allSpacing,
  componentConfig,
  typography,
} from '@theme/tokens';

const { Title, Text } = Typography;

/**
 * @param {'authenticated' | 'public'} variant
 * @param {() => void} onGoHome
 * @param {() => void} [onGoBack]
 */
const NotFoundResult = ({ variant, onGoHome, onGoBack }) => {
  const isPanel = variant === 'authenticated';

  return (
    <Flex
      vertical
      align="center"
      gap={allSpacing.marginLG}
      className="not-found-page__result"
    >
      <FileSearchOutlined
        className="not-found-page__icon"
        style={{ color: allColors.colorPrimary }}
      />
      <Title
        level={3}
        style={{
          margin: 0,
          color: allColors.colorPrimary,
          fontSize: `${typography.fontSizeHeading3}px`,
          fontWeight: typography.fontWeightStrong,
          textAlign: 'center',
        }}
      >
        Página no encontrada
      </Title>
      <Text
        type="secondary"
        style={{
          margin: 0,
          maxWidth: 420,
          textAlign: 'center',
          fontSize: `${typography.fontSize}px`,
          lineHeight: typography.lineHeight,
        }}
      >
        {isPanel ? (
          <>
            La dirección que abrió no existe en el sistema o el enlace está incompleto.
            Puede usar el <strong>menú lateral</strong> para ir a otra sección o volver al
            inicio del panel.
          </>
        ) : (
          <>
            Este enlace no es válido o la página ya no está disponible. Si tiene usuario en
            el instituto, inicie sesión para entrar al panel de gestión.
          </>
        )}
      </Text>
      <Flex
        wrap="wrap"
        gap={allSpacing.margin}
        justify="center"
        className="not-found-page__actions"
      >
        {isPanel ? (
          <>
            <Button
              type="primary"
              size="large"
              icon={<HomeOutlined />}
              onClick={onGoHome}
              style={{
                borderRadius: `${componentConfig.Button.borderRadius}px`,
                height: `${componentConfig.Button.controlHeightLG}px`,
                fontWeight: typography.fontWeightStrong,
              }}
            >
              Ir al inicio del panel
            </Button>
            {onGoBack ? (
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={onGoBack}
                style={{
                  borderRadius: `${componentConfig.Button.borderRadius}px`,
                  height: `${componentConfig.Button.controlHeightLG}px`,
                }}
              >
                Volver atrás
              </Button>
            ) : null}
          </>
        ) : (
          <Button
            type="primary"
            size="large"
            icon={<LoginOutlined />}
            onClick={onGoHome}
            style={{
              borderRadius: `${componentConfig.Button.borderRadius}px`,
              height: `${componentConfig.Button.controlHeightLG}px`,
              fontWeight: typography.fontWeightStrong,
            }}
          >
            Iniciar sesión
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

export default NotFoundResult;
