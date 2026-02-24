/**
 * GuardiansSection — Estilo moderno HRment
 * Cards limpias con avatar, nombre grande, fields label+valor.
 */

import { HomeOutlined, TeamOutlined } from '@ant-design/icons';

const GuardianCard = ({ guardian }) => {
  const nombre = [guardian.firstName || guardian.nombres, guardian.lastName || guardian.apellidos]
    .filter(Boolean).join(' ') || '—';
  const inicial = nombre[0]?.toUpperCase() || '?';

  return (
    <div className="gc__card">
      {/* Header */}
      <div className="gc__card-header">
        <div className="gc__avatar">{inicial}</div>
        <div>
          <p className="gc__name">{nombre}</p>
          <span className="gc__role">
            {guardian.relationshipTypeName || guardian.relationshipTypeId || 'Contacto'}
          </span>
        </div>
        <span className={`gc__lives ${guardian.livesWithStudent ? 'gc__lives--yes' : 'gc__lives--no'}`}>
          <HomeOutlined />
          {guardian.livesWithStudent ? 'Convive' : 'No convive'}
        </span>
      </div>

      {/* Fields */}
      <div className="gc__fields">
        <div className="gc__field">
          <span className="gc__field-label">Celular 1</span>
          <span className="gc__field-value">
            {guardian.cellphone1 || guardian.celular1
              ? <a href={`tel:${guardian.cellphone1 || guardian.celular1}`} className="gc__link">
                  {guardian.cellphone1 || guardian.celular1}
                </a>
              : '—'}
          </span>
        </div>
        {(guardian.cellphone2 || guardian.celular2) && (
          <div className="gc__field">
            <span className="gc__field-label">Celular 2</span>
            <span className="gc__field-value">
              <a href={`tel:${guardian.cellphone2 || guardian.celular2}`} className="gc__link">
                {guardian.cellphone2 || guardian.celular2}
              </a>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

const GuardiansSection = ({ guardians }) => {
  if (!guardians || guardians.length === 0) return null;

  return (
    <>
      <style>{`
        .gc__header-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .7px;
          color: #9ca3af;
        }
        .gc__header-icon {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: #e8f5e9;
          color: #196b45;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }
        .gc__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 14px;
        }
        .gc__card {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          transition: box-shadow .18s, border-color .18s;
        }
        .gc__card:hover {
          box-shadow: 0 4px 14px rgba(25,107,69,.1);
          border-color: rgba(25,107,69,.22);
        }
        .gc__card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 16px 12px;
          border-bottom: 1px solid #f3f4f6;
        }
        .gc__avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #196b45 0%, #399f53 100%);
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(25,107,69,.25);
        }
        .gc__name {
          margin: 0 0 3px;
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
        }
        .gc__role {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .4px;
          color: #196b45;
          background: #e8f5e9;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid rgba(25,107,69,.18);
        }
        .gc__lives {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 20px;
          flex-shrink: 0;
        }
        .gc__lives--yes {
          background: #e8f5e9;
          color: #196b45;
          border: 1px solid rgba(25,107,69,.18);
        }
        .gc__lives--no {
          background: #f9fafb;
          color: #9ca3af;
          border: 1px solid #e5e7eb;
        }
        .gc__fields {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .gc__field {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .gc__field-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .55px;
          color: #9ca3af;
        }
        .gc__field-value {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }
        .gc__link {
          color: #196b45;
          font-weight: 600;
          text-decoration: none;
        }
        .gc__link:hover { text-decoration: underline; }
        @media (max-width: 500px) {
          .gc__grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div>
        <div className="gc__header-row">
          <span className="gc__header-icon"><TeamOutlined /></span>
          Contactos de emergencia
        </div>
        <div className="gc__grid">
          {guardians.map((g, i) => (
            <GuardianCard key={g.id || i} guardian={g} />
          ))}
        </div>
      </div>
    </>
  );
};

export default GuardiansSection;
