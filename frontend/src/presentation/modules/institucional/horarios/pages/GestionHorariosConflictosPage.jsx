import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Flex, Spin, Table, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allColors, allSpacing, componentConfig, shadows } from '@theme/tokens';
import { useHorariosConflictosContext } from '@application-institucional/horarios/context/HorariosConflictosContext';
import HorariosOperativaBanner from '../components/molecules/HorariosOperativaBanner';
import '@presentation/styles/pages/detail-page.css';
import '../styles/gestion-horarios-page.css';

const { Text } = Typography;

const sectionCardProps = {
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

const tipoTagColor = {
  PARALELO: 'orange',
  AULA: 'red',
  DOCENTE: 'magenta',
  VALIDACION: 'default',
};

const GestionHorariosConflictosPage = () => {
  const navigate = useNavigate();
  const {
    invalidGestion,
    loading,
    error,
    rows,
    paralelosResumen,
    totalConflictos,
    breadcrumbItems,
    pageTitle,
    handleVolver,
    buildArmadoHref,
    reload,
  } = useHorariosConflictosContext();

  const columns = useMemo(
    () => [
      {
        title: 'Tipo',
        dataIndex: 'tipoLabel',
        key: 'tipo',
        width: 110,
        render: (_, record) => (
          <Tag color={tipoTagColor[record.tipo] ?? 'default'}>{record.tipoLabel}</Tag>
        ),
      },
      {
        title: 'Paralelo',
        key: 'paralelo',
        render: (_, record) => (
          <Flex vertical gap={2}>
            <Text>{record.paraleloNombre ?? '—'}</Text>
            {record.turno ? (
              <Text type="secondary" style={{ fontSize: 'inherit' }}>
                Turno {record.turno}
              </Text>
            ) : null}
          </Flex>
        ),
      },
      {
        title: 'Mensaje',
        dataIndex: 'mensaje',
        key: 'mensaje',
      },
      {
        title: 'Acción',
        key: 'accion',
        width: 140,
        render: (_, record) => {
          const href = buildArmadoHref(record);
          if (!href) return <Text type="secondary">—</Text>;
          return (
            <ActionButton
              permiso="institucional.horario.armado"
              accion="EDITAR"
              variant="default"
              onClick={() => navigate(href)}
            >
              Ir a armado
            </ActionButton>
          );
        },
      },
    ],
    [buildArmadoHref, navigate],
  );

  const headerActions = (
    <Flex gap={8} wrap="wrap" justify="flex-end">
      <ActionButton
        permiso="institucional.horario.conflictos"
        accion="LISTAR"
        variant="default"
        icon={<ReloadOutlined />}
        onClick={reload}
        loading={loading}
      >
        Actualizar
      </ActionButton>
      <button type="button" className="sd-btn sd-btn--outline" onClick={handleVolver}>
        <ArrowLeftOutlined /> Volver
      </button>
    </Flex>
  );

  return (
    <PageTemplate
      header={<PageHeader title={pageTitle} breadcrumbItems={breadcrumbItems} actions={headerActions} />}
      sidebar={null}
    >
      <Spin spinning={loading} tip="Cargando conflictos…">
        <div className="sd sd-spin-body">
          {invalidGestion ? (
            <Alert
              type="error"
              showIcon
              title="Gestión inválida"
              description="Use la ruta /institucional/horarios/conflictos/:gestionId con el id de la gestión vigente."
            />
          ) : null}
          {error ? (
            <Alert type="error" showIcon style={{ marginBottom: 16 }} title={error} />
          ) : null}
          <HorariosOperativaBanner style={{ marginBottom: allSpacing.marginLG }} />
          <Card {...sectionCardProps}>
            <Flex vertical gap={allSpacing.marginMD}>
              <Text type="secondary">
                Conflictos detectados en paralelos de la gestión ({paralelosResumen.length}{' '}
                paralelo(s) con incidencias, {totalConflictos} registro(s)).
              </Text>
              {totalConflictos === 0 && !loading && !error ? (
                <Alert
                  type="success"
                  showIcon
                  title="Sin conflictos"
                  description="No hay solapes de paralelo, aula o docente en los bloques horarios de esta gestión."
                />
              ) : (
                <Table
                  rowKey="key"
                  columns={columns}
                  dataSource={rows}
                  pagination={{ pageSize: 20, showSizeChanger: true }}
                  size="middle"
                />
              )}
            </Flex>
          </Card>
        </div>
      </Spin>
    </PageTemplate>
  );
};

export default GestionHorariosConflictosPage;
