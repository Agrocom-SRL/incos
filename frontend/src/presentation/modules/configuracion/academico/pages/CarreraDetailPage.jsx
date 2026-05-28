/**
 * Detalle de carrera — página completa (DetailInfoCard + sd-field).
 */

import { Alert, Button, Flex, List, Spin, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  ReadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import DetailField from '@docentes/components/atoms/DetailField';
import { sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';
import { ActionButton, BackButton, Card } from '@atoms';
import { useCarreraDetallePage } from '@application-configuracion/academico/hooks';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

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

  const accent = sanitizeDocenteColorHex(avatarColor) || undefined;

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
          <Flex vertical gap="large" className="cfg-academico-page__stack">
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
                  <div className="cfg-academico-entity-header">
                    <Flex gap={16} align="center">
                      <div
                        className="cfg-academico-entity-avatar"
                        style={accent ? { backgroundColor: accent } : undefined}
                      >
                        {avatarInitials}
                      </div>
                      <div>
                        <span className="cfg-academico-entity-title">{carrera.nombre}</span>
                        <span className="cfg-academico-resumen__label" style={{ display: 'block' }}>
                          {carrera.codigo}
                          {carrera.areaFormacion ? ` · ${carrera.areaFormacion}` : ''}
                        </span>
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
                  </div>
                  {carrera.tituloOtorgado ? (
                    <span className="cfg-academico-entity-tagline">{carrera.tituloOtorgado}</span>
                  ) : null}
                </Card>

                <DetailInfoCard title="Datos de la carrera" icon={<TeamOutlined />} cols={1}>
                  <DetailField label="Código">{carrera.codigo}</DetailField>
                  <DetailField label="Área de formación">{carrera.areaFormacion}</DetailField>
                  <DetailField label="Título otorgado">{carrera.tituloOtorgado}</DetailField>
                  <DetailField label="Color">
                    {carrera.colorHex ? (
                      <span className="cfg-academico-color-chip">
                        <span
                          className="cfg-academico-color-chip__swatch"
                          style={{
                            backgroundColor:
                              sanitizeDocenteColorHex(carrera.colorHex) || undefined,
                          }}
                        />
                        {carrera.colorHex}
                      </span>
                    ) : (
                      '—'
                    )}
                  </DetailField>
                  <DetailField label="Imagen">{carrera.imagenRuta}</DetailField>
                  {carrera.descripcion ? (
                    <DetailField label="Descripción" span={2}>
                      {carrera.descripcion}
                    </DetailField>
                  ) : null}
                </DetailInfoCard>

                <DetailInfoCard
                  title="Planes de estudio"
                  icon={<ReadOutlined />}
                  cols={1}
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
                                  <Tag color="success" className="cfg-planes-tag-vigente">
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
                </DetailInfoCard>
              </>
            ) : null}
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default CarreraDetailPage;
