/**
 * Organismo: tab "Seguimientos" de la ficha-hub del trámite de pasantía
 * (TIT · P15-P17).
 *
 * DetailInfoCard + tabla de la hoja de seguimiento (escala ALTO/MEDIO/BAJO).
 * "Registrar seguimiento" gated por seguimiento·CREAR; editar por
 * seguimiento·EDITAR (en las columnas). Estados carga/vacío/error cubiertos.
 * Con `readOnly` (portal del estudiante) la tabla es de solo lectura.
 */

import { Alert, Empty, Table } from 'antd';
import { FileAddOutlined, ScheduleOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { ActionButton } from '@atoms';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { createSeguimientosPasantiaTableColumns } from '@titulacion/pasantias/config/seguimientosPasantiaTableColumns';

const PasantiaSeguimientosSection = ({
  seguimientos,
  loading,
  error,
  onNuevoSeguimiento,
  onEditarSeguimiento,
  readOnly = false,
}) => {
  const columns = createSeguimientosPasantiaTableColumns({
    onEditar: onEditarSeguimiento,
    readOnly,
  });

  return (
    <div className="sd-tab-body">
      <DetailInfoCard
        title={`Seguimientos (${seguimientos.length})`}
        icon={<ScheduleOutlined />}
        cols={1}
        extra={
          !readOnly ? (
            <ActionButton
              permiso={TITULACION_PERMISOS.pasantiaSeguimiento}
              accion="CREAR"
              variant="primary"
              icon={<FileAddOutlined />}
              onClick={onNuevoSeguimiento}
            >
              Registrar seguimiento
            </ActionButton>
          ) : null
        }
      >
        {error ? (
          <Alert
            type="error"
            showIcon
            title="No se pudieron cargar los seguimientos"
            description={error}
          />
        ) : seguimientos.length === 0 && !loading ? (
          <Empty description="El trámite aún no tiene seguimientos registrados." />
        ) : (
          <Table
            dataSource={seguimientos}
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

export default PasantiaSeguimientosSection;
