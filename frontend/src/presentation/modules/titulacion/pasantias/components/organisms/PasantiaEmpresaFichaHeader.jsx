/**
 * Organismo: cabecera de la ficha de empresa del catálogo de pasantías (TIT).
 *
 * Reusa el shell compartido `sd-profile` (detail-page.css), gemelo de
 * `CursoCapacitacionFichaHeader`/`PagoFichaHeader`. El nombre comercial (si
 * existe) es la identidad principal — la razón social baja a subtítulo, igual
 * criterio que la columna "Empresa" del listado. Recibe props ya mapeadas; no
 * llama hooks (el gate de permiso se resuelve en la página).
 */

import { Tooltip } from 'antd';
import { BankOutlined, EditOutlined } from '@ant-design/icons';
import { StatusPill } from '@atoms';
import { formatTipoSocietario } from '@application-titulacion/utils/pasantiasPills';

const PasantiaEmpresaFichaHeader = ({ empresa, puedeEditar = false, onEditar }) => {
  const nombrePrincipal = empresa.nombreComercial || empresa.nombre;
  const subtitleParts = [
    empresa.nombreComercial ? empresa.nombre : null,
    empresa.nit ? `NIT ${empresa.nit}` : null,
  ].filter(Boolean);

  return (
    <div className="sd-profile">
      {puedeEditar && onEditar ? (
        <Tooltip title="Editar datos de la empresa">
          <button
            type="button"
            className="sd-profile__edit-btn"
            onClick={onEditar}
            aria-label="Editar empresa"
          >
            <EditOutlined />
          </button>
        </Tooltip>
      ) : null}

      <div className="sd-profile__identity">
        <div className="sd-profile__avatar-wrap">
          <div className="sd-profile__avatar sd-profile__avatar--default" aria-hidden>
            <BankOutlined />
          </div>
        </div>
        <div className="sd-profile__name-block">
          <h1 className="sd-profile__name">{nombrePrincipal}</h1>
          <div className="sd-profile__meta">
            <p className="sd-profile__sub">
              {subtitleParts.join(' · ') || 'Empresa de pasantía'}
            </p>
            {empresa.tipoSocietario ? (
              <StatusPill
                label={formatTipoSocietario(empresa.tipoSocietario)}
                className="cfg-materia-pill cfg-materia-pill--default"
              />
            ) : null}
            {!empresa.activo ? (
              <StatusPill label="Inactiva" className="cfg-materia-pill cfg-materia-pill--inactiva" />
            ) : null}
          </div>
        </div>
      </div>

      <div className="sd-profile__divider" />

      <div className="sd-profile__stats">
        <div className="sd-stat">
          <span className="sd-stat__label">NIT</span>
          <span className="sd-stat__value">{empresa.nit || '—'}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">Sector / actividad</span>
          <span className="sd-stat__value">{empresa.sectorActividad || '—'}</span>
        </div>
        <div className="sd-stat">
          <span className="sd-stat__label">En funcionamiento</span>
          <span className="sd-stat__value">{empresa.enFuncionamiento === false ? 'No' : 'Sí'}</span>
        </div>
      </div>
    </div>
  );
};

export default PasantiaEmpresaFichaHeader;
