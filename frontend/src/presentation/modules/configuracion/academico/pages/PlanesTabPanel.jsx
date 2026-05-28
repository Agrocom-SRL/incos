/**
 * Tab «Planes de estudio» — sidebar carreras + lista de planes (SPRINT_1 §6.5).
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Empty, Flex, Input, List, Spin, Tag, Typography, theme } from 'antd';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { EditOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuthContext } from '@application-auth';
import { usePlanesTabPanel } from '@application-configuracion/academico/hooks';
import { planDetallePath } from '@application-configuracion/academico/config/paths';
import { planesListNavigationState } from '@application-configuracion/academico/config/academicoNavigation';
import { Card, Text } from '@atoms';
import ListPanelHeader from '@molecules/ListPanelHeader';
import '../styles/planes-tab.css';

const { Search } = Input;

const PlanesTabPanel = ({ embedded = false }) => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const listNavState = useMemo(() => planesListNavigationState(), []);
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
    <div className={`cfg-planes-tab${embedded ? ' cfg-planes-tab--embedded' : ''}`}>
      {error ? (
        <Alert
          type="error"
          showIcon
          className="cfg-planes-tab__alert"
          message={typeof error === 'string' ? error : 'Error al cargar planes'}
          action={
            <Button size="small" onClick={refetch}>
              Reintentar
            </Button>
          }
        />
      ) : null}

      <ListPanelHeader title="Planes de estudio" />

      <Spin spinning={loading} tip="Cargando planes de estudio…">
        <Flex className="cfg-planes-layout" gap={16} align="stretch">
          <Card
            className="cfg-planes-sidebar"
            variant={embedded ? 'borderless' : 'outlined'}
            shadow={false}
            styles={{ body: { padding: 8 } }}
          >
            <Text strong className="cfg-planes-sidebar__title">
              Carreras
            </Text>
            <List
              size="small"
              dataSource={carreras}
              locale={{ emptyText: 'Sin carreras' }}
              renderItem={(c) => {
                const activo = c.id === selectedCarreraId;
                const vigente = vigentePlanPorCarrera.get(c.id);
                const swatchColor =
                  sanitizeDocenteColorHex(c.colorHex ?? c.color_hex) || token.colorPrimary;
                return (
                  <List.Item
                    className={`cfg-planes-carrera-item${activo ? ' cfg-planes-carrera-item--active' : ''}`}
                    onClick={() => setSelectedCarreraId(c.id)}
                  >
                    <Flex align="center" gap={8} className="cfg-planes-carrera-row">
                      <span
                        className="cfg-planes-carrera-swatch"
                        style={{ backgroundColor: swatchColor }}
                      />
                      <Flex vertical className="cfg-planes-carrera-row__text">
                        <Text strong ellipsis className="cfg-planes-carrera-row__codigo">
                          {c.codigo}
                        </Text>
                        <Text type="secondary" ellipsis className="cfg-planes-carrera-row__nombre">
                          {c.nombre}
                        </Text>
                      </Flex>
                      {vigente ? (
                        <Tag color="success" className="cfg-planes-carrera-row__tag">
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
            variant={embedded ? 'borderless' : 'outlined'}
            shadow={false}
            styles={{ body: { padding: embedded ? '8px 0 0' : 16 } }}
          >
            {carreraSeleccionada ? (
              <>
                <Flex justify="space-between" align="center" wrap="wrap" gap={8} className="cfg-planes-main__toolbar">
                  <div>
                    <Typography.Title level={5} className="cfg-planes-main__heading">
                      {carreraSeleccionada.nombre}
                    </Typography.Title>
                    <Text type="secondary" className="cfg-planes-main__subtitle">
                      Planes de estudio — vigente arriba, históricos abajo
                    </Text>
                  </div>
                  <Search
                    allowClear
                    placeholder="Buscar plan o resolución…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="cfg-planes-main__search"
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
                                  onClick={() =>
                                    navigate(planDetallePath(plan.id), { state: listNavState })
                                  }
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
                            <Flex gap={16} wrap="wrap" className="cfg-planes-plan-item__meta">
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
