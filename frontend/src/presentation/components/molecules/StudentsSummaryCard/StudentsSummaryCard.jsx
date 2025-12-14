/**
 * StudentsSummaryCard - Card con resumen de estudiantes
 * Similar a OrdersSummaryCard pero para estudiantes
 */

import { Card, Typography, Flex } from 'antd';
import { allColors } from '@theme/colors';
import { allSpacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { gradients } from '@theme/gradients';
import { shadows } from '@theme/shadows';
import { componentConfig } from '@theme/components';

const { Title, Text } = Typography;

const StudentsSummaryCard = ({ 
  todayStudents = 0,
  monthStudents = 0,
  totalStudents = 0
}) => {
  return (
    <Card
      style={{
        background: gradients.gradientSuccess,
        borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
        boxShadow: shadows.shadowPrimary,
        border: 'none',
        padding: `${componentConfig.Card.paddingLG}px`,
        minHeight: '200px',
      }}
      bodyStyle={{
        padding: 0,
      }}
    >
      <Flex vertical gap={allSpacing.marginLG} style={{ height: '100%' }}>
        <Title
          level={4}
          style={{
            color: allColors.colorTextOnDark,
            fontSize: `${typography.fontSizeHeading4}px`,
            fontWeight: typography.fontWeightStrong,
            margin: 0,
            lineHeight: typography.lineHeightHeading4,
          }}
        >
          Resumen
        </Title>
        
        <Flex vertical gap={allSpacing.marginMD}>
          <Flex vertical>
            <Text
              style={{
                color: allColors.colorTextSecondaryOnDark,
                fontSize: `${typography.fontSizeSM}px`,
                lineHeight: typography.lineHeightSM,
              }}
            >
              Hoy
            </Text>
            <Title
              level={3}
              style={{
                color: allColors.colorTextOnDark,
                fontSize: `${typography.fontSizeHeading3}px`,
                fontWeight: typography.fontWeightStrong,
                margin: 0,
                lineHeight: typography.lineHeightHeading3,
              }}
            >
              {todayStudents} estudiantes
            </Title>
          </Flex>
          
          <Flex vertical>
            <Text
              style={{
                color: allColors.colorTextSecondaryOnDark,
                fontSize: `${typography.fontSizeSM}px`,
                lineHeight: typography.lineHeightSM,
              }}
            >
              Este mes
            </Text>
            <Title
              level={3}
              style={{
                color: allColors.colorTextOnDark,
                fontSize: `${typography.fontSizeHeading3}px`,
                fontWeight: typography.fontWeightStrong,
                margin: 0,
                lineHeight: typography.lineHeightHeading3,
              }}
            >
              {monthStudents} estudiantes
            </Title>
          </Flex>

          <Flex vertical>
            <Text
              style={{
                color: allColors.colorTextSecondaryOnDark,
                fontSize: `${typography.fontSizeSM}px`,
                lineHeight: typography.lineHeightSM,
              }}
            >
              Total
            </Text>
            <Title
              level={4}
              style={{
                color: allColors.colorTextOnDark,
                fontSize: `${typography.fontSizeHeading4}px`,
                fontWeight: typography.fontWeightStrong,
                margin: 0,
                lineHeight: typography.lineHeightHeading4,
              }}
            >
              {totalStudents} estudiantes
            </Title>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
};

export default StudentsSummaryCard;