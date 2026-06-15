import { ParaleloGestionContextHeader } from '@molecules';
import { mapParaleloGestionContextModel } from '@application-institucional/common/utils/mapParaleloGestionContextModel';

const OFERTA_HINT =
    'Vincule docentes por materia en la tabla. Para ofertar el paralelo se requiere aula y oferta completa del periodo; docentes y bloques horarios pueden completarse después.';

const OfertaParaleloDetalleContextHeader = ({ detalle, puedeEditarAula, onAsignarAula }) => (
    <ParaleloGestionContextHeader
        detalle={mapParaleloGestionContextModel(detalle)}
        variant="oferta"
        titleLevel={4}
        hint={OFERTA_HINT}
        puedeEditarAula={puedeEditarAula}
        onAsignarAula={onAsignarAula}
    />
);

export default OfertaParaleloDetalleContextHeader;
