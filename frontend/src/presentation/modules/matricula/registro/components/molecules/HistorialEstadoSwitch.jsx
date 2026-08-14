/**
 * HistorialEstadoSwitch — estado de una fila del historial de notas.
 *
 * Mismo patrón que el átomo `EstadoTogglePill` de los catálogos (switch de AntD
 * + pill separada como etiqueta, sin Popconfirm): el switch encendido significa
 * «tiene nota» → APROBADO; apagado → CONVALIDADO (sin nota), que es el estado
 * por defecto de toda materia del historial.
 *
 * La pill NO es decorativa: alterna el estado igual que el switch (es el blanco
 * más grande de la celda y el operador la pulsa por instinto). Va como `button`
 * para conservar foco y teclado; el switch queda como `aria-hidden` para no
 * anunciar dos controles equivalentes al lector de pantalla.
 *
 * Estilos: theme/historial-notas.css (.historial-estado-toggle).
 */

import { Switch } from 'antd';

const HistorialEstadoSwitch = ({ aprobado = false, disabled = false, onChange, materia = null }) => {
  const sufijo = materia ? ` de ${materia}` : '';
  const etiqueta = aprobado
    ? `Marcar como convalidada la materia${sufijo}`
    : `Registrar nota${sufijo} (aprobada)`;

  const alternar = () => {
    if (disabled) return;
    onChange?.(aprobado ? 'CONVALIDADO' : 'APROBADO');
  };

  return (
    <span className="historial-estado-toggle">
      <Switch
        size="small"
        checked={aprobado}
        disabled={disabled}
        onChange={(checked) => onChange?.(checked ? 'APROBADO' : 'CONVALIDADO')}
        tabIndex={-1}
        aria-hidden
      />
      <button
        type="button"
        className={`cfg-materia-pill historial-estado-toggle__pill ${
          aprobado ? 'cfg-materia-pill--success' : 'cfg-materia-pill--warning'
        }`}
        onClick={alternar}
        disabled={disabled}
        aria-pressed={aprobado}
        aria-label={etiqueta}
      >
        {aprobado ? 'Aprobado' : 'Convalidado'}
      </button>
    </span>
  );
};

export default HistorialEstadoSwitch;
