/**
 * Organismo: tab "Integrantes" de la ficha-hub del proyecto (TIT · T12/T13).
 *
 * DetailInfoCard + tabla (patrón `InscripcionPagosSection` de CAP). El botón
 * "Agregar integrante" solo aparece en modalidades grupales (PSP) y está
 * gated por proyecto·EDITAR (ActionButton fail-closed).
 */

import { Empty, Table } from 'antd';
import { TeamOutlined, UserAddOutlined } from '@ant-design/icons';
import { DetailInfoCard } from '@molecules';
import { ActionButton } from '@atoms';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';
import { esModalidadGrupal } from '@application-titulacion/utils/titulacionPills';
import { createIntegrantesTableColumns } from '@titulacion/proyectos-grado/config/integrantesTableColumns';

const ProyectoIntegrantesSection = ({ proyecto, onAgregar, onToggleEstado }) => {
  const integrantes = proyecto.integrantes ?? [];
  const columns = createIntegrantesTableColumns({ onToggleEstado });
  const grupal = esModalidadGrupal(proyecto.modalidadCodigo);

  return (
    <div className="sd-tab-body">
      <DetailInfoCard
        title={`Integrantes (${integrantes.length})`}
        icon={<TeamOutlined />}
        cols={1}
        extra={
          grupal ? (
            <ActionButton
              permiso={TITULACION_PERMISOS.proyecto}
              accion="EDITAR"
              variant="primary"
              icon={<UserAddOutlined />}
              onClick={onAgregar}
            >
              Agregar integrante
            </ActionButton>
          ) : null
        }
      >
        {integrantes.length > 0 ? (
          <Table
            dataSource={integrantes}
            columns={columns}
            rowKey={(record) => record.id}
            size="small"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Empty description="El proyecto aún no tiene integrantes registrados." />
        )}
      </DetailInfoCard>
    </div>
  );
};

export default ProyectoIntegrantesSection;
