/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import { 
  Carrera, 
  Materia,
  CursoAcelerado,
  InscripcionCursoAcelerado,
  Estudiante, 
  Calificacion, 
  ConfiguracionInstituto,
  CostoCarrera,
  PagoCuotaEstudiante,
  TransaccionPago,
  EstadoPagoCuota,
  HORARIOS_CURSOS_ACELERADOS
} from './types';
import { 
  CARRERAS_INICIALES, 
  MATERIAS_INICIALES,
  CURSOS_ACELERADOS_INICIALES,
  INSCRIPCIONES_CURSOS_INICIALES,
  ESTUDIANTES_INICIALES, 
  CALIFICACIONES_INICIALES, 
  INSTITUTO_CONFIG,
  tieneSubCursosAutorizados,
  COSTOS_CARRERAS_INICIALES,
  PAGOS_CUOTAS_INICIALES,
  generarPlan10CuotasEstudiante
} from './data/initialData';
import { initAuth, googleSignIn, logout } from './services/googleAuth';
import { 
  crearPlanillaCompletaEnGoogleDrive, 
  leerDatosDeGoogleSheets, 
  guardarDatosEnGoogleSheets,
  extraerSpreadsheetId 
} from './services/googleSheetsApi';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { InscripcionesView } from './components/InscripcionesView';
import { CarrerasMateriasView } from './components/CarrerasMateriasView';
import { CursosAceleradosView } from './components/CursosAceleradosView';
import { CalificacionesView } from './components/CalificacionesView';
import { BoletinOficialView } from './components/BoletinOficialView';
import { AppsScriptView } from './components/AppsScriptView';
import { GoogleConnectModal } from './components/GoogleConnectModal';
import { ReporteInscritosModal } from './components/ReporteInscritosModal';
import { PagosCuotasView } from './components/PagosCuotasView';

export default function App() {
  // Pestaña activa
  const [activeTab, setActiveTab] = useState('dashboard');

  // Estado de Autenticación con Google
  const [user, setUser] = useState<User | null>(null);
  const [modalGoogleAbierto, setModalGoogleAbierto] = useState(false);
  const [modalReporteInscritosAbierto, setModalReporteInscritosAbierto] = useState(false);
  
  // Estado de conexión con Google Sheets
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('IDC_SPREADSHEET_ID') || null;
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('IDC_SPREADSHEET_URL') || null;
  });
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => {
    return localStorage.getItem('IDC_LAST_SYNC') || null;
  });

  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isLoadingSheet, setIsLoadingSheet] = useState(false);
  const [isSavingSheet, setIsSavingSheet] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // 1. CONFIGURACIÓN INSTITUCIONAL
  const [config, setConfig] = useState<ConfiguracionInstituto>(() => {
    const saved = localStorage.getItem('IDC_CONFIG');
    let cfg = INSTITUTO_CONFIG;
    if (saved) {
      try {
        cfg = { ...INSTITUTO_CONFIG, ...JSON.parse(saved) };
      } catch (e) {}
    }
    cfg.nombre = 'INSTITUTO TECNOLÓGICO ING DATA COMP';
    cfg.siglas = 'ING DATA COMP';
    cfg.resolucionMinisterial = 'R.M. No. 0397/2024';
    return cfg;
  });

  // 2. CARRERAS PROFESIONALES (Régimen Anualizado - 3 Años: Sistemas, Diseño Gráfico, Informática Industrial, Contaduría General)
  const [carreras, setCarreras] = useState<Carrera[]>(() => {
    try {
      localStorage.removeItem('IDC_CARRERAS');
      const saved = localStorage.getItem('IDC_CARRERAS_V10_REAL');
      if (saved) {
        const parsed: Carrera[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const tieneAntiguas = parsed.some(c => 
            c.nombre.toLowerCase().includes('redes') || 
            c.nombre.toLowerCase().includes('robotica') ||
            c.nombre.toLowerCase().includes('telecomunicaciones')
          );
          if (!tieneAntiguas && parsed.length === 4) return parsed;
        }
      }
    } catch (e) {}
    localStorage.setItem('IDC_CARRERAS_V10_REAL', JSON.stringify(CARRERAS_INICIALES));
    return CARRERAS_INICIALES;
  });

  // 3. ASIGNATURAS ANUALES (Restaurar malla oficial completa de las 4 carreras oficiales)
  const [materias, setMaterias] = useState<Materia[]>(() => {
    const saved = localStorage.getItem('IDC_MATERIAS_V10_REAL') || 
                  localStorage.getItem('IDC_MATERIAS_V7_RESTORED') || 
                  localStorage.getItem('IDC_MATERIAS');
    if (saved) {
      try {
        const parsed: Materia[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let eliminadas = new Set<string>();
          try {
            eliminadas = new Set(JSON.parse(localStorage.getItem('IDC_MATERIAS_ELIMINADAS_IDS') || '[]'));
          } catch {}
          return parsed.filter(m => !eliminadas.has(m.id) && !eliminadas.has(m.codigo));
        }
      } catch (e) {}
    }
    return MATERIAS_INICIALES;
  });

  // 4. CURSOS ACELERADOS (16 Cursos Oficiales de Google Sheets de ING DATA COMP)
  const [cursosAcelerados, setCursosAcelerados] = useState<CursoAcelerado[]>(() => {
    const saved = localStorage.getItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 16) {
          // Asegurar que ÚNICAMENTE los 5 cursos autorizados tengan subCursos
          return parsed.map(c => {
            if (tieneSubCursosAutorizados(c.nombre) || tieneSubCursosAutorizados(c.id)) {
              return c;
            }
            return { ...c, subCursos: undefined };
          });
        }
      } catch (e) {}
    }
    // Inicializar con la lista oficial de 16 cursos con subcursos únicamente en los 5 autorizados
    localStorage.setItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS', JSON.stringify(CURSOS_ACELERADOS_INICIALES));
    return CURSOS_ACELERADOS_INICIALES;
  });

  // 5. ALUMNOS INSCRITOS EN CURSOS ACELERADOS (Con soporte de historial multi-curso y kárdex)
  const [inscripcionesCursos, setInscripcionesCursos] = useState<InscripcionCursoAcelerado[]>(() => {
    const saved = localStorage.getItem('IDC_INSCRIPCIONES_CURSOS_V4_KARDEX');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= INSCRIPCIONES_CURSOS_INICIALES.length) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('IDC_INSCRIPCIONES_CURSOS_V4_KARDEX', JSON.stringify(INSCRIPCIONES_CURSOS_INICIALES));
    return INSCRIPCIONES_CURSOS_INICIALES;
  });

  // Estado del Logotipo Oficial Personalizado
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => {
    return localStorage.getItem('IDC_LOGO_CUSTOM') || localStorage.getItem('IDC_CUSTOM_LOGO_URL') || null;
  });

  const handleSubirLogotipo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setCustomLogoUrl(base64);
        localStorage.setItem('IDC_LOGO_CUSTOM', base64);
        localStorage.setItem('IDC_CUSTOM_LOGO_URL', base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarLogotipo = () => {
    setCustomLogoUrl(null);
    localStorage.removeItem('IDC_LOGO_CUSTOM');
    localStorage.removeItem('IDC_CUSTOM_LOGO_URL');
  };

  // 5. ESTUDIANTES MATRICULADOS (Restaurar lista oficial asegurando presencia de Hugo Ugarte en Diseño Gráfico)
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>(() => {
    let lista: Estudiante[] = [];
    const saved = localStorage.getItem('IDC_ESTUDIANTES_V12_HUGO') || localStorage.getItem('IDC_ESTUDIANTES_V7_RESTORED') || localStorage.getItem('IDC_ESTUDIANTES');
    if (saved) {
      try {
        const parsed: Estudiante[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          lista = parsed.map(e => ({
            ...e,
            anioActual: (e.anioActual || (e.semestreActual ? Math.ceil(e.semestreActual / 2) : 1)) as 1 | 2 | 3
          }));
        }
      } catch (e) {}
    }
    if (lista.length === 0) {
      lista = ESTUDIANTES_INICIALES;
    }

    // Asegurar que Hugo Ugarte (Diseño Gráfico, car-2) esté siempre incorporado y activo
    const hugoEnLista = lista.some(e => 
      e.id === 'est-13' || 
      (e.nombres.toLowerCase().includes('hugo') && e.apellidos.toLowerCase().includes('ugarte'))
    );
    if (!hugoEnLista) {
      const hugoOficial = ESTUDIANTES_INICIALES.find(e => e.id === 'est-13') || {
        id: 'est-13',
        codigo: 'IDC-2026-013',
        nombres: 'Hugo',
        apellidos: 'Ugarte',
        ci: '7942158',
        expedido: 'CB' as const,
        email: 'vugarte1000@gmail.com',
        telefono: '76912345',
        carreraId: 'car-2', // Carrera de Diseño Gráfico
        anioActual: 1 as 1 | 2 | 3,
        semestreActual: 1,
        turno: 'Mañana' as const,
        fechaInscripcion: '2026-02-28',
        estado: 'Activo' as const,
        observaciones: 'Matriculación oficial en Carrera Técnica de Diseño Gráfico'
      };
      lista = [hugoOficial, ...lista];
    }

    return lista;
  });

  // 6. CALIFICACIONES POR MATERIA (Restaurar planilla completa con aprobación >= 51 y notas de Hugo Ugarte)
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>(() => {
    let lista: Calificacion[] = [];
    const saved = localStorage.getItem('IDC_CALIFICACIONES_V12_HUGO') || localStorage.getItem('IDC_CALIFICACIONES_V7_RESTORED') || localStorage.getItem('IDC_CALIFICACIONES');
    if (saved) {
      try {
        const parsed: Calificacion[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) lista = parsed;
      } catch (e) {}
    }
    if (lista.length === 0) {
      lista = CALIFICACIONES_INICIALES;
    }

    // Asegurar que existan notas para Hugo Ugarte
    const notasHugoEnLista = lista.some(c => c.estudianteId === 'est-13');
    if (!notasHugoEnLista) {
      const notasHugoOficiales = CALIFICACIONES_INICIALES.filter(c => c.estudianteId === 'est-13');
      lista = [...notasHugoOficiales, ...lista];
    }

    return lista;
  });

  // 7. ARANCELES Y COSTOS POR CARRERA (Pestaña Google Sheets: COSTOS_CARRERAS)
  const [costosCarreras, setCostosCarreras] = useState<CostoCarrera[]>(() => {
    const saved = localStorage.getItem('IDC_COSTOS_CARRERAS_V1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 4) return parsed;
      } catch (e) {}
    }
    return COSTOS_CARRERAS_INICIALES;
  });

  // 8. PLAN DE 10 CUOTAS Y PAGOS MENSUALES (Pestaña Google Sheets: PAGOS_10_CUOTAS)
  const [pagosCuotas, setPagosCuotas] = useState<PagoCuotaEstudiante[]>(() => {
    const saved = localStorage.getItem('IDC_PAGOS_CUOTAS_V1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return PAGOS_CUOTAS_INICIALES;
  });

  // Control del modal de inscripción rápida
  const [modalInscripcionAbierto, setModalInscripcionAbierto] = useState(false);
  const [estudianteSeleccionadoBoletin, setEstudianteSeleccionadoBoletin] = useState<string>('');

  // Persistencia local para uso offline y caché
  useEffect(() => {
    localStorage.setItem('IDC_CONFIG', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('IDC_CARRERAS', JSON.stringify(carreras));
  }, [carreras]);

  useEffect(() => {
    localStorage.setItem('IDC_MATERIAS_V10_REAL', JSON.stringify(materias));
    localStorage.setItem('IDC_MATERIAS_V7_RESTORED', JSON.stringify(materias));
    localStorage.setItem('IDC_MATERIAS', JSON.stringify(materias));
  }, [materias]);

  useEffect(() => {
    localStorage.setItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS', JSON.stringify(cursosAcelerados));
  }, [cursosAcelerados]);

  useEffect(() => {
    localStorage.setItem('IDC_ESTUDIANTES_V7_RESTORED', JSON.stringify(estudiantes));
    localStorage.setItem('IDC_ESTUDIANTES', JSON.stringify(estudiantes));
  }, [estudiantes]);

  useEffect(() => {
    localStorage.setItem('IDC_CALIFICACIONES_V7_RESTORED', JSON.stringify(calificaciones));
    localStorage.setItem('IDC_CALIFICACIONES', JSON.stringify(calificaciones));
  }, [calificaciones]);

  useEffect(() => {
    localStorage.setItem('IDC_COSTOS_CARRERAS_V1', JSON.stringify(costosCarreras));
  }, [costosCarreras]);

  useEffect(() => {
    localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(pagosCuotas));
  }, [pagosCuotas]);

  useEffect(() => {
    localStorage.setItem('IDC_INSCRIPCIONES_CURSOS_V4_KARDEX', JSON.stringify(inscripcionesCursos));
  }, [inscripcionesCursos]);

  // Autocorrección y recuperación automática si alguna colección quedó vacía accidentalmente
  useEffect(() => {
    if (!carreras || carreras.length === 0) {
      setCarreras(CARRERAS_INICIALES);
    }
    if (!materias || materias.length === 0) {
      let eliminadasCount = 0;
      try {
        eliminadasCount = (JSON.parse(localStorage.getItem('IDC_MATERIAS_ELIMINADAS_IDS') || '[]')).length;
      } catch {}
      if (eliminadasCount === 0) {
        setMaterias(MATERIAS_INICIALES);
      }
    }
    if (!estudiantes || estudiantes.length === 0) {
      setEstudiantes(ESTUDIANTES_INICIALES);
    }
    if (!calificaciones || calificaciones.length === 0) {
      setCalificaciones(CALIFICACIONES_INICIALES);
    }
    if (!cursosAcelerados || cursosAcelerados.length === 0) {
      setCursosAcelerados(CURSOS_ACELERADOS_INICIALES);
    }
  }, []);

  // Inicializar observador de sesión de Google Firebase
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Login con Google
  const handleLoginGoogle = async () => {
    setGoogleError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        if (spreadsheetId) {
          await sincronizarHojaDirecto(spreadsheetId, result.accessToken);
        }
      }
    } catch (err: any) {
      console.error('Error login Google:', err);
      setGoogleError(err.message || 'Error al iniciar sesión con Google.');
    }
  };

  // Logout
  const handleLogoutGoogle = async () => {
    await logout();
    setUser(null);
  };

  // Función núcleo de sincronización de Google Sheets
  const sincronizarHojaDirecto = useCallback(async (urlOId: string, customToken?: string | null, silent = false) => {
    const cleanId = extraerSpreadsheetId(urlOId);
    if (!cleanId) {
      if (!silent) setGoogleError('Por favor introduce un enlace o ID válido de Google Sheets.');
      return;
    }

    if (!silent) setIsLoadingSheet(true);
    setGoogleError(null);
    if (!silent) setSyncSuccessMessage(null);

    try {
      const res = await leerDatosDeGoogleSheets(cleanId, customToken);

      // Actualizar estados reactivos protegiendo contra vaciado accidental
      setConfig(res.config);
      if (res.carreras && res.carreras.length > 0) {
        setCarreras(res.carreras);
      }
      if (res.materias) {
        let eliminadasIds = new Set<string>();
        try {
          eliminadasIds = new Set(JSON.parse(localStorage.getItem('IDC_MATERIAS_ELIMINADAS_IDS') || '[]'));
        } catch {}

        let materiasUsuarioIds = new Set<string>();
        try {
          materiasUsuarioIds = new Set(JSON.parse(localStorage.getItem('IDC_MATERIAS_USUARIO_IDS') || '[]'));
        } catch {}

        setMaterias(prev => {
          // Materias de la hoja que NO fueron eliminadas por el usuario
          const remoteValidas = (res.materias || []).filter(m => !eliminadasIds.has(m.id) && !eliminadasIds.has(m.codigo));
          const remoteIds = new Set(remoteValidas.map(m => (m.id || '').toLowerCase()));
          const remoteCodigos = new Set(remoteValidas.map(m => (m.codigo || '').toLowerCase()));

          // Materias locales creadas o ingresadas por el usuario que deben conservarse
          const localesNuevas = prev.filter(m => 
            !eliminadasIds.has(m.id) && 
            !eliminadasIds.has(m.codigo) &&
            (!remoteIds.has((m.id || '').toLowerCase()) || materiasUsuarioIds.has(m.id) || materiasUsuarioIds.has(m.codigo))
          );

          // Si una materia ya está en ambos lados, mantener la versión local si el usuario la editó
          const fusionadas = remoteValidas.map(remoteMat => {
            const localMat = prev.find(p => p.id === remoteMat.id || p.codigo.toLowerCase() === remoteMat.codigo.toLowerCase());
            if (localMat && (materiasUsuarioIds.has(localMat.id) || materiasUsuarioIds.has(localMat.codigo))) {
              return { ...remoteMat, ...localMat };
            }
            return remoteMat;
          });

          // Combinar evitando duplicados por carrera, año y código
          const clavesVistas = new Set<string>();
          const listaCombinada: Materia[] = [];

          [...localesNuevas, ...fusionadas].forEach(m => {
            const clave = `${m.carreraId}-${m.anio}-${(m.codigo || '').toLowerCase().trim()}`;
            if (!clavesVistas.has(clave) && !eliminadasIds.has(m.id) && !eliminadasIds.has(m.codigo)) {
              clavesVistas.add(clave);
              listaCombinada.push(m);
            }
          });

          localStorage.setItem('IDC_MATERIAS_V10_REAL', JSON.stringify(listaCombinada));
          localStorage.setItem('IDC_MATERIAS_V7_RESTORED', JSON.stringify(listaCombinada));
          localStorage.setItem('IDC_MATERIAS', JSON.stringify(listaCombinada));

          return listaCombinada;
        });
      }
      if (res.cursosAcelerados && res.cursosAcelerados.length > 0) {
        setCursosAcelerados(prev => {
          let editadosIds = new Set<string>();
          try {
            editadosIds = new Set(JSON.parse(localStorage.getItem('IDC_CURSOS_EDITADOS_IDS') || '[]'));
          } catch {}

          return res.cursosAcelerados.map(remote => {
            const local = prev.find(p => p.id === remote.id || p.nombre.toLowerCase().trim() === remote.nombre.toLowerCase().trim());
            if (local && (local.editadoPorUsuario || editadosIds.has(local.id))) {
              return {
                ...remote,
                ...local,
                costoBs: local.costoBs,
                cargaHoraria: local.cargaHoraria,
                duracion: local.duracion,
                costosDisponibles: local.costosDisponibles || remote.costosDisponibles,
                editadoPorUsuario: true
              };
            }
            return remote;
          });
        });
      }
      if (res.estudiantes && res.estudiantes.length > 0) {
        setEstudiantes(prev => {
          // Fusionar de forma inteligente para preservar a estudiantes registrados localmente
          // (incluyendo a Hugo Ugarte) que aún no hayan sido subidos a la hoja de Google:
          const sheetIds = new Set(res.estudiantes.map(e => (e.id || '').toLowerCase()));
          const sheetCis = new Set(res.estudiantes.map(e => (e.ci || '').trim()));
          const sheetNombres = new Set(res.estudiantes.map(e => `${e.nombres} ${e.apellidos}`.toLowerCase().trim()));
          
          const localesNoEnSheet = prev.filter(e => 
            !sheetIds.has((e.id || '').toLowerCase()) && 
            !sheetCis.has((e.ci || '').trim()) &&
            !sheetNombres.has(`${e.nombres} ${e.apellidos}`.toLowerCase().trim())
          );
          return [...res.estudiantes, ...localesNoEnSheet];
        });
      }
      if (res.calificaciones && res.calificaciones.length > 0) {
        setCalificaciones(prev => {
          const sheetIds = new Set(res.calificaciones.map(c => (c.id || '').toLowerCase()));
          const sheetKeys = new Set(res.calificaciones.map(c => `${c.estudianteId}_${c.materiaId || c.cursoId}`.toLowerCase()));
          const localesNoEnSheet = prev.filter(c => 
            !sheetIds.has((c.id || '').toLowerCase()) &&
            !sheetKeys.has(`${c.estudianteId}_${c.materiaId || c.cursoId}`.toLowerCase())
          );
          return [...res.calificaciones, ...localesNoEnSheet];
        });
      }
      if (res.costosCarreras && res.costosCarreras.length > 0) {
        const tieneCostosModificadosLocales = localStorage.getItem('IDC_COSTOS_EDITADOS_USER') === 'true';
        if (tieneCostosModificadosLocales) {
          // Si el usuario tiene sesión activa, sincronizar los costos locales a Google Sheets para que queden guardados en la nube
          if (spreadsheetId && user) {
            guardarDatosEnGoogleSheets(
              cleanId,
              res.config,
              res.carreras,
              res.materias,
              res.cursosAcelerados,
              res.estudiantes,
              res.calificaciones,
              costosCarreras, // Preservar costos locales
              res.pagosCuotas && res.pagosCuotas.length > 0 ? res.pagosCuotas : pagosCuotas
            ).then(() => {
              localStorage.removeItem('IDC_COSTOS_EDITADOS_USER');
            }).catch(e => console.warn('Sync costos locales a Google Sheets:', e));
          }
        } else {
          setCostosCarreras(res.costosCarreras);
          localStorage.setItem('IDC_COSTOS_CARRERAS_V1', JSON.stringify(res.costosCarreras));
        }
      }
      if (res.pagosCuotas && res.pagosCuotas.length > 0) {
        setPagosCuotas(prev => {
          const sheetIds = new Set(res.pagosCuotas.map(p => p.id));
          const localesNoEnSheet = prev.filter(p => !sheetIds.has(p.id) && (p.montoPagadoBs > 0 || (p.transacciones && p.transacciones.length > 0)));
          return [...res.pagosCuotas, ...localesNoEnSheet];
        });
        localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(res.pagosCuotas));
      }

      // Guardar metadatos de conexión
      const fullUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
      const ahora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setSpreadsheetId(cleanId);
      setSpreadsheetUrl(fullUrl);
      setLastSyncTime(ahora);

      localStorage.setItem('IDC_SPREADSHEET_ID', cleanId);
      localStorage.setItem('IDC_SPREADSHEET_URL', fullUrl);
      localStorage.setItem('IDC_LAST_SYNC', ahora);

      if (!silent) {
        setSyncSuccessMessage(
          `¡Conexión y lectura exitosa de Google Sheets! Carreras Técnicas: ${res.carreras.map(c => c.nombre).join(', ')}. Materias: ${res.conteo.materias}, Alumnos: ${res.conteo.estudiantes}, Notas: ${res.conteo.calificaciones}.`
        );
      }
    } catch (err: any) {
      console.error('Error al sincronizar Google Sheets:', err);
      if (!silent) setGoogleError(err.message || 'No se pudo leer la hoja de cálculo.');
    } finally {
      if (!silent) setIsLoadingSheet(false);
    }
  }, []);

  // Sincronización permanente automática en segundo plano (cada 45s y al reenfocar)
  useEffect(() => {
    if (!spreadsheetId) return;

    const timer = setInterval(() => {
      sincronizarHojaDirecto(spreadsheetId, null, true);
    }, 45000);

    const handleFocus = () => {
      if (modalReporteInscritosAbierto || modalInscripcionAbierto) return;
      sincronizarHojaDirecto(spreadsheetId, null, true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', handleFocus);
    };
  }, [spreadsheetId, sincronizarHojaDirecto]);

  // Cargar planilla existente desde el modal
  const handleCargarPlanillaExistente = async (urlOId: string) => {
    await sincronizarHojaDirecto(urlOId);
  };

  // Sincronización rápida
  const handleSincronizarRapido = async () => {
    if (spreadsheetId) {
      await sincronizarHojaDirecto(spreadsheetId);
    } else {
      setModalGoogleAbierto(true);
    }
  };

  // Guardar datos actuales del sistema de vuelta a Google Sheets
  const handleGuardarEnHoja = async () => {
    if (!spreadsheetId) {
      setGoogleError('No hay ninguna hoja de cálculo conectada. Por favor introduce el ID o crea una hoja para sincronizar con Google Sheets.');
      setModalGoogleAbierto(true);
      throw new Error('No hay ninguna hoja de cálculo conectada.');
    }
    if (!user) {
      setGoogleError('Debes iniciar sesión con Google para guardar y sincronizar cambios directamente en la hoja de cálculo.');
      setModalGoogleAbierto(true);
      throw new Error('Debes iniciar sesión con Google.');
    }

    setIsSavingSheet(true);
    setGoogleError(null);
    setSyncSuccessMessage(null);

    try {
      await guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        materias,
        cursosAcelerados,
        estudiantes,
        calificaciones,
        costosCarreras,
        pagosCuotas
      );
      const ahora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(ahora);
      localStorage.setItem('IDC_LAST_SYNC', ahora);
      localStorage.removeItem('IDC_COSTOS_EDITADOS_USER');
      setSyncSuccessMessage('¡Datos guardados y actualizados exitosamente en Google Sheets (incluye pestañas COSTOS_CARRERAS y PAGOS_10_CUOTAS)!');
    } catch (err: any) {
      console.error(err);
      setGoogleError(err.message || 'Error al guardar datos en Google Sheets.');
      throw err;
    } finally {
      setIsSavingSheet(false);
    }
  };

  // Crear la base de datos en Google Sheets en vivo
  const handleCrearPlanillaEnDrive = async () => {
    if (!user) {
      setGoogleError('Debes iniciar sesión con Google primero para crear la hoja en tu Google Drive.');
      setModalGoogleAbierto(true);
      return;
    }

    setIsCreatingSheet(true);
    setGoogleError(null);
    try {
      const res = await crearPlanillaCompletaEnGoogleDrive(
        config,
        carreras,
        materias,
        cursosAcelerados,
        estudiantes,
        calificaciones,
        costosCarreras,
        pagosCuotas
      );
      setSpreadsheetId(res.spreadsheetId);
      setSpreadsheetUrl(res.spreadsheetUrl);
      const ahora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastSyncTime(ahora);
      
      localStorage.setItem('IDC_SPREADSHEET_ID', res.spreadsheetId);
      localStorage.setItem('IDC_SPREADSHEET_URL', res.spreadsheetUrl);
      localStorage.setItem('IDC_LAST_SYNC', ahora);

      setSyncSuccessMessage(`¡Planilla creada en Google Drive! Ya está vinculada para lectura y escritura.`);
      setModalGoogleAbierto(true);
    } catch (err: any) {
      console.error(err);
      setGoogleError(err.message || 'No se pudo crear la hoja en Google Drive.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Guardar estudiante
  const handleGuardarEstudiante = (estData: Partial<Estudiante>) => {
    let nuevoEstudiante: Estudiante;
    let listaActualizada: Estudiante[];
    let calificacionesActualizadas = calificaciones;

    if (estData.id) {
      const estudianteExistente = estudiantes.find(e => e.id === estData.id) || {} as Estudiante;
      nuevoEstudiante = {
        ...estudianteExistente,
        ...estData
      } as Estudiante;
      listaActualizada = estudiantes.map(e => e.id === estData.id ? nuevoEstudiante : e);
      setEstudiantes(listaActualizada);
    } else {
      const anio = new Date().getFullYear();
      const numPad = String(estudiantes.length + 1).padStart(3, '0');
      const estId = `est-${Date.now()}`;
      nuevoEstudiante = {
        id: estId,
        codigo: estData.codigo || `IDC-${anio}-${numPad}`,
        nombres: estData.nombres || '',
        apellidos: estData.apellidos || '',
        ci: estData.ci || '',
        expedido: estData.expedido || 'CB',
        email: estData.email || '',
        telefono: estData.telefono || '',
        carreraId: estData.carreraId || carreras[0]?.id || '',
        anioActual: (estData.anioActual || 1) as 1 | 2 | 3,
        semestreActual: (Number(estData.anioActual || 1) * 2 - 1),
        turno: estData.turno || 'Mañana',
        fechaInscripcion: new Date().toISOString().slice(0, 10),
        estado: 'Activo',
        observaciones: estData.observaciones || '',
        // Preservar íntegramente todos los datos arancelarios, becas y rebajas ingresados
        ...estData
      };
      listaActualizada = [nuevoEstudiante, ...estudiantes];
      setEstudiantes(listaActualizada);

      // Generar automáticamente las notas/materias del año para el nuevo estudiante
      const materiasAnio = materias.filter(
        m => m.carreraId === nuevoEstudiante.carreraId && m.anio === nuevoEstudiante.anioActual
      );
      if (materiasAnio.length > 0) {
        const nuevasNotas: Calificacion[] = materiasAnio.map((m, idx) => ({
          id: `cal-${Date.now()}-${idx}`,
          estudianteId: nuevoEstudiante.id,
          materiaId: m.id,
          cursoId: m.id,
          carreraId: nuevoEstudiante.carreraId,
          anio: nuevoEstudiante.anioActual,
          gestion: '2026',
          primerParcial: 80,
          segundoParcial: 85,
          practicas: 88,
          examenFinal: 85,
          notaFinal: 85,
          estadoFinal: 'Aprobado',
          asistenciaPorcentaje: 95,
          observaciones: 'Inscripción confirmada',
          fechaRegistro: new Date().toISOString().slice(0, 10)
        }));
        calificacionesActualizadas = [...nuevasNotas, ...calificaciones];
        setCalificaciones(calificacionesActualizadas);
      }
    }

    // Generar o actualizar plan de 10 cuotas mensuales para el estudiante
    let cuotasActualizadas = [...pagosCuotas];
    const tieneCuotas = cuotasActualizadas.some(p => p.estudianteId === nuevoEstudiante.id);
    
    if (!tieneCuotas) {
      const nuevasCuotas = generarPlan10CuotasEstudiante(nuevoEstudiante, costosCarreras);
      
      // Si el pago inicial cubrió matrícula y hubo excedente, o fue abono a cuota 1
      if (nuevoEstudiante.montoPagadoInicialBs !== undefined && nuevoEstudiante.montoPagadoInicialBs > 0) {
        const mat = nuevoEstudiante.montoMatriculaFinalBs ?? 300;
        const excedente = nuevoEstudiante.montoPagadoInicialBs - mat;
        if (excedente > 0 && nuevasCuotas[0]) {
          const abonoC1 = Math.min(excedente, nuevasCuotas[0].montoPactadoBs);
          nuevasCuotas[0] = {
            ...nuevasCuotas[0],
            montoPagadoBs: abonoC1,
            saldoPendienteBs: Math.max(0, nuevasCuotas[0].montoPactadoBs - abonoC1),
            estado: abonoC1 >= nuevasCuotas[0].montoPactadoBs ? 'Cancelado' : 'Parcial',
            ultimoNroRecibo: nuevoEstudiante.nroReciboInicial || 'REC-2026-INI',
            ultimaFechaPago: nuevoEstudiante.fechaPagoInicial || new Date().toISOString().slice(0, 10),
            ultimoMetodoPago: nuevoEstudiante.metodoPagoInicial || 'Efectivo',
            transacciones: [
              {
                id: `tx-ini-${Date.now()}`,
                fecha: nuevoEstudiante.fechaPagoInicial || new Date().toISOString().slice(0, 10),
                montoBs: abonoC1,
                metodoPago: nuevoEstudiante.metodoPagoInicial || 'Efectivo',
                nroRecibo: nuevoEstudiante.nroReciboInicial || 'REC-2026-INI',
                cajero: 'Caja Central (Inscripción)',
                observaciones: 'Abono inicial en matrícula'
              }
            ]
          };
        }
      }
      cuotasActualizadas = [...cuotasActualizadas, ...nuevasCuotas];
      setPagosCuotas(cuotasActualizadas);
      localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(cuotasActualizadas));
    } else {
      // SI YA TIENE CUOTAS Y SE ACTUALIZÓ EL ESTUDIANTE:
      // Ajustar el monto pactado de las cuotas con el nuevo arancel mensual (beca / rebaja actualizada)
      const costoC = costosCarreras.find(c => c.carreraId === nuevoEstudiante.carreraId) || costosCarreras[0];
      const nuevaCuotaBase = nuevoEstudiante.montoMensualidadFinalBs ?? costoC?.costoMensualidadBs ?? 380;
      const nombreActualizado = `${nuevoEstudiante.apellidos}, ${nuevoEstudiante.nombres}`;

      cuotasActualizadas = cuotasActualizadas.map(p => {
        if (p.estudianteId !== nuevoEstudiante.id || p.tipoPago !== 'Cuota Mensual') return p;

        if (p.estado === 'Cancelado') {
          return {
            ...p,
            nombreEstudiante: nombreActualizado,
            codigoEstudiante: nuevoEstudiante.codigo,
            carreraId: nuevoEstudiante.carreraId
          };
        }

        const nuevoSaldo = Math.max(0, nuevaCuotaBase - p.montoPagadoBs);
        const nuevoEstado: EstadoPagoCuota = nuevoSaldo === 0 ? 'Cancelado' : p.montoPagadoBs > 0 ? 'Parcial' : 'Pendiente';

        return {
          ...p,
          nombreEstudiante: nombreActualizado,
          codigoEstudiante: nuevoEstudiante.codigo,
          carreraId: nuevoEstudiante.carreraId,
          montoPactadoBs: nuevaCuotaBase,
          saldoPendienteBs: nuevoSaldo,
          estado: nuevoEstado
        };
      });
      setPagosCuotas(cuotasActualizadas);
      localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(cuotasActualizadas));
    }

    // Persistir de inmediato en localStorage para máxima fiabilidad
    localStorage.setItem('IDC_ESTUDIANTES_V12_HUGO', JSON.stringify(listaActualizada));
    localStorage.setItem('IDC_ESTUDIANTES_V7_RESTORED', JSON.stringify(listaActualizada));
    localStorage.setItem('IDC_ESTUDIANTES', JSON.stringify(listaActualizada));
    localStorage.setItem('IDC_CALIFICACIONES_V12_HUGO', JSON.stringify(calificacionesActualizadas));
    localStorage.setItem('IDC_CALIFICACIONES', JSON.stringify(calificacionesActualizadas));

    // Si Google Sheets está conectado y hay usuario con sesión activa, sincronizar en vivo
    if (spreadsheetId && user) {
      guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        materias,
        cursosAcelerados,
        listaActualizada,
        calificacionesActualizadas,
        costosCarreras,
        cuotasActualizadas
      ).then(() => {
        const ahora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(ahora);
        localStorage.setItem('IDC_LAST_SYNC', ahora);
      }).catch(err => {
        console.warn('Sincronización en segundo plano con Google Sheets:', err);
      });
    }

    return nuevoEstudiante;
  };

  // Actualizar costos de carreras
  const handleActualizarCostosCarrera = (nuevosCostos: CostoCarrera[], actualizarCuotasEstudiantes = true) => {
    setCostosCarreras(nuevosCostos);
    localStorage.setItem('IDC_COSTOS_CARRERAS_V1', JSON.stringify(nuevosCostos));
    localStorage.setItem('IDC_COSTOS_EDITADOS_USER', 'true');

    let cuotasActualizadas = [...pagosCuotas];
    if (actualizarCuotasEstudiantes) {
      cuotasActualizadas = cuotasActualizadas.map(cuota => {
        if (cuota.tipoPago !== 'Cuota Mensual' || cuota.estado === 'Cancelado') return cuota;

        const costoCarrera = nuevosCostos.find(c => c.carreraId === cuota.carreraId);
        if (!costoCarrera) return cuota;

        const est = estudiantes.find(e => e.id === cuota.estudianteId);
        // Si el estudiante tiene rebaja o beca personalizada fijada, respetarla
        if (est?.montoMensualidadFinalBs !== undefined && est.montoMensualidadFinalBs !== null) {
          return cuota;
        }

        const nuevaMensualidad = costoCarrera.costoMensualidadBs;
        if (cuota.montoPactadoBs === nuevaMensualidad) return cuota;

        const nuevoSaldo = Math.max(0, nuevaMensualidad - cuota.montoPagadoBs);
        const nuevoEstado: EstadoPagoCuota = nuevoSaldo === 0 ? 'Cancelado' : cuota.montoPagadoBs > 0 ? 'Parcial' : 'Pendiente';

        return {
          ...cuota,
          montoPactadoBs: nuevaMensualidad,
          saldoPendienteBs: nuevoSaldo,
          estado: nuevoEstado
        };
      });

      setPagosCuotas(cuotasActualizadas);
      localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(cuotasActualizadas));
    }

    if (spreadsheetId && user) {
      guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        materias,
        cursosAcelerados,
        estudiantes,
        calificaciones,
        nuevosCostos,
        cuotasActualizadas
      ).then(() => {
        const ahora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(ahora);
        localStorage.setItem('IDC_LAST_SYNC', ahora);
        localStorage.removeItem('IDC_COSTOS_EDITADOS_USER');
      }).catch(err => console.warn('Error al guardar costos en sheets:', err));
    }
  };

  // Registrar cobro o abono individual de una cuota
  const handleRegistrarPagoCuota = (cuotaActualizada: PagoCuotaEstudiante, nuevaTx: TransaccionPago) => {
    const actualizados = pagosCuotas.some(p => p.id === cuotaActualizada.id)
      ? pagosCuotas.map(p => p.id === cuotaActualizada.id ? cuotaActualizada : p)
      : [...pagosCuotas, cuotaActualizada];

    setPagosCuotas(actualizados);
    localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(actualizados));

    if (spreadsheetId && user) {
      guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        materias,
        cursosAcelerados,
        estudiantes,
        calificaciones,
        costosCarreras,
        actualizados
      ).then(() => {
        const ahora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(ahora);
        localStorage.setItem('IDC_LAST_SYNC', ahora);
      }).catch(err => console.warn('Error al guardar pago en sheets:', err));
    }
  };

  // Registrar cobro o abono simultáneo de múltiples cuotas
  const handleRegistrarPagosMultiples = (
    cuotasActualizadas: PagoCuotaEstudiante[],
    nuevasTx: TransaccionPago[]
  ) => {
    const mapaActualizadas = new Map(cuotasActualizadas.map(c => [c.id, c]));
    let actualizados = pagosCuotas.map(p => mapaActualizadas.get(p.id) || p);
    
    // Si alguna cuota era nueva y no estaba en pagosCuotas
    cuotasActualizadas.forEach(c => {
      if (!actualizados.some(p => p.id === c.id)) {
        actualizados.push(c);
      }
    });

    setPagosCuotas(actualizados);
    localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(actualizados));

    if (spreadsheetId && user) {
      guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        materias,
        cursosAcelerados,
        estudiantes,
        calificaciones,
        costosCarreras,
        actualizados
      ).then(() => {
        const ahora = new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(ahora);
        localStorage.setItem('IDC_LAST_SYNC', ahora);
      }).catch(err => console.warn('Error al guardar pagos múltiples en sheets:', err));
    }
  };

  // Eliminar estudiante
  const handleEliminarEstudiante = (id: string) => {
    setEstudiantes(prev => prev.filter(e => e.id !== id));
    setCalificaciones(prev => prev.filter(c => c.estudianteId !== id));
  };

  // Guardar Carrera
  const handleGuardarCarrera = (carData: Partial<Carrera>) => {
    if (carData.id) {
      setCarreras(prev => prev.map(c => c.id === carData.id ? { ...c, ...carData } as Carrera : c));
    } else {
      const nueva: Carrera = {
        id: `car-${Date.now()}`,
        codigo: carData.codigo || `CAR-${carreras.length + 1}`,
        nombre: carData.nombre || 'Nueva Carrera Técnica',
        resolucion: carData.resolucion || 'R.M. No. 0397/2024',
        duracionAnios: 3,
        regimen: 'Anualizado',
        turnoDisponibles: carData.turnoDisponibles || ['Mañana', 'Noche'],
        color: carData.color || '#1E3A8A'
      };
      setCarreras(prev => [...prev, nueva]);
    }
  };

  // Eliminar Carrera
  const handleEliminarCarrera = (id: string) => {
    setCarreras(prev => prev.filter(c => c.id !== id));
    setMaterias(prev => prev.filter(m => m.carreraId !== id));
  };

  // Guardar Materia Anual
  const handleGuardarMateria = (matData: Partial<Materia>) => {
    const nuevaId = matData.id || `mat-${Date.now()}`;
    const codNormalizado = (matData.codigo || '').trim();

    // 1. Quitar este código e ID de la lista de eliminadas si existía previamente
    try {
      let eliminadas: string[] = JSON.parse(localStorage.getItem('IDC_MATERIAS_ELIMINADAS_IDS') || '[]');
      eliminadas = eliminadas.filter(item => 
        item !== matData.id && 
        item !== nuevaId && 
        item.toLowerCase() !== codNormalizado.toLowerCase()
      );
      localStorage.setItem('IDC_MATERIAS_ELIMINADAS_IDS', JSON.stringify(eliminadas));
    } catch {}

    // 2. Registrar en lista de materias creadas/editadas por el usuario para protegerlas de sobrescritura
    try {
      let editadas: string[] = JSON.parse(localStorage.getItem('IDC_MATERIAS_USUARIO_IDS') || '[]');
      if (!editadas.includes(nuevaId)) editadas.push(nuevaId);
      if (codNormalizado && !editadas.includes(codNormalizado)) editadas.push(codNormalizado);
      localStorage.setItem('IDC_MATERIAS_USUARIO_IDS', JSON.stringify(editadas));
    } catch {}

    let listaActualizada: Materia[];
    if (matData.id) {
      listaActualizada = materias.map(m => m.id === matData.id ? { 
        ...m, 
        ...matData,
        codigo: codNormalizado || m.codigo,
        nombre: (matData.nombre || m.nombre).trim()
      } as Materia : m);
    } else {
      const nueva: Materia = {
        id: nuevaId,
        codigo: codNormalizado || `MAT-${materias.length + 101}`,
        nombre: (matData.nombre || 'Nueva Asignatura Anual').trim(),
        carreraId: matData.carreraId || carreras[0]?.id || '',
        anio: (matData.anio || 1) as 1 | 2 | 3,
        cargaHoraria: Number(matData.cargaHoraria) || 120,
        docente: (matData.docente || '').trim(),
        prerrequisito: matData.prerrequisito || 'Ninguno'
      };
      listaActualizada = [...materias, nueva];
    }

    setMaterias(listaActualizada);

    // 3. Persistir de inmediato en todas las claves de almacenamiento local
    localStorage.setItem('IDC_MATERIAS_V10_REAL', JSON.stringify(listaActualizada));
    localStorage.setItem('IDC_MATERIAS_V7_RESTORED', JSON.stringify(listaActualizada));
    localStorage.setItem('IDC_MATERIAS', JSON.stringify(listaActualizada));

    // 4. Si Google Sheets está conectado con sesión de usuario, sincronizar inmediatamente a la hoja en la nube
    if (spreadsheetId && user) {
      guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        listaActualizada,
        cursosAcelerados,
        estudiantes,
        calificaciones,
        costosCarreras,
        pagosCuotas
      ).catch(err => console.warn('Error al guardar materia en Google Sheets:', err));
    }

    setSyncSuccessMessage(`✓ Asignatura "${matData.nombre || 'Materia'}" registrada permanentemente.`);
    setTimeout(() => setSyncSuccessMessage(null), 3500);
  };

  // Eliminar Materia Anual
  const handleEliminarMateria = (id: string) => {
    const matEliminada = materias.find(m => m.id === id);
    const nuevasMaterias = materias.filter(m => m.id !== id);
    setMaterias(nuevasMaterias);
    const nuevasCalifs = calificaciones.filter(c => c.materiaId !== id && c.cursoId !== id);
    setCalificaciones(nuevasCalifs);

    // Registrar ID y código de materia eliminada para evitar que la sincronización automática en segundo plano la reponga
    try {
      const eliminadas: string[] = JSON.parse(localStorage.getItem('IDC_MATERIAS_ELIMINADAS_IDS') || '[]');
      if (!eliminadas.includes(id)) {
        eliminadas.push(id);
      }
      if (matEliminada && matEliminada.codigo && !eliminadas.includes(matEliminada.codigo)) {
        eliminadas.push(matEliminada.codigo);
      }
      localStorage.setItem('IDC_MATERIAS_ELIMINADAS_IDS', JSON.stringify(eliminadas));
    } catch {}

    localStorage.setItem('IDC_MATERIAS_V10_REAL', JSON.stringify(nuevasMaterias));
    localStorage.setItem('IDC_MATERIAS_V7_RESTORED', JSON.stringify(nuevasMaterias));
    localStorage.setItem('IDC_MATERIAS', JSON.stringify(nuevasMaterias));
    localStorage.setItem('IDC_CALIFICACIONES_V7_RESTORED', JSON.stringify(nuevasCalifs));
    localStorage.setItem('IDC_CALIFICACIONES', JSON.stringify(nuevasCalifs));

    // Si Google Sheets está conectado con sesión de usuario, actualizar la hoja en Google Drive de forma inmediata
    if (spreadsheetId && user) {
      guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        nuevasMaterias,
        cursosAcelerados,
        estudiantes,
        nuevasCalifs,
        costosCarreras,
        pagosCuotas
      ).catch(err => console.warn('Error al actualizar Google Sheets tras eliminar materia:', err));
    }

    setSyncSuccessMessage(`✓ Materia "${matEliminada?.nombre || id}" eliminada permanentemente.`);
    setTimeout(() => setSyncSuccessMessage(null), 3500);
  };

  // Guardar Curso Acelerado
  const handleGuardarCursoAcelerado = (caData: Partial<CursoAcelerado>) => {
    if (caData.id) {
      setCursosAcelerados(prev => {
        const actualizados = prev.map(c => (c.id === caData.id || c.codigo === caData.codigo) ? { 
          ...c, 
          ...caData, 
          editadoPorUsuario: true 
        } as CursoAcelerado : c);
        localStorage.setItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS', JSON.stringify(actualizados));
        return actualizados;
      });

      // Registrar ID en lista de cursos editados por el usuario para protegerlos de sobrescrituras
      try {
        const editados: string[] = JSON.parse(localStorage.getItem('IDC_CURSOS_EDITADOS_IDS') || '[]');
        if (caData.id && !editados.includes(caData.id)) {
          editados.push(caData.id);
          localStorage.setItem('IDC_CURSOS_EDITADOS_IDS', JSON.stringify(editados));
        }
      } catch {}
    } else {
      const nuevo: CursoAcelerado = {
        id: `ca-${Date.now()}`,
        codigo: caData.codigo || `CA-${cursosAcelerados.length + 101}`,
        nombre: caData.nombre || 'Nuevo Curso Acelerado',
        descripcion: caData.descripcion || '',
        categoria: caData.categoria || 'Computación y Hardware',
        modalidad: caData.modalidad || 'Presencial',
        duracion: caData.duracion || '4 Semanas (40 Horas)',
        cargaHoraria: caData.cargaHoraria || 40,
        docente: caData.docente || '',
        costoBs: caData.costoBs || 250,
        costosDisponibles: caData.costosDisponibles || [160, 180, 200, 220],
        horario: caData.horario || '8 a 10',
        horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
        cupoMaximo: caData.cupoMaximo || 25,
        inscritos: caData.inscritos || 0,
        estado: caData.estado || 'Inscripciones Abiertas',
        editadoPorUsuario: true
      };
      setCursosAcelerados(prev => {
        const actualizados = [nuevo, ...prev];
        localStorage.setItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS', JSON.stringify(actualizados));
        return actualizados;
      });
    }

    setSyncSuccessMessage(`✓ Modificaciones de "${caData.nombre || 'Curso'}" guardadas exitosamente.`);
    setTimeout(() => setSyncSuccessMessage(null), 3500);
  };

  // Eliminar Curso Acelerado
  const handleEliminarCursoAcelerado = (id: string) => {
    setCursosAcelerados(prev => prev.filter(c => c.id !== id));
  };

  // Restaurar Catálogo Completo (16 Cursos Oficiales de Google Sheets)
  const handleRestaurarCatalogoAcelerados = () => {
    setCursosAcelerados(CURSOS_ACELERADOS_INICIALES);
    localStorage.setItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS', JSON.stringify(CURSOS_ACELERADOS_INICIALES));
  };

  // Restaurar Base de Datos Completa Oficial (Carreras, Materias, Alumnos Ficticios y Calificaciones)
  const handleRestaurarBaseDatosCompleta = () => {
    setCarreras(CARRERAS_INICIALES);
    setMaterias(MATERIAS_INICIALES);
    setEstudiantes(ESTUDIANTES_INICIALES);
    setCalificaciones(CALIFICACIONES_INICIALES);
    setCursosAcelerados(CURSOS_ACELERADOS_INICIALES);
    setInscripcionesCursos(INSCRIPCIONES_CURSOS_INICIALES);
    setCostosCarreras(COSTOS_CARRERAS_INICIALES);
    setPagosCuotas(PAGOS_CUOTAS_INICIALES);

    localStorage.setItem('IDC_CARRERAS', JSON.stringify(CARRERAS_INICIALES));
    localStorage.setItem('IDC_MATERIAS_V7_RESTORED', JSON.stringify(MATERIAS_INICIALES));
    localStorage.setItem('IDC_MATERIAS', JSON.stringify(MATERIAS_INICIALES));
    localStorage.setItem('IDC_ESTUDIANTES_V7_RESTORED', JSON.stringify(ESTUDIANTES_INICIALES));
    localStorage.setItem('IDC_ESTUDIANTES', JSON.stringify(ESTUDIANTES_INICIALES));
    localStorage.setItem('IDC_CALIFICACIONES_V7_RESTORED', JSON.stringify(CALIFICACIONES_INICIALES));
    localStorage.setItem('IDC_CALIFICACIONES', JSON.stringify(CALIFICACIONES_INICIALES));
    localStorage.setItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS', JSON.stringify(CURSOS_ACELERADOS_INICIALES));
    localStorage.setItem('IDC_INSCRIPCIONES_CURSOS_V4_KARDEX', JSON.stringify(INSCRIPCIONES_CURSOS_INICIALES));
    localStorage.setItem('IDC_INSCRIPCIONES_CURSOS_V3', JSON.stringify(INSCRIPCIONES_CURSOS_INICIALES));
    localStorage.setItem('IDC_COSTOS_CARRERAS_V1', JSON.stringify(COSTOS_CARRERAS_INICIALES));
    localStorage.setItem('IDC_PAGOS_CUOTAS_V1', JSON.stringify(PAGOS_CUOTAS_INICIALES));

    localStorage.removeItem('IDC_MATERIAS_ELIMINADAS_IDS');
    localStorage.removeItem('IDC_CURSOS_EDITADOS_IDS');

    setSyncSuccessMessage('¡Base de datos oficial de Carreras, Materias, Alumnos, Notas, Costos y 10 Cuotas restaurada con éxito!');
    setTimeout(() => setSyncSuccessMessage(null), 4000);
  };

  // Restaurar Aranceles por Defecto (Tarifas Oficiales de Resolución Ministerial)
  const handleRestaurarCostosPorDefecto = () => {
    setCostosCarreras(COSTOS_CARRERAS_INICIALES);
    localStorage.setItem('IDC_COSTOS_CARRERAS_V1', JSON.stringify(COSTOS_CARRERAS_INICIALES));
    if (spreadsheetId && user) {
      guardarDatosEnGoogleSheets(
        spreadsheetId,
        config,
        carreras,
        materias,
        cursosAcelerados,
        estudiantes,
        calificaciones,
        COSTOS_CARRERAS_INICIALES,
        pagosCuotas
      ).catch(err => console.warn(err));
    }
    setSyncSuccessMessage('Aranceles oficiales de las 4 carreras restablecidos a sus valores por defecto.');
    setTimeout(() => setSyncSuccessMessage(null), 4000);
  };

  // Inscribir Alumno a Curso Acelerado
  const handleInscribirAlumnoCurso = (incData: Partial<InscripcionCursoAcelerado>) => {
    const curso = cursosAcelerados.find(c => c.id === incData.cursoId || c.nombre === incData.cursoNombre);
    const esAutorizado = tieneSubCursosAutorizados(curso?.nombre, curso?.id);
    const subCursoFinal = esAutorizado ? incData.subCurso : undefined;
    const costoReal = Number(incData.costoRealBs) || Number(incData.costoBs) || (curso?.costoBs || 180);
    const descuento = Number(incData.descuentoBs) || 0;
    const costoFinal = Math.max(0, costoReal - descuento);
    const pagado = Number(incData.montoPagadoBs) || 0;
    const saldo = Math.max(0, costoFinal - pagado);

    // Verificar si realmente existe un registro con este ID para editar o agregar
    const yaExiste = incData.id ? inscripcionesCursos.some(item => item.id === incData.id) : false;

    if (yaExiste && incData.id) {
      setInscripcionesCursos(prev => {
        const actualizadas = prev.map(item => item.id === incData.id ? { 
          ...item, 
          ...incData,
          subCurso: subCursoFinal,
          costoRealBs: costoReal,
          descuentoBs: descuento,
          costoBs: costoFinal,
          montoPagadoBs: pagado,
          saldoBs: saldo
        } as InscripcionCursoAcelerado : item);
        localStorage.setItem('IDC_INSCRIPCIONES_CURSOS_V4_KARDEX', JSON.stringify(actualizadas));
        return actualizadas;
      });
      setSyncSuccessMessage(`✓ Inscripción de ${incData.nombres} ${incData.apellidos} actualizada con éxito.`);
      setTimeout(() => setSyncSuccessMessage(null), 3000);
    } else {
      const nuevoId = (incData.id && !inscripcionesCursos.some(i => i.id === incData.id)) 
        ? incData.id 
        : `inc-${Date.now()}`;

      const nuevo: InscripcionCursoAcelerado = {
        id: nuevoId,
        codigoInscripcion: incData.codigoInscripcion || `INC-${new Date().getFullYear()}-${String(inscripcionesCursos.length + 1).padStart(3, '0')}`,
        estudianteId: incData.estudianteId,
        nombres: incData.nombres || '',
        apellidos: incData.apellidos || '',
        ci: incData.ci || '',
        expedido: incData.expedido || 'CB',
        telefono: incData.telefono || '',
        email: incData.email || '',
        cursoId: incData.cursoId || (curso?.id || 'ca-01'),
        cursoNombre: incData.cursoNombre || (curso?.nombre || 'Curso Acelerado'),
        subCurso: subCursoFinal,
        horario: incData.horario || '8 a 10',
        modalidad: incData.modalidad || 'Presencial',
        costoRealBs: costoReal,
        descuentoBs: descuento,
        costoBs: costoFinal,
        montoPagadoBs: pagado,
        saldoBs: saldo,
        fechaInscripcion: incData.fechaInscripcion || new Date().toISOString().slice(0, 10),
        fechaInicioCurso: incData.fechaInicioCurso || curso?.fechaInicio || '2026-03-02',
        fechaFinCurso: incData.fechaFinCurso || curso?.fechaFin || '2026-03-27',
        duracionCurso: incData.duracionCurso || curso?.duracion || '4 Semanas (40 Horas)',
        cargaHorariaCurso: incData.cargaHorariaCurso || curso?.cargaHoraria || 40,
        docenteCurso: incData.docenteCurso || curso?.docente || '',
        estado: incData.estado || 'Inscrito',
        observaciones: incData.observaciones || ''
      };

      setInscripcionesCursos(prev => {
        const actualizadas = [nuevo, ...prev];
        localStorage.setItem('IDC_INSCRIPCIONES_CURSOS_V4_KARDEX', JSON.stringify(actualizadas));
        return actualizadas;
      });

      // Incrementar conteo de inscritos en el curso correspondiente
      setCursosAcelerados(prev => {
        const actualizados = prev.map(c => 
          (c.id === nuevo.cursoId || c.nombre.toLowerCase().trim() === nuevo.cursoNombre.toLowerCase().trim()) 
            ? { ...c, inscritos: (c.inscritos || 0) + 1 } 
            : c
        );
        localStorage.setItem('IDC_CURSOS_ACELERADOS_V10_SUBCURSOS_ESTRICTOS', JSON.stringify(actualizados));
        return actualizados;
      });

      setSyncSuccessMessage(`✓ Alumno ${nuevo.nombres} ${nuevo.apellidos} inscrito oficialmente con éxito.`);
      setTimeout(() => setSyncSuccessMessage(null), 3500);
    }
  };

  // Eliminar Inscripción a Curso Acelerado
  const handleEliminarInscripcionCurso = (id: string) => {
    const encontrada = inscripcionesCursos.find(i => i.id === id);
    if (encontrada) {
      setCursosAcelerados(prev => prev.map(c => c.id === encontrada.cursoId ? { ...c, inscritos: Math.max(0, (c.inscritos || 0) - 1) } : c));
    }
    setInscripcionesCursos(prev => prev.filter(item => item.id !== id));
  };

  // Guardar lote de calificaciones
  const handleGuardarCalificacionesLote = (nuevasCalifs: Calificacion[]) => {
    setCalificaciones(prev => {
      const mapa = new Map(prev.map(c => [`${c.estudianteId}-${c.materiaId || c.cursoId}-${c.gestion || '2026'}`, c]));
      nuevasCalifs.forEach(c => {
        mapa.set(`${c.estudianteId}-${c.materiaId || c.cursoId}-${c.gestion || '2026'}`, c);
      });
      const res = Array.from(mapa.values());
      localStorage.setItem('IDC_CALIFICACIONES_V7_RESTORED', JSON.stringify(res));
      localStorage.setItem('IDC_CALIFICACIONES', JSON.stringify(res));

      if (spreadsheetId && user) {
        guardarDatosEnGoogleSheets(
          spreadsheetId,
          config,
          carreras,
          materias,
          cursosAcelerados,
          estudiantes,
          res,
          costosCarreras,
          pagosCuotas
        ).catch(err => console.warn('Error al guardar calificaciones en Google Sheets:', err));
      }

      return res;
    });

    setSyncSuccessMessage(`✓ Se guardaron ${nuevasCalifs.length} registro(s) de calificaciones con éxito.`);
    setTimeout(() => setSyncSuccessMessage(null), 3500);
  };

  // Navegar a boletín de alumno
  const handleVerBoletinDeEstudiante = (estudianteId: string) => {
    setEstudianteSeleccionadoBoletin(estudianteId);
    setActiveTab('boletin');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
      {/* Barra de Navegación y Encabezado con estado Google Sheets en vivo */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={() => setModalGoogleAbierto(true)}
        onLogout={handleLogoutGoogle}
        spreadsheetUrl={spreadsheetUrl}
        spreadsheetId={spreadsheetId}
        onAbrirModalConexion={() => setModalGoogleAbierto(true)}
        onSincronizarRapido={handleSincronizarRapido}
        isLoadingSheet={isLoadingSheet}
        onGuardarEnHoja={handleGuardarEnHoja}
        isSavingSheet={isSavingSheet}
        customLogoUrl={customLogoUrl}
        onSubirLogotipo={handleSubirLogotipo}
        onEliminarLogotipo={handleEliminarLogotipo}
        onRestaurarBaseDatos={handleRestaurarBaseDatosCompleta}
        onAbrirReporteInscritos={() => setModalReporteInscritosAbierto(true)}
      />

      {/* Contenedor de Vistas */}
      <main className={`flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 ${modalReporteInscritosAbierto ? 'no-print' : ''}`}>
        {activeTab === 'dashboard' && (
          <DashboardView
            carreras={carreras}
            materias={materias}
            cursosAcelerados={cursosAcelerados}
            estudiantes={estudiantes}
            calificaciones={calificaciones}
            costosCarreras={costosCarreras}
            pagosCuotas={pagosCuotas}
            config={config}
            setActiveTab={setActiveTab}
            onNuevaInscripcion={() => {
              setActiveTab('inscripciones');
              setModalInscripcionAbierto(true);
            }}
            spreadsheetId={spreadsheetId}
            spreadsheetUrl={spreadsheetUrl}
            lastSyncTime={lastSyncTime}
            onAbrirModalConexion={() => setModalGoogleAbierto(true)}
            onSincronizarRapido={handleSincronizarRapido}
            onCargarPlanillaExistente={handleCargarPlanillaExistente}
            isLoadingSheet={isLoadingSheet}
            customLogoUrl={customLogoUrl}
            onRestaurarBaseDatos={handleRestaurarBaseDatosCompleta}
          />
        )}

        {activeTab === 'inscripciones' && (
          <InscripcionesView
            estudiantes={estudiantes}
            carreras={carreras}
            materias={materias}
            institutoConfig={config}
            customLogoUrl={customLogoUrl}
            costosCarreras={costosCarreras}
            pagosCuotas={pagosCuotas}
            onRegistrarPagoCuota={handleRegistrarPagoCuota}
            onGuardarEstudiante={handleGuardarEstudiante}
            onEliminarEstudiante={handleEliminarEstudiante}
            onVerBoletin={handleVerBoletinDeEstudiante}
            modalAbierto={modalInscripcionAbierto}
            setModalAbierto={setModalInscripcionAbierto}
            onRestaurarBaseDatos={handleRestaurarBaseDatosCompleta}
            onAbrirReporteInscritos={() => setModalReporteInscritosAbierto(true)}
            onIrAPagos={() => setActiveTab('pagos-cuotas')}
          />
        )}

        {activeTab === 'pagos-cuotas' && (
          <PagosCuotasView
            estudiantes={estudiantes}
            carreras={carreras}
            costosCarreras={costosCarreras}
            pagosCuotas={pagosCuotas}
            institutoConfig={config}
            customLogoUrl={customLogoUrl}
            onActualizarCostosCarrera={handleActualizarCostosCarrera}
            onRegistrarPagoCuota={handleRegistrarPagoCuota}
            onRegistrarPagosMultiples={handleRegistrarPagosMultiples}
            onGuardarEnHoja={handleGuardarEnHoja}
            isSavingSheet={isSavingSheet}
            spreadsheetId={spreadsheetId}
            spreadsheetUrl={spreadsheetUrl}
            user={user}
            onAbrirModalConexion={() => setModalGoogleAbierto(true)}
            lastSyncTime={lastSyncTime}
            onRestaurarCostosPorDefecto={handleRestaurarCostosPorDefecto}
          />
        )}

        {activeTab === 'carreras-materias' && (
          <CarrerasMateriasView
            carreras={carreras}
            materias={materias}
            onGuardarCarrera={handleGuardarCarrera}
            onEliminarCarrera={handleEliminarCarrera}
            onGuardarMateria={handleGuardarMateria}
            onEliminarMateria={handleEliminarMateria}
            customLogoUrl={customLogoUrl}
            onRestaurarBaseDatos={handleRestaurarBaseDatosCompleta}
          />
        )}

        {activeTab === 'cursos-acelerados' && (
          <CursosAceleradosView
            cursosAcelerados={cursosAcelerados}
            inscripciones={inscripcionesCursos}
            estudiantes={estudiantes}
            institutoConfig={config}
            onGuardarCurso={handleGuardarCursoAcelerado}
            onEliminarCurso={handleEliminarCursoAcelerado}
            onInscribirAlumno={handleInscribirAlumnoCurso}
            onEliminarInscripcion={handleEliminarInscripcionCurso}
            onRestaurarCatalogoCompleto={handleRestaurarCatalogoAcelerados}
            customLogoUrl={customLogoUrl}
          />
        )}

        {activeTab === 'calificaciones' && (
          <CalificacionesView
            carreras={carreras}
            materias={materias}
            estudiantes={estudiantes}
            calificaciones={calificaciones}
            institutoConfig={config}
            customLogoUrl={customLogoUrl}
            onGuardarCalificacionesLote={handleGuardarCalificacionesLote}
            onIrACarreras={() => setActiveTab('carreras-materias')}
            onRestaurarBaseDatos={handleRestaurarBaseDatosCompleta}
          />
        )}

        {activeTab === 'boletin' && (
          <BoletinOficialView
            estudiantes={estudiantes}
            carreras={carreras}
            materias={materias}
            calificaciones={calificaciones}
            config={config}
            estudianteSeleccionadoId={estudianteSeleccionadoBoletin}
            customLogoUrl={customLogoUrl}
            onSubirLogotipo={handleSubirLogotipo}
          />
        )}

        {activeTab === 'codigo-appsscript' && (
          <AppsScriptView />
        )}
      </main>

      {/* Footer Institucional */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-800">INSTITUTO TECNOLÓGICO ING DATA COMP</span>
            <span>•</span>
            <span>Cochabamba, Estado Plurinacional de Bolivia</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              R.M. No. 0397/2024
            </span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('codigo-appsscript')}
              className="text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
            >
              Ver Archivos .gs y .html
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Conexión Google Sheets & Drive */}
      <GoogleConnectModal
        abierto={modalGoogleAbierto}
        onCerrar={() => setModalGoogleAbierto(false)}
        user={user}
        onLogin={handleLoginGoogle}
        onCrearPlanilla={handleCrearPlanillaEnDrive}
        onCargarPlanillaExistente={handleCargarPlanillaExistente}
        onGuardarEnHoja={handleGuardarEnHoja}
        isCreatingSheet={isCreatingSheet}
        isLoadingSheet={isLoadingSheet}
        isSavingSheet={isSavingSheet}
        spreadsheetUrl={spreadsheetUrl}
        spreadsheetId={spreadsheetId}
        lastSyncTime={lastSyncTime}
        error={googleError}
        syncSuccessMessage={syncSuccessMessage}
      />

      {/* Modal Reporte e Impresión de Alumnos Inscritos */}
      {modalReporteInscritosAbierto && (
        <ReporteInscritosModal
          isOpen={modalReporteInscritosAbierto}
          onClose={() => setModalReporteInscritosAbierto(false)}
          estudiantes={estudiantes}
          carreras={carreras}
          materias={materias}
          config={config}
          customLogoUrl={customLogoUrl}
        />
      )}
    </div>
  );
}
