/**
 * Molécula: tarjeta destacada «Inscribir sin matrícula» (CAP). Interruptor con
 * texto explicativo, usado en el paso «Pago inicial» (alta) y en «Grupo y
 * requisitos» (edición, que no tiene paso de pago). Presentacional: recibe
 * todo por props.
 */

import { Flex, Switch, Typography } from 'antd';
import { allSpacing } from '@theme/tokens';

const ExonerarMatriculaCard = ({
  checked = false,
  onChange,
  montoMatriculaGrupo = 0,
  disabled = false,
}) => (
  <Flex
    align="flex-start"
    gap={allSpacing.marginSM}
    style={{
      padding: allSpacing.paddingMD,
      marginBottom: allSpacing.marginMD,
      border: `2px solid var(--ant-color-primary, #1677ff)`,
      borderRadius: 'var(--ant-border-radius-lg, 8px)',
      background: checked ? 'var(--ant-color-primary-bg, #e6f4ff)' : 'transparent',
    }}
  >
    <Switch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      aria-label="Inscribir sin matrícula"
    />
    <Flex vertical>
      <Typography.Text strong>Inscribir sin matrícula (exonerar)</Typography.Text>
      <Typography.Text type="secondary">
        {montoMatriculaGrupo > 0
          ? `No se cobrará la matrícula de Bs. ${montoMatriculaGrupo} de este grupo ni figurará como pago de matrícula. El costo del grupo no cambia para los demás. `
          : 'No se cobrará matrícula ni figurará como pago de matrícula. '}
        Si ya abonó una parte, la matrícula queda saldada con lo abonado.
      </Typography.Text>
    </Flex>
  </Flex>
);

export default ExonerarMatriculaCard;
