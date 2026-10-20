/**
 * Carga académica agrupada: carrera → periodo → grilla de tarjetas (patrón cobertura horarios).
 */

import { Col, Empty, Row } from 'antd';
import { ApartmentOutlined, BookOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import DocenteAssignmentCard from '@docentes/components/molecules/DocenteAssignmentCard';
import { docenteCarreraTitleStyles } from '@docentes/utils/docenteColor';
import {
  assignmentRowKey,
  groupAssignmentsByCarreraPeriodo,
} from '@docentes/utils/groupAssignmentsByCarreraPeriodo';

const DocenteAssignmentsSection = ({
  assignments = [],
  puedeAsignarMaterias = false,
  onAsignarMaterias,
  showAssignmentActions = false,
  onEditAssignment = null,
  onDeleteAssignment = null,
  showManageButtonInCard = false,
}) => {
  const grouped = groupAssignmentsByCarreraPeriodo(assignments);
  const canManageAssignments = puedeAsignarMaterias && typeof onAsignarMaterias === 'function';

  const cardExtra =
    showManageButtonInCard && canManageAssignments ? (
      <ActionButton
        permiso="docentes.asignar"
        accion="CREAR"
        variant="primary"
        icon={<ApartmentOutlined />}
        onClick={onAsignarMaterias}
      >
        Gestionar asignaciones
      </ActionButton>
    ) : null;

  const emptyExtra = canManageAssignments ? (
    <ActionButton
      permiso="docentes.asignar"
      accion="CREAR"
      variant="primary"
      icon={<ApartmentOutlined />}
      onClick={onAsignarMaterias}
    >
      Asignar materias y paralelos
    </ActionButton>
  ) : null;

  return (
    <DetailInfoCard title="Materias ofertadas asignadas" icon={<BookOutlined />} cols={1} extra={cardExtra}>
      {assignments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin materias ofertadas vinculadas a este docente"
          extra={emptyExtra}
        />
      ) : (
        <div className="docente-asignaciones-cobertura">
          {grouped.map(({ carrera, carreraColorHex, periodos }, carreraIdx) => (
            <section
              key={`docente-asig-carrera-${carreraIdx}`}
              className="docente-asignaciones-cobertura__carrera"
              aria-labelledby={`docente-asig-carrera-h-${carreraIdx}`}
            >
              <h3
                id={`docente-asig-carrera-h-${carreraIdx}`}
                className={`docente-asignaciones-cobertura__carrera-title${carreraColorHex ? ' docente-asignaciones-cobertura__carrera-title--tinted' : ''
                  }`}
                style={docenteCarreraTitleStyles(carreraColorHex) ?? undefined}
              >
                {carrera}
              </h3>
              {periodos.map(({ periodo, rows }) => (
                <div
                  key={`${carrera}-${periodo}`}
                  className="docente-asignaciones-cobertura__periodo"
                >
                  <div className="docente-asignaciones-cobertura__periodo-label">{periodo}</div>
                  <Row gutter={[12, 12]}>
                    {rows.map((a) => (
                      <Col key={assignmentRowKey(a)} xs={24} lg={12}>
                        <DocenteAssignmentCard
                          assignment={a}
                          showActions={showAssignmentActions}
                          onEdit={onEditAssignment}
                          onDelete={onDeleteAssignment}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </DetailInfoCard>
  );
};

export default DocenteAssignmentsSection;
