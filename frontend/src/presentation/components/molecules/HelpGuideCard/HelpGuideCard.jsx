/**
 * HelpGuideCard - Card con guía de ayuda para el formulario
 * Muestra información importante sobre cómo completar el formulario
 */

import { Card, Typography, Flex, List, Divider } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { allColors } from '@theme/colors';
import { allSpacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { componentConfig } from '@theme/components';

const { Title, Text } = Typography;

const HelpGuideCard = () => {
  const importantNotes = [
    {
      icon: <ExclamationCircleOutlined style={{ color: allColors.colorWarning }} />,
      text: 'Los campos marcados con * son obligatorios',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'El CI debe tener entre 7 y 9 dígitos',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'El estudiante debe tener al menos 17 años',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'El celular es requerido para contacto',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'La carrera y gestión de ingreso son obligatorias',
    },
  ];

  const quickTips = [
    'Verifica que todos los datos estén correctos antes de enviar',
    'El código de estudiante se genera automáticamente',
    'Puedes agregar información adicional en observaciones',
    'Los campos opcionales pueden completarse más tarde',
  ];

  return (
    <Card
      style={{
        backgroundColor: componentConfig.Card.colorBgContainer,
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: componentConfig.Card.boxShadow,
        border: `1px solid ${allColors.colorBorder}`,
        padding: `${componentConfig.Card.paddingLG}px`,
      }}
      bodyStyle={{
        padding: 0,
      }}
    >
      <Flex vertical gap={allSpacing.marginLG}>
        <Title
          level={4}
          style={{
            color: allColors.colorPrimary,
            fontSize: `${typography.fontSizeHeading4}px`,
            fontWeight: typography.fontWeightStrong,
            margin: 0,
          }}
        >
          <InfoCircleOutlined style={{ marginRight: allSpacing.marginSM }} />
          Información Importante
        </Title>

        <List
          dataSource={importantNotes}
          renderItem={(item) => (
            <List.Item style={{ padding: `${allSpacing.paddingSM}px 0`, border: 'none' }}>
              <Flex align="flex-start" gap={allSpacing.marginSM}>
                <span style={{ marginTop: '2px' }}>{item.icon}</span>
                <Text
                  style={{
                    color: allColors.colorText,
                    fontSize: `${typography.fontSize}px`,
                    lineHeight: typography.lineHeight,
                  }}
                >
                  {item.text}
                </Text>
              </Flex>
            </List.Item>
          )}
        />

        <Divider style={{ margin: `${allSpacing.margin}px 0` }} />

        <Title
          level={5}
          style={{
            color: allColors.colorTextHeading,
            fontSize: `${typography.fontSizeHeading5}px`,
            fontWeight: typography.fontWeightStrong,
            margin: 0,
          }}
        >
          <CheckCircleOutlined style={{ marginRight: allSpacing.marginSM, color: allColors.colorSuccess }} />
          Consejos Rápidos
        </Title>

        <List
          dataSource={quickTips}
          renderItem={(item) => (
            <List.Item style={{ padding: `${allSpacing.paddingSM}px 0`, border: 'none' }}>
              <Text
                style={{
                  color: allColors.colorTextSecondary,
                  fontSize: `${typography.fontSizeSM}px`,
                  lineHeight: typography.lineHeightSM,
                }}
              >
                • {item}
              </Text>
            </List.Item>
          )}
        />
      </Flex>
    </Card>
  );
};

export default HelpGuideCard;