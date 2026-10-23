/**
 * InscripcionCapSeleccionResumen — ficha de cierre de «Inscribir participante»
 * (CAP). Gemela de `InscripcionSeleccionResumen` (Matrícula): recompone en UNA
 * tarjeta lo elegido en los pasos anteriores, con la misma jerarquía en
 * franjas (identidad → curso → grupo → requisitos) y las mismas clases
 * `.insc-resumen*` (styles/components/organisms/materias-planilla.css).
 *
 * Solo lectura: el payload lo arma `buildInscripcionPayload`. Se muestra en el
 * último paso del wizard, antes de «Registrar inscripción».
 *
 * Organismo del módulo: recibe la selección ya resuelta (sin hooks de fetch);
 * el cálculo vive en `inscripcionResumen.js` (capa application). El nombre del
 * participante NUEVO se lee en vivo del `Form` (`useWatch` con `preserve`, pues
 * el paso 1 ya está desmontado).
 */

import { useMemo } from 'react';
import { Form, Typography } from 'antd';
import { CheckCircleFilled, ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { FormWorkspaceSection } from '@organisms';
import { ResumenDato } from '@molecules';
import { Avatar, StatusPill } from '@atoms';
import { buildInitials, formatBs } from '@application/utils/formatters';
import {
  buildParticipanteResumen,
  resolverEstadoPagoCursoExterno,
  splitRequisitosResumen,
} from '@application-capacitacion/utils/inscripcionResumen';
import CursoCapacitacionResumen from '../molecules/CursoCapacitacionResumen';

const { Text } = Typography;

const PILL = 'cfg-materia-pill';

/** Fila de un requisito: estado a la izquierda y descripción. */
const RequisitoFila = ({ requisito, entregado }) => (
  <li className="insc-resumen__materia">
    <span className="insc-resumen__materia-estado">
      <StatusPill
        label={
          entregado ? (
            <>
              <CheckCircleFilled aria-hidden /> Entregado
            </>
          ) : (
            <>
              <ClockCircleOutlined aria-hidden /> Pendiente
            </>
          )
        }
        className={`${PILL} ${PILL}--${entregado ? 'success' : 'warning'}`}
      />
    </span>
    <span className="insc-resumen__materia-nombre">{requisito.descripcion}</span>
  </li>
);

const InscripcionCapSeleccionResumen = ({
  section = null,
  form,
  modoParticipante,
  participanteSeleccionado = null,
  curso = null,
  grupo = null,
  requisitos = [],
  requisitosEntregados = [],
  ofrecePago = false,
  registrarPagoInicial = false,
  conceptoOptions = [],
}) => {
  const values = Form.useWatch([], { form, preserve: true });

  const participante = useMemo(
    () => buildParticipanteResumen({ modoParticipante, participanteSeleccionado, values }),
    [modoParticipante, participanteSeleccionado, values],
  );
  const { entregados, pendientes, obligatoriosPendientes } = useMemo(
    () => splitRequisitosResumen(requisitos, requisitosEntregados),
    [requisitos, requisitosEntregados],
  );

  const estadoPagoCursoExterno = useMemo(
    () => resolverEstadoPagoCursoExterno(curso, requisitos, requisitosEntregados),
    [curso, requisitos, requisitosEntregados],
  );

  const hayRequisitos = requisitos.length > 0;
  const registraPago = ofrecePago && registrarPagoInicial;
  const montoPago = Number(values?.monto);
  const conceptoPago =
    conceptoOptions.find((o) => o.value === values?.concepto)?.label ?? values?.concepto;

  return (
    <FormWorkspaceSection title={section?.title} description={section?.description} form={form}>
      <div className="insc-resumen">
        {participante ? (
          <header className="insc-resumen__head">
            <Avatar className="insc-resumen__avatar" size="large">
              {buildInitials(participante.nombreCompleto, '—')}
            </Avatar>
            <div className="insc-resumen__identidad">
              <span className="insc-resumen__nombre">
                {participante.nombreCompleto || 'Participante sin nombre'}
              </span>
              <span className="insc-resumen__meta">
                {participante.ciCompleto ? (
                  <span className="insc-resumen__meta-item">
                    C.I. <b className="insc-resumen__meta-valor">{participante.ciCompleto}</b>
                  </span>
                ) : null}
              </span>
            </div>
            {participante.esNuevo ? (
              <div className="insc-resumen__pills">
                <StatusPill label="Participante nuevo" className={`${PILL} ${PILL}--info`} />
              </div>
            ) : null}
          </header>
        ) : null}

        <CursoCapacitacionResumen
          curso={curso}
          mostrarHorarios={!grupo}
          mostrarMatricula={!grupo}
          estadoPagoCursoExterno={estadoPagoCursoExterno}
        />

        {grupo ? (
          <div className="insc-resumen__datos">
            <ResumenDato label="Grupo" value={grupo.nombre} />
            <ResumenDato label="Horarios" value={grupo.horariosLabel || 'Sin horarios definidos'} />
            {grupo.matricula > 0 ? (
              <ResumenDato label="Matrícula" value={`Bs ${formatBs(grupo.matricula)}`} />
            ) : null}
            <ResumenDato label="Aula" value={grupo.aulaLabel} />
            <ResumenDato
              label="Cupo disponible"
              value={grupo.cupoDisponible != null ? String(grupo.cupoDisponible) : 'Sin tope'}
            />
          </div>
        ) : null}

        {ofrecePago ? (
          <div className="insc-resumen__datos">
            <ResumenDato
              label="Pago inicial"
              value={
                registraPago
                  ? `Se registrará${conceptoPago ? `: ${conceptoPago}` : ''}${
                      Number.isFinite(montoPago) && montoPago > 0 ? ` · Bs ${formatBs(montoPago)}` : ''
                    }`
                  : 'No se registra pago: la inscripción quedará pendiente de pago'
              }
            />
          </div>
        ) : null}

        {hayRequisitos ? (
          <div className="insc-resumen__periodos">
            <article className="insc-resumen__periodo">
              <header className="insc-resumen__periodo-header">
                <span className="insc-resumen__periodo-nombre">Requisitos</span>
                <span className="insc-resumen__periodo-datos">
                  {entregados.length} {entregados.length === 1 ? 'entregado' : 'entregados'} ·{' '}
                  {pendientes.length} {pendientes.length === 1 ? 'pendiente' : 'pendientes'}
                </span>
              </header>
              <ul className="insc-resumen__materias">
                {entregados.map((r) => (
                  <RequisitoFila key={r.id} requisito={r} entregado />
                ))}
                {pendientes.map((r) => (
                  <RequisitoFila key={r.id} requisito={r} entregado={false} />
                ))}
              </ul>
            </article>
          </div>
        ) : (
          <Text type="secondary" className="insc-resumen__vacio">
            El curso no exige requisitos de inscripción.
          </Text>
        )}
      </div>

      {obligatoriosPendientes > 0 ? (
        <div className="insc-resumen__avisos">
          <div className="materias-planilla__banda materias-planilla__banda--info">
            <InfoCircleOutlined aria-hidden />
            <Text type="secondary">
              Faltan {obligatoriosPendientes}{' '}
              {obligatoriosPendientes === 1 ? 'requisito obligatorio' : 'requisitos obligatorios'}:
              la inscripción quedará «Pendiente» hasta que se entreguen (y se cancelen matrícula y
              curso).
            </Text>
          </div>
        </div>
      ) : null}
    </FormWorkspaceSection>
  );
};

export default InscripcionCapSeleccionResumen;
