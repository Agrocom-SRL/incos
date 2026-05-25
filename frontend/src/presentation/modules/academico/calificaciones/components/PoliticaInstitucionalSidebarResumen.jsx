/**
 * Sidebar: resumen de la configuración guardada en la gestión vigente.
 */

import { Card, Descriptions, Flex, Tag, Typography } from 'antd';
import { CheckCircleOutlined, HistoryOutlined } from '@ant-design/icons';
import { allColors, componentConfig, shadows } from '@theme/tokens';
import { POLITICAS_ASISTENCIA } from '@application-academico/calificaciones/utils/politicasAsistencia.js';

const { Text, Title } = Typography;

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

const PoliticaInstitucionalSidebarResumen = ({ politica, gestionVigente }) => {
  if (!politica) {
    return (
      <Card {...cardProps}>
        <Text type="secondary">Sin datos de configuración.</Text>
      </Card>
    );
  }

  return (
    <Flex vertical gap="middle" style={{ width: '100%', minWidth: 0 }}>
      <Card {...cardProps} className="cal-politica-sidebar-card">
        <Flex vertical gap="small">
          <Title level={5} style={{ margin: 0 }}>
            Gestión vigente
          </Title>
          <Text strong style={{ fontSize: 18 }}>
            {gestionVigente ?? politica.gestionNombre ?? '—'}
          </Text>
          {politica.configurada ? (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Configuración guardada
            </Tag>
          ) : (
            <Tag color="warning">Sin guardar en esta gestión</Tag>
          )}
        </Flex>
      </Card>

      {politica.configurada ? (
        <Card {...cardProps} className="cal-politica-sidebar-card">
          <Flex vertical gap="middle">
            <Title level={5} style={{ margin: 0 }}>
              Resumen guardado
            </Title>

            <Descriptions column={1} size="small" colon={false}>
              <Descriptions.Item label="Cuota teórico / práctico">
                <Text>
                  {politica.cuotaTeorico} / {politica.cuotaPractico} pts
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Pesos bimestrales">
                <Text>
                  {(politica.pesosBimestres ?? [])
                    .map((p, i) => `B${i + 1}: ${p}%`)
                    .join(' · ')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Asistencia (default)">
                <Text>{etiquetaAsistencia(politica.politicaAsistenciaDefault?.politica)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Nota anual">
                <Text type="secondary">Suma ponderada de los 4 bimestres</Text>
              </Descriptions.Item>
            </Descriptions>

            {politica.ultimaModificacion?.updatedAt ? (
              <Flex gap={8} align="flex-start">
                <HistoryOutlined style={{ marginTop: 4, color: allColors.colorTextSecondary }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {politica.ultimaModificacion.updatedByNombre
                    ? `${politica.ultimaModificacion.updatedByNombre} · `
                    : null}
                  {new Date(politica.ultimaModificacion.updatedAt).toLocaleDateString('es-BO', {
                    dateStyle: 'medium',
                  })}
                </Text>
              </Flex>
            ) : null}
          </Flex>
        </Card>
      ) : (
        <Card {...cardProps}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Aún no hay configuración persistida para esta gestión. Completá el formulario y guardá,
            o copiá la política de la gestión anterior si está disponible.
          </Text>
        </Card>
      )}
    </Flex>
  );
};

export default PoliticaInstitucionalSidebarResumen;
