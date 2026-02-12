import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

// Configuração Segura (Puxando do .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = import.meta.env.VITE_GEMINI_KEY;

// Inicializando os serviços
const supabase = createClient(supabaseUrl, supabaseKey);
const genAI = new GoogleGenerativeAI(geminiKey);

function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState("welcome");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Estilos
  const containerStyle = {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    textAlign: "center",
    fontFamily: "'Georgia', serif",
  };

  const btnStyle = {
    display: "block",
    width: "100%",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    fontWeight: "bold",
    textDecoration: "none",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#000", color: "#E09F5E" }}>
      <div style={containerStyle}>
        
           {/* SEU LOGO NOVO */}
            <img 
            src="https://i.postimg.cc/tgwfFzSH/Screenshot-20260108-003406-Edge-3.jpg" 
            alt="Logo Estoicismo" 
            style={{ width: "120px", marginBottom: "20px", borderRadius: "10px", display: "block", margin: "0 auto 20px auto" }} 
          />

        
        
        <h1 style={{ fontSize: "2rem", margin: "0 0 10px 0" }}>Estoicismo AI</h1>
        <p style={{ fontSize: "1rem", color: "#ccc", lineHeight: "1.4", marginBottom: "30px" }}>
          Seu mentor digital para clareza e autocontrole.
        </p>

        {/* TELA DE BOAS-VINDAS */}
        {!session && (
          <>
            <a 
              href="https://buy.stripe.com/bJedR87b06we1Vh5OT9k401" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ ...btnStyle, backgroundColor: "#E09F5E", color: "#000" }}
            >
              QUERO ASSINAR AGORA (R$ 9,90)
            </a>
            <button 
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
              style={{ ...btnStyle, backgroundColor: "transparent", border: "1px solid #E09F5E", color: "#E09F5E" }}
            >
              JÁ TENHO CONTA / ENTRAR
            </button>
          </>
        )}

        {/* TELA LOGADA (Exemplo) */}
        {session && (
          <div>
            <p>Bem-vindo, Estoico.</p>
            <button onClick={() => supabase.auth.signOut()} style={btnStyle}>Sair</button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
