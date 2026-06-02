import { Alert, Button, Descriptions, Flex, Spin, Table, Tag } from 'antd';
import { ArrowLeftOutlined, ScheduleOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { ActionButton } from '@atoms';
import { allSpacing } from '@theme/tokens';
import { useOfertaParaleloDetalleState } from '@application-institucional/oferta';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';

const OfertaParaleloDetallePage = () => {
  const s = useOfertaParaleloDetalleState();

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica', href: '/institucional/oferta' },
    { title: s.detalle?.paraleloNombre ?? `Paralelo #${s.paraleloGestionId}` },
  ];

  const puedeOfertar =
    s.detalle?.estado === 'BORRADOR' && Boolean(s.detalle?.aulaId) && s.ofertaCursos.length > 0;

  return (
    <Flex vertical gap="large" className="page-container oferta-paralelo-detalle-page" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Flex wrap="wrap" gap={allSpacing.marginSM}>
              <Button icon={<ArrowLeftOutlined />} onClick={s.navigateBack}>
                Volver
              </Button>
              {puedeOfertar ? (
                <ActionButton
                  permiso="institucional.oferta.paralelo-gestion"
                  accion="EDITAR"
                  type="primary"
                  onClick={s.onMarcarOfertado}
                >
                  Marcar OFERTADO
                </ActionButton>
              ) : null}
              <ActionButton
                permiso="institucional.horario.armado"
                accion="LISTAR"
                icon={<ScheduleOutlined />}
                onClick={s.navigateHorariosArmado}
              >
                Ver horario
              </ActionButton>
            </Flex>
          }
        />
      </PageHeaderArea>

      <MainContent>
        <Spin spinning={s.apiLoading}>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%' }}>
            {s.apiError ? <Alert type="error" showIcon message={s.apiError} /> : null}

            <Alert
              type="info"
              showIcon
              message="Vista en construcción"
              description="Aquí se mostrará la tabla completa de oferta con docente, modalidad y bloques horarios. Por ahora: cabecera del paralelo y cursos ofertados."
            />

            {s.detalle ? (
              <Descriptions bordered size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Paralelo">{s.detalle.paraleloNombre}</Descriptions.Item>
                <Descriptions.Item label="Turno">{s.detalle.turno}</Descriptions.Item>
                <Descriptions.Item label="Aula">
                  {s.detalle.aulaCodigo
                    ? `${s.detalle.aulaCodigo} — ${s.detalle.aulaNombre ?? ''}`
                    : 'Sin asignar'}
                </Descriptions.Item>
                <Descriptions.Item label="Cupo máximo">{s.detalle.cupoMaximo ?? '—'}</Descriptions.Item>
                <Descriptions.Item label="Estado">
                  <Tag>{s.detalle.estado}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Periodo">{s.detalle.periodoNombre ?? '—'}</Descriptions.Item>
              </Descriptions>
            ) : null}

            <Table
              bordered
              rowKey="id"
              size="small"
              pagination={false}
              dataSource={s.ofertaCursos}
              columns={[
                { title: 'Materia', dataIndex: 'materiaNombre', key: 'materia' },
                {
                  title: 'Sigla',
                  dataIndex: 'materiaCodigo',
                  width: 90,
                },
                { title: 'Horas/sem', dataIndex: 'horasSemanales', width: 90 },
                { title: 'Estado', dataIndex: 'estado', width: 110 },
              ]}
              locale={{ emptyText: 'Sin cursos en la oferta. Genere la oferta desde la lista de paralelos.' }}
            />
          </Flex>
        </Spin>
      </MainContent>
    </Flex>
  );
};

export default OfertaParaleloDetallePage;
