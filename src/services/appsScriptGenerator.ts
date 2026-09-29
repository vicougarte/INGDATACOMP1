/**
 * Generador de archivos completos para Google Apps Script y Google Sheets
 * Diseñado específicamente para:
 * Instituto Tecnológico ING DATA COMP - Cochabamba, Bolivia
 */

export const CODIGO_GS_CONTENT = `/**
 * =========================================================================
 * INSTITUTO TECNOLÓGICO ING DATA COMP - COCHABAMBA, BOLIVIA
 * SISTEMA INTEGRADO DE INSCRIPCIONES Y RENDIMIENTO ACADÉMICO
 * 
 * Archivo: Codigo.gs
 * Base de datos: Google Sheets
 * Desarrollado para gestión académica de Carreras, Cursos y Calificaciones
 * Escala de Calificación Bolivia: 
 *   - Aprobado: >= 61 puntos
 *   - Segundo Turno: 40 a 60 puntos
 *   - Reprobado: < 40 puntos
 * =========================================================================
 */

// Nombres de las hojas de la base de datos
const HOJAS = {
  CONFIG: 'CONFIGURACION',
  CARRERAS: 'CARRERAS',
  CURSOS: 'CURSOS',
  ESTUDIANTES: 'ESTUDIANTES',
  CALIFICACIONES: 'CALIFICACIONES',
  COSTOS: 'COSTOS_CARRERAS',
  PAGOS: 'PAGOS_10_CUOTAS'
};

/**
 * Servidor Web App de Google Apps Script
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('ING DATA COMP - Sistema Académico Cochabamba')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * FUNCIÓN PRINCIPAL: Crea automáticamente todas las hojas, columnas,
 * formatos, validaciones y datos iniciales (4 Carreras y 10 Cursos).
 * Ejecuta esta función una sola vez desde el editor de Apps Script.
 */
function inicializarBaseDeDatos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Estructura y cabeceras de cada hoja
  const estructuras = {
    [HOJAS.CONFIG]: {
      columnas: ['CLAVE', 'VALOR', 'DESCRIPCION'],
      anchos: [200, 350, 400],
      datosIniciales: [
        ['INSTITUTO_NOMBRE', 'INSTITUTO TECNOLÓGICO ING DATA COMP', 'Nombre oficial del instituto'],
        ['SIGLAS', 'ING DATA COMP', 'Siglas institucionales'],
        ['CIUDAD', 'Cochabamba', 'Ciudad de funcionamiento'],
        ['PAIS', 'Bolivia', 'País'],
        ['DIRECCION', 'Av. Heroínas esq. Ayacucho, Edificio Tecnológico 4to Piso', 'Dirección física'],
        ['TELEFONO', '+591 4 4528900 / +591 76912345', 'Teléfonos de contacto'],
        ['EMAIL', 'informaciones@ingdatacomp.edu.bo', 'Correo de contacto'],
        ['RESOLUCION_MINISTERIAL', 'R.M. No. 0397/2024 - Ministerio de Educación', 'Resolución legal de apertura'],
        ['DIRECTOR_ACADEMICO', 'Ing. Grover Marcelo Arispe R.', 'Director Académico titular'],
        ['SECRETARIA_GENERAL', 'Lic. Claudia Villarroel M.', 'Secretaria General'],
        ['REGIMEN', 'ANUALIZADO (3 AÑOS)', 'Régimen de formación'],
        ['ESCALA_APROBACION_MIN', '51', 'Nota mínima de aprobación directa (51/100)'],
        ['ESCALA_SEGUNDO_TURNO_MIN', '40', 'Nota mínima para derecho a 2do Turno']
      ]
    },
    [HOJAS.CARRERAS]: {
      columnas: ['ID', 'CODIGO', 'NOMBRE', 'RESOLUCION_MINISTERIAL', 'DURACION_ANIOS', 'TURNOS_DISPONIBLES', 'COLOR_HEX', 'ESTADO'],
      anchos: [100, 120, 280, 180, 160, 200, 110, 100],
      datosIniciales: [
        ['CAR-1', 'SIS-INF', 'Sistemas Informáticos', 'R.M. No. 0397/2024', 3, 'Mañana, Noche, Sábado', '#1E3A8A', 'Activo'],
        ['CAR-2', 'DIS-GRA', 'Diseño Gráfico', 'R.M. No. 0397/2024', 3, 'Mañana, Tarde, Noche', '#EA580C', 'Activo'],
        ['CAR-3', 'INF-IND', 'Informática Industrial', 'R.M. No. 0397/2024', 3, 'Mañana, Tarde, Noche', '#0284C7', 'Activo'],
        ['CAR-4', 'CON-GEN', 'Contaduría General', 'R.M. No. 0397/2024', 3, 'Mañana, Noche, Sábado', '#16A34A', 'Activo']
      ]
    },
    [HOJAS.CURSOS]: {
      columnas: ['ID', 'CODIGO', 'NOMBRE_CURSO', 'CATEGORIA', 'MODALIDAD', 'DURACION', 'CARGA_HORARIA', 'DOCENTE', 'COSTO_BS', 'HORARIO', 'ESTADO'],
      anchos: [90, 90, 320, 200, 120, 140, 130, 220, 100, 120, 120],
      datosIniciales: [
        ['CA-01', 'CA-01', 'Reparación de Celulares', 'Hardware y Telefonía', 'Presencial', '6 Semanas', 60, 'Téc. Rodrigo Velasquez C.', 200, '14 a 16', 'Inscripciones Abiertas'],
        ['CA-02', 'CA-02', 'Ensamblaje y Rep. de Computadoras', 'Hardware y Soporte', 'Presencial', '6 Semanas', 60, 'Ing. Fernando Quispe Laura', 200, '10 a 12', 'Inscripciones Abiertas'],
        ['CA-03', 'CA-03', 'Computación Básica', 'Ofimática y Computación', 'Presencial', '4 Semanas', 40, 'Lic. Claudia Villarroel M.', 180, '8 a 10', 'Inscripciones Abiertas'],
        ['CA-04', 'CA-04', 'Computación Avanzada', 'Ofimática y Productividad', 'Presencial', '4 Semanas', 40, 'Ing. Carlos Mamani Torrico', 200, '10 a 12', 'Inscripciones Abiertas'],
        ['CA-05', 'CA-05', 'Inteligencia Artificial para Profesores', 'Educación e IA', 'Presencial', '4 Semanas', 40, 'Ing. Grover Marcelo Arispe R.', 180, '18 a 20', 'Inscripciones Abiertas'],
        ['CA-06', 'CA-06', 'Robótica Educativa', 'Robótica y Automatización', 'Presencial', '6 Semanas', 60, 'Ing. Andrea Morales Montaño', 200, '8 a 10', 'Inscripciones Abiertas'],
        ['CA-07', 'CA-07', 'Lenguajes de Programación', 'Programación y Software', 'Presencial', '6 Semanas', 60, 'Ing. Paola Claure Mercado', 220, '18 a 20', 'Inscripciones Abiertas'],
        ['CA-08', 'CA-08', 'Diseño Gráfico Publicitario', 'Diseño y Multimedia', 'Presencial', '6 Semanas', 60, 'Lic. Javier Villarroel Salazar', 200, '14 a 16', 'Inscripciones Abiertas'],
        ['CA-09', 'CA-09', 'Diseño Gráfico Arquitectónico', 'Diseño Arquitectónico', 'Presencial', '6 Semanas', 60, 'Arq. Roberto Flores Zeballos', 220, '16 a 18', 'Inscripciones Abiertas'],
        ['CA-10', 'CA-10', 'Diseño y Programación de Sitios WEB', 'Desarrollo Web', 'Presencial', '6 Semanas', 60, 'Ing. Paola Claure Mercado', 200, '16 a 18', 'Inscripciones Abiertas'],
        ['CA-11', 'CA-11', 'Marketing Digital en Redes Sociales', 'Marketing y Redes', 'Presencial', '4 Semanas', 40, 'Lic. Gabriela Quiroga Beltrán', 180, '16 a 18', 'Inscripciones Abiertas'],
        ['CA-12', 'CA-12', 'Instalación, Adm. de Redes - Internet', 'Redes y Telecomunicaciones', 'Presencial', '6 Semanas', 60, 'Ing. Roberto Flores Zeballos', 200, '14 a 16', 'Inscripciones Abiertas'],
        ['CA-13', 'CA-13', 'Historias Animadas con Inteligencia Artificial', 'IA y Multimedia', 'Presencial', '4 Semanas', 40, 'Lic. Javier Villarroel Salazar', 180, '12 a 14', 'Inscripciones Abiertas'],
        ['CA-14', 'CA-14', 'Diseño en REVIT', 'Arquitectura BIM', 'Presencial', '6 Semanas', 60, 'Arq. Roberto Flores Zeballos', 220, '18 a 20', 'Inscripciones Abiertas'],
        ['CA-15', 'CA-15', 'Solidworks', 'Diseño Mecánico', 'Presencial', '6 Semanas', 60, 'Ing. Fernando Quispe Laura', 220, '16 a 18', 'Inscripciones Abiertas'],
        ['CA-16', 'CA-16', 'Canva Pro', 'Diseño Gráfico', 'Presencial', '4 Semanas', 40, 'Lic. Claudia Villarroel M.', 160, '20 a 22', 'Inscripciones Abiertas']
      ]
    },
    [HOJAS.ESTUDIANTES]: {
      columnas: ['ID', 'CODIGO_ESTUDIANTE', 'NOMBRES', 'APELLIDOS', 'CI', 'EXPEDIDO', 'EMAIL', 'TELEFONO', 'ID_CARRERA', 'SEMESTRE_ACTUAL', 'TURNO', 'FECHA_INSCRIPCION', 'ESTADO', 'OBSERVACIONES'],
      anchos: [100, 140, 160, 180, 100, 90, 220, 120, 110, 130, 100, 130, 90, 240],
      datosIniciales: [
        ['EST-1', 'IDC-2026-001', 'Alejandro David', 'Fernandez Torrico', '8745129', 'CB', 'alejandro.fernandez@gmail.com', '72234567', 'CAR-1', 1, 'Mañana', '2026-02-05', 'Activo', 'Inscripción regular'],
        ['EST-2', 'IDC-2026-002', 'Valeria Nicole', 'Montaño Gutierrez', '9123841', 'CB', 'valeria.montano@hotmail.com', '79781234', 'CAR-1', 1, 'Noche', '2026-02-06', 'Activo', 'Inscripción regular'],
        ['EST-3', 'IDC-2026-003', 'Rodrigo', 'Condori Mamani', '7689123', 'LP', 'rodrigo.condori@gmail.com', '68451290', 'CAR-2', 1, 'Mañana', '2026-02-08', 'Activo', 'Traspaso de La Paz'],
        ['EST-4', 'IDC-2026-004', 'Mariana Sofia', 'Zeballos Arnez', '10294812', 'CB', 'mariana.zeballos@gmail.com', '71458923', 'CAR-3', 1, 'Mañana', '2026-02-10', 'Activo', 'Beca de excelencia'],
        ['EST-5', 'IDC-2026-005', 'Jhoel Cristian', 'Peralta Rocha', '8392104', 'SC', 'jhoel.peralta@gmail.com', '75489012', 'CAR-4', 1, 'Tarde', '2026-02-12', 'Activo', 'Inscripción regular']
      ]
    },
    [HOJAS.CALIFICACIONES]: {
      columnas: ['ID', 'ID_ESTUDIANTE', 'CODIGO_ESTUDIANTE', 'ID_CURSO', 'ID_CARRERA', 'PERIODO', 'PARCIAL_1_25', 'PARCIAL_2_25', 'PRACTICAS_25', 'EXAMEN_FINAL_25', 'NOTA_FINAL_100', 'ESTADO_FINAL', 'ASISTENCIA_PCT', 'OBSERVACIONES', 'FECHA_REGISTRO'],
      anchos: [90, 110, 140, 110, 110, 100, 110, 110, 110, 130, 130, 130, 120, 240, 120],
      datosIniciales: [
        ['CAL-1', 'EST-1', 'IDC-2026-001', 'CUR-1', 'CAR-1', '1/2026', 22, 23, 24, 20, 89, 'Aprobado', 95, 'Excelente desempeño en laboratorio', '2026-03-20'],
        ['CAL-2', 'EST-2', 'IDC-2026-002', 'CUR-1', 'CAR-1', '1/2026', 18, 17, 20, 17, 72, 'Aprobado', 90, 'Buen rendimiento', '2026-03-20'],
        ['CAL-3', 'EST-3', 'IDC-2026-003', 'CUR-4', 'CAR-2', '1/2026', 12, 14, 15, 10, 51, 'Segundo Turno', 80, 'Habilitado a 2do Turno', '2026-03-21'],
        ['CAL-4', 'EST-4', 'IDC-2026-004', 'CUR-7', 'CAR-3', '1/2026', 24, 23, 25, 23, 95, 'Aprobado', 100, 'Destacada participación', '2026-03-21'],
        ['CAL-5', 'EST-5', 'IDC-2026-005', 'CUR-9', 'CAR-4', '1/2026', 20, 21, 22, 21, 84, 'Aprobado', 92, 'Proyecto de sensores aprobado', '2026-03-22']
      ]
    },
    [HOJAS.COSTOS]: {
      columnas: ['ID_CARRERA', 'CODIGO_CARRERA', 'NOMBRE_CARRERA', 'COSTO_MATRICULA_BS', 'PENSION_MENSUAL_BS', 'NUMERO_CUOTAS', 'OTROS_COSTOS_BS', 'DESCRIPCION_OTROS', 'TOTAL_ANUAL_BS'],
      anchos: [110, 130, 240, 150, 150, 120, 140, 260, 140],
      datosIniciales: [
        ['car-1', 'SIS-INF', 'Sistemas Informáticos', 300, 380, 10, 50, 'Seguro estudiantil y carnet institucional', 4150],
        ['car-2', 'DIS-GRA', 'Diseño Gráfico', 300, 360, 10, 50, 'Seguro estudiantil y carnet institucional', 3950],
        ['car-3', 'INF-IND', 'Informática Industrial', 300, 370, 10, 50, 'Seguro estudiantil y carnet institucional', 4050],
        ['car-4', 'CON-GEN', 'Contaduría General', 280, 340, 10, 50, 'Seguro estudiantil y carnet institucional', 3730]
      ]
    },
    [HOJAS.PAGOS]: {
      columnas: ['ID_PAGO', 'ID_ESTUDIANTE', 'CODIGO_ESTUDIANTE', 'NOMBRE_ESTUDIANTE', 'ID_CARRERA', 'ANIO_ESTUDIO', 'GESTION', 'TIPO_PAGO', 'NUMERO_CUOTA', 'MES', 'FECHA_VENCIMIENTO', 'MONTO_PACTADO_BS', 'MONTO_PAGADO_BS', 'SALDO_PENDIENTE_BS', 'ESTADO_PAGO', 'NRO_RECIBO', 'FECHA_PAGO', 'METODO_PAGO', 'OBSERVACIONES'],
      anchos: [110, 110, 130, 220, 100, 100, 80, 120, 100, 110, 130, 130, 130, 130, 110, 120, 110, 140, 220],
      datosIniciales: [
        ['pago-est-1-cuota-1', 'est-1', 'IDC-2026-001', 'Fernandez Torrico, Alejandro David', 'car-1', 1, '2026', 'Cuota Mensual', 1, 'Febrero', '2026-02-10', 380, 380, 0, 'Cancelado', 'REC-2026-0101', '2026-02-05', 'Efectivo', 'Pago mensual regular'],
        ['pago-est-1-cuota-2', 'est-1', 'IDC-2026-001', 'Fernandez Torrico, Alejandro David', 'car-1', 1, '2026', 'Cuota Mensual', 2, 'Marzo', '2026-03-10', 380, 200, 180, 'Parcial', 'REC-2026-0210', '2026-03-08', 'QR Simple', 'Pago parcial a cuenta'],
        ['pago-est-13-cuota-1', 'est-13', 'IDC-2026-013', 'Ugarte, Hugo', 'car-2', 1, '2026', 'Cuota Mensual', 1, 'Febrero', '2026-02-10', 360, 360, 0, 'Cancelado', 'REC-2026-0145', '2026-02-18', 'Efectivo', 'Pago mensual regular']
      ]
    }
  };

  // 2. Crear o actualizar cada hoja con estilos institucionales
  for (const nombreHoja in estructuras) {
    let sheet = ss.getSheetByName(nombreHoja);
    const config = estructuras[nombreHoja];
    
    if (!sheet) {
      sheet = ss.insertSheet(nombreHoja);
    }
    
    // Limpiar contenido previo si está vacía
    if (sheet.getLastRow() === 0) {
      // Escribir cabecera
      const headerRange = sheet.getRange(1, 1, 1, config.columnas.length);
      headerRange.setValues([config.columnas]);
      
      // Estilo de la cabecera (Azul institucional ING DATA COMP)
      headerRange
        .setBackground('#1E3A8A')
        .setFontColor('#FFFFFF')
        .setFontWeight('bold')
        .setFontSize(10)
        .setHorizontalAlignment('center')
        .setVerticalAlignment('middle')
        .setWrap(true);
        
      sheet.setRowHeight(1, 38);
      sheet.setFrozenRows(1);

      // Ajustar anchos de columnas
      for (let c = 0; c < config.anchos.length; c++) {
        sheet.setColumnWidth(c + 1, config.anchos[c]);
      }

      // Insertar datos de prueba iniciales si existen
      if (config.datosIniciales && config.datosIniciales.length > 0) {
        const dataRange = sheet.getRange(2, 1, config.datosIniciales.length, config.columnas.length);
        dataRange.setValues(config.datosIniciales);
        dataRange.setVerticalAlignment('middle').setFontSize(9);
        
        // Bordes suaves
        dataRange.setBorder(true, true, true, true, true, true, '#E2E8F0', SpreadsheetApp.BorderStyle.SOLID);
      }
    }
  }

  // Eliminar la hoja predeterminada 'Hoja 1' o 'Sheet1' si quedan las nuevas
  const defaultSheet = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Omitir si no se puede eliminar
    }
  }

  Logger.log('Base de datos ING DATA COMP inicializada correctamente con 5 hojas.');
  return 'Base de datos inicializada exitosamente con hojas: ' + Object.keys(estructuras).join(', ');
}

/**
 * =========================================================================
 * ENDPOINTS CRUD PARA SERVICIO WEB (Llamados desde google.script.run)
 * =========================================================================
 */

/**
 * Obtiene todos los datos en un solo viaje para máximo rendimiento
 */
function obtenerDatosCompletos() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  return {
    carreras: leerHojaComoObjetos(ss.getSheetByName(HOJAS.CARRERAS)),
    cursos: leerHojaComoObjetos(ss.getSheetByName(HOJAS.CURSOS)),
    estudiantes: leerHojaComoObjetos(ss.getSheetByName(HOJAS.ESTUDIANTES)),
    calificaciones: leerHojaComoObjetos(ss.getSheetByName(HOJAS.CALIFICACIONES)),
    config: leerConfiguracion(ss.getSheetByName(HOJAS.CONFIG))
  };
}

/**
 * Registra o actualiza un estudiante
 */
function guardarEstudiante(estudiante) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJAS.ESTUDIANTES);
  if (!sheet) throw new Error('Hoja ESTUDIANTES no encontrada');
  
  const data = sheet.getDataRange().getValues();
  let filaEncontrada = -1;
  
  // Buscar si ya existe por ID o por CI
  for (let i = 1; i < data.length; i++) {
    if ((estudiante.id && data[i][0] == estudiante.id) || (data[i][4] == estudiante.ci)) {
      filaEncontrada = i + 1;
      break;
    }
  }
  
  // Generar ID y Código si es nuevo
  const id = estudiante.id || ('EST-' + (data.length));
  const anio = new Date().getFullYear();
  const numPad = String(data.length).padStart(3, '0');
  const codigoEstudiante = estudiante.codigo || ('IDC-' + anio + '-' + numPad);
  
  const filaValores = [
    id,
    codigoEstudiante,
    estudiante.nombres,
    estudiante.apellidos,
    estudiante.ci,
    estudiante.expedido || 'CB',
    estudiante.email,
    estudiante.telefono,
    estudiante.carreraId,
    estudiante.semestreActual || 1,
    estudiante.turno || 'Mañana',
    estudiante.fechaInscripcion || Utilities.formatDate(new Date(), 'GMT-4', 'yyyy-MM-dd'),
    estudiante.estado || 'Activo',
    estudiante.observaciones || ''
  ];
  
  if (filaEncontrada > 0) {
    sheet.getRange(filaEncontrada, 1, 1, filaValores.length).setValues([filaValores]);
  } else {
    sheet.appendRow(filaValores);
  }
  
  return { success: true, id: id, codigo: codigoEstudiante };
}

/**
 * Elimina un estudiante por su ID
 */
function eliminarEstudiante(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJAS.ESTUDIANTES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, message: 'Estudiante no encontrado' };
}

/**
 * Registra o actualiza una calificación con cálculo boliviano
 */
function guardarCalificacion(calificacion) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJAS.CALIFICACIONES);
  if (!sheet) throw new Error('Hoja CALIFICACIONES no encontrada');
  
  const data = sheet.getDataRange().getValues();
  let filaEncontrada = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == calificacion.id || 
       (data[i][1] == calificacion.estudianteId && data[i][3] == calificacion.cursoId && data[i][5] == calificacion.periodo)) {
      filaEncontrada = i + 1;
      break;
    }
  }
  
  const p1 = Number(calificacion.parcial1) || 0;
  const p2 = Number(calificacion.parcial2) || 0;
  const pract = Number(calificacion.practicas) || 0;
  const exFinal = Number(calificacion.examenFinal) || 0;
  const notaFinal = Math.round(p1 + p2 + pract + exFinal);
  
  // Escala Académica Boliviana
  let estadoFinal = 'Reprobado';
  if (notaFinal >= 61) {
    estadoFinal = 'Aprobado';
  } else if (notaFinal >= 40) {
    estadoFinal = 'Segundo Turno';
  }
  
  const id = calificacion.id || ('CAL-' + (data.length));
  const filaValores = [
    id,
    calificacion.estudianteId,
    calificacion.codigoEstudiante || '',
    calificacion.cursoId,
    calificacion.carreraId || '',
    calificacion.periodo || '1/2026',
    p1,
    p2,
    pract,
    exFinal,
    notaFinal,
    estadoFinal,
    Number(calificacion.asistenciaPorcentaje) || 100,
    calificacion.observaciones || '',
    Utilities.formatDate(new Date(), 'GMT-4', 'yyyy-MM-dd')
  ];
  
  if (filaEncontrada > 0) {
    sheet.getRange(filaEncontrada, 1, 1, filaValores.length).setValues([filaValores]);
  } else {
    sheet.appendRow(filaValores);
  }
  
  return { success: true, id: id, notaFinal: notaFinal, estadoFinal: estadoFinal };
}

/**
 * Guarda o actualiza una carrera (Gestión Administrador)
 */
function guardarCarrera(carrera) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJAS.CARRERAS);
  const data = sheet.getDataRange().getValues();
  let filaEncontrada = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == carrera.id || data[i][1] == carrera.codigo) {
      filaEncontrada = i + 1;
      break;
    }
  }
  
  const id = carrera.id || ('CAR-' + (data.length));
  const filaValores = [
    id,
    carrera.codigo,
    carrera.nombre,
    carrera.resolucion || 'R.M. Vigente',
    Number(carrera.duracionSemestres) || 6,
    Array.isArray(carrera.turnoDisponibles) ? carrera.turnoDisponibles.join(', ') : (carrera.turnoDisponibles || 'Mañana, Noche'),
    carrera.color || '#2563EB',
    'Activo'
  ];
  
  if (filaEncontrada > 0) {
    sheet.getRange(filaEncontrada, 1, 1, filaValores.length).setValues([filaValores]);
  } else {
    sheet.appendRow(filaValores);
  }
  
  return { success: true, id: id };
}

/**
 * Guarda o actualiza un curso (Gestión Administrador)
 */
function guardarCurso(curso) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(HOJAS.CURSOS);
  const data = sheet.getDataRange().getValues();
  let filaEncontrada = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == curso.id || data[i][1] == curso.codigo) {
      filaEncontrada = i + 1;
      break;
    }
  }
  
  const id = curso.id || ('CUR-' + (data.length));
  const filaValores = [
    id,
    curso.codigo,
    curso.nombre,
    curso.carreraId,
    Number(curso.semestre) || 1,
    Number(curso.cargaHoraria) || 80,
    curso.docente || '',
    Number(curso.creditos) || 6,
    'Activo'
  ];
  
  if (filaEncontrada > 0) {
    sheet.getRange(filaEncontrada, 1, 1, filaValores.length).setValues([filaValores]);
  } else {
    sheet.appendRow(filaValores);
  }
  
  return { success: true, id: id };
}

/**
 * Funciones de lectura auxiliares
 */
function leerHojaComoObjetos(sheet) {
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  
  const cabeceras = data[0];
  const resultado = [];
  
  for (let i = 1; i < data.length; i++) {
    const fila = data[i];
    const obj = {};
    for (let c = 0; c < cabeceras.length; c++) {
      const clave = String(cabeceras[c]).toLowerCase().replace(/_([a-z])/g, function(g) { return g[1].toUpperCase(); });
      obj[clave] = fila[c];
    }
    resultado.push(obj);
  }
  return resultado;
}

function leerConfiguracion(sheet) {
  if (!sheet) return {};
  const data = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      config[data[i][0]] = data[i][1];
    }
  }
  return config;
}
`;

export const INDEX_HTML_CONTENT = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ING DATA COMP - Sistema Académico Cochabamba</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <!-- Google Fonts Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
    @media print {
      .no-print { display: none !important; }
      .print-only { display: block !important; }
      body { background: white !important; color: black !important; }
    }
    .print-only { display: none; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 antialiased min-h-screen flex flex-col">

  <!-- Header Institucional -->
  <header class="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-900 text-white shadow-lg sticky top-0 z-40 no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-20">
        <!-- Logo y Nombre -->
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 bg-white rounded-xl shadow-md flex items-center justify-center p-1.5 border-2 border-blue-400">
            <svg class="w-8 h-8 text-blue-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
              <path d="M6 14h7"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h1 class="text-xl font-bold tracking-tight text-white leading-none">INSTITUTO TECNOLÓGICO ING DATA COMP</h1>
              <span class="text-xs bg-red-600 text-white font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">Cochabamba</span>
            </div>
            <p class="text-xs text-blue-200 mt-1 font-medium">Sistema de Inscripciones y Rendimiento Académico | Bolivia</p>
          </div>
        </div>

        <!-- Badges y Estado de Base de Datos -->
        <div class="hidden md:flex items-center space-x-4">
          <div class="flex items-center space-x-2 bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-800/80 text-xs">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-blue-100 font-medium">Google Sheets DB Conectado</span>
          </div>
          <button onclick="recargarDatos()" class="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      <!-- Barra de Navegación Pestañas -->
      <nav class="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 border-t border-blue-800/60 text-sm scrollbar-none">
        <button onclick="cambiarVista('dashboard')" id="btn-tab-dashboard" class="tab-btn px-4 py-2 rounded-lg font-medium text-blue-100 hover:text-white hover:bg-blue-800/60 transition flex items-center space-x-2 active-tab bg-blue-800">
          <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
          <span>Dashboard</span>
        </button>
        <button onclick="cambiarVista('inscripciones')" id="btn-tab-inscripciones" class="tab-btn px-4 py-2 rounded-lg font-medium text-blue-100 hover:text-white hover:bg-blue-800/60 transition flex items-center space-x-2">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span>Inscripciones</span>
        </button>
        <button onclick="cambiarVista('carreras-cursos')" id="btn-tab-carreras-cursos" class="tab-btn px-4 py-2 rounded-lg font-medium text-blue-100 hover:text-white hover:bg-blue-800/60 transition flex items-center space-x-2">
          <i data-lucide="graduation-cap" class="w-4 h-4"></i>
          <span>Carreras y Cursos</span>
        </button>
        <button onclick="cambiarVista('calificaciones')" id="btn-tab-calificaciones" class="tab-btn px-4 py-2 rounded-lg font-medium text-blue-100 hover:text-white hover:bg-blue-800/60 transition flex items-center space-x-2">
          <i data-lucide="file-check-2" class="w-4 h-4"></i>
          <span>Calificaciones</span>
        </button>
        <button onclick="cambiarVista('boletin')" id="btn-tab-boletin" class="tab-btn px-4 py-2 rounded-lg font-medium text-blue-100 hover:text-white hover:bg-blue-800/60 transition flex items-center space-x-2">
          <i data-lucide="award" class="w-4 h-4"></i>
          <span>Boletín Oficial</span>
        </button>
      </nav>
    </div>
  </header>

  <!-- Contenido Principal Dinámico -->
  <main class="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">

    <!-- Mensaje de Carga / Alertas -->
    <div id="alert-banner" class="hidden mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm">
      <div class="flex items-center space-x-3">
        <span id="alert-icon"></span>
        <span id="alert-text"></span>
      </div>
      <button onclick="cerrarAlerta()" class="text-slate-500 hover:text-slate-800">
        <i data-lucide="x" class="w-4 h-4"></i>
      </button>
    </div>

    <!-- VISTA 1: DASHBOARD -->
    <section id="vista-dashboard" class="space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Panel General de Gestión Académica</h2>
          <p class="text-sm text-slate-500 mt-1">Resumen del Instituto Tecnológico ING DATA COMP Cochabamba - Gestión 2026</p>
        </div>
        <div class="flex items-center space-x-3">
          <button onclick="abrirModalInscripcion()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center space-x-2 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Nueva Inscripción</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <i data-lucide="users" class="w-6 h-6"></i>
          </div>
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Estudiantes</span>
            <h3 id="kpi-estudiantes" class="text-2xl font-bold text-slate-800">0</h3>
            <span class="text-xs text-emerald-600 font-medium flex items-center mt-0.5">Activos Gestión 2026</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
            <i data-lucide="graduation-cap" class="w-6 h-6"></i>
          </div>
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Carreras Técnicas</span>
            <h3 id="kpi-carreras" class="text-2xl font-bold text-slate-800">4</h3>
            <span class="text-xs text-indigo-600 font-medium">Nivel Técnico Superior</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold">
            <i data-lucide="book-open" class="w-6 h-6"></i>
          </div>
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Cursos / Materias</span>
            <h3 id="kpi-cursos" class="text-2xl font-bold text-slate-800">10</h3>
            <span class="text-xs text-teal-600 font-medium">En malla curricular</span>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div class="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
            <i data-lucide="trending-up" class="w-6 h-6"></i>
          </div>
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Tasa de Aprobación</span>
            <h3 id="kpi-aprobacion" class="text-2xl font-bold text-slate-800">0%</h3>
            <span class="text-xs text-slate-500 font-medium">Nota >= 61 pts</span>
          </div>
        </div>
      </div>

      <!-- Resumen por Carrera y Estudiantes Recientes -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-slate-800 flex items-center space-x-2">
              <i data-lucide="layers" class="w-5 h-5 text-blue-600"></i>
              <span>Distribución por Carreras (ING DATA COMP)</span>
            </h3>
            <span class="text-xs text-slate-400 font-medium">Resoluciones Ministeriales Vigentes</span>
          </div>
          <div id="lista-carreras-resumen" class="space-y-4">
            <!-- Cargado dinámicamente -->
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h3 class="font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <i data-lucide="scale" class="w-5 h-5 text-amber-600"></i>
            <span>Escala Académica de Bolivia</span>
          </h3>
          <div class="space-y-3 text-sm">
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-emerald-800">Aprobado</span>
                <p class="text-xs text-emerald-600">Acreditación directa</p>
              </div>
              <span class="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">61 - 100 pts</span>
            </div>
            <div class="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-amber-800">Segundo Turno</span>
                <p class="text-xs text-amber-600">Derecho a examen de recuperación</p>
              </div>
              <span class="font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">40 - 60 pts</span>
            </div>
            <div class="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center justify-between">
              <div>
                <span class="font-bold text-red-800">Reprobado</span>
                <p class="text-xs text-red-600">Debe recursar la asignatura</p>
              </div>
              <span class="font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-lg">0 - 39 pts</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            Normativa regulada por la Dirección Departamental de Educación y el Ministerio de Educación de Bolivia.
          </div>
        </div>
      </div>
    </section>

    <!-- VISTA 2: INSCRIPCIONES Y ESTUDIANTES -->
    <section id="vista-inscripciones" class="hidden space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Registro de Inscripciones y Estudiantes</h2>
          <p class="text-sm text-slate-500 mt-1">Gestión de datos personales, matrículas y asignación de carreras</p>
        </div>
        <button onclick="abrirModalInscripcion()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center space-x-2 transition">
          <i data-lucide="user-plus" class="w-4 h-4"></i>
          <span>Registrar Estudiante</span>
        </button>
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div class="relative w-full md:w-80">
          <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400"></i>
          <input type="text" id="filtro-busqueda-estudiante" oninput="filtrarEstudiantes()" placeholder="Buscar por CI, Nombres o Código..." class="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="flex items-center space-x-3 w-full md:w-auto">
          <select id="filtro-carrera-estudiante" onchange="filtrarEstudiantes()" class="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todas las Carreras</option>
          </select>
          <select id="filtro-turno-estudiante" onchange="filtrarEstudiantes()" class="w-full md:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Todos los Turnos</option>
            <option value="Mañana">Mañana</option>
            <option value="Tarde">Tarde</option>
            <option value="Noche">Noche</option>
            <option value="Sábado">Sábado</option>
          </select>
        </div>
      </div>

      <!-- Tabla de Estudiantes -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th class="px-5 py-3.5">Código / CI</th>
                <th class="px-5 py-3.5">Estudiante</th>
                <th class="px-5 py-3.5">Carrera</th>
                <th class="px-5 py-3.5">Semestre / Turno</th>
                <th class="px-5 py-3.5">Contacto</th>
                <th class="px-5 py-3.5">Estado</th>
                <th class="px-5 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="tabla-estudiantes-body" class="divide-y divide-slate-100">
              <!-- Cargado dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- VISTA 3: CARRERAS Y CURSOS (ADMIN) -->
    <section id="vista-carreras-cursos" class="hidden space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Gestión de Carreras y Cursos (Administrador)</h2>
          <p class="text-sm text-slate-500 mt-1">Configuración de programas académicos, materias, docentes y carga horaria</p>
        </div>
        <div class="flex items-center space-x-3">
          <button onclick="abrirModalCarrera()" class="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center space-x-2 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Nueva Carrera</span>
          </button>
          <button onclick="abrirModalCurso()" class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center space-x-2 transition">
            <i data-lucide="plus" class="w-4 h-4"></i>
            <span>Nuevo Curso</span>
          </button>
        </div>
      </div>

      <!-- Carreras Grid -->
      <div>
        <h3 class="font-bold text-lg text-slate-800 mb-3 flex items-center space-x-2">
          <i data-lucide="briefcase" class="w-5 h-5 text-indigo-600"></i>
          <span>Carreras Habilitadas (4 Carreras Oficiales)</span>
        </h3>
        <div id="grid-carreras-admin" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Carreras admin -->
        </div>
      </div>

      <!-- Cursos / Materias List -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h3 class="font-bold text-lg text-slate-800 flex items-center space-x-2">
            <i data-lucide="book-marked" class="w-5 h-5 text-blue-600"></i>
            <span>Cursos y Asignaturas (10 Cursos Iniciales)</span>
          </h3>
          <select id="filtro-carrera-cursos-admin" onchange="renderizarCursosAdmin()" class="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <option value="">Todas las Carreras</option>
          </select>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
              <tr>
                <th class="px-4 py-3">Código</th>
                <th class="px-4 py-3">Materia / Curso</th>
                <th class="px-4 py-3">Carrera</th>
                <th class="px-4 py-3">Semestre</th>
                <th class="px-4 py-3">Carga Horaria</th>
                <th class="px-4 py-3">Docente Asignado</th>
                <th class="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody id="tabla-cursos-admin-body" class="divide-y divide-slate-100">
              <!-- Cargado dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- VISTA 4: CALIFICACIONES Y RENDIMIENTO -->
    <section id="vista-calificaciones" class="hidden space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Rendimiento Académico y Calificaciones</h2>
          <p class="text-sm text-slate-500 mt-1">Registro de evaluaciones continuas, parciales y cálculo automático sobre 100 puntos</p>
        </div>
      </div>

      <!-- Selector de Curso y Filtro -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1.5">Carrera</label>
          <select id="select-calif-carrera" onchange="actualizarCursosCalificaciones()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1.5">Curso / Materia</label>
          <select id="select-calif-curso" onchange="cargarEstudiantesParaCalificar()" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold uppercase text-slate-500 mb-1.5">Periodo Académico</label>
          <select id="select-calif-periodo" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="1/2026">Gestión 1/2026</option>
            <option value="2/2026">Gestión 2/2026</option>
          </select>
        </div>
      </div>

      <!-- Tabla de Calificación de Estudiantes -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div class="flex items-center space-x-2">
            <i data-lucide="edit-3" class="w-4 h-4 text-blue-600"></i>
            <span class="text-sm font-bold text-slate-700">Planilla Centralizadora de Notas</span>
            <span class="text-xs text-slate-500">(1er Parcial 25% + 2do Parcial 25% + Prácticas 25% + Final 25% = 100%)</span>
          </div>
          <button onclick="guardarTodasLasCalificaciones()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition">
            <i data-lucide="save" class="w-4 h-4"></i>
            <span>Guardar Calificaciones en Google Sheets</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100 text-slate-600 uppercase text-xs font-semibold">
              <tr>
                <th class="px-4 py-3">Estudiante</th>
                <th class="px-3 py-3 text-center">1er Parcial (25)</th>
                <th class="px-3 py-3 text-center">2do Parcial (25)</th>
                <th class="px-3 py-3 text-center">Prácticas/Lab (25)</th>
                <th class="px-3 py-3 text-center">Examen Final (25)</th>
                <th class="px-3 py-3 text-center">Nota Final (100)</th>
                <th class="px-3 py-3 text-center">Estado Bolivia</th>
                <th class="px-3 py-3 text-center">Asistencia %</th>
                <th class="px-3 py-3">Observaciones</th>
              </tr>
            </thead>
            <tbody id="tabla-calificaciones-body" class="divide-y divide-slate-200">
              <!-- Cargado dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- VISTA 5: BOLETÍN / KÁRDEX OFICIAL -->
    <section id="vista-boletin" class="hidden space-y-6">
      <div class="no-print flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Kárdex y Boletín de Calificaciones</h2>
          <p class="text-sm text-slate-500 mt-1">Generación e impresión oficial de boletín de calificaciones para el estudiante</p>
        </div>
        <div class="flex items-center space-x-3">
          <select id="select-estudiante-boletin" onchange="cargarBoletinEstudiante()" class="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500">
            <!-- Options dinámicas -->
          </select>
          <button onclick="window.print()" class="px-4 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center space-x-2 transition">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span>Imprimir Kárdex Oficial</span>
          </button>
        </div>
      </div>

      <!-- FORMATO BOLETÍN OFICIAL IMPRIMIBLE -->
      <div id="boletin-documento" class="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-md max-w-4xl mx-auto text-slate-800">
        <!-- Membrete Oficial -->
        <div class="border-b-2 border-blue-950 pb-6 mb-6">
          <div class="flex justify-between items-start">
            <div class="flex items-center space-x-4">
              <div class="w-16 h-16 bg-blue-950 text-white rounded-xl flex items-center justify-center font-extrabold text-2xl border-2 border-amber-400">
                IDC
              </div>
              <div>
                <h1 class="text-xl font-black text-blue-950 tracking-tight">UNIDAD EDUCATIVA TÉCNICO HUMANÍSTICO BOLIVIANO ARGENTINO</h1>
                <p class="text-xs font-semibold text-slate-600">R.M. No. 0397/2024 - MINISTERIO DE EDUCACIÓN DE BOLIVIA</p>
                <p class="text-xs text-slate-500">Cochabamba - Bolivia | Régimen Anualizado (3 Años)</p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-block bg-blue-100 text-blue-900 font-bold px-3 py-1 rounded text-xs uppercase tracking-wider">
                Kárdex Académico Oficial
              </span>
              <p class="text-xs text-slate-500 mt-1 font-mono">Gestión: <strong class="text-slate-800">1/2026</strong></p>
            </div>
          </div>
        </div>

        <!-- Datos del Estudiante -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-6">
          <div>
            <span class="text-slate-500 uppercase font-semibold">Código Matrícula:</span>
            <p id="bol-codigo" class="font-bold text-slate-800 text-sm font-mono">-</p>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-semibold">Estudiante:</span>
            <p id="bol-nombre" class="font-bold text-slate-800 text-sm">-</p>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-semibold">C.I. / Expedido:</span>
            <p id="bol-ci" class="font-bold text-slate-800 text-sm">-</p>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-semibold">Carrera Técnica:</span>
            <p id="bol-carrera" class="font-bold text-blue-900 text-sm">-</p>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-semibold">Semestre:</span>
            <p id="bol-semestre" class="font-bold text-slate-800">-</p>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-semibold">Turno:</span>
            <p id="bol-turno" class="font-bold text-slate-800">-</p>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-semibold">Fecha Emisión:</span>
            <p id="bol-fecha" class="font-bold text-slate-800 font-mono">26/09/2026</p>
          </div>
          <div>
            <span class="text-slate-500 uppercase font-semibold">Estado de Matrícula:</span>
            <span class="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-xs">REGULAR</span>
          </div>
        </div>

        <!-- Tabla de Calificaciones -->
        <div class="mb-8">
          <table class="w-full text-left text-xs border border-slate-200">
            <thead class="bg-blue-950 text-white font-semibold">
              <tr>
                <th class="p-2.5">Código</th>
                <th class="p-2.5">Asignatura / Curso</th>
                <th class="p-2.5 text-center">1P (25)</th>
                <th class="p-2.5 text-center">2P (25)</th>
                <th class="p-2.5 text-center">Lab (25)</th>
                <th class="p-2.5 text-center">Final (25)</th>
                <th class="p-2.5 text-center font-bold">Nota (100)</th>
                <th class="p-2.5 text-center">Estado Académico</th>
              </tr>
            </thead>
            <tbody id="bol-tabla-materias" class="divide-y divide-slate-200">
              <!-- Cargado dinámicamente -->
            </tbody>
          </table>
        </div>

        <!-- Resumen Ponderado -->
        <div class="flex justify-between items-center bg-slate-100 p-4 rounded-xl border border-slate-300 mb-12">
          <div>
            <span class="text-xs uppercase font-bold text-slate-600">Promedio General Ponderado:</span>
            <span id="bol-promedio" class="ml-2 font-black text-lg text-blue-950">- / 100</span>
          </div>
          <div>
            <span class="text-xs uppercase font-bold text-slate-600">Condición Académica:</span>
            <span id="bol-condicion" class="ml-2 font-black text-sm px-3 py-1 rounded-lg">-</span>
          </div>
        </div>

        <!-- Firmas Oficiales y Sello -->
        <div class="grid grid-cols-2 gap-12 text-center text-xs pt-8 border-t border-slate-300">
          <div>
            <div class="h-14 border-b border-dashed border-slate-400 mx-8"></div>
            <p class="font-bold text-slate-800 mt-2">Ing. Grover Marcelo Arispe R.</p>
            <p class="text-slate-500">Director Académico</p>
            <p class="text-slate-400 text-[10px]">INSTITUTO TECNOLÓGICO ING DATA COMP</p>
          </div>
          <div>
            <div class="h-14 border-b border-dashed border-slate-400 mx-8"></div>
            <p class="font-bold text-slate-800 mt-2">Lic. Claudia Villarroel M.</p>
            <p class="text-slate-500">Secretaría General y Registros</p>
            <p class="text-slate-400 text-[10px]">Cochabamba - Estado Plurinacional de Bolivia</p>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- MODAL: NUEVA INSCRIPCIÓN / EDITAR ESTUDIANTE -->
  <div id="modal-inscripcion" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 hidden">
    <div class="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4">
      <div class="flex justify-between items-center border-b pb-3">
        <h3 class="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <i data-lucide="user-plus" class="w-5 h-5 text-blue-600"></i>
          <span id="modal-inscripcion-titulo">Inscripción de Nuevo Estudiante</span>
        </h3>
        <button onclick="cerrarModalInscripcion()" class="text-slate-400 hover:text-slate-600">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <form id="form-estudiante" onsubmit="guardarEstudianteSubmit(event)" class="space-y-4 text-sm">
        <input type="hidden" id="form-est-id">
        <input type="hidden" id="form-est-codigo">

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Nombres *</label>
            <input type="text" id="form-est-nombres" required class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: Alejandro">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Apellidos *</label>
            <input type="text" id="form-est-apellidos" required class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: Fernandez Torrico">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div class="col-span-2">
            <label class="block text-xs font-semibold text-slate-600 mb-1">Cédula de Identidad (CI) *</label>
            <input type="text" id="form-est-ci" required class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: 8745129">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Expedido *</label>
            <select id="form-est-expedido" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="CB" selected>CB (Cochabamba)</option>
              <option value="LP">LP (La Paz)</option>
              <option value="SC">SC (Santa Cruz)</option>
              <option value="OR">OR (Oruro)</option>
              <option value="PT">PT (Potosí)</option>
              <option value="TJ">TJ (Tarija)</option>
              <option value="CH">CH (Chuquisaca)</option>
              <option value="BE">BE (Beni)</option>
              <option value="PD">PD (Pando)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Celular / WhatsApp *</label>
            <input type="tel" id="form-est-telefono" required class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: 72234567">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico</label>
            <input type="email" id="form-est-email" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="estudiante@gmail.com">
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-600 mb-1">Carrera Tecnológica *</label>
          <select id="form-est-carrera" required class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500">
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Semestre de Ingreso *</label>
            <select id="form-est-semestre" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="1">1er Semestre</option>
              <option value="2">2do Semestre</option>
              <option value="3">3er Semestre</option>
              <option value="4">4to Semestre</option>
              <option value="5">5to Semestre</option>
              <option value="6">6to Semestre</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 mb-1">Turno *</label>
            <select id="form-est-turno" class="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="Mañana">Mañana (08:00 - 12:00)</option>
              <option value="Tarde">Tarde (14:00 - 18:00)</option>
              <option value="Noche">Noche (19:00 - 22:00)</option>
              <option value="Sábado">Sábado Intensivo</option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-3 border-t">
          <button type="button" onclick="cerrarModalInscripcion()" class="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 font-medium">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm">Guardar Inscripción</button>
        </div>
      </form>
    </div>
  </div>

  <!-- SCRIPT CLIENTE JS CON INTEGRACIÓN GOOGLE APPS SCRIPT Y SIMULADOR -->
  <script>
    // ESTADO GLOBAL DE LA APLICACIÓN
    let DB = {
      carreras: [],
      cursos: [],
      estudiantes: [],
      calificaciones: [],
      config: {}
    };

    // Datos por defecto (si se corre standalone o primera vez)
    const DATOS_FALLBACK = {
      carreras: [
        { id: 'car-1', codigo: 'SIS-INF', nombre: 'Sistemas Informáticos', resolucion: 'R.M. No. 0397/2024', duracionAnios: 3, turnoDisponibles: ['Mañana', 'Noche', 'Sábado'], color: '#1E3A8A' },
        { id: 'car-2', codigo: 'DIS-GRA', nombre: 'Diseño Gráfico', resolucion: 'R.M. No. 0397/2024', duracionAnios: 3, turnoDisponibles: ['Mañana', 'Tarde', 'Noche'], color: '#EA580C' },
        { id: 'car-3', codigo: 'INF-IND', nombre: 'Informática Industrial', resolucion: 'R.M. No. 0397/2024', duracionAnios: 3, turnoDisponibles: ['Mañana', 'Tarde', 'Noche'], color: '#0284C7' },
        { id: 'car-4', codigo: 'CON-GEN', nombre: 'Contaduría General', resolucion: 'R.M. No. 0397/2024', duracionAnios: 3, turnoDisponibles: ['Mañana', 'Noche', 'Sábado'], color: '#16A34A' }
      ],
      cursos: [
        { id: 'cur-1', codigo: 'SIS-101', nombre: 'Programación I y Lógica de Algoritmos', carreraId: 'car-1', semestre: 1, cargaHoraria: 160, docente: 'Ing. Grover Marcelo Arispe R.', creditos: 8 },
        { id: 'cur-2', codigo: 'DIS-101', nombre: 'Dibujo Artístico y Comunicación Visual', carreraId: 'car-2', semestre: 1, cargaHoraria: 140, docente: 'Lic. Javier Villarroel Salazar', creditos: 7 },
        { id: 'cur-3', codigo: 'IND-101', nombre: 'Electrónica Básica y Circuitos Industriales', carreraId: 'car-3', semestre: 1, cargaHoraria: 160, docente: 'Ing. Fernando Quispe Laura', creditos: 8 },
        { id: 'cur-4', codigo: 'CON-101', nombre: 'Contabilidad Básica y Normas Contables', carreraId: 'car-4', semestre: 1, cargaHoraria: 160, docente: 'Lic. Mario Vargas Ledezma', creditos: 8 }
      ],
      estudiantes: [
        { id: 'est-1', codigo: 'IDC-2026-001', nombres: 'Alejandro David', apellidos: 'Fernandez Torrico', ci: '8745129', expedido: 'CB', email: 'alejandro.fernandez@gmail.com', telefono: '72234567', carreraId: 'car-1', semestreActual: 1, turno: 'Mañana', estado: 'Activo' },
        { id: 'est-2', codigo: 'IDC-2026-002', nombres: 'Valeria Nicole', apellidos: 'Montaño Gutierrez', ci: '9123841', expedido: 'CB', email: 'valeria.montano@hotmail.com', telefono: '79781234', carreraId: 'car-2', semestreActual: 1, turno: 'Noche', estado: 'Activo' },
        { id: 'est-3', codigo: 'IDC-2026-003', nombres: 'Rodrigo', apellidos: 'Condori Mamani', ci: '7689123', expedido: 'LP', email: 'rodrigo.condori@gmail.com', telefono: '68451290', carreraId: 'car-3', semestreActual: 1, turno: 'Mañana', estado: 'Activo' },
        { id: 'est-4', codigo: 'IDC-2026-004', nombres: 'Mariana Sofia', apellidos: 'Zeballos Arnez', ci: '10294812', expedido: 'CB', email: 'mariana.zeballos@gmail.com', telefono: '71458923', carreraId: 'car-4', semestreActual: 1, turno: 'Mañana', estado: 'Activo' },
        { id: 'est-5', codigo: 'IDC-2026-005', nombres: 'Jhoel Cristian', apellidos: 'Peralta Rocha', ci: '8392104', expedido: 'SC', email: 'jhoel.peralta@gmail.com', telefono: '75489012', carreraId: 'car-1', semestreActual: 1, turno: 'Tarde', estado: 'Activo' }
      ],
      calificaciones: [
        { id: 'cal-1', estudianteId: 'est-1', codigoEstudiante: 'IDC-2026-001', cursoId: 'cur-1', carreraId: 'car-1', periodo: '1/2026', parcial1: 22, parcial2: 23, practicas: 24, examenFinal: 20, notaFinal: 89, estadoFinal: 'Aprobado', asistenciaPorcentaje: 95, observaciones: 'Excelente' },
        { id: 'cal-2', estudianteId: 'est-2', codigoEstudiante: 'IDC-2026-002', cursoId: 'cur-2', carreraId: 'car-2', periodo: '1/2026', parcial1: 18, parcial2: 17, practicas: 20, examenFinal: 17, notaFinal: 72, estadoFinal: 'Aprobado', asistenciaPorcentaje: 90, observaciones: 'Buen rendimiento' },
        { id: 'cal-3', estudianteId: 'est-3', codigoEstudiante: 'IDC-2026-003', cursoId: 'cur-3', carreraId: 'car-3', periodo: '1/2026', parcial1: 20, parcial2: 21, practicas: 22, examenFinal: 21, notaFinal: 84, estadoFinal: 'Aprobado', asistenciaPorcentaje: 92, observaciones: 'Aprobado' },
        { id: 'cal-4', estudianteId: 'est-4', codigoEstudiante: 'IDC-2026-004', cursoId: 'cur-4', carreraId: 'car-4', periodo: '1/2026', parcial1: 24, parcial2: 23, practicas: 25, examenFinal: 23, notaFinal: 95, estadoFinal: 'Aprobado', asistenciaPorcentaje: 100, observaciones: 'Sobresaliente' }
      ]
    };

    // Inicialización al cargar la página
    window.addEventListener('DOMContentLoaded', () => {
      recargarDatos();
      lucide.createIcons();
    });

    // Carga de datos desde Google Apps Script si está disponible
    function recargarDatos() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler((respuesta) => {
            DB = respuesta;
            inicializarVistas();
            mostrarAlerta('Datos sincronizados correctamente con Google Sheets', 'success');
          })
          .withFailureHandler((error) => {
            console.warn('Ejecutando en modo local o Apps Script fuera de línea:', error);
            cargarDatosLocales();
          })
          .obtenerDatosCompletos();
      } else {
        cargarDatosLocales();
      }
    }

    function cargarDatosLocales() {
      const guardado = localStorage.getItem('ING_DATA_COMP_DB');
      if (guardado) {
        try { DB = JSON.parse(guardado); } catch(e) { DB = DATOS_FALLBACK; }
      } else {
        DB = DATOS_FALLBACK;
        guardarLocal();
      }
      inicializarVistas();
    }

    function guardarLocal() {
      localStorage.setItem('ING_DATA_COMP_DB', JSON.stringify(DB));
    }

    function inicializarVistas() {
      actualizarKPIs();
      renderizarCarrerasResumen();
      poblarSelectores();
      renderizarEstudiantes();
      renderizarCarrerasAdmin();
      renderizarCursosAdmin();
      actualizarCursosCalificaciones();
      cargarBoletinEstudiante();
      lucide.createIcons();
    }

    function cambiarVista(vistaId) {
      ['dashboard', 'inscripciones', 'carreras-cursos', 'calificaciones', 'boletin'].forEach(v => {
        const sec = document.getElementById('vista-' + v);
        const btn = document.getElementById('btn-tab-' + v);
        if (v === vistaId) {
          sec.classList.remove('hidden');
          btn.classList.add('bg-blue-800', 'text-white');
        } else {
          sec.classList.add('hidden');
          btn.classList.remove('bg-blue-800', 'text-white');
        }
      });
      lucide.createIcons();
    }

    function actualizarKPIs() {
      document.getElementById('kpi-estudiantes').innerText = DB.estudiantes.length;
      document.getElementById('kpi-carreras').innerText = DB.carreras.length;
      document.getElementById('kpi-cursos').innerText = DB.cursos.length;

      const totalCal = DB.calificaciones.length;
      if (totalCal > 0) {
        const aprobados = DB.calificaciones.filter(c => c.notaFinal >= 61).length;
        const pct = Math.round((aprobados / totalCal) * 100);
        document.getElementById('kpi-aprobacion').innerText = pct + '%';
      } else {
        document.getElementById('kpi-aprobacion').innerText = '0%';
      }
    }

    function renderizarCarrerasResumen() {
      const contenedor = document.getElementById('lista-carreras-resumen');
      contenedor.innerHTML = '';
      DB.carreras.forEach(car => {
        const cantEst = DB.estudiantes.filter(e => e.carreraId === car.id).length;
        const cursosCar = DB.cursos.filter(c => c.carreraId === car.id).length;
        const div = document.createElement('div');
        div.className = 'p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between';
        div.innerHTML = \`
          <div class="flex items-center space-x-3">
            <span class="w-3.5 h-3.5 rounded-full" style="background-color: \${car.color || '#2563EB'}"></span>
            <div>
              <h4 class="font-bold text-slate-800 text-sm">\${car.nombre}</h4>
              <p class="text-xs text-slate-500">\${car.resolucion} • \${car.duracionSemestres} Semestres</p>
            </div>
          </div>
          <div class="flex items-center space-x-4 text-xs font-semibold">
            <span class="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg">\${cantEst} alumnos</span>
            <span class="bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg">\${cursosCar} materias</span>
          </div>
        \`;
        contenedor.appendChild(div);
      });
    }

    function poblarSelectores() {
      const selCarEst = document.getElementById('filtro-carrera-estudiante');
      const selCarModal = document.getElementById('form-est-carrera');
      const selCarAdmin = document.getElementById('filtro-carrera-cursos-admin');
      const selCarCalif = document.getElementById('select-calif-carrera');
      const selEstBol = document.getElementById('select-estudiante-boletin');

      // Limpiar opciones preservando primera si aplica
      selCarEst.innerHTML = '<option value="">Todas las Carreras</option>';
      selCarModal.innerHTML = '';
      selCarAdmin.innerHTML = '<option value="">Todas las Carreras</option>';
      selCarCalif.innerHTML = '';
      selEstBol.innerHTML = '';

      DB.carreras.forEach(c => {
        selCarEst.innerHTML += \`<option value="\${c.id}">\${c.nombre}</option>\`;
        selCarModal.innerHTML += \`<option value="\${c.id}">\${c.nombre} (\${c.codigo})</option>\`;
        selCarAdmin.innerHTML += \`<option value="\${c.id}">\${c.nombre}</option>\`;
        selCarCalif.innerHTML += \`<option value="\${c.id}">\${c.nombre}</option>\`;
      });

      DB.estudiantes.forEach(e => {
        selEstBol.innerHTML += \`<option value="\${e.id}">\${e.apellidos}, \${e.nombres} (\${e.codigo})</option>\`;
      });
    }

    function renderizarEstudiantes() {
      const tbody = document.getElementById('tabla-estudiantes-body');
      tbody.innerHTML = '';
      const filtroTxt = (document.getElementById('filtro-busqueda-estudiante').value || '').toLowerCase();
      const filtroCar = document.getElementById('filtro-carrera-estudiante').value;
      const filtroTurno = document.getElementById('filtro-turno-estudiante').value;

      const filtrados = DB.estudiantes.filter(e => {
        const matchTxt = (e.nombres + ' ' + e.apellidos + ' ' + e.ci + ' ' + e.codigo).toLowerCase().includes(filtroTxt);
        const matchCar = !filtroCar || e.carreraId === filtroCar;
        const matchTurno = !filtroTurno || e.turno === filtroTurno;
        return matchTxt && matchCar && matchTurno;
      });

      if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400">No se encontraron estudiantes inscritos</td></tr>';
        return;
      }

      filtrados.forEach(est => {
        const car = DB.carreras.find(c => c.id === est.carreraId);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50 transition';
        tr.innerHTML = \`
          <td class="px-5 py-3.5">
            <span class="font-mono font-bold text-blue-900 block">\${est.codigo}</span>
            <span class="text-xs text-slate-500">CI: \${est.ci} \${est.expedido}</span>
          </td>
          <td class="px-5 py-3.5 font-medium text-slate-800">
            \${est.apellidos}, \${est.nombres}
          </td>
          <td class="px-5 py-3.5">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold" style="background-color: \${(car?.color || '#2563EB') + '20'}; color: \${car?.color || '#2563EB'}">
              \${car?.nombre || 'General'}
            </span>
          </td>
          <td class="px-5 py-3.5 text-slate-600">
            Semestre \${est.semestreActual || 1} • <span class="font-semibold">\${est.turno}</span>
          </td>
          <td class="px-5 py-3.5 text-xs text-slate-600">
            <div>📞 \${est.telefono}</div>
            <div class="text-slate-400">\${est.email || '-'}</div>
          </td>
          <td class="px-5 py-3.5">
            <span class="px-2 py-0.5 rounded-full text-xs font-bold \${est.estado === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
              \${est.estado || 'Activo'}
            </span>
          </td>
          <td class="px-5 py-3.5 text-right space-x-1.5">
            <button onclick="verBoletinDeEstudiante('\${est.id}')" title="Ver Kárdex" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
              <i data-lucide="award" class="w-4 h-4"></i>
            </button>
            <button onclick="eliminarEstudiante('\${est.id}')" title="Eliminar" class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        \`;
        tbody.appendChild(tr);
      });
      lucide.createIcons();
    }

    function filtrarEstudiantes() {
      renderizarEstudiantes();
    }

    function abrirModalInscripcion() {
      document.getElementById('form-estudiante').reset();
      document.getElementById('form-est-id').value = '';
      document.getElementById('modal-inscripcion-titulo').innerText = 'Inscripción de Nuevo Estudiante';
      document.getElementById('modal-inscripcion').classList.remove('hidden');
    }

    function cerrarModalInscripcion() {
      document.getElementById('modal-inscripcion').classList.add('hidden');
    }

    function guardarEstudianteSubmit(e) {
      e.preventDefault();
      const id = document.getElementById('form-est-id').value || ('est-' + (DB.estudiantes.length + 1));
      const anio = new Date().getFullYear();
      const numPad = String(DB.estudiantes.length + 1).padStart(3, '0');
      const codigo = document.getElementById('form-est-codigo').value || ('IDC-' + anio + '-' + numPad);

      const nuevoEst = {
        id: id,
        codigo: codigo,
        nombres: document.getElementById('form-est-nombres').value,
        apellidos: document.getElementById('form-est-apellidos').value,
        ci: document.getElementById('form-est-ci').value,
        expedido: document.getElementById('form-est-expedido').value,
        telefono: document.getElementById('form-est-telefono').value,
        email: document.getElementById('form-est-email').value,
        carreraId: document.getElementById('form-est-carrera').value,
        semestreActual: parseInt(document.getElementById('form-est-semestre').value) || 1,
        turno: document.getElementById('form-est-turno').value,
        estado: 'Activo'
      };

      // Si existe Apps Script se invoca en servidor
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
          .withSuccessHandler(() => {
            mostrarAlerta('Estudiante guardado exitosamente en Google Sheets', 'success');
            recargarDatos();
          })
          .guardarEstudiante(nuevoEst);
      }

      // Guardar también localmente para respuesta inmediata
      const idx = DB.estudiantes.findIndex(x => x.id === id || x.ci === nuevoEst.ci);
      if (idx >= 0) {
        DB.estudiantes[idx] = nuevoEst;
      } else {
        DB.estudiantes.push(nuevoEst);
      }
      guardarLocal();
      cerrarModalInscripcion();
      inicializarVistas();
      mostrarAlerta('Estudiante ' + nuevoEst.nombres + ' registrado con éxito con código: ' + codigo, 'success');
    }

    function eliminarEstudiante(id) {
      if (!confirm('¿Confirma que desea eliminar este estudiante del sistema?')) return;
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.eliminarEstudiante(id);
      }
      DB.estudiantes = DB.estudiantes.filter(e => e.id !== id);
      guardarLocal();
      inicializarVistas();
      mostrarAlerta('Estudiante eliminado', 'info');
    }

    function renderizarCarrerasAdmin() {
      const grid = document.getElementById('grid-carreras-admin');
      grid.innerHTML = '';
      DB.carreras.forEach(car => {
        const div = document.createElement('div');
        div.className = 'bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden';
        div.innerHTML = \`
          <div class="h-2 w-full absolute top-0 left-0" style="background-color: \${car.color || '#2563EB'}"></div>
          <span class="text-xs font-mono font-bold text-slate-400 uppercase">\${car.codigo}</span>
          <h4 class="font-bold text-slate-900 text-base mt-1">\${car.nombre}</h4>
          <p class="text-xs text-slate-500 mt-0.5">\${car.resolucion}</p>
          <div class="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600">
            <span>\${car.duracionSemestres} Semestres</span>
            <span class="font-semibold text-blue-900">\${Array.isArray(car.turnoDisponibles) ? car.turnoDisponibles.join(', ') : car.turnoDisponibles}</span>
          </div>
        \`;
        grid.appendChild(div);
      });
    }

    function renderizarCursosAdmin() {
      const tbody = document.getElementById('tabla-cursos-admin-body');
      tbody.innerHTML = '';
      const filtroCar = document.getElementById('filtro-carrera-cursos-admin').value;
      const cursos = DB.cursos.filter(c => !filtroCar || c.carreraId === filtroCar);

      cursos.forEach(cur => {
        const car = DB.carreras.find(c => c.id === cur.carreraId);
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-50';
        tr.innerHTML = \`
          <td class="px-4 py-3 font-mono font-bold text-blue-900 text-xs">\${cur.codigo}</td>
          <td class="px-4 py-3 font-medium text-slate-800">\${cur.nombre}</td>
          <td class="px-4 py-3 text-xs text-slate-600">\${car?.nombre || '-'}</td>
          <td class="px-4 py-3 text-xs text-slate-600">Semestre \${cur.semestre}</td>
          <td class="px-4 py-3 text-xs text-slate-600">\${cur.cargaHoraria} hrs</td>
          <td class="px-4 py-3 text-xs font-semibold text-slate-700">\${cur.docente || 'Por Asignar'}</td>
          <td class="px-4 py-3 text-right">
            <span class="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">Activo</span>
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function actualizarCursosCalificaciones() {
      const carreraId = document.getElementById('select-calif-carrera').value;
      const selCurso = document.getElementById('select-calif-curso');
      selCurso.innerHTML = '';
      const cursos = DB.cursos.filter(c => !carreraId || c.carreraId === carreraId);
      cursos.forEach(cur => {
        selCurso.innerHTML += \`<option value="\${cur.id}">\${cur.nombre} (\${cur.codigo})</option>\`;
      });
      cargarEstudiantesParaCalificar();
    }

    function cargarEstudiantesParaCalificar() {
      const carreraId = document.getElementById('select-calif-carrera').value;
      const cursoId = document.getElementById('select-calif-curso').value;
      const periodo = document.getElementById('select-calif-periodo').value;
      const tbody = document.getElementById('tabla-calificaciones-body');
      tbody.innerHTML = '';

      const estudiantesCarrera = DB.estudiantes.filter(e => !carreraId || e.carreraId === carreraId);

      if (estudiantesCarrera.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center py-8 text-slate-400">No hay estudiantes en esta carrera</td></tr>';
        return;
      }

      estudiantesCarrera.forEach(est => {
        const calif = DB.calificaciones.find(c => c.estudianteId === est.id && c.cursoId === cursoId) || {
          parcial1: 0, parcial2: 0, practicas: 0, examenFinal: 0, notaFinal: 0,
          estadoFinal: 'Reprobado', asistenciaPorcentaje: 100, observaciones: ''
        };

        const tr = document.createElement('tr');
        tr.id = 'row-calif-' + est.id;
        tr.className = 'hover:bg-slate-50 transition';
        tr.innerHTML = \`
          <td class="px-4 py-3 font-medium text-slate-800">
            <div>\${est.apellidos}, \${est.nombres}</div>
            <div class="text-xs font-mono text-slate-400">\${est.codigo} • CI: \${est.ci}</div>
          </td>
          <td class="px-3 py-3 text-center">
            <input type="number" min="0" max="25" value="\${calif.parcial1}" onchange="recalcularFila('\${est.id}')" id="cal-p1-\${est.id}" class="w-16 px-2 py-1 text-center font-bold border rounded-lg text-sm">
          </td>
          <td class="px-3 py-3 text-center">
            <input type="number" min="0" max="25" value="\${calif.parcial2}" onchange="recalcularFila('\${est.id}')" id="cal-p2-\${est.id}" class="w-16 px-2 py-1 text-center font-bold border rounded-lg text-sm">
          </td>
          <td class="px-3 py-3 text-center">
            <input type="number" min="0" max="25" value="\${calif.practicas}" onchange="recalcularFila('\${est.id}')" id="cal-pr-\${est.id}" class="w-16 px-2 py-1 text-center font-bold border rounded-lg text-sm">
          </td>
          <td class="px-3 py-3 text-center">
            <input type="number" min="0" max="25" value="\${calif.examenFinal}" onchange="recalcularFila('\${est.id}')" id="cal-fn-\${est.id}" class="w-16 px-2 py-1 text-center font-bold border rounded-lg text-sm">
          </td>
          <td class="px-3 py-3 text-center font-mono font-black text-base" id="cal-tot-\${est.id}">
            \${calif.notaFinal}
          </td>
          <td class="px-3 py-3 text-center" id="cal-badge-\${est.id}">
            \${obtenerBadgeEstado(calif.notaFinal)}
          </td>
          <td class="px-3 py-3 text-center">
            <input type="number" min="0" max="100" value="\${calif.asistenciaPorcentaje || 100}" id="cal-ast-\${est.id}" class="w-16 px-2 py-1 text-center border rounded-lg text-xs">
          </td>
          <td class="px-3 py-3">
            <input type="text" value="\${calif.observaciones || ''}" placeholder="Observaciones..." id="cal-obs-\${est.id}" class="w-full px-2 py-1 border rounded-lg text-xs">
          </td>
        \`;
        tbody.appendChild(tr);
      });
    }

    function recalcularFila(estId) {
      const p1 = Math.min(25, Math.max(0, parseFloat(document.getElementById('cal-p1-' + estId).value) || 0));
      const p2 = Math.min(25, Math.max(0, parseFloat(document.getElementById('cal-p2-' + estId).value) || 0));
      const pr = Math.min(25, Math.max(0, parseFloat(document.getElementById('cal-pr-' + estId).value) || 0));
      const fn = Math.min(25, Math.max(0, parseFloat(document.getElementById('cal-fn-' + estId).value) || 0));
      const total = Math.round(p1 + p2 + pr + fn);

      document.getElementById('cal-tot-' + estId).innerText = total;
      document.getElementById('cal-badge-' + estId).innerHTML = obtenerBadgeEstado(total);
    }

    function obtenerBadgeEstado(nota) {
      if (nota >= 61) {
        return '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">Aprobado</span>';
      } else if (nota >= 40) {
        return '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">2do Turno</span>';
      } else {
        return '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">Reprobado</span>';
      }
    }

    function guardarTodasLasCalificaciones() {
      const carreraId = document.getElementById('select-calif-carrera').value;
      const cursoId = document.getElementById('select-calif-curso').value;
      const periodo = document.getElementById('select-calif-periodo').value;
      const estudiantesCarrera = DB.estudiantes.filter(e => !carreraId || e.carreraId === carreraId);

      estudiantesCarrera.forEach(est => {
        const p1 = parseFloat(document.getElementById('cal-p1-' + est.id).value) || 0;
        const p2 = parseFloat(document.getElementById('cal-p2-' + est.id).value) || 0;
        const pr = parseFloat(document.getElementById('cal-pr-' + est.id).value) || 0;
        const fn = parseFloat(document.getElementById('cal-fn-' + est.id).value) || 0;
        const ast = parseFloat(document.getElementById('cal-ast-' + est.id).value) || 100;
        const obs = document.getElementById('cal-obs-' + est.id).value;
        const total = Math.round(p1 + p2 + pr + fn);

        let estadoFinal = 'Reprobado';
        if (total >= 61) estadoFinal = 'Aprobado';
        else if (total >= 40) estadoFinal = 'Segundo Turno';

        const califObj = {
          id: 'cal-' + est.id + '-' + cursoId,
          estudianteId: est.id,
          codigoEstudiante: est.codigo,
          cursoId: cursoId,
          carreraId: carreraId,
          periodo: periodo,
          parcial1: p1,
          parcial2: p2,
          practicas: pr,
          examenFinal: fn,
          notaFinal: total,
          estadoFinal: estadoFinal,
          asistenciaPorcentaje: ast,
          observaciones: obs
        };

        if (typeof google !== 'undefined' && google.script && google.script.run) {
          google.script.run.guardarCalificacion(califObj);
        }

        const idx = DB.calificaciones.findIndex(c => c.estudianteId === est.id && c.cursoId === cursoId);
        if (idx >= 0) {
          DB.calificaciones[idx] = califObj;
        } else {
          DB.calificaciones.push(califObj);
        }
      });

      guardarLocal();
      actualizarKPIs();
      mostrarAlerta('Calificaciones guardadas exitosamente en Google Sheets', 'success');
    }

    function verBoletinDeEstudiante(estId) {
      document.getElementById('select-estudiante-boletin').value = estId;
      cambiarVista('boletin');
      cargarBoletinEstudiante();
    }

    function cargarBoletinEstudiante() {
      const estId = document.getElementById('select-estudiante-boletin').value;
      const est = DB.estudiantes.find(e => e.id === estId) || DB.estudiantes[0];
      if (!est) return;

      const car = DB.carreras.find(c => c.id === est.carreraId);
      document.getElementById('bol-codigo').innerText = est.codigo;
      document.getElementById('bol-nombre').innerText = est.apellidos + ', ' + est.nombres;
      document.getElementById('bol-ci').innerText = est.ci + ' ' + (est.expedido || 'CB');
      document.getElementById('bol-carrera').innerText = car?.nombre || 'Técnico Superior';
      document.getElementById('bol-semestre').innerText = (est.semestreActual || 1) + 'º Semestre';
      document.getElementById('bol-turno').innerText = est.turno;

      // Materias de su carrera
      const materias = DB.cursos.filter(c => c.carreraId === est.carreraId);
      const tbody = document.getElementById('bol-tabla-materias');
      tbody.innerHTML = '';

      let sumaNotas = 0;
      let countNotas = 0;
      let reprobados = 0;

      materias.forEach(mat => {
        const cal = DB.calificaciones.find(c => c.estudianteId === est.id && c.cursoId === mat.id) || {
          parcial1: 0, parcial2: 0, practicas: 0, examenFinal: 0, notaFinal: 0, estadoFinal: 'Sin Calificar'
        };

        if (cal.notaFinal > 0) {
          sumaNotas += cal.notaFinal;
          countNotas++;
          if (cal.notaFinal < 61) reprobados++;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td class="p-2.5 font-mono text-slate-500">\${mat.codigo}</td>
          <td class="p-2.5 font-semibold text-slate-800">\${mat.nombre}</td>
          <td class="p-2.5 text-center">\${cal.parcial1}</td>
          <td class="p-2.5 text-center">\${cal.parcial2}</td>
          <td class="p-2.5 text-center">\${cal.practicas}</td>
          <td class="p-2.5 text-center">\${cal.examenFinal}</td>
          <td class="p-2.5 text-center font-bold text-slate-900">\${cal.notaFinal}</td>
          <td class="p-2.5 text-center">
            <span class="font-bold text-xs \${cal.notaFinal >= 61 ? 'text-emerald-700' : (cal.notaFinal >= 40 ? 'text-amber-700' : 'text-red-700')}">
              \${cal.estadoFinal}
            </span>
          </td>
        \`;
        tbody.appendChild(tr);
      });

      const promedio = countNotas > 0 ? Math.round(sumaNotas / countNotas) : 0;
      document.getElementById('bol-promedio').innerText = promedio + ' / 100';

      const cond = document.getElementById('bol-condicion');
      if (promedio >= 61 && reprobados === 0) {
        cond.innerText = 'PROMOVIDO / SATISFACTORIO';
        cond.className = 'ml-2 font-black text-xs px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800';
      } else if (reprobados > 0 && promedio >= 40) {
        cond.innerText = 'HABILITADO A 2DO TURNO';
        cond.className = 'ml-2 font-black text-xs px-3 py-1 rounded-lg bg-amber-100 text-amber-800';
      } else {
        cond.innerText = 'EN REGULARIZACIÓN';
        cond.className = 'ml-2 font-black text-xs px-3 py-1 rounded-lg bg-slate-200 text-slate-700';
      }
    }

    function mostrarAlerta(mensaje, tipo) {
      const banner = document.getElementById('alert-banner');
      const txt = document.getElementById('alert-text');
      txt.innerText = mensaje;
      banner.className = 'mb-6 p-4 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm ' + 
        (tipo === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-blue-50 text-blue-800 border border-blue-200');
      banner.classList.remove('hidden');
      setTimeout(() => banner.classList.add('hidden'), 5000);
      lucide.createIcons();
    }

    function cerrarAlerta() {
      document.getElementById('alert-banner').classList.add('hidden');
    }
  </script>
</body>
</html>
`;
