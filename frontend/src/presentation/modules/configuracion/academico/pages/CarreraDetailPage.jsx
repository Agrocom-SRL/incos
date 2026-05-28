/**
 * Detalle de carrera — página completa (patrón A + Politica resumen card).
 */

import { Alert, Button, Flex, List, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, EditOutlined, ReadOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Card } from '@atoms';
import { useCarreraDetallePage } from '@application-configuracion/academico/hooks';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const { Text } = Typography;

const FilaResumen = ({ label, value }) => (
  <div className="cfg-academico-resumen__fila">
    <Text className="cfg-academico-resumen__label">{label}</Text>
    <Text className="cfg-academico-resumen__valor">{value ?? '—'}</Text>
  </div>
);

const CarreraDetailPage = () => {
  const {
    carrera,
    loading,
    error,
    isInvalidId,
    planes,
    loadingPlanes,
    planVigente,
    avatarInitials,
    avatarColor,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    handleVerPlan,
    refetch,
  } = useCarreraDetallePage();

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de carrera"
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        }
      >
        <Alert type="error" showIcon message="Identificador de carrera inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de carrera"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex gap={8}>
              <ActionButton
                permiso="configuracion.carrera"
                accion="EDITAR"
                variant="default"
                icon={<EditOutlined />}
                onClick={handleEditar}
              >
                Editar
              </ActionButton>
              <BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />
            </Flex>
          }
        />
      }
    >
      <div className="cfg-academico-page">
        <Spin spinning={loading} tip="Cargando carrera…">
          <Flex vertical gap="large" style={{ width: '100%' }}>
            {error ? (
              <Alert
                type="error"
                showIcon
                message={error}
                action={
                  <Button size="small" onClick={refetch}>
                    Reintentar
                  </Button>
                }
              />
            ) : null}

            {carrera ? (
              <>
                <Card className="cfg-academico-resumen-card" styles={{ body: { padding: 24 } }}>
                  <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
                    <Flex gap={16} align="center">
                      <div
                        className="sd-profile__avatar"
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: avatarColor,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 18,
                        }}
                      >
                        {avatarInitials}
                      </div>
                      <div>
                        <Text strong style={{ fontSize: 20, display: 'block' }}>
                          {carrera.nombre}
                        </Text>
                        <Text type="secondary">
                          {carrera.codigo}
                          {carrera.areaFormacion ? ` · ${carrera.areaFormacion}` : ''}
                        </Text>
                      </div>
                    </Flex>
                    <Flex gap={8} align="center">
                      {carrera.activo !== false ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          Activa
                        </Tag>
                      ) : (
                        <Tag color="default">Inactiva</Tag>
                      )}
                    </Flex>
                  </Flex>
                  {carrera.tituloOtorgado ? (
                    <Text type="secondary" style={{ display: 'block', marginTop: 12 }}>
                      {carrera.tituloOtorgado}
                    </Text>
                  ) : null}
                </Card>

                <Card
                  title="Datos de la carrera"
                  headerColor="primary"
                  variant="outlined"
                  shadow={false}
                  className="cfg-academico-resumen-card"
                >
                  <FilaResumen label="Código" value={carrera.codigo} />
                  <FilaResumen label="Área de formación" value={carrera.areaFormacion} />
                  <FilaResumen label="Título otorgado" value={carrera.tituloOtorgado} />
                  <FilaResumen
                    label="Color"
                    value={
                      carrera.colorHex ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 3,
                              backgroundColor: carrera.colorHex,
                              border: '1px solid rgba(0,0,0,0.1)',
                            }}
                          />
                          {carrera.colorHex}
                        </span>
                      ) : (
                        '—'
                      )
                    }
                  />
                  <FilaResumen label="Imagen" value={carrera.imagenRuta} />
                  {carrera.descripcion ? (
                    <FilaResumen label="Descripción" value={carrera.descripcion} />
                  ) : null}
                </Card>

                <Card
                  title="Planes de estudio"
                  headerColor="primary"
                  variant="outlined"
                  shadow={false}
                  className="cfg-academico-resumen-card"
                  extra={
                    planVigente ? (
                      <ActionButton
                        permiso="configuracion.plan-estudio"
                        accion="DETALLE"
                        variant="link"
                        icon={<ReadOutlined />}
                        onClick={() => handleVerPlan(planVigente.id)}
                      >
                        Ir al plan vigente
                      </ActionButton>
                    ) : null
                  }
                >
                  <Spin spinning={loadingPlanes}>
                    <List
                      size="small"
                      dataSource={planes}
                      locale={{ emptyText: 'Sin planes asociados a esta carrera' }}
                      renderItem={(plan) => (
                        <List.Item
                          actions={[
                            <ActionButton
                              key="ver"
                              permiso="configuracion.plan-estudio"
                              accion="DETALLE"
                              variant="link"
                              onClick={() => handleVerPlan(plan.id)}
                            >
                              Ver matriz
                            </ActionButton>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <>
                                {plan.nombre_plan || `Plan #${plan.id}`}
                                {plan.vigente ? (
                                  <Tag color="success" style={{ marginLeft: 8 }}>
                                    Vigente
                                  </Tag>
                                ) : null}
                              </>
                            }
                            description={plan.resolucion_ministerial || undefined}
                          />
                        </List.Item>
                      )}
                    />
                  </Spin>
                </Card>
              </>
            ) : null}
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default CarreraDetailPage;
