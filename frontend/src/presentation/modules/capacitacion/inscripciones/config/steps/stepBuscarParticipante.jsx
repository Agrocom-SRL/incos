/**
 * stepBuscarParticipante - Campos del paso «Participante» (modo existente) de
 * Inscribir participante (CAP). Gemelo de `step1BuscarEstudiante` (Matrícula):
 * input de búsqueda a ancho completo + lista de filas.
 *
 * Sin Alerts fijos: las instrucciones viven en la descripción de la sección y
 * en el placeholder; el estado inicial muestra las sugerencias (participantes
 * sin inscripción vigente) y el estado vacío es el `emptyMessage` de la lista
 * (lo enriquece `enrichBuscarParticipanteFields`).
 *
 * Estados de una fila (los pinta `buscar-estudiante.css` + `list-item.css`):
 * - elegible       → seleccionable; pista «Seleccionar» al pasar el puntero
 * - ya inscrito    → pill de aviso (sigue siendo elegible: puede cursar otro curso)
 * - nuevo          → pill informativa (sin inscripción vigente, solo en búsqueda)
 * - seleccionado   → fondo primario suave + check
 */

import {
  CheckCircleFilled,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Flex } from 'antd';
import { Avatar, StatusPill, Text } from '@atoms';
import { buildInitials } from '@application/utils/formatters';
import {
  CAMPO_BUSCAR_PARTICIPANTE,
  CAMPO_RESULTADOS_PARTICIPANTES,
} from '@application-capacitacion/inscripciones/utils/enrichBuscarParticipanteFields';
import '@matricula/registro/styles/buscar-estudiante.css';

/** Línea de metadatos del participante (CI, celular, correo, curso vigente). */
const metaLine = (key, icon, contenido) => (
  <span className="mat-buscar-est__meta-item" key={key}>
    {icon}
    <Text type="secondary">{contenido}</Text>
  </span>
);

/** Etiqueta de estado del participante dentro de la lista de resultados. */
const buildEstadoPill = (participante) => {
  if (participante.yaInscrito) {
    return (
      <StatusPill label="Ya inscrito" className="cfg-materia-pill cfg-materia-pill--warning" />
    );
  }
  if (participante.destacarNuevo === true) {
    return <StatusPill label="Nuevo" className="cfg-materia-pill cfg-materia-pill--info" />;
  }
  return null;
};

const BUSCAR_PARTICIPANTE_FIELDS = [
  {
    // Es una HERRAMIENTA de búsqueda, no un dato de la inscripción: no lleva
    // `required`. El requisito real del paso (participante elegido) lo valida
    // `onValidateBeforeNext` del hook.
    name: CAMPO_BUSCAR_PARTICIPANTE,
    type: 'search',
    label: 'Buscar participante',
    placeholder: 'Busque por CI, nombre o celular (mín. 2 caracteres)',
    required: false,
    span: 24,
    allowClear: true,
  },
  {
    name: CAMPO_RESULTADOS_PARTICIPANTES,
    type: 'list',
    label: '',
    span: 24,
    required: false,
    className: 'data-list--scroll',
    emptyMessage:
      'No se encontraron participantes con esos datos. Use «Crear nuevo participante» para registrarlo.',
    renderItem: (participante) => {
      const nombre = participante.nombreCompleto || 'Sin nombre';

      return {
        avatar: (
          <Avatar className="mat-buscar-est__avatar" size="large">
            {buildInitials(nombre, '—')}
          </Avatar>
        ),
        title: (
          <Flex align="center" gap="small" wrap>
            <span className="mat-buscar-est__nombre">{nombre}</span>
            {buildEstadoPill(participante)}
          </Flex>
        ),
        caption: (
          <span className="mat-buscar-est__meta">
            {participante.ciCompleto
              ? metaLine('ci', <IdcardOutlined />, `C.I. ${participante.ciCompleto}`)
              : null}
            {participante.celular
              ? metaLine('celular', <PhoneOutlined />, participante.celular)
              : null}
            {participante.email ? metaLine('email', <MailOutlined />, participante.email) : null}
            {participante.cursoActualTitulo
              ? metaLine('curso', <ReadOutlined />, `Curso actual: ${participante.cursoActualTitulo}`)
              : null}
          </span>
        ),
        extra: (
          <>
            <CheckCircleFilled className="mat-buscar-est__check" />
            <Text type="secondary" className="mat-buscar-est__hint">
              Seleccionar
            </Text>
          </>
        ),
      };
    },
  },
];

/** Campos del paso: Buscar participante (modo existente). */
export const getStepBuscarParticipanteFields = () => BUSCAR_PARTICIPANTE_FIELDS;
