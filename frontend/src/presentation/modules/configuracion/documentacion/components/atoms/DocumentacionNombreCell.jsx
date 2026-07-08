/**
 * Celda Documento del listado de documentación (gemela de PagoEstudianteCell):
 * IdentidadCelda (nombre) y, debajo, el NIVEL del documento como dot + etiqueta
 * teñida (`cfg-identidad-substate`, ver table-cells.css) — el nivel no va en
 * columna propia, vive bajo el nombre:
 *   - «Documento base» (sin `documentoPadreId`, primer orden) → tono primario.
 *   - «Reemplazo» (segundo orden: reemplaza al padre si no se presenta) → tono info.
 * Tonos por token de estado, nunca rojo (el estado inactivo va aparte, atenuado).
 * Nombres largos: clamp a 2 líneas (`cfg-identidad-clamp2`, ver table-cells.css);
 * el nombre completo queda disponible en el title.
 */

import IdentidadCelda from '@atoms/IdentidadCelda';

const DocumentacionNombreCell = ({ nombre, esBase }) => (
  <div className="cfg-identidad-clamp2" title={nombre || undefined}>
    <IdentidadCelda nombre={(nombre || 'Sin nombre').toUpperCase()} />
    <span
      className={`cfg-identidad-substate cfg-identidad-substate--${esBase ? 'primary' : 'info'}`}
    >
      <span className="cfg-identidad-substate__dot" aria-hidden />
      {esBase ? 'Documento base' : 'Reemplazo'}
    </span>
  </div>
);

export default DocumentacionNombreCell;
