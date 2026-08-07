/**
 * P3 del Centralizador — cabecera con el lenguaje visual del folio físico.
 *
 * Reproduce la banda de título + metadatos de `FolioPreviewPage.jsx`
 * (`libros.css`, clases `folio-sheet`/`folio-sheet__band`/`folio-sheet__meta*`):
 * mismo documento oficial ("CENTRALIZADOR DE CALIFICACIONES"), aquí acotado al
 * bimestre activo. Antepuesta a `CentralizadorGrid.jsx`, que sigue siendo la
 * tabla interactiva (esta cabecera NO reemplaza ni envuelve la tabla).
 *
 * `LIBRO_DOC` se reutiliza tal cual desde el módulo Libros de registro
 * (cross-import puntual, mismo documento físico — evita duplicar los
 * metadatos institucionales en dos archivos).
 */

import { LIBRO_DOC } from '@application-academico/libros/utils/libroDoc.js';
import { nombreBimestre } from '@application-academico/centralizador/utils/centralizadorDoc.js';
import '@presentation/modules/academico/libros/styles/libros.css';

/** Etiqueta del rango de folio, mismo criterio que `CentralizadorLibroBadge`. */
const rangoFolio = (libro) => {
  if (libro?.folioDesde == null || libro?.folioHasta == null) return '—';
  return libro.folioDesde === libro.folioHasta
    ? `Folio ${libro.folioDesde}`
    : `Folio ${libro.folioDesde}–${libro.folioHasta}`;
};

/**
 * @param {Object} props
 * @param {Object} props.paralelo paralelo normalizado (carreraNombre, periodoNombre, paraleloNombre, turno)
 * @param {number|null} [props.gestionAnio]
 * @param {string|null} [props.gestionNombre]
 * @param {number|null} props.bimestre bimestre activo (1..4)
 * @param {{numeroLibro:number,codigoRegistro:string,folioDesde:number,folioHasta:number}|null} [props.libro]
 */
const CentralizadorFolioCabecera = ({
  paralelo,
  gestionAnio = null,
  gestionNombre = null,
  bimestre,
  libro = null,
}) => {
  const p = paralelo ?? {};
  const gestionLabel = gestionAnio != null ? String(gestionAnio) : (gestionNombre ?? '—');
  const cursoParalelo = [p.periodoNombre, p.paraleloNombre ? `Paralelo ${p.paraleloNombre}` : null]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="folio-sheet" aria-label="Cabecera del documento oficial">
      <div className="folio-sheet__band">
        {LIBRO_DOC.titulo} — {nombreBimestre(bimestre)}
      </div>

      <div className="folio-sheet__meta">
        <div className="folio-sheet__meta-col">
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">Código de registro</span>
            <span className="folio-sheet__meta-value">{libro?.codigoRegistro || '—'}</span>
          </div>
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">Libro N°</span>
            <span className="folio-sheet__meta-value">{libro?.numeroLibro ?? '—'}</span>
          </div>
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">Folio</span>
            <span className="folio-sheet__meta-value">{rangoFolio(libro)}</span>
          </div>
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">Turno</span>
            <span className="folio-sheet__meta-value">{p.turno || '—'}</span>
          </div>
        </div>
        <div className="folio-sheet__meta-col">
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">Institución</span>
            <span className="folio-sheet__meta-value">{LIBRO_DOC.institucion}</span>
          </div>
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">R.M.</span>
            <span className="folio-sheet__meta-value">
              {LIBRO_DOC.resolucionMinisterial} · {LIBRO_DOC.caracter}
            </span>
          </div>
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">Gestión</span>
            <span className="folio-sheet__meta-value">{gestionLabel}</span>
          </div>
          <div className="folio-sheet__meta-row">
            <span className="folio-sheet__meta-label">Carrera</span>
            <span className="folio-sheet__meta-value">
              {p.carreraNombre || '—'} · {LIBRO_DOC.nivel} · {LIBRO_DOC.regimen}
            </span>
          </div>
        </div>
      </div>

      {cursoParalelo ? <div className="folio-sheet__curso">{cursoParalelo}</div> : null}
    </article>
  );
};

export default CentralizadorFolioCabecera;
