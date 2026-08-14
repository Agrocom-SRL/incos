/**
 * InscripcionesPlanSelectorSection — elección de plan de estudio en el paso
 * «Carrera y plan» del wizard de matrícula (plan matricula-wizard-rediseno §B3).
 *
 * Reglas (solo estudiantes nuevos en el sistema; la visibilidad la decide el
 * hook useMatriculaWizardContexto vía `mostrarSelector`):
 * - Más de un plan habilitado → radios con nombre + R.M. + pill Vigente
 *   (verde suave) / Anterior (gris, nunca rojo); por defecto el vigente.
 * - Un solo plan → pill informativa del plan resuelto (sin preguntar).
 *
 * Organismo del módulo: recibe props ya mapeadas, sin hooks de fetch.
 *
 * @param {Array}    planes         - Planes habilitados ({ id, nombre, resolucionMinisterial, vigente })
 * @param {boolean}  mostrarSelector - true = radios (planes.length > 1 y tipo con elección)
 * @param {Object|null} planResuelto - Plan resuelto por el contexto ({ id, nombre, vigente })
 * @param {number|null} value        - Plan elegido (default: el vigente/resuelto)
 * @param {Function} onChange       - (planId) => void
 * @param {boolean}  loading        - Cargando contexto de matrícula
 * @param {string|null} error       - Error del contexto (texto secundario, sin Alert)
 */

import { Flex, Radio, Spin, Typography } from 'antd';
import { StatusPill } from '@atoms';

const { Text } = Typography;

/** Pill de vigencia: verde suave para el vigente, gris para anteriores (nunca rojo). */
const VigenciaPill = ({ vigente }) => (
  <StatusPill
    label={vigente ? 'Vigente' : 'Anterior'}
    className={`cfg-materia-pill ${vigente ? 'cfg-materia-pill--success' : 'cfg-materia-pill--default'}`}
  />
);

const InscripcionesPlanSelectorSection = ({
  planes = [],
  mostrarSelector = false,
  planResuelto = null,
  value = null,
  onChange,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <Spin tip="Cargando planes de estudio…">
        <Flex className="carrera-card-picker__loading-nest" aria-hidden />
      </Spin>
    );
  }

  if (error) {
    return (
      <Text type="secondary">
        No se pudo cargar la información de planes de estudio. Puede continuar; se usará el plan
        vigente de la carrera.
      </Text>
    );
  }

  if (mostrarSelector && planes.length > 1) {
    const selectedValue = value ?? planes.find((p) => p.vigente)?.id ?? planResuelto?.id ?? null;
    return (
      <Flex vertical gap="small">
        <Text strong>Plan de estudio</Text>
        <Text type="secondary">
          La carrera tiene más de un plan habilitado en esta gestión. Elija el plan con el que se
          inscribirá el estudiante.
        </Text>
        <Radio.Group
          value={selectedValue ?? undefined}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <Flex vertical gap="small">
            {planes.map((plan) => (
              <Radio key={plan.id} value={plan.id}>
                <Flex align="center" gap="small" wrap>
                  <Text strong>{plan.nombre}</Text>
                  {plan.resolucionMinisterial ? (
                    <Text type="secondary">R.M. {plan.resolucionMinisterial}</Text>
                  ) : null}
                  <VigenciaPill vigente={!!plan.vigente} />
                </Flex>
              </Radio>
            ))}
          </Flex>
        </Radio.Group>
      </Flex>
    );
  }

  if (planResuelto?.nombre) {
    return (
      <Flex align="center" gap="small" wrap>
        <Text type="secondary">Plan de estudio:</Text>
        <StatusPill
          label={planResuelto.nombre}
          className="cfg-materia-pill cfg-materia-pill--primary"
        />
        <VigenciaPill vigente={!!planResuelto.vigente} />
      </Flex>
    );
  }

  return null;
};

export default InscripcionesPlanSelectorSection;
