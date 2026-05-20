/**
 * Pie del cuaderno: estado agregado de auto-guardado.
 */

import { Button } from 'antd';
import { CloudOutlined, LoadingOutlined, WarningOutlined } from '@ant-design/icons';
import { useCuadernoFooterState } from '@application-academico/calificaciones/context/CuadernoAutosaveContext.jsx';

const CuadernoFooter = () => {
  const footerState = useCuadernoFooterState();

  let mensajeIzq = null;
  let icono = <CloudOutlined className="cal-cuaderno-footer__icon" aria-hidden />;
  let claseGuardado = 'cal-cuaderno-footer__guardado';

  if (footerState.tipo === 'error') {
    icono = <WarningOutlined className="cal-cuaderno-footer__icon cal-cuaderno-footer__icon--error" aria-hidden />;
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--error';
    mensajeIzq = (
      <>
        {icono}
        Error al guardar {footerState.cantidad} nota{footerState.cantidad > 1 ? 's' : ''}. Revisar.
        <Button type="link" size="small" onClick={footerState.reintentarTodas}>
          Reintentar todas
        </Button>
      </>
    );
  } else if (footerState.tipo === 'guardando') {
    icono = <LoadingOutlined className="cal-cuaderno-footer__icon" spin aria-hidden />;
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--activo';
    mensajeIzq = (
      <>
        {icono}
        Guardando cambios…
      </>
    );
  } else if (footerState.tipo === 'guardado') {
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--activo';
    mensajeIzq = (
      <>
        {icono}
        Guardado automático · hace {footerState.haceSeg} seg
      </>
    );
  } else {
    claseGuardado = 'cal-cuaderno-footer__guardado cal-cuaderno-footer__guardado--neutro';
    mensajeIzq = (
      <>
        {icono}
        Sin cambios sin guardar
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
