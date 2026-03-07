/**
 * DocumentDeliveriesSection — Estilo moderno HRment
 * Lista limpia: icono + nombre grande + pills de estado.
 */

import { FileOutlined, CheckCircleFilled, CloseCircleFilled, SyncOutlined, FileProtectOutlined } from '@ant-design/icons';

const DocumentDeliveriesSection = ({ documentDeliveries }) => {
  if (!documentDeliveries || documentDeliveries.length === 0) return null;

  return (
    <>
      <style>{`
        .dd__header-row {
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
        .dd__header-icon {
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
        .dd__list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dd__item {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #fff;
          overflow: hidden;
          transition: box-shadow .15s, border-color .15s;
        }
        .dd__item:hover {
          box-shadow: 0 2px 10px rgba(0,0,0,.06);
          border-color: #d1d5db;
        }
        .dd__item-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
        }
        .dd__item-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #6b7280;
          flex-shrink: 0;
        }
        .dd__item-main {
          flex: 1;
          min-width: 0;
        }
        .dd__item-name {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dd__item-meta {
          font-size: 13px;
          color: #9ca3af;
          margin: 0;
        }
        .dd__item-obs {
          font-size: 13px;
          color: #6b7280;
          margin-top: 2px;
        }
        .dd__item-obs-block {
          padding: 10px 16px 14px;
          border-top: 1px dashed #f3f4f6;
          background: #fffbeb;
          font-size: 13px;
          color: #b45309;
          line-height: 1.4;
        }
        .dd__item-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }
        .dd__pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12.5px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 20px;
          white-space: nowrap;
        }
        .dd__pill--green {
          background: #e8f5e9;
          color: #196b45;
          border: 1px solid rgba(25,107,69,.2);
        }
        .dd__pill--amber {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid rgba(245,158,11,.2);
        }
        .dd__pill--gray {
          background: #f9fafb;
          color: #9ca3af;
          border: 1px solid #e5e7eb;
        }
        @media (max-width: 500px) {
          .dd__item-row { flex-wrap: wrap; }
          .dd__item-status { align-items: flex-start; flex-direction: row; margin-top: 6px; }
        }
      `}</style>

      <div>
        <div className="dd__header-row">
          <span className="dd__header-icon"><FileProtectOutlined /></span>
          Documentos entregados
        </div>

        <div className="dd__list">
          {documentDeliveries.map((doc, i) => (
            <div className="dd__item" key={doc.id || i}>
              <div className="dd__item-row">
                <div className="dd__item-icon-wrap">
                  <FileOutlined />
                </div>
                <div className="dd__item-main">
                  <p className="dd__item-name">
                    {doc.documentacionName || doc.documentacionId || `Documento ${i + 1}`}
                  </p>
                  {doc.fechaEntrega && (
                    <p className="dd__item-meta">Entregado el {doc.fechaEntrega}</p>
                  )}
                </div>
                <div className="dd__item-status">
                  {doc.entregado ? (
                    <span className="dd__pill dd__pill--green">
                      <CheckCircleFilled /> Entregado
                    </span>
                  ) : (
                    <span className="dd__pill dd__pill--gray">
                      <CloseCircleFilled /> Pendiente
                    </span>
                  )}
                  {Boolean(doc.enTramite) && (
                    <span className="dd__pill dd__pill--amber">
                      <SyncOutlined spin /> En trámite
                    </span>
                  )}
                </div>
              </div>
              {doc.observaciones && (
                <div className="dd__item-obs-block">{doc.observaciones}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DocumentDeliveriesSection;
