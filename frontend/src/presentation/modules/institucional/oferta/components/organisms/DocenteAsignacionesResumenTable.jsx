/**
 * Tabla «Horario específico por docente» — resumen de carga en la gestión vigente.
 */
import { Empty, Typography } from 'antd';
import { docenteCarreraTitleStyles } from '@docentes/components/atoms/DocenteColorBar';

const { Text } = Typography;

const DocenteAsignacionesResumenTable = ({ tabla, gestionLabel }) => {
  if (!tabla?.filas?.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Sin asignaciones vigentes en la gestión actual"
      />
    );
  }

  const { docenteNombre, perfil, numeroItem, filas, carreraGroups, totales } = tabla;
  const gestionTitulo = gestionLabel ? `GESTIÓN ${String(gestionLabel).toUpperCase()}` : 'GESTIÓN VIGENTE';

  const carreraSpanByRow = new Map();
  for (const g of carreraGroups) {
    carreraSpanByRow.set(g.startIdx, g);
  }

  return (
    <div className="docente-asignaciones-resumen">
      <div className="docente-asignaciones-resumen__banner">
        <Typography.Title level={4} className="docente-asignaciones-resumen__gestion">
          {gestionTitulo}
        </Typography.Title>
        <Text type="secondary" className="docente-asignaciones-resumen__subtitulo">
          Horario específico por docente
        </Text>
      </div>

      <div className="docente-asignaciones-resumen__table-wrap">
        <table className="docente-asignaciones-resumen__table">
          <thead>
            <tr>
              <th>Perfil</th>
              <th>Cédula</th>
              <th>Asignatura</th>
              <th>Código</th>
              <th>Carrera</th>
              <th>Año</th>
              <th>Horas semana</th>
              <th>Horas mes</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((row, idx) => {
              const carreraGroup = carreraSpanByRow.get(idx);
              return (
                <tr key={`${row.codigo}-${row.anio}-${idx}`}>
                  {idx === 0 ? (
                    <>
                      <td rowSpan={filas.length}>{perfil}</td>
                      <td rowSpan={filas.length}>{numeroItem}</td>
                    </>
                  ) : null}
                  <td>{row.asignatura}</td>
                  <td>{row.codigo}</td>
                  {carreraGroup ? (
                    <td
                      rowSpan={carreraGroup.rowSpan}
                      className="docente-asignaciones-resumen__carrera"
                      style={docenteCarreraTitleStyles(carreraGroup.carreraColorHex) ?? undefined}
                    >
                      {carreraGroup.carrera}
                    </td>
                  ) : null}
                  <td className="docente-asignaciones-resumen__anio">{row.anio}</td>
                  <td className="docente-asignaciones-resumen__num">{row.horasSemana}</td>
                  <td className="docente-asignaciones-resumen__num">{row.horasMes}</td>
                </tr>
              );
            })}
            <tr className="docente-asignaciones-resumen__totales">
              <td colSpan={6}>
                <Text strong>Totales</Text>
              </td>
              <td className="docente-asignaciones-resumen__num">
                <Text strong>{totales.horasSemana}</Text>
              </td>
              <td className="docente-asignaciones-resumen__num">
                <Text strong>{totales.horasMes}</Text>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocenteAsignacionesResumenTable;
