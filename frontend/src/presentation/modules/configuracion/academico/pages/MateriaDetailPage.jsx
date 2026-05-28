/**
 * Detalle de materia — página completa.
 */

import { Alert, Button, Flex, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton, BackButton, Card } from '@atoms';
import { useMateriaDetallePage } from '@application-configuracion/academico/hooks';
import '@presentation/styles/pages/detail-page.css';
import '../styles/academico-form-page.css';

const { Text } = Typography;

const FilaResumen = ({ label, value }) => (
  <div className="cfg-academico-resumen__fila">
    <Text className="cfg-academico-resumen__label">{label}</Text>
    <Text className="cfg-academico-resumen__valor">{value ?? '—'}</Text>
  </div>
);

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

            {materia ? (
              <>
                <Card className="cfg-academico-resumen-card" styles={{ body: { padding: 24 } }}>
                  <Flex justify="space-between" align="flex-start" wrap="wrap" gap={16}>
                    <div>
                      <Text strong style={{ fontSize: 20, display: 'block', fontFamily: 'monospace' }}>
                        {materia.sigla}
                      </Text>
                      <Text strong style={{ fontSize: 18, display: 'block', marginTop: 4 }}>
                        {materia.nombre}
                      </Text>
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
                  </Flex>
                </Card>

                <Card
                  title="Datos de la materia"
                  headerColor="primary"
                  variant="outlined"
                  shadow={false}
                  className="cfg-academico-resumen-card"
                >
                  <FilaResumen label="Sigla" value={materia.sigla} />
                  <FilaResumen label="Nombre" value={materia.nombre} />
                  <FilaResumen label="Tipo" value={tipoLabel} />
                  <FilaResumen label="Clasificación" value={materia.clasificacion} />
                  {materia.objetivos ? (
                    <FilaResumen label="Objetivos" value={materia.objetivos} />
                  ) : null}
                </Card>
              </>
            ) : null}
          </Flex>
        </Spin>
      </div>
    </PageTemplate>
  );
};

export default MateriaDetailPage;
