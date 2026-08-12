import { Table } from 'antd';
import { BookOutlined } from '@ant-design/icons';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import { createMateriasInscritasColumns } from '@matricula/registro/config/inscripcionDetailColumns';

const columnasMaterias = createMateriasInscritasColumns();

const InscripcionMateriasTab = ({ subjectEnrollments = [] }) => (
  <div className="sd-tab-body">
    {subjectEnrollments.length === 0 ? (
      <div className="sd-empty">
        <BookOutlined className="sd-empty__icon" />
        <p className="sd-empty__text">No hay materias inscritas para esta inscripción</p>
      </div>
    ) : (
      <DetailInfoCard title={`Materias inscritas (${subjectEnrollments.length})`} icon={<BookOutlined />} cols={1}>
        <Table
          dataSource={subjectEnrollments}
          columns={columnasMaterias}
          rowKey={(row) =>
            row.id ||
            row.matriculaMateriaId ||
            row.materiaId ||
            row.courseId ||
            `${row.materiaSigla || 'materia'}-${row.paralelo?.id || row.paralelo?.nombre || 'sin-paralelo'}`
          }
          size="small"
          pagination={false}
        />
      </DetailInfoCard>
    )}
  </div>
);

export default InscripcionMateriasTab;
