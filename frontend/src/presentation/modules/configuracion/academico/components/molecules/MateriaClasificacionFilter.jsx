/**
 * Molécula: filtro por clasificación del catálogo de materias del builder de
 * periodo (`PlanPeriodoAsignaturasPage.jsx`). Chips checkeables — «Todas» +
 * una por cada `clasificacion` presente en las materias aún disponibles.
 */

import { Tag } from 'antd';

const { CheckableTag } = Tag;

const MateriaClasificacionFilter = ({ clasificaciones = [], value, onChange }) => (
  <div className="cfg-plan-builder__clasificacion-filter">
    <CheckableTag checked={!value} onChange={() => onChange(null)}>
      Todas
    </CheckableTag>
    {clasificaciones.map((clasificacion) => (
      <CheckableTag
        key={clasificacion}
        checked={value === clasificacion}
        onChange={(checked) => onChange(checked ? clasificacion : null)}
      >
        {clasificacion}
      </CheckableTag>
    ))}
  </div>
);

export default MateriaClasificacionFilter;
