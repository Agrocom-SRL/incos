import { Table } from 'antd';
import { EditOutlined, HistoryOutlined } from '@ant-design/icons';
import { Button } from '@atoms';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import { createHistorialPrevioColumns } from '@inscripciones/config/inscripcionDetailColumns';

const columnasHistorialPrevio = createHistorialPrevioColumns();

const InscripcionHistorialPrevioTab = ({
  requiereHistorialPrevio,
  priorEnrollmentHistories = [],
  puedeEditarInscripcion,
  canEdit,
  onEditar,
}) => (
  <div className="sd-tab-body">
    {requiereHistorialPrevio === false ? (
      <div className="sd-empty">
        <HistoryOutlined className="sd-empty__icon" />
        <p className="sd-empty__text">El tipo de inscripción NUEVO no requiere historial previo.</p>
      </div>
    ) : priorEnrollmentHistories.length === 0 ? (
      <div className="sd-empty">
        <HistoryOutlined className="sd-empty__icon" />
        <p className="sd-empty__text">
          No hay notas de periodos anteriores registradas. Use Editar para cargar el historial previo.
        </p>
        {puedeEditarInscripcion && canEdit ? (
          <Button variant="primary" icon={<EditOutlined />} onClick={onEditar} style={{ marginTop: 12 }}>
            Completar historial previo
          </Button>
        ) : null}
      </div>
    ) : (
      <DetailInfoCard
        title={`Historial previo (${priorEnrollmentHistories.length})`}
        icon={<HistoryOutlined />}
        cols={1}
      >
        <Table
          dataSource={priorEnrollmentHistories}
          columns={columnasHistorialPrevio}
          rowKey={(row) =>
            row.id ||
            `${row.materiaId ?? row.materia_id}-${row.periodoId ?? row.periodId ?? row.period_id}`
          }
          size="small"
          pagination={false}
        />
      </DetailInfoCard>
    )}
  </div>
);

export default InscripcionHistorialPrevioTab;
