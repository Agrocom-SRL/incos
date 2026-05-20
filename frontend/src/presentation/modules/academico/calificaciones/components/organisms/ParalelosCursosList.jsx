/**
 * Lista de paralelos con grid de cursos (tarjetas institucionales).
 */

import { Empty } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import CursoCalificacionCard from '../molecules/CursoCalificacionCard.jsx';
import { docenteCarreraTitleStyles, sanitizeDocenteColorHex } from '@docentes/components/atoms/DocenteColorBar';

const ParalelosCursosList = ({ grupos = [], onRegistrarNotas, onConfigurarPlan }) => {
  if (!grupos.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No hay cursos vigentes asignados para esta gestión"
      />
    );
  }

  return (
    <div className="cal-paralelos-list">
      {grupos.map((grupo, idx) => {
        const carreraColor = sanitizeDocenteColorHex(grupo.carreraColorHex);
        return (
          <section key={grupo.paraleloKey || idx} className="cal-paralelo-block">
            <div className="cal-paralelo-head">
              <h3
                className={`cal-paralelo-title${carreraColor ? ' da-carga__carrera-title--tinted' : ''}`}
                style={docenteCarreraTitleStyles(carreraColor) ?? undefined}
              >
                <TeamOutlined style={{ marginRight: 8 }} />
                Paralelo {grupo.paralelo}
                {grupo.turno ? ` · ${grupo.turno}` : ''}
              </h3>
              <span className="cal-paralelo-meta">
                {[grupo.carrera, grupo.gestion].filter(Boolean).join(' · ')}
                {grupo.cursos?.length ? ` · ${grupo.cursos.length} curso(s)` : ''}
              </span>
            </div>
            <div className="cal-cursos-grid">
              {grupo.cursos.map((curso) => (
                <CursoCalificacionCard
                  key={curso.asignacionId}
                  curso={curso}
                  onRegistrarNotas={onRegistrarNotas}
                  onConfigurarPlan={onConfigurarPlan}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ParalelosCursosList;
