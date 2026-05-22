/**
 * Cabecera rica del curso — avatar, metadata y acciones (Registro académico / Cuaderno).
 */

import CursoProfileHeader from './CursoProfileHeader.jsx';
import { buildCursoProfileStats } from '../utils/buildCursoProfileStats.js';

const CursoHeaderCard = ({
  curso,
  docente,
  bimestreActual,
  estudiantesCount,
  onConfiguracion,
  configuracionDisabled = false,
  acciones = null,
}) => {
  const pill = bimestreActual != null ? `Bimestre ${bimestreActual}` : null;
  const stats = buildCursoProfileStats(docente, curso, estudiantesCount);

  return (
    <CursoProfileHeader
      materia={curso?.materia}
      sigla={curso?.materiaSigla}
      subtitulo={curso?.carrera ?? ''}
      carreraColor={curso?.carreraColor ?? '#196b45'}
      stats={stats}
      pill={pill}
      onAjustes={onConfiguracion}
      ajustesDisabled={configuracionDisabled}
      acciones={acciones}
    />
  );
};

export default CursoHeaderCard;
