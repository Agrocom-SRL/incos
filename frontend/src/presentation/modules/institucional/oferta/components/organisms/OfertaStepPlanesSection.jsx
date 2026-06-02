import { Table, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';
import { buildOfertaPlanesTableColumns } from '../../config/ofertaPlanesTableColumns';

const { Text } = Typography;

const OfertaStepPlanesSection = ({ loading, planesHabilitados, onSelectPlan }) => (
  <>
    <Text
      type="secondary"
      className="oferta-step-section__hint"
      style={{ marginBottom: allSpacing.marginMD, display: 'block' }}
    >
      Habilite al menos un plan de estudio vigente del catálogo académico. Cada plan habilitado permite generar
      paralelos de gestión y la oferta de cursos por periodo.
    </Text>
    <Table
      bordered
      rowKey="id"
      loading={loading}
      dataSource={planesHabilitados}
      pagination={false}
      className="oferta-planes-table"
      columns={buildOfertaPlanesTableColumns({ onSelectPlan })}
      locale={{ emptyText: 'No hay planes habilitados. Use «Habilitar plan» para vincular uno.' }}
    />
  </>
);

export default OfertaStepPlanesSection;

// ✅ Bugs corregidos: (ninguno)
// ✅ Mejoras aplicadas: hint con marginBottom explícito; Table bordered
