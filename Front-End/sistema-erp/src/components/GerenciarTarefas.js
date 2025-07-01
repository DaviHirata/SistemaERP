import React, { useState, useEffect } from 'react';
import api from '@/services/api';

const ModalNovaTarefa = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tarefaId: '',
    usuarioId: '',
    titulo: '',
    descricao: '',
    dataInicio: '',
    status: '',
    prazo: '',
    totalHorasTrabalhadas: '',
  });
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      buscarUsuarios();
      // Resetar form quando abrir o modal
      setFormData({
        titulo: '',
        descricao: '',
        usuarioId: '',
        dataInicio: new Date().toISOString().split('T')[0],
        prazo: ''
      });
      setError('');
    }
  }, [isOpen]);

  const buscarUsuarios = async () => {
    try {
      const response = await api.get('/usuario/listar');
      if (response.data) {
        setUsuarios(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários: ", error);
      setError("Erro ao carregar lista de usuários");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const validateForm = () => {
    if (!formData.titulo.trim()) {
      setError('Nome da tarefa é obrigatório');
      return false;
    }
    if (!formData.usuarioId) {
      setError('Selecione um responsável');
      return false;
    }
    if (!formData.prazo) {
      setError('Prazo final é obrigatório');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const novaTarefa = {
        usuarioId: formData.usuarioId,
        titulo: formData.titulo,
        descricao: formData.descricao,
        prazo: new Date(formData.prazo).toISOString(),
        status: 'pendente'
      };

      await api.post('/tarefa/salvar', novaTarefa);

      // Enviar notificação para o responsável
      const remetente = JSON.parse(localStorage.getItem('usuario'));

      const mensagem = {
        remetente: { usuarioId: remetente.usuarioId || remetente.id },
        destinatario: { usuarioId: formData.usuarioId },
        texto: `Você foi atribuído(a) a uma nova tarefa: "${formData.titulo}"`,
        tipo: "notificacao",
        //dataEnvio: new Date().toISOString(),
      };

      await api.post('/mensagem/salvar', mensagem);

      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao criar tarefa ou enviar notificação: ", error);
      setError("Erro ao criar nova tarefa ou notificar responsável");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75 flex items-center justify-center z-50">
      <div className="bg-blue-900 rounded-xl p-8 w-full max-w-md relative text-white">
        <div className="flex items-center mb-6">
          <button
            onClick={onClose}
            className="mr-4 text-white hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold">Nova Tarefa</h2>
        </div>
       
        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Nome da tarefa</label>
            <input
              className="w-full bg-blue-800 border border-blue-700 rounded px-3 py-2 text-white placeholder-blue-300"
              placeholder="Nome da tarefa"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white mb-2">Descrição da tarefa</label>
            <textarea
              className="w-full bg-blue-800 border border-blue-700 rounded px-3 py-2 h-24 text-white placeholder-blue-300 resize-none"
              placeholder="Digite a descrição da tarefa"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white mb-2">Atribuir ao membro</label>
            <select
              className="w-full bg-blue-800 border border-blue-700 rounded px-3 py-2 text-white"
              value={formData.usuarioId}
              onChange={(e) => handleInputChange('usuarioId', e.target.value)}
            >
              <option value="">Selecione uma opção</option>
              {usuarios.map((usuario) => (
                <option key={usuario.usuarioId || usuario.id} value={usuario.usuarioId || usuario.id}>
                  {usuario.nomeCompleto}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white mb-2">Criado em</label>
              <input
                className="w-full bg-blue-800 border border-blue-700 rounded px-3 py-2 text-white placeholder-blue-300"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-white mb-2">Prazo final</label>
              <input
                className="w-full bg-blue-800 border border-blue-700 rounded px-3 py-2 text-white placeholder-blue-300"
                type="date"
                value={formData.prazo}
                onChange={(e) => handleInputChange('prazo', e.target.value)}
              />
            </div>
          </div>
        </div>
       
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:opacity-50"
          >
            {loading ? 'CRIANDO...' : 'ADICIONAR'}
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
};

const TarefasCriadas = () => {
  const [tarefas, setTarefas] = useState([]);
  //const [filteredTarefas, setFilteredTarefas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  //const [showFilters, setShowFilters] = useState(false);
  /*const [filtros, setFiltros] = useState({
    status: '',
    responsavel: '',
    prazo: ''
  });*/

  useEffect(() => {
    buscarTarefasCriadas();
  }, []);

  /*useEffect(() => {
    aplicarFiltros();
  }, [tarefas, filtros]);*/

  const buscarTarefasCriadas = async () => {
    setLoading(true);
    setError('');

    try {
      const userData = localStorage.getItem('usuario');
      if (!userData) {
          setError("Dados do usuário não encontrados. Faça login novamente");
          window.location.href = '/login';
          return;
      }

      const usuario = JSON.parse(userData);
      const usuarioId = usuario.usuarioId || usuario.id;

      if (!usuarioId) {
          setError("ID do usuário não encontrado. Faça login novamente.");
          return;
      }

      const response = await api.get(`/tarefa/listar`);
      if (response.data) {
        // Buscar dados dos usuários para cada tarefa
        const tarefasComUsuarios = await Promise.all(
          response.data.map(async (tarefa) => {
            try {
              const userResponse = await api.get(`/usuario/buscarUsuario/${tarefa.usuarioId}`);
              return {
                ...tarefa,
                nomeUsuario: userResponse.data?.nomeCompleto || 'Usuário não encontrado'
              };
            } catch (error) {
              console.error(`Erro ao buscar usuário ${tarefa.usuarioId}:`, error);
              return {
                ...tarefa,
                nomeUsuario: 'Erro ao carregar usuário'
              }
            }
          })
        )
        setTarefas(tarefasComUsuarios);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas: ", error);

      if (error.response?.status === 401) {
          setError("Sessão expirada. Faça login novamente");
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          window.location.href = '/login';
      } else {
          setError("Erro ao carregar tarefas do usuário");
      }
    } finally {
      setLoading(false);
    }
  };

  /*const aplicarFiltros = () => {
    let tarefasFiltradas = [...tarefas];

    if (filtros.status) {
      tarefasFiltradas = tarefasFiltradas.filter(tarefa => tarefa.status === filtros.status);
    }

    if (filtros.responsavel) {
      tarefasFiltradas = tarefasFiltradas.filter(tarefa => 
        tarefa.responsavel?.toLowerCase().includes(filtros.responsavel.toLowerCase())
      );
    }

    if (filtros.prazo) {
      const hoje = new Date();
      tarefasFiltradas = tarefasFiltradas.filter(tarefa => {
        const dataPrazo = new Date(tarefa.prazo);
        if (filtros.prazo === 'atrasadas') {
          return dataPrazo < hoje;
        } else if (filtros.prazo === 'proximas') {
          const diffTime = dataPrazo - hoje;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0;
        }
        return true;
      });
    }

    setFilteredTarefas(tarefasFiltradas);
  };*/

  const handleExcluirTarefa = async (tarefaId) => {
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      await api.delete(`/tarefa/deletarTarefa/${tarefaId}`);
      buscarTarefasCriadas();
    } catch (error) {
      console.error("Erro ao excluir tarefa: ", error);
      setError("Erro ao excluir tarefa");
    }
  };

  const handleEditarTarefa = (tarefaId) => {
    window.location.href = `/gerenciarTarefas/editar/${tarefaId}`;
    console.log('Editar tarefa:', tarefaId);
  };

  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('T')[0].split('-');
    return `${dia}/${mes}/${ano}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-900">
        <div className="text-lg text-white">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Tarefas criadas</h1>
          {/*<button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded flex items-center gap-2"
          >
            Filtrar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M3 8h18M3 12h18M3 16h18M3 20h18" />
            </svg>
          </button>*/}
        </div>

        {/*{showFilters && (
          <div className="bg-white rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 mb-2">Status</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={filtros.status}
                  onChange={(e) => setFiltros(prev => ({...prev, status: e.target.value}))}
                >
                  <option value="">Todos</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_desenvolvimento">Em desenvolvimento</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Responsável</label>
                <input 
                  className="w-full border rounded px-3 py-2"
                  placeholder="Nome do responsável"
                  value={filtros.responsavel}
                  onChange={(e) => setFiltros(prev => ({...prev, responsavel: e.target.value}))}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Prazo</label>
                <select 
                  className="w-full border rounded px-3 py-2"
                  value={filtros.prazo}
                  onChange={(e) => setFiltros(prev => ({...prev, prazo: e.target.value}))}
                >
                  <option value="">Todos</option>
                  <option value="atrasadas">Atrasadas</option>
                  <option value="proximas">Próximas (7 dias)</option>
                </select>
              </div>
            </div>
          </div>
        )}*/}

        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={() => setError("")}
              className="ml-2 text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg overflow-hidden shadow-lg">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Tarefa</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Responsável</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Prazo</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-800">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tarefas.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    Nenhuma tarefa encontrada
                  </td>
                </tr>
              ) : (
                tarefas.map((tarefa, index) => (
                  <tr key={tarefa.tarefaId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-4 px-6 text-gray-800">{tarefa.titulo}</td>
                    <td className="py-4 px-6 text-gray-800">{tarefa.nomeUsuario || 'Não atribuído'}</td>
                    <td className="py-4 px-6 text-gray-800">{formatarData(tarefa.prazo)}</td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditarTarefa(tarefa.tarefaId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleExcluirTarefa(tarefa.tarefaId)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-6 py-3 rounded"
          >
            Nova tarefa
          </button>
        </div>
      </div>

      <ModalNovaTarefa 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={buscarTarefasCriadas}
      />
    </div>
  );
};

export default TarefasCriadas;