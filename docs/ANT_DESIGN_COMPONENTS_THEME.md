# Componentes de Ant Design v5 con Soporte de Tema Nativo

Esta lista incluye los componentes que pueden ser configurados en `ConfigProvider theme.components` de Ant Design v5.

## Componentes con Soporte de Tema (Configurables en componentConfig)

### Layout
- ✅ **Layout** - Configuración general del layout
- ✅ **Sider** - Panel lateral (sidebar)
- ✅ **Header** - Barra superior

### Navegación
- ✅ **Menu** - Menú de navegación
- ✅ **Tooltip** - Información emergente
- ✅ **Dropdown** - Menú desplegable
- ❌ **Breadcrumb** - NO tiene soporte nativo de tema (usar CSS con variables del tema)
- ✅ **Pagination** - Paginación
- ✅ **Steps** - Pasos de un proceso

### Botones
- ✅ **Button** - Botones estándar

### Formularios
- ✅ **Form** - Formularios
- ✅ **Input** - Campos de entrada de texto
- ✅ **InputNumber** - Campos numéricos
- ✅ **TextArea** - Áreas de texto
- ✅ **Select** - Selectores
- ✅ **Checkbox** - Casillas de verificación
- ✅ **Radio** - Botones de opción
- ✅ **Switch** - Interruptores
- ✅ **DatePicker** - Selector de fecha
- ✅ **TimePicker** - Selector de hora
- ✅ **Upload** - Carga de archivos
- ✅ **Slider** - Deslizadores
- ✅ **Rate** - Calificaciones

### Visualización de Datos
- ✅ **Table** - Tablas
- ✅ **Card** - Tarjetas
- ✅ **Avatar** - Avatares
- ✅ **Typography** - Tipografía
- ✅ **Badge** - Insignias
- ✅ **Tag** - Etiquetas
- ✅ **Empty** - Estado vacío
- ✅ **List** - Listas
- ✅ **Descriptions** - Descripciones
- ✅ **Timeline** - Líneas de tiempo
- ✅ **Tree** - Árboles
- ✅ **Calendar** - Calendarios
- ✅ **Image** - Imágenes
- ✅ **Statistic** - Estadísticas

### Retroalimentación
- ✅ **Alert** - Alertas
- ✅ **Modal** - Modales
- ✅ **Drawer** - Paneles laterales
- ✅ **Message** - Mensajes (via ConfigProvider)
- ✅ **Notification** - Notificaciones
- ✅ **Progress** - Barras de progreso
- ✅ **Skeleton** - Esqueletos de carga
- ✅ **Spin** - Indicadores de carga
- ✅ **Result** - Páginas de resultado
- ✅ **Popconfirm** - Confirmaciones emergentes
- ✅ **Popover** - Popovers

### Otros
- ✅ **Affix** - Elementos fijos
- ✅ **Anchor** - Anclajes
- ✅ **Carousel** - Carruseles
- ✅ **Collapse** - Paneles colapsables
- ✅ **Divider** - Divisores
- ✅ **Space** - Espaciado
- ✅ **Tabs** - Pestañas
- ✅ **Transfer** - Transferencia de elementos
- ✅ **TreeSelect** - Selector de árbol
- ✅ **Cascader** - Selector en cascada
- ✅ **Mentions** - Menciones

## Componentes SIN Soporte de Tema Nativo

Estos componentes NO pueden ser configurados en `theme.components` y deben usar CSS con variables del tema:

- ❌ **Breadcrumb** - Usar CSS con variables existentes (--color-text-tertiary, --color-verde-main, --font-size-sm, etc.)
- ❌ **BackTop** - Usar CSS
- ❌ **ConfigProvider** - Es el propio provider, no se configura
- ❌ **Divider** - Aunque existe, tiene configuración muy limitada

## Componentes Personalizados en este Proyecto

Estos NO son componentes nativos de Ant Design, son wrappers o componentes personalizados:

- ⚠️ **IconButton** - Wrapper personalizado sobre Button
- ⚠️ **SemanticButtons** - Configuración personalizada para variantes semánticas

## Notas Importantes

1. **Solo componentes con ✅** pueden ser configurados en `componentConfig` del tema
2. **Componentes con ❌** deben usar CSS con variables CSS del tema (definidas en `root.js`)
3. **Siempre verificar la documentación oficial** de Ant Design v5 para propiedades específicas de cada componente
4. **URL de documentación**: https://ant.design/docs/react/customize-theme#theme-parameters

## Componentes Actualmente Configurados en este Proyecto

Revisar: `frontend/src/infrastructure/config/theme/tokens/components/`

- Layout (Layout, Sider, Header)
- Navigation (Menu, Tooltip)
- Buttons (Button, IconButton*, SemanticButtons*)
- Content (Card, Typography, Avatar, Alert, Table)

*IconButton y SemanticButtons son personalizaciones, no componentes nativos de Ant Design.

