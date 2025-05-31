"use client";
import React, { useState, useRef, useEffect } from "react";
import api from "@/services/api";

export default function Cronometro() {
  const [tempo, setTempo] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tarefas, setTarefas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [sessaoId, setSessaoId] = useState(null);
  const [intervaloId, setIntervaloId] = useState(null);
  const [buscaTarefa, setBuscaTarefa] = useState("");
  const [mostrarTarefas, setMostrarTarefas] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const intervaloRef = useRef(null);

  useEffect(() => {
    if (ativo && !pausado) {
      intervaloRef.current = setInterval(() => {
        setTempo(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervaloRef.current);
    }
    return () => clearInterval(intervaloRef.current);
  }, [ativo, pausado]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Só mostra o alerta se há uma sessão ativa
      if (ativo && sessaoId) {
        const message = 'Você tem uma sessão de cronômetro ativa. Se recarregar a página, o cronômetro será zerado e você perderá a sessão atual. Tem certeza que deseja continuar?';
        e.preventDefault();
        e.returnValue = message; // Para navegadores mais antigos
        return message; // Para navegadores modernos
      }
    };

    // Adiciona o event listener quando há uma sessão ativa
    if (ativo && sessaoId) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Remove o event listener quando a sessão não está ativa ou no cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [ativo, sessaoId]);

  const formatarTempo = () => {
    const h = String(Math.floor(tempo / 3600)).padStart(2, '0');
    const m = String(Math.floor((tempo % 3600) / 60)).padStart(2, '0');
    const s = String(tempo % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const iniciarSessao = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Token de autenticação não encontrado. Faça login novamente.");
        window.location.href = '/login';
        return;
      }

      const response = await api.post("/sessao/iniciar", {
        tarefaId: 1
      });
      
      if (response.data) {
        setAtivo(true);
        setSessaoId(response.data.sessaoId || response.data.id);
        console.log("Sessão iniciada: ", response.data);
      }
    } catch (error) {
      console.error("Erro ao iniciar sessão: ", error);

      if (error.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente.");
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        setError("Acesso negado. Verifique suas permissões ou faça login novamente.");
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Erro ao iniciar sessão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const encerrarSessao = async () => {
    setLoading(true);

    try {
      const response = await api.put("/sessao/encerrar", {
        sessaoId: sessaoId
      });

      if (response.status === 200) {
        setAtivo(false);
        setTempo(0);
        setPausado(false);
        setMostrarModal(false);
        setSessaoId(null);
        console.log("Sessão iniciada com sucesso.");
      } 
    } catch (error) {
      console.error("Erro ao encerrar sessão: ", error);
      setError("Erro ao encerrar sessão");
    } finally {
      setLoading(false);
    }
  };

  const pausarSessao = async () => {
    setLoading(true);

    try {
      const response = await api.post("/intervalo/pausar", {
        sessaoId: sessaoId
      });

      if (response.data) {
        setIntervaloId(response.data.intervaloId || response.data.id);
        setPausado(true);
        console.log("Pausa iniciada: ", response.data);
      }
    } catch (error) {
      console.error("Erro ao iniciar pausa: ", error);
      setError("Erro ao pausar sessão");
    } finally {
      setLoading(false);
    }
  };

  const retomarSessao = async () => {
    setLoading(true);

    try {
      const response = await api.put("/intervalo/retomar", {
        intervaloId: intervaloId  
      });

      setPausado(false);
      setIntervaloId(null);
      console.log("Sessão retomada");
    } catch (error) {
      console.error("Erro ao retomar: ", error);
      setError("Erro ao retomar sessão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 mt-20 relative">
      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button 
            onClick={() => setError("")}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-blue-800 text-white p-6 rounded-2xl w-[90%] max-w-md text-center shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Deseja encerrar essa sessão de trabalho?</h2>
            <p className="text-blue-200 mb-4">
              O tempo registrado será salvo e ficará disponível para validação do administrador.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={encerrarSessao}
                disabled={loading}
                className={`px-4 py-2 rounded text-white font-semibold ${
                  loading 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Encerrando...' : 'Encerrar'}
              </button>
              <button
                onClick={() => setMostrarModal(false)}
                disabled={loading}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-400 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cronômetro */}
      <div className="text-blue-900 text-6xl font-mono rounded-lg px-10 py-6" style={{backgroundColor: '#B0C8E7'}}>
        {formatarTempo()}
      </div>

      {/* Status da sessão */}
      {sessaoId && (
        <div className="text-sm text-gray-600">
          Sessão ID: {sessaoId}
          {pausado && <span className=" - PAUSADA"></span>}
        </div>
      )}

      {/* Botões de controle */}
      {!ativo && (
        <button 
          onClick={iniciarSessao}
          disabled={loading}
          className={`px-6 py-3 rounded text-white font-semibold ${
            loading 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-700 hover:bg-blue-800'
          }`}
        >
          {loading ? 'Iniciando...' : 'Início'}
        </button>
      )}
      
      {ativo && !pausado && (
        <div className="flex gap-4">
          <button 
            onClick={pausarSessao}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {loading ? 'Pausando...' : 'Pause'}
          </button>
        
          <button
            onClick={() => setMostrarModal(true)}
            disabled={loading}
            className="bg-blue-700 px-4 py-2 rounded text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Fim
          </button>
        </div>
      )}

      {ativo && pausado && (
        <div className="flex gap-4">
          <button
            onClick={retomarSessao}
            disabled={loading}
            className={`px-6 py-3 rounded-xl text-white text-lg ${
              loading 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Retomando...' : 'Retomar'}
          </button>

          <button
            onClick={() => setMostrarModal(true)}
            disabled={loading}
            className="bg-blue-700 px-4 py-2 rounded text-white hover:bg-blue-800 disabled:opacity-50"
          >
            Fim
          </button>
        </div>
      )}

      {/* Busca de tarefa (por enquanto só visual) */}
      <div className="flex space-x-2 mt-4">
        <input 
          type="text" 
          placeholder="Buscar task" 
          value={buscaTarefa}
          onChange={(e) => setBuscaTarefa(e.target.value)}
          className="bg-blue-100 text-blue-900 px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <button 
          className="text-blue-600 hover:text-blue-800 px-3 py-2 border border-blue-300 rounded hover:bg-blue-50"
          onClick={() => {
            // Por enquanto, só um placeholder
            console.log("Buscar tarefa:", buscaTarefa);
            alert("Funcionalidade de busca será implementada em breve!");
          }}
        >
          Vincular
        </button>
      </div>

      {/* Informações de debug (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
          <div>Ativo: {ativo ? 'Sim' : 'Não'}</div>
          <div>Pausado: {pausado ? 'Sim' : 'Não'}</div>
          <div>Sessão ID: {sessaoId || 'Nenhum'}</div>
          <div>Intervalo ID: {intervaloId || 'Nenhum'}</div>
        </div>
      )}
    </div>
  );
}