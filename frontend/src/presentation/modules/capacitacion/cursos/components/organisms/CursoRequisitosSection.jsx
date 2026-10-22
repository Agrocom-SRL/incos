/**
 * Organismo: tab "Requisitos" de la ficha de curso (CAP).
 *
 * Lista de requisitos de inscripción (icono, nombre y pills: obligatorio y si acredita
 * el pago del costo del curso). Estado vacío cubierto. Recibe props ya mapeadas; no
 * llama hooks.
 */

import { CheckSquareOutlined } from '@ant-design/icons';
import { Empty } from 'antd';
import { DetailInfoCard } from '@molecules';
import RequisitoCursoItem from '../molecules/RequisitoCursoItem';

const CursoRequisitosSection = ({ requisitos = [] }) => (
  <div className="sd-tab-body">
    <DetailInfoCard
      title={`Requisitos de inscripción (${requisitos.length})`}
      icon={<CheckSquareOutlined />}
      cols={1}
    >
      {requisitos.length > 0 ? (
        <div className="requisito-curso-list">
          {requisitos.map((requisito, index) => (
            <RequisitoCursoItem
              key={requisito.id ?? index}
              requisito={requisito}
            />
          ))}
        </div>
      ) : (
        <Empty description="El curso no exige requisitos de inscripción." />
      )}
    </DetailInfoCard>
  </div>
);

export default CursoRequisitosSection;
