/**
 * Barra de validación de suma porcentual (cuota o bimestres).
 */

const PoliticaSumaHint = ({ suma, objetivo = 100, etiquetaOk, etiquetaWarn }) => {
  const ok = Math.abs(suma - objetivo) <= 0.01;
  const texto = ok
    ? etiquetaOk
    : etiquetaWarn.replace('{suma}', String(Math.round(suma * 100) / 100));

  return (
    <div
      className={`cal-politica__hint cal-politica__hint--${ok ? 'ok-full' : 'warn'}`}
      role="status"
    >
      {texto}
    </div>
  );
};

export default PoliticaSumaHint;
