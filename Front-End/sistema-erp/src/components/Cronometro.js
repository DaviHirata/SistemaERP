"use client";
import React, { useState, useRef, useEffect } from "react";
import api from "@/services/api";

export default function Cronometro() {
  const [tempo, setTempo] = useState(0);
  const [ativo, setAtivo] = useState(false);
  const [pausado, setPausado] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [tarefas, setTarefas] = useState([]);
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
  const [sessaoId, setSessaoId] = useState(null);
  const [intervaloId, setIntervaloId] = useState(null);
  const [buscaTarefa, setBuscaTarefa] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingTarefas, setLoadingTarefas] = useState(false);
  const [error, setError] = useState("");
  const intervaloRef = useRef(null);
  const dropdownRef = useRef(null);

  // Carregar tarefas do usuário ao montar o componente
  useEffect(() => {
    buscarTarefasUsuario();
  }, []);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMostrarDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrar tarefas conforme o usuário digita
  useEffect(() => {
    if (buscaTarefa.trim() === "") {
      setTarefasFiltradas(tarefas);
    } else {
      const filtradas = tarefas.filter(tarefa => 
        tarefa.titulo.toLowerCase().includes(buscaTarefa.toLowerCase()) ||
        tarefa.descricao?.toLowerCase().includes(buscaTarefa.toLowerCase())
      );
      setTarefasFiltradas(filtradas);
    }
  }, [buscaTarefa, tarefas]);

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
      if (ativo && sessaoId) {
        const message = 'Você tem uma sessão de cronômetro ativa. Se recarregar a página, o cronômetro será zerado e você perderá a sessão atual. Tem certeza que deseja continuar?';
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    if (ativo && sessaoId) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [ativo, sessaoId]);

  // Buscar tarefas vinculadas ao usuário
  const buscarTarefasUsuario = async () => {
    setLoadingTarefas(true);
    try {
      // Obter o usuário do localStorage
      const userData = localStorage.getItem('usuario');
      if (!userData) {
        setError("Dados do usuário não encontrados. Faça login novamente.");
        window.location.href = '/login';
        return;
      }

      const usuario = JSON.parse(userData);
      const usuarioId = usuario.usuarioId || usuario.id;

      if (!usuarioId) {
        setError("ID do usuário não encontrado. Faça login novamente.");
        return;
      }

      const response = await api.get(`/tarefa/tarefas/${usuarioId}`);
      if (response.data) {
        setTarefas(response.data);
        setTarefasFiltradas(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setError("Erro ao carregar tarefas do usuário");
    } finally {
      setLoadingTarefas(false);
    }
  };

  const formatarTempo = () => {
    const h = String(Math.floor(tempo / 3600)).padStart(2, '0');
    const m = String(Math.floor((tempo % 3600) / 60)).padStart(2, '0');
    const s = String(tempo % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const iniciarSessao = async () => {
    if (!tarefaSelecionada) {
      setError("Selecione uma tarefa antes de iniciar a sessão");
      return;
    }

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
        tarefaId: tarefaSelecionada.tarefaId
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
        console.log("Sessão encerrada com sucesso.");
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

  const selecionarTarefa = (tarefa) => {
    setTarefaSelecionada(tarefa);
    setBuscaTarefa(tarefa.titulo);
    setMostrarDropdown(false);
  };

  const limparSelecao = () => {
    setTarefaSelecionada(null);
    setBuscaTarefa("");
    setMostrarDropdown(false);
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

      {/* Tarefa selecionada */}
      {tarefaSelecionada && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
          <strong>Tarefa selecionada:</strong> {tarefaSelecionada.titulo}
          {tarefaSelecionada.descricao && (
            <div className="text-sm text-green-600">{tarefaSelecionada.descricao}</div>
          )}
          <div className="text-xs text-green-500">
            Status: {tarefaSelecionada.status} | Prazo: {new Date(tarefaSelecionada.prazo).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )}

      {/* Busca e seleção de tarefa */}
      {!ativo && (
        <div className="flex flex-col space-y-2 w-full max-w-md" ref={dropdownRef}>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="Buscar tarefa..." 
                value={buscaTarefa}
                onChange={(e) => {
                  setBuscaTarefa(e.target.value);
                  setMostrarDropdown(true);
                }}
                onFocus={() => setMostrarDropdown(true)}
                className="w-full bg-blue-100 text-blue-900 px-3 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500" 
                disabled={loadingTarefas}
              />
              
              {/* Dropdown de tarefas */}
              {mostrarDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {loadingTarefas ? (
                    <div className="px-3 py-2 text-gray-500">Carregando tarefas...</div>
                  ) : tarefasFiltradas.length > 0 ? (
                    tarefasFiltradas.map((tarefa) => (
                      <div
                        key={tarefa.tarefaId}
                        onClick={() => selecionarTarefa(tarefa)}
                        className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-800">{tarefa.titulo}</div>
                        {tarefa.descricao && (
                          <div className="text-sm text-gray-600">{tarefa.descricao}</div>
                        )}
                        <div className="flex justify-between text-xs text-blue-600 mt-1">
                          <span>Status: {tarefa.status}</span>
                          <span>Prazo: {new Date(tarefa.prazo).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      {buscaTarefa ? 'Nenhuma tarefa encontrada' : 'Nenhuma tarefa disponível'}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {tarefaSelecionada && (
              <button 
                onClick={limparSelecao}
                className="text-red-600 hover:text-red-800 px-3 py-2 border border-red-300 rounded hover:bg-red-50"
              >
                Limpar
              </button>
            )}
            
            <button 
              onClick={buscarTarefasUsuario}
              disabled={loadingTarefas}
              className="text-blue-600 hover:text-blue-800 px-3 py-2 border border-blue-300 rounded hover:bg-blue-50 disabled:opacity-50"
            >
              {loadingTarefas ? '...' : '🔄'}
            </button>
          </div>
        </div>
      )}

      {/* Botões de controle */}
      {!ativo && (
        <button 
          onClick={iniciarSessao}
          disabled={loading || !tarefaSelecionada}
          className={`px-6 py-3 rounded text-white font-semibold ${
            loading || !tarefaSelecionada
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

      {/* Informações de debug (remover em produção) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-100 rounded">
          <div>Ativo: {ativo ? 'Sim' : 'Não'}</div>
          <div>Pausado: {pausado ? 'Sim' : 'Não'}</div>
          <div>Sessão ID: {sessaoId || 'Nenhum'}</div>
          <div>Intervalo ID: {intervaloId || 'Nenhum'}</div>
          <div>Tarefa ID: {tarefaSelecionada?.tarefaId || 'Nenhuma'}</div>
          <div>Total de tarefas: {tarefas.length}</div>
        </div>
      )}
    </div>
  );
}