/**
 * Organismo: tab "Avances" de la ficha-hub del proyecto (TUT · T18-T21).
 *
 * Tabla de archivos subidos por los estudiantes. La descarga (avance·DETALLE)
 * y la revisión (bitacora·CREAR → entrada REVISION_AVANCE) van gated en las
 * columnas. Estados carga/vacío/error cubiertos.
 */

import { Alert, Empty, Table } from 'antd';
import { CloudUploadOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { createAvancesTableColumns } from '@titulacion/proyectos-grado/config/avancesTableColumns';

const ProyectoAvancesSection = ({
  avances,
  loading,
  error,
  descargandoId,
  onDescargar,
  onRevisar = null,
  emptyText = 'El proyecto aún no tiene avances subidos.',
  extra = null,
}) => {
  const columns = createAvancesTableColumns({ onDescargar, descargandoId, onRevisar });

  return (
    <div className="sd-tab-body">
      <DetailInfoCard
        title={`Avances del proyecto (${avances.length})`}
        icon={<CloudUploadOutlined />}
        cols={1}
        extra={extra}
      >
        {error ? (
          <Alert type="error" showIcon title="No se pudieron cargar los avances" description={error} />
        ) : avances.length === 0 && !loading ? (
          <Empty description={emptyText} />
        ) : (
          <Table
            dataSource={avances}
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

export default ProyectoAvancesSection;
