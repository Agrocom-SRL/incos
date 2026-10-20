/**
 * CompromisoPlazoSelector - Molecule para elegir el plazo del compromiso de pago
 *
 * Single Responsibility: Selección del plazo (en días) en que el estudiante se
 * compromete a cancelar el saldo restante, como tarjetas en grilla responsive.
 *
 * Atomic Design: Molecule
 * - Promovida desde el antiguo CompromisoPagoModal: el plazo ahora se elige
 *   inline en el paso de Confirmación del wizard, no en un modal sorpresa.
 * - Estilos en styles/components/organisms/pagos-registrar.css (.compromiso-*).
 *
 * @param {Array<{value:number,label:string,sub:string}>} opciones - Plazos permitidos
 * @param {number} value - Plazo elegido (controlado por el padre)
 * @param {Function} onChange - Callback al elegir un plazo
 */

const CompromisoPlazoSelector = ({ opciones = [], value, onChange }) => (
  <div className="compromiso-plazos">
    {opciones.map((opcion) => {
      const activo = opcion.value === value;
      return (
        <button
          key={opcion.value}
          type="button"
          onClick={() => onChange?.(opcion.value)}
          aria-pressed={activo}
          className={`compromiso-plazo${activo ? ' compromiso-plazo--active' : ''}`}
        >
          <div className="compromiso-plazo__dias">{opcion.label}</div>
          <div className="compromiso-plazo__sub">{opcion.sub}</div>
        </button>
      );
    })}
  </div>
);

export default CompromisoPlazoSelector;
