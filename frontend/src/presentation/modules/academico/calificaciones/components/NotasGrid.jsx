/**
 * Grilla estudiantes × evaluaciones del cuaderno.
 */

import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Spin, Table } from 'antd';
import NotaCell from './NotaCell.jsx';

const NotasGrid = ({
  cursoId,
  estudiantes = [],
  evaluaciones = [],
  soloLectura = true,
  isRefetching = false,
  onAgregarEvaluacion,
  onEditarEvaluacion,
  enteringColumnIds = [],
  removingColumnId = null,
}) => {
  const mostrarColumnaAgregar = !soloLectura;

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
          {!soloLectura ? (
            <EditOutlined className="cal-notas-grid__col-edit-icon" aria-hidden />
          ) : null}
        </button>
      ),
      key: ev.id,
      width: '18%',
      align: 'center',
      className: colClass,
      onHeaderCell: () => ({ className: colClass }),
      onCell: () => ({ className: colClass }),
      render: (_, row) => (
        <NotaCell
          cursoId={cursoId}
          estudianteId={row.id}
          evaluacionId={ev.id}
          valorInicial={row.notas?.[ev.id]}
          soloLectura={soloLectura}
        />
      ),
    };
  });

  const columns = [
    {
      title: 'Estudiante',
      dataIndex: 'nombre',
      key: 'nombre',
      width: '38%',
      ellipsis: true,
      className: 'cal-notas-grid__col-estudiante',
      render: (nombre) => (
        <span className="cal-notas-grid__estudiante">
          <span className="cal-notas-grid__margen" aria-hidden />
          <span className="cal-notas-grid__nombre">{nombre}</span>
        </span>
      ),
    },
    ...columnasEval,
    ...(mostrarColumnaAgregar
      ? [
          {
            title: (
              <button
                type="button"
                className="cal-notas-grid__add-header cal-notas-grid__add-header--clickable"
                onClick={onAgregarEvaluacion}
                aria-label="Agregar evaluación"
              >
                <PlusOutlined aria-hidden />
              </button>
            ),
            key: 'agregar',
            width: 72,
            align: 'center',
            className: 'cal-notas-grid__col-add',
            render: () => null,
          },
        ]
      : []),
  ];

  return (
    <div className={`cal-notas-grid-wrap${isRefetching ? ' cal-notas-grid-wrap--loading' : ''}`}>
      {isRefetching ? (
        <div className="cal-notas-grid__overlay" aria-live="polite">
          <Spin />
        </div>
      ) : null}
      <Table
        className="cal-notas-grid"
        columns={columns}
        dataSource={estudiantes.map((e) => ({ ...e, key: e.id }))}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default NotasGrid;
