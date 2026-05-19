/**
 * Detalle expandible de una fila (columnas ocultas según layout de tabla).
 * @param {{ record: object, variant?: 'compact' | 'narrow' | 'medium' }} props
 */
import StatusPill from './StatusPill';
import AdmissionTypeTag from './AdmissionTypeTag';

function DetailItem({ label, children }) {
  return (
    <div className="matricula-v2-table-expand__item">
      <dt className="matricula-v2-table-expand__label">{label}</dt>
      <dd className="matricula-v2-table-expand__value">{children}</dd>
    </div>
  );
}

function CareerDetail({ r }) {
  return (
    <>
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
    </>
  );
}

function PagoDetail({ r }) {
  return (
    <span
      className="matricula-v2-table-expand__pago"
      data-status={r.estadoPago === 'Al día' ? 'ok' : r.estadoPago === 'Pendiente' ? 'err' : 'info'}
    >
      {r.estadoPago}
    </span>
  );
}

function GestionDetail({ r }) {
  return (
    <>
      <span className="matricula-v2-table-expand__gestion">{r.gestion}</span>
      <div className="matricula-v2-table-expand__meta">{r.fechaMatricula}</div>
    </>
  );
}

const MatriculaTableRowDetails = ({ record: r, variant = 'compact' }) => (
  <div className="matricula-v2-table-expand" onClick={(e) => e.stopPropagation()}>
    <dl className="matricula-v2-table-expand__grid">
      {variant === 'compact' ? (
        <>
          <DetailItem label="Carrera">
            <CareerDetail r={r} />
          </DetailItem>
          <DetailItem label="Tipo">
            <AdmissionTypeTag tipo={r.tipo} />
          </DetailItem>
          <DetailItem label="Historial">
            <StatusPill statusKey={r.historial} label={r.historyState?.label} />
          </DetailItem>
          <DetailItem label="Pago">
            <PagoDetail r={r} />
          </DetailItem>
          <DetailItem label="Gestión">
            <GestionDetail r={r} />
          </DetailItem>
        </>
      ) : null}

      {variant === 'narrow' ? (
        <>
          <DetailItem label="Historial">
            <StatusPill statusKey={r.historial} label={r.historyState?.label} />
          </DetailItem>
          <DetailItem label="Pago">
            <PagoDetail r={r} />
          </DetailItem>
          <DetailItem label="Tipo">
            <AdmissionTypeTag tipo={r.tipo} />
          </DetailItem>
          <DetailItem label="Gestión">
            <GestionDetail r={r} />
          </DetailItem>
        </>
      ) : null}

      {variant === 'medium' ? (
        <>
          <DetailItem label="Pago">
            <PagoDetail r={r} />
          </DetailItem>
          <DetailItem label="Tipo">
            <AdmissionTypeTag tipo={r.tipo} />
          </DetailItem>
          <DetailItem label="Gestión">
            <GestionDetail r={r} />
          </DetailItem>
        </>
      ) : null}
    </dl>
  </div>
);

export default MatriculaTableRowDetails;
