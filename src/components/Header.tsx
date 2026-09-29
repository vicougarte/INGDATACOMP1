import React, { useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  LayoutDashboard, 
  UserPlus, 
  GraduationCap, 
  Zap, 
  FileCheck2, 
  Award, 
  Code2, 
  LogOut, 
  ExternalLink,
  RefreshCw,
  Link2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Printer,
  DollarSign
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  spreadsheetUrl: string | null;
  spreadsheetId: string | null;
  onAbrirModalConexion: () => void;
  onSincronizarRapido: () => void;
  isLoadingSheet: boolean;
  onGuardarEnHoja?: () => void;
  isSavingSheet?: boolean;
  customLogoUrl?: string | null;
  onSubirLogotipo?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEliminarLogotipo?: () => void;
  onRestaurarBaseDatos?: () => void;
  onAbrirReporteInscritos?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLogin,
  onLogout,
  spreadsheetUrl,
  spreadsheetId,
  onAbrirModalConexion,
  onSincronizarRapido,
  isLoadingSheet,
  onGuardarEnHoja,
  isSavingSheet,
  customLogoUrl,
  onSubirLogotipo,
  onEliminarLogotipo,
  onRestaurarBaseDatos,
  onAbrirReporteInscritos
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white shadow-xl sticky top-0 z-40 border-b border-blue-900/60 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra superior con branding y estado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-4">
          {/* Logo y Nombre del Instituto */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group shrink-0">
              <IngDataCompLogo size="md" customLogoUrl={customLogoUrl} />
              
              {/* Botón flotante para subir/cambiar logotipo */}
              {onSubirLogotipo && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Subir o cambiar logotipo institucional"
                  className="absolute -bottom-1 -right-1 p-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full shadow-lg transition opacity-80 hover:opacity-100 hover:scale-110 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                </button>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={onSubirLogotipo}
              />
            </div>

            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-xs">
                  INSTITUTO TECNOLÓGICO ING DATA COMP
                </h1>
                <span className="hidden sm:inline-flex text-[10px] bg-red-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  Cochabamba - Bolivia
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-1.5 text-xs text-blue-200/90 font-medium mt-0.5">
                <span className="bg-blue-900/90 px-2 py-0.5 rounded text-[11px] font-bold text-amber-300">
                  R.M. No. 0397/2024
                </span>
                <span className="text-blue-400">•</span>
                <span>Carreras Anualizadas (3 Años) y Cursos Acelerados</span>
                
                {/* Indicador o botón para subir logo */}
                {customLogoUrl ? (
                  <button
                    onClick={onEliminarLogotipo}
                    title="Restablecer logo por defecto de ING DATA COMP"
                    className="ml-2 inline-flex items-center gap-1 text-[10px] text-amber-300/80 hover:text-amber-200 underline cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Restablecer logo</span>
                  </button>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Subir archivo de logotipo oficial"
                    className="ml-2 inline-flex items-center gap-1 text-[10px] text-blue-300 hover:text-white underline cursor-pointer"
                  >
                    <ImageIcon className="w-2.5 h-2.5" />
                    <span>Subir logo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Acciones del lado derecho y sincronización con Google */}
          <div className="flex items-center flex-wrap gap-2.5">
            {spreadsheetId ? (
              <div className="flex items-center gap-2 bg-emerald-950/60 p-1 pl-2.5 rounded-xl border border-emerald-700/60 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-[11px]">Google Sheets Conectado (Sincronización Permanente)</span>
                </div>

                <button
                  onClick={onSincronizarRapido}
                  disabled={isLoadingSheet}
                  title="Volver a leer las pestañas de Google Sheets en vivo"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingSheet ? 'animate-spin' : ''}`} />
                  <span>Sincronizar Ahora</span>
                </button>

                {onGuardarEnHoja && user && (
                  <button
                    onClick={onGuardarEnHoja}
                    disabled={isSavingSheet}
                    title="Actualizar y guardar los datos actuales de la app en Google Sheets"
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-[11px] font-black flex items-center gap-1 transition disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSavingSheet ? 'animate-spin' : ''}`} />
                    <span>{isSavingSheet ? 'Guardando...' : 'Actualizar Hoja'}</span>
                  </button>
                )}

                <button
                  onClick={onAbrirModalConexion}
                  title="Configurar conexión de Hoja"
                  className="px-2 py-1 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 rounded-lg text-[11px] font-semibold cursor-pointer"
                >
                  Config
                </button>

                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-emerald-300 hover:text-white rounded-md"
                    title="Abrir hoja de cálculo de Google"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ) : (
              <button
                onClick={onAbrirModalConexion}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Conectar Google Sheets</span>
              </button>
            )}

            {/* Botón Imprimir Alumnos Inscritos */}
            {onAbrirReporteInscritos && (
              <button
                onClick={onAbrirReporteInscritos}
                title="Imprimir nómina de alumnos inscritos en pantalla y en impresora (por carreras, cursos, materias y turnos)"
                className="px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 border border-emerald-500/60 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden sm:inline">Imprimir Inscritos</span>
                <span className="sm:hidden">Imprimir</span>
              </button>
            )}

            {/* Botón Restaurar Base de Datos Oficial (Carreras, Materias, Alumnos y Notas) */}
            {onRestaurarBaseDatos && (
              <button
                onClick={() => {
                  onRestaurarBaseDatos();
                }}
                title="Restaurar Base de Datos Oficial (Sistemas Informáticos, Diseño Gráfico, Informática Industrial y Contaduría General)"
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Restaurar Base de Datos</span>
                <span className="sm:hidden">Restaurar BD</span>
              </button>
            )}

            {/* Usuario de Google Auth o Botón Login */}
            {user ? (
              <div className="flex items-center space-x-2 bg-blue-900/60 pl-2.5 pr-1 py-1 rounded-xl border border-blue-700/60">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold leading-tight truncate max-w-[120px]">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-blue-300 font-mono leading-none">
                    Google Conectado
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Perfil"
                    className="w-7 h-7 rounded-lg border border-blue-400"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-blue-800 text-white flex items-center justify-center font-bold text-xs">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  title="Cerrar sesión de Google"
                  className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-800/80 rounded-lg transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <nav className="flex space-x-1.5 overflow-x-auto py-2.5 border-t border-blue-900/60 scrollbar-none text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-blue-100 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inscripciones')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'inscripciones'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-blue-100 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscripciones</span>
          </button>

          <button
            onClick={() => setActiveTab('pagos-cuotas')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'pagos-cuotas'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50'
                : 'text-emerald-200 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-300" />
            <span>Costos y 10 Cuotas</span>
          </button>

          <button
            onClick={() => setActiveTab('carreras-materias')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'carreras-materias'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-blue-100 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Carreras y Asignaturas Anuales</span>
          </button>

          <button
            onClick={() => setActiveTab('cursos-acelerados')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'cursos-acelerados'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-900/50'
                : 'text-amber-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Cursos Acelerados</span>
          </button>

          <button
            onClick={() => setActiveTab('calificaciones')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'calificaciones'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-blue-100 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Calificaciones</span>
          </button>

          <button
            onClick={() => setActiveTab('boletin')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'boletin'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-blue-100 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Boletín Oficial</span>
          </button>

          <button
            onClick={() => setActiveTab('codigo-appsscript')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
              activeTab === 'codigo-appsscript'
                ? 'bg-slate-800 text-white font-bold shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-blue-900/40'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Google Apps Script</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
