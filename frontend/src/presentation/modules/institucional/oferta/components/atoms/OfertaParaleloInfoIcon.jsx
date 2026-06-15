const ICON_VARIANT_CLASS = {
  aula: 'opc-info-icon--aula',
  docente: 'opc-info-icon--docente',
  horario: 'opc-info-icon--horario',
  pend: 'opc-info-icon--pend',
};

const OfertaParaleloInfoIcon = ({ icon, variant = 'pend' }) => (
  <span className={`opc-info-icon ${ICON_VARIANT_CLASS[variant] ?? ICON_VARIANT_CLASS.pend}`} aria-hidden>
    {icon}
  </span>
);

export default OfertaParaleloInfoIcon;
