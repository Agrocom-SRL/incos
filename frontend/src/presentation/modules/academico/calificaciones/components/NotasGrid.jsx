/**
 * Grilla estudiantes × evaluaciones del cuaderno.
 */

import { PlusOutlined } from '@ant-design/icons';
import { Button, Spin, Table } from 'antd';
import NotaCell from './NotaCell.jsx';

const NotasGrid = ({
  cursoId,
  estudiantes = [],
  evaluaciones = [],
  soloLectura = true,
  isRefetching = false,
}) => {
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
    ...evaluaciones.map((ev) => ({
      title: ev.nombre,
      key: ev.id,
      width: '18%',
      align: 'center',
      className: 'cal-notas-grid__col-eval',
      render: (_, row) => (
        <NotaCell
          cursoId={cursoId}
          estudianteId={row.id}
          evaluacionId={ev.id}
          valorInicial={row.notas?.[ev.id]}
          soloLectura={soloLectura}
        />
      ),
    })),
    {
      title: (
        <span className="cal-notas-grid__add-header">
          <PlusOutlined aria-hidden />
        </span>
      ),
      key: 'agregar',
      width: 72,
      align: 'center',
      className: 'cal-notas-grid__col-add',
      render: () => (
        <Button
          type="text"
          icon={<PlusOutlined />}
          disabled
          aria-label="Agregar evaluación"
          className="cal-notas-grid__add-btn"
        />
      ),
    },
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
