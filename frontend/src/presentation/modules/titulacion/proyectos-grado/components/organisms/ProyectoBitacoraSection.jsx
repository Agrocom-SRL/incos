/**
 * Organismo: tab "Bitácora" de la ficha-hub del proyecto (TIT · T14-T16).
 *
 * DetailInfoCard + tabla de entradas (fuente de la planilla de seguimiento
 * DDE). "Nueva entrada" gated por bitacora·CREAR; editar por bitacora·EDITAR
 * (en las columnas). Estados carga/vacío/error cubiertos.
 */

import { Alert, Empty, Table } from 'antd';
import { FileAddOutlined, FileTextOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { ActionButton } from '@atoms';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { createBitacoraTableColumns } from '@titulacion/proyectos-grado/config/bitacoraTableColumns';

const ProyectoBitacoraSection = ({
  entradas,
  loading,
  error,
  onNuevaEntrada = null,
  onEditarEntrada = null,
}) => {
  const columns = createBitacoraTableColumns({ onEditar: onEditarEntrada });

  return (
    <div className="sd-tab-body">
      <DetailInfoCard
        title={`Bitácora de tutoría (${entradas.length})`}
        icon={<FileTextOutlined />}
        cols={1}
        extra={
          onNuevaEntrada ? (
            <ActionButton
              permiso={TITULACION_PERMISOS.bitacora}
              accion="CREAR"
              variant="primary"
              icon={<FileAddOutlined />}
              onClick={onNuevaEntrada}
            >
              Nueva entrada
            </ActionButton>
          ) : null
        }
      >
        {error ? (
          <Alert type="error" showIcon title="No se pudo cargar la bitácora" description={error} />
        ) : entradas.length === 0 && !loading ? (
          <Empty description="El proyecto aún no tiene entradas de bitácora." />
        ) : (
          <Table
            dataSource={entradas}
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

export default ProyectoBitacoraSection;
