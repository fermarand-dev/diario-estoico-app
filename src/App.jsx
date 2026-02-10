import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import "./App.css";

// --- CONFIGURAÇÃO ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = import.meta.env.VITE_GEMINI_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

// --- TELA DE LOGIN / ASSINATURA ---
function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("welcome"); // 'welcome', 'login', 'signup'

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Erro ao entrar: " + error.message);
    else onLogin(data.session);
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) alert("Erro ao cadastrar: " + error.message);
    else alert("Conta criada! Verifique seu e-mail.");
    setLoading(false);
  };

  // ESTILOS PARA RESPONSIVIDADE
  const containerStyle = {
    width: "100%",
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
    boxSizing: "border-box"
  };

  const inputStyle = {
    width: "100%", 
    padding: "12px", 
    marginBottom: "10px", 
    borderRadius: "8px", 
    border: "1px solid #444", 
    backgroundColor: "#222", 
    color: "#fff",
    boxSizing: "border-box"
  };

  const btnStyle = {
    width: "100%",
    padding: "15px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    marginBottom: "10px",
    display: "block",
    textDecoration: "none",
    boxSizing: "border-box"
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000", color: "#E09F5E" }}>
      <div style={containerStyle}>
        
                {/* LOGO E TÍTULO - CORRIGIDO */}
                <div style={{ marginBottom: "30px" }}>
          <img 
            src="https://i.ibb.co/DHZ01tDR/Screenshot-20260108-003406-Edge-4.jpg" 
            alt="Logo Estoicismo" 
            style={{ width: "120px", marginBottom: "20px", borderRadius: "10px" }} 
          />
          <h1 style={{ fontSize: "2rem", margin: "0 0 10px 0" }}>Estoicismo AI</h1>
          <p style={{ fontSize: "1rem", color: "#ccc", lineHeight: "1.4" }}>
            Seu mentor digital para clareza e autocontrole.
          </p>
        </div>
          
        {/* TELA INICIAL (ESCOLHA) */}
        {mode === "welcome" && (
          <>
            {/* BOTÃO 1: ASSINAR (LINK STRIPE) */}
            <a 
              href="https://buy.stripe.com/bJedR87bO6we1Vh50T9k401" 
              target="_blank" 
              style={{ ...btnStyle, backgroundColor: "#E09F5E", color: "#000" }}
            >
              QUERO ASSINAR AGORA (R$ 9,90)
            </a>

            {/* BOTÃO 2: JÁ SOU ASSINANTE */}
            <button 
              onClick={() => setMode("login")}
              style={{ ...btnStyle, backgroundColor: "transparent", border: "2px solid #E09F5E", color: "#E09F5E" }}
            >
              JÁ TENHO CONTA / ENTRAR
            </button>
          </>
        )}

        {/* FORMULÁRIO DE LOGIN */}
        {mode === "login" && (
          <>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>Acessar Mentor</h2>
            <input 
              type="email" 
              placeholder="Seu E-mail" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={inputStyle}
            />
            <input 
              type="password" 
              placeholder="Sua Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={inputStyle}
            />
            
            <button 
              onClick={handleLogin} 
              disabled={loading}
              style={{ ...btnStyle, backgroundColor: "#E09F5E", color: "#000", marginTop: "10px" }}
            >
              {loading ? "Entrando..." : "ENTRAR"}
            </button>

            <p 
              onClick={() => setMode("signup")} 
              style={{ marginTop: "15px", cursor: "pointer", fontSize: "0.9rem", color: "#bbb" }}
            >
              Não tem cadastro? <u>Criar conta grátis</u>
            </p>
            <p 
              onClick={() => setMode("welcome")} 
              style={{ marginTop: "15px", cursor: "pointer", fontSize: "0.9rem" }}
            >
              ← Voltar
            </p>
          </>
        )}

        {/* FORMULÁRIO DE CADASTRO */}
        {mode === "signup" && (
          <>
            <h2 style={{ color: "#fff", marginBottom: "20px" }}>Criar Conta</h2>
            <input 
              type="email" 
              placeholder="Seu melhor E-mail" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              style={inputStyle}
            />
            <input 
              type="password" 
              placeholder="Crie uma Senha" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              style={inputStyle}
            />
            
            <button 
              onClick={handleSignUp} 
              disabled={loading}
              style={{ ...btnStyle, backgroundColor: "#E09F5E", color: "#000", marginTop: "10px" }}
            >
              {loading ? "Criando..." : "CADASTRAR E-MAIL"}
            </button>

            <p 
              onClick={() => setMode("login")} 
              style={{ marginTop: "15px", cursor: "pointer", fontSize: "0.9rem", color: "#bbb" }}
            >
              Já tem conta? <u>Fazer Login</u>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

// --- APP PRINCIPAL (LÓGICA DO CHAT) ---
function MainApp({ session, apiKey }) {
  const [reflexao, setReflexao] = useState("");
  const [userNote, setUserNote] = useState("");
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar histórico ao iniciar
  useEffect(() => { fetchHistorico(); }, []);

  const fetchHistorico = async () => {
    const { data } = await supabase
      .from("diarios")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    if (data) setHistorico(data);
  };

  const gerarReflexao = async () => {
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Aja como um mentor estoico sábio (como Marco Aurélio ou Sêneca). O usuário está sentindo: "${userNote}". Dê um conselho curto, direto e prático de 2 parágrafos.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setReflexao(text);

      // Salvar no Supabase
      await supabase.from("diarios").insert([
        { user_id: session.user.id, content: userNote, ai_response: text }
      ]);
      fetchHistorico(); // Atualiza lista
    } catch (error) {
      console.error(error);
      setReflexao("Ocorreu um erro ao conectar com o sábio. Tente novamente.");
    }
    setLoading(false);
  };

  const btnChatStyle = {
    backgroundColor: "#E09F5E", color: "#000", padding: "12px 20px", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", width: "100%"
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", color: "#E09F5E", fontFamily: "Arial, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
        <h2>Diário Estoico</h2>
        <button onClick={() => supabase.auth.signOut()} style={{ background: "transparent", border: "1px solid #666", color: "#ccc", padding: "5px 10px", borderRadius: "4px" }}>Sair</button>
      </header>

      <div style={{ marginBottom: "30px" }}>
        <p style={{ color: "#ccc" }}>Como você está se sentindo hoje?</p>
        <textarea
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          placeholder="Ex: Estou ansioso com o trabalho..."
          style={{ width: "100%", height: "100px", padding: "10px", borderRadius: "8px", border: "1px solid #444", backgroundColor: "#222", color: "#fff", boxSizing: "border-box" }}
        />
        <button onClick={gerarReflexao} disabled={loading} style={btnChatStyle}>
          {loading ? "Consultando os Sábios..." : "Receber Conselho Estoico"}
        </button>
      </div>

      {reflexao && (
        <div style={{ backgroundColor: "#1a1a1a", padding: "20px", borderRadius: "8px", borderLeft: "4px solid #E09F5E", marginBottom: "30px" }}>
          <h3 style={{ marginTop: 0 }}>Conselho do Mentor:</h3>
          <p style={{ lineHeight: "1.6", color: "#eee" }}>{reflexao}</p>
        </div>
      )}

      <div>
        <h3 style={{ borderBottom: "1px solid #333", paddingBottom: "10px" }}>Suas Reflexões Anteriores</h3>
        {historico.length === 0 ? <p style={{ color: "#666" }}>Nenhum registro ainda.</p> : null}
        {historico.map((item) => (
          <div key={item.id} style={{ marginBottom: "15px", padding: "15px", backgroundColor: "#111", borderRadius: "8px" }}>
            <p style={{ color: "#888", fontSize: "0.8rem" }}>{new Date(item.created_at).toLocaleDateString()}</p>
            <p style={{ fontWeight: "bold", color: "#ccc" }}>Você: {item.content}</p>
            <p style={{ color: "#E09F5E", fontStyle: "italic" }}>Mentor: {item.ai_response ? item.ai_response.substring(0, 100) + "..." : "..."}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- COMPONENTE RAIZ ---
export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return session ? <MainApp session={session} apiKey={geminiKey} /> : <AuthScreen onLogin={setSession} />;
}
