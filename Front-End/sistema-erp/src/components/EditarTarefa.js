import React, { useState, useEffect } from 'react';
import api from '@/services/api';

const EditarTarefa = ({ tarefaId }) => {
    const [formData, setFormData] = useState({
        tarefaId: '',
        usuarioId: '',
        titulo: '',
        descricao: '',
        dataInicio: '',
        status: '',
        prazo: '',
        totalHorasTrabalhadas: '',
        responsavel: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);
    const [loadingTarefa, setLoadingTarefa] = useState(true);
    const [responsavelAtual, setResponsavelAtual] = useState('');

    // Carregar dados da tarefa ao abrir o componente

    useEffect(() => {
        const carregarDados = async () => {
            try {
                setLoadingTarefa(true);
                
                // Carregar dados da tarefa
                const responseTarefa = await api.get(`/tarefa/buscarTarefa/${tarefaId}`);
                const tarefa = responseTarefa.data;
                
                // Debug: verificar os dados recebidos
                console.log('Dados da tarefa:', tarefa);
            
                // Buscar apenas o usuário responsável pela tarefa (se existir)
                let usuarioResponsavel = null;
                if (tarefa.usuarioId) {
                    try {
                        const responseUsuario = await api.get(`/usuario/buscarUsuario/${tarefa.usuarioId}`);
                        usuarioResponsavel = responseUsuario.data;
                        setResponsavelAtual(usuarioResponsavel.nomeCompleto);
                        console.log('Usuário responsável:', usuarioResponsavel);
                    } catch (error) {
                        console.error('Erro ao buscar usuário responsável:', error);
                        setResponsavelAtual('Usuário não encontrado');
                    }
                } else {
                    setResponsavelAtual('Nenhum responsável atribuído');
                }

                // Preparar dados do formulário
                setFormData({
                    tarefaId: tarefa.tarefaId || '',
                    usuarioId: tarefa.usuarioId || '',
                    titulo: tarefa.titulo || '',
                    descricao: tarefa.descricao || '',
                    dataInicio: tarefa.dataInicio ? tarefa.dataInicio.split('T')[0] : '',
                    status: tarefa.status || '',
                    prazo: tarefa.prazo ? new Date(tarefa.prazo).toISOString().split('T')[0] : '',
                    totalHorasTrabalhadas: tarefa.totalHorasTrabalhadas || 0,
                    responsavel: tarefa.usuarioId || '',
                });
                
            } catch (error) {
                console.error("Erro ao carregar dados: ", error);
                setError("Erro ao carregar dados da tarefa");
            } finally {
                setLoadingTarefa(false);
            }
        };

        if (tarefaId) {
            carregarDados();
        }
    }, [tarefaId]);

    const carregarUsuarios = async () => {
        try {
            setLoadingUsuarios(true);
            const response = await api.get('/usuario/listar');
            setUsuarios(response.data);
            console.log('Usuários carregados:', response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoadingUsuarios(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));

        if (field === 'responsavel') {
            // Atualizar também o usuarioId
            setFormData(prev => ({...prev, usuarioId: value}));
            
            // Verificar se usuarios é um array antes de usar find
            if (Array.isArray(usuarios)) {
                // Atualizar o nome do responsável exibido com conversão de tipos
                // Corrigir para usar 'usuarioId' em vez de 'id'
                const usuarioSelecionado = usuarios.find(user => {
                    return String(user.usuarioId) === String(value) || 
                        Number(user.usuarioId) === Number(value) ||
                        user.usuarioId === value;
                });
                
                if (usuarioSelecionado) {
                    setResponsavelAtual(usuarioSelecionado.nomeCompleto);
                    console.log('Usuário selecionado:', usuarioSelecionado);
                } else {
                    setResponsavelAtual('Usuário não encontrado');
                    console.warn('Usuário não encontrado para valor:', value);
                }
            } else {
                console.error('usuarios não é um array:', usuarios);
                setResponsavelAtual('Erro ao buscar usuário');
            }
        }
    };

    const validateForm = () => {
        if (!formData.titulo.trim()) {
            setError('Título é obrigatório');
            return false;
        }
        if (!formData.prazo.trim()) {
            setError('Prazo é obrigatório');
            return false;
        }
        if (!formData.status.trim()) {
            setError('Status é obrigatório');
            return false;
        }
        if (!formData.responsavel.trim()) {
            setError('Responsável é obrigatório');
            return false;
        }

        return true;
    }

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const tarefaAtualizada = {
                tarefaId: formData.tarefaId,
                usuarioId: formData.responsavel,
                titulo: formData.titulo,
                descricao: formData.descricao,
                dataInicio: formData.dataInicio,
                status: formData.status,
                prazo: new Date(formData.prazo).toISOString(),
                totalHorasTrabalhadas: formData.totalHorasTrabalhadas,
            };

            await api.put(`/tarefa/atualizarTarefa`, tarefaAtualizada);
            alert('Tarefa atualizada com sucesso!');
            window.location.href = '/gerenciarTarefas';
        } catch (error) {
            console.error("Erro ao atualizar tarefa: ", error);
            setError("Erro ao salvar alterações na tarefa");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = () => {
        window.location.href = '/gerenciarTarefas';
        console.log('Cancelar - navegar para /gerenciarTarefas');
    }

    const formatarHoras = (horas) => {
        if (!horas) return '0h 0min';
        const horasInt = Math.floor(horas);
        const minutos = Math.round((horas - horasInt) * 60);
        return `${horasInt}h ${minutos}min`;
    };

    if (loadingTarefa) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
                <div className="text-white text-xl">Carregando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={handleCancelar}
                        className="text-white hover:text-blue-200 mb-4 flex items-center gap-2"
                    >
                        ← Voltar
                    </button>
                    <h1 className="text-4xl font-bold text-white text-center">Editar Tarefa</h1>
                </div>

                {/* Mensagem de erro */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Layout principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Coluna do Responsável */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-4">{responsavelAtual || 'Carregando...'}</h2>
                            {/*<div className="bg-gray-200 rounded-lg p-4 h-48">*/}
                                {/* Placeholder para foto/avatar do usuário */}
                                {/*<div className="w-full h-full bg-gray-300 rounded flex items-center justify-center">
                                    <span className="text-gray-500">Foto do usuário</span>
                                </div>*/}
                            {/*</div>*/}
                        </div>
                    </div>

                    {/* Coluna dos dados da tarefa */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-white text-lg font-semibold mb-2">
                                Título da tarefa
                            </label>
                            <input
                                type="text"
                                value={formData.titulo}
                                onChange={(e) => handleInputChange('titulo', e.target.value)}
                                className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                                placeholder="Título da tarefa"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-2">
                                Data Início
                            </label>
                            <input
                                type="date"
                                value={formData.dataInicio ? new Date(formData.dataInicio).toISOString().split('T')[0] : ''}
                                onChange={(e) => handleInputChange('dataInicio', e.target.value)}
                                className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-2">
                                Prazo
                            </label>
                            <input
                                type="date"
                                value={formData.prazo}
                                onChange={(e) => handleInputChange('prazo', e.target.value)}
                                className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-2">
                                Descrição
                            </label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => handleInputChange('descricao', e.target.value)}
                                className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg h-32 resize-none"
                                placeholder="Descrição da tarefa"
                            />
                        </div>
                    </div>

                    {/* Coluna de atribuição e status */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-bold text-white">Atribuição de responsável</h2>
                            </div>
                            <select
                                value={formData.responsavel}
                                onChange={(e) => handleInputChange('responsavel', e.target.value)}
                                onFocus={carregarUsuarios}
                                className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            >
                                <option value="" disabled>Selecione um responsável</option>
                                {usuarios.map(usuario => (
                                    <option key={usuario.usuarioId} value={usuario.usuarioId}>
                                        {usuario.nomeCompleto}
                                    </option>
                                ))}
                            </select>
                            </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-2">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            >
                                <option value="">Selecione um status</option>
                                <option value="pendente">Pendente</option>
                                <option value="em_desenvolvimento">Em desenvolvimento</option>
                                <option value="concluido">Concluído</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-white text-lg font-semibold mb-2">
                                Horas trabalhadas
                            </label>
                            <input
                                type="text"
                                value={formatarHoras(formData.totalHorasTrabalhadas)}
                                className="w-full bg-gray-100 rounded-lg px-4 py-3 text-black text-lg"
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-center gap-4 mt-8">
                    <button
                        onClick={handleCancelar}
                        disabled={loading}
                        className="px-8 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 disabled:opacity-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditarTarefa;