
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Apenas Login permitido conforme solicitado (cadastro desabilitado)
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 animate-in fade-in duration-500">
      <div className="mb-12 text-center">
        <div className="text-8xl mb-4 animate-bounce">🦾</div>
        <h1 className="text-4xl font-black text-blue-500 italic tracking-tighter">x7pro</h1>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Discipline Tracker</p>
      </div>

      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-black text-gray-800 mb-6 text-center uppercase tracking-tighter">
          Acesso Restrito
        </h2>

        {error && (
          <div className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl mb-6 text-red-500 text-[10px] font-black animate-in slide-in-from-top-2 uppercase">
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-100 p-4 rounded-2xl mb-6 text-green-600 text-[10px] font-black animate-in slide-in-from-top-2 uppercase text-center">
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">E-mail</label>
            <input 
              type="email" 
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 transition-all font-bold text-gray-700"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Senha</label>
            <input 
              type="password" 
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-5 py-4 outline-none focus:border-blue-400 transition-all font-bold text-gray-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-white transition-all duo-shadow duo-button-active border-b-8 uppercase tracking-tighter text-lg bg-blue-500 border-blue-700 ${loading ? 'opacity-50' : ''}`}
          >
            {loading ? 'Aguarde...' : 'ENTRAR'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-tight">
            Novos cadastros estão suspensos temporariamente.
          </p>
        </div>
      </div>
    </div>
  );
};
