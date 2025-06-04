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
    const [sessoes, setSessoes] = useState([]);
    const [usuario, setUsuario] = useState([]);
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
                totalHorasTrabalhadas: tarefa.totalHorasTrabalhadas
            });

            buscarSessoesTarefa(tarefa.tarefaId);
        }
    }, [tarefa]);

    useEffect(() => {
        if (tarefa?.usuarioId) {
            buscarUsuario(tarefa.usuarioId);
        }
    }, [tarefa?.usuarioId]);

    const buscarSessoesTarefa = async (tarefaId) => {
        try {
            const response = await api.get(`/sessao/sessoesTarefa/${tarefaId}`);
            if (response.data && Array.isArray(response.data)) {
                // Mapear os campos da API para o formato esperado pelo componente
                const sessoesFormatadas = response.data.map(sessao => ({
                    id: sessao.sessaoId,
                    data: sessao.inicioSessao,
                    tempoGasto: parseDuracao(sessao.duracaoTotal),
                    validado: sessao.validado,
                    // Manter os campos originais também
                    sessaoId: sessao.sessaoId,
                    inicioSessao: sessao.inicioSessao,
                    fimSessao: sessao.fimSessao,
                    duracaoTotal: sessao.duracaoTotal
                }));
                setSessoes(sessoesFormatadas);
                console.log('Sessões carregadas:', sessoesFormatadas);
            } else {
                console.log('Nenhuma sessão encontrada ou formato inválido');
                setSessoes([]);
            }
        } catch (error) {
            console.error("Erro ao buscar sessões da tarefa: ", error);
            setError("Erro ao carregar sessões da tarefa");
            setSessoes([]);
        }
    }

    // Função para converter duração ISO 8601 para horas
    const parseDuracao = (duracao) => {
        if (!duracao) return 0;
        
        try {
            // Formato PT1M30.3884868S -> extrair minutos e segundos
            const match = duracao.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
            if (match) {
                const horas = parseInt(match[1] || '0', 10);
                const minutos = parseInt(match[2] || '0', 10);
                const segundos = parseFloat(match[3] || '0');
                
                const totalHoras = horas + (minutos / 60) + (segundos / 3600);
                return Math.round(totalHoras * 100) / 100; // Arredondar para 2 casas decimais
            }
        } catch (e) {
            console.error('Erro ao parsear duração:', duracao, e);
        }
        
        return 0;
    };

    const buscarUsuario = async (usuarioId) => {
        try {
            const response = await api.get(`/usuario/buscarUsuario/${usuarioId}`);
            if (response.data) {
                setUsuario(response.data);
            }
        } catch (error) {
            console.error("Erro ao buscar usuário responsável pela tarefa: ", error);
        }
    }

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

    const handleValidarSessao = async (sessaoId, aceitar) => {
        try {
            const acao = aceitar ? 'aceitar' : 'rejeitar';
            await api.put(`sessao/validarSessao/${sessaoId}`, null, {
                params: { acao }
            });
            buscarSessoesTarefa(tarefa.tarefaId);
        } catch (error) {
            console.error("Erro ao validar sessão: ", error);
            setError("Erro ao atualizar status da sessão");
        }
    }

    const formatarData = (data) => {
        if (!data) return 'N/A';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarDataPrazo = (data) => {
        if (!data) return 'N/A';
        const d = typeof data === 'string' ? new Date(data + 'T00:00:00') : data;
        return d.toLocaleDateString('pt-BR');
    };

    if (!tarefa) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative text-black max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-6 text-black text-center">Detalhes da Tarefa</h2>
                
                <div className="bg-gray-100 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4 text-center">{formData.titulo}</h3>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="font-bold block text-black mb-1">Responsável</label>
                                <input 
                                    className="w-full bg-blue-200 px-3 py-2 rounded border-none" 
                                    value={tarefa.nomeUsuario || 'Carregando...'}
                                    readOnly
                                />
                            </div>
                            
                            <div>
                                <label className="font-bold block text-black mb-1">Concluída em</label>
                                <input 
                                    className="w-full bg-blue-200 px-3 py-2 rounded border-none" 
                                    value={tarefa.dataConclusao ? formatarData(tarefa.dataConclusao) : 'N/A'}
                                    readOnly
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="font-bold block text-black mb-1">Prazo</label>
                                <input 
                                    className="w-full bg-blue-200 px-3 py-2 rounded border-none" 
                                    value={tarefa.prazo ? formatarDataPrazo(tarefa.prazo) : 'N/A'}
                                    readOnly
                                />
                            </div>
                            
                            <div>
                                <label className="font-bold block text-black mb-1">Horas trabalhadas</label>
                                <input 
                                    className="w-full bg-blue-200 px-3 py-2 rounded border-none" 
                                    value={formatarHoras(tarefa.totalHorasTrabalhadas)}
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Tabela de Sessões */}
                <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-3 text-black">Sessões de Trabalho</h4>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Duração</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessoes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="border border-gray-300 px-4 py-2 text-center text-gray-600">
                                        Nenhuma sessão encontrada
                                    </td>
                                </tr>
                            ) : (
                                sessoes.map((sessao) => (
                                    <tr key={sessao.id}>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {formatarData(sessao.data)}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {(sessao.tempoGasto)}h
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <span className={`px-2 py-1 rounded text-sm ${
                                                sessao.validado === true 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : sessao.validado === false 
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {sessao.validado === true 
                                                    ? 'Validada' 
                                                    : sessao.validado === false 
                                                    ? 'Rejeitada'
                                                    : 'Pendente'
                                                }
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    onClick={() => handleValidarSessao(sessao.sessaoId || sessao.id, true)}
                                                    className={`px-3 py-1 text-white text-sm rounded ${
                                                        sessao.validado === true || sessao.validado === false
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                    }`}
                                                    disabled={sessao.validado === true || sessao.validado === false}
                                                >
                                                    Validar
                                                </button>
                                                <button 
                                                    onClick={() => handleValidarSessao(sessao.sessaoId || sessao.id, false)}
                                                    className={`px-3 py-1 text-white text-sm rounded ${
                                                        sessao.validado === true || sessao.validado === false
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700'
                                                    }`}
                                                    disabled={sessao.validado === true || sessao.validado === false}
                                                >
                                                    Rejeitar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 disabled:opacity-50"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

const TarefasConcluidas = () => {
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

            const response = await api.get(`/tarefa/concluidas`);
            if (response.data) {
                // Buscar dados dos usuários para cada tarefa
                const tarefasComUsuarios = await Promise.all(
                    response.data.map(async (tarefa) => {
                        try {
                            const userResponse = await api.get(`/usuario/buscarUsuario/${tarefa.usuarioId}`);
                            return {
                                ...tarefa,
                                nomeUsuario: userResponse.data?.nome || 'Usuário não encontrado'
                            };
                        } catch (error) {
                            console.error(`Erro ao buscar usuário ${tarefa.usuarioId}:`, error);
                            return {
                                ...tarefa,
                                nomeUsuario: 'Erro ao carregar usuário'
                            };
                        }
                    })
                );
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

    const handleSaveTarefa = () => {
        buscarTarefasUsuario();
    };

    const formatarData = (data) => {
        return new Date(data).toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg text-gray-600">Carregando tarefas...</div>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-8 p-6">
            <h2 className="text-2xl font-bold text-center text-white">Tarefas concluídas</h2>

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

            <div className="bg-gray-200 rounded-lg p-6" style={{color: '#000000'}}>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-b-2 border-gray-400">
                            <th className="text-left py-3 px-4 font-semibold">Tarefa</th>
                            <th className="text-left py-3 px-4 font-semibold">Responsável</th>
                            <th className="text-left py-3 px-4 font-semibold">Concluído em</th>
                            <th className="text-center py-3 px-4 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tarefas.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-600">
                                    Nenhuma tarefa concluída encontrada
                                </td>
                            </tr>
                        ) : (
                            tarefas.map((tarefa, index) => (
                                <tr key={tarefa.tarefaId} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                    <td className="py-3 px-4">{tarefa.titulo}</td>
                                    <td className="py-3 px-4">{tarefa.nomeUsuario || 'Carregando...'}</td>
                                    <td className="py-3 px-4">
                                        {tarefa.dataConclusao ? formatarData(tarefa.dataConclusao) : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button 
                                            onClick={() => setTarefaSelecionada(tarefa)}
                                            className="px-4 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                        >
                                            Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
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

export default TarefasConcluidas;