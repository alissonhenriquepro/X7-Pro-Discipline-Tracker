
import React, { useState, useEffect, useMemo } from 'react';
import { AppState, Day, Week, WorkoutType, SportsEvent } from './types';
import { loadStateFromSupabase, saveStateToSupabase, calculateStreak, generateInitialData } from './services/dataService';
import { MotivationalQuote } from './components/MotivationalQuote';
import { ProgressBar } from './components/ProgressBar';
import { WorkoutEditor } from './components/WorkoutEditor';
import { QuizSection } from './components/QuizSection';
import { DAILY_TIPS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'calendar' | 'stats' | 'quiz'>('home');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [calendarDayId, setCalendarDayId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState({ title: "OFENSIVA MANTIDA!", sub: "Disciplina vence motivação." });
  const [newEvent, setNewEvent] = useState({ title: '', time: '', location: '' });

  // Hooks de cálculo de estado
  const todayEvent = useMemo(() => {
    if (!state) return undefined;
    const today = new Date().toDateString();
    return state.months.flatMap(m => m.weeks.flatMap(w => w.days)).find(d => new Date(d.date).toDateString() === today)?.events?.[0];
  }, [state]);

  const tipOfTheDay = useMemo(() => {
    if (!state) return { ...DAILY_TIPS[0], index: 0 };
    const availableIndices = DAILY_TIPS.map((_, i) => i).filter(i => !state.user.seenTipIndices.includes(i));
    let tipIndex = availableIndices.length === 0 ? Math.floor(Math.random() * DAILY_TIPS.length) : availableIndices[Math.floor(Math.random() * availableIndices.length)];
    return { ...DAILY_TIPS[tipIndex], index: tipIndex };
  }, [state?.user.seenTipIndices]);

  // Carregar dados (Direto do LocalStorage já que não há login)
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const data = await loadStateFromSupabase(null);
      setState(data);
      setLoading(false);
    };
    init();
  }, []);

  // Persistência automática no LocalStorage
  useEffect(() => {
    if (state) {
      saveStateToSupabase(null, state);
    }
  }, [state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-4xl animate-bounce">🦾</div>
      </div>
    );
  }

  if (!state) {
    return <div className="p-10 text-center font-black uppercase text-blue-500">Erro ao inicializar x7pro</div>;
  }

  const currentMonth = state.months[0];
  const currentWeek = currentMonth.weeks[0]; 
  const weeklyWorkoutsDone = currentWeek.days.filter(d => d.workoutDone).length;

  const handleUpdateDay = (updatedDay: Day) => {
    const newState = { ...state };
    newState.months = newState.months.map(m => ({
      ...m,
      weeks: m.weeks.map(w => ({
        ...w,
        days: w.days.map(d => d.id === updatedDay.id ? updatedDay : d)
      }))
    }));
    setState(newState);
  };

  const addEventToDay = (dayId: string) => {
    if (!newEvent.title || !newEvent.time) return;
    const newState = { ...state };
    const event: SportsEvent = { id: Date.now().toString(), ...newEvent };
    newState.months = newState.months.map(m => ({
      ...m,
      weeks: m.weeks.map(w => ({
        ...w,
        days: w.days.map(d => d.id === dayId ? { ...d, events: [...(d.events || []), event] } : d)
      }))
    }));
    setState(newState);
    setNewEvent({ title: '', time: '', location: '' });
  };

  const removeEventFromDay = (dayId: string, eventId: string) => {
    const newState = { ...state };
    newState.months = newState.months.map(m => ({
      ...m,
      weeks: m.weeks.map(w => ({
        ...w,
        days: w.days.map(d => d.id === dayId ? { ...d, events: (d.events || []).filter(e => e.id !== eventId) } : d)
      }))
    }));
    setState(newState);
  };

  const updateWater = (amount: number) => {
    if (!selectedDayId) return;
    const newState = { ...state };
    newState.months = newState.months.map(m => ({
      ...m,
      weeks: m.weeks.map(w => ({
        ...w,
        days: w.days.map(d => {
          if (d.id === selectedDayId) {
            const next = Math.max(0, Math.min(8, d.waterIntake + amount));
            return { ...d, waterIntake: next };
          }
          return d;
        })
      }))
    }));
    setState(newState);
  };

  const markDayComplete = () => {
    if (!selectedDayId) return;
    const newState = { ...state };
    let wasAlreadyDone = false;
    newState.months = newState.months.map(m => ({
      ...m,
      weeks: m.weeks.map(w => ({
        ...w,
        days: w.days.map(d => {
          if (d.id === selectedDayId) {
            wasAlreadyDone = d.workoutDone;
            return { ...d, workoutDone: true };
          }
          return d;
        })
      }))
    }));
    if (!wasAlreadyDone) {
      newState.user.totalWorkouts += 1;
      const oldStreak = newState.user.currentStreak;
      const newStreak = calculateStreak(newState.months);
      newState.user.currentStreak = newStreak;
      if (newStreak > newState.user.bestStreak) newState.user.bestStreak = newStreak;
      
      if (newStreak > 0 && newStreak % 5 === 0 && oldStreak < newStreak) {
        newState.user.medals += 1;
        setCelebrationMessage({ title: "MEDALHA GANHA! 🥇", sub: "5 dias de ofensiva inabalável." });
        setShowCelebration(true);
      } else if (newStreak > 0 && newStreak % 21 === 0 && oldStreak < newStreak) {
        newState.user.diamonds += 1;
        setCelebrationMessage({ title: "DIAMANTE MESTRE! 💠", sub: "21 dias! Você alcançou o nível elite." });
        setShowCelebration(true);
      } else {
        setCelebrationMessage({ title: "OFENSIVA ATUALIZADA!", sub: "Continue assim, o resultado vem." });
        setShowCelebration(true);
      }
      setTimeout(() => setShowCelebration(false), 3500);
    }
    setState(newState);
  };

  const selectedDay = currentWeek.days.find(d => d.id === selectedDayId);
  const calendarSelectedDay = state.months.flatMap(m => m.weeks.flatMap(w => w.days)).find(d => d.id === calendarDayId);

  const markTipAsSeen = (index: number) => {
    if (!state.user.seenTipIndices.includes(index)) {
      const newState = { ...state };
      newState.user.seenTipIndices = [...newState.user.seenTipIndices, index];
      if (newState.user.seenTipIndices.length === DAILY_TIPS.length) newState.user.seenTipIndices = [];
      setState(newState);
    }
  };

  const handleReset = () => {
    if (window.confirm("Isso apagará todo seu progresso local. Tem certeza?")) {
      localStorage.removeItem('x7pro_local_state_v1');
      setState(generateInitialData());
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24 relative overflow-hidden bg-gray-50 text-gray-800">
      <div className="sticky top-0 z-30 bg-white border-b-2 border-gray-100 px-4 py-4 flex justify-between items-center duo-shadow">
        <div className="flex flex-col">
          <span className="text-xl font-black text-blue-500 italic tracking-tighter">x7pro</span>
          <button onClick={handleReset} className="text-[8px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors text-left">
            Reiniciar Treinos
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1"><span className="text-lg">🔥</span><span className="font-bold text-orange-500 text-sm">{state.user.currentStreak}</span></div>
          <div className="flex items-center space-x-1"><span className="text-lg">🥇</span><span className="font-bold text-yellow-600 text-sm">{state.user.medals}</span></div>
          <div className="flex items-center space-x-1"><span className="text-lg">💠</span><span className="font-bold text-blue-400 text-sm">{state.user.diamonds}</span></div>
        </div>
      </div>

      <main className="px-6 pt-6">
        {activeTab === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {todayEvent && (
              <div className="bg-yellow-100 border-2 border-yellow-200 rounded-3xl p-5 mb-6 duo-shadow animate-bounce-short">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📅</span>
                  <div>
                    <h3 className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Compromisso de Hoje!</h3>
                    <p className="font-black text-yellow-900 leading-tight">{todayEvent.title}</p>
                    <p className="text-[10px] font-bold text-yellow-600 uppercase">🕙 {todayEvent.time} • 📍 {todayEvent.location || 'Local não definido'}</p>
                  </div>
                </div>
              </div>
            )}
            <MotivationalQuote />
            <div className="bg-white border-2 border-gray-100 rounded-3xl p-6 duo-shadow mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Meta de Treinos</h3>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {[3, 4, 5, 6, 7].map(num => (
                    <button key={num} onClick={() => setState({...state!, user: {...state!.user, weeklyGoal: num}})} className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${state.user.weeklyGoal === num ? 'bg-white shadow text-blue-500' : 'text-gray-400'}`}>{num}</button>
                  ))}
                </div>
              </div>
              <ProgressBar current={weeklyWorkoutsDone} total={state.user.weeklyGoal} />
              <p className="text-[10px] text-gray-400 mt-2 text-right font-bold uppercase">{weeklyWorkoutsDone}/{state.user.weeklyGoal} concluídos</p>
            </div>
            <div className="mb-8">
              <div className="grid grid-cols-4 gap-3">
                {currentWeek.days.map((day) => (
                  <button key={day.id} onClick={() => setSelectedDayId(day.id)} className={`h-20 rounded-2xl flex flex-col items-center justify-center transition-all border-b-4 duo-button-active ${selectedDayId === day.id ? 'bg-blue-500 border-blue-700 text-white' : day.workoutDone ? 'bg-green-100 border-green-300 text-green-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    <span className="text-[8px] font-black uppercase mb-1">{day.dayName.substring(0, 3)}</span>
                    <span className="text-xl font-black">{day.workoutDone ? '✅' : new Date(day.date).getDate()}</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedDay && (
              <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6 mb-8 duo-shadow">
                <div className="flex justify-between items-center mb-4">
                  <div><h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Hidratação Diária</h3><p className="text-2xl font-black text-blue-900">{selectedDay.waterIntake}L / 8L</p></div>
                  <div className="text-4xl animate-pulse">💧</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => updateWater(-0.5)} className="flex-1 bg-white border-b-4 border-gray-200 py-3 rounded-2xl text-blue-500 font-black text-xl duo-button-active">-</button>
                  <button onClick={() => updateWater(0.5)} className="flex-3 bg-blue-500 border-b-4 border-blue-700 py-3 rounded-2xl text-white font-black text-xl duo-button-active">+ 500ml</button>
                </div>
              </div>
            )}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 mb-8 text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Dica: {tipOfTheDay.title}</p>
                 <p className="font-bold text-sm italic">"{tipOfTheDay.content}"</p>
                 {!state.user.seenTipIndices.includes(tipOfTheDay.index) && (
                   <button onClick={() => markTipAsSeen(tipOfTheDay.index)} className="mt-3 text-[9px] font-black bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all uppercase">Marcar como lida</button>
                 )}
               </div>
            </div>
            {selectedDay && <WorkoutEditor day={selectedDay} onUpdateDay={handleUpdateDay} onComplete={markDayComplete} />}
            
            {/* Botão do Ebook */}
            <div className="bg-gradient-to-br from-orange-400 to-yellow-500 rounded-3xl p-6 mb-12 shadow-lg border-b-8 border-orange-600 animate-in zoom-in duration-700">
               <div className="flex items-center space-x-4 mb-4">
                 <span className="text-4xl">📚</span>
                 <div>
                   <h3 className="text-[10px] font-black text-white/80 uppercase tracking-widest">Acelere seus Resultados</h3>
                   <p className="text-lg font-black text-white leading-tight uppercase tracking-tighter">O Segredo de Como Ganhar Massa Muscular</p>
                 </div>
               </div>
               <p className="text-white/90 text-xs font-bold mb-5 leading-relaxed">Descubra como o uso estratégico de proteínas pode transformar seu corpo de forma definitiva.</p>
               <a 
                 href="https://go.hotmart.com/O103350625P" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full text-center bg-white text-orange-600 font-black py-4 rounded-2xl border-b-4 border-gray-200 transition-all duo-button-active uppercase text-sm tracking-tighter"
               >
                 EU QUERO O E-BOOK AGORA
               </a>
            </div>
          </div>
        )}
        {activeTab === 'quiz' && <QuizSection answeredIds={state.user.answeredQuizIds} onAnswerCorrect={(id) => { const newState = { ...state }; if (!newState.user.answeredQuizIds.includes(id)) { newState.user.answeredQuizIds = [...newState.user.answeredQuizIds, id]; setState(newState); } }} />}
        {activeTab === 'stats' && (
          <div className="animate-in fade-in duration-500 pb-10">
            <h2 className="text-3xl font-black mb-6 tracking-tighter uppercase">Mural de Troféus</h2>
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-white p-8 rounded-3xl duo-shadow border-2 border-gray-100 flex items-center space-x-6">
                <div className="text-5xl">🥇</div>
                <div><span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Medalhas (5 dias)</span><p className="text-4xl font-black text-yellow-600">{state.user.medals}</p></div>
              </div>
              <div className="bg-white p-8 rounded-3xl duo-shadow border-2 border-gray-100 flex items-center space-x-6">
                <div className="text-5xl">💠</div>
                <div><span className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Diamantes (21 dias)</span><p className="text-4xl font-black text-blue-400">{state.user.diamonds}</p></div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'calendar' && (
          <div className="animate-in fade-in duration-500">
             <h2 className="text-3xl font-black mb-6 tracking-tighter uppercase">Agenda</h2>
             <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 duo-shadow mb-8">
                <h3 className="font-black text-xl text-gray-800 uppercase mb-6">{currentMonth.monthName} {currentMonth.year}</h3>
                <div className="grid grid-cols-7 gap-2">
                   {["S","T","Q","Q","S","S","D"].map((d, i) => <div key={i} className="text-center text-[10px] font-black text-gray-300 py-2">{d}</div>)}
                   {currentMonth.weeks.flatMap(w => w.days).map((d, i) => (
                     <button key={i} onClick={() => setCalendarDayId(d.id)} className={`aspect-square flex flex-col items-center justify-center rounded-xl text-xs font-bold border-b-2 transition-all relative ${calendarDayId === d.id ? 'bg-blue-500 text-white border-blue-700' : d.workoutDone ? 'bg-green-500 text-white border-green-700' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>{new Date(d.date).getDate()}{(d.events && d.events.length > 0) && (<div className={`absolute bottom-1 w-1 h-1 rounded-full ${calendarDayId === d.id ? 'bg-white' : 'bg-blue-400'}`} />)}</button>
                   ))}
                </div>
             </div>
             {calendarSelectedDay ? (
               <div className="animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 duo-shadow mb-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Eventos de {new Date(calendarSelectedDay.date).toLocaleDateString()}</h4>
                    <div className="space-y-3 mb-6">
                      {(calendarSelectedDay.events || []).map(ev => (
                        <div key={ev.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border-b-2 border-gray-200">
                           <div><p className="font-black text-sm text-gray-800">{ev.title}</p><p className="text-[10px] font-bold text-gray-400 uppercase">🕙 {ev.time} • 📍 {ev.location}</p></div>
                           <button onClick={() => removeEventFromDay(calendarSelectedDay.id, ev.id)} className="text-red-300 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                        </div>
                      ))}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border-2 border-dashed border-blue-100">
                       <p className="text-[10px] font-black text-blue-500 uppercase mb-3">Novo Evento Esportivo</p>
                       <input className="w-full bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none mb-2" placeholder="Título do Evento" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                       <div className="grid grid-cols-2 gap-2 mb-3">
                        <input className="bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none" type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} />
                        <input className="bg-white border-2 border-gray-100 rounded-xl px-3 py-2 text-sm outline-none" placeholder="Local" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                       </div>
                       <button onClick={() => addEventToDay(calendarSelectedDay.id)} className="w-full bg-blue-500 text-white font-black py-2 rounded-xl border-b-4 border-blue-700 active:translate-y-1 text-xs">AGENDAR EVENTO</button>
                    </div>
                  </div>
               </div>
             ) : <div className="text-center p-10 bg-white border-2 border-dashed border-gray-200 rounded-3xl duo-shadow text-gray-400 font-bold text-sm">Selecione um dia no calendário para gerenciar eventos!</div>}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-2 border-gray-100 flex justify-around items-center h-20 px-4 z-40 shadow-inner">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'home' ? 'text-blue-500 scale-110' : 'text-gray-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011-1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Treinar</span>
        </button>
        <button onClick={() => setActiveTab('quiz')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'quiz' ? 'text-blue-500 scale-110' : 'text-gray-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l4-2.18L12 3zm0 2.18l8 4.36L12 13.9 4 9.54l8-4.36z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Quiz</span>
        </button>
        <button onClick={() => setActiveTab('calendar')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'calendar' ? 'text-blue-500 scale-110' : 'text-gray-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Agenda</span>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center space-y-1 transition-all ${activeTab === 'stats' ? 'text-blue-500 scale-110' : 'text-gray-300'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Troféus</span>
        </button>
      </nav>

      {showCelebration && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 animate-in fade-in duration-300">
           <div className="text-8xl mb-4 animate-bounce">🔥</div>
           <h2 className="text-4xl font-black text-orange-500 text-center px-6 leading-tight uppercase tracking-tighter">{celebrationMessage.title}</h2>
           <p className="text-xl font-bold text-gray-600 mt-4 text-center px-8">{celebrationMessage.sub}</p>
           <button onClick={() => setShowCelebration(false)} className="mt-12 bg-green-500 text-white font-black px-10 py-4 rounded-3xl duo-shadow border-b-8 border-green-700 text-xl tracking-tighter active:translate-y-1 active:border-b-4 uppercase">Continuar!</button>
        </div>
      )}
    </div>
  );
};

export default App;
