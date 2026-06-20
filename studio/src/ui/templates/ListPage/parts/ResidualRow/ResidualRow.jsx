/**
 * ResidualRow — fila collapse (expandible) con las columnas que NO cupieron.
 *
 * Componente genérico del template: por cada columna oculta pinta un par
 * etiqueta/valor como una FICHA DE DEFINICIÓN (label arriba, valor debajo,
 * alineados a la izquierda — patrón `DescriptionRow`). NO reusa la alineación ni
 * el floteo de las celdas de tabla: lee como ficha homogénea, no como celdas
 * sueltas a la deriva.
 *
 * Resolución del valor (contrato genérico, robusto para cualquier ListPage):
 *   1. `column.renderResidual(row)` — presentación específica de ficha (opt-in:
 *      una columna cuya celda de tabla es multilínea/escala propia la declara para
 *      mostrarse a la escala del residual). Es la vía limpia recomendada.
 *   2. `column.render(value, row)` — con el VALOR REAL resuelto desde `dataIndex`
 *      (no `undefined`): así una columna con `dataIndex` + render `(value,row)`
 *      muestra su valor, no `undefined`.
 *   3. `row[dataIndex]` — valor plano sin render.
 * El valor de texto plano queda acotado por CSS a la escala del residual
 * (`.ds-residual-row__value`); los badges/chips semánticos conservan su color.
 *
 * SRP: solo presenta las columnas residuales de UNA fila; no decide qué se oculta
 * (eso es de `useResponsiveColumns`) ni cuándo mostrarse (lo gobierna
 * `ListDataView` vía `expandable`). Respeta `useReducedMotion` en la aparición.
 *
 * Motion: usa `residualReveal` — fade SIN traslado en Y, DIFERIDO hasta que el
 * <tr> terminó de crecer, para que el revelado y el salto de altura se sientan
 * como un solo gesto (no doble salto). Gateado por `useReducedMotion`.
 *
 * @param {{ hiddenColumns: object[], row: object }} props
 */
import { motion } from 'motion/react';
import { useReducedMotion } from '@lib/motion/useReducedMotion';
import { residualReveal } from '@lib/motion/presets';
import './ResidualRow.css';

const MotionDiv = motion.div;

/** Resuelve el valor a mostrar para una columna oculta (ver JSDoc del módulo). */
function valueOf(column, row) {
  if (typeof column.renderResidual === 'function') return column.renderResidual(row);
  if (typeof column.render === 'function') {
    const value = column.dataIndex != null ? row[column.dataIndex] : undefined;
    return column.render(value, row);
  }
  if (column.dataIndex != null) return row[column.dataIndex];
  return null;
}

export function ResidualRow({ hiddenColumns, row }) {
  const reduce = useReducedMotion();
  if (!hiddenColumns?.length) return null;

  return (
    <MotionDiv
      className="ds-residual-row"
      variants={reduce ? undefined : residualReveal}
      initial={reduce ? undefined : 'hidden'}
      animate={reduce ? undefined : 'visible'}
    >
      {hiddenColumns.map((column) => (
        <div className="ds-residual-row__item" key={column.key}>
          <span className="ds-residual-row__label">{column.title}</span>
          <span className="ds-residual-row__value">{valueOf(column, row)}</span>
        </div>
      ))}
    </MotionDiv>
  );
}

export default ResidualRow;
