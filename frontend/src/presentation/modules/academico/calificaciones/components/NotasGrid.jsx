/**
 * Grilla del cuaderno — estilo cabecera consolidado (verde oscuro) + bimestre agrupado.
 */

import { EditOutlined, PlusOutlined, RedoOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Table, Tooltip } from 'antd';
import NotaCell from './NotaCell.jsx';

const BimestreGrupoHead = ({ titulo }) => (
  <div className="cal-notas-grid__bim-head cal-notas-grid__bim-head--activo">
    <span className="cal-notas-grid__bim-titulo-row">
      <span className="cal-notas-grid__bim-titulo">{titulo}</span>
    </span>
  </div>
);

const EvaluacionColumnHead = ({
  ev,
  soloLectura,
  onEditarEvaluacion,
  onResetEvaluacion,
  onGuardarEvaluacion,
}) => (
  <div className="cal-notas-grid__eval-head">
    <button
      type="button"
      className={[
        'cal-notas-grid__col-head',
        !soloLectura ? 'cal-notas-grid__col-head--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => !soloLectura && onEditarEvaluacion?.(ev)}
      disabled={soloLectura}
      aria-label={soloLectura ? ev.nombre : `Editar evaluación ${ev.nombre}`}
    >
      <span className="cal-notas-grid__col-head-text">{ev.nombre}</span>
      {!soloLectura ? <EditOutlined className="cal-notas-grid__col-edit-icon" aria-hidden /> : null}
    </button>
    <div className="cal-notas-grid__col-actions">
      <Tooltip title="Restablecer todas las notas de esta evaluación">
        <Button
          type="text"
          size="small"
          icon={<RedoOutlined />}
          aria-label="Restablecer notas"
          disabled={soloLectura}
          onClick={(e) => {
            e.stopPropagation();
            onResetEvaluacion?.(ev.id);
          }}
        />
      </Tooltip>
      <Tooltip title="Guardar cambios pendientes de esta evaluación">
        <Button
          type="text"
          size="small"
          icon={<SaveOutlined />}
          aria-label="Guardar cambios"
          disabled={soloLectura}
          onClick={(e) => {
            e.stopPropagation();
            onGuardarEvaluacion?.(ev.id);
          }}
        />
      </Tooltip>
    </div>
  </div>
);

const renderEstudiante = (nombre, row) => (
  <span className="cal-notas-grid__estudiante">
    <span className="cal-notas-grid__margen" aria-hidden />
    <span className="cal-notas-grid__estudiante-texto">
      {row.codigo ? <span className="cal-notas-grid__codigo">{row.codigo}</span> : null}
      <span className="cal-notas-grid__nombre">{nombre}</span>
    </span>
  </span>
);

const NotasGrid = ({
  cursoId,
  bimestre,
  bimestreTitulo = 'Bimestre',
  estudiantes = [],
  evaluaciones = [],
  soloLectura = true,
  onAgregarEvaluacion,
  onEditarEvaluacion,
  onResetEvaluacion,
  onGuardarEvaluacion,
  enteringColumnIds = [],
  removingColumnId = null,
}) => {
  const thEst = () => ({ className: 'cal-notas-grid__th-est' });
  const thSub = () => ({ className: 'cal-notas-grid__th-sub' });

  const columnasEval = evaluaciones.map((ev) => {
    const colClass = [
      'cal-notas-grid__col-eval',
      enteringColumnIds.includes(ev.id) ? 'cal-col--enter' : '',
      removingColumnId === ev.id ? 'cal-col--leave' : '',
    ]
      .filter(Boolean)
      .join(' ');

    return {
      title: (
        <EvaluacionColumnHead
          ev={ev}
          soloLectura={soloLectura}
          onEditarEvaluacion={onEditarEvaluacion}
          onResetEvaluacion={onResetEvaluacion}
          onGuardarEvaluacion={onGuardarEvaluacion}
        />
      ),
      key: ev.id,
      width: 148,
      align: 'center',
      className: colClass,
      onHeaderCell: thSub,
      onCell: () => ({ className: colClass }),
      render: (_, row) => (
        <NotaCell
          cursoId={cursoId}
          bimestre={bimestre}
          estudianteId={row.id}
          evaluacionId={ev.id}
          valorInicial={row.notas?.[ev.id]}
          soloLectura={soloLectura}
        />
      ),
    };
  });

  const grupoBimestre = {
    title: <BimestreGrupoHead titulo={bimestreTitulo} />,
    className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo',
    onHeaderCell: () => ({ className: 'cal-notas-grid__th-bim cal-notas-grid__th-bim--activo' }),
    children:
      columnasEval.length > 0
        ? columnasEval
        : [
            {
              title: <span className="cal-notas-grid__th-sub-text">Sin evaluaciones</span>,
              key: 'sin-eval',
              width: 220,
              className: 'cal-notas-grid__col-sin-eval',
              onHeaderCell: thSub,
              render: () => <span className="cal-notas-grid__celda-vacia">—</span>,
            },
          ],
  };

  const columns = [
    {
      title: 'Nro',
      dataIndex: 'nro',
      key: 'nro',
      width: 52,
      fixed: 'left',
      align: 'center',
      className: 'cal-notas-grid__col-nro',
      onHeaderCell: thEst,
      onCell: () => ({ className: 'cal-notas-grid__col-nro' }),
    },
    {
      title: 'Estudiante',
      dataIndex: 'nombre',
      key: 'estudiante',
      width: 280,
      fixed: 'left',
      ellipsis: true,
      className: 'cal-notas-grid__col-estudiante',
      onHeaderCell: thEst,
      render: renderEstudiante,
    },
    grupoBimestre,
    {
      title: (
        <button
          type="button"
          className="cal-notas-grid__add-header cal-notas-grid__add-header--clickable"
          onClick={onAgregarEvaluacion}
          disabled={!onAgregarEvaluacion}
          aria-label="Agregar evaluación"
        >
          <PlusOutlined aria-hidden />
        </button>
      ),
      key: 'agregar',
      width: 56,
      fixed: 'right',
      align: 'center',
      className: 'cal-notas-grid__col-add',
      onHeaderCell: thEst,
      onCell: () => ({ className: 'cal-notas-grid__col-add' }),
      render: () => null,
    },
  ];

  return (
    <div className="cal-notas-grid-wrap">
      <Table
        className="cal-notas-grid cal-notas-grid--consolidado-style"
        columns={columns}
        dataSource={estudiantes.map((e) => ({ ...e, key: e.id }))}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: 'Sin estudiantes matriculados en el curso' }}
      />
    </div>
  );
};

export default NotasGrid;
