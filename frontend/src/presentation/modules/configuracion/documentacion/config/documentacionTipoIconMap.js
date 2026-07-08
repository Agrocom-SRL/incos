/**
 * Mapeo del ENUM `tipo_documento` (9 valores, labels en
 * `@application-configuracion/documentacion/config/tipos.js`) a componentes de
 * `@ant-design/icons`. Mismo reparto de capas que actividades
 * (`actividadIconMap.js`): labels en application, íconos en presentation.
 * Lo consumen la columna "Tipo y descripción" del listado y la ficha de detalle.
 *
 * Fallback: cualquier valor no mapeado cae en `TagOutlined` (nunca ícono vacío).
 */
import {
  AuditOutlined,
  ContainerOutlined,
  FormOutlined,
  NodeIndexOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  SwapOutlined,
  TagOutlined,
} from '@ant-design/icons';

export const DOCUMENTACION_TIPO_ICON_FALLBACK = TagOutlined;

export const DOCUMENTACION_TIPO_ICON_MAP = {
  INSCRIPCION: FormOutlined,
  // Licencia = trámite con respaldo formal firmado: Audit es el más cercano en AntD.
  LICENCIA: AuditOutlined,
  // Sin BriefcaseOutlined en AntD: maletín/caja más cercano (mismo criterio que actividades).
  PASANTIA: ContainerOutlined,
  DESCUENTO: PercentageOutlined,
  TITULACION: SafetyCertificateOutlined,
  TRASPASO: SwapOutlined,
  // Transitabilidad = ruta entre planes/instituciones: NodeIndex (recorrido de nodos).
  TRANSITABILIDAD: NodeIndexOutlined,
  BECA: StarOutlined,
  OTRO: TagOutlined,
};

/**
 * @param {string} [tipoDocumento] - Valor del ENUM `tipo_documento`.
 * @returns {React.ComponentType} Componente de ícono AntD (nunca `undefined`).
 */
export const getDocumentacionTipoIcon = (tipoDocumento) =>
  DOCUMENTACION_TIPO_ICON_MAP[tipoDocumento] || DOCUMENTACION_TIPO_ICON_FALLBACK;
