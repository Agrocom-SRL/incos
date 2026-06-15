/**
 * Molécula: título de panel de listado + acciones (tabs CFG, dashboard).
 */

import { Flex, Typography } from 'antd';
import { allColors, typography } from '@theme/tokens';

const ListPanelHeader = ({ title, actions }) => (
  <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
    <Typography.Title
      level={4}
      style={{
        color: allColors.colorPrimary,
        fontSize: `${typography.fontSizeHeading4}px`,
        fontWeight: typography.fontWeightStrong,
        margin: 0,
      }}
    >
      {title}
    </Typography.Title>
    {actions ? <div>{actions}</div> : null}
  </Flex>
);

export default ListPanelHeader;
