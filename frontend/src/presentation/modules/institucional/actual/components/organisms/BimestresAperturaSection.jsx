/**
 * Organismo: apertura y cierre institucional de los bimestres de la gestión.
 *
 * Lista los bimestres (1..4) con su estado de calendario (por fecha) y su estado
 * institucional, y ofrece por cada uno las acciones Abrir / Validar cierre / Cerrar,
 * habilitadas según la fecha (mismo criterio que el backend). El panel de cursos
 * con notas faltantes se muestra bajo el bimestre validado/bloqueado.
 *
 * Recibe props ya mapeadas (no hace fetch): la lógica de habilitación vive en
 * `utils/bimestresApertura.js` y en `useControlBimestresState`.
 */

import { Alert, Card, Empty, Flex, Tag, Tooltip, Typography, theme } from 'antd';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { ActionButton } from '@atoms';
import { formatRangoFechas } from '@application-institucional/actual/utils/bimestresTimeline.js';

const { Text } = Typography;
const { useToken } = theme;

/** Etiqueta de estado institucional (token de estado AntD, sin hex). */
const INST_TAG = {
  CERRADO: { color: 'success', label: 'Cerrado' },
  EN_CURSO: { color: 'processing', label: 'En curso' },
  PENDIENTE: { color: 'default', label: 'Pendiente' },
};

/** Etiqueta de estado de calendario (por fecha). */
const CAL_TAG = {
  cerrado: { color: 'default', label: 'Fechas vencidas' },
  abierto: { color: 'blue', label: 'En fechas' },
  futuro: { color: 'default', label: 'Aún no inicia' },
};

const BimestreAperturaRow = ({
  bimestre,
  validacion,
  enAccion,
  cerrando,
  abriendo,
  onValidarCierre,
  onAbrir,
  onCerrar,
}) => {
  const { token } = useToken();
  const inst = INST_TAG[bimestre.institucional] ?? INST_TAG.PENDIENTE;
  const cal = CAL_TAG[bimestre.calendario] ?? CAL_TAG.futuro;
  const loading = enAccion === bimestre.numero;

  const abrirBtn = (
    <ActionButton
      permiso="institucional.gestion.actual"
      accion="EDITAR"
      icon={<UnlockOutlined />}
      disabled={!bimestre.abrirHabilitado || loading}
      loading={loading && abriendo}
      onClick={() => onAbrir(bimestre.numero)}
    >
      Abrir
    </ActionButton>
  );

  const cerrarBtn = (
    <ActionButton
      permiso="institucional.gestion.actual"
      accion="EDITAR"
      variant="primary"
      icon={<LockOutlined />}
      disabled={!bimestre.cerrarHabilitado || loading}
      loading={loading && cerrando}
      onClick={() => onCerrar(bimestre.numero)}
    >
      Cerrar
    </ActionButton>
  );

  return (
    <Flex
      vertical
      gap="small"
      style={{
        borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        paddingBottom: token.paddingSM,
      }}
    >
      <Flex align="flex-start" justify="space-between" gap="middle" wrap>
        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
          <Flex align="center" gap="small" wrap>
            <Text strong>{bimestre.nombre}</Text>
            <Tag color={inst.color}>{inst.label}</Tag>
            <Tag color={cal.color}>{cal.label}</Tag>
          </Flex>
          <Text type="secondary">
            {formatRangoFechas(bimestre.fechaInicio, bimestre.fechaFin)}
          </Text>
        </Flex>

        <Flex gap="small" wrap>
          <ActionButton
            permiso="institucional.gestion.actual"
            accion="EDITAR"
            disabled={loading}
            onClick={() => onValidarCierre(bimestre.numero)}
          >
            Validar cierre
          </ActionButton>

          {bimestre.abrirHabilitado ? (
            abrirBtn
          ) : (
            <Tooltip title={bimestre.abrirTooltip}>
              <span>{abrirBtn}</span>
            </Tooltip>
          )}

          {bimestre.cerrarHabilitado ? (
            cerrarBtn
          ) : (
            <Tooltip title={bimestre.cerrarTooltip}>
              <span>{cerrarBtn}</span>
            </Tooltip>
          )}
        </Flex>
      </Flex>

      {validacion ? (
        validacion.puedeCerrar ? (
          <Alert
            type="success"
            showIcon
            title="El bimestre puede cerrarse"
            description="No hay cursos con notas pendientes."
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            title={<strong>Notas pendientes impiden el cierre</strong>}
            description={
              <Flex vertical gap="small">
                {(validacion.cursosConNotasFaltantes || []).map((c) => (
                  <Text key={c.asignacionId}>
                    {c.materia} · {c.docente} ({c.paralelo}) — {c.cantidadFaltantes} sin nota
                  </Text>
                ))}
              </Flex>
            }
          />
        )
      ) : null}
    </Flex>
  );
};

/**
 * @param {Object[]} bimestres - filas de `buildBimestresApertura`.
 * @param {Object}   validacionPorBimestre - validación indexada por número.
 */
const BimestresAperturaSection = ({
  iniciada,
  bimestres = [],
  validacionPorBimestre = {},
  bimestreEnAccion,
  cerrando,
  abriendo,
  onValidarCierre,
  onAbrir,
  onCerrar,
}) => {
  const { token } = useToken();

  return (
    <Card title="Apertura y cierre de bimestres">
      <Flex vertical gap="middle">
        <Text type="secondary">
          {iniciada
            ? 'Abre un bimestre cuando llegue su fecha de inicio y ciérralo cuando venza su fecha de fin. El cierre valida que no haya notas pendientes.'
            : 'Disponible una vez iniciada la gestión académica.'}
        </Text>

        {bimestres.length === 0 ? (
          <Empty description="No hay bimestres configurados para la gestión vigente" />
        ) : (
          <Flex vertical gap={token.marginSM}>
            {bimestres.map((b) => (
              <BimestreAperturaRow
                key={b.numero}
                bimestre={b}
                validacion={validacionPorBimestre[b.numero] ?? null}
                enAccion={bimestreEnAccion}
                cerrando={cerrando}
                abriendo={abriendo}
                onValidarCierre={onValidarCierre}
                onAbrir={onAbrir}
                onCerrar={onCerrar}
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default BimestresAperturaSection;
