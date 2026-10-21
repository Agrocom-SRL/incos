/**
 * Organismo: contenido del paso "Curso" de Inscribir participante (CAP).
 * Grilla de tarjetas seleccionables (un curso por tarjeta) en vez de un
 * `<Select>` de texto — mismo patrón visual que `TipoAdmisionSelectionSection`/
 * `UsuarioCategoriaCreacionStepContent` (`Radio.Group` > `Radio.Button` como
 * tarjeta, estilos centralizados en `wizard-selection-cards.css`). `Radio.Group`
 * queda CONTROLADO por `cursoSeleccionadoId` (estado plano del hook, no es un
 * campo de `Form` — no hace falta `Form.Item` para reusar el mismo CSS/JSX).
 *
 * La tarjeta ya muestra costo/cupo/fechas de un vistazo (`InfoLinesCell`); el
 * resumen con el detalle de horarios se muestra en el paso "Pago inicial"
 * (`InscribirParticipantePage`), no aquí, para no duplicar los mismos datos.
 *
 * Recibe props ya mapeadas del hook; no llama hooks de fetch.
 */

import { Alert, Empty, Radio } from 'antd';
import { CalendarOutlined, DollarOutlined, ReadOutlined, TeamOutlined } from '@ant-design/icons';
import { InfoLinesCell, StatusPill } from '@atoms';
import { formatEstadoCurso, getEstadoCursoPillClass } from '@application-capacitacion/utils/capacitacionPills';
import { allSpacing } from '@theme/tokens';
import CostoCursoLabel from '@capacitacion/components/atoms/CostoCursoLabel';
import CursoGratuitoPill from '@capacitacion/components/atoms/CursoGratuitoPill';
import '@presentation/styles/components/molecules/wizard-selection-cards.css';

const InscribirParticipanteSeccionCurso = ({
  cursos,
  loadingCursos,
  errorCursos,
  cursoSeleccionadoId,
  onCursoChange,
}) => (
  <>
    {errorCursos ? (
      <Alert
        type="error"
        showIcon
        title="No se pudieron cargar los cursos"
        description={errorCursos}
        style={{ marginBottom: allSpacing.marginSM }}
      />
    ) : null}

    {!loadingCursos && !errorCursos && cursos.length === 0 ? (
      <Empty description="No hay cursos de capacitación disponibles." />
    ) : (
      <Radio.Group
        value={cursoSeleccionadoId ?? undefined}
        onChange={(event) => onCursoChange(event.target.value)}
        disabled={loadingCursos}
        style={{ width: '100%' }}
      >
        <div className="wizard-selection-cards__grid">
          {cursos.map((curso) => {
            const isSelected = cursoSeleccionadoId === curso.id;
            return (
              <Radio.Button key={curso.id} value={curso.id} className="wizard-selection-cards__radio">
                <div className="wizard-selection-cards__inner">
                  <div className="wizard-selection-cards__icon-wrap">
                    <ReadOutlined className="wizard-selection-cards__icon" />
                  </div>
                  <div className="wizard-selection-cards__body">
                    <div className="wizard-selection-cards__label">{curso.titulo}</div>
                    <StatusPill
                      label={formatEstadoCurso(curso.estado)}
                      className={getEstadoCursoPillClass(curso.estado)}
                    />
                    <div className="wizard-selection-cards__metrics">
                      <InfoLinesCell
                        lines={[
                          curso.esGratuito
                            ? { icon: <DollarOutlined />, label: <CursoGratuitoPill /> }
                            : null,
                          curso.tieneCosto
                            ? { icon: <DollarOutlined />, label: <>Curso: <CostoCursoLabel costo={curso.costo} /></> }
                            : null,
                          curso.cobraMatricula
                            ? { icon: <DollarOutlined />, label: <>Matrícula: <CostoCursoLabel costo={curso.costoMatricula} /></> }
                            : null,
                          {
                            icon: <TeamOutlined />,
                            label:
                              curso.cupoMaximo != null
                                ? `${curso.inscritosCount} / ${curso.cupoMaximo} inscritos`
                                : `${curso.inscritosCount} inscritos`,
                          },
                          curso.fechasLabel
                            ? { icon: <CalendarOutlined />, label: curso.fechasLabel }
                            : null,
                        ].filter(Boolean)}
                      />
                    </div>
                  </div>
                  {isSelected ? (
                    <div className="wizard-selection-cards__check" aria-hidden>
                      ✓
                    </div>
                  ) : null}
                </div>
              </Radio.Button>
            );
          })}
        </div>
      </Radio.Group>
    )}
  </>
);

export default InscribirParticipanteSeccionCurso;
