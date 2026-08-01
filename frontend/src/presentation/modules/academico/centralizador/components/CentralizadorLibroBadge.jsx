/**
 * Badge LIBRO/FOLIO del Centralizador anual (P2) — cruce de dominio con Libros
 * de registro (schema 25). Mismo lenguaje visual que `LibroDetailPage`
 * (`StatusPill` + `IdentidadCelda`): un pill compacto con "LIBRO N° X · FOLIO
 * Y–Z" cuando el paralelo YA tiene folios generados en el libro de la gestión.
 *
 * Si el paralelo aún NO tiene folios (`libro` es `null`), no se inventa ningún
 * valor: se muestra un texto secundario "Sin folio asignado" con un CTA
 * opcional hacia el módulo Libros de registro (gated por `academico.libro`
 * LISTAR).
 */

import { BookOutlined } from '@ant-design/icons';
import { ActionButton, StatusPill } from '@atoms';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';

/**
 * @param {Object} props
 * @param {{numeroLibro:number,codigoRegistro:string,folioDesde:number,folioHasta:number,estadoLibro:string}|null} props.libro
 * @param {() => void} [props.onAbrirLibros] navega al listado de Libros de registro
 */
const CentralizadorLibroBadge = ({ libro, onAbrirLibros }) => {
  if (libro) {
    const rangoFolio =
      libro.folioDesde != null && libro.folioHasta != null
        ? libro.folioDesde === libro.folioHasta
          ? `FOLIO ${libro.folioDesde}`
          : `FOLIO ${libro.folioDesde}–${libro.folioHasta}`
        : 'FOLIO —';
    const label =
      libro.numeroLibro != null ? `LIBRO N° ${libro.numeroLibro} · ${rangoFolio}` : rangoFolio;
    return (
      <StatusPill
        label={label}
        className="cfg-materia-pill cfg-materia-pill--success cal-centralizador-libro-pill"
      />
    );
  }

  return (
    <span className="cal-centralizador-libro-vacio">
      <BookOutlined aria-hidden />
      Sin folio asignado
      {onAbrirLibros ? (
        <ActionButton
          permiso={LIBROS_PERMISOS.libro}
          accion="LISTAR"
          type="link"
          size="small"
          onClick={onAbrirLibros}
        >
          Abrir en Libros de registro
        </ActionButton>
      ) : null}
    </span>
  );
};

export default CentralizadorLibroBadge;
