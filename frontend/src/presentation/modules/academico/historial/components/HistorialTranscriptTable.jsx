/**
 * Tabla del transcript de Historial académico.
 *
 * Reusa el molécula `DataTable` con el look de planilla académica (cabecera verde
 * de marca vía la clase `historial-transcript-grid`, definida en historial.css con
 * tokens). Es un documento: sin paginación, con scroll horizontal si hace falta.
 *
 * Recibe las filas ya ordenadas (gestión → periodo → sigla) desde el hook. Solo
 * lectura.
 */

import { DataTable } from '@molecules';
import { historialColumns } from '../config/historialColumns.jsx';

/** Clave estable de fila: nro del backend o combinación gestión+sigla+periodo. */
const rowKey = (record) =>
  record.nro ??
  `${record.gestionAnio ?? ''}-${record.asignaturaSigla ?? ''}-${record.periodoNumero ?? ''}`;

const HistorialTranscriptTable = ({ filas }) => (
  <DataTable
    className="historial-transcript-grid"
    dataSource={filas}
    columns={historialColumns}
    rowKey={rowKey}
    pagination={false}
    bordered
    size="small"
    scroll={{ x: 'max-content' }}
  />
);

export default HistorialTranscriptTable;
