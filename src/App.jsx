import { useState, useEffect } from 'react';
import './App.css';
import { gerarReflexao } from './lib/gemini';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. CHAVE SECRETA (Vem do arquivo .env automaticamente)
  const apiKey = import.meta.env.VITE_GEMINI_KEY;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <div className="app-container">
     
<div className="logo-area">
  <img 
      src="https://i.ibb.co/DHZ81tDR/Screenshot-20260108-003406-Edge-4.jpg" 
    
    alt="Logo Estoicismo" 
    style={{maxWidth: '120px', marginBottom: '10px', borderRadius: '50%'}} 
  />
</div>

      <h1>Estoicismo AI</h1>
      <p className="subtitle">Seu mentor digital para clareza e autocontrole.</p>

      {!session ? (
        <AuthScreen /> 
      ) : (
        <MainApp key={session.user.id} session={session} apiKey={apiKey} />
      )}
    </div>
  );
}

// --- TELA DE LOGIN/VENDA ---
function AuthScreen() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erro: " + error.message);
    setLoading(false);
  };

  const handleSubscribe = async () => {
    if (password !== confirmPassword) { alert("Senhas não conferem!"); return; }
    setLoading(true);
    // Simulação de pagamento
    setTimeout(async () => {
      const { error } = await supabase.auth.signUp({ 
        email, password, options: { data: { full_name: fullName } }
      });
      if (error) alert("Erro: " + error.message);
      else {
        localStorage.setItem("user_is_premium", "true");
        alert("Bem-vindo ao Premium!");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="feature-card" style={{textAlign: 'center'}}>
      <div className={`card-accent ${isLoginMode ? 'accent-green' : ''}`}></div>
      <h3>{isLoginMode ? "Acessar Mentor" : "Assinar Premium"}</h3>
      
      {!isLoginMode && (
        <div className="input-group">
          <input className="api-input" type="text" placeholder="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} />
        </div>
      )}
      
      <div className="input-group">
        <input className="api-input" type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="input-group">
        <input className="api-input" type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
      </div>

      {!isLoginMode && (
        <div className="input-group">
          <input className="api-input" type="password" placeholder="Confirmar Senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
      )}

      <button className={isLoginMode ? "btn-terracotta" : "btn-terracotta btn-premium"} onClick={isLoginMode ? handleLogin : handleSubscribe} disabled={loading}>
        {loading ? "Processando..." : (isLoginMode ? "Entrar" : "Assinar Agora (R$ 9,90)")}
      </button>

      <p style={{marginTop: '20px', cursor: 'pointer', color: '#E09F5E'}} onClick={() => setIsLoginMode(!isLoginMode)}>
        {isLoginMode ? "Quero assinar o plano" : "Já tenho conta"}
      </p>
    </div>
  );
}

// --- APP PRINCIPAL ---
function MainApp({ session, apiKey }) {
  const [reflexao, setReflexao] = useState("");
  const [userNote, setUserNote] = useState(""); 
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchHistorico(); }, []);

  const fetchHistorico = async () => {
    const { data } = await supabase.from('reflexoes').select('*').order('created_at', { ascending: false }).limit(5);
    setHistorico(data || []);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  async function handleGerar() {
    // Agora o erro avisa se o .env estiver errado
    if (!apiKey) { alert("Erro de Configuração: Chave Mestra não encontrada no arquivo .env"); return; }
    
    setLoading(true); setReflexao(""); 

    try {
      const contexto = historico.slice(0, 3).map(h => 
        `[${new Date(h.created_at).toLocaleDateString()}] Usuário: "${h.user_input || '-'}" -> Mentor: "${h.texto}"`
      ).reverse().join("\n");

      const prompt = `
      Você é um mentor estoico.
      HISTÓRICO:\n${contexto}
      HOJE: "${userNote || "Sem observações."}"
      Seja breve, sábio e prático.
      `;

      const textoGerado = await gerarReflexao(apiKey, prompt);
      setReflexao(textoGerado);

      await supabase.from('reflexoes').insert([{ user_id: session.user.id, texto: textoGerado, user_input: userNote }]);
      fetchHistorico(); setUserNote("");

    } catch (error) { alert("Erro: " + error.message); }
    setLoading(false);
  }

  return (
    <>
      <div className="feature-card">
        <div className="card-accent"></div>
        <h3>Sabedoria Diária</h3>
        <p>Como você está se sentindo hoje?</p>

        <div className="input-group">
          <textarea 
            className="api-input" 
            rows="3" 
            placeholder="(Opcional) Ex: Estou ansioso com o trabalho..." 
            value={userNote} 
            onChange={e => setUserNote(e.target.value)}
            style={{resize: 'none', textAlign: 'left'}}
          />
        </div>

        <button className="btn-terracotta" onClick={handleGerar} disabled={loading}>
          {loading ? "Mentor Analisando..." : "Receber Orientação"}
        </button>
      </div>

      {reflexao && (
        <div className="result-area">
          <h4 style={{color: '#EAD7C1', fontFamily: 'serif'}}>Reflexão:</h4>
          <div className="reflexao-texto">"{reflexao}"</div>
        </div>
      )}

      {historico.length > 0 && (
        <div style={{width: '100%', marginTop: '30px', textAlign: 'left'}}>
          <h3 style={{color: '#666', fontSize: '0.9rem', borderBottom: '1px solid #333'}}>📖 Diário Recente</h3>
          {historico.map(item => (
            <div key={item.id} style={{marginTop: '15px', paddingLeft: '10px', borderLeft: '2px solid #333'}}>
              <small style={{color: '#555'}}>{new Date(item.created_at).toLocaleDateString()}</small>
              {item.user_input && <p style={{color: '#E09F5E', fontSize: '0.8rem', margin: '2px 0'}}>Você: {item.user_input}</p>}
              <p style={{color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic'}}>"{item.texto.slice(0,80)}..."</p>
            </div>
          ))}
        </div>
      )}

      <button onClick={handleLogout} style={{marginTop: '30px', background: 'none', border: 'none', color: '#666', cursor: 'pointer'}}>Sair da conta</button>
    </>
  );
}
