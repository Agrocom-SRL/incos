import { Alert, Col, Divider, Flex, Row, Typography, Button as AntButton } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { Card, ActionButton } from '@atoms';
import { resumenBloquesCurso } from '@application-institucional/horarios/utils/resumenBloquesCurso';

const { Text } = Typography;

const ParaleloCursosTabSection = ({ draftSchedules, missingSubjects, setTab, onOpenDocenteAsignacion }) => {
  if (!draftSchedules.length) {
    return (
      <Alert
        type="info"
        showIcon
        title="Sin cursos"
        description={
          <Flex vertical gap={8} align="flex-start">
            <span>No hay cursos cargados para este paralelo.</span>
            <ActionButton
              permiso="institucional.gestion.horarios"
              accion="LISTAR"
              variant="default"
              size="small"
              onClick={() => setTab('gestion')}
            >
              Ir a gestión de cursos
            </ActionButton>
          </Flex>
        }
      />
    );
  }

  return (
    <Flex vertical gap={12}>
      {missingSubjects.length ? (
        <Alert
          type="warning"
          showIcon
          title={`Materias del periodo sin curso (${missingSubjects.length})`}
          description={
            <ul className="horarios-armado-cursos__lista">
              {missingSubjects.map((m, idx) => (
                <li key={`${m.asignaturaPlanId || m.materiaId || idx}`}>
                  <Text type="secondary">
                    {m.materiaSigla && m.materiaNombre
                      ? `${m.materiaSigla} — ${m.materiaNombre}`
                      : m.materiaNombre || m.materiaSigla || 'Materia sin nombre'}{' '}
                    {m.horasSemanalesPlan != null ? `· ${m.horasSemanalesPlan} h/semana` : ''}
                  </Text>
                </li>
              ))}
            </ul>
          }
        />
      ) : (
        <Alert type="success" showIcon title="Todas las materias del periodo ya tienen curso." />
      )}
      <Row gutter={[12, 12]}>
        {draftSchedules.map((c) => {
          const titulo = c.materiaNombre || c.materiaSigla || 'Materia sin nombre';
          const { horasGrilla, horasPlan, diasOrd, lineas } = resumenBloquesCurso(c);
          const docenteActual = c.docente || null;
          return (
            <Col key={c.cursoId} xs={24} lg={12}>
              <Card
                variant="default"
                shadow={true}
                headerColor="primary"
                headerAccentHex={c.cursoColorHex}
                title={titulo}
                extra={
                  <AntButton
                    type="primary"
                    icon={<TeamOutlined />}
                    onClick={() => onOpenDocenteAsignacion({ ...c, docente: docenteActual })}
                  >
                    {docenteActual ? 'Reasignar docente' : 'Asignar docente'}
                  </AntButton>
                }
              >
                <Flex vertical gap={6}>
                  {c.materiaSigla && c.materiaNombre ? (
                    <Text type="secondary">
                      Sigla: <Text strong>{c.materiaSigla}</Text>
                    </Text>
                  ) : null}
                  <Text type="secondary">
                    Docente: <Text strong>{docenteActual || 'Sin asignar'}</Text>
                  </Text>
                  <Text type="secondary">
                    Carga horaria del periodo (plan):{' '}
                    <Text strong>
                      {horasPlan != null && !Number.isNaN(horasPlan) ? `${horasPlan} h/semana` : '—'}
                    </Text>
                  </Text>
                  <Text type="secondary">
                    Horas acumuladas en la grilla (bloques): <Text strong>{horasGrilla} h</Text> (
                    {c.bloques?.length ?? 0} bloques)
                  </Text>
                  <Text type="secondary">
                    Días con clase: <Text strong>{diasOrd.length ? diasOrd.join(', ') : '—'}</Text>
                  </Text>
                  {lineas.length ? (
                    <>
                      <Divider plain style={{ margin: '8px 0' }} />
                      <Text strong>Detalle por combinación día / horario</Text>
                      <ul className="horarios-armado-cursos__lista">
                        {lineas.map((ln, idx) => (
                          <li key={`${c.cursoId}-${idx}`}>
                            <Text type="secondary">{ln}</Text>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Text type="secondary" italic>
                      Aún no hay bloques cargados en el plan para esta materia.
                    </Text>
                  )}
                </Flex>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Flex>
  );
};

export default ParaleloCursosTabSection;
