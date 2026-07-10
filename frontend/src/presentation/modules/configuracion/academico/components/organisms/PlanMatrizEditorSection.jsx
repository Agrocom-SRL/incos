/**
 * Organismo: tab «Periodos y asignaturas» — matriz EDITABLE del plan de estudio.
 * Gemelo interactivo de `PlanEstudioDocumentoView` (solo lectura, usada en
 * `PlanesTabPanel`): consume el mismo `periodos` de `fetchMatriz` pero agrega
 * alta/edición/baja de periodos y asignaturas. No se reutiliza el render de
 * `PlanEstudioDocumentoView` (estilo documento RM) porque aquí la unidad
 * visual es tabla + acciones (patrón `DetailInfoCard` + `Table`, igual que
 * `CarreraDetailMateriasSection`), no el layout de dos columnas del documento.
 */

import { useState } from 'react';
import { Empty, Popconfirm, Table, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ListPanelHeader } from '@molecules';
import DetailInfoCard from '@molecules/DetailInfoCard';
import { ActionButton } from '@atoms';
import {
  PLAN_ASIGNATURAS_PERMISO,
  PLAN_PERIODOS_PERMISO,
} from '@application-configuracion/academico/config/planEstudioPermisos';
import PeriodoFormModal from '@configuracion/academico/components/molecules/PeriodoFormModal';
import AsignaturaPlanFormModal from '@configuracion/academico/components/molecules/AsignaturaPlanFormModal';

const { Text } = Typography;

const periodoTitulo = (periodo) => periodo.nombre || `Año ${periodo.numero}`;

const materiaLabelDe = (asignatura) =>
  asignatura?.materia?.sigla
    ? `${asignatura.materia.sigla} — ${asignatura.materia.nombre}`
    : asignatura?.materia?.nombre || '—';

const PlanMatrizEditorSection = ({
  periodos = [],
  horasTotalPlan = 0,
  materiasDisponiblesPorPeriodo,
  materiasLoading = false,
  guardando = false,
  onCrearPeriodo,
  onActualizarPeriodo,
  onEliminarPeriodo,
  onCrearAsignatura,
  onActualizarAsignatura,
  onEliminarAsignatura,
}) => {
  const [periodoModal, setPeriodoModal] = useState(null);
  const [asignaturaModal, setAsignaturaModal] = useState(null);

  const abrirCrearPeriodo = () =>
    setPeriodoModal({ mode: 'create', numero: (periodos.length || 0) + 1 });
  const abrirEditarPeriodo = (periodo) =>
    setPeriodoModal({ mode: 'edit', id: periodo.id, nombre: periodo.nombre, numero: periodo.numero });
  const cerrarPeriodoModal = () => setPeriodoModal(null);

  const handleSubmitPeriodo = async (values) => {
    const ok =
      periodoModal.mode === 'edit'
        ? await onActualizarPeriodo(periodoModal.id, values)
        : await onCrearPeriodo(values);
    if (ok) cerrarPeriodoModal();
    return ok;
  };

  const abrirCrearAsignatura = (periodoId) => setAsignaturaModal({ periodoId, mode: 'create' });
  const abrirEditarAsignatura = (periodoId, asignatura) =>
    setAsignaturaModal({
      periodoId,
      mode: 'edit',
      asignaturaId: asignatura.id,
      initialValues: {
        horasSemanales: asignatura.horas_semanales,
        modalidad: asignatura.modalidad,
      },
      materiaLabel: materiaLabelDe(asignatura),
    });
  const cerrarAsignaturaModal = () => setAsignaturaModal(null);

  const handleSubmitAsignatura = async (payload) => {
    const ok =
      asignaturaModal.mode === 'edit'
        ? await onActualizarAsignatura(asignaturaModal.asignaturaId, payload)
        : await onCrearAsignatura(asignaturaModal.periodoId, payload);
    if (ok) cerrarAsignaturaModal();
    return ok;
  };

  const columns = [
    { title: 'Código', dataIndex: ['materia', 'sigla'], width: 100, render: (v) => v || '—' },
    {
      title: 'Asignatura',
      dataIndex: ['materia', 'nombre'],
      render: (v) => (v || '—').toUpperCase(),
    },
    { title: 'h/sem', dataIndex: 'horas_semanales', width: 80, align: 'right' },
    { title: 'Modalidad', dataIndex: 'modalidad', width: 140, render: (v) => v || '—' },
    {
      title: '',
      key: 'acciones',
      width: 96,
      align: 'right',
      render: (_, row) => (
        <span className="cfg-plan-matriz__row-actions">
          <ActionButton
            permiso={PLAN_ASIGNATURAS_PERMISO}
            accion="EDITAR"
            variant="warning"
            size="small"
            icon={<EditOutlined />}
            onClick={() => abrirEditarAsignatura(row._periodoId, row)}
          />
          <Popconfirm
            title="Eliminar asignatura del periodo"
            description="Se quitará esta asignatura de la matriz del plan. ¿Continuar?"
            okText="Eliminar"
            okButtonProps={{ danger: true }}
            cancelText="Cancelar"
            onConfirm={() => onEliminarAsignatura(row.id)}
          >
            <ActionButton
              permiso={PLAN_ASIGNATURAS_PERMISO}
              accion="ELIMINAR"
              variant="danger"
              size="small"
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <>
      <ListPanelHeader
        title={`Matriz del plan${horasTotalPlan ? ` — ${horasTotalPlan} h/sem` : ''}`}
        actions={
          <ActionButton
            permiso={PLAN_PERIODOS_PERMISO}
            accion="CREAR"
            variant="primary"
            icon={<PlusOutlined />}
            onClick={abrirCrearPeriodo}
          >
            Agregar periodo
          </ActionButton>
        }
      />

      {periodos.length === 0 ? (
        <Empty description="Este plan aún no tiene periodos. Agregue el primero para comenzar la matriz." />
      ) : (
        periodos.map((periodo) => (
          <DetailInfoCard
            key={periodo.id}
            title={periodoTitulo(periodo)}
            cols={1}
            extra={
              <span className="cfg-plan-matriz__periodo-actions">
                <Text type="secondary" className="cfg-plan-matriz__periodo-horas">
                  {periodo.horas_total ?? 0} h/sem
                </Text>
                <ActionButton
                  permiso={PLAN_ASIGNATURAS_PERMISO}
                  accion="CREAR"
                  variant="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => abrirCrearAsignatura(periodo.id)}
                >
                  Asignatura
                </ActionButton>
                <ActionButton
                  permiso={PLAN_PERIODOS_PERMISO}
                  accion="EDITAR"
                  variant="warning"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => abrirEditarPeriodo(periodo)}
                />
                <Popconfirm
                  title="Eliminar periodo"
                  description="Se eliminará el periodo y debe estar sin asignaturas. ¿Continuar?"
                  okText="Eliminar"
                  okButtonProps={{ danger: true }}
                  cancelText="Cancelar"
                  onConfirm={() => onEliminarPeriodo(periodo.id)}
                >
                  <ActionButton
                    permiso={PLAN_PERIODOS_PERMISO}
                    accion="ELIMINAR"
                    variant="danger"
                    size="small"
                    icon={<DeleteOutlined />}
                  />
                </Popconfirm>
              </span>
            }
          >
            {(periodo.asignaturas ?? []).length === 0 ? (
              <Empty description="Sin asignaturas en este periodo." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <Table
                size="small"
                rowKey="id"
                dataSource={periodo.asignaturas.map((a) => ({ ...a, _periodoId: periodo.id }))}
                columns={columns}
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </DetailInfoCard>
        ))
      )}

      <PeriodoFormModal
        open={Boolean(periodoModal)}
        mode={periodoModal?.mode}
        loading={guardando}
        initialValues={periodoModal}
        onCancel={cerrarPeriodoModal}
        onSubmit={handleSubmitPeriodo}
      />

      <AsignaturaPlanFormModal
        open={Boolean(asignaturaModal)}
        mode={asignaturaModal?.mode}
        loading={guardando || materiasLoading}
        initialValues={asignaturaModal?.initialValues}
        materiaLabel={asignaturaModal?.materiaLabel}
        materiasOptions={
          asignaturaModal?.mode === 'create'
            ? materiasDisponiblesPorPeriodo(asignaturaModal.periodoId)
            : []
        }
        onCancel={cerrarAsignaturaModal}
        onSubmit={handleSubmitAsignatura}
      />
    </>
  );
};

export default PlanMatrizEditorSection;
