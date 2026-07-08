/**
 * Tipo de documento (ícono + label del ENUM) + descripción truncada (2 líneas),
 * columna "Tipo y descripción" del listado de Documentación. Mismo patrón y
 * clases que `CarreraAreaDescripcionCell` (Configuración → Académico) — las
 * clases `cfg-carrera-area-desc*` son el átomo global "ícono + título +
 * descripción" de table-cells.css, no se recrean aquí.
 */
import { createElement } from 'react';
import { getTipoDocumentoLabel } from '@application-configuracion/documentacion/config/tipos';
import { getDocumentacionTipoIcon } from '@configuracion/documentacion/config/documentacionTipoIconMap';

/** Ícono del tipo (createElement evita crear componentes en render). */
const renderTipoIcono = (tipoDocumento) =>
  createElement(getDocumentacionTipoIcon(tipoDocumento), {
    className: 'cfg-carrera-area-desc__icon',
    'aria-hidden': true,
  });

const DocumentacionTipoDescripcionCell = ({ tipoDocumento, descripcion }) => (
  <div className="cfg-carrera-area-desc">
    <div className="cfg-carrera-area-desc__area">
      {renderTipoIcono(tipoDocumento)}
      <span>{getTipoDocumentoLabel(tipoDocumento)}</span>
    </div>
    {descripcion ? (
      <p className="cfg-carrera-area-desc__texto" title={descripcion}>
        {descripcion}
      </p>
    ) : (
      <p className="cfg-carrera-area-desc__texto cfg-carrera-area-desc__texto--empty">—</p>
    )}
  </div>
);

export default DocumentacionTipoDescripcionCell;
