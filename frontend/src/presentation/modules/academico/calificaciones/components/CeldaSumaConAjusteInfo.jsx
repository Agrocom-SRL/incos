/**
 * Celda de suma bimestral (solo lectura).
 */

const CeldaSumaConAjusteInfo = ({ suma, className = '' }) => {
  const valor = suma != null ? suma : '—';

  return (
    <span className={['cal-celda-ajuste-info', className].filter(Boolean).join(' ')}>
      <span className="cal-celda-ajuste-info__valor">{valor}</span>
    </span>
  );
};

export default CeldaSumaConAjusteInfo;
