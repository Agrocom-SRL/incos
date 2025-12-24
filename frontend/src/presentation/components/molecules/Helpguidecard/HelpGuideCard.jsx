/**
 * HelpGuideCard - Card con guía de ayuda para el formulario
 * Muestra información importante sobre cómo completar el formulario
 */

import { useState } from 'react';
import { Card, Typography, Flex, Collapse } from 'antd';
import { InfoCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { allColors, allSpacing, typography, componentConfig } from '@theme/tokens';

const { Title, Text } = Typography;

const HelpGuideCard = () => {
  // Primer panel abierto por defecto
  const [activeKey, setActiveKey] = useState(['1']);

  const generalInfo = [
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'Complete el registro en 3 pasos. Puede guardar y continuar después en cualquier momento.',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'Los campos marcados con * son obligatorios',
    },
  ];

  const documentInfo = [
    {
      icon: <ExclamationCircleOutlined style={{ color: allColors.colorWarning }} />,
      text: 'El documento de Pago por Matrícula Anual es OBLIGATORIO para finalizar el registro',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'Marque los documentos entregados y suba los archivos digitales si están disponibles',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'Documentos requeridos: CI, Certificado de Nacimiento, Diploma de Bachiller, Pago de Matrícula y Folder Amarillo',
    },
  ];

  const stateInfo = [
    {
      icon: <CheckCircleOutlined style={{ color: allColors.colorWarning }} />,
      text: 'BORRADOR: Solo datos personales completos',
    },
    {
      icon: <InfoCircleOutlined style={{ color: allColors.colorInfo }} />,
      text: 'PENDIENTE: Al menos un documento original entregado',
    },
    {
      icon: <CheckCircleOutlined style={{ color: allColors.colorSuccess }} />,
      text: 'ADMITIDO: Todos los datos y documentos originales completos',
    },
  ];

  const renderNotes = (notes) => (
    <Flex vertical gap={allSpacing.marginXS}>
      {notes.map((item, index) => (
        <Flex key={index} align="flex-start" gap={allSpacing.marginSM} style={{ padding: `${allSpacing.paddingXS}px 0` }}>
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
      ))}
    </Flex>
  );

  return (
    <Card
      style={{
        backgroundColor: componentConfig.Card.colorBgContainer,
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: componentConfig.Card.boxShadow,
        border: `1px solid ${allColors.colorBorder}`,
        padding: `${componentConfig.Card.padding}px`,
      }}
      styles={{
        body: {
          padding: 0,
        }
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
          Guía Rápida
        </Title>

        <Collapse
          activeKey={activeKey}
          onChange={setActiveKey}
          accordion
          items={[
            {
              key: '1',
              label: 'Información General',
              children: renderNotes(generalInfo),
            },
            {
              key: '2',
              label: 'Documentos Requeridos',
              children: renderNotes(documentInfo),
            },
            {
              key: '3',
              label: 'Estados del Registro',
              children: renderNotes(stateInfo),
            },
          ]}
        />
      </Flex>
    </Card>
  );
};

export default HelpGuideCard;