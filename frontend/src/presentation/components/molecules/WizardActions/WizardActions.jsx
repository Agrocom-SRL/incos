/**
 * WizardActions: Molécula para botones de navegación de wizard
 * 
 * Single Responsibility: Renderizar botones de navegación (Anterior, Siguiente, Finalizar, Guardar)
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * - Toda la lógica está en hooks especializados
 * 
 * Atomic Design: Molécula
 * - Usa átomos (Button) y componentes nativos de Ant Design (Space)
 * - Usa hooks personalizados para separar lógica de presentación
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI, la lógica está en hooks
 * - Open/Closed: Extensible agregando nuevos botones sin modificar código existente
 * - Dependency Inversion: Depende de hooks (abstracciones)
 */

import { Space } from 'antd';
import { Button } from '@atoms';
import { useWizardActions } from './hooks/useWizardActions';

const WizardActions = ({
  currentStep = 0,
  totalSteps = 0,
  viewMode = false,
  loading = false,
  onPrev,
  onNext,
  onFinish,
  onSave,
  showSaveButton = true,
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  finishLabel = 'Finalizar Registro',
  saveLabel = 'Guardar y Continuar Después',
  className = '',
}) => {
  // Hook que compone toda la lógica de acciones del wizard
  const {
    showPrev,
    showSave,
    showNext,
    showFinish,
  } = useWizardActions({
    currentStep,
    totalSteps,
    viewMode,
    onSave,
    onFinish,
    showSaveButton,
  });

  return (
    <Space 
      className={`wizard-actions ${className}`.trim()}
    >
      {/* Botón Anterior - htmlType="button" evita submit del Form al hacer clic o Enter (átomo Button usa htmlType para tipo HTML) */}
      {showPrev && (
        <Button htmlType="button" onClick={onPrev} size="large">
          {prevLabel}
        </Button>
      )}

      {/* Botón Guardar y Continuar Después (no se muestra en el último paso; solo Finalizar) */}
      {showSave && (
        <Button 
          htmlType="button"
          onClick={() => onSave?.(currentStep + 1)} 
          size="large"
          loading={loading}
        >
          {saveLabel}
        </Button>
      )}

      {/* Botón Siguiente */}
      {showNext && (
        <Button 
          htmlType="button"
          variant="primary"
          onClick={onNext} 
          size="large"
        >
          {nextLabel}
        </Button>
      )}

      {/* Botón Finalizar (solo en el último paso) */}
      {showFinish && (
        <Button 
          htmlType="button"
          variant="primary"
          onClick={() => onFinish?.(currentStep + 1)} 
          size="large"
          loading={loading}
        >
          {finishLabel}
        </Button>
      )}
    </Space>
  );
};

export default WizardActions;

