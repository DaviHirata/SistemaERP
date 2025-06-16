import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { formatarHoras } from '@/utils/formatarHoras';

const ModalDetalhes = ({ tarefa, onClose, onSave }) => {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tarefa) {
            setFormData({
                tarefaId: tarefa.tarefaId || '',
                usuarioId: tarefa.usuarioId || '',
                titulo: tarefa.titulo || '',
                descricao: tarefa.descricao || '',
                dataInicio: tarefa.dataInicio || '',
                status: tarefa.status || '',
                prazo: tarefa.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : '',
                totalHorasTrabalhadas: tarefa.totalHorasTrabalhadas || '',
            });
        }
    }, [tarefa]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const validateForm = () => {
      if (!formData.titulo.trim()) {
        setError('Título é obrigatório');
        return false;
      }
      if (!formData.prazo) {
        setError('Prazo é obrigatório');
        return false;
      }
      if (!formData.status) {
        setError('Status é obrigatório');
        return false;
      }
      return true;
    };

    const handleSave = async () => {
        if(!validateForm()) {
          return;
        }
      
        setLoading(true);
        setError('');

        try {
            const tarefaAtualizada = {
                tarefaId: formData.tarefaId,
                usuarioId: formData.usuarioId,
                titulo: formData.titulo,
                descricao: formData.descricao,
                dataInicio: formData.dataInicio,
                status: formData.status,
                prazo: new Date(formData.prazo).toISOString(),
                totalHorasTrabalhadas: formData.totalHorasTrabalhadas,
            };

            await api.put(`/tarefa/atualizarTarefa`, tarefaAtualizada);
            onSave();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar tarefa: ", error);
            setError("Erro ao salvar alterações da tarefa");
        } finally {
            setLoading(false);
        }
    }

    if (!tarefa) return null;

    return (
    <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative text-black">
        <h2 className="text-xl font-semibold mb-4 text-black">Detalhes da tarefa</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-bold block text-black">Título</label>
            <input 
              className="w-full border rounded px-2 py-1 text-black" 
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
            />
            
            <label className="font-bold block mt-4 text-black">Descrição</label>
            <textarea 
              className="w-full border rounded px-2 py-1 h-24 text-black"
              value={formData.descricao}
              onChange={(e) => handleInputChange('descricao', e.target.value)}
            />
            
            <label className="font-bold block mt-4 text-black">Status</label>
            <select 
              className="w-full border rounded px-2 py-1 text-black"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="pendente">Pendente</option>
              <option value="em_desenvolvimento">Em desenvolvimento</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
          
          <div>
            <label className="font-bold block text-black">Prazo</label>
            <input 
              className="w-full border rounded px-2 py-1 text-black" 
              type="date"
              value={formData.prazo}
              onChange={(e) => handleInputChange('prazo', e.target.value)}
            />
            
            <label className="font-bold block mt-4 text-black">Horas trabalhadas</label>
            <input 
              className="w-full border rounded px-2 py-1 bg-gray-100 text-black" 
              type="text"
              value={formatarHoras(formData.totalHorasTrabalhadas)}
              //value={formData.totalHorasTrabalhadas}
              readOnly
            />

            <label className="font-bold block mt-4 text-black">Data de início</label>
            <input 
              className="w-full border rounded px-2 py-1 bg-gray-100 text-black" 
              type="text"
              value={tarefa.dataInicio ? new Date(tarefa.dataInicio).toLocaleDateString('pt-BR') : 'Não iniciada'}
              readOnly
            />

            {tarefa.dataConclusao && (
              <>
                <label className="font-bold block mt-4 text-black">Data de conclusão</label>
                <input 
                  className="w-full border rounded px-2 py-1 bg-gray-100 text-black" 
                  type="text"
                  value={new Date(tarefa.dataConclusao).toLocaleDateString('pt-BR')}
                  readOnly
                />
              </>
            )}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MinhasTarefas = () => {
    const [tarefas, setTarefas] = useState([]);
    const [tarefaSelecionada, setTarefaSelecionada] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        buscarTarefasUsuario();
    }, []);

    const buscarTarefasUsuario = async () => {
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

            const response = await api.get(`/tarefa/tarefas/${usuarioId}`);
            if (response.data) {
                setTarefas(response.data);
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

    const handleSaveTarefa = () => {
        buscarTarefasUsuario();
    };

    const tarefasPorStatus = (status) => {
        return tarefas.filter((t) => t.status === status);
    };

    /*const getStatusDisplayName = (status) => {
        const statusMap = {
            'pendente': 'Pendentes',
            'em_desenvolvimento': 'Em Desenvolvimento',
            'concluido': 'Concluídos'
        };
        return statusMap[status] || status;
    };*/

    const getStatusColor = (status) => {
    const colorMap = {
      'pendente': 'bg-gray-300',
      'em_desenvolvimento': 'bg-yellow-200',
      'concluido': 'bg-green-200'
    };
    return colorMap[status] || 'bg-gray-300';
  };

  const formatarPrazo = (prazo) => {
    let dataPrazo;
    if (typeof prazo === 'string' && prazo.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [ano, mes, dia] = prazo.split('-');
        dataPrazo = new Date(ano, mes - 1, dia); // mes - 1 porque Date usa 0-11
    } else {
        dataPrazo = new Date(prazo);
    }
    
    const hoje = new Date();
    
    // Zerar horário
    dataPrazo.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    
    const diffTime = dataPrazo - hoje;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
   
    if (diffDays < 0) {
      return `Atrasada (${Math.abs(diffDays)} dias)`;
    } else if (diffDays === 0) {
      return 'Vence hoje';
    } else if (diffDays <= 3) {
      return `${diffDays} dias restantes`;
    } else {
      return dataPrazo.toLocaleDateString('pt-BR');
    }
  };

  const renderColuna = (titulo, status) => (
    <div className={`${getStatusColor(status)} p-4 rounded-xl w-full md:w-1/3`}>
      <h3 className="text-xl font-semibold text-center mb-4">{titulo}</h3>
      
      {tarefasPorStatus(status).length === 0 ? (
        <div className="text-center text-gray-600 py-8">
          Nenhuma tarefa {titulo.toLowerCase()}
        </div>
      ) : (
        tarefasPorStatus(status).map((tarefa) => (
          <div key={tarefa.tarefaId} className="bg-white p-3 rounded-lg mb-3 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-800 flex-1">{tarefa.titulo}</h4>
              <button 
                onClick={() => setTarefaSelecionada(tarefa)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 ml-2"
              >
                Detalhes
              </button>
            </div>
            
            {tarefa.descricao && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {tarefa.descricao}
              </p>
            )}
      
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Prazo: {formatarPrazo(tarefa.prazo)}</span>
              {tarefa.totalHorasTrabalhadas > 0 && (
                <span>{formatarHoras(tarefa.totalHorasTrabalhadas)} trabalhadas</span>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Carregando tarefas...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Minhas Tarefas</h2>
        <button 
          onClick={buscarTarefasUsuario}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
          <button 
            onClick={() => setError("")}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-center gap-6">
        {renderColuna('Pendentes', 'pendente')}
        {renderColuna('Em desenvolvimento', 'em_desenvolvimento')}
        {renderColuna('Concluídas', 'concluido')}
      </div>

      <div className="text-center text-sm text-gray-500">
        Total de tarefas: {tarefas.length}
      </div>

      {tarefaSelecionada && (
        <ModalDetalhes 
          tarefa={tarefaSelecionada} 
          onClose={() => setTarefaSelecionada(null)} 
          onSave={handleSaveTarefa} 
        />
      )}
    </div>
  );
};

export default MinhasTarefas;