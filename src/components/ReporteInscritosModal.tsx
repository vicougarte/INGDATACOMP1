import React, { useState, useMemo } from 'react';
import { Carrera, Materia, Estudiante, ConfiguracionInstituto } from '../types';
import { 
  Printer, 
  X, 
  Download, 
  Search, 
  GraduationCap, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  Users,
  AlertCircle,
  Eye,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';
import { imprimirElementoUniversal, descargarDocumentoHtml } from '../services/printService';

interface ReporteInscritosModalProps {
  isOpen?: boolean;
  onClose: () => void;
  estudiantes?: Estudiante[];
  carreras?: Carrera[];
  materias?: Materia[];
  config?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
}

export const ReporteInscritosModal: React.FC<ReporteInscritosModalProps> = ({
  isOpen = true,
  onClose,
  estudiantes = [],
  carreras = [],
  materias = [],
  config = {} as ConfiguracionInstituto,
  customLogoUrl
}) => {
  // 1. Estados de filtros y vistas
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<string>('todas');
  const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('todos'); // '1', '2', '3' o 'todos'
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>('todas');
  const [turnoSeleccionado, setTurnoSeleccionado] = useState<string>('todos');
  const [busquedaTexto, setBusquedaTexto] = useState<string>('');
  const [incluirEspacioFirma, setIncluirEspacioFirma] = useState<boolean>(true);
  const [vistaPantallaCompleta, setVistaPantallaCompleta] = useState<boolean>(false);

  // 2. Materias disponibles según carrera y curso seleccionados
  const materiasDisponibles = useMemo(() => {
    if (!Array.isArray(materias)) return [];
    return materias.filter(m => {
      if (!m) return false;
      const matchCar = carreraSeleccionada === 'todas' || m.carreraId === carreraSeleccionada;
      const matchAnio = cursoSeleccionado === 'todos' || String(m.anio || 1) === cursoSeleccionado;
      return matchCar && matchAnio;
    });
  }, [materias, carreraSeleccionada, cursoSeleccionado]);

  // Materia activa actual
  const materiaActiva = useMemo(() => {
    if (!Array.isArray(materias) || materiaSeleccionada === 'todas') return undefined;
    return materias.find(m => m && m.id === materiaSeleccionada);
  }, [materias, materiaSeleccionada]);

  // Carrera activa actual
  const carreraObj = useMemo(() => {
    if (!Array.isArray(carreras) || carreraSeleccionada === 'todas') return undefined;
    return carreras.find(c => c && c.id === carreraSeleccionada);
  }, [carreras, carreraSeleccionada]);

  // 3. Estudiantes filtrados de forma ultra-segura contra nulos o undefined
  const estudiantesFiltrados = useMemo(() => {
    if (!Array.isArray(estudiantes)) return [];

    return estudiantes
      .filter(est => {
        if (!est) return false;

        // Filtro por Carrera
        const matchCarrera = carreraSeleccionada === 'todas' || est.carreraId === carreraSeleccionada;

        // Filtro por Curso / Año
        const anioEst = String(est.anioActual || 1);
        const matchCurso = cursoSeleccionado === 'todos' || anioEst === cursoSeleccionado;

        // Filtro por Materia
        let matchMateria = true;
        if (materiaSeleccionada !== 'todas' && materiaActiva) {
          matchMateria = est.carreraId === materiaActiva.carreraId && String(est.anioActual || 1) === String(materiaActiva.anio || 1);
        }

        // Filtro por Turno
        const matchTurno = turnoSeleccionado === 'todos' || (est.turno || 'Mañana') === turnoSeleccionado;

        // Filtro por Búsqueda de texto
        const textoCompleto = `${est.nombres || ''} ${est.apellidos || ''} ${est.ci || ''} ${est.codigo || ''}`.toLowerCase();
        const busq = (busquedaTexto || '').toLowerCase().trim();
        const matchTexto = !busq || textoCompleto.includes(busq);

        return matchCarrera && matchCurso && matchMateria && matchTurno && matchTexto;
      })
      .sort((a, b) => {
        const apeA = String(a?.apellidos || '').trim();
        const apeB = String(b?.apellidos || '').trim();
        const comp = apeA.localeCompare(apeB, 'es');
        if (comp !== 0) return comp;
        const nomA = String(a?.nombres || '').trim();
        const nomB = String(b?.nombres || '').trim();
        return nomA.localeCompare(nomB, 'es');
      });
  }, [estudiantes, carreraSeleccionada, cursoSeleccionado, materiaSeleccionada, materiaActiva, turnoSeleccionado, busquedaTexto]);

  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  // Acción: Imprimir en Impresora física o guardar PDF
  const handleImprimirImpresora = async () => {
    setImprimiendo(true);
    setMensajeEstado('Enviando reporte de nómina a la impresora...');
    try {
      const res = await imprimirElementoUniversal(
        'documento-reporte-inscritos',
        `Nomina Oficial de Estudiantes Inscritos - Gestion 2026`
      );
      if (res.exito) {
        setMensajeEstado('✓ Diálogo de impresión invocado.');
      } else {
        descargarDocumentoHtml(
          'documento-reporte-inscritos',
          'Nomina_Oficial_Estudiantes_Inscritos_2026'
        );
        setMensajeEstado('Descargando nómina oficial en archivo web...');
      }
    } catch (e) {
      console.error('Error al invocar impresión:', e);
      descargarDocumentoHtml(
        'documento-reporte-inscritos',
        'Nomina_Oficial_Estudiantes_Inscritos_2026'
      );
    } finally {
      setTimeout(() => {
        setImprimiendo(false);
        setTimeout(() => setMensajeEstado(null), 5000);
      }, 1000);
    }
  };

  const handleDescargarReporte = () => {
    descargarDocumentoHtml(
      'documento-reporte-inscritos',
      'Nomina_Oficial_Estudiantes_Inscritos_2026'
    );
    setMensajeEstado('✓ Nómina descargada como archivo listo para abrir e imprimir con doble clic.');
    setTimeout(() => setMensajeEstado(null), 5000);
  };

  // Acción: Exportar a archivo CSV seguro
  const handleExportarCSV = () => {
    try {
      const cabeceras = ['Nro,Codigo,Apellidos,Nombres,CI,Expedido,Carrera,Ano_Estudio,Turno,Telefono,Email,Estado'];
      const filas = estudiantesFiltrados.map((est, idx) => {
        const carNombre = (Array.isArray(carreras) ? carreras.find(c => c && c.id === est?.carreraId)?.nombre : '') || 'Carrera Técnica';
        const cod = String(est?.codigo || '').replace(/"/g, '""');
        const ape = String(est?.apellidos || '').replace(/"/g, '""');
        const nom = String(est?.nombres || '').replace(/"/g, '""');
        const ci = String(est?.ci || '').replace(/"/g, '""');
        const exp = String(est?.expedido || 'CB').replace(/"/g, '""');
        const anio = `${est?.anioActual || 1}° Año`;
        const tur = String(est?.turno || 'Mañana').replace(/"/g, '""');
        const tel = String(est?.telefono || '').replace(/"/g, '""');
        const email = String(est?.email || '').replace(/"/g, '""');
        const estado = String(est?.estado || 'Activo').replace(/"/g, '""');
        return `"${idx + 1}","${cod}","${ape}","${nom}","${ci}","${exp}","${carNombre}","${anio}","${tur}","${tel}","${email}","${estado}"`;
      });
      const blob = new Blob([cabeceras.concat(filas).join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Nomina_Inscritos_ING_DATA_COMP_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error al exportar CSV:', err);
    }
  };

  // Fecha y hora formateada en Bolivia
  const fechaHoy = new Date().toLocaleDateString('es-BO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const horaHoy = new Date().toLocaleTimeString('es-BO', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className={`bg-white rounded-3xl w-full ${vistaPantallaCompleta ? 'max-w-7xl' : 'max-w-6xl'} shadow-2xl overflow-hidden flex flex-col border border-slate-200 print:border-none print:shadow-none print:rounded-none print:w-full`}>
        
        {/* PANEL SUPERIOR DE CONTROL Y FILTROS (Se oculta al imprimir con no-print) */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 no-print border-b border-blue-900/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-600 rounded-xl">
                  <Printer className="w-5 h-5 text-white" />
                </span>
                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>Imprimir Nómina de Alumnos Inscritos</span>
                    <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                      Reporte Oficial
                    </span>
                  </h3>
                  <p className="text-xs text-blue-200">
                    Filtra y genera la nómina oficial para impresión en pantalla y en impresora (R.M. No. 0397/2024).
                  </p>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN PRINCIPALES */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setVistaPantallaCompleta(!vistaPantallaCompleta)}
                title={vistaPantallaCompleta ? "Reducir vista" : "Pantalla completa"}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                {vistaPantallaCompleta ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{vistaPantallaCompleta ? "Normal" : "Ampliar"}</span>
              </button>

              <button
                type="button"
                onClick={handleDescargarReporte}
                title="Descargar nómina en archivo HTML listo para abrir e imprimir con doble clic"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Descargar Archivo</span>
              </button>

              <button
                type="button"
                onClick={handleExportarCSV}
                title="Descargar lista en formato Excel/CSV"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Download className="w-4 h-4" />
                <span>Exportar CSV</span>
              </button>

              <button
                type="button"
                onClick={handleImprimirImpresora}
                disabled={imprimiendo}
                title="Imprimir directamente en impresora o guardar como archivo PDF"
                className={`px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-900/40 transition flex items-center gap-2 cursor-pointer scale-100 hover:scale-102 ${
                  imprimiendo ? 'opacity-70 cursor-wait' : ''
                }`}
              >
                <Printer className={`w-4 h-4 ${imprimiendo ? 'animate-bounce' : ''}`} />
                <span>{imprimiendo ? 'Enviando...' : 'Imprimir en Impresora / PDF'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* FILTROS DINÁMICOS: CARRERAS, CURSOS, MATERIAS Y TURNOS */}
          <div className="mt-4 pt-4 border-t border-blue-900/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Filtro Carrera */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                <span>Carrera Técnica</span>
              </label>
              <select
                value={carreraSeleccionada}
                onChange={(e) => {
                  setCarreraSeleccionada(e.target.value);
                  setMateriaSeleccionada('todas');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-blue-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="todas">Todas las Carreras Técnicas</option>
                {Array.isArray(carreras) && carreras.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.codigo})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Filtro Curso / Año */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Curso / Año de Formación</span>
              </label>
              <select
                value={cursoSeleccionado}
                onChange={(e) => {
                  setCursoSeleccionado(e.target.value);
                  setMateriaSeleccionada('todas');
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-blue-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="todos">Todos los Cursos / Años</option>
                <option value="1">1er Año de Formación</option>
                <option value="2">2do Año de Formación</option>
                <option value="3">3er Año de Formación</option>
              </select>
            </div>

            {/* 3. Filtro Materia / Asignatura */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Materia / Asignatura</span>
              </label>
              <select
                value={materiaSeleccionada}
                onChange={(e) => setMateriaSeleccionada(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-blue-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="todas">Todas las Materias de la Malla</option>
                {materiasDisponibles.map(m => (
                  <option key={m.id} value={m.id}>
                    [{m.codigo}] {m.nombre} ({m.anio}° Año)
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Filtro Turno */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Turno</span>
              </label>
              <select
                value={turnoSeleccionado}
                onChange={(e) => setTurnoSeleccionado(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-blue-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="todos">Todos los Turnos</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                <option value="Sábado">Sábado Intensivo</option>
              </select>
            </div>

            {/* 5. Búsqueda por Nombre o CI */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1 flex items-center gap-1">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                <span>Buscar Alumno</span>
              </label>
              <input
                type="text"
                value={busquedaTexto}
                onChange={(e) => setBusquedaTexto(e.target.value)}
                placeholder="Nombre, apellido o CI..."
                className="w-full px-3 py-2 bg-slate-900 border border-blue-800 rounded-xl text-xs font-medium text-white focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Opciones adicionales de impresión en pantalla */}
          <div className="mt-3 flex items-center justify-between text-xs text-blue-200">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={incluirEspacioFirma}
                onChange={(e) => setIncluirEspacioFirma(e.target.checked)}
                className="rounded border-blue-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Incluir columna de Casilla de Firma / Control de Asistencia para lista impresa</span>
            </label>

            <span className="font-bold text-amber-300">
              Total Alumnos encontrados: {estudiantesFiltrados.length}
            </span>
          </div>
        </div>

        {mensajeEstado && (
          <div className="no-print bg-blue-900 text-blue-100 text-xs px-5 py-2 flex items-center gap-2 border-b border-blue-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensajeEstado}</span>
          </div>
        )}

        {/* DOCUMENTO OFICIAL PARA IMPRESIÓN EN PANTALLA Y EN PAPEL */}
        <div id="documento-reporte-inscritos" className="p-4 sm:p-8 flex-1 overflow-y-auto bg-slate-100 print:bg-white print:p-0 print:overflow-visible">
          <div className="max-w-4xl mx-auto bg-white border-2 border-slate-900 rounded-2xl p-6 sm:p-8 relative shadow-sm print:border-none print:p-0 print:max-w-none print:shadow-none print:w-full">
            
            {/* ENCABEZADO INSTITUCIONAL OFICIAL */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4 gap-4">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <IngDataCompLogo size="md" customLogoUrl={customLogoUrl} />
              </div>

              <div className="flex-1 text-center">
                <h1 className="text-base sm:text-lg font-black tracking-tight uppercase leading-tight text-slate-950">
                  {config?.nombre || 'INSTITUTO TECNOLÓGICO ING DATA COMP'}
                </h1>
                <div className="text-xs font-bold text-blue-900 flex items-center justify-center gap-2 mt-0.5">
                  <span>Resolución Ministerial: {config?.resolucionMinisterial || 'R.M. No. 0397/2024'}</span>
                  <span>•</span>
                  <span>Ministerio de Educación del Estado Plurinacional de Bolivia</span>
                </div>
                <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                  DIRECCIÓN ACADÉMICA Y KÁRDEX CENTRAL • REGISTRO Y MATRÍCULA ESTUDIANTIL
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {config?.direccion || 'Av. Heroínas esq. Ayacucho, Edificio Tecnológico 4to Piso, Cochabamba'} | Telf: {config?.telefono || '+591 4 4528900'}
                </p>
              </div>

              <div className="w-16 h-16 shrink-0 hidden sm:flex flex-col items-center justify-center border border-slate-300 rounded-xl p-1 bg-slate-50 text-center">
                <span className="text-[9px] font-black uppercase text-slate-400 block">GESTIÓN</span>
                <span className="text-sm font-black font-mono text-blue-950 block">2026</span>
                <span className="text-[8px] font-bold text-emerald-700 block">OFICIAL</span>
              </div>
            </div>

            {/* TÍTULO DEL REPORTE */}
            <div className="text-center my-3 bg-blue-50/80 border border-blue-200 py-2.5 px-4 rounded-xl">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-blue-950">
                NÓMINA OFICIAL DE ESTUDIANTES MATRICULADOS E INSCRITOS
              </h2>
              <span className="text-xs font-bold text-blue-900">
                Régimen Anualizado (3 Años) • Nivel Técnico Superior
              </span>
            </div>

            {/* CUADRO DE PARÁMETROS DEL REPORTE */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">CARRERA TÉCNICA:</span>
                <strong className="text-slate-900 block truncate">
                  {carreraObj ? carreraObj.nombre : (carreraSeleccionada === 'todas' ? 'Todas las Carreras Técnicas' : 'Seleccionada')}
                </strong>
                {carreraObj && (
                  <span className="text-[10px] font-mono text-blue-900 font-bold block">
                    Cód: {carreraObj.codigo}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">CURSO / AÑO:</span>
                <strong className="text-slate-900 block">
                  {cursoSeleccionado === 'todos' ? 'Todos los Años (1°, 2° y 3°)' : `${cursoSeleccionado}° Año de Formación`}
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  Régimen Anual
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">MATERIA / ASIGNATURA:</span>
                <strong className="text-slate-900 block truncate" title={materiaActiva?.nombre}>
                  {materiaActiva ? materiaActiva.nombre : 'Todas las Asignaturas'}
                </strong>
                {materiaActiva && (
                  <span className="text-[10px] text-blue-900 font-bold block truncate">
                    Doc: {materiaActiva.docente || 'Titular Asignado'}
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">TURNO / TOTAL:</span>
                <strong className="text-slate-900 block">
                  {turnoSeleccionado === 'todos' ? 'Todos los Turnos' : `Turno ${turnoSeleccionado}`}
                </strong>
                <span className="text-[10px] text-emerald-800 font-bold block">
                  Total Inscritos: {estudiantesFiltrados.length}
                </span>
              </div>
            </div>

            {/* TABLA OFICIAL DE ESTUDIANTES */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-400">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold text-[11px] uppercase tracking-wider print:bg-slate-900">
                    <th className="py-2 px-2 text-center w-8 border border-slate-600">N°</th>
                    <th className="py-2 px-2.5 border border-slate-600 w-28">Código</th>
                    <th className="py-2 px-2.5 border border-slate-600 w-24">Cédula (CI)</th>
                    <th className="py-2 px-3 border border-slate-600">Apellidos y Nombres</th>
                    <th className="py-2 px-2.5 border border-slate-600">Carrera</th>
                    <th className="py-2 px-2 text-center border border-slate-600 w-16">Curso</th>
                    <th className="py-2 px-2 text-center border border-slate-600 w-20">Turno</th>
                    <th className="py-2 px-2.5 border border-slate-600">Contacto</th>
                    {incluirEspacioFirma && (
                      <th className="py-2 px-3 text-center border border-slate-600 w-32">
                        Firma / Control
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-medium">
                  {estudiantesFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={incluirEspacioFirma ? 9 : 8} className="py-8 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <Users className="w-8 h-8 text-slate-300" />
                          <p className="font-semibold text-slate-700">No hay estudiantes inscritos con los filtros seleccionados.</p>
                          <p className="text-xs text-slate-400">Prueba cambiando los filtros de carrera, curso o turno arriba.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    estudiantesFiltrados.map((est, idx) => {
                      const car = Array.isArray(carreras) ? carreras.find(c => c && c.id === est?.carreraId) : undefined;
                      const anio = est?.anioActual || 1;
                      const apellidosTexto = String(est?.apellidos || '').trim().toUpperCase();
                      const nombresTexto = String(est?.nombres || '').trim();

                      return (
                        <tr 
                          key={est?.id || `est-row-${idx}`} 
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'} hover:bg-blue-50/40`}
                        >
                          <td className="py-2 px-2 text-center font-mono font-bold text-slate-700 border border-slate-300">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 font-mono font-bold text-blue-950 border border-slate-300">
                            {est?.codigo || '-'}
                          </td>
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-900 border border-slate-300">
                            {est?.ci || '-'} <span className="text-[10px] text-slate-500 font-sans">{est?.expedido || ''}</span>
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-950 border border-slate-300">
                            {apellidosTexto ? `${apellidosTexto}, ${nombresTexto}` : (nombresTexto || 'ESTUDIANTE')}
                          </td>
                          <td className="py-2 px-2.5 border border-slate-300">
                            <span className="font-semibold text-slate-800 block text-[11px] leading-tight">
                              {car?.nombre || 'Carrera Técnica'}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center border border-slate-300">
                            <span className="font-bold text-slate-900">
                              {anio}° Año
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center font-semibold text-slate-700 border border-slate-300">
                            {est?.turno || 'Mañana'}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-[11px] text-slate-600 border border-slate-300">
                            {est?.telefono || est?.email || '-'}
                          </td>
                          {incluirEspacioFirma && (
                            <td className="py-2 px-2 border border-slate-300 text-center">
                              <div className="h-6 border-b border-dotted border-slate-400 w-full"></div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* RESUMEN ESTADÍSTICO DE INSCRITOS */}
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600 border-t border-slate-200 pt-3 gap-2">
              <div className="flex items-center gap-4 flex-wrap">
                <span>
                  Total Alumnos Registrados: <strong className="text-slate-950 font-bold">{estudiantesFiltrados.length}</strong>
                </span>
                <span>•</span>
                <span>
                  Mañana: <strong className="font-bold">{estudiantesFiltrados.filter(e => (e?.turno || 'Mañana') === 'Mañana').length}</strong>
                </span>
                <span>
                  Tarde: <strong className="font-bold">{estudiantesFiltrados.filter(e => e?.turno === 'Tarde').length}</strong>
                </span>
                <span>
                  Noche: <strong className="font-bold">{estudiantesFiltrados.filter(e => e?.turno === 'Noche').length}</strong>
                </span>
                <span>
                  Sábado: <strong className="font-bold">{estudiantesFiltrados.filter(e => e?.turno === 'Sábado').length}</strong>
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-500">
                Emisión: {fechaHoy} - {horaHoy}
              </div>
            </div>

            {/* SECCIÓN DE FIRMAS Y SELLOS OFICIALES PARA IMPRESIÓN */}
            <div className="mt-10 pt-6 grid grid-cols-3 gap-6 text-center text-xs text-slate-800">
              <div className="flex flex-col items-center">
                <div className="w-40 border-b-2 border-slate-500 mb-2"></div>
                <strong className="block text-slate-950">{config?.directorAcademico || 'Ing. Grover Marcelo Arispe R.'}</strong>
                <span className="text-[11px] text-slate-600 font-bold block">DIRECTOR ACADÉMICO</span>
                <span className="text-[9px] text-slate-500 font-mono">INSTITUTO TECNOLÓGICO ING DATA COMP</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase mb-2">
                  SELLO OFICIAL KÁRDEX
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  KÁRDEX Y ARCHIVO CENTRAL
                </span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-40 border-b-2 border-slate-500 mb-2"></div>
                <strong className="block text-slate-950">{config?.secretariaGeneral || 'Lic. Claudia Villarroel M.'}</strong>
                <span className="text-[11px] text-slate-600 font-bold block">SECRETARÍA GENERAL</span>
                <span className="text-[9px] text-slate-500 font-mono">{config?.resolucionMinisterial || 'R.M. No. 0397/2024'}</span>
              </div>
            </div>

            {/* PIE DE PÁGINA INSTITUCIONAL LEGAL */}
            <div className="mt-8 pt-3 border-t border-slate-300 text-center text-[10px] text-slate-500">
              Documento académico y registro de inscripción emitido conforme a la Ley de Educación N° 070 y Resolución Ministerial {config?.resolucionMinisterial || 'R.M. No. 0397/2024'}. Válido para trámites internos y certificación académica.
            </div>

          </div>
        </div>

        {/* PIE DEL MODAL DE VISTA EN PANTALLA (no-print) */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 no-print">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Vista previa en pantalla habilitada. Haz clic en <strong>Imprimir en Impresora / PDF</strong> para enviar a tu impresora física o guardar como archivo digital.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimirImpresora}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir en Impresora</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
