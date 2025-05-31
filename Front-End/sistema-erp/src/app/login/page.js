"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import api from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setUser } = useUser();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        const response = await api.post('/api/login', {email, senha});
        const { token, usuario } = response.data;
        console.log(response.data);

        if (response.data && response.data.token) {
            /*localStorage.setItem('token', response.data.token);
            if (response.data.usuario) {
                localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
                setUser(response.data.usuario);
            }

            router.push("/");*/
            localStorage.setItem('token', token);
            localStorage.setItem('usuario', JSON.stringify(usuario));
            setUser(usuario);
            router.push("/");
        } else {
            setError("Resposta de login inválida");
        }
    } catch (error) {
        console.error('Erro no login: ', error);

        if (error.response?.status === 401) {
            setError("Email ou senha incorretos.");
        } else if (error.response?.data?.message) {
            setError(error.response.data.message);
        } else {
            setError("Erro ao conectar ao servidor");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-cover bg-center" 
           style={{ backgroundImage: "url('/imagem.png')" }}>
      </div>
      
      <div className="w-1/2 bg-blue-900 text-white flex flex-col justify-center items-center p-10">
        <h1 className="text-2xl font-bold mb-2">Seja Bem-vindo</h1>
        <p className="mb-6">Faça seu login e acesse o sistema</p>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 w-3/4 text-center">
            {error}
          </div>
        )}
        
        <form className="flex flex-col gap-4 w-3/4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            className="p-2 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Digite sua senha"
            className="p-2 rounded text-black"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            disabled={loading}
          />
          
          <a href="#" className="text-sm underline text-center mt-2">
            Esqueci minha senha
          </a>
          
          <button 
            className={`p-2 rounded font-bold ${
              loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? 'CARREGANDO...' : 'ACESSAR'}
          </button>
        </form>
      </div>
    </div>
  );
}