/**
 * Detalle de un plan: matriz y prerrequisitos (T8 / T9 conectan API y componentes).
 */

import { useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Alert, Card, Tabs } from 'antd';
import { PageTemplate } from '@templates';
import { PageHeader } from '@molecules';
import { useAuthContext } from '@application-auth';
import { Button } from '@atoms';
import { academicoTabPath } from '@application-configuracion/academico/config/paths';
import { TAB_PLANES } from '@configuracion/academico/config/academicoTabs';
import { allColors, componentConfig, shadows } from '@theme/tokens';

const TAB_MATRIZ = 'matriz';
const TAB_PRERREQUISITOS = 'prerrequisitos';

const sectionCardProps = {
  style: {
    borderRadius: `${componentConfig.Card.borderRadiusLG}px`,
    boxShadow: shadows.shadowElevation2,
    border: `1px solid ${allColors.colorBorder}`,
    backgroundColor: allColors.colorBgContainer,
  },
  styles: {
    body: { padding: `${componentConfig.Card.paddingLG}px` },
  },
};

const PlanDetallePage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermiso } = useAuthContext();

  const puedeMatriz = hasPermiso('configuracion.plan-estudio', 'DETALLE');
  const puedePrerrequisitos = hasPermiso('configuracion.plan-estudio.prerrequisitos', 'LISTAR')
    || hasPermiso('configuracion.plan-estudio.prerrequisitos', 'DETALLE');

  const tabItems = useMemo(() => {
    const items = [];
    if (puedeMatriz) {
      items.push({
        key: TAB_MATRIZ,
        label: 'Matriz del plan',
        children: (
          <Alert
            type="info"
            showIcon
            message="Matriz periodo × asignaturas"
            description={`Próximo paso (T8): consumir GET /planes-estudios/${planId}/matriz y edición inline de horas y modalidad.`}
          />
        ),
      });
    }
    if (puedePrerrequisitos) {
      items.push({
        key: TAB_PRERREQUISITOS,
        label: 'Prerrequisitos',
        children: (
          <Alert
            type="info"
            showIcon
            message="Editor de prerrequisitos"
            description="Próximo paso (T9): grafo o tabla de dependencias entre asignaturas del plan."
          />
        ),
      });
    }
    return items;
  }, [planId, puedeMatriz, puedePrerrequisitos]);

  const activeKey = useMemo(() => {
    const requested = searchParams.get('tab');
    const keys = tabItems.map((t) => t.key);
    if (requested && keys.includes(requested)) {
      return requested;
    }
    return keys[0] ?? TAB_MATRIZ;
  }, [searchParams, tabItems]);

  const onTabChange = (key) => {
    setSearchParams({ tab: key }, { replace: true });
  };

  if (!tabItems.length) {
    return (
      <PageTemplate sidebar={null}>
        <Alert type="warning" message="No tiene permisos para ver este plan." />
      </PageTemplate>
    );
  }

  return (
    <PageTemplate sidebar={null}>
      <PageHeader
        title={`Plan de estudio #${planId}`}
        breadcrumbItems={[
          { title: 'Inicio', href: '/' },
          { title: 'Configuración', href: '/configuracion' },
          { title: 'Académico', href: academicoTabPath(TAB_PLANES) },
          { title: 'Detalle' },
        ]}
        actions={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(academicoTabPath(TAB_PLANES))}
          >
            Volver al listado
          </Button>
        }
      />
      <Card {...sectionCardProps}>
        <Tabs activeKey={activeKey} items={tabItems} onChange={onTabChange} />
      </Card>
    </PageTemplate>
  );
};

export default PlanDetallePage;
