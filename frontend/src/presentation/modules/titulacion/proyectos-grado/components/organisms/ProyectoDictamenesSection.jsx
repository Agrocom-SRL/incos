/**
 * Organismo: tab "Dictámenes" de la ficha-hub del proyecto (TIT · T22-T23).
 *
 * Solo lectura: los dictámenes (designación oficial de tutor y viabilidad
 * técnica) los genera el backend al asignar tutor (T10) y aprobar etapas
 * (T11). Descarga del PDF gated por proyecto·EXPORTAR en las columnas.
 */

import { Alert, Empty, Table } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { createDictamenesTableColumns } from '@titulacion/proyectos-grado/config/dictamenesTableColumns';

const ProyectoDictamenesSection = ({ dictamenes, loading, error, descargandoId, onDescargar }) => {
  const columns = createDictamenesTableColumns({ onDescargar, descargandoId });

  return (
    <div className="sd-tab-body">
      <DetailInfoCard
        title={`Dictámenes e informes (${dictamenes.length})`}
        icon={<AuditOutlined />}
        cols={1}
      >
        {error ? (
          <Alert
            type="error"
            showIcon
            title="No se pudieron cargar los dictámenes"
            description={error}
          />
        ) : dictamenes.length === 0 && !loading ? (
          <Empty description="El proyecto aún no tiene dictámenes emitidos. Se generan al asignar tutor y al aprobar etapas." />
        ) : (
          <Table
            dataSource={dictamenes}
            columns={columns}
            rowKey={(record) => record.id}
            size="small"
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        )}
      </DetailInfoCard>
    </div>
  );
};

export default ProyectoDictamenesSection;
