/**
 * Celda Estudiante de la planilla de cuentas por cobrar: IdentidadCelda con el
 * Nº de carnet arriba y el nombre completo abajo. En la planilla oficial el
 * ESTADO de cobranza vive en su propia columna (dot de color), no bajo el
 * nombre, por lo que esta celda solo presenta la identidad.
 *
 * El nombre llega ya formateado por el backend (orden APELLIDOS NOMBRES,
 * incos-ui-system §4b); no se reordena aquí.
 */

import IdentidadCelda from '@atoms/IdentidadCelda';

const CobranzaEstudianteCell = ({ carnet, nombreCompleto }) => (
  <IdentidadCelda codigo={carnet || null} nombre={nombreCompleto || '—'} />
);

export default CobranzaEstudianteCell;
