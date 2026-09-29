import { 
  Carrera, 
  Materia, 
  CursoAcelerado, 
  Estudiante, 
  Calificacion, 
  ConfiguracionInstituto, 
  InscripcionCursoAcelerado,
  HORARIOS_CURSOS_ACELERADOS,
  CostoCarrera,
  PagoCuotaEstudiante
} from '../types';

export const INSTITUTO_CONFIG: ConfiguracionInstituto = {
  nombre: 'INSTITUTO TECNOLÓGICO ING DATA COMP',
  siglas: 'ING DATA COMP',
  subtitulo: 'Sistema Integrado de Gestión Académica e Inscripciones',
  ciudad: 'Cochabamba',
  departamento: 'Cochabamba',
  pais: 'Bolivia',
  direccion: 'Av. Heroínas esq. Ayacucho, Edificio Tecnológico 4to Piso',
  telefono: '+591 4 4528900 / +591 76912345',
  email: 'informaciones@ingdatacomp.edu.bo',
  resolucionMinisterial: 'R.M. No. 0397/2024',
  directorAcademico: 'Ing. Grover Marcelo Arispe R.',
  secretariaGeneral: 'Lic. Claudia Villarroel M.',
  gestionActual: '2026',
  periodoActual: 'Gestión Anual 2026',
  escalaMinAprobacion: 51,
  escalaMinSegundoTurno: 40
};

/**
 * CARRERAS PROFESIONALES OFICIALES (Régimen Anualizado - 3 Años)
 * Título en Provisión Nacional otorgado bajo R.M. No. 0397/2024
 */
export const CARRERAS_INICIALES: Carrera[] = [
  {
    id: 'car-1',
    codigo: 'SIS-INF',
    nombre: 'Sistemas Informáticos',
    resolucion: 'R.M. No. 0397/2024',
    duracionAnios: 3,
    regimen: 'Anualizado',
    turnoDisponibles: ['Mañana', 'Noche', 'Sábado'],
    color: '#1E3A8A'
  },
  {
    id: 'car-2',
    codigo: 'DIS-GRA',
    nombre: 'Diseño Gráfico',
    resolucion: 'R.M. No. 0397/2024',
    duracionAnios: 3,
    regimen: 'Anualizado',
    turnoDisponibles: ['Mañana', 'Tarde', 'Noche'],
    color: '#EA580C'
  },
  {
    id: 'car-3',
    codigo: 'INF-IND',
    nombre: 'Informática Industrial',
    resolucion: 'R.M. No. 0397/2024',
    duracionAnios: 3,
    regimen: 'Anualizado',
    turnoDisponibles: ['Mañana', 'Tarde', 'Noche'],
    color: '#0284C7'
  },
  {
    id: 'car-4',
    codigo: 'CON-GEN',
    nombre: 'Contaduría General',
    resolucion: 'R.M. No. 0397/2024',
    duracionAnios: 3,
    regimen: 'Anualizado',
    turnoDisponibles: ['Mañana', 'Noche', 'Sábado'],
    color: '#16A34A'
  }
];

/**
 * Asignaturas Anuales Oficiales del Instituto Tecnológico ING DATA COMP
 * Malla Curricular Anualizada (1er Año, 2do Año, 3er Año)
 */
export const MATERIAS_INICIALES: Materia[] = [
  // --- CARRERA 1: SISTEMAS INFORMÁTICOS (car-1) ---
  // 1er Año
  {
    id: 'mat-sis-101',
    carreraId: 'car-1',
    anio: 1,
    codigo: 'SIS-101',
    nombre: 'Programación I y Lógica de Algoritmos',
    cargaHoraria: 160,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-sis-102',
    carreraId: 'car-1',
    anio: 1,
    codigo: 'SIS-102',
    nombre: 'Arquitectura y Mantenimiento de Computadoras',
    cargaHoraria: 120,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-sis-103',
    carreraId: 'car-1',
    anio: 1,
    codigo: 'SIS-103',
    nombre: 'Sistemas Operativos y Entornos Linux',
    cargaHoraria: 120,
    docente: 'Ing. Carlos Mamani Torrico',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-sis-104',
    carreraId: 'car-1',
    anio: 1,
    codigo: 'SIS-104',
    nombre: 'Matemática y Lógica Computacional',
    cargaHoraria: 100,
    docente: 'Lic. Ramiro Sanchez Morales',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-sis-105',
    carreraId: 'car-1',
    anio: 1,
    codigo: 'SIS-105',
    nombre: 'Ofimática Avanzada y Herramientas Digitales con IA',
    cargaHoraria: 80,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-sis-106',
    carreraId: 'car-1',
    anio: 1,
    codigo: 'SIS-106',
    nombre: 'Inglés Técnico I',
    cargaHoraria: 80,
    docente: 'Lic. Patricia Flores',
    prerrequisito: 'Ninguno'
  },

  // 2do Año
  {
    id: 'mat-sis-201',
    carreraId: 'car-1',
    anio: 2,
    codigo: 'SIS-201',
    nombre: 'Programación II y Estructura de Datos (POO)',
    cargaHoraria: 160,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'SIS-101'
  },
  {
    id: 'mat-sis-202',
    carreraId: 'car-1',
    anio: 2,
    codigo: 'SIS-202',
    nombre: 'Bases de Datos I (SQL Server y Modelado)',
    cargaHoraria: 140,
    docente: 'Ing. Carlos Mamani Torrico',
    prerrequisito: 'SIS-101'
  },
  {
    id: 'mat-sis-203',
    carreraId: 'car-1',
    anio: 2,
    codigo: 'SIS-203',
    nombre: 'Análisis y Diseño de Sistemas',
    cargaHoraria: 120,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'SIS-101'
  },
  {
    id: 'mat-sis-204',
    carreraId: 'car-1',
    anio: 2,
    codigo: 'SIS-204',
    nombre: 'Redes de Computadoras y Telecomunicaciones',
    cargaHoraria: 120,
    docente: 'Ing. Paola Claure Mercado',
    prerrequisito: 'SIS-102'
  },
  {
    id: 'mat-sis-205',
    carreraId: 'car-1',
    anio: 2,
    codigo: 'SIS-205',
    nombre: 'Inteligencia Artificial Aplicada a la Programación',
    cargaHoraria: 100,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'SIS-101'
  },
  {
    id: 'mat-sis-206',
    carreraId: 'car-1',
    anio: 2,
    codigo: 'SIS-206',
    nombre: 'Inglés Técnico II',
    cargaHoraria: 80,
    docente: 'Lic. Patricia Flores',
    prerrequisito: 'SIS-106'
  },

  // 3er Año
  {
    id: 'mat-sis-301',
    carreraId: 'car-1',
    anio: 3,
    codigo: 'SIS-301',
    nombre: 'Desarrollo Web Full-Stack y Aplicaciones Móviles',
    cargaHoraria: 160,
    docente: 'Ing. Paola Claure Mercado',
    prerrequisito: 'SIS-201'
  },
  {
    id: 'mat-sis-302',
    carreraId: 'car-1',
    anio: 3,
    codigo: 'SIS-302',
    nombre: 'Bases de Datos II (NoSQL y Big Data)',
    cargaHoraria: 120,
    docente: 'Ing. Carlos Mamani Torrico',
    prerrequisito: 'SIS-202'
  },
  {
    id: 'mat-sis-303',
    carreraId: 'car-1',
    anio: 3,
    codigo: 'SIS-303',
    nombre: 'Ciberseguridad y Auditoría Informática',
    cargaHoraria: 120,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'SIS-204'
  },
  {
    id: 'mat-sis-304',
    carreraId: 'car-1',
    anio: 3,
    codigo: 'SIS-304',
    nombre: 'Taller de Grado y Proyectos de Titulación',
    cargaHoraria: 140,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'SIS-203'
  },
  {
    id: 'mat-sis-305',
    carreraId: 'car-1',
    anio: 3,
    codigo: 'SIS-305',
    nombre: 'Emprendimiento y Gestión Tecnológica',
    cargaHoraria: 80,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },

  // --- CARRERA 2: DISEÑO GRÁFICO (car-2) ---
  // 1er Año
  {
    id: 'mat-dis-101',
    carreraId: 'car-2',
    anio: 1,
    codigo: 'DIS-101',
    nombre: 'Dibujo Artístico y Composición Visual',
    cargaHoraria: 140,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-dis-102',
    carreraId: 'car-2',
    anio: 1,
    codigo: 'DIS-102',
    nombre: 'Teoría del Color y Tipografía',
    cargaHoraria: 120,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-dis-103',
    carreraId: 'car-2',
    anio: 1,
    codigo: 'DIS-103',
    nombre: 'Ilustración Digital Vectorial (Adobe Illustrator)',
    cargaHoraria: 160,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-dis-104',
    carreraId: 'car-2',
    anio: 1,
    codigo: 'DIS-104',
    nombre: 'Edición y Tratamiento de Imágenes (Photoshop)',
    cargaHoraria: 160,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-dis-105',
    carreraId: 'car-2',
    anio: 1,
    codigo: 'DIS-105',
    nombre: 'Fundamentos del Diseño y Comunicación Visual',
    cargaHoraria: 100,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-dis-106',
    carreraId: 'car-2',
    anio: 1,
    codigo: 'DIS-106',
    nombre: 'Historia del Arte y Diseño Publicitario',
    cargaHoraria: 80,
    docente: 'Lic. Patricia Flores',
    prerrequisito: 'Ninguno'
  },

  // 2do Año
  {
    id: 'mat-dis-201',
    carreraId: 'car-2',
    anio: 2,
    codigo: 'DIS-201',
    nombre: 'Diseño Editorial y Maquetación Digital (InDesign)',
    cargaHoraria: 140,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'DIS-103'
  },
  {
    id: 'mat-dis-202',
    carreraId: 'car-2',
    anio: 2,
    codigo: 'DIS-202',
    nombre: 'Identidad Corporativa, Branding y Logotipos',
    cargaHoraria: 140,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'DIS-103'
  },
  {
    id: 'mat-dis-203',
    carreraId: 'car-2',
    anio: 2,
    codigo: 'DIS-203',
    nombre: 'Publicidad Digital y Marketing Visual en Redes Sociales',
    cargaHoraria: 120,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'DIS-104'
  },
  {
    id: 'mat-dis-204',
    carreraId: 'car-2',
    anio: 2,
    codigo: 'DIS-204',
    nombre: 'Animación Digital y Motion Graphics 2D (After Effects)',
    cargaHoraria: 160,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'DIS-104'
  },
  {
    id: 'mat-dis-205',
    carreraId: 'car-2',
    anio: 2,
    codigo: 'DIS-205',
    nombre: 'Preprensa, Serigrafía y Procesos de Impresión',
    cargaHoraria: 100,
    docente: 'Téc. Rodrigo Velasquez C.',
    prerrequisito: 'DIS-103'
  },
  {
    id: 'mat-dis-206',
    carreraId: 'car-2',
    anio: 2,
    codigo: 'DIS-206',
    nombre: 'Diseño de Empaques y Packaging',
    cargaHoraria: 100,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'DIS-103'
  },

  // 3er Año
  {
    id: 'mat-dis-301',
    carreraId: 'car-2',
    anio: 3,
    codigo: 'DIS-301',
    nombre: 'Modelado y Renderizado 3D Publicitario (Blender)',
    cargaHoraria: 160,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'DIS-204'
  },
  {
    id: 'mat-dis-302',
    carreraId: 'car-2',
    anio: 3,
    codigo: 'DIS-302',
    nombre: 'Diseño de Interfaces Web y UI/UX (Figma)',
    cargaHoraria: 140,
    docente: 'Ing. Paola Claure Mercado',
    prerrequisito: 'DIS-201'
  },
  {
    id: 'mat-dis-303',
    carreraId: 'car-2',
    anio: 3,
    codigo: 'DIS-303',
    nombre: 'Producción Audiovisual y Efectos Visuales (Premiere)',
    cargaHoraria: 140,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'DIS-204'
  },
  {
    id: 'mat-dis-304',
    carreraId: 'car-2',
    anio: 3,
    codigo: 'DIS-304',
    nombre: 'Campañas Publicitarias y Portafolio Profesional',
    cargaHoraria: 120,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'DIS-202'
  },
  {
    id: 'mat-dis-305',
    carreraId: 'car-2',
    anio: 3,
    codigo: 'DIS-305',
    nombre: 'Taller de Grado y Proyectos de Titulación en Diseño',
    cargaHoraria: 140,
    docente: 'Lic. Marcelo Rivas Morales',
    prerrequisito: 'DIS-202'
  },
  {
    id: 'mat-dis-306',
    carreraId: 'car-2',
    anio: 3,
    codigo: 'DIS-306',
    nombre: 'Emprendimiento y Gestión de Agencias de Diseño',
    cargaHoraria: 80,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },

  // --- CARRERA 3: INFORMÁTICA INDUSTRIAL (car-3) ---
  // 1er Año
  {
    id: 'mat-ind-101',
    carreraId: 'car-3',
    anio: 1,
    codigo: 'IND-101',
    nombre: 'Circuitos Eléctricos y Mediciones Industriales',
    cargaHoraria: 140,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-ind-102',
    carreraId: 'car-3',
    anio: 1,
    codigo: 'IND-102',
    nombre: 'Electrónica Digital y Microcontroladores',
    cargaHoraria: 140,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-ind-103',
    carreraId: 'car-3',
    anio: 1,
    codigo: 'IND-103',
    nombre: 'Programación de Computadoras y Algoritmos Industriales',
    cargaHoraria: 140,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-ind-104',
    carreraId: 'car-3',
    anio: 1,
    codigo: 'IND-104',
    nombre: 'Arquitectura de Hardware y Mantenimiento Industrial',
    cargaHoraria: 120,
    docente: 'Ing. Carlos Mamani Torrico',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-ind-105',
    carreraId: 'car-3',
    anio: 1,
    codigo: 'IND-105',
    nombre: 'Física Aplicada y Metrología Industrial',
    cargaHoraria: 100,
    docente: 'Lic. Ramiro Sanchez Morales',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-ind-106',
    carreraId: 'car-3',
    anio: 1,
    codigo: 'IND-106',
    nombre: 'Seguridad Ocupacional y Medio Ambiente Industrial',
    cargaHoraria: 80,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'Ninguno'
  },

  // 2do Año
  {
    id: 'mat-ind-201',
    carreraId: 'car-3',
    anio: 2,
    codigo: 'IND-201',
    nombre: 'Controladores Lógicos Programables (PLC Siemens)',
    cargaHoraria: 160,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'IND-101'
  },
  {
    id: 'mat-ind-202',
    carreraId: 'car-3',
    anio: 2,
    codigo: 'IND-202',
    nombre: 'Instrumentación y Sensores Industriales',
    cargaHoraria: 140,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'IND-102'
  },
  {
    id: 'mat-ind-203',
    carreraId: 'car-3',
    anio: 2,
    codigo: 'IND-203',
    nombre: 'Sistemas Neumáticos y Electroneumáticos',
    cargaHoraria: 120,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'IND-101'
  },
  {
    id: 'mat-ind-204',
    carreraId: 'car-3',
    anio: 2,
    codigo: 'IND-204',
    nombre: 'Programación en C++ y Python para Automatización',
    cargaHoraria: 140,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'IND-103'
  },
  {
    id: 'mat-ind-205',
    carreraId: 'car-3',
    anio: 2,
    codigo: 'IND-205',
    nombre: 'Redes de Comunicación Industrial y Buses de Campo',
    cargaHoraria: 120,
    docente: 'Ing. Paola Claure Mercado',
    prerrequisito: 'IND-102'
  },
  {
    id: 'mat-ind-206',
    carreraId: 'car-3',
    anio: 2,
    codigo: 'IND-206',
    nombre: 'Mantenimiento y Diagnóstico de Sistemas Industriales',
    cargaHoraria: 100,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'IND-104'
  },

  // 3er Año
  {
    id: 'mat-ind-301',
    carreraId: 'car-3',
    anio: 3,
    codigo: 'IND-301',
    nombre: 'Sistemas SCADA y Supervisión HMI',
    cargaHoraria: 140,
    docente: 'Ing. Carlos Mamani Torrico',
    prerrequisito: 'IND-201'
  },
  {
    id: 'mat-ind-302',
    carreraId: 'car-3',
    anio: 3,
    codigo: 'IND-302',
    nombre: 'Robótica Industrial y Manipuladores',
    cargaHoraria: 160,
    docente: 'Ing. Grover Marcelo Arispe R.',
    prerrequisito: 'IND-201'
  },
  {
    id: 'mat-ind-303',
    carreraId: 'car-3',
    anio: 3,
    codigo: 'IND-303',
    nombre: 'Control de Procesos y Variadores de Frecuencia',
    cargaHoraria: 140,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'IND-201'
  },
  {
    id: 'mat-ind-304',
    carreraId: 'car-3',
    anio: 3,
    codigo: 'IND-304',
    nombre: 'Internet de las Cosas Industrial (IIoT) y Telemetría',
    cargaHoraria: 120,
    docente: 'Ing. Carlos Mamani Torrico',
    prerrequisito: 'IND-205'
  },
  {
    id: 'mat-ind-305',
    carreraId: 'car-3',
    anio: 3,
    codigo: 'IND-305',
    nombre: 'Taller de Grado y Proyectos en Automatización Industrial',
    cargaHoraria: 140,
    docente: 'Ing. Fernando Quispe Laura',
    prerrequisito: 'IND-201'
  },
  {
    id: 'mat-ind-306',
    carreraId: 'car-3',
    anio: 3,
    codigo: 'IND-306',
    nombre: 'Gestión de Proyectos Industriales y Emprendimiento',
    cargaHoraria: 80,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },

  // --- CARRERA 4: CONTADURÍA GENERAL (car-4) ---
  // 1er Año
  {
    id: 'mat-con-101',
    carreraId: 'car-4',
    anio: 1,
    codigo: 'CON-101',
    nombre: 'Contabilidad Básica I',
    cargaHoraria: 160,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-con-102',
    carreraId: 'car-4',
    anio: 1,
    codigo: 'CON-102',
    nombre: 'Documentos Mercantiles y Archivos',
    cargaHoraria: 100,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-con-103',
    carreraId: 'car-4',
    anio: 1,
    codigo: 'CON-103',
    nombre: 'Matemática Financiera y Comercial',
    cargaHoraria: 100,
    docente: 'Lic. Ramiro Sanchez Morales',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-con-104',
    carreraId: 'car-4',
    anio: 1,
    codigo: 'CON-104',
    nombre: 'Informática Aplicada a la Contabilidad y Excel Avanzado',
    cargaHoraria: 120,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-con-105',
    carreraId: 'car-4',
    anio: 1,
    codigo: 'CON-105',
    nombre: 'Legislación Laboral y Seguridad Social Boliviana',
    cargaHoraria: 80,
    docente: 'Lic. Javier Villarroel Salazar',
    prerrequisito: 'Ninguno'
  },
  {
    id: 'mat-con-106',
    carreraId: 'car-4',
    anio: 1,
    codigo: 'CON-106',
    nombre: 'Administración General y Organización Empresarial',
    cargaHoraria: 80,
    docente: 'Lic. Claudia Villarroel M.',
    prerrequisito: 'Ninguno'
  },

  // 2do Año
  {
    id: 'mat-con-201',
    carreraId: 'car-4',
    anio: 2,
    codigo: 'CON-201',
    nombre: 'Contabilidad Intermedia y Estados Financieros',
    cargaHoraria: 160,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-101'
  },
  {
    id: 'mat-con-202',
    carreraId: 'car-4',
    anio: 2,
    codigo: 'CON-202',
    nombre: 'Paquetes Contables y Plataforma SIAT en Línea',
    cargaHoraria: 140,
    docente: 'Ing. Carlos Mamani Torrico',
    prerrequisito: 'CON-104'
  },
  {
    id: 'mat-con-203',
    carreraId: 'car-4',
    anio: 2,
    codigo: 'CON-203',
    nombre: 'Contabilidad de Costos Industriales I',
    cargaHoraria: 120,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-101'
  },
  {
    id: 'mat-con-204',
    carreraId: 'car-4',
    anio: 2,
    codigo: 'CON-204',
    nombre: 'Legislación Tributaria y Código Tributario Boliviano',
    cargaHoraria: 100,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-101'
  },
  {
    id: 'mat-con-205',
    carreraId: 'car-4',
    anio: 2,
    codigo: 'CON-205',
    nombre: 'Presupuestos y Control Financiero',
    cargaHoraria: 100,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-201'
  },
  {
    id: 'mat-con-206',
    carreraId: 'car-4',
    anio: 2,
    codigo: 'CON-206',
    nombre: 'Derecho Comercial y Contabilidad de Sociedades',
    cargaHoraria: 100,
    docente: 'Lic. Javier Villarroel Salazar',
    prerrequisito: 'CON-101'
  },

  // 3er Año
  {
    id: 'mat-con-301',
    carreraId: 'car-4',
    anio: 3,
    codigo: 'CON-301',
    nombre: 'Contabilidad Superior, Bancaria y Seguros',
    cargaHoraria: 140,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-201'
  },
  {
    id: 'mat-con-302',
    carreraId: 'car-4',
    anio: 3,
    codigo: 'CON-302',
    nombre: 'Contabilidad Integrada y Gubernamental',
    cargaHoraria: 120,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-201'
  },
  {
    id: 'mat-con-303',
    carreraId: 'car-4',
    anio: 3,
    codigo: 'CON-303',
    nombre: 'Auditoría Financiera, Operacional y Tributaria',
    cargaHoraria: 140,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-201'
  },
  {
    id: 'mat-con-304',
    carreraId: 'car-4',
    anio: 3,
    codigo: 'CON-304',
    nombre: 'Gabinete Contable Computarizado Integral',
    cargaHoraria: 140,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-202'
  },
  {
    id: 'mat-con-305',
    carreraId: 'car-4',
    anio: 3,
    codigo: 'CON-305',
    nombre: 'Taller de Titulación y Proyecto de Grado en Contaduría',
    cargaHoraria: 120,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-201'
  },
  {
    id: 'mat-con-306',
    carreraId: 'car-4',
    anio: 3,
    codigo: 'CON-306',
    nombre: 'Análisis e Interpretación de Estados Financieros',
    cargaHoraria: 80,
    docente: 'Lic. Mariana Torrico Perez',
    prerrequisito: 'CON-201'
  }
];

// Alias de compatibilidad
export const CURSOS_INICIALES: Materia[] = MATERIAS_INICIALES;

/**
 * ID de los 5 Cursos que poseen sub-cursos autorizados:
 * 1. Computación Básica
 * 2. Computación Avanzada
 * 3. Lenguajes de Programación
 * 4. Diseño Gráfico Publicitario
 * 5. Diseño Gráfico Arquitectónico
 */
export const CURSOS_CON_SUB_CURSOS = [
  'ca-comp-basica',
  'ca-comp-avanzada',
  'ca-programacion',
  'ca-diseno-publicitario',
  'ca-diseno-arquitectonico'
];

/**
 * Validador oficial: Los sub-cursos existen ÚNICAMENTE en estos 5 cursos:
 * 1. Computación Básica
 * 2. Computación Avanzada
 * 3. Lenguajes de Programación
 * 4. Diseño Gráfico Publicitario
 * 5. Diseño Gráfico Arquitectónico
 * En todos los demás cursos acelerados NO existen sub-cursos.
 */
export const tieneSubCursosAutorizados = (nombreOId?: string, idSecundario?: string): boolean => {
  const check = (val?: string) => {
    if (!val) return false;
    const norm = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    return (
      norm.includes('computacion basica') ||
      norm.includes('comp-basica') ||
      norm.includes('computacion avanzada') ||
      norm.includes('comp-avanzada') ||
      norm.includes('lenguajes de programacion') ||
      norm.includes('programacion') ||
      norm.includes('diseno grafico publicitario') ||
      norm.includes('diseno-publicitario') ||
      norm.includes('diseno grafico arquitectonico') ||
      norm.includes('diseno-arquitectonico') ||
      CURSOS_CON_SUB_CURSOS.includes(val)
    );
  };

  return check(nombreOId) || check(idSecundario);
};

/**
 * CATÁLOGO OFICIAL DE 16 CURSOS ACELERADOS (ING DATA COMP)
 * Exactamente según la base de datos de Google Sheets del Instituto:
 * 1. Reparación de Celulares
 * 2. Ensamblaje y Rep. de Computadoras
 * 3. Computación Básica (con 12 sub-cursos)
 * 4. Computación Avanzada (con 4 sub-cursos)
 * 5. Inteligencia Artificial para Profesores
 * 6. Robótica Educativa
 * 7. Lenguajes de Programación (con 6 sub-cursos)
 * 8. Diseño Gráfico Publicitario (con 7 sub-cursos)
 * 9. Diseño Gráfico Arquitectónico (con 4 sub-cursos)
 * 10. Diseño y Programación de Sitios WEB
 * 11. Marketing Digital en Redes Sociales
 * 12. Instalación, Adm. de Redes - Internet
 * 13. Historias Animadas con Inteligencia Artificial
 * 14. Diseño en REVIT
 * 15. Solidworks
 * 16. Canva Pro
 */
export const CURSOS_ACELERADOS_INICIALES: CursoAcelerado[] = [
  // 1. Reparación de Celulares (Sin sub-cursos)
  {
    id: 'ca-rep-celulares',
    codigo: 'CA-01',
    nombre: 'Reparación de Celulares',
    descripcion: 'Diagnóstico técnico, cambio de pantallas, microelectrónica, reballing y reparación de software en smartphones.',
    categoria: 'Hardware y Telefonía Móvil',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Téc. Rodrigo Velasquez C.',
    costoBs: 200,
    costosDisponibles: [160, 180, 200, 220],
    horario: '14 a 16',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 20,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 2. Ensamblaje y Rep. de Computadoras (Sin sub-cursos)
  {
    id: 'ca-ensamblaje-comp',
    codigo: 'CA-02',
    nombre: 'Ensamblaje y Rep. de Computadoras',
    descripcion: 'Arquitectura de hardware, ensamble de computadoras Gamer y Oficina, mantenimiento correctivo y preventivo de laptops.',
    categoria: 'Hardware y Soporte Técnico',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Ing. Fernando Quispe Laura',
    costoBs: 200,
    costosDisponibles: [160, 180, 200, 220],
    horario: '10 a 12',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 20,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 3. Computación Básica (Posee 12 sub-cursos)
  {
    id: 'ca-comp-basica',
    codigo: 'CA-03',
    nombre: 'Computación Básica',
    descripcion: 'Formación fundamental en herramientas digitales, ofimática e inteligencia artificial aplicada al trabajo diario.',
    categoria: 'Ofimática y Computación',
    modalidad: 'Presencial',
    duracion: '4 Semanas (40 Horas)',
    cargaHoraria: 40,
    docente: 'Lic. Claudia Villarroel M.',
    costoBs: 180,
    costosDisponibles: [160, 180, 200, 220],
    horario: '8 a 10',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    subCursos: [
      'Microsoft Windows Normal',
      'Microsoft Windows con IA',
      'Microsoft Word Normal',
      'Microsoft Word con IA',
      'Microsoft Excel Normal',
      'Microsoft Excel con IA',
      'Microsoft PowerPoint Normal',
      'Microsoft PowerPoint con IA',
      'Microsoft Access Normal',
      'Microsoft Access con IA',
      'Internet Normal',
      'Curso de IA Basico - General'
    ],
    cupoMaximo: 25,
    inscritos: 3,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-27'
  },

  // 4. Computación Avanzada (Posee 4 sub-cursos avanzados)
  {
    id: 'ca-comp-avanzada',
    codigo: 'CA-04',
    nombre: 'Computación Avanzada',
    descripcion: 'Dominio profesional de procesadores de texto y hojas de cálculo con herramientas avanzadas e IA generativa.',
    categoria: 'Ofimática y Productividad',
    modalidad: 'Presencial',
    duracion: '4 Semanas (40 Horas)',
    cargaHoraria: 40,
    docente: 'Ing. Carlos Mamani Torrico',
    costoBs: 200,
    costosDisponibles: [160, 180, 200, 220],
    horario: '10 a 12',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    subCursos: [
      'Microsoft Word Normal Avanzado',
      'Microsoft Word con IA Avanzado',
      'Microsoft Excel Normal Avanzado',
      'Microsoft Excel con IA Avanzado'
    ],
    cupoMaximo: 25,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-27'
  },

  // 5. Inteligencia Artificial para Profesores (Sin sub-cursos)
  {
    id: 'ca-ia-profesores',
    codigo: 'CA-05',
    nombre: 'Inteligencia Artificial para Profesores',
    descripcion: 'Uso práctico de la inteligencia artificial para planificaciones curriculares, diseño de rúbricas y material pedagógico.',
    categoria: 'Educación e Inteligencia Artificial',
    modalidad: 'Presencial',
    duracion: '4 Semanas (40 Horas)',
    cargaHoraria: 40,
    docente: 'Ing. Grover Marcelo Arispe R.',
    costoBs: 180,
    costosDisponibles: [160, 180, 200, 220],
    horario: '18 a 20',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 25,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-27'
  },

  // 6. Robótica Educativa (Sin sub-cursos)
  {
    id: 'ca-robotica-educativa',
    codigo: 'CA-06',
    nombre: 'Robótica Educativa',
    descripcion: 'Construcción y programación de robots móviles, sensores electrónicos, motores y proyectos interactivos STEM.',
    categoria: 'Robótica y Automatización',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Ing. Andrea Morales Montaño',
    costoBs: 200,
    costosDisponibles: [160, 180, 200, 220],
    horario: '8 a 10',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 20,
    inscritos: 1,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 7. Lenguajes de Programación (Posee 6 sub-cursos)
  {
    id: 'ca-programacion',
    codigo: 'CA-07',
    nombre: 'Lenguajes de Programación',
    descripcion: 'Desarrollo de software moderno, lógica computacional y codificación asistida con inteligencia artificial.',
    categoria: 'Programación y Software',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Ing. Paola Claure Mercado',
    costoBs: 220,
    costosDisponibles: [160, 180, 200, 220, 250],
    horario: '18 a 20',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    subCursos: [
      'Python + Inteligencia Artificial',
      'Desarrollo Web Fullstack (HTML, CSS, JS, React)',
      'Java y Programación Orientada a Objetos',
      'C# y Bases de Datos SQL',
      'PHP y Laravel Moderno',
      'C++ y Lógica de Algoritmos'
    ],
    cupoMaximo: 20,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 8. Diseño Gráfico Publicitario (Posee 7 sub-cursos con IA)
  {
    id: 'ca-diseno-publicitario',
    codigo: 'CA-08',
    nombre: 'Diseño Gráfico Publicitario',
    descripcion: 'Creación visual, edición digital, branding y generación multimedia con herramientas de IA creativa.',
    categoria: 'Diseño y Multimedia',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Lic. Javier Villarroel Salazar',
    costoBs: 200,
    costosDisponibles: [160, 180, 200, 220],
    horario: '14 a 16',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    subCursos: [
      'Adobe Illustrator + IA',
      'Adobe Photoshop + IA',
      'Adobe Premier + IA',
      'Abobe Flash + IA',
      'Indesign + IA',
      '3D studio Max + IA',
      'CINE Y ANIMACIONES CON IA'
    ],
    cupoMaximo: 22,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 9. Diseño Gráfico Arquitectónico (Posee 4 sub-cursos)
  {
    id: 'ca-diseno-arquitectonico',
    codigo: 'CA-09',
    nombre: 'Diseño Gráfico Arquitectónico',
    descripcion: 'Diseño asistido por computadora, modelado 2D/3D y renderizado arquitectónico con asistencia de IA.',
    categoria: 'Diseño Arquitectónico e Industrial',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Arq. Roberto Flores Zeballos',
    costoBs: 220,
    costosDisponibles: [160, 180, 200, 220],
    horario: '16 a 18',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    subCursos: [
      'Autocad + IA',
      'Autocad Avanzado + IA',
      'Vector Work + IA',
      'Solidworks + IA'
    ],
    cupoMaximo: 20,
    inscritos: 1,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 10. Diseño y Programación de Sitios WEB (Sin sub-cursos)
  {
    id: 'ca-diseno-web',
    codigo: 'CA-10',
    nombre: 'Diseño y Programación de Sitios WEB',
    descripcion: 'Maquetación frontend responsiva, programación web interactiva con JavaScript, React y tiendas online.',
    categoria: 'Desarrollo Web',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Ing. Paola Claure Mercado',
    costoBs: 200,
    costosDisponibles: [160, 180, 200, 220],
    horario: '16 a 18',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 22,
    inscritos: 1,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 11. Marketing Digital en Redes Sociales (Sin sub-cursos)
  {
    id: 'ca-marketing-redes',
    codigo: 'CA-11',
    nombre: 'Marketing Digital en Redes Sociales',
    descripcion: 'Estrategias de pauta publicitaria en Meta Ads, generación de contenido viral, TikTok, reels y embudos de ventas.',
    categoria: 'Marketing y Redes Sociales',
    modalidad: 'Presencial',
    duracion: '4 Semanas (40 Horas)',
    cargaHoraria: 40,
    docente: 'Lic. Gabriela Quiroga Beltrán',
    costoBs: 180,
    costosDisponibles: [160, 180, 200, 220],
    horario: '16 a 18',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 25,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-27'
  },

  // 12. Instalación, Adm. de Redes - Internet (Sin sub-cursos)
  {
    id: 'ca-redes-internet',
    codigo: 'CA-12',
    nombre: 'Instalación, Adm. de Redes - Internet',
    descripcion: 'Instalación de cableado estructurado, configuración de switches, routers MikroTik, redes WiFi e internet.',
    categoria: 'Redes y Telecomunicaciones',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Ing. Roberto Flores Zeballos',
    costoBs: 200,
    costosDisponibles: [160, 180, 200, 220],
    horario: '14 a 16',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 20,
    inscritos: 1,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 13. Historias Animadas con Inteligencia Artificial (Sin sub-cursos)
  {
    id: 'ca-historias-animadas-ia',
    codigo: 'CA-13',
    nombre: 'Historias Animadas con Inteligencia Artificial',
    descripcion: 'Producción de cortometrajes animados, guionismo con LLMs, generación de personajes consistentes y animación con IA.',
    categoria: 'Inteligencia Artificial y Multimedia',
    modalidad: 'Presencial',
    duracion: '4 Semanas (40 Horas)',
    cargaHoraria: 40,
    docente: 'Lic. Javier Villarroel Salazar',
    costoBs: 180,
    costosDisponibles: [160, 180, 200, 220],
    horario: '12 a 14',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 22,
    inscritos: 1,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-27'
  },

  // 14. Diseño en REVIT (Sin sub-cursos)
  {
    id: 'ca-diseno-revit',
    codigo: 'CA-14',
    nombre: 'Diseño en REVIT',
    descripcion: 'Modelado arquitectónico BIM con Autodesk Revit, documentación de proyectos, familias paramétricas y cómputos métricos.',
    categoria: 'Arquitectura y Modelado BIM',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Arq. Roberto Flores Zeballos',
    costoBs: 220,
    costosDisponibles: [160, 180, 200, 220],
    horario: '18 a 20',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 20,
    inscritos: 1,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 15. Solidworks (Sin sub-cursos)
  {
    id: 'ca-solidworks',
    codigo: 'CA-15',
    nombre: 'Solidworks',
    descripcion: 'Modelado paramétrico 3D de piezas mecánicas, ensamblajes complejos, generación de planos de taller y simulación.',
    categoria: 'Diseño Mecánico e Industrial',
    modalidad: 'Presencial',
    duracion: '6 Semanas (60 Horas)',
    cargaHoraria: 60,
    docente: 'Ing. Fernando Quispe Laura',
    costoBs: 220,
    costosDisponibles: [160, 180, 200, 220],
    horario: '16 a 18',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 20,
    inscritos: 1,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-04-10'
  },

  // 16. Canva Pro (Sin sub-cursos)
  {
    id: 'ca-canva-pro',
    codigo: 'CA-16',
    nombre: 'Canva Pro',
    descripcion: 'Diseño gráfico ágil para marcas, creación de piezas publicitarias, presentaciones de impacto y herramientas de IA de Canva.',
    categoria: 'Diseño Gráfico y Redes Sociales',
    modalidad: 'Presencial',
    duracion: '4 Semanas (40 Horas)',
    cargaHoraria: 40,
    docente: 'Lic. Claudia Villarroel M.',
    costoBs: 160,
    costosDisponibles: [160, 180, 200, 220],
    horario: '20 a 22',
    horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
    cupoMaximo: 25,
    inscritos: 2,
    estado: 'Inscripciones Abiertas',
    fechaInicio: '2026-03-02',
    fechaFin: '2026-03-27'
  }
];

/**
 * Nómina Inicial de Alumnos Inscritos a Cursos Acelerados
 */
export const INSCRIPCIONES_CURSOS_INICIALES: InscripcionCursoAcelerado[] = [
  {
    id: 'inc-001',
    codigoInscripcion: 'INC-2026-001',
    nombres: 'Alejandro David',
    apellidos: 'Fernandez Torrico',
    ci: '8745129',
    expedido: 'CB',
    telefono: '72234567',
    email: 'alejandro.fernandez@gmail.com',
    cursoId: 'ca-comp-basica',
    cursoNombre: 'Computación Básica',
    subCurso: 'Microsoft Excel con IA',
    horario: '8 a 10',
    modalidad: 'Presencial',
    costoRealBs: 200,
    descuentoBs: 20,
    costoBs: 180,
    montoPagadoBs: 180,
    saldoBs: 0,
    fechaInscripcion: '2026-02-15',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Lic. Claudia Villarroel M.',
    estado: 'Inscrito',
    observaciones: 'Pago completo al contado'
  },
  {
    id: 'inc-002',
    codigoInscripcion: 'INC-2026-002',
    nombres: 'Valeria Nicole',
    apellidos: 'Montaño Gutierrez',
    ci: '9123841',
    expedido: 'CB',
    telefono: '79781234',
    email: 'valeria.montano@hotmail.com',
    cursoId: 'ca-comp-basica',
    cursoNombre: 'Computación Básica',
    subCurso: 'Microsoft Word con IA',
    horario: '8 a 10',
    modalidad: 'Presencial',
    costoRealBs: 200,
    descuentoBs: 20,
    costoBs: 180,
    montoPagadoBs: 100,
    saldoBs: 80,
    fechaInscripcion: '2026-02-16',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Lic. Claudia Villarroel M.',
    estado: 'Inscrito',
    observaciones: 'Saldo pendiente para la segunda semana'
  },
  {
    id: 'inc-003',
    codigoInscripcion: 'INC-2026-003',
    nombres: 'Rodrigo',
    apellidos: 'Condori Mamani',
    ci: '7689123',
    expedido: 'LP',
    telefono: '68451290',
    email: 'rodrigo.condori@gmail.com',
    cursoId: 'ca-comp-basica',
    cursoNombre: 'Computación Básica',
    subCurso: 'Curso de IA Basico - General',
    horario: '10 a 12',
    modalidad: 'Virtual',
    costoRealBs: 220,
    descuentoBs: 20,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-18',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Lic. Claudia Villarroel M.',
    estado: 'Inscrito',
    observaciones: 'Acceso habilitado a la plataforma virtual'
  },
  {
    id: 'inc-004',
    codigoInscripcion: 'INC-2026-004',
    nombres: 'Mariana Sofia',
    apellidos: 'Zeballos Arnez',
    ci: '10294812',
    expedido: 'CB',
    telefono: '71458923',
    email: 'mariana.zeballos@gmail.com',
    cursoId: 'ca-comp-avanzada',
    cursoNombre: 'Computación Avanzada',
    subCurso: 'Microsoft Excel con IA Avanzado',
    horario: '10 a 12',
    modalidad: 'Presencial',
    costoRealBs: 220,
    descuentoBs: 20,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-20',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Ing. Carlos Mamani Torrico',
    estado: 'Inscrito',
    observaciones: 'Estudiante destacada'
  },
  {
    id: 'inc-005',
    codigoInscripcion: 'INC-2026-005',
    nombres: 'Jhoel Cristian',
    apellidos: 'Peralta Rocha',
    ci: '8392104',
    expedido: 'SC',
    telefono: '75489012',
    email: 'jhoel.peralta@gmail.com',
    cursoId: 'ca-programacion',
    cursoNombre: 'Lenguajes de Programación',
    subCurso: 'Python + Inteligencia Artificial',
    horario: '18 a 20',
    modalidad: 'Presencial',
    costoRealBs: 250,
    descuentoBs: 30,
    costoBs: 220,
    montoPagadoBs: 220,
    saldoBs: 0,
    fechaInscripcion: '2026-02-22',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Ing. Paola Claure Mercado',
    estado: 'Inscrito',
    observaciones: 'Trae su propia laptop'
  },
  {
    id: 'inc-006',
    codigoInscripcion: 'INC-2026-006',
    nombres: 'Camila Andrea',
    apellidos: 'Soliz Barrientos',
    ci: '9456123',
    expedido: 'CB',
    telefono: '76451239',
    email: 'camila.soliz@gmail.com',
    cursoId: 'ca-diseno-publicitario',
    cursoNombre: 'Diseño Gráfico Publicitario',
    subCurso: 'Adobe Photoshop + IA',
    horario: '14 a 16',
    modalidad: 'Presencial',
    costoRealBs: 220,
    descuentoBs: 20,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-23',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Lic. Javier Villarroel Salazar',
    estado: 'Inscrito',
    observaciones: 'Concluyó registro'
  },
  {
    id: 'inc-007',
    codigoInscripcion: 'INC-2026-007',
    nombres: 'Gabriel Mateo',
    apellidos: 'Vargas Claure',
    ci: '8912345',
    expedido: 'OR',
    telefono: '73456789',
    email: 'gabriel.vargas@gmail.com',
    cursoId: 'ca-diseno-arquitectonico',
    cursoNombre: 'Diseño Gráfico Arquitectónico',
    subCurso: 'Autocad + IA',
    horario: '16 a 18',
    modalidad: 'Presencial',
    costoRealBs: 220,
    descuentoBs: 0,
    costoBs: 220,
    montoPagadoBs: 150,
    saldoBs: 70,
    fechaInscripcion: '2026-02-24',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Arq. Roberto Flores Zeballos',
    estado: 'Inscrito',
    observaciones: 'Pago parcial inicial'
  },
  {
    id: 'inc-008',
    codigoInscripcion: 'INC-2026-008',
    nombres: 'Oscar Manuel',
    apellidos: 'Alcocer Siles',
    ci: '7823901',
    expedido: 'CB',
    telefono: '71239845',
    email: 'oscar.alcocer@gmail.com',
    cursoId: 'ca-rep-celulares',
    cursoNombre: 'Reparación de Celulares',
    horario: '14 a 16',
    modalidad: 'Presencial',
    costoRealBs: 200,
    descuentoBs: 0,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-25',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Téc. Rodrigo Velasquez C.',
    estado: 'Inscrito',
    observaciones: 'Trae caja de herramientas'
  },
  {
    id: 'inc-009',
    codigoInscripcion: 'INC-2026-009',
    nombres: 'Daniela Lucia',
    apellidos: 'Mejia Morales',
    ci: '8345672',
    expedido: 'PT',
    telefono: '76891230',
    email: 'daniela.mejia@gmail.com',
    cursoId: 'ca-marketing-redes',
    cursoNombre: 'Marketing Digital en Redes Sociales',
    horario: '16 a 18',
    modalidad: 'Virtual',
    costoRealBs: 200,
    descuentoBs: 20,
    costoBs: 180,
    montoPagadoBs: 180,
    saldoBs: 0,
    fechaInscripcion: '2026-02-26',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Lic. Gabriela Quiroga Beltrán',
    estado: 'Inscrito',
    observaciones: 'Participa desde Potosí en modalidad Virtual'
  },
  {
    id: 'inc-010',
    codigoInscripcion: 'INC-2026-010',
    nombres: 'Marcelo Javier',
    apellidos: 'Rojas Quiroga',
    ci: '9182374',
    expedido: 'CB',
    telefono: '74567890',
    email: 'marcelo.rojas@gmail.com',
    cursoId: 'ca-ensamblaje-comp',
    cursoNombre: 'Ensamblaje y Rep. de Computadoras',
    horario: '10 a 12',
    modalidad: 'Presencial',
    costoRealBs: 220,
    descuentoBs: 20,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-26',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Ing. Fernando Quispe Laura',
    estado: 'Inscrito',
    observaciones: 'Inscripción confirmada'
  },
  {
    id: 'inc-011',
    codigoInscripcion: 'INC-2026-011',
    nombres: 'Paola Andrea',
    apellidos: 'Guzman Claros',
    ci: '8521479',
    expedido: 'CB',
    telefono: '72345678',
    email: 'paola.guzman@gmail.com',
    cursoId: 'ca-ia-profesores',
    cursoNombre: 'Inteligencia Artificial para Profesores',
    horario: '18 a 20',
    modalidad: 'Virtual',
    costoRealBs: 200,
    descuentoBs: 20,
    costoBs: 180,
    montoPagadoBs: 180,
    saldoBs: 0,
    fechaInscripcion: '2026-02-27',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Ing. Grover Marcelo Arispe R.',
    estado: 'Inscrito',
    observaciones: 'Docente de colegio particular'
  },
  {
    id: 'inc-012',
    codigoInscripcion: 'INC-2026-012',
    nombres: 'Sergio Andres',
    apellidos: 'Miranda Castro',
    ci: '9632581',
    expedido: 'CB',
    telefono: '78912345',
    email: 'sergio.miranda@gmail.com',
    cursoId: 'ca-canva-pro',
    cursoNombre: 'Canva Pro',
    horario: '20 a 22',
    modalidad: 'Presencial',
    costoRealBs: 180,
    descuentoBs: 20,
    costoBs: 160,
    montoPagadoBs: 160,
    saldoBs: 0,
    fechaInscripcion: '2026-02-27',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Lic. Claudia Villarroel M.',
    estado: 'Inscrito',
    observaciones: 'Emprendedor gastronómico'
  },
  {
    id: 'inc-013',
    codigoInscripcion: 'INC-2026-013',
    nombres: 'Alejandro David',
    apellidos: 'Fernandez Torrico',
    ci: '8745129',
    expedido: 'CB',
    telefono: '72234567',
    email: 'alejandro.fernandez@gmail.com',
    cursoId: 'ca-rep-celulares',
    cursoNombre: 'Reparación de Celulares',
    horario: '14 a 16',
    modalidad: 'Presencial',
    costoRealBs: 200,
    descuentoBs: 0,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-18',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Téc. Rodrigo Velasquez C.',
    estado: 'Inscrito',
    observaciones: 'Segundo curso del estudiante - Especialidad hardware móvil'
  },
  {
    id: 'inc-014',
    codigoInscripcion: 'INC-2026-014',
    nombres: 'Alejandro David',
    apellidos: 'Fernandez Torrico',
    ci: '8745129',
    expedido: 'CB',
    telefono: '72234567',
    email: 'alejandro.fernandez@gmail.com',
    cursoId: 'ca-ensamblaje-comp',
    cursoNombre: 'Ensamblaje y Rep. de Computadoras',
    horario: '10 a 12',
    modalidad: 'Presencial',
    costoRealBs: 220,
    descuentoBs: 20,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-22',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Ing. Fernando Quispe Laura',
    estado: 'Inscrito',
    observaciones: 'Tercer curso acelerado - Arquitectura y soporte técnico'
  },
  {
    id: 'inc-015',
    codigoInscripcion: 'INC-2026-015',
    nombres: 'Valeria Nicole',
    apellidos: 'Montaño Gutierrez',
    ci: '9123841',
    expedido: 'CB',
    telefono: '79781234',
    email: 'valeria.montano@hotmail.com',
    cursoId: 'ca-canva-pro',
    cursoNombre: 'Canva Pro',
    horario: '20 a 22',
    modalidad: 'Presencial',
    costoRealBs: 180,
    descuentoBs: 20,
    costoBs: 160,
    montoPagadoBs: 160,
    saldoBs: 0,
    fechaInscripcion: '2026-02-24',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-03-27',
    duracionCurso: '4 Semanas (40 Horas)',
    cargaHorariaCurso: 40,
    docenteCurso: 'Lic. Claudia Villarroel M.',
    estado: 'Inscrito',
    observaciones: 'Complementación para diseño en redes sociales'
  },
  {
    id: 'inc-016',
    codigoInscripcion: 'INC-2026-016',
    nombres: 'Valeria Nicole',
    apellidos: 'Montaño Gutierrez',
    ci: '9123841',
    expedido: 'CB',
    telefono: '79781234',
    email: 'valeria.montano@hotmail.com',
    cursoId: 'ca-diseno-publicitario',
    cursoNombre: 'Diseño Gráfico Publicitario',
    subCurso: 'Adobe Photoshop + IA',
    horario: '14 a 16',
    modalidad: 'Presencial',
    costoRealBs: 220,
    descuentoBs: 20,
    costoBs: 200,
    montoPagadoBs: 200,
    saldoBs: 0,
    fechaInscripcion: '2026-02-26',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Lic. Javier Villarroel Salazar',
    estado: 'Inscrito',
    observaciones: 'Tercer curso - Edición profesional de imágenes'
  },
  {
    id: 'inc-017',
    codigoInscripcion: 'INC-2026-017',
    nombres: 'Marcelo Javier',
    apellidos: 'Rojas Quiroga',
    ci: '9182374',
    expedido: 'CB',
    telefono: '74567890',
    email: 'marcelo.rojas@gmail.com',
    cursoId: 'ca-rep-celulares',
    cursoNombre: 'Reparación de Celulares',
    horario: '14 a 16',
    modalidad: 'Presencial',
    costoRealBs: 200,
    descuentoBs: 20,
    costoBs: 180,
    montoPagadoBs: 180,
    saldoBs: 0,
    fechaInscripcion: '2026-02-27',
    fechaInicioCurso: '2026-03-02',
    fechaFinCurso: '2026-04-10',
    duracionCurso: '6 Semanas (60 Horas)',
    cargaHorariaCurso: 60,
    docenteCurso: 'Téc. Rodrigo Velasquez C.',
    estado: 'Inscrito',
    observaciones: 'Segundo curso - Reparación de equipos móviles y PCs'
  }
];

/**
 * Estudiantes registrados
 */
export const ESTUDIANTES_INICIALES: Estudiante[] = [
  {
    id: 'est-1',
    codigo: 'IDC-2026-001',
    nombres: 'Alejandro David',
    apellidos: 'Fernandez Torrico',
    ci: '8745129',
    expedido: 'CB',
    email: 'alejandro.fernandez@gmail.com',
    telefono: '72234567',
    carreraId: 'car-1',
    anioActual: 1,
    semestreActual: 1,
    turno: 'Mañana',
    fechaInscripcion: '2026-02-05',
    estado: 'Activo',
    observaciones: 'Inscripción regular - Excelencia académica'
  },
  {
    id: 'est-2',
    codigo: 'IDC-2026-002',
    nombres: 'Valeria Nicole',
    apellidos: 'Montaño Gutierrez',
    ci: '9123841',
    expedido: 'CB',
    email: 'valeria.montano@hotmail.com',
    telefono: '79781234',
    carreraId: 'car-1',
    anioActual: 1,
    semestreActual: 1,
    turno: 'Noche',
    fechaInscripcion: '2026-02-06',
    estado: 'Activo',
    observaciones: 'Inscripción regular'
  },
  {
    id: 'est-3',
    codigo: 'IDC-2026-003',
    nombres: 'Rodrigo',
    apellidos: 'Condori Mamani',
    ci: '7689123',
    expedido: 'LP',
    email: 'rodrigo.condori@gmail.com',
    telefono: '68451290',
    carreraId: 'car-2',
    anioActual: 1,
    semestreActual: 1,
    turno: 'Mañana',
    fechaInscripcion: '2026-02-08',
    estado: 'Activo',
    observaciones: 'Traspaso de La Paz'
  },
  {
    id: 'est-4',
    codigo: 'IDC-2026-004',
    nombres: 'Mariana Sofia',
    apellidos: 'Zeballos Arnez',
    ci: '10294812',
    expedido: 'CB',
    email: 'mariana.zeballos@gmail.com',
    telefono: '71458923',
    carreraId: 'car-4',
    anioActual: 1,
    semestreActual: 1,
    turno: 'Mañana',
    fechaInscripcion: '2026-02-10',
    estado: 'Activo',
    observaciones: 'Beca de excelencia'
  },
  {
    id: 'est-5',
    codigo: 'IDC-2026-005',
    nombres: 'Jhoel Cristian',
    apellidos: 'Peralta Rocha',
    ci: '8392104',
    expedido: 'SC',
    email: 'jhoel.peralta@gmail.com',
    telefono: '75489012',
    carreraId: 'car-1',
    anioActual: 2,
    semestreActual: 3,
    turno: 'Tarde',
    fechaInscripcion: '2025-02-12',
    estado: 'Activo',
    observaciones: 'Estudiante destacado en programación'
  },
  {
    id: 'est-6',
    codigo: 'IDC-2026-006',
    nombres: 'Camila Andrea',
    apellidos: 'Soliz Barrientos',
    ci: '9456123',
    expedido: 'CB',
    email: 'camila.soliz@gmail.com',
    telefono: '76451239',
    carreraId: 'car-1',
    anioActual: 2,
    semestreActual: 3,
    turno: 'Noche',
    fechaInscripcion: '2025-02-14',
    estado: 'Activo'
  },
  {
    id: 'est-7',
    codigo: 'IDC-2026-007',
    nombres: 'Gabriel Mateo',
    apellidos: 'Vargas Claure',
    ci: '8912345',
    expedido: 'OR',
    email: 'gabriel.vargas@gmail.com',
    telefono: '73456789',
    carreraId: 'car-3',
    anioActual: 1,
    semestreActual: 1,
    turno: 'Tarde',
    fechaInscripcion: '2026-02-15',
    estado: 'Activo'
  },
  {
    id: 'est-8',
    codigo: 'IDC-2026-008',
    nombres: 'Oscar Manuel',
    apellidos: 'Alcocer Siles',
    ci: '7823901',
    expedido: 'CB',
    email: 'oscar.alcocer@gmail.com',
    telefono: '71239845',
    carreraId: 'car-4',
    anioActual: 2,
    semestreActual: 3,
    turno: 'Sábado',
    fechaInscripcion: '2025-02-16',
    estado: 'Activo'
  },
  {
    id: 'est-9',
    codigo: 'IDC-2026-009',
    nombres: 'Daniela Lucia',
    apellidos: 'Mejia Morales',
    ci: '8345672',
    expedido: 'PT',
    email: 'daniela.mejia@gmail.com',
    telefono: '76891230',
    carreraId: 'car-3',
    anioActual: 2,
    semestreActual: 3,
    turno: 'Mañana',
    fechaInscripcion: '2025-02-18',
    estado: 'Activo'
  },
  {
    id: 'est-10',
    codigo: 'IDC-2026-010',
    nombres: 'Marcelo Javier',
    apellidos: 'Rojas Quiroga',
    ci: '9182374',
    expedido: 'CB',
    email: 'marcelo.rojas@gmail.com',
    telefono: '74567890',
    carreraId: 'car-2',
    anioActual: 2,
    semestreActual: 3,
    turno: 'Noche',
    fechaInscripcion: '2025-02-20',
    estado: 'Activo'
  },
  {
    id: 'est-11',
    codigo: 'IDC-2026-011',
    nombres: 'Paola Andrea',
    apellidos: 'Guzman Claros',
    ci: '8521479',
    expedido: 'CB',
    email: 'paola.guzman@gmail.com',
    telefono: '72345678',
    carreraId: 'car-1',
    anioActual: 3,
    semestreActual: 5,
    turno: 'Noche',
    fechaInscripcion: '2024-02-15',
    estado: 'Activo',
    observaciones: 'Egresando en Gestión 2026'
  },
  {
    id: 'est-12',
    codigo: 'IDC-2026-012',
    nombres: 'Sergio Andres',
    apellidos: 'Miranda Castro',
    ci: '9632581',
    expedido: 'CB',
    email: 'sergio.miranda@gmail.com',
    telefono: '78912345',
    carreraId: 'car-3',
    anioActual: 3,
    semestreActual: 5,
    turno: 'Tarde',
    fechaInscripcion: '2024-02-18',
    estado: 'Activo',
    observaciones: 'Proyecto de grado en automatización industrial'
  },
  {
    id: 'est-13',
    codigo: 'IDC-2026-013',
    nombres: 'Hugo',
    apellidos: 'Ugarte',
    ci: '7942158',
    expedido: 'CB',
    email: 'vugarte1000@gmail.com',
    telefono: '76912345',
    carreraId: 'car-2', // Carrera Técnica de Diseño Gráfico
    anioActual: 1,
    semestreActual: 1,
    turno: 'Mañana',
    fechaInscripcion: '2026-02-28',
    estado: 'Activo',
    observaciones: 'Matriculación oficial en Carrera Técnica de Diseño Gráfico - Régimen Anualizado'
  }
];

/**
 * Base de Datos Oficial de Calificaciones Ficticias Registradas
 * Cumplen la normativa boliviana (escala de 0 a 100, aprobación >= 51, segundo turno >= 40)
 */
export const CALIFICACIONES_INICIALES: Calificacion[] = [
  // --- Calificaciones para Hugo Ugarte (est-13) - 1er Año Diseño Gráfico ---
  {
    id: 'cal-hug-101',
    estudianteId: 'est-13',
    materiaId: 'mat-dis-101',
    cursoId: 'mat-dis-101',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 85,
    segundoParcial: 88,
    practicas: 92,
    examenFinal: 90,
    notaFinal: 89,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 98,
    observaciones: 'Excelente rendimiento en Dibujo Artístico',
    fechaRegistro: '2026-02-28'
  },
  {
    id: 'cal-hug-102',
    estudianteId: 'est-13',
    materiaId: 'mat-dis-102',
    cursoId: 'mat-dis-102',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 84,
    segundoParcial: 86,
    practicas: 90,
    examenFinal: 86,
    notaFinal: 87,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 96,
    observaciones: 'Buen dominio de Teoría del Color y Tipografía',
    fechaRegistro: '2026-02-28'
  },
  {
    id: 'cal-hug-103',
    estudianteId: 'est-13',
    materiaId: 'mat-dis-103',
    cursoId: 'mat-dis-103',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 92,
    segundoParcial: 95,
    practicas: 94,
    examenFinal: 95,
    notaFinal: 94,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 100,
    observaciones: 'Sobresaliente en Ilustración Digital Vectorial',
    fechaRegistro: '2026-02-28'
  },
  {
    id: 'cal-hug-104',
    estudianteId: 'est-13',
    materiaId: 'mat-dis-104',
    cursoId: 'mat-dis-104',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 88,
    segundoParcial: 90,
    practicas: 92,
    examenFinal: 90,
    notaFinal: 90,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 96,
    observaciones: 'Excelente en Edición y Photoshop',
    fechaRegistro: '2026-02-28'
  },
  {
    id: 'cal-hug-105',
    estudianteId: 'est-13',
    materiaId: 'mat-dis-105',
    cursoId: 'mat-dis-105',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 86,
    segundoParcial: 88,
    practicas: 91,
    examenFinal: 87,
    notaFinal: 88,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 97,
    observaciones: 'Buen manejo de Fundamentos del Diseño',
    fechaRegistro: '2026-02-28'
  },
  {
    id: 'cal-hug-106',
    estudianteId: 'est-13',
    materiaId: 'mat-dis-106',
    cursoId: 'mat-dis-106',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 82,
    segundoParcial: 84,
    practicas: 88,
    examenFinal: 85,
    notaFinal: 85,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 95,
    observaciones: 'Aprobado satisfactoriamente',
    fechaRegistro: '2026-02-28'
  },
  // --- Calificaciones para Alejandro David Fernandez (est-1) - 1er Año Sistemas ---
  {
    id: 'cal-101',
    estudianteId: 'est-1',
    materiaId: 'mat-sis-101',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 28,
    segundoParcial: 27,
    practicas: 19,
    examenFinal: 18,
    notaFinal: 92,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 98,
    observaciones: 'Excelente desempeño en algoritmos',
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-102',
    estudianteId: 'est-1',
    materiaId: 'mat-sis-102',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 25,
    segundoParcial: 26,
    practicas: 18,
    examenFinal: 16,
    notaFinal: 85,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 95,
    observaciones: 'Buen rendimiento en laboratorio',
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-103',
    estudianteId: 'est-1',
    materiaId: 'mat-sis-103',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 24,
    segundoParcial: 25,
    practicas: 17,
    examenFinal: 17,
    notaFinal: 83,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 92,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-104',
    estudianteId: 'est-1',
    materiaId: 'mat-sis-104',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 22,
    segundoParcial: 24,
    practicas: 16,
    examenFinal: 16,
    notaFinal: 78,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 90,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-105',
    estudianteId: 'est-1',
    materiaId: 'mat-sis-105',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 28,
    segundoParcial: 29,
    practicas: 20,
    examenFinal: 19,
    notaFinal: 96,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 100,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-106',
    estudianteId: 'est-1',
    materiaId: 'mat-sis-106',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 26,
    segundoParcial: 27,
    practicas: 18,
    examenFinal: 17,
    notaFinal: 88,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 94,
    fechaRegistro: '2026-03-01'
  },

  // --- Calificaciones para Valeria Nicole Montaño (est-2) - 1er Año Sistemas ---
  {
    id: 'cal-201',
    estudianteId: 'est-2',
    materiaId: 'mat-sis-101',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 22,
    segundoParcial: 23,
    practicas: 16,
    examenFinal: 15,
    notaFinal: 76,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 92,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-202',
    estudianteId: 'est-2',
    materiaId: 'mat-sis-102',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 20,
    segundoParcial: 21,
    practicas: 15,
    examenFinal: 14,
    notaFinal: 70,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 88,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-203',
    estudianteId: 'est-2',
    materiaId: 'mat-sis-103',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 18,
    segundoParcial: 20,
    practicas: 14,
    examenFinal: 13,
    notaFinal: 65,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 85,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-204',
    estudianteId: 'est-2',
    materiaId: 'mat-sis-104',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 14,
    segundoParcial: 15,
    practicas: 10,
    examenFinal: 9,
    segundoTurno: 51,
    notaFinal: 51,
    estadoFinal: 'Segundo Turno',
    asistenciaPorcentaje: 80,
    observaciones: 'Aprobó en 2do Turno',
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-205',
    estudianteId: 'est-2',
    materiaId: 'mat-sis-105',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 26,
    segundoParcial: 27,
    practicas: 18,
    examenFinal: 18,
    notaFinal: 89,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 96,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-206',
    estudianteId: 'est-2',
    materiaId: 'mat-sis-106',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    primerParcial: 24,
    segundoParcial: 25,
    practicas: 17,
    examenFinal: 16,
    notaFinal: 82,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 90,
    fechaRegistro: '2026-03-01'
  },

  // --- Calificaciones para Rodrigo Condori (est-3) - 1er Año Diseño Gráfico ---
  {
    id: 'cal-301',
    estudianteId: 'est-3',
    materiaId: 'mat-dis-101',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 26,
    segundoParcial: 27,
    practicas: 18,
    examenFinal: 17,
    notaFinal: 88,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 95,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-302',
    estudianteId: 'est-3',
    materiaId: 'mat-dis-102',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 24,
    segundoParcial: 25,
    practicas: 17,
    examenFinal: 16,
    notaFinal: 82,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 92,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-303',
    estudianteId: 'est-3',
    materiaId: 'mat-dis-103',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    primerParcial: 28,
    segundoParcial: 29,
    practicas: 19,
    examenFinal: 18,
    notaFinal: 94,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 96,
    fechaRegistro: '2026-03-01'
  },

  // --- Calificaciones para Mariana Sofia Zeballos (est-4) - 1er Año Contaduría General ---
  {
    id: 'cal-401',
    estudianteId: 'est-4',
    materiaId: 'mat-con-101',
    carreraId: 'car-4',
    anio: 1,
    gestion: '2026',
    primerParcial: 29,
    segundoParcial: 28,
    practicas: 20,
    examenFinal: 19,
    notaFinal: 96,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 100,
    observaciones: 'Beca de Honor por alto promedio',
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-402',
    estudianteId: 'est-4',
    materiaId: 'mat-con-102',
    carreraId: 'car-4',
    anio: 1,
    gestion: '2026',
    primerParcial: 27,
    segundoParcial: 28,
    practicas: 19,
    examenFinal: 18,
    notaFinal: 92,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 98,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-403',
    estudianteId: 'est-4',
    materiaId: 'mat-con-104',
    carreraId: 'car-4',
    anio: 1,
    gestion: '2026',
    primerParcial: 28,
    segundoParcial: 29,
    practicas: 20,
    examenFinal: 18,
    notaFinal: 95,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 99,
    fechaRegistro: '2026-03-01'
  },

  // --- Calificaciones para Jhoel Cristian Peralta (est-5) - 2do Año Sistemas ---
  {
    id: 'cal-501',
    estudianteId: 'est-5',
    materiaId: 'mat-sis-201',
    carreraId: 'car-1',
    anio: 2,
    gestion: '2026',
    primerParcial: 27,
    segundoParcial: 28,
    practicas: 19,
    examenFinal: 17,
    notaFinal: 91,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 96,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-502',
    estudianteId: 'est-5',
    materiaId: 'mat-sis-202',
    carreraId: 'car-1',
    anio: 2,
    gestion: '2026',
    primerParcial: 26,
    segundoParcial: 27,
    practicas: 18,
    examenFinal: 16,
    notaFinal: 87,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 94,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-503',
    estudianteId: 'est-5',
    materiaId: 'mat-sis-205',
    carreraId: 'car-1',
    anio: 2,
    gestion: '2026',
    primerParcial: 28,
    segundoParcial: 29,
    practicas: 20,
    examenFinal: 18,
    notaFinal: 95,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 98,
    fechaRegistro: '2026-03-01'
  },

  // --- Calificaciones para Gabriel Mateo Vargas (est-7) - 1er Año Informática Industrial ---
  {
    id: 'cal-701',
    estudianteId: 'est-7',
    materiaId: 'mat-ind-101',
    carreraId: 'car-3',
    anio: 1,
    gestion: '2026',
    primerParcial: 25,
    segundoParcial: 26,
    practicas: 18,
    examenFinal: 16,
    notaFinal: 85,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 94,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-702',
    estudianteId: 'est-7',
    materiaId: 'mat-ind-102',
    carreraId: 'car-3',
    anio: 1,
    gestion: '2026',
    primerParcial: 26,
    segundoParcial: 27,
    practicas: 19,
    examenFinal: 17,
    notaFinal: 89,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 96,
    fechaRegistro: '2026-03-01'
  },

  // --- Calificaciones para Paola Andrea Guzman (est-11) - 3er Año Sistemas ---
  {
    id: 'cal-901',
    estudianteId: 'est-11',
    materiaId: 'mat-sis-301',
    carreraId: 'car-1',
    anio: 3,
    gestion: '2026',
    primerParcial: 28,
    segundoParcial: 29,
    practicas: 19,
    examenFinal: 18,
    notaFinal: 94,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 97,
    fechaRegistro: '2026-03-01'
  },
  {
    id: 'cal-902',
    estudianteId: 'est-11',
    materiaId: 'mat-sis-304',
    carreraId: 'car-1',
    anio: 3,
    gestion: '2026',
    primerParcial: 27,
    segundoParcial: 28,
    practicas: 19,
    examenFinal: 18,
    notaFinal: 92,
    estadoFinal: 'Aprobado',
    asistenciaPorcentaje: 96,
    fechaRegistro: '2026-03-01'
  }
];

/**
 * =========================================================================
 * COSTOS Y ARANCELES OFICIALES POR CARRERA TÉCNICA (R.M. No. 0397/2024)
 * =========================================================================
 * Cada carrera técnica cuenta con:
 * - Costo de Matrícula Oficial Anual
 * - 10 Cuotas Mensuales de Pensión (Febrero a Noviembre)
 * - Otros Costos Oficiales (Seguro Estudiantil contra accidentes y Carnet Institucional)
 */
export const COSTOS_CARRERAS_INICIALES: CostoCarrera[] = [
  {
    carreraId: 'car-1',
    carreraCodigo: 'SIS-INF',
    carreraNombre: 'Sistemas Informáticos',
    costoMatriculaBs: 300,
    costoMensualidadBs: 380,
    numeroCuotas: 10,
    otrosCostosBs: 50,
    descripcionOtrosCostos: 'Seguro estudiantil y carnet institucional',
    totalAnualBs: 300 + (380 * 10) + 50 // 4,150 Bs
  },
  {
    carreraId: 'car-2',
    carreraCodigo: 'DIS-GRA',
    carreraNombre: 'Diseño Gráfico',
    costoMatriculaBs: 300,
    costoMensualidadBs: 360,
    numeroCuotas: 10,
    otrosCostosBs: 50,
    descripcionOtrosCostos: 'Seguro estudiantil y carnet institucional',
    totalAnualBs: 300 + (360 * 10) + 50 // 3,950 Bs
  },
  {
    carreraId: 'car-3',
    carreraCodigo: 'INF-IND',
    carreraNombre: 'Informática Industrial',
    costoMatriculaBs: 300,
    costoMensualidadBs: 370,
    numeroCuotas: 10,
    otrosCostosBs: 50,
    descripcionOtrosCostos: 'Seguro estudiantil y carnet institucional',
    totalAnualBs: 300 + (370 * 10) + 50 // 4,050 Bs
  },
  {
    carreraId: 'car-4',
    carreraCodigo: 'CON-GEN',
    carreraNombre: 'Contaduría General',
    costoMatriculaBs: 280,
    costoMensualidadBs: 340,
    numeroCuotas: 10,
    otrosCostosBs: 50,
    descripcionOtrosCostos: 'Seguro estudiantil y carnet institucional',
    totalAnualBs: 280 + (340 * 10) + 50 // 3,730 Bs
  }
];

export const MESES_10_CUOTAS: { numero: number; mes: string; fechaVencimiento: string }[] = [
  { numero: 1, mes: 'Febrero', fechaVencimiento: '2026-02-10' },
  { numero: 2, mes: 'Marzo', fechaVencimiento: '2026-03-10' },
  { numero: 3, mes: 'Abril', fechaVencimiento: '2026-04-10' },
  { numero: 4, mes: 'Mayo', fechaVencimiento: '2026-05-10' },
  { numero: 5, mes: 'Junio', fechaVencimiento: '2026-06-10' },
  { numero: 6, mes: 'Julio', fechaVencimiento: '2026-07-10' },
  { numero: 7, mes: 'Agosto', fechaVencimiento: '2026-08-10' },
  { numero: 8, mes: 'Septiembre', fechaVencimiento: '2026-09-10' },
  { numero: 9, mes: 'Octubre', fechaVencimiento: '2026-10-10' },
  { numero: 10, mes: 'Noviembre', fechaVencimiento: '2026-11-10' }
];

/**
 * Genera el plan completo de las 10 cuotas mensuales para un estudiante
 */
export const generarPlan10CuotasEstudiante = (
  estudiante: Estudiante,
  costosCarrera?: CostoCarrera[]
): PagoCuotaEstudiante[] => {
  const listaCostos = costosCarrera || COSTOS_CARRERAS_INICIALES;
  const costoC = listaCostos.find(c => c.carreraId === estudiante.carreraId) || listaCostos[0];
  const cuotaBase = estudiante.montoMensualidadFinalBs ?? costoC.costoMensualidadBs;

  return MESES_10_CUOTAS.map(item => {
    return {
      id: `pago-${estudiante.id}-cuota-${item.numero}`,
      estudianteId: estudiante.id,
      codigoEstudiante: estudiante.codigo,
      nombreEstudiante: `${estudiante.apellidos}, ${estudiante.nombres}`,
      carreraId: estudiante.carreraId,
      anio: estudiante.anioActual || 1,
      gestion: '2026',
      tipoPago: 'Cuota Mensual',
      numeroCuota: item.numero,
      mesCorrespondiente: item.mes,
      fechaVencimiento: item.fechaVencimiento,
      montoPactadoBs: cuotaBase,
      montoPagadoBs: 0,
      saldoPendienteBs: cuotaBase,
      estado: 'Pendiente',
      transacciones: []
    };
  });
};

/**
 * Pagos y cuotas iniciales simuladas para los estudiantes oficiales
 */
export const PAGOS_CUOTAS_INICIALES: PagoCuotaEstudiante[] = [
  // --- Alejandro David Fernandez (est-1) Sistemas ---
  {
    id: 'pago-est-1-cuota-1',
    estudianteId: 'est-1',
    codigoEstudiante: 'IDC-2026-001',
    nombreEstudiante: 'Fernandez Torrico, Alejandro David',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    tipoPago: 'Cuota Mensual',
    numeroCuota: 1,
    mesCorrespondiente: 'Febrero',
    fechaVencimiento: '2026-02-10',
    montoPactadoBs: 380,
    montoPagadoBs: 380,
    saldoPendienteBs: 0,
    estado: 'Cancelado',
    ultimoNroRecibo: 'REC-2026-0101',
    ultimaFechaPago: '2026-02-05',
    ultimoMetodoPago: 'Efectivo',
    transacciones: [
      {
        id: 'tx-1-1',
        fecha: '2026-02-05',
        hora: '09:30',
        montoBs: 380,
        metodoPago: 'Efectivo',
        nroRecibo: 'REC-2026-0101',
        cajero: 'Caja Central'
      }
    ]
  },
  {
    id: 'pago-est-1-cuota-2',
    estudianteId: 'est-1',
    codigoEstudiante: 'IDC-2026-001',
    nombreEstudiante: 'Fernandez Torrico, Alejandro David',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    tipoPago: 'Cuota Mensual',
    numeroCuota: 2,
    mesCorrespondiente: 'Marzo',
    fechaVencimiento: '2026-03-10',
    montoPactadoBs: 380,
    montoPagadoBs: 200,
    saldoPendienteBs: 180,
    estado: 'Parcial',
    ultimoNroRecibo: 'REC-2026-0210',
    ultimaFechaPago: '2026-03-08',
    ultimoMetodoPago: 'QR Simple',
    transacciones: [
      {
        id: 'tx-1-2',
        fecha: '2026-03-08',
        hora: '11:15',
        montoBs: 200,
        metodoPago: 'QR Simple',
        nroRecibo: 'REC-2026-0210',
        cajero: 'Caja Central',
        observaciones: 'Pago parcial a cuenta de Cuota 2'
      }
    ]
  },
  {
    id: 'pago-est-1-cuota-3',
    estudianteId: 'est-1',
    codigoEstudiante: 'IDC-2026-001',
    nombreEstudiante: 'Fernandez Torrico, Alejandro David',
    carreraId: 'car-1',
    anio: 1,
    gestion: '2026',
    tipoPago: 'Cuota Mensual',
    numeroCuota: 3,
    mesCorrespondiente: 'Abril',
    fechaVencimiento: '2026-04-10',
    montoPactadoBs: 380,
    montoPagadoBs: 0,
    saldoPendienteBs: 380,
    estado: 'Pendiente',
    transacciones: []
  },

  // --- Hugo Ugarte (est-13) Diseño Gráfico ---
  {
    id: 'pago-est-13-cuota-1',
    estudianteId: 'est-13',
    codigoEstudiante: 'IDC-2026-013',
    nombreEstudiante: 'Ugarte, Hugo',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    tipoPago: 'Cuota Mensual',
    numeroCuota: 1,
    mesCorrespondiente: 'Febrero',
    fechaVencimiento: '2026-02-10',
    montoPactadoBs: 360,
    montoPagadoBs: 360,
    saldoPendienteBs: 0,
    estado: 'Cancelado',
    ultimoNroRecibo: 'REC-2026-0145',
    ultimaFechaPago: '2026-02-18',
    ultimoMetodoPago: 'Efectivo',
    transacciones: [
      {
        id: 'tx-13-1',
        fecha: '2026-02-18',
        hora: '10:00',
        montoBs: 360,
        metodoPago: 'Efectivo',
        nroRecibo: 'REC-2026-0145',
        cajero: 'Caja Central'
      }
    ]
  },
  {
    id: 'pago-est-13-cuota-2',
    estudianteId: 'est-13',
    codigoEstudiante: 'IDC-2026-013',
    nombreEstudiante: 'Ugarte, Hugo',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    tipoPago: 'Cuota Mensual',
    numeroCuota: 2,
    mesCorrespondiente: 'Marzo',
    fechaVencimiento: '2026-03-10',
    montoPactadoBs: 360,
    montoPagadoBs: 360,
    saldoPendienteBs: 0,
    estado: 'Cancelado',
    ultimoNroRecibo: 'REC-2026-0280',
    ultimaFechaPago: '2026-03-05',
    ultimoMetodoPago: 'Transferencia Bancaria',
    transacciones: [
      {
        id: 'tx-13-2',
        fecha: '2026-03-05',
        hora: '15:20',
        montoBs: 360,
        metodoPago: 'Transferencia Bancaria',
        nroRecibo: 'REC-2026-0280',
        cajero: 'Caja Central'
      }
    ]
  },
  {
    id: 'pago-est-13-cuota-3',
    estudianteId: 'est-13',
    codigoEstudiante: 'IDC-2026-013',
    nombreEstudiante: 'Ugarte, Hugo',
    carreraId: 'car-2',
    anio: 1,
    gestion: '2026',
    tipoPago: 'Cuota Mensual',
    numeroCuota: 3,
    mesCorrespondiente: 'Abril',
    fechaVencimiento: '2026-04-10',
    montoPactadoBs: 360,
    montoPagadoBs: 0,
    saldoPendienteBs: 360,
    estado: 'Pendiente',
    transacciones: []
  }
];

