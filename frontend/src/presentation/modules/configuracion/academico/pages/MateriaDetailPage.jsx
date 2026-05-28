/**
 * Detalle de materia — página completa (DetailInfoCard + sd-field).
 */

import { Alert, Button, Flex, Spin, Tag } from 'antd';
import { ArrowLeftOutlined, BookOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import DetailField from '@docentes/components/atoms/DetailField';
import { ActionButton, BackButton, Card } from '@atoms';
import { useMateriaDetallePage } from '@application-configuracion/academico/hooks';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const MateriaDetailPage = () => {
  const {
    materia,
    loading,
    error,
    isInvalidId,
    tipoLabel,
    tipoTagColor,
    breadcrumbItems,
    handleVolver,
    handleEditar,
    refetch,
  } = useMateriaDetallePage();

  if (isInvalidId) {
    return (
      <PageTemplate
        header={
          <PageHeader
            title="Detalle de materia"
            breadcrumbItems={breadcrumbItems}
            actions={<BackButton icon={<ArrowLeftOutlined />} onClick={handleVolver} />}
          />
        }
      >
        <Alert type="error" showIcon message="Identificador de materia inválido" />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      header={
        <PageHeader
          title="Detalle de materia"
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex gap={8}>
              <ActionButton
                permiso="configuracion.materia"
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
        <Spin spinning={loading} tip="Cargando materia…">
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

            {materia ? (
              <>
                <Card className="cfg-academico-resumen-card" styles={{ body: { padding: 24 } }}>
                  <div className="cfg-academico-entity-header">
                    <div>
                      <span className="cfg-academico-entity-subtitle">{materia.sigla}</span>
                      <span className="cfg-academico-entity-name">{materia.nombre}</span>
                    </div>
                    <Flex gap={8}>
                      {materia.tipo ? <Tag color={tipoTagColor}>{tipoLabel}</Tag> : null}
                      {materia.activo !== false ? (
                        <Tag icon={<CheckCircleOutlined />} color="success">
                          Activa
                        </Tag>
                      ) : (
                        <Tag color="default">Inactiva</Tag>
                      )}
                    </Flex>
                  </div>
                </Card>

                <DetailInfoCard title="Datos de la materia" icon={<BookOutlined />} cols={1}>
                  <DetailField label="Sigla">{materia.sigla}</DetailField>
                  <DetailField label="Nombre">{materia.nombre}</DetailField>
                  <DetailField label="Tipo">{tipoLabel}</DetailField>
                  <DetailField label="Clasificación">{materia.clasificacion}</DetailField>
                  {materia.objetivos ? (
                    <DetailField label="Objetivos" span={2}>
                      {materia.objetivos}
                    </DetailField>
                  ) : null}
                </DetailInfoCard>
              </>
            ) : null}
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default MateriaDetailPage;
