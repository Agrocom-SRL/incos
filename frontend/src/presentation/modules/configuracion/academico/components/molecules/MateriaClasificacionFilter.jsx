/**
 * Molécula: filtro por clasificación del catálogo de materias del builder de
 * periodo (`PlanPeriodoAsignaturasPage.jsx`). Mismo estilo que el select de
 * etapas del cronograma (`CronogramaActividadFormSections`): label arriba y
 * Select con borde cuyas opciones llevan un punto de color por clasificación.
 * Siempre hay UNA clasificación seleccionada (sin opción «Todas»).
 */

import { Select } from 'antd';
import { getClasificacionColor } from '@application-configuracion/academico/config/clasificacionColors';

const ClasificacionOption = ({ nombre }) => (
  <span className="cfg-plan-builder__clasif-option">
    <span
      className="cfg-plan-builder__clasif-option-swatch"
      style={{ backgroundColor: getClasificacionColor(nombre) }}
      aria-hidden
    />
    {nombre}
  </span>
);

const MateriaClasificacionFilter = ({ clasificaciones = [], value, onChange }) => (
  <Select
    value={value ?? undefined}
    onChange={onChange}
    className="cfg-plan-builder__filtro-select"
    aria-label="Filtrar catálogo por clasificación"
    options={clasificaciones.map((c) => ({ value: c, label: c }))}
    optionRender={(option) => <ClasificacionOption nombre={option.data.label} />}
    labelRender={(props) => <ClasificacionOption nombre={props.label} />}
  />
);

export default MateriaClasificacionFilter;
