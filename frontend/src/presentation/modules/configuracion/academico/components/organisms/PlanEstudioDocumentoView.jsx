/**
 * Vista documento del plan vigente — estilo RM 0210/2023 con color de carrera.
 */

import { useMemo } from 'react';
import { Empty, Flex, Spin, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { formatResolucionLabel } from '@application-configuracion/academico/utils/planDocumentoTheme';
import {
  getMaxAsignaturasPorPeriodo,
  materiaNombreSizeClass,
  padAsignaturasPeriodo,
} from '@application-configuracion/academico/utils/planDocumentoRows';
import { PLAN_ASIGNATURAS_PERMISO } from '@application-configuracion/academico/config/planEstudioPermisos';

const { Text, Title } = Typography;

const PlanEstudioDocumentoView = ({
  carrera,
  planMeta,
  periodos = [],
  prereqSiglaByAsignaturaId,
  themeVars,
  loading = false,
  editable = false,
  onEditarPeriodo,
}) => {
  const maxFilas = useMemo(() => getMaxAsignaturasPorPeriodo(periodos), [periodos]);

  if (loading) {
    return (
      <Flex vertical align="center" justify="center" gap={12} className="cfg-plan-doc__loading">
        <Spin size="large" />
        <Text type="secondary">Cargando plan de estudios…</Text>
      </Flex>
    );
  }

  if (!planMeta) {
    return <Empty description="No hay plan de estudios vigente para esta carrera" />;
  }

  const resolucion = formatResolucionLabel(planMeta.resolucion_ministerial);
  const area = carrera?.areaFormacion ?? '—';
  const titulo = carrera?.tituloOtorgado ?? '—';

  const docStyle = {
    ...themeVars,
    '--cfg-plan-year-rows': String(Math.max(maxFilas, 1)),
  };

  const tableColGroup = (
    <colgroup>
      <col className="cfg-plan-doc__col-codigo" />
      <col className="cfg-plan-doc__col-nombre" />
      <col className="cfg-plan-doc__col-horas" />
      <col className="cfg-plan-doc__col-prereq" />
    </colgroup>
  );

  return (
    <div className="cfg-plan-doc" style={docStyle}>
      <header className="cfg-plan-doc__header">
        <div className="cfg-plan-doc__header-col cfg-plan-doc__header-col--meta">
          <p className="cfg-plan-doc__meta-band cfg-plan-doc__meta-band--1">{resolucion}</p>
          <p className="cfg-plan-doc__meta-band cfg-plan-doc__meta-band--2">
            <span className="cfg-plan-doc__meta-k">ÁREA DE FORMACIÓN:</span> {area}
          </p>
          <p className="cfg-plan-doc__meta-band cfg-plan-doc__meta-band--3">
            <span className="cfg-plan-doc__meta-k">CARGA HORARIA:</span>{' '}
            {planMeta.carga_horaria_total ?? '—'} Hrs.
          </p>
          <p className="cfg-plan-doc__meta-band cfg-plan-doc__meta-band--4">
            HORAS SEMANA: {planMeta.horas_semana ?? '—'} — HORAS MES: {planMeta.horas_mes ?? '—'} —
            HORAS AÑO: {planMeta.horas_anio ?? '—'}
          </p>
        </div>
        <div className="cfg-plan-doc__header-col cfg-plan-doc__header-col--carrera">
          <p className="cfg-plan-doc__carrera-label">CARRERA:</p>
          <Title level={3} className="cfg-plan-doc__carrera-nombre">
            {(carrera?.nombre || '—').toUpperCase()}
          </Title>
          <p className="cfg-plan-doc__titulo-label">DENOMINACIÓN DEL TÍTULO PROFESIONAL:</p>
          <p className="cfg-plan-doc__titulo-valor">{titulo}</p>
        </div>
      </header>

      {periodos.length === 0 ? (
        <Empty className="cfg-plan-doc__empty-matriz" description="Sin periodos en el plan" />
      ) : (
        <div className="cfg-plan-doc__years">
          {periodos.map((periodo) => {
            const asignaturas = padAsignaturasPeriodo(
              [...(periodo.asignaturas ?? [])].sort(
                (a, b) =>
                  (Number(a.orden_visualizacion) || 0) - (Number(b.orden_visualizacion) || 0),
              ),
              maxFilas,
            );

            return (
              <section
                key={periodo.id}
                className="cfg-plan-doc__year"
                style={{ '--cfg-plan-year-rows': String(Math.max(maxFilas, 1)) }}
              >
                <header className="cfg-plan-doc__year-head">
                  <span className="cfg-plan-doc__year-head-label">
                    {(periodo.nombre || `Año ${periodo.numero}`).toUpperCase()}
                  </span>
                  {editable ? (
                    <ActionButton
                      permiso={PLAN_ASIGNATURAS_PERMISO}
                      accion="EDITAR"
                      variant="alternative"
                      size="small"
                      className="cfg-plan-doc__year-head-edit"
                      icon={<EditOutlined />}
                      onClick={() => onEditarPeriodo?.(periodo.id)}
                      aria-label={`Editar asignaturas de ${periodo.nombre || `Año ${periodo.numero}`}`}
                    />
                  ) : null}
                </header>
                <div className="cfg-plan-doc__year-body">
                  <table className="cfg-plan-doc__table">
                    {tableColGroup}
                    <thead>
                      <tr>
                        <th>CÓDIGO</th>
                        <th>ASIGNATURAS</th>
                        <th>HORAS</th>
                        <th>PRE REQUISITO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asignaturas.map((asig) => {
                        const placeholder = Boolean(asig._placeholder);
                        const nombre = asig.materia?.nombre ?? '';
                        const nombreClass = materiaNombreSizeClass(nombre);
                        const prereq = placeholder
                          ? ''
                          : (prereqSiglaByAsignaturaId?.get(asig.id) ?? '—');

                        return (
                          <tr
                            key={asig.id}
                            className={placeholder ? 'cfg-plan-doc__row--placeholder' : undefined}
                          >
                            <td className="cfg-plan-doc__td-codigo">
                              {placeholder ? '' : (asig.materia?.sigla ?? '—')}
                            </td>
                            <td
                              className={`cfg-plan-doc__td-nombre${nombreClass ? ` ${nombreClass}` : ''}`}
                            >
                              {placeholder ? '' : nombre || '—'}
                            </td>
                            <td className="cfg-plan-doc__td-horas">
                              {placeholder ? '' : (asig.horas_semanales ?? '—')}
                            </td>
                            <td className="cfg-plan-doc__td-prereq">{prereq}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlanEstudioDocumentoView;
