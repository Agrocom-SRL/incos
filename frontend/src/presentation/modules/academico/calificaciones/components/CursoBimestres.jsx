/**
 * Progreso por bimestre de un curso (contenido extra de la card de Mis cursos).
 * Específico de Calificaciones; se inyecta en CursoDocenteCard vía `renderExtra`.
 * Sus estilos viven en calificaciones.css (cal-curso-card__bimestre*).
 */

import { Progress, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const ESTADO_BIMESTRE_DOT = {
  abierto: 'cal-curso-card__dot--en-curso',
  cerrado: 'cal-curso-card__dot--cerrado',
  futuro: 'cal-curso-card__dot--futuro',
};

const CursoBimestre = ({ bimestre, esVigente }) => {
  const { numero, estado, progreso, aprobados, reprobados, pendientes } =
    bimestre;
  const tipo = estado?.tipo ?? 'futuro';
  const dotClass = ESTADO_BIMESTRE_DOT[tipo] ?? ESTADO_BIMESTRE_DOT.futuro;

  return (
    <div
      className={[
        'cal-curso-card__bimestre',
        esVigente ? 'cal-curso-card__bimestre--vigente' : '',
        estado?.tipo === 'futuro' ? 'cal-curso-card__bimestre--futuro' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="cal-curso-card__bimestre-head">
        <span className="cal-curso-card__bimestre-num">B{numero}</span>
        <Tooltip title={estado?.etiqueta ?? '—'}>
          <span
            className={['cal-curso-card__dot', dotClass].join(' ')}
            role="img"
            aria-label={estado?.etiqueta ?? 'Estado del bimestre'}
          />
        </Tooltip>
      </div>
      <Tooltip
        title={
          tipo === 'abierto'
            ? `${progreso}% con al menos una nota en el cuaderno`
            : `${progreso}% con nota efectiva registrada`
        }
      >
        <Progress
          percent={progreso}
          size="small"
          showInfo={false}
          strokeColor={esVigente ? 'var(--color-primary, #196b45)' : undefined}
        />
      </Tooltip>
      <div className="cal-curso-card__bimestre-stats">
        {tipo === 'abierto' ? (
          <span
            title="Sin nota en cuaderno"
            className="cal-curso-card__stat-pendientes"
          >
            Pend. {pendientes ?? 0}
          </span>
        ) : (
          <>
            <span title="Aprobados">
              <CheckCircleOutlined className="cal-curso-card__stat-icon--ok" />
              {aprobados}
            </span>
            <span title="Reprobados">
              <CloseCircleOutlined className="cal-curso-card__stat-icon--no" />
              {reprobados}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const CursoBimestres = ({ bimestres, bimestreVigente = null }) => {
  if (!bimestres?.length) return null;

  return (
    <div className="cal-curso-card__bimestres">
      <p className="cal-curso-card__bimestres-title">Progreso por bimestre</p>
      <div className="cal-curso-card__bimestres-grid">
        {bimestres.map((b) => (
          <CursoBimestre
            key={b.numero}
            bimestre={b}
            esVigente={Number(b.numero) === Number(bimestreVigente)}
          />
        ))}
      </div>
    </div>
  );
};

export default CursoBimestres;
