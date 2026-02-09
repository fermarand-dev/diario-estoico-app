import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Tenta fazer login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Se falhar o login, tenta cadastrar automaticamente
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (signUpError) {
        alert('Erro: ' + signUpError.message)
      } else {
        alert('Cadastro realizado! Se o login não for automático, tente entrar novamente.')
      }
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-3xl font-serif">Estoicismo AI</h2>
          <p className="mt-2 text-gray-400">Diário & Reflexões</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <input
            type="email"
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-white transition"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded font-bold text-gray-900 bg-white hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? 'Processando...' : 'Entrar / Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
