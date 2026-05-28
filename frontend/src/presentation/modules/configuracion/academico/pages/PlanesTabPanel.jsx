/**
 * Tab «Planes de estudio» — sidebar carreras + lista de planes (SPRINT_1 §6.5).
 */

import { useNavigate } from 'react-router-dom';
import { Alert, Button, Empty, Flex, Input, List, Spin, Tag, Typography } from 'antd';
import { EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuthContext } from '@application-auth';
import { usePlanesTabPanel } from '@application-configuracion/academico/hooks';
import { planDetallePath } from '@application-configuracion/academico/config/paths';
import { Card, Text } from '@atoms';
import '../styles/planes-tab.css';

const { Search } = Input;

const PlanesTabPanel = () => {
  const navigate = useNavigate();
  const { hasPermiso } = useAuthContext();
  const puedeDetalle = hasPermiso('configuracion.plan-estudio', 'DETALLE');

  const {
    carreras,
    loading,
    error,
    refetch,
    selectedCarreraId,
    setSelectedCarreraId,
    vigentePlanPorCarrera,
    planesDeCarrera,
    carreraSeleccionada,
    searchText,
    setSearchText,
  } = usePlanesTabPanel();

  return (
    <div className="cfg-planes-tab">
      {error ? (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={typeof error === 'string' ? error : 'Error al cargar planes'}
          action={
            <Button size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      ) : null}

      <Spin spinning={loading} tip="Cargando planes de estudio…">
        <Flex className="cfg-planes-layout" gap={16} align="stretch">
          <Card
            className="cfg-planes-sidebar"
            variant="outlined"
            shadow={false}
            styles={{ body: { padding: 8 } }}
          >
            <Text strong style={{ display: 'block', padding: '8px 12px 4px', fontSize: 13 }}>
              Carreras
            </Text>
            <List
              size="small"
              dataSource={carreras}
              locale={{ emptyText: 'Sin carreras' }}
              renderItem={(c) => {
                const activo = c.id === selectedCarreraId;
                const vigente = vigentePlanPorCarrera.get(c.id);
                const color = c.colorHex || c.color_hex || '#1677ff';
                return (
                  <List.Item
                    className={`cfg-planes-carrera-item${activo ? ' cfg-planes-carrera-item--active' : ''}`}
                    onClick={() => setSelectedCarreraId(c.id)}
                  >
                    <Flex align="center" gap={8} style={{ width: '100%' }}>
                      <span
                        className="cfg-planes-carrera-swatch"
                        style={{ backgroundColor: color }}
                      />
                      <Flex vertical style={{ flex: 1, minWidth: 0 }}>
                        <Text strong ellipsis style={{ fontSize: 13 }}>
                          {c.codigo}
                        </Text>
                        <Text type="secondary" ellipsis style={{ fontSize: 12 }}>
                          {c.nombre}
                        </Text>
                      </Flex>
                      {vigente ? (
                        <Tag color="success" style={{ margin: 0, fontSize: 11 }}>
                          Vigente
                        </Tag>
                      ) : null}
                    </Flex>
                  </List.Item>
                );
              }}
            />
          </Card>

          <Card
            className="cfg-planes-main"
            variant="outlined"
            shadow={false}
            styles={{ body: { padding: 16 } }}
          >
            {carreraSeleccionada ? (
              <>
                <Flex justify="space-between" align="center" wrap="wrap" gap={8} style={{ marginBottom: 16 }}>
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      {carreraSeleccionada.nombre}
                    </Typography.Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      Planes de estudio — vigente arriba, históricos abajo
                    </Text>
                  </div>
                  <Search
                    allowClear
                    placeholder="Buscar plan o resolución…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ maxWidth: 320 }}
                  />
                </Flex>

                {planesDeCarrera.length === 0 ? (
                  <Empty description="No hay planes para esta carrera" />
                ) : (
                  <List
                    dataSource={planesDeCarrera}
                    renderItem={(plan) => (
                      <List.Item
                        className="cfg-planes-plan-item"
                        actions={
                          puedeDetalle
                            ? [
                                <Button
                                  key="matriz"
                                  type="primary"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => navigate(planDetallePath(plan.id))}
                                >
                                  Editar matriz
                                </Button>,
                              ]
                            : undefined
                        }
                      >
                        <List.Item.Meta
                          title={
                            <Flex align="center" gap={8} wrap="wrap">
                              <span>{plan.nombre_plan || `Plan #${plan.id}`}</span>
                              {plan.vigente ? (
                                <Tag icon={<CheckCircleOutlined />} color="success">
                                  Vigente
                                </Tag>
                              ) : (
                                <Tag>Histórico</Tag>
                              )}
                            </Flex>
                          }
                          description={
                            <Flex gap={16} wrap="wrap" style={{ fontSize: 13 }}>
                              {plan.resolucion_ministerial ? (
                                <span>{plan.resolucion_ministerial}</span>
                              ) : null}
                              <span>
                                <Text type="secondary">Horas/sem: </Text>
                                <Text strong>{plan.horas_semana ?? '—'}</Text>
                              </span>
                              {plan.duracion_anios != null ? (
                                <span>
                                  <Text type="secondary">Duración: </Text>
                                  {plan.duracion_anios} años
                                </span>
                              ) : null}
                            </Flex>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </>
            ) : (
              <Empty description="Seleccione una carrera" />
            )}
          </Card>
        </Flex>
      </Spin>
    </div>
  );
};

export default PlanesTabPanel;
