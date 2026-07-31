/**
 * Organismo: tab "Informes" de la ficha-hub del trámite de pasantía (TUT ·
 * P11-P14).
 *
 * DetailInfoCard + tabla de informes institucionales (verificación de empresa
 * / convalidación de trabajo). "Emitir informe" gated por informe·CREAR;
 * editar por informe·EDITAR y descarga del PDF por pasantia·EXPORTAR (en las
 * columnas). Estados carga/vacío/error cubiertos. Con `readOnly` (portal del
 * estudiante) la tabla es de solo lectura.
 */

import { Alert, Empty, Table } from 'antd';
import { FileAddOutlined, FilePdfOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { ActionButton } from '@atoms';
import { TUTORIAS_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { createInformesPasantiaTableColumns } from '@titulacion/pasantias/config/informesPasantiaTableColumns';

const PasantiaInformesSection = ({
  informes,
  loading,
  error,
  descargandoId,
  onNuevoInforme,
  onEditarInforme,
  onDescargar,
  readOnly = false,
}) => {
  const columns = createInformesPasantiaTableColumns({
    onEditar: onEditarInforme,
    onDescargar,
    descargandoId,
    readOnly,
  });

  return (
    <div className="sd-tab-body">
      <DetailInfoCard
        title={`Informes (${informes.length})`}
        icon={<FilePdfOutlined />}
        cols={1}
        extra={
          !readOnly ? (
            <ActionButton
              permiso={TUTORIAS_PERMISOS.pasantiaInforme}
              accion="CREAR"
              variant="primary"
              icon={<FileAddOutlined />}
              onClick={onNuevoInforme}
            >
              Emitir informe
            </ActionButton>
          ) : null
        }
      >
        {error ? (
          <Alert type="error" showIcon title="No se pudieron cargar los informes" description={error} />
        ) : informes.length === 0 && !loading ? (
          <Empty description="El trámite aún no tiene informes emitidos." />
        ) : (
          <Table
            dataSource={informes}
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

export default PasantiaInformesSection;
