/**
 * Calendario mensual del bimestre (organismo).
 *
 * Pinta los días del rango agrupados por mes y semana (lun→dom). Por día:
 *  - DOT cuando ya se tomó asistencia (`tieneAsistencia`).
 *  - resalta los días de clase (`esDiaClase`).
 *  - neutros (feriado / clase no dictada) en tono apagado.
 *  - futuros deshabilitados (`esFuturo`), no navegables.
 * Click en un día de clase pasado → arma esa semana en la planilla (`onElegirDia`).
 */
import { useMemo } from 'react';
import { Tooltip } from 'antd';
import {
  etiquetaDiaMes,
  numeroDia,
} from '@application-academico/asistencia/utils/asistenciaFechas.js';

const NOMBRE_MES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const CABECERA_DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const partes = (iso) => String(iso).split('-').map(Number);

/** offset de columna lun=0 … dom=6 para alinear la primera fila de cada mes. */
const offsetLunes = (iso) => {
  const [y, m, d] = partes(iso);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow === 0 ? 6 : dow - 1;
};

/** Agrupa los días del rango por mes calendario, conservando el orden del backend. */
const agruparPorMes = (dias) => {
  const grupos = [];
  let actual = null;
  for (const dia of dias) {
    const [y, m] = partes(dia.fechaClase);
    const clave = `${y}-${m}`;
    if (!actual || actual.clave !== clave) {
      actual = { clave, anio: y, mes: m, dias: [] };
      grupos.push(actual);
    }
    actual.dias.push(dia);
  }
  return grupos;
};

const tituloDia = (dia) => {
  if (dia.esFuturo) return `${etiquetaDiaMes(dia.fechaClase)} · día futuro`;
  if (dia.neutro) return `${etiquetaDiaMes(dia.fechaClase)} · ${dia.motivo ?? dia.neutro}`;
  if (!dia.esDiaClase) return `${etiquetaDiaMes(dia.fechaClase)} · sin clase`;
  return dia.tieneAsistencia
    ? `${etiquetaDiaMes(dia.fechaClase)} · asistencia tomada`
    : `${etiquetaDiaMes(dia.fechaClase)} · tomar asistencia`;
};

const DiaCelda = ({ dia, onElegirDia }) => {
  const navegable = dia.esDiaClase && !dia.esFuturo && !dia.neutro;
  const className = [
    'asi-cal__dia',
    dia.esDiaClase ? 'asi-cal__dia--clase' : 'asi-cal__dia--no-clase',
    dia.neutro ? 'asi-cal__dia--neutro' : '',
    dia.esFuturo ? 'asi-cal__dia--futuro' : '',
    dia.esSesionEspecial ? 'asi-cal__dia--especial' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const contenido = (
    <>
      <span className="asi-cal__dia-num">{numeroDia(dia.fechaClase)}</span>
      {dia.tieneAsistencia ? <span className="asi-cal__dot" aria-hidden /> : null}
    </>
  );

  if (!navegable) {
    return (
      <Tooltip title={tituloDia(dia)}>
        <span className={className} aria-disabled={dia.esFuturo || undefined}>
          {contenido}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tituloDia(dia)}>
      <button
        type="button"
        className={`${className} asi-cal__dia--navegable`}
        onClick={() => onElegirDia(dia.fechaClase)}
        aria-label={tituloDia(dia)}
      >
        {contenido}
      </button>
    </Tooltip>
  );
};

const MesBloque = ({ grupo, onElegirDia }) => {
  // Relleno de la primera semana para alinear el día 1 bajo su columna (lun→dom).
  const huecos = grupo.dias.length > 0 ? offsetLunes(grupo.dias[0].fechaClase) : 0;
  return (
    <div className="asi-cal__mes">
      <h4 className="asi-cal__mes-titulo">
        {NOMBRE_MES[grupo.mes - 1]} {grupo.anio}
      </h4>
      <div className="asi-cal__grid">
        {CABECERA_DOW.map((d, i) => (
          <span key={`dow-${i}`} className="asi-cal__dow">
            {d}
          </span>
        ))}
        {Array.from({ length: huecos }).map((_, i) => (
          <span key={`hueco-${i}`} className="asi-cal__hueco" aria-hidden />
        ))}
        {grupo.dias.map((dia) => (
          <DiaCelda key={dia.fechaClase} dia={dia} onElegirDia={onElegirDia} />
        ))}
      </div>
    </div>
  );
};

const CalendarioMensualAsistencia = ({ dias = [], onElegirDia }) => {
  const grupos = useMemo(() => agruparPorMes(dias), [dias]);

  return (
    <div className="asi-cal">
      <div className="asi-cal__meses">
        {grupos.map((grupo) => (
          <MesBloque key={grupo.clave} grupo={grupo} onElegirDia={onElegirDia} />
        ))}
      </div>
      <ul className="asi-cal__leyenda" aria-label="Referencias del calendario">
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--tomado">
            <span className="asi-cal__dot" aria-hidden />
          </span>
          Asistencia tomada
        </li>
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--clase" />
          Día de clase
        </li>
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--neutro" />
          Feriado / sin clase
        </li>
        <li className="asi-cal__leyenda-item">
          <span className="asi-cal__chip asi-cal__chip--futuro" />
          Futuro
        </li>
      </ul>
    </div>
  );
};

export default CalendarioMensualAsistencia;
