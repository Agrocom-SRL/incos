/**
 * Organismo: modal "Generar folios de paralelo" (ficha — P2 · LibroDetailPage).
 *
 * Lista los paralelos candidatos (`GET /libros/:id/paralelos`) con su nómina y
 * si ya tienen folios vigentes. "Generar folios" (permiso CREAR) crea las
 * páginas del paralelo elegido; si ya está generado, el botón queda
 * deshabilitado (para regenerar hay que anular los folios vigentes primero,
 * regla de negocio del backend).
 */

import { useState } from 'react';
import { Empty, Flex, Modal, Popconfirm, Table } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import { ActionButton, StatusPill } from '@atoms';
import { TableCell } from '@molecules';
import { modalWidths } from '@theme/tokens/spacing';
import { allSpacing } from '@theme/tokens';
import { LIBROS_PERMISOS } from '@application-academico/libros/utils/librosPermisos';
import GenerarFoliosResumen from '../molecules/GenerarFoliosResumen.jsx';

const GenerarFoliosModal = ({
  open,
  paralelos = [],
  loading = false,
  generando = false,
  onGenerar,
  onGenerarTodos,
  generandoTodos = false,
  resumenTodos = null,
  onCancelar,
}) => {
  const [procesandoId, setProcesandoId] = useState(null);

  const handleGenerar = async (paraleloGestionId) => {
    setProcesandoId(paraleloGestionId);
    await onGenerar?.(paraleloGestionId);
    setProcesandoId(null);
  };

  const hayPendientes = paralelos.some((p) => !p.generado);

  const columns = [
    {
      title: 'Curso - Paralelo',
      key: 'curso',
      render: (_, record) => <TableCell subtext={record.turno}>{record.cursoLabel}</TableCell>,
    },
    {
      title: 'Estudiantes',
      dataIndex: 'totalEstudiantes',
      width: 110,
      align: 'center',
    },
    {
      title: 'Folios',
      key: 'estado',
      width: 140,
      render: (_, record) =>
        record.generado ? (
          <StatusPill label={`${record.foliosVigentes} generado(s)`} className="cfg-materia-pill cfg-materia-pill--success" />
        ) : (
          <StatusPill label="Pendiente" className="cfg-materia-pill cfg-materia-pill--default" />
        ),
    },
    {
      title: '',
      key: 'acciones',
      width: 170,
      align: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Generar folios del paralelo"
          description="Se crearán los folios correlativos de la gestión para este paralelo."
          okText="Generar"
          cancelText="Cancelar"
          onConfirm={() => handleGenerar(record.paraleloGestionId)}
          disabled={record.generado || generandoTodos}
        >
          <ActionButton
            permiso={LIBROS_PERMISOS.libro}
            accion="CREAR"
            variant="primary"
            size="small"
            icon={<FileAddOutlined />}
            disabled={record.generado || generandoTodos}
            loading={generando && procesandoId === record.paraleloGestionId}
            title={record.generado ? 'Anule los folios vigentes para regenerar' : 'Generar folios'}
          >
            Generar folios
          </ActionButton>
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      title="Generar folios de paralelo"
      onCancel={onCancelar}
      footer={null}
      destroyOnHidden
      width={modalWidths.modalWidthLG}
    >
      {resumenTodos ? (
        <div style={{ marginBottom: allSpacing.marginMD }}>
          <GenerarFoliosResumen resumen={resumenTodos} />
        </div>
      ) : null}

      <Flex justify="flex-end" style={{ marginBottom: allSpacing.marginSM }}>
        <Popconfirm
          title="Generar folios de todos los paralelos"
          description="Se generarán los folios de los paralelos pendientes de esta gestión. Los que ya tengan folios vigentes se omiten."
          okText="Generar todos"
          cancelText="Cancelar"
          onConfirm={onGenerarTodos}
          disabled={!hayPendientes || generando}
        >
          <ActionButton
            permiso={LIBROS_PERMISOS.libro}
            accion="CREAR"
            variant="primary"
            icon={<FileAddOutlined />}
            disabled={!hayPendientes || generando}
            loading={generandoTodos}
            title={!hayPendientes ? 'Todos los paralelos ya tienen folios vigentes' : undefined}
          >
            Generar todos
          </ActionButton>
        </Popconfirm>
      </Flex>

      <Table
        dataSource={paralelos}
        columns={columns}
        rowKey="paraleloGestionId"
        loading={loading}
        size="small"
        pagination={false}
        locale={{
          emptyText: (
            <Empty description="No hay paralelos disponibles para la gestión de este libro." />
          ),
        }}
      />
    </Modal>
  );
};

export default GenerarFoliosModal;
