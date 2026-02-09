export async function gerarReflexao(apiKey, promptCompleto) {
  const cleanKey = apiKey ? apiKey.trim() : "";
  if (!cleanKey) throw new Error("Chave da API não fornecida");

  try {
    // Usa o modelo Gemini 2.5 Flash (Rápido e Inteligente)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cleanKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: promptCompleto }] }] 
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro Google: ${errorData.error?.message}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("A IA não retornou texto válido.");
    }

  } catch (error) {
    console.error("Erro na IA:", error);
    throw error;
  }
}
