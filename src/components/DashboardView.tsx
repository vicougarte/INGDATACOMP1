import React, { useState } from 'react';
import { 
  Carrera, 
  Materia, 
  CursoAcelerado, 
  Estudiante, 
  Calificacion, 
  ConfiguracionInstituto,
  CostoCarrera,
  PagoCuotaEstudiante
} from '../types';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Zap,
  TrendingUp, 
  Award, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Code2,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  Link2,
  Sparkles,
  Layers,
  DollarSign,
  Receipt,
  CreditCard
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';

interface DashboardViewProps {
  carreras: Carrera[];
  materias: Materia[];
  cursosAcelerados: CursoAcelerado[];
  estudiantes: Estudiante[];
  calificaciones: Calificacion[];
  costosCarreras?: CostoCarrera[];
  pagosCuotas?: PagoCuotaEstudiante[];
  config: ConfiguracionInstituto;
  setActiveTab: (tab: string) => void;
  onNuevaInscripcion: () => void;
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncTime: string | null;
  onAbrirModalConexion: () => void;
  onSincronizarRapido: () => void;
  onCargarPlanillaExistente: (urlOId: string) => Promise<void>;
  isLoadingSheet: boolean;
  customLogoUrl?: string | null;
  onRestaurarBaseDatos?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  carreras,
  materias,
  cursosAcelerados,
  estudiantes,
  calificaciones,
  costosCarreras = [],
  pagosCuotas = [],
  config,
  setActiveTab,
  onNuevaInscripcion,
  spreadsheetId,
  spreadsheetUrl,
  lastSyncTime,
  onAbrirModalConexion,
  onSincronizarRapido,
  onCargarPlanillaExistente,
  isLoadingSheet,
  customLogoUrl,
  onRestaurarBaseDatos
}) => {
  const [inputUrlRapido, setInputUrlRapido] = useState('');

  // Cálculos estadísticos (Aprobación >= 51 según normativa boliviana)
  const totalEstudiantes = estudiantes.length;
  const totalCarreras = carreras.length;
  const totalMaterias = materias.length;
  const totalCursosAcelerados = cursosAcelerados.length;
  
  const totalCalificaciones = calificaciones.length;
  const aprobados = calificaciones.filter(c => Number(c.notaFinal || 0) >= 51).length;
  const segundoTurno = calificaciones.filter(c => c.estadoFinal === 'Segundo Turno').length;
  const reprobados = calificaciones.filter(c => Number(c.notaFinal || 0) < 51 && c.estadoFinal !== 'Segundo Turno').length;

  const tasaAprobacion = totalCalificaciones > 0 ? Math.round((aprobados / totalCalificaciones) * 100) : 0;
  const sumaNotas = calificaciones.reduce((acc, curr) => acc + Number(curr.notaFinal || 0), 0);
  const promedioGeneral = totalCalificaciones > 0 ? Math.round(sumaNotas / totalCalificaciones) : 0;

  // Cálculos Económicos y Cuotas
  const totalRecaudadoCuotas = pagosCuotas.reduce((acc, p) => acc + (p.montoPagadoBs || 0), 0);
  const cuotasPagadas = pagosCuotas.filter(p => p.estado === 'Cancelado').length;
  const cuotasPendientes = pagosCuotas.filter(p => p.estado === 'Pendiente' || p.estado === 'Vencido').length;
  const cuotasParciales = pagosCuotas.filter(p => p.estado === 'Parcial').length;

  const handleCargarRapido = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrlRapido.trim()) return;
    await onCargarPlanillaExistente(inputUrlRapido.trim());
    setInputUrlRapido('');
  };

  return (
    <div className="space-y-6">
      {/* BANNER DE ESTADO DE CONEXIÓN CON GOOGLE SHEETS */}
      {spreadsheetId ? (
        <div className="bg-emerald-900/90 text-white p-4 sm:p-5 rounded-3xl border border-emerald-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-400/40 text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-black text-sm text-emerald-200 uppercase tracking-wider">
                  Base de Datos en Vivo Conectada
                </span>
                {lastSyncTime && (
                  <span className="text-[11px] text-emerald-300/80 font-mono">
                    (Última sync: {lastSyncTime})
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Sincronizando automáticamente Carreras Anuales, Malla Curricular, Cursos Acelerados, Estudiantes y Calificaciones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={onSincronizarRapido}
              disabled={isLoadingSheet}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 cursor-pointer w-full md:w-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSheet ? 'animate-spin' : ''}`} />
              <span>{isLoadingSheet ? 'Sincronizando...' : 'Volver a Sincronizar'}</span>
            </button>

            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-emerald-950 hover:bg-emerald-800 text-emerald-200 font-bold text-xs rounded-xl border border-emerald-700/60 flex items-center justify-center gap-1.5 transition shrink-0"
              >
                <span>Abrir Hoja</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-blue-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                Google Sheets v4
              </span>
              <h3 className="font-black text-base sm:text-lg">
                ¿Tienes tu Google Sheet con las pestañas de carreras y notas?
              </h3>
            </div>
            <p className="text-xs text-blue-200/90 leading-relaxed">
              Pega aquí el enlace público o compartido de tu hoja de cálculo para conectar en vivo tus carreras, materias anuales, cursos acelerados y notas.
            </p>
          </div>

          <form onSubmit={handleCargarRapido} className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <input
              type="text"
              value={inputUrlRapido}
              onChange={(e) => setInputUrlRapido(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="w-full sm:w-80 px-3.5 py-2.5 bg-white/10 border border-blue-400/40 rounded-xl text-xs text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
            />
            <button
              type="submit"
              disabled={isLoadingSheet || !inputUrlRapido.trim()}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{isLoadingSheet ? 'Conectando...' : 'Conectar y Cargar'}</span>
            </button>
          </form>
        </div>
      )}

      {/* BIENVENIDA INSTITUCIONAL CON LOGOTIPO OFICIAL */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Logotipo Oficial */}
            <div className="shrink-0 p-2 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
              <IngDataCompLogo size="lg" customLogoUrl={customLogoUrl} />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="bg-red-600 text-white font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Cochabamba - Bolivia
                </span>
                <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-blue-300 uppercase">
                  {config.resolucionMinisterial}
                </span>
              </div>

              <h1 className="text-xl sm:text-3xl font-black text-slate-950 tracking-tight mt-2">
                {config.nombre}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-medium leading-relaxed">
                {config.subtitulo} • Sistema Integral de Malla Curricular Anualizada (8 a 10 materias por año), Cursos Acelerados y Kárdex Académico Oficial.
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4">
                <button
                  onClick={onNuevaInscripcion}
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>+ Inscribir Estudiante</span>
                </button>

                <button
                  onClick={() => setActiveTab('pagos-cuotas')}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Plan 10 Cuotas & Finanzas</span>
                </button>

                <button
                  onClick={() => setActiveTab('carreras-materias')}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-xl border border-blue-200 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Malla Curricular Anual</span>
                </button>

                <button
                  onClick={() => setActiveTab('cursos-acelerados')}
                  className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-700" />
                  <span>Cursos Acelerados ({totalCursosAcelerados})</span>
                </button>

                <button
                  onClick={() => setActiveTab('calificaciones')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Cargar Calificaciones</span>
                </button>

                {onRestaurarBaseDatos && (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas restaurar la base de datos oficial completa (Carreras, Materias, Alumnos Ficticios y Calificaciones Ficticias)?')) {
                        onRestaurarBaseDatos();
                      }
                    }}
                    title="Restaurar toda la base de datos de demostración"
                    className="px-4 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Restaurar Base de Datos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Estudiantes */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estudiantes Matriculados
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {totalEstudiantes}
            </div>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
              <span>●</span> Régimen Anual Activo
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-900 flex items-center justify-center">
            <Users className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Control Financiero / 10 Cuotas */}
        <div 
          onClick={() => setActiveTab('pagos-cuotas')}
          className="bg-white p-5 rounded-3xl border border-emerald-200 hover:border-emerald-400 hover:shadow-md transition cursor-pointer shadow-xs flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <span>Recaudado (Cuotas)</span>
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1 font-mono">
              {totalRecaudadoCuotas.toLocaleString()} <span className="text-xs font-bold">Bs</span>
            </div>
            <span className="text-[11px] text-slate-600 font-bold flex items-center gap-1 mt-1">
              <span className="text-emerald-600">✓ {cuotasPagadas} pagadas</span> • {cuotasPendientes} pend.
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition flex items-center justify-center">
            <DollarSign className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Carreras Técnicas (3 Años) */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Carreras Anualizadas
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {totalCarreras}
            </div>
            <span className="text-[11px] text-blue-600 font-bold flex items-center gap-1 mt-1">
              <span>3 Años de Formación</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-900 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Asignaturas Anuales */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Asignaturas Anuales
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {totalMaterias}
            </div>
            <span className="text-[11px] text-purple-600 font-bold flex items-center gap-1 mt-1">
              <span>8-10 por año</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-900 flex items-center justify-center">
            <BookOpen className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>

        {/* Cursos Acelerados Separados */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Cursos Acelerados
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
              {totalCursosAcelerados}
            </div>
            <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 mt-1">
              <span>Módulo Separado</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Zap className="w-6 h-6 stroke-[2.2]" />
          </div>
        </div>
      </div>

      {/* SECCIÓN RENDIMIENTO ACADÉMICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desglose de Rendimiento */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Rendimiento Académico Oficial</span>
            </h3>
            <span className="text-xs font-mono font-bold text-slate-400">
              Min. 51 pts
            </span>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Aprobados (≥ 51 pts)</span>
                <span className="text-emerald-700 font-mono font-black">{aprobados} ({tasaAprobacion}%)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${tasaAprobacion}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>En 2do Turno</span>
                <span className="text-amber-700 font-mono font-black">{segundoTurno}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${totalCalificaciones > 0 ? (segundoTurno / totalCalificaciones) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Reprobados (&lt; 51 pts)</span>
                <span className="text-red-600 font-mono font-black">{reprobados}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-red-500 h-full rounded-full transition-all"
                  style={{ width: `${totalCalificaciones > 0 ? (reprobados / totalCalificaciones) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Promedio General Anual:</span>
            <span className="font-black text-blue-950 font-mono text-base">
              {promedioGeneral} / 100
            </span>
          </div>
        </div>

        {/* Carreras y Materias por Año */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              <span>Carreras Técnicas y Asignaturas Registradas</span>
            </h3>
            <button
              onClick={() => setActiveTab('carreras-materias')}
              className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Malla Completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {carreras.map(c => {
              const mats = materias.filter(m => m.carreraId === c.id);
              const m1 = mats.filter(m => m.anio === 1).length;
              const m2 = mats.filter(m => m.anio === 2).length;
              const m3 = mats.filter(m => m.anio === 3).length;

              return (
                <div 
                  key={c.id}
                  onClick={() => setActiveTab('carreras-materias')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                      {c.codigo}
                    </span>
                    <span className="text-[10px] font-black text-blue-900">
                      3 Años Anualizados
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-slate-900 mt-2">
                    {c.nombre}
                  </h4>

                  <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-500">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      1°: {m1} mat.
                    </span>
                    <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-bold">
                      2°: {m2} mat.
                    </span>
                    <span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-bold">
                      3°: {m3} mat.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
