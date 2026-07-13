/**
 * Molécula: fila de UNA asignatura del borrador del periodo (builder).
 * Lenguaje de planilla del cuaderno de calificaciones: celda de identidad con
 * acento primario (sigla + nombre), celda de horas (`PlanHorasCell`) y quitar
 * discreto (texto danger, no botón sólido — la planilla no grita en cada fila).
 * Solo muta el borrador (nada persiste hasta «Guardar cambios»); quitar una
 * fila del servidor exige permiso ELIMINAR, una fila nueva basta con CREAR.
 */

import { Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import PlanHorasCell from '../atoms/PlanHorasCell';

const PlanPeriodoAsignaturaRow = ({
  fila,
  horasDisponibles,
  puedeEditar,
  puedeEliminar,
  onCambiarHoras,
  onQuitar,
}) => {
  const mostrarQuitar = fila.asignaturaId ? puedeEliminar : puedeEditar;

  return (
    <div className="cfg-plan-builder__row">
      <div className="cfg-plan-builder-chip cfg-plan-builder-chip--asignatura">
        <span className="cfg-plan-builder-chip__sigla">{fila.sigla || '—'}</span>
        <span className="cfg-plan-builder-chip__nombre">{fila.nombre}</span>
      </div>
      <PlanHorasCell
        value={fila.horas}
        max={Math.max(1, (Number(fila.horas) || 0) + horasDisponibles)}
        disabled={!puedeEditar}
        onChange={(valor) => onCambiarHoras(fila.key, valor)}
        ariaLabel={`Horas semanales de ${fila.nombre}`}
      />
      {mostrarQuitar ? (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => onQuitar(fila.key)}
          aria-label={`Quitar ${fila.nombre} del periodo`}
        />
      ) : null}
    </div>
  );
};

export default PlanPeriodoAsignaturaRow;
