/**
 * Carga académica agrupada: carrera → periodo → tarjetas (molécula DocenteAssignmentCard).
 */

import { Empty } from 'antd';
import { ApartmentOutlined, BookOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import DetailInfoCard from '@docentes/components/molecules/DetailInfoCard';
import DocenteAssignmentCard from '@docentes/components/molecules/DocenteAssignmentCard';
import { sanitizeDocenteColorHex, docenteCarreraTitleStyles } from '@docentes/components/atoms/DocenteColorBar';

const assignmentRowKey = (row) =>
  [
    row.cursoCodigo,
    row.siglaMateria,
    row.paralelo,
    row.turnoParalelo,
    row.periodoMateriaPlan,
    row.periodoParalelo,
    row.vigente ? '1' : '0',
    row.materia,
    row.carrera,
    row.cursoColorHex,
  ]
    .map((v) => (v == null ? '' : String(v)))
    .join('\u0001');

function groupByCarreraThenPeriodo(assignments) {
  const carreraOrder = [];
  const tree = new Map();
  for (const a of assignments || []) {
    const c = a.carrera || 'Sin carrera definida';
    const p = a.periodoMateriaPlan || a.periodoParalelo || 'Sin periodo';
    if (!tree.has(c)) {
      tree.set(c, { byPeriod: new Map(), periodOrder: [] });
      carreraOrder.push(c);
    }
    const node = tree.get(c);
    if (!node.byPeriod.has(p)) {
      node.byPeriod.set(p, []);
      node.periodOrder.push(p);
    }
    node.byPeriod.get(p).push(a);
  }
  return carreraOrder.map((c) => {
    const n = tree.get(c);
    const periodos = n.periodOrder.map((p) => ({ periodo: p, rows: n.byPeriod.get(p) }));
    const first = periodos[0]?.rows?.[0];
    const carreraColorHex = sanitizeDocenteColorHex(first?.carreraColorHex);
    return { carrera: c, carreraColorHex, periodos };
  });
}

const DocenteAssignmentsSection = ({
  assignments = [],
  puedeAsignarMaterias = false,
  onAsignarMaterias,
  showAssignmentActions = false,
  onEditAssignment = null,
  onDeleteAssignment = null,
  showManageButtonInCard = false,
}) => {
  const grouped = groupByCarreraThenPeriodo(assignments);
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
    <DetailInfoCard title="Carga académica asignada" icon={<BookOutlined />} cols={1} extra={cardExtra}>
      {assignments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Sin asignaciones a cursos registradas"
          extra={emptyExtra}
        />
      ) : (
        <div className="da-carga">
          {grouped.map(({ carrera, carreraColorHex, periodos }, carreraIdx) => (
            <section
              key={`da-carga-carrera-${carreraIdx}`}
              className="da-carga__carrera-block"
              aria-labelledby={`da-carga-carrera-h-${carreraIdx}`}
            >
              <h3
                id={`da-carga-carrera-h-${carreraIdx}`}
                className={`da-carga__carrera-title${carreraColorHex ? ' da-carga__carrera-title--tinted' : ''}`}
                style={docenteCarreraTitleStyles(carreraColorHex) ?? undefined}
              >
                {carrera}
              </h3>
              {periodos.map(({ periodo, rows }) => (
                <div key={`${carrera}-${periodo}`} className="da-carga__periodo-block">
                  <div className="da-carga__periodo-label">{periodo}</div>
                  <div className="da-carga__materias-grid">
                    {rows.map((a) => (
                      <DocenteAssignmentCard
                        key={assignmentRowKey(a)}
                        assignment={a}
                        showActions={showAssignmentActions}
                        onEdit={onEditAssignment}
                        onDelete={onDeleteAssignment}
                      />
                    ))}
                  </div>
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
