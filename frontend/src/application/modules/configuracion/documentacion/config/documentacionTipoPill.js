/** Clase CSS del pill por tipo de documento (reutiliza variantes genéricas de cfg-materia-pill). */
export const getDocumentacionTipoPillClass = (tipo) => {
  switch (tipo) {
    case 'INSCRIPCION':
      return 'cfg-materia-pill cfg-materia-pill--primary';
    case 'LICENCIA':
      return 'cfg-materia-pill cfg-materia-pill--info';
    case 'PASANTIA':
      return 'cfg-materia-pill cfg-materia-pill--accent';
    case 'DESCUENTO':
      return 'cfg-materia-pill cfg-materia-pill--success';
    case 'TITULACION':
      return 'cfg-materia-pill cfg-materia-pill--purple';
    case 'TRASPASO':
      return 'cfg-materia-pill cfg-materia-pill--warning';
    case 'TRANSITABILIDAD':
      return 'cfg-materia-pill cfg-materia-pill--danger';
    case 'BECA':
      return 'cfg-materia-pill cfg-materia-pill--purple';
    case 'OTRO':
    default:
      return 'cfg-materia-pill cfg-materia-pill--default';
  }
};
