// components/molecules/WizardActions.jsx
/**
 * WizardActions: Molécula para botones de navegación de wizard
 * 
 * Single Responsibility: Renderizar botones de navegación (Anterior, Siguiente, Finalizar, Guardar)
 * 
 * Atomic Design: Usa átomos (Button) y componentes nativos de Ant Design (Space)
 */

import { Space } from 'antd';
import { Button } from '@atoms';

const WizardActions = ({
  currentStep = 0,
  totalSteps = 0,
  viewMode = false,
  loading = false,
  onPrev,
  onNext,
  onFinish,
  onSave,
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  finishLabel = 'Finalizar Registro',
  saveLabel = 'Guardar y Continuar Después',
  className = '',
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <Space 
      className={`wizard-actions ${className}`.trim()}
    >
      {/* Botón Anterior - solo si no es el primer paso */}
      {!isFirstStep && (
        <Button onClick={onPrev} size="large">
          {prevLabel}
        </Button>
      )}

      {/* Botón Guardar y Continuar Después - solo si no es viewMode */}
      {!viewMode && onSave && (
        <Button 
          onClick={onSave} 
          size="large"
          loading={loading}
        >
          {saveLabel}
        </Button>
      )}

      {/* Botón Siguiente o Finalizar */}
      {!isLastStep ? (
        <Button 
          variant="primary"
          onClick={onNext} 
          size="large"
        >
          {nextLabel}
        </Button>
      ) : (
        !viewMode && onFinish && (
          <Button 
            variant="primary"
            onClick={onFinish} 
            size="large"
            loading={loading}
          >
            {finishLabel}
          </Button>
        )
      )}
    </Space>
  );
};

export default WizardActions;
