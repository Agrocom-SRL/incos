/**
 * Organismo: sección "Folios registrados" de la ficha del libro (P2 ·
 * LibroDetailPage). Tabla de folios con `TableActions` (ver → preview del
 * folio). Recibe props ya mapeadas; no llama hooks de fetch.
 */

import { Empty, Table } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';

const LibroFoliosSection = ({ folios = [], columns = [] }) => (
  <DetailInfoCard title={`Folios registrados (${folios.length})`} icon={<FileTextOutlined />} cols={1}>
    {folios.length > 0 ? (
      <Table
        dataSource={folios}
        columns={columns}
        rowKey={(record) => record.id}
        size="small"
        pagination={false}
      />
    ) : (
      <Empty description="Este libro aún no tiene folios generados. Use «Generar folios de paralelo»." />
    )}
  </DetailInfoCard>
);

export default LibroFoliosSection;
