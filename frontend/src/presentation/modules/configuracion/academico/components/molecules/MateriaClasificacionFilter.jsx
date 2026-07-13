/**
 * Molécula: filtro por clasificación del catálogo de materias del builder de
 * periodo (`PlanPeriodoAsignaturasPage.jsx`). Mismo lenguaje que los campos de
 * formulario del módulo (label arriba + Select de ancho completo, ver
 * `CarreraFormPage`/`Nueva actividad`): limpiar el Select vuelve a «Todas».
 */

import { Select } from 'antd';

const MateriaClasificacionFilter = ({ clasificaciones = [], value, onChange }) => (
  <div className="cfg-plan-builder__filtro">
    <span className="cfg-plan-builder__filtro-label" id="cfg-plan-builder-filtro-label">
      Clasificación
    </span>
    <Select
      allowClear
      placeholder="Todas"
      value={value ?? undefined}
      onChange={(v) => onChange(v ?? null)}
      className="cfg-plan-builder__filtro-select"
      aria-labelledby="cfg-plan-builder-filtro-label"
      options={clasificaciones.map((c) => ({ value: c, label: c }))}
    />
  </div>
);

export default MateriaClasificacionFilter;
