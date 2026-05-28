/**
 * Área de formación + descripción truncada (2 líneas).
 */

import { AppstoreOutlined } from '@ant-design/icons';

const CarreraAreaDescripcionCell = ({ areaFormacion, descripcion }) => (
  <div className="cfg-carrera-area-desc">
    <div className="cfg-carrera-area-desc__area">
      <AppstoreOutlined className="cfg-carrera-area-desc__icon" aria-hidden />
      <span>{areaFormacion || '—'}</span>
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

export default CarreraAreaDescripcionCell;
