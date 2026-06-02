import { Alert, Button, Flex, Spin, Table, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MainContent, PageHeaderArea } from '@templates';
import { PageHeader } from '@molecules';
import { allSpacing } from '@theme/tokens';
import { useOfertaGestionesState } from '@application-institucional/oferta';
import '@presentation/styles/pages/detail-page.css';
import '../styles/oferta-academica-page.css';
import { buildOfertaGestionesTableColumns } from '../config/ofertaGestionesTableColumns';

const { Text } = Typography;

const OfertaGestionesPage = () => {
  const s = useOfertaGestionesState();

  const breadcrumbItems = [
    { title: 'Inicio', href: '/' },
    { title: 'Institucional', href: '/institucional' },
    { title: 'Oferta Académica', href: '/institucional/oferta' },
    { title: 'Gestiones' },
  ];

  return (
    <Flex vertical gap="large" className="page-container" style={{ width: '100%' }}>
      <PageHeaderArea>
        <PageHeader
          title={s.pageTitle}
          breadcrumbItems={breadcrumbItems}
          actions={
            <Button icon={<ArrowLeftOutlined />} onClick={s.navigateDashboard}>
              Volver
            </Button>
          }
        />
      </PageHeaderArea>

      <MainContent>
        <Spin spinning={s.apiLoading}>
          <Flex vertical gap={allSpacing.marginLG} style={{ width: '100%' }}>
            {s.apiError ? <Alert type="error" showIcon message={s.apiError} /> : null}

            <Text type="secondary">
              Seleccione una gestión para habilitar planes y generar la oferta. La gestión{' '}
              <strong>vigente</strong> es la referencia operativa del instituto.
            </Text>

            <Table
              bordered
              rowKey="id"
              dataSource={s.gestiones}
              pagination={false}
              columns={buildOfertaGestionesTableColumns({
                onMarcarVigente: s.onMarcarVigente,
                onVerPlanes: s.onVerPlanes,
              })}
              locale={{ emptyText: 'No hay gestiones registradas.' }}
            />
          </Flex>
        </Spin>
      </MainContent>
    </Flex>
  );
};

export default OfertaGestionesPage;
