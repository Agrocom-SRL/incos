/**
 * Editar pago de una inscripción de capacitación (CAP · inscripcion EDITAR).
 *
 * Página "dumb": la orquestación vive en `useInscripcionCapEditarPagoPage`; el
 * formulario es la vista compartida `InscripcionCapPagoFormView` (precargado con el pago).
 */

import { useInscripcionCapEditarPagoPage } from '@application-capacitacion/inscripciones/hooks/state/useInscripcionCapEditarPagoPage';
import { CAPACITACION_PERMISOS } from '@application-capacitacion/utils/capacitacionPermisos';
import InscripcionCapPagoFormView from '@capacitacion/inscripciones/components/organisms/InscripcionCapPagoFormView';

const CONFIG = {
  permiso: CAPACITACION_PERMISOS.inscripcion,
  accion: 'EDITAR',
  submitLabel: 'Guardar cambios',
  descripcion:
    'Corrija el concepto, el monto, la fecha o el método de pago. Para adjuntar o reemplazar el comprobante de depósito, elija un archivo. Solo se guarda lo que cambió.',
};

const InscripcionCapEditarPagoPage = () => (
  <InscripcionCapPagoFormView state={useInscripcionCapEditarPagoPage()} config={CONFIG} />
);

export default InscripcionCapEditarPagoPage;
