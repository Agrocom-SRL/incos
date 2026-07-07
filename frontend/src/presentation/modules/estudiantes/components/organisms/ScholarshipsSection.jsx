/**
 * ScholarshipsSection — Estilo moderno HRment
 * Cards con campos label-arriba/valor-abajo, badge de estado prominente.
 * Opcional: onDeleteBeca(beca) habilita el ícono de eliminar (TableActions) en cada
 * card. Debe ser una función "cruda" que retorne { success, error? } — el diálogo de
 * confirmación y el feedback de éxito/error los resuelve TableActions internamente
 * (no duplicar showDeleteConfirm/mensajes en el llamador).
 *
 * Normalización de campos (state/estado, requestDate/fechaSolicitud, etc.) vive en
 * useScholarshipsSection (Application Layer); este componente solo compone JSX.
 */

import { TrophyOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { TableActions } from '@molecules';
import { useScholarshipsSection } from '@application-estudiantes/hooks';
import { getEstadoBecaCfg, formatDate } from '../../config/scholarshipsSectionConfig';
import '../../styles/scholarships-section.css';

const ScholarshipsSection = ({ scholarships, onDeleteBeca }) => {
  const items = useScholarshipsSection(scholarships);

  if (items.length === 0) return null;

  return (
    <div>
      <div className="sc__header-row">
        <span className="sc__header-icon"><TrophyOutlined /></span>
        Becas asignadas
      </div>

      <div className="sc__list">
        {items.map((item) => {
          const cfg = getEstadoBecaCfg(item.estado);
          const reqDate = formatDate(item.requestDate);

          return (
            <div className="sc__card" key={item.key}>
              <div className="sc__card-head">
                <div className="sc__trophy-icon"><TrophyOutlined /></div>
                <div className="sc__head-info">
                  <p className="sc__name">{item.scholarshipName}</p>
                  {item.scholarshipCode && <p className="sc__code">{item.scholarshipCode}</p>}
                </div>
                <span
                  className="sc__estado-badge"
                  style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                >
                  {cfg.label}
                </span>
              </div>

              <div className="sc__card-body">
                {item.pct != null && (
                  <div className="sc__field">
                    <span className="sc__field-label">Descuento</span>
                    <span className="sc__field-value"><span className="sc__pct">{item.pct}%</span></span>
                  </div>
                )}
                {reqDate && (
                  <div className="sc__field">
                    <span className="sc__field-label">Fecha de solicitud</span>
                    <span className="sc__field-value">{reqDate}</span>
                  </div>
                )}
                {item.managementLabel && (
                  <div className="sc__field">
                    <span className="sc__field-label">Gestión</span>
                    <span className="sc__field-value">{item.managementLabel}</span>
                  </div>
                )}
                {item.docsOk !== undefined && (
                  <div className="sc__field">
                    <span className="sc__field-label">Documentos</span>
                    <span className="sc__field-value">
                      {item.docsOk
                        ? <span className="sc__docs-ok"><CheckCircleFilled /> Completos</span>
                        : <span className="sc__docs-no"><CloseCircleFilled /> Incompletos</span>}
                    </span>
                  </div>
                )}
              </div>

              {item.observations && (
                <div className="sc__obs">Obs: {item.observations}</div>
              )}

              {typeof onDeleteBeca === 'function' && (
                <div className="sc__card-actions">
                  <TableActions
                    record={item.raw}
                    deleteFn={() => onDeleteBeca(item.raw)}
                    itemName={item.itemName}
                    itemDetails={item.itemDetails}
                    permisos={{ eliminar: { codigo: 'matricula.beca.asignar', accion: 'ELIMINAR' } }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScholarshipsSection;
