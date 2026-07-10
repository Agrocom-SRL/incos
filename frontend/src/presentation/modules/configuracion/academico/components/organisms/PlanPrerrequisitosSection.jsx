/**
 * Organismo: tab «Prerrequisitos» — alta/baja de prerrequisitos entre
 * asignaturas del mismo plan, agrupadas por periodo (mismo agrupamiento que
 * `PlanMatrizEditorSection`, para que el usuario ubique la asignatura en el
 * mismo lugar visual en ambos tabs).
 *
 * Fuente de datos: el array plano `prerrequisitos` que ya devuelve
 * `fetchPlanById` (todo el plan, sin llamadas adicionales por asignatura —
 * ver nota de deviation en `usePlanDetallePage.js`). "Requiere" y "Es
 * prerrequisito de" se derivan de ese mismo array filtrando por
 * `asignatura_id` / `prerrequisito_id`.
 */

import { useMemo, useState } from 'react';
import { Empty, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import DetailInfoCard from '@molecules/DetailInfoCard';
import { ActionButton } from '@atoms';
import { useAuthContext } from '@application-auth';
import { PLAN_PRERREQUISITOS_PERMISO } from '@application-configuracion/academico/config/planEstudioPermisos';
import PrerrequisitoFormModal from '@configuracion/academico/components/molecules/PrerrequisitoFormModal';

const { Text } = Typography;

const periodoTitulo = (periodo) => periodo.nombre || `Año ${periodo.numero}`;

const PlanPrerrequisitosSection = ({
  periodos = [],
  asignaturasFlat = [],
  prerrequisitos = [],
  guardando = false,
  onCrearPrerrequisito,
  onEliminarPrerrequisito,
}) => {
  const { hasPermiso } = useAuthContext();
  const puedeEliminar = hasPermiso(PLAN_PRERREQUISITOS_PERMISO, 'ELIMINAR');
  const [modalAsignaturaId, setModalAsignaturaId] = useState(null);

  const asignaturaById = useMemo(
    () => new Map(asignaturasFlat.map((a) => [a.id, a])),
    [asignaturasFlat],
  );

  const etiquetaAsignatura = (asignaturaId) => {
    const a = asignaturaById.get(asignaturaId);
    if (!a) return `Asignatura #${asignaturaId}`;
    return a.sigla ? `${a.sigla} — ${a.nombre}` : a.nombre;
  };

  const requiereDe = (asignaturaId) => prerrequisitos.filter((p) => p.asignatura_id === asignaturaId);
  const esPrerrequisitoDe = (asignaturaId) =>
    prerrequisitos.filter((p) => p.prerrequisito_id === asignaturaId);

  const abrirModal = (asignaturaId) => setModalAsignaturaId(asignaturaId);
  const cerrarModal = () => setModalAsignaturaId(null);

  const opcionesPrerrequisito = useMemo(() => {
    if (!modalAsignaturaId) return [];
    const yaAgregados = new Set(
      prerrequisitos
        .filter((p) => p.asignatura_id === modalAsignaturaId)
        .map((p) => p.prerrequisito_id),
    );
    return asignaturasFlat.filter((a) => {
      if (a.id === modalAsignaturaId) return false; // no puede ser prerrequisito de sí misma
      if (yaAgregados.has(a.id)) return false; // ya está agregado
      // evita el ciclo directo: si `a` ya requiere `modalAsignaturaId`, no permitir el par inverso
      const cicloDirecto = prerrequisitos.some(
        (p) => p.asignatura_id === a.id && p.prerrequisito_id === modalAsignaturaId,
      );
      return !cicloDirecto;
    });
  }, [modalAsignaturaId, asignaturasFlat, prerrequisitos]);

  const handleSubmit = async ({ prerrequisitoId }) => {
    const ok = await onCrearPrerrequisito({ asignaturaId: modalAsignaturaId, prerrequisitoId });
    if (ok) cerrarModal();
    return ok;
  };

  if (periodos.length === 0) {
    return <Empty description="Este plan aún no tiene periodos ni asignaturas." />;
  }

  return (
    <>
      {periodos.map((periodo) => (
        <DetailInfoCard key={periodo.id} title={periodoTitulo(periodo)} cols={1}>
          {(periodo.asignaturas ?? []).length === 0 ? (
            <Empty description="Sin asignaturas en este periodo." image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            (periodo.asignaturas ?? []).map((asig) => {
              const requiere = requiereDe(asig.id);
              const dependeDe = esPrerrequisitoDe(asig.id);
              const label = asig.materia?.sigla
                ? `${asig.materia.sigla} — ${asig.materia.nombre}`
                : asig.materia?.nombre;

              return (
                <div key={asig.id} className="cfg-plan-prereq__asignatura">
                  <Text strong>{label}</Text>

                  <div className="cfg-plan-prereq__tags">
                    <Text type="secondary">Requiere:</Text>
                    {requiere.length === 0 ? <Text type="secondary">Ninguna</Text> : null}
                    {requiere.map((p) => (
                      <Tag
                        key={p.id}
                        color="processing"
                        closable={puedeEliminar}
                        onClose={(e) => {
                          e.preventDefault();
                          onEliminarPrerrequisito(p.id);
                        }}
                      >
                        {etiquetaAsignatura(p.prerrequisito_id)}
                      </Tag>
                    ))}
                    <ActionButton
                      permiso={PLAN_PRERREQUISITOS_PERMISO}
                      accion="CREAR"
                      variant="info"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => abrirModal(asig.id)}
                    >
                      Agregar
                    </ActionButton>
                  </div>

                  {dependeDe.length > 0 ? (
                    <div className="cfg-plan-prereq__tags">
                      <Text type="secondary">Es prerrequisito de:</Text>
                      {dependeDe.map((p) => (
                        <Tag key={p.id}>{etiquetaAsignatura(p.asignatura_id)}</Tag>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </DetailInfoCard>
      ))}

      <PrerrequisitoFormModal
        open={Boolean(modalAsignaturaId)}
        loading={guardando}
        asignaturaLabel={modalAsignaturaId ? etiquetaAsignatura(modalAsignaturaId) : ''}
        opcionesPrerrequisito={opcionesPrerrequisito}
        onCancel={cerrarModal}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default PlanPrerrequisitosSection;
