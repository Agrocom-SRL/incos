/**
 * Pie del cuaderno: cambios locales hasta Guardar notas.
 */

import { CloudOutlined, LoadingOutlined } from '@ant-design/icons';
import { useCuadernoFooterState } from '@application-academico/calificaciones/context/CuadernoAutosaveContext.jsx';

const CuadernoFooter = () => {
  const footerState = useCuadernoFooterState();

  let mensajeIzq = null;
  let icono = <CloudOutlined className="cal-cuaderno-footer__icon" aria-hidden />;
  let claseGuardado = 'cal-cuaderno-footer__guardado';

  if (footerState.tipo === 'guardando') {
    icono = <LoadingOutlined className="cal-cuaderno-footer__icon" spin aria-hidden />;
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--activo';
    mensajeIzq = (
      <>
        {icono}
        Guardando notas…
      </>
    );
  } else if (footerState.tipo === 'pendiente') {
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--pendiente';
    mensajeIzq = (
      <>
        {icono}
        {footerState.cantidad} cambio{footerState.cantidad > 1 ? 's' : ''} sin guardar — usá Guardar
        notas
      </>
    );
  } else if (footerState.tipo === 'guardado') {
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--activo';
    mensajeIzq = (
      <>
        {icono}
        Notas guardadas · hace {footerState.haceSeg} seg
      </>
    );
  } else {
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--neutro';
    mensajeIzq = (
      <>
        {icono}
        Sin cambios pendientes
      </>
    );
  }

  return (
    <footer className="cal-cuaderno-footer">
      <span className={claseGuardado}>{mensajeIzq}</span>
      <span className="cal-cuaderno-footer__nota">
        El cierre del bimestre lo realiza Coordinación Académica
      </span>
    </footer>
  );
};

export default CuadernoFooter;
