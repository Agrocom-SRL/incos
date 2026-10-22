/**
 * Registrar pago de una inscripción de capacitación (CAP · pago CREAR).
 *
 * Página "dumb": la orquestación vive en `useInscripcionCapRegistrarPagoPage`; el
 * formulario es la vista compartida `InscripcionCapPagoFormView`.
 */

import { useInscripcionCapRegistrarPagoPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapRegistrarPagoPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import InscripcionCapPagoFormView from '@capacitacion/inscripciones/components/organisms/InscripcionCapPagoFormView';

const CONFIG = {
  permiso: CAPACITACION_PERMISOS.pago,
  accion: 'CREAR',
  submitLabel: 'Registrar pago',
  descripcion:
    'Elija el concepto, el monto, la fecha y el método de pago. El comprobante de depósito es opcional. La cuenta de pago se habilita según el método elegido.',
};

const InscripcionCapRegistrarPagoPage = () => (
  <InscripcionCapPagoFormView state={useInscripcionCapRegistrarPagoPage()} config={CONFIG} />
);

export default InscripcionCapRegistrarPagoPage;
