import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Link2,
  HelpCircle,
  Database,
  UploadCloud,
  Check,
  ArrowRight
} from 'lucide-react';
import { extraerSpreadsheetId } from '../services/googleSheetsApi';

interface GoogleConnectModalProps {
  abierto: boolean;
  onCerrar: () => void;
  user: User | null;
  onLogin: () => void;
  onCrearPlanilla: () => Promise<void>;
  onCargarPlanillaExistente: (urlOId: string) => Promise<void>;
  onGuardarEnHoja: () => Promise<void>;
  isCreatingSheet: boolean;
  isLoadingSheet: boolean;
  isSavingSheet: boolean;
  spreadsheetUrl: string | null;
  spreadsheetId: string | null;
  lastSyncTime: string | null;
  error: string | null;
  syncSuccessMessage: string | null;
}

export const GoogleConnectModal: React.FC<GoogleConnectModalProps> = ({
  abierto,
  onCerrar,
  user,
  onLogin,
  onCrearPlanilla,
  onCargarPlanillaExistente,
  onGuardarEnHoja,
  isCreatingSheet,
  isLoadingSheet,
  isSavingSheet,
  spreadsheetUrl,
  spreadsheetId,
  lastSyncTime,
  error,
  syncSuccessMessage
}) => {
  const [tabModal, setTabModal] = useState<'conectar' | 'crear' | 'ayuda'>('conectar');
  const [inputUrl, setInputUrl] = useState(spreadsheetUrl || spreadsheetId || '');
  const [confirmandoCreacion, setConfirmandoCreacion] = useState(false);
  const [confirmandoGuardado, setConfirmandoGuardado] = useState(false);

  if (!abierto) return null;

  const handleCargarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;
    await onCargarPlanillaExistente(inputUrl.trim());
  };

  const handleCrearConConfirmacion = async () => {
    setConfirmandoCreacion(false);
    await onCrearPlanilla();
  };

  const handleGuardarConConfirmacion = async () => {
    setConfirmandoGuardado(false);
    await onGuardarEnHoja();
  };

  const cleanId = extraerSpreadsheetId(inputUrl);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Cabecera del modal */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Conexión con Google Sheets
              </h3>
              <p className="text-xs text-slate-500">Base de Datos ING DATA COMP Cochabamba</p>
            </div>
          </div>
          <button onClick={onCerrar} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas del Modal */}
        <div className="flex border-b border-slate-200 text-xs font-bold gap-2">
          <button
            onClick={() => setTabModal('conectar')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              tabModal === 'conectar'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Conectar Hoja Existente</span>
          </button>
          <button
            onClick={() => setTabModal('crear')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              tabModal === 'crear'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Crear Nueva Hoja</span>
          </button>
          <button
            onClick={() => setTabModal('ayuda')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              tabModal === 'ayuda'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pasos / Ayuda</span>
          </button>
        </div>

        {/* Mensajes de Alerta / Éxito */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error de sincronización:</p>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {syncSuccessMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncSuccessMessage}</span>
          </div>
        )}

        {/* Estado de la cuenta de Google */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Cuenta Google:</span>
            {user ? (
              <span className="font-bold text-slate-800 truncate max-w-[200px]">{user.email}</span>
            ) : (
              <span className="text-amber-700 font-semibold">No iniciaste sesión</span>
            )}
          </div>

          {user ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" /> Autorizado
            </span>
          ) : (
            <button
              onClick={onLogin}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>

        {/* CONTENIDO TAB 1: CONECTAR HOJA EXISTENTE */}
        {tabModal === 'conectar' && (
          <div className="space-y-4">
            <form onSubmit={handleCargarSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enlace completo o ID de tu Google Sheet:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Copia el enlace de tu navegador cuando estés dentro de la hoja de Google modificada.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isLoadingSheet || !inputUrl.trim()}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingSheet ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Leyendo 5 Pestañas de Google Sheets...</span>
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4" />
                      <span>Cargar y Sincronizar mis Datos</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Hoja actualmente conectada */}
            {spreadsheetId && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Hoja Conectada y Activa
                  </span>
                  {lastSyncTime && (
                    <span className="text-[10px] text-slate-500">
                      Sincronizado: {lastSyncTime}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-100">
                  <span className="font-mono text-[11px] text-slate-600 truncate max-w-[260px]">
                    ID: {spreadsheetId}
                  </span>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 underline text-[11px]"
                  >
                    <span>Abrir Hoja</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Botón para enviar datos locales a la hoja */}
                {confirmandoGuardado ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 mt-2">
                    <p className="text-[11px] text-amber-900 font-bold">
                      ¿Deseas sobreescribir las filas de Google Sheets con los datos actuales del sistema?
                    </p>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setConfirmandoGuardado(false)}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-700 text-[11px] font-bold"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleGuardarConConfirmacion}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs"
                      >
                        Confirmar Guardado
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmandoGuardado(true)}
                    disabled={isSavingSheet}
                    className="w-full mt-2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    {isSavingSheet ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Guardando en Google Sheets...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5 text-blue-300" />
                        <span>Guardar Cambios Actuales en Google Sheets</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 2: CREAR NUEVA HOJA */}
        {tabModal === 'crear' && (
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Si aún no tienes una hoja o prefieres que el sistema cree una automáticamente en tu Google Drive con las 5 pestañas formateadas con los colores institucionales de ING DATA COMP, haz clic abajo:
            </p>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1.5">
              <span className="font-bold text-blue-900 block">Pestañas oficiales que se crearán:</span>
              <ul className="list-disc list-inside space-y-0.5 text-blue-800 font-mono text-[11px]">
                <li>CONFIGURACION (R.M. No. 0397/2024 y autoridades)</li>
                <li>CARRERAS (Carreras técnicas en régimen anualizado - 3 años)</li>
                <li>MATERIAS (Asignaturas anuales: 8-10 materias por año)</li>
                <li>CURSOS_ACELERADOS (Módulo separado de cursos cortos)</li>
                <li>ESTUDIANTES (Fichas de matrícula y año de estudio)</li>
                <li>CALIFICACIONES (Notas anuales sobre 100 puntos, aprobación ≥ 51)</li>
              </ul>
            </div>

            {confirmandoCreacion ? (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2.5">
                <p className="text-amber-900 font-bold">
                  ¿Confirmas la creación de la hoja en tu Google Drive?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setConfirmandoCreacion(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCrearConConfirmacion}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-2xs"
                  >
                    Crear Hoja Ahora
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmandoCreacion(true)}
                disabled={isCreatingSheet}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCreatingSheet ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creando Hoja en tu Google Drive...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Crear Hoja Completa en mi Drive</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* CONTENIDO TAB 3: PASOS / AYUDA */}
        {tabModal === 'ayuda' && (
          <div className="space-y-3.5 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 text-sm">
              ¿Cómo conectar tu Google Sheet modificada paso a paso?
            </h4>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                <div>
                  <p className="font-bold text-slate-900">Verifica los nombres de las 5 pestañas</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Tu archivo de Google Sheets debe contener las pestañas con los nombres: 
                    <strong className="text-slate-800"> CONFIGURACION</strong>, 
                    <strong className="text-slate-800"> CARRERAS</strong>, 
                    <strong className="text-slate-800"> CURSOS</strong>, 
                    <strong className="text-slate-800"> ESTUDIANTES</strong> y 
                    <strong className="text-slate-800"> CALIFICACIONES</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                <div>
                  <p className="font-bold text-slate-900">Inicia sesión con tu cuenta de Google</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Pulsa el botón <strong>"Iniciar Sesión"</strong> arriba con la misma cuenta de Google con la que creaste o tienes acceso a la hoja.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                <div>
                  <p className="font-bold text-slate-900">Permisos de la hoja en Google Drive</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    En Google Sheets, puedes hacer clic en <strong>Compartir</strong> y verificar que tu usuario tenga acceso de Lectura/Edición. También puedes poner <em>"Cualquier persona con el enlace puede ver"</em> para sincronización inmediata.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">4</span>
                <div>
                  <p className="font-bold text-slate-900">Pega el enlace y pulsa "Cargar y Sincronizar"</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Ve a la pestaña <strong>"Conectar Hoja Existente"</strong>, pega la URL de la hoja y pulsa el botón verde. Los datos ficticios desaparecerán y el Dashboard mostrará tu información real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
