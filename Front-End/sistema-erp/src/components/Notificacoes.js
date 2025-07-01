import React, { useState, useEffect } from 'react';
import { Bell, X, Eye, Trash2, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '@/services/api';

const Notificacoes = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filtro, setFiltro] = useState('todas'); // 'todas', 'naoLidas', 'lidas'
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        // Pegar o ID do usuário do localStorage apenas no cliente
        if (typeof window !== 'undefined') {
            const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
            if (usuario.id) {
                setUsuarioId(usuario.id);
            }
        }
    }, []);

    useEffect(() => {
        if (usuarioId) {
        carregarNotificacoes();
        }
    }, [usuarioId, filtro]);

    const carregarNotificacoes = async () => {
        setLoading(true);
        setError('');

        try {
        let endpoint = `/mensagem/listar/${usuarioId}`;
        
        if (filtro === 'naoLidas') {
            endpoint = `/mensagem/naoLidas/${usuarioId}`;
        }

        const response = await api.get(endpoint);
        
        let notificacoesFiltradas = response.data || [];
        
        // DEBUG: Verificar a estrutura dos dados
        console.log("Dados recebidos da API:", notificacoesFiltradas);
        if (notificacoesFiltradas.length > 0) {
            console.log("Estrutura da primeira notificação:", notificacoesFiltradas[0]);
            console.log("Campos disponíveis:", Object.keys(notificacoesFiltradas[0]));
        }
        
        if (filtro === 'lidas') {
            notificacoesFiltradas = notificacoesFiltradas.filter(notif => notif.lida);
        }

        setNotificacoes(notificacoesFiltradas);
        } catch (error) {
            console.error("Erro ao carregar notificações: ", error);
        if (error.response?.status === 401) {
            setError("Sessão expirada. Faça login novamente");
            if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            window.location.href = '/login';
            }
        } else {
            setError("Erro ao carregar notificações");
        }
        } finally {
            setLoading(false);
        }
    };

    const marcarComoLida = async (mensagemId) => {
        // DEBUG: Verificar se o ID está chegando corretamente
        console.log("ID da mensagem recebido:", mensagemId);
        console.log("Tipo do ID:", typeof mensagemId);
        
        if (!mensagemId) {
            console.error("ID da mensagem está undefined ou null");
            setError("Erro: ID da mensagem não encontrado");
            return;
        }

        try {
            console.log("Fazendo requisição para:", `/mensagem/marcarComoLida/${mensagemId}`);
            await api.patch(`/mensagem/marcarComoLida/${mensagemId}`);
            
            // Atualizar o estado local
            setNotificacoes(prev => 
                prev.map(notif => 
                notif.id === mensagemId 
                    ? { ...notif, lida: true }
                    : notif
                )
            );
        } catch (error) {
            console.error("Erro ao marcar como lida: ", error);
            setError("Erro ao marcar notificação como lida");
        }
    };

    const deletarNotificacao = async (mensagemId) => {
        // DEBUG: Verificar se o ID está chegando corretamente
        console.log("ID da mensagem para deletar:", mensagemId);
        
        if (!mensagemId) {
            console.error("ID da mensagem está undefined ou null");
            setError("Erro: ID da mensagem não encontrado");
            return;
        }

        if (!window.confirm("Tem certeza que deseja deletar esta notificação?")) {
            return;
        }

        try {
            await api.delete(`/mensagem/deletar/${mensagemId}`);
            
            // Remover do estado local
            setNotificacoes(prev => 
                prev.filter(notif => notif.id !== mensagemId)
            );
        } catch (error) {
            console.error("Erro ao deletar notificação: ", error);
            setError("Erro ao deletar notificação");
        }
    };

    const formatarData = (data) => {
        const date = new Date(data);
        return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
        });
    };

    const getTipoIcon = (tipo, lida) => {
        const iconColor = lida ? 'text-gray-400' : '';
        
        switch (tipo?.toLowerCase()) {
            case 'nova_tarefa':
            case 'nova tarefa':
                return <CheckCircle className={`w-5 h-5 ${lida ? iconColor : 'text-blue-500'}`} />;
            case 'alerta':
            case 'alerta_baixa_carga':
                return <AlertTriangle className={`w-5 h-5 ${lida ? iconColor : 'text-yellow-500'}`} />;
            default:
                return <Bell className={`w-5 h-5 ${lida ? iconColor : 'text-gray-500'}`} />;
        }
    };

    const contarNaoLidas = () => {
        return notificacoes.filter(notif => !notif.lida).length;
    };

    // Função para obter o ID correto da notificação
    const obterIdNotificacao = (notificacao) => {
        // Tentar diferentes possíveis nomes para o ID
        return notificacao.id || notificacao.mensagemId || notificacao.idMensagem || notificacao.ID;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gradient-to-br">
                <div className="text-lg text-white">Carregando notificações...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br p-6">
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
                <h1 className="text-3xl font-bold text-white">Notificações</h1>
                {contarNaoLidas() > 0 && (
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {contarNaoLidas()} não lidas
                </span>
                )}
            </div>
            <button
                onClick={carregarNotificacoes}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
                Atualizar
            </button>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFiltro('todas')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filtro === 'todas'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFiltro('naoLidas')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filtro === 'naoLidas'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Não Lidas
                    </button>
                    <button
                        onClick={() => setFiltro('lidas')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            filtro === 'lidas'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Lidas
                    </button>
                </div>
            </div>

            {/* Mensagens de erro */}
            {error && (
            <div className="bg-red-500 text-white px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
                <span>{error}</span>
                <button 
                    onClick={() => setError("")}
                    className="text-red-200 hover:text-white"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
            )}

            {/* Lista de Notificações */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {notificacoes.length === 0 ? (
                    <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Nenhuma notificação encontrada
                    </h3>
                    <p className="text-gray-500">
                        {filtro === 'naoLidas' 
                            ? 'Você não tem notificações não lidas.'
                            : filtro === 'lidas'
                            ? 'Você não tem notificações lidas.'
                            : 'Você não tem notificações no momento.'
                        }
                    </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                    {notificacoes.map((notificacao, index) => {
                        const idNotificacao = obterIdNotificacao(notificacao);
                        
                        return (
                        <div
                        key={idNotificacao || `notificacao-${index}`}
                        className={`p-6 transition-colors hover:bg-gray-50 ${
                            !notificacao.lida 
                                ? 'bg-blue-50 border-l-4 border-blue-500' 
                                : 'bg-gray-50 border-l-4 border-gray-300 opacity-70'
                        }`}
                        >
                        
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                            <div className="flex-shrink-0 mt-1">
                                {getTipoIcon(notificacao.tipo, notificacao.lida)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                <h3 className={`font-semibold ${
                                    !notificacao.lida ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                    {notificacao.texto}
                                </h3>
                                {!notificacao.lida && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                                )}
                                </div>
                                
                                <p className={`mb-3 leading-relaxed ${
                                    !notificacao.lida ? 'text-gray-600' : 'text-gray-400'
                                }`}>
                                    {notificacao.conteudo}
                                </p>
                                
                                <div className={`flex items-center text-sm space-x-4 ${
                                    !notificacao.lida ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                    <div className="flex items-center space-x-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>{formatarData(notificacao.dataEnvio)}</span>
                                    </div>
                                    {notificacao.remetente?.nomeCompleto && (
                                        <span>De: {notificacao.remetente.nomeCompleto}</span>
                                    )}
                                </div>
                            </div>
                            </div>
                            
                            {/* Ações */}
                            <div className="flex items-center space-x-2 ml-4">
                            {!notificacao.lida && idNotificacao && (
                                <button
                                onClick={() => marcarComoLida(idNotificacao)}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Marcar como lida"
                                >
                                <Eye className="w-5 h-5" />
                                </button>
                            )}
                            
                            {idNotificacao && (
                                <button
                                    onClick={() => deletarNotificacao(idNotificacao)}
                                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Deletar notificação"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            </div>
                        </div>
                        </div>
                        );
                    })}
                    </div>
                )}
            </div>

            {/* Rodapé com estatísticas */}
            {notificacoes.length > 0 && (
            <div className="mt-6 text-center text-white">
                <p className="text-sm opacity-75">
                Mostrando {notificacoes.length} notificação{notificacoes.length !== 1 ? 'ões' : ''} 
                {filtro !== 'todas' && ` (${filtro.replace('naoLidas', 'não lidas')})`}
                </p>
            </div>
            )}
        </div>
        </div>
    );
};

export default Notificacoes;