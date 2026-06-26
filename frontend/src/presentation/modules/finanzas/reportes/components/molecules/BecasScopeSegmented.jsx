/**
 * Molécula: selector de SCOPE/NIVEL compartido por las dos cards de gráficos de
 * becas (Distribución por tipo · Cobertura por nivel). Encapsula el `Segmented`
 * con un lenguaje homogéneo —tamaño grande, una opción por ícono, pastilla activa
 * en verde primario del kit y press feedback sutil— para que ambas cards lean
 * idéntico sin duplicar estilos.
 *
 * Va a TODO el ancho (`block`) como un header limpio bajo el título de la card:
 * reparte las opciones por igual y, en pantallas chicas, el wrapper permite
 * scroll horizontal suave en vez de desbordarse (CSS `.becas-scope-seg`).
 *
 * Solo presenta: las opciones (con su `icon`) y el estado los inyecta la card.
 */

import { Segmented } from 'antd';

const BecasScopeSegmented = ({ options, value, onChange, ariaLabel }) => (
  <div className="becas-scope-seg">
    <Segmented
      block
      size="large"
      options={options}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
    />
  </div>
);

export default BecasScopeSegmented;
