/**
 * Celda del plan semanal en resolución de conflictos (delega en ParaleloPlanSemanaCell con resaltado).
 */

import ParaleloPlanSemanaCell, { DRAG_MIME } from './ParaleloPlanSemanaCell';

export { DRAG_MIME };

const ConflictosPlanSemanaCell = (props) => <ParaleloPlanSemanaCell {...props} resaltarConflictos />;

export default ConflictosPlanSemanaCell;
