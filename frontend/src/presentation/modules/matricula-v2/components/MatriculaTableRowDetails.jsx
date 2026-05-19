/**
 * Detalle expandible de una fila (columnas secundarias en vista compacta).
 * @param {{ record: object }} props
 */
import { Tag } from 'antd';
import StatusPill from './StatusPill';

function DetailItem({ label, children }) {
  return (
    <div className="matricula-v2-table-expand__item">
      <dt className="matricula-v2-table-expand__label">{label}</dt>
      <dd className="matricula-v2-table-expand__value">{children}</dd>
    </div>
  );
}

const MatriculaTableRowDetails = ({ record: r }) => (
  <div className="matricula-v2-table-expand" onClick={(e) => e.stopPropagation()}>
    <dl className="matricula-v2-table-expand__grid">
      <DetailItem label="Carrera">
        <span className="matricula-v2-table-expand__career">
          <span
            className="matricula-v2-table-expand__career-dot"
            style={{ background: r.career.color }}
            aria-hidden
          />
          {r.career.name}
        </span>
        <div className="matricula-v2-table-expand__meta">
          {r.semestre}° semestre · {r.materias} materias
        </div>
      </DetailItem>
      <DetailItem label="Tipo">
        <Tag
          className="matricula-v2-table-tag"
          style={{
            background: r.isAntiguo ? 'var(--pill-warn-bg)' : 'var(--pill-ok-bg)',
            color: r.isAntiguo ? 'var(--pill-warn-fg)' : 'var(--pill-ok-fg)',
          }}
        >
          {r.tipo}
        </Tag>
      </DetailItem>
      <DetailItem label="Historial">
        <StatusPill statusKey={r.historial} label={r.historyState?.label} />
      </DetailItem>
      <DetailItem label="Pago">
        <span
          className="matricula-v2-table-expand__pago"
          data-status={
            r.estadoPago === 'Al día' ? 'ok' : r.estadoPago === 'Pendiente' ? 'err' : 'info'
          }
        >
          {r.estadoPago}
        </span>
      </DetailItem>
      <DetailItem label="Gestión">
        <span className="matricula-v2-table-expand__gestion">{r.gestion}</span>
      </DetailItem>
      <DetailItem label="Inscripción">
        <span className="matricula-v2-table-expand__gestion">{r.fechaMatricula}</span>
      </DetailItem>
    </dl>
  </div>
);

export default MatriculaTableRowDetails;
