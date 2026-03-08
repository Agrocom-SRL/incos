/**
 * ScholarshipsSection — Estilo moderno HRment
 * Cards con campos label-arriba/valor-abajo, badge de estado prominente.
 */

import { TrophyOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';

const ESTADO = {
  PENDIENTE:  { label: 'Pendiente',  bg: '#fef3c7', color: '#92400e', border: 'rgba(245,158,11,.22)' },
  ACTIVA:     { label: 'Activa',     bg: '#e8f5e9', color: '#196b45', border: 'rgba(25,107,69,.22)'  },
  FINALIZADA: { label: 'Finalizada', bg: '#eff6ff', color: '#1e40af', border: 'rgba(59,130,246,.22)' },
  RECHAZADA:  { label: 'Rechazada',  bg: '#fee2e2', color: '#991b1b', border: 'rgba(228,28,36,.22)'  },
};

const formatDate = (d) => {
  if (!d) return null;
  try { return new Date(d).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' }); }
  catch { return d; }
};

const ScholarshipsSection = ({ scholarships }) => {
  if (!scholarships || scholarships.length === 0) return null;

  return (
    <>
      <style>{`
        .sc__header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .7px;
          color: #9ca3af;
        }
        .sc__header-icon {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: #e8f5e9;
          color: #196b45;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          flex-shrink: 0;
        }
        .sc__list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sc__card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          transition: box-shadow .18s, border-color .18s;
        }
        .sc__card:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,.07);
          border-color: #d1d5db;
        }
        .sc__card-head {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid #f3f4f6;
          background: #fafafa;
        }
        .sc__trophy-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          color: #196b45;
          flex-shrink: 0;
        }
        .sc__head-info {
          flex: 1;
          min-width: 0;
        }
        .sc__name {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #111827;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sc__code {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
          margin-top: 1px;
        }
        .sc__estado-badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
          padding: 4px 12px;
          border-radius: 20px;
          flex-shrink: 0;
          border: 1px solid;
        }
        .sc__card-body {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 16px 24px;
          padding: 16px 20px;
        }
        .sc__field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .sc__field-label {
          font-size: 13.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .55px;
          color: #9ca3af;
        }
        .sc__field-value {
          font-size: 15px;
          font-weight: 600;
          color: #374151;
        }
        .sc__pct {
          display: inline-block;
          font-size: 15px;
          font-weight: 700;
          color: #196b45;
          background: #e8f5e9;
          border: 1px solid rgba(25,107,69,.2);
          padding: 2px 12px;
          border-radius: 20px;
        }
        .sc__docs-ok {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          color: #196b45;
        }
        .sc__docs-no {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          color: #d97706;
        }
        .sc__obs {
          padding: 10px 20px 14px;
          font-size: 13.5px;
          color: #6b7280;
          border-top: 1px dashed #f3f4f6;
          font-style: italic;
        }
        @media (max-width: 500px) {
          .sc__card-body { grid-template-columns: repeat(2, 1fr); }
          .sc__card-head { flex-wrap: wrap; }
        }
      `}</style>

      <div>
        <div className="sc__header-row">
          <span className="sc__header-icon"><TrophyOutlined /></span>
          Becas asignadas
        </div>

        <div className="sc__list">
          {scholarships.map((s, i) => {
            const estado = s.state || s.estado;
            const cfg = ESTADO[estado] || { label: estado || '—', bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' };
            const pct = s.scholarshipPercentage;
            const reqDate = formatDate(s.requestDate || s.fechaSolicitud);
            const docsOk = s.documentsComplete ?? s.documentosCompletos;

            return (
              <div className="sc__card" key={s.id || i}>
                <div className="sc__card-head">
                  <div className="sc__trophy-icon"><TrophyOutlined /></div>
                  <div className="sc__head-info">
                    <p className="sc__name">{s.scholarshipName || `Beca ${i + 1}`}</p>
                    {s.scholarshipCode && <p className="sc__code">{s.scholarshipCode}</p>}
                  </div>
                  <span
                    className="sc__estado-badge"
                    style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                  >
                    {cfg.label}
                  </span>
                </div>

                <div className="sc__card-body">
                  {pct != null && (
                    <div className="sc__field">
                      <span className="sc__field-label">Descuento</span>
                      <span className="sc__field-value"><span className="sc__pct">{pct}%</span></span>
                    </div>
                  )}
                  {reqDate && (
                    <div className="sc__field">
                      <span className="sc__field-label">Fecha de solicitud</span>
                      <span className="sc__field-value">{reqDate}</span>
                    </div>
                  )}
                  {(s.managementCode || s.managementYear) && (
                    <div className="sc__field">
                      <span className="sc__field-label">Gestión</span>
                      <span className="sc__field-value">{s.managementCode || s.managementYear}</span>
                    </div>
                  )}
                  {docsOk !== undefined && (
                    <div className="sc__field">
                      <span className="sc__field-label">Documentos</span>
                      <span className="sc__field-value">
                        {docsOk
                          ? <span className="sc__docs-ok"><CheckCircleFilled /> Completos</span>
                          : <span className="sc__docs-no"><CloseCircleFilled /> Incompletos</span>}
                      </span>
                    </div>
                  )}
                </div>

                {s.observations && (
                  <div className="sc__obs">Obs: {s.observations}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ScholarshipsSection;
