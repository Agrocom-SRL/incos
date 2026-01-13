/**
 * ListField - Componente compuesto para mostrar una lista de datos
 * 
 * Single Responsibility: Mostrar una lista de datos usando DataList
 * 
 * Clean Architecture:
 * - Presentation Layer: Componente que solo maneja UI
 * 
 * Atomic Design: Molécula
 * - Usa molécula (DataList) del sistema
 * - Compone elementos para mostrar listas de datos
 * 
 * SOLID Principles:
 * - Single Responsibility: Solo renderiza UI de una lista
 * - Open/Closed: Extensible mediante props
 * 
 * Flujo de datos:
 * 1. El enricher (Application Layer) agrega data, loading, emptyMessage al campo
 * 2. El campo ya tiene renderItem en su configuración (Presentation Layer)
 * 3. Este componente solo lee del campo y pasa directamente a DataList
 * 
 * @param {Object} props
 * @param {Object} props.field - Configuración del campo de tipo 'list' (ya enriquecido)
 * @param {Array} props.field.data - Array de items a mostrar (agregado por enricher)
 * @param {boolean} props.field.loading - Si está cargando (agregado por enricher)
 * @param {string} props.field.emptyMessage - Mensaje cuando no hay datos (agregado por enricher o config)
 * @param {Function} props.field.renderItem - Función para renderizar cada item, retorna props {avatar, title, caption} (desde config)
 * @param {Function} props.field.onSelect - Callback cuando se selecciona un item (opcional)
 * @param {string} props.field.loadingText - Texto a mostrar mientras carga (opcional)
 */

import { DataList } from '@molecules';

const ListField = ({ field }) => {
  // Leer datos del campo enriquecido (ya vienen de Application Layer)
  const items = field.data || field.students || field.items || [];
  const loading = field.loading || false;
  const emptyMessage = field.emptyMessage || 'No se encontraron datos';
  const loadingText = field.loadingText || 'Cargando...';
  const onSelect = field.onSelect || null;

  // Función renderItem del campo (si existe) o función por defecto
  // Si el campo tiene renderItem, usarla; si no, usar una función por defecto
  const renderItem = field.renderItem || ((item) => {
    // Función por defecto: retornar props básicas para ListItem
    return {
      title: typeof item === 'string' ? item : JSON.stringify(item),
    };
  });

  return (
    <DataList
      data={items}
      loading={loading}
      emptyMessage={emptyMessage}
      renderItem={renderItem}
      onSelect={onSelect}
      loadingText={loadingText}
    />
  );
};

export default ListField;
