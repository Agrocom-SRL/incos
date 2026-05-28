/**
 * @deprecated Usar IdentidadCelda de @atoms.
 */
import IdentidadCelda from '@atoms/IdentidadCelda';

const MateriaIdentidadCell = ({ sigla, nombre }) => (
  <IdentidadCelda codigo={sigla} nombre={nombre} />
);

export default MateriaIdentidadCell;
