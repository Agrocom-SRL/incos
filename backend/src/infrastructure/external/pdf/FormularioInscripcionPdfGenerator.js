/**
 * FormularioInscripcionPdfGenerator
 *
 * Servicio de infraestructura que generará el FORMULARIO DE INSCRIPCIÓN a partir de una plantilla PDF.
 * Esqueleto base para la migración desde BoletaInscripcionWordGenerator (Word + PizZip).
 *
 * Tecnología: pdf-lib (misma que ActaCompromisoPdfGenerator). Usa IncosPDFLibBase.
 *
 * Estructura (título, subtítulo, secciones):
 * - Título: FORMULARIO DE INSCRIPCIÓN
 * - Subtítulo: GESTIÓN {año} (gestión desde caso de uso / BD)
 * - I. DATOS PERSONALES
 * - II. DATOS ACADÉMICOS
 * - III. DOCUMENTOS RECEPCIONADOS
 *
 * El contenido de cada sección se añadirá durante la migración (datos desde options.student, etc.).
 *
 * @module FormularioInscripcionPdfGenerator
 */

import { IncosPDFLibBase } from './IncosPDFLibBase.js';
import { IncosPDFBase } from './IncosPDFBase.js';

export class FormularioInscripcionPdfGenerator extends IncosPDFLibBase {
    /**
     * @param {Object} params - Dependencias inyectadas
     * @param {ILogger} [params.logger] - Logger para registro de eventos
     */
    constructor({ logger } = {}) {
        super({ logger });
    }

    /**
     * Genera un PDF de Formulario de Inscripción a partir de la plantilla.
     * Retorna Buffer. El guardado en uploads lo hace el caso de uso / almacenamiento.
     *
     * @param {Object} [options] - Opciones (estructura análoga a Acta: gestion, student, fechaActual)
     * @param {string|number} [options.gestion] - Año de gestión (desde BD, caso de uso)
     * @param {Object} [options.student] - Datos del estudiante (vista_estudiante_datos_personales normalizados)
     * @param {string} [options.fechaActual] - Fecha actual para el documento
     * @returns {Promise<Buffer>} Contenido del PDF generado
     */
    async generate(options = {}) {
        try {
            const pdfDoc = await this._loadTemplate('Plantilla.pdf');
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            this._initializeDocumentState(pdfDoc, firstPage, true);

            await this._buildHeader(options);
            await this._buildDatosPersonales(options);
            await this._buildDatosAcademicos(options);
            await this._buildDocumentosRecepcionados(options);
            await this._buildFirma(options);

            const pdfBuffer = await this._saveDocument(pdfDoc);

            if (this.logger) {
                this.logger.info('[FormularioInscripcionPdfGenerator] Formulario de inscripción PDF generado (buffer)', {
                    size: pdfBuffer.length,
                });
            }

            return pdfBuffer;
        } catch (error) {
            if (this.logger) {
                this.logger.error('[FormularioInscripcionPdfGenerator] Error al generar formulario de inscripción PDF', {
                    error: error.message,
                    stack: error.stack,
                });
            }
            throw error;
        }
    }

    // ============================================
    // MÉTODOS DE CONSTRUCCIÓN (como ActaCompromiso: título, subtítulo, secciones)
    // ============================================

    /**
     * Construye el encabezado del documento (título y subtítulo).
     * Gestión desde caso de uso (BD). Acentos: GESTIÓN.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildHeader(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const codigo = (options.student?.codigoEstudiante ?? options.student?.codigo_estudiante ?? '').toString().trim();
        await this._drawRegistrationBox(T.REGISTRO_HEADER_LABEL, codigo || '—');

        await this._addInstitutionalHeader(IncosPDFBase.INSTITUTIONAL_HEADER_LINES);
        await this._addDocumentTitle(IncosPDFBase.INSTITUTE.name, false);
        await this._addDocumentTitle(IncosPDFBase.DOCUMENT_TITLES.FORMULARIO_INSCRIPCION);

        if (options.gestion) {
            const gestionYear = String(options.gestion);
            await this._addSubtitle(`GESTIÓN ${gestionYear}`);
        }
    }

    /**
     * I. DATOS PERSONALES.
     * Orquesta dos bloques visuales: identificación personal y lugar/fecha/domicilio.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _buildDatosPersonales(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DATOS_PERSONALES);

        // Bloque 1: Identificación personal (nombres, grid CI/género/etc., detalle discapacidad)
        await this._buildIdentificacionPersonal(options);

        // Bloque 2: Lugar y Fecha de Nacimiento, Domicilio, Idioma de origen
        await this._buildLugarFechaNacimientoYDomicilio(options);

        // Bloque 3: Contacto de emergencia (apoderado)
        await this._buildContactoEmergencia(options);

        this._addSpace();
    }

    /**
     * Bloque 1 de DATOS PERSONALES: Identificación personal.
     * Orquesta los 3 sub-bloques: datos básicos, discapacidad, y datos de origen.
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildIdentificacionPersonal(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        // Campo de nombres y apellidos con recuadro (valor en bold)
        const nombresVal = [s.apellidoPaterno, s.apellidoMaterno, s.nombres]
            .filter(Boolean)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();
        await this._addBoxedField(T.NOMBRES_APELLIDOS_LABEL, nombresVal || '—', true);

        // Bloque 1: Datos básicos (CI, Género, Celular, Correo, Estado civil, Grupo sanguíneo)
        await this._buildDatosBasicosIdentificacion(options);

        // Bloque 2: Discapacidad y detalle
        await this._buildDiscapacidadIdentificacion(options);

        // Bloque 3: Edad, Fecha de nacimiento, Nacionalidad, Idioma principal
        await this._buildDatosOrigenIdentificacion(options);
    }

    /**
     * Bloque 1.1: Datos básicos de identificación.
     * Grid 2 columnas: CI, Celular, Estado civil (izq) | Género, Correo, Tipo sangre (der)
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildDatosBasicosIdentificacion(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: C.I., Celular, Estado civil
        const ci = (s.ci ?? '').toString().trim();
        const exp = (s.expedicion ?? '').toString().trim();
        if (ci || exp) {
            const ciVal = [ci, exp].filter(Boolean).join(' ').trim();
            leftColumnItems.push({ label: T.CI_LABEL, value: ciVal || '—' });
        }
        const celularVal = (s.celular ?? '').toString().trim();
        if (celularVal) {
            leftColumnItems.push({ label: T.CELULAR_LABEL, value: celularVal });
        }
        if (s.estadoCivilNombre) {
            leftColumnItems.push({ label: T.ESTADO_CIVIL_LABEL, value: s.estadoCivilNombre });
        }

        // Columna derecha: Género, Correo, Tipo sangre
        if (s.genero) {
            const g = String(s.genero).toLowerCase();
            const generoVal = g === 'masculino' ? 'Masculino' : g === 'femenino' ? 'Femenino' : g === 'otro' ? 'Otro' : s.genero;
            rightColumnItems.push({ label: T.GENERO_LABEL, value: generoVal });
        }
        const emailVal = (s.emailPersonal ?? '').toString().trim();
        if (emailVal) {
            rightColumnItems.push({ label: T.EMAIL_LABEL, value: emailVal });
        }
        if (s.tipoSangre) {
            rightColumnItems.push({ label: T.TIPO_SANGRE_LABEL, value: s.tipoSangre });
        }

        // Dibujar grid de 2 columnas (35% izquierda, 65% derecha)
        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * Bloque 1.2: Discapacidad y detalle.
     * Grid 2 columnas: Discapacidad (izq) | Detalle discapacidad (der)
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildDiscapacidadIdentificacion(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};

        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: Discapacidad
        if (s.tieneDiscapacidad !== undefined && s.tieneDiscapacidad !== null) {
            const disc = s.tieneDiscapacidad === true || s.tieneDiscapacidad === 1 ? 'Sí' : 'No';
            leftColumnItems.push({ label: T.DISCAPACIDAD_LABEL, value: disc });
        }

        // Columna derecha: Detalle discapacidad (solo TIPO y GRADO)
        const tieneDisc = s.tieneDiscapacidad === true || s.tieneDiscapacidad === 1;
        const list = Array.isArray(s.discapacidades) ? s.discapacidades : [];
        if (tieneDisc && list.length > 0) {
            const detalleVal = this._buildDetalleDiscapacidad(list);
            if (detalleVal) {
                rightColumnItems.push({ label: T.DETALLE_DISCAPACIDAD_LABEL, value: detalleVal });
            }
        }

        // Dibujar grid de 2 columnas (35% izquierda, 65% derecha)
        // Siempre respeta el porcentaje incluso si una columna está vacía (comportamiento por defecto)
        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * Bloque 1.3: Datos de origen (edad, fecha nacimiento, nacionalidad, idioma).
     * Grid 2 columnas: Edad, Nacionalidad (izq) | Fecha de nacimiento, Idioma principal (der)
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildDatosOrigenIdentificacion(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};
        const origenes = Array.isArray(s.origenes) ? s.origenes : [];
        const principal = origenes.find((o) => o.es_principal === 1 || o.es_principal === true) || origenes[0];

        // Preparar datos para nacionalidad e idioma
        const tipoOrigenRaw = (principal?.tipo_origen ?? principal?.tipoOrigen ?? '').toString().trim().toUpperCase();
        const nacionalidad = tipoOrigenRaw === 'BOLIVIANA' ? 'Boliviana'
            : tipoOrigenRaw === 'EXTRANJERA' ? 'Extranjera'
                : tipoOrigenRaw === 'DOBLE_NACIONALIDAD' ? 'Doble Nacionalidad'
                    : tipoOrigenRaw || '—';
        const idiomaPrincipal = (principal?.idioma_materno_nombre ?? principal?.idiomaMaternoNombre ?? '').toString().trim();

        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: Edad, Nacionalidad
        const edad = (s.edad ?? '').toString().trim();
        if (edad && edad !== '—') {
            leftColumnItems.push({ label: T.EDAD_LABEL, value: `${edad} años` });
        }
        if (nacionalidad && nacionalidad !== '—') {
            leftColumnItems.push({ label: T.NACIONALIDAD_LABEL, value: nacionalidad });
        }

        // Columna derecha: Fecha de nacimiento, Idioma principal
        const fechaLiteral = (s.fechaNacimientoLiteral ?? '').toString().trim();
        if (fechaLiteral && fechaLiteral !== '—') {
            rightColumnItems.push({ label: T.FECHA_NACIMIENTO_LABEL, value: fechaLiteral });
        }
        if (idiomaPrincipal) {
            rightColumnItems.push({ label: T.IDIOMA_PRINCIPAL_LABEL, value: idiomaPrincipal });
        }

        // Dibujar grid de 2 columnas (35% izquierda, 65% derecha)
        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * Construye el texto de detalle desde discapacidades (vista_base_estudiante_discapacidades).
     * Solo incluye TIPO y GRADO (sin DESCRIPCION ni CAUSA).
     *
     * @private
     * @param {Array<Object>} discapacidades - Items de la vista (snake_case o camelCase)
     * @returns {string}
     */
    _buildDetalleDiscapacidad(discapacidades) {
        const sep = ' — ';
        const segmentSep = '. ';

        const parts = discapacidades.map((d) => {
            const tipo = (d.tipo_discapacidad_nombre ?? d.tipoDiscapacidadNombre ?? '').toString().trim();
            const grado = (d.grado_discapacidad ?? d.gradoDiscapacidad ?? '').toString().trim();

            const segments = [];
            if (tipo) segments.push(`Tipo: ${tipo}`);
            if (grado) segments.push(`Grado: ${grado}`);

            return segments.join(segmentSep);
        }).filter((p) => p.length > 0);

        return parts.join(sep);
    }

    /**
     * Lugar y Fecha de Nacimiento, Domicilio, Idioma de origen.
     * Datos desde origenes (vista_base_estudiante_origenes + idiomas), residencia (vista_base_estudiante_residencia)
     * y student (fechaNacimientoLiteral, edad calculados en caso de uso).
     *
     * Dirección según nacionalidad:
     * - Boliviana: localidad-municipio, provincia, departamento
     * - Extranjera: ciudad, país
     * - Doble nacionalidad: usa origen principal (es_principal)
     *
     * Grid 2 columnas: fecha de nacimiento (literal), edad, nacionalidad, idioma principal, idioma secundario, teléfono fijo (solo si existen).
     * Domicilio: dirección/zona primero, luego municipio, provincia, departamento.
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student con fechaNacimientoLiteral, edad)
     * @returns {Promise<void>}
     */
    async _buildLugarFechaNacimientoYDomicilio(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};
        const origenes = Array.isArray(s.origenes) ? s.origenes : [];
        const principal = origenes.find((o) => o.es_principal === 1 || o.es_principal === true) || origenes[0];

        // Construir dirección según nacionalidad (boliviana vs extranjera)
        const tipoOrigen = (principal?.tipo_origen ?? '').toString().toUpperCase();
        const esBoliviana = tipoOrigen === 'BOLIVIANA' || tipoOrigen === 'BOLIVIANO';
        let lugarVal = '—';

        if (principal) {
            if (esBoliviana) {
                // Boliviana: localidad-municipio, provincia, departamento
                const lugarParts = [
                    principal?.ciudad ?? principal?.ciudad_nacimiento_raw,
                    principal?.nacimiento_municipio_nombre,
                    principal?.nacimiento_provincia_nombre,
                    principal?.nacimiento_departamento_nombre,
                ].filter(Boolean);
                if (lugarParts.length > 0) {
                    // Si hay ciudad y municipio, unir con guion; luego provincia y departamento
                    const ciudadMunicipio = [lugarParts[0], lugarParts[1]].filter(Boolean).join('-');
                    const resto = lugarParts.slice(2).filter(Boolean);
                    lugarVal = [ciudadMunicipio, ...resto].filter(Boolean).join(', ');
                }
            } else {
                // Extranjera: ciudad, país
                const ciudad = (principal?.ciudad ?? principal?.ciudad_nacimiento_raw ?? '').toString().trim();
                const pais = (principal?.pais_nombre ?? principal?.paisNombre ?? '').toString().trim();
                const extParts = [ciudad, pais].filter(Boolean);
                lugarVal = extParts.length > 0 ? extParts.join(', ') : '—';
            }
        }

        // Campos con recuadro en una sola columna (ocupa todo el ancho)
        const singleColumnItems = [];

        // Lugar de nacimiento
        if (lugarVal && lugarVal !== '—') {
            singleColumnItems.push({ label: T.LUGAR_NACIMIENTO_LABEL, value: lugarVal });
        }

        // Domicilio: dirección/zona primero, luego municipio, provincia, departamento
        const domicilioParts = [];
        const direccion = (s.direccion ?? '').toString().trim();
        const zona = (s.zona ?? '').toString().trim();
        if (direccion) domicilioParts.push(direccion);
        if (zona) domicilioParts.push(zona);
        const residenciaMunicipio = s.residenciaMunicipioNombre ?? s.residencia_municipio_nombre;
        const residenciaProvincia = s.residenciaProvinciaNombre ?? s.residencia_provincia_nombre;
        const residenciaDepartamento = s.residenciaDepartamentoNombre ?? s.residencia_departamento_nombre;
        if (residenciaMunicipio) domicilioParts.push(residenciaMunicipio);
        if (residenciaProvincia) domicilioParts.push(residenciaProvincia);
        if (residenciaDepartamento) domicilioParts.push(residenciaDepartamento);

        const domicilioVal = domicilioParts.length > 0 ? domicilioParts.join(', ') : '—';
        if (domicilioVal && domicilioVal !== '—') {
            singleColumnItems.push({ label: T.DOMICILIO_LABEL, value: domicilioVal });
        }

        // Dibujar campos en una sola columna (ocupa todo el ancho)
        // leftColumnWidthPercent=100 indica que es una sola columna que ocupa el 100% del ancho
        if (singleColumnItems.length > 0) {
            await this._addBoxedFieldGrid(singleColumnItems, [], 100, 90);
        }
    }

    /**
     * Bloque 3 de DATOS PERSONALES: Contacto de emergencia (apoderado).
     * Grid de 2 columnas: Columna izquierda (Parentesco, Celular), Columna derecha (Nombre completo).
     *
     * @private
     * @param {Object} options - Opciones de generación (options.student)
     * @returns {Promise<void>}
     */
    async _buildContactoEmergencia(options) {
        const T = IncosPDFBase.FORMULARIO_TEXTS;
        const s = options.student || {};
        const apoderados = Array.isArray(s.apoderados) ? s.apoderados : [];

        // Obtener el primer apoderado (o el principal si existe)
        const apoderado = apoderados.find((a) => a.es_principal === 1 || a.es_principal === true) || apoderados[0];

        if (!apoderado) {
            // Si no hay apoderado, no mostrar nada
            return;
        }

        // Preparar datos para grid de 2 columnas
        const leftColumnItems = [];
        const rightColumnItems = [];

        // Columna izquierda: Parentesco y Celular
        const parentesco = (apoderado.tipo_parentesco_nombre ?? apoderado.tipoParentescoNombre ?? '').toString().trim();
        if (parentesco) {
            leftColumnItems.push({ label: T.PARENTESCO_LABEL, value: parentesco });
        }

        const celular = (apoderado.celular_1 ?? apoderado.celular1 ?? '').toString().trim();
        if (celular) {
            leftColumnItems.push({ label: T.CELULAR_CONTACTO_LABEL, value: celular });
        }

        // Columna derecha: Nombre completo (nombres + apellidos)
        const nombres = (apoderado.apoderado_nombres ?? apoderado.apoderadoNombres ?? '').toString().trim();
        const apellidos = (apoderado.apoderado_apellidos ?? apoderado.apoderadoApellidos ?? '').toString().trim();
        const nombreCompleto = [nombres, apellidos].filter(Boolean).join(' ').trim();
        if (nombreCompleto) {
            rightColumnItems.push({ label: T.DATOS_REFERENCIA_LABEL, value: nombreCompleto });
        }

        // Dibujar grid de 2 columnas solo si hay datos
        if (leftColumnItems.length > 0 || rightColumnItems.length > 0) {
            await this._addBoxedFieldGrid(leftColumnItems, rightColumnItems, 35);
        }
    }

    /**
     * II. DATOS ACADÉMICOS.
     * Muestra carrera y periodo en grid de 2 columnas, y materias como viñetas.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @param {Object} [options.academicData] - Datos académicos (carreraNombre, carreraCodigo, estadoAcademico)
     * @param {Object} [options.enrollmentData] - Datos de inscripción (periodoNombre, materias[])
     * @returns {Promise<void>}
     */
    async _buildDatosAcademicos(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DATOS_ACADEMICOS);

        const academicData = options.academicData || {};
        const enrollmentData = options.enrollmentData || {};

        // Preparar datos para columna izquierda (campos con recuadro)
        const leftColumnItems = [];

        // Carrera
        const carreraNombre = academicData.carreraNombre || academicData.carrera_nombre;
        if (carreraNombre) {
            leftColumnItems.push({
                label: 'Carrera:',
                value: carreraNombre,
            });
        }

        // Año académico (ya viene con formato correcto: "Primer Año", "Segundo Año", etc.)
        const periodoNombre = enrollmentData.periodoNombre || enrollmentData.periodo_nombre || '';
        if (periodoNombre) {
            leftColumnItems.push({
                label: 'Año:',
                value: periodoNombre,
            });
        }

        // Paralelo: "paralelo_nombre - paralelo_turno" (solo primera palabra en mayúscula, resto en minúscula)
        const paraleloNombre = enrollmentData.paraleloNombre || enrollmentData.paralelo_nombre || '';
        if (paraleloNombre.length > 0) {
            // Convertir a formato: primera palabra mayúscula, resto minúscula
            const palabras = paraleloNombre.toLowerCase().split(' ');
            const primeraPalabra = palabras[0] ? palabras[0].charAt(0).toUpperCase() + palabras[0].slice(1) : '';
            const restoPalabras = palabras.slice(1).join(' ');
            const paraleloFormateado = restoPalabras ? `${primeraPalabra} ${restoPalabras}` : primeraPalabra;

            leftColumnItems.push({
                label: 'Paralelo:',
                value: paraleloFormateado,
            });
        }

        // Preparar tabla de materias para columna derecha
        const materias = enrollmentData.materias || [];
        const tableRows = [];
        for (const materia of materias) {
            const sigla = (materia.sigla || '').toString().trim();
            const nombre = (materia.nombre || '').toString().trim();
            const horas = materia.horas !== null && materia.horas !== undefined ? String(materia.horas) : '-';

            if (sigla || nombre) {
                tableRows.push([
                    sigla || '-',
                    nombre || '-',
                    horas,
                ]);
            }
        }

        // Usar layout de dos columnas solo si hay datos para mostrar
        if (leftColumnItems.length > 0 || tableRows.length > 0) {
            const rightTableConfig = tableRows.length > 0 ? {
                headers: ['CÓDIGO', 'ASIGNATURAS', 'HORAS'],
                columnWidths: [0.25, 0.60, 0.15], // 25%, 60%, 15%
                rows: tableRows,
                alignments: ['left', 'left', 'right'], // Código y asignatura izquierda, horas derecha
            } : null;

            await this._addTwoColumnLayout(leftColumnItems, rightTableConfig, 35, 60);
        } else {
            // Si no hay datos, mostrar mensaje
            await this._addLabelValue('Datos académicos:', 'No hay datos académicos disponibles');
        }

        this._addSpace();
    }

    /**
     * III. DOCUMENTOS RECEPCIONADOS.
     * Muestra lista de documentos entregados con viñetas (solo nombre del archivo).
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @param {Array} [options.entregas] - Lista de entregas de documentos (con entregado: true)
     * @returns {Promise<void>}
     */
    async _buildDocumentosRecepcionados(options) {
        await this._addSection(IncosPDFBase.FORMULARIO_SECTION_TITLES.DOCUMENTOS_RECEPCIONADOS);

        // Agregar lista de documentos entregados con viñetas (igual que en ActaCompromisoPdfGenerator)
        if (options.entregas && Array.isArray(options.entregas) && options.entregas.length > 0) {
            for (const entrega of options.entregas) {
                const nombreDocumento = entrega.nombre_documento || entrega.nombreDocumento || 'Documento sin nombre';
                await this._addBulletPoint(nombreDocumento);
            }
        } else {
            // Si no hay documentos entregados, mostrar mensaje
            await this._addBulletPoint('No hay documentos entregados');
        }
    }

    /**
     * Construye el bloque de firma (footer) al final del documento.
     * Usa IncosPDFBase.SIGNATURE para los textos y options.student (ci, expedicion).
     * 
     * Opcionalmente puede usar firma en 2 columnas si se pasa options.signatureTwoColumns = true.
     *
     * @private
     * @param {Object} options - Opciones de generación
     * @param {boolean} [options.signatureTwoColumns] - Si true, muestra 2 firmas en columnas (estudiante y responsable)
     * @returns {Promise<void>}
     */
    async _buildFirma(options) {
        if (options.signatureTwoColumns) {
            await this._addSignatureBlockTwoColumns(options);
        } else {
            // Firma simple (igual que ActaCompromisoPdfGenerator)
            const label = IncosPDFBase.SIGNATURE.LABEL;
            let ci = (IncosPDFBase.SIGNATURE.CI_FORMAT || 'C.I.: {CI} {EXPEDICION}')
                .replace('{CI}', options.student?.ci ?? '')
                .replace('{EXPEDICION}', (options.student?.expedicion ?? '').toString().trim());
            ci = ci.replace(/\s+/g, ' ').trim();
            await this._addSignatureBlock({ lines: [label, ci] });
        }
    }

    /**
     * Construye bloque de firma en 2 columnas (estudiante y responsable).
     * 
     * @private
     * @param {Object} options - Opciones de generación
     * @returns {Promise<void>}
     */
    async _addSignatureBlockTwoColumns(options) {
        if (!this._pdfDoc || !this._currentPage) {
            throw new Error('Debe inicializar el estado del documento con _initializeDocumentState() antes de agregar componentes');
        }

        const { width: pageWidth } = this._currentPage.getSize();
        const cfg = IncosPDFBase.LAYOUT;
        const margins = cfg.margins;
        const lineWidth = cfg.signatureLineWidth ?? 150;
        const lineThickness = cfg.signatureLineThickness ?? 1;
        const footerPadding = cfg.signatureFooterPadding ?? 10;
        const templateFooterHeight = cfg.signatureTemplateFooterHeight ?? 0;
        const spaceLineToFirst = cfg.signatureSpacingLineToFirstText ?? 8;
        const spaceBetweenLines = cfg.signatureSpacingBetweenTextLines ?? 4;
        const colGap = 40; // Espacio entre las dos columnas

        const normalFontName = this._mapFontNameToStandardFont(IncosPDFBase.FONTS.normal.font);
        const font = await this._pdfDoc.embedFont(normalFontName);
        const fontSize = IncosPDFBase.FONTS.normal.size;
        const textRgb = this._hexToRgb(IncosPDFBase.COLORS.text);

        // Calcular posiciones de las dos columnas
        const totalWidth = pageWidth - margins.left - margins.right;
        const colWidth = (totalWidth - colGap) / 2;
        const leftColX = margins.left;
        const rightColX = margins.left + colWidth + colGap;

        // Líneas de texto para cada columna
        const leftLines = [
            'Estudiante',
            (IncosPDFBase.SIGNATURE.CI_FORMAT || 'C.I.: {CI} {EXPEDICION}')
                .replace('{CI}', options.student?.ci ?? '')
                .replace('{EXPEDICION}', (options.student?.expedicion ?? '').toString().trim())
                .replace(/\s+/g, ' ')
                .trim(),
        ];
        const rightLines = [
            'Responsable Inscripción',
            '',
        ];

        const blockHeight = lineThickness + spaceLineToFirst +
            Math.max(leftLines.length, rightLines.length) * fontSize +
            Math.max(0, Math.max(leftLines.length, rightLines.length) - 1) * spaceBetweenLines;
        const blockBottomY = margins.bottom + templateFooterHeight + footerPadding;
        const lineY = blockBottomY + blockHeight - lineThickness;

        // Dibujar líneas de firma para ambas columnas
        const halfLine = lineWidth / 2;
        const leftLineCenterX = leftColX + colWidth / 2;
        const rightLineCenterX = rightColX + colWidth / 2;

        // Línea izquierda (estudiante)
        this._currentPage.drawLine({
            start: { x: leftLineCenterX - halfLine, y: lineY },
            end: { x: leftLineCenterX + halfLine, y: lineY },
            thickness: lineThickness,
            color: textRgb,
        });

        // Línea derecha (responsable)
        this._currentPage.drawLine({
            start: { x: rightLineCenterX - halfLine, y: lineY },
            end: { x: rightLineCenterX + halfLine, y: lineY },
            thickness: lineThickness,
            color: textRgb,
        });

        // Dibujar textos debajo de las líneas
        let textY = lineY - lineThickness - spaceLineToFirst;

        // Columna izquierda
        for (let i = 0; i < leftLines.length; i++) {
            const str = String(leftLines[i] ?? '').trim();
            if (str) {
                const w = font.widthOfTextAtSize(str, fontSize);
                this._currentPage.drawText(str, {
                    x: leftLineCenterX - w / 2,
                    y: textY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });
            }
            textY -= fontSize + (i < leftLines.length - 1 ? spaceBetweenLines : 0);
        }

        // Columna derecha
        textY = lineY - lineThickness - spaceLineToFirst;
        for (let i = 0; i < rightLines.length; i++) {
            const str = String(rightLines[i] ?? '').trim();
            if (str) {
                const w = font.widthOfTextAtSize(str, fontSize);
                this._currentPage.drawText(str, {
                    x: rightLineCenterX - w / 2,
                    y: textY,
                    size: fontSize,
                    font,
                    color: textRgb,
                });
            }
            textY -= fontSize + (i < rightLines.length - 1 ? spaceBetweenLines : 0);
        }
    }
}
