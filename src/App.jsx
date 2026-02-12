import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css';

// Configuração Segura (Puxando do .env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const geminiKey = "AIzaSyD-LUxttB48AI7L9vAxPiHvyT-0LOAgkcE";

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
    // --- LÓGICA DA INTELIGÊNCIA ARTIFICIAL ---
    const [mensagem, setMensagem] = useState("");
    const [historico, setHistorico] = useState([
      { role: "model", parts: [{ text: "Olá. Sou seu mentor estoico. O que perturba sua mente hoje?" }] }
    ]);
    const [carregando, setCarregando] = useState(false);
  
    async function enviarMensagem() {
      if (!mensagem) return;
      
      // Mostra mensagem do usuário
      const novaMensagemUsuario = { role: "user", parts: [{ text: mensagem }] };
      const novoHistorico = [...historico, novaMensagemUsuario];
      setHistorico(novoHistorico);
      setMensagem("");
      setCarregando(true);
  
      try {
        // Chama o Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const chat = model.startChat({
          history: novoHistorico.slice(0, -1),
        });
        
        const result = await chat.sendMessage(mensagem);
        const resposta = result.response.text();
  
        // Mostra resposta da IA
        setHistorico([...novoHistorico, { role: "model", parts: [{ text: resposta }] }]);
      } catch (error) {
        console.error("Erro:", error);
        alert("O mentor está em silêncio (Erro na conexão).");
      }
      setCarregando(false);
    } 

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

         {/* TELA LOGADA - CHAT */}
         {session && (
          <div style={{ textAlign: "left", width: "100%", maxWidth: "400px" }}>
            
            {/* 1. Janela do Chat */}
            <div style={{ 
              height: "400px", 
              overflowY: "auto", 
              border: "1px solid #333", 
              borderRadius: "10px", 
              padding: "15px", 
              marginBottom: "15px", 
              backgroundColor: "#111" 
            }}>
              {historico.map((msg, index) => (
                <div key={index} style={{ marginBottom: "15px", textAlign: msg.role === "user" ? "right" : "left" }}>
                  <div style={{ 
                    display: "inline-block", 
                    padding: "10px 15px", 
                    borderRadius: "15px", 
                    backgroundColor: msg.role === "user" ? "#E09F5E" : "#333",
                    color: msg.role === "user" ? "#000" : "#E09F5E",
                    maxWidth: "80%"
                  }}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              {carregando && <p style={{ color: "#666", fontSize: "0.9rem", fontStyle: "italic" }}>O mentor está refletindo...</p>}
            </div>

            {/* 2. Campo de Digitar */}
            <div style={{ display: "flex", gap: "10px" }}>
              <input 
                type="text" 
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Peça um conselho estoico..."
                style={{ 
                  flex: 1, 
                  padding: "12px", 
                  borderRadius: "8px", 
                  border: "1px solid #333",
                  backgroundColor: "#222",
                  color: "#fff"
                }}
              />
              <button 
                onClick={enviarMensagem} 
                disabled={carregando}
                style={{ 
                  padding: "12px 20px", 
                  borderRadius: "8px", 
                  border: "none", 
                  backgroundColor: "#E09F5E", 
                  color: "#000",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                Enviar
              </button>
            </div>

            {/* 3. Botão de Sair */}
            <button 
              onClick={() => supabase.auth.signOut()} 
              style={{ 
                marginTop: "20px", 
                background: "transparent", 
                border: "none", 
                color: "#666", 
                fontSize: "12px", 
                cursor: "pointer",
                width: "100%"
              }}
            >
              Sair da conta
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
