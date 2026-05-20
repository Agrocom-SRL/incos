/**
 * Card para reutilizar la configuración de la gestión académica anterior.
 */

import { Card, Descriptions, Flex, Typography } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import { allColors, componentConfig, shadows } from '@theme/tokens';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';

const { Paragraph, Text, Title } = Typography;

const cardProps = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: {
    body: { padding: `${componentConfig.Card.paddingLG}px` },
  },
};

const etiquetaAsistencia = (codigo) =>
  POLITICAS_ASISTENCIA.find((p) => p.value === codigo)?.label ?? codigo ?? '—';

const PoliticaGestionAnteriorCard = ({ politicaAnterior, onUsarConfiguracion, disabled = false }) => {
  if (!politicaAnterior?.configurada) return null;

  const finalesActivas = (politicaAnterior.evaluacionesFinalesDisponibles ?? []).filter(
    (e) => e.habilitadaInstitucional,
  );

  return (
    <Card {...cardProps} className="cal-politica-anterior-card">
      <Flex vertical gap="middle">
        <div>
          <Title level={5} style={{ margin: 0 }}>
            Configuración de la gestión anterior
          </Title>
          <Paragraph type="secondary" style={{ margin: '8px 0 0', fontSize: 13 }}>
            Gestión <Text strong>{politicaAnterior.gestionNombre}</Text>. Podés aplicar los mismos
            valores al formulario de la gestión vigente; después debés guardar para persistirlos.
          </Paragraph>
        </div>

        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Cuota">
            {politicaAnterior.cuotaTeorico}% teórico · {politicaAnterior.cuotaPractico}% práctico
          </Descriptions.Item>
          <Descriptions.Item label="Bimestres">
            {(politicaAnterior.pesosBimestres ?? []).map((p, i) => `${p}%`).join(' / ')}
          </Descriptions.Item>
          <Descriptions.Item label="Asistencia">
            {etiquetaAsistencia(politicaAnterior.politicaAsistenciaDefault?.politica)}
          </Descriptions.Item>
          <Descriptions.Item label="Finales habilitadas">
            {finalesActivas.length
              ? finalesActivas.map((e) => e.nombre).join(', ')
              : 'Ninguna'}
          </Descriptions.Item>
        </Descriptions>

        <Button
          variant="primary"
          buttonStyle="outlined"
          icon={<CopyOutlined />}
          onClick={onUsarConfiguracion}
          disabled={disabled}
        >
          Usar la misma configuración
        </Button>
      </Flex>
    </Card>
  );
};

export default PoliticaGestionAnteriorCard;
