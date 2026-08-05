/**
 * Folios anulados del libro (P2.5) — lista plana (todas las carreras
 * mezcladas, sin tabs) de los folios ANULADOS: reajustes de "Generar todos
 * los folios" y anulaciones puntuales, con carrera y motivo visibles.
 * Página "dumb": solo compone template + organismos y consume `useLibroAnulados`.
 */

import { Empty, Table } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { DetailInfoCard } from '@molecules';
import DetailPageShell from '@organisms/DetailPageShell';
import DetailPageHeaderActions from '@organisms/DetailPageHeaderActions';
import { useLibroAnulados } from '@application-academico/libros/hooks';
import '@presentation/styles/pages/detail-page.css';

const LibroAnuladosPage = () => {
  const {
    libro,
    anulados,
    loading,
    error,
    isInvalidId,
    breadcrumbItems,
    tableColumns,
    handleVolver,
    refetch,
  } = useLibroAnulados();

  const headerActions = <DetailPageHeaderActions onVolver={handleVolver} />;

  return (
    <PageTemplate
      header={
        <PageHeader
          title={libro ? `Folios anulados · ${libro.libroLabel}` : 'Folios anulados'}
          breadcrumbItems={breadcrumbItems}
          actions={headerActions}
        />
      }
      sidebar={null}
    >
      <DetailPageShell
        loading={loading}
        loadingTip="Cargando folios anulados…"
        error={error}
        onRetry={refetch}
        showEmpty={!loading && !error && isInvalidId}
        emptyDescription="Identificador de libro inválido"
      >
        <DetailInfoCard title={`Folios anulados (${anulados.length})`} icon={<StopOutlined />} cols={1}>
          {anulados.length > 0 ? (
            <Table
              dataSource={anulados}
              columns={tableColumns}
              rowKey={(record) => record.id}
              size="small"
              pagination={false}
            />
          ) : (
            <Empty description="Este libro no tiene folios anulados." />
          )}
        </DetailInfoCard>
      </DetailPageShell>
    </PageTemplate>
  );
};

export default LibroAnuladosPage;
