/**
 * Tabla del transcript de Historial académico.
 *
 * Reusa el molécula `DataTable` con el KIT DE PLANILLA académico (cabecera en
 * verde primario con texto blanco, mismo lenguaje que calificaciones/asistencia/
 * centralizador, vía la clase `historial-transcript-grid` de historial.css). Es
 * un documento: sin paginación, con scroll horizontal si hace falta. Las filas
 * de materias REPROBADAS se tiñen con el token de error (el historial evidencia
 * las reprobadas, no solo la nota).
 *
 * Recibe las filas ya ordenadas (gestión → periodo → nro del plan) desde el
 * hook. Solo lectura.
 */

import { DataTable } from '@molecules';
import { historialColumns } from '../config/historialColumns.jsx';

/** Clave estable de fila: nro del backend o combinación gestión+sigla+periodo. */
const rowKey = (record) =>
  record.nro ??
  `${record.gestionAnio ?? ''}-${record.asignaturaSigla ?? ''}-${record.periodoNumero ?? ''}`;

/** Tinte de fila para materias reprobadas (clase con token de error). */
const rowClassName = (record) =>
  String(record?.estado || '').toUpperCase().includes('REPROB')
    ? 'historial-transcript-grid__row--reprobado'
    : '';

const HistorialTranscriptTable = ({ filas }) => (
  <DataTable
    className="historial-transcript-grid"
    dataSource={filas}
    columns={historialColumns}
    rowKey={rowKey}
    rowClassName={rowClassName}
    pagination={false}
    bordered
    size="small"
    scroll={{ x: 'max-content' }}
  />
);

export default HistorialTranscriptTable;
