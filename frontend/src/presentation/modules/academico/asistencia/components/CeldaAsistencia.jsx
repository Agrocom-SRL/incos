/**
 * Celda de marca de asistencia (átomo, gemelo de NotaCell).
 *
 * Muestra la marca derivada P/R/F/L. Editable solo si la columna es día de clase,
 * no neutro, no futuro y el registro no está cerrado. El click cicla el estado vía
 * `onToggle` (lógica de ciclo en el state hook). Días neutros/futuros: solo lectura.
 */
import { memo } from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FieldTimeOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import {
  marcaDeEstado,
  MARCA,
} from '@application-academico/asistencia/utils/asistenciaMarcas.js';

/** Etiqueta accesible por marca. */
const ARIA_MARCA = {
  [MARCA.PRESENTE]: 'Presente',
  [MARCA.TARDANZA]: 'Atraso',
  [MARCA.AUSENTE]: 'Ausente',
  [MARCA.LICENCIA]: 'Licencia',
};

/** Texto literal bajo el icono (el docente pide ver de forma escrita lo que marca). */
const TEXTO_MARCA = {
  [MARCA.PRESENTE]: 'Presente',
  [MARCA.TARDANZA]: 'Atraso',
  [MARCA.AUSENTE]: 'Ausente',
  [MARCA.LICENCIA]: 'Licencia',
};

/** Contenido visible de la celda: icono/glifo + rótulo literal debajo, mismo color. */
const ContenidoCelda = ({ marca }) => (
  <>
    <span className="asi-celda__marca">{glifoMarca(marca)}</span>
    <span className="asi-celda__label">{TEXTO_MARCA[marca]}</span>
  </>
);

/**
 * Glifo visible por marca: los MISMOS iconos que los KPIs del resumen
 * (ResumenAsistenciaSidebar · KPI_DEFS), para que celda y resumen hablen el mismo lenguaje:
 *  - Presente  → CheckCircleOutlined (verde primario).
 *  - Ausente   → CloseCircleOutlined (rojo).
 *  - Atraso    → FieldTimeOutlined (ámbar).
 *  - Licencia  → SolutionOutlined (info).
 */
const glifoMarca = (marca) => {
  if (marca === MARCA.PRESENTE) return <CheckCircleOutlined aria-hidden />;
  if (marca === MARCA.AUSENTE) return <CloseCircleOutlined aria-hidden />;
  if (marca === MARCA.TARDANZA) return <FieldTimeOutlined aria-hidden />;
  if (marca === MARCA.LICENCIA) return <SolutionOutlined aria-hidden />;
  return marca;
};

const CeldaAsistencia = ({
  estado,
  neutro,
  editable,
  futuro,
  onToggle,
  estudianteNombre,
  fecha,
}) => {
  const marca = marcaDeEstado(estado, neutro);
  const esFalta = marca === MARCA.AUSENTE;
  const esAtraso = marca === MARCA.TARDANZA;
  const esLicencia = marca === MARCA.LICENCIA;

  // Días futuros: columna gris, no clickeable.
  if (futuro) {
    return (
      <span
        className="asi-celda asi-celda--futuro"
        aria-label="Día futuro, sin tomar"
      >
        <span className="asi-celda__marca">·</span>
      </span>
    );
  }

  // Neutro (feriado / clase no dictada / licencia): solo lectura.
  if (neutro) {
    return (
      <span
        className={`asi-celda asi-celda--neutro${esLicencia ? ' asi-celda--licencia' : ''}`}
        aria-label={
          esLicencia ? `Licencia de ${estudianteNombre}` : 'Día sin clase'
        }
      >
        {esLicencia ? (
          <ContenidoCelda marca={MARCA.LICENCIA} />
        ) : (
          <span className="asi-celda__marca">—</span>
        )}
      </span>
    );
  }

  const className = [
    'asi-celda',
    editable ? 'asi-celda--editable' : 'asi-celda--readonly',
    esFalta ? 'asi-celda--falta' : '',
    esAtraso ? 'asi-celda--atraso' : '',
    !esFalta && !esAtraso ? 'asi-celda--presente' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = `${ARIA_MARCA[marca]} · ${estudianteNombre} · ${fecha}`;

  if (!editable) {
    return (
      <span className={className} aria-label={label}>
        <ContenidoCelda marca={marca} />
      </span>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onToggle}
      aria-label={`${label}. Toque para cambiar`}
    >
      <ContenidoCelda marca={marca} />
    </button>
  );
};

export default memo(CeldaAsistencia);
