import React, { useState, useEffect } from 'react';
import api from '@/services/api';

const EditarUsuario = ({ usuarioId }) => {
    const [formData, setFormData] = useState({
        usuarioId: '',
        nomeCompleto: '',
        email: '',
        senha: '',
        cargaHorariaSemanal: '',
        tipoUsuario: '',
    });

    const [senhaOriginal, setSenhaOriginal] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingUsuario, setLoadingUsuario] = useState(true);

    // Carregar dados do usuário ao abrir o componente
    useEffect(() => {
        const carregarDados = async () => {
            try {
                setLoadingUsuario(true);
                
                // Carregar dados do usuário
                const responseUsuario = await api.get(`/usuario/buscarUsuario/${usuarioId}`);
                const usuario = responseUsuario.data;
                
                // Debug: verificar os dados recebidos
                console.log('Dados do usuário:', usuario);

                // Armazenar senha original para uso posterior
                setSenhaOriginal(usuario.senha || '');

                // Preparar dados do formulário
                setFormData({
                    usuarioId: usuario.usuarioId || '',
                    nomeCompleto: usuario.nomeCompleto || '',
                    email: usuario.email || '',
                    senha: '',
                    cargaHorariaSemanal: usuario.cargaHorariaSemanal || '',
                    tipoUsuario: usuario.tipoUsuario || '',
                });
                
            } catch (error) {
                console.error("Erro ao carregar dados: ", error);
                setError("Erro ao carregar dados do usuário");
            } finally {
                setLoadingUsuario(false);
            }
        };

        if (usuarioId) {
            carregarDados();
        }
    }, [usuarioId]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const validateForm = () => {
        if (!formData.nomeCompleto.trim()) {
            setError('Nome completo é obrigatório');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Email é obrigatório');
            return false;
        }
        if (!formData.cargaHorariaSemanal || formData.cargaHorariaSemanal <= 0) {
            setError('Carga horária semanal é obrigatória e deve ser maior que zero');
            return false;
        }
        if (!formData.tipoUsuario.trim()) {
            setError('Tipo de usuário é obrigatório');
            return false;
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Email deve ter um formato válido');
            return false;
        }

        // Validação de senha (apenas se foi preenchida)
        if (formData.senha && formData.senha.length < 6) {
            setError('Senha deve ter pelo menos 6 caracteres');
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
            const usuarioAtualizado = {
                usuarioId: formData.usuarioId,
                nomeCompleto: formData.nomeCompleto,
                email: formData.email,
                cargaHorariaSemanal: parseInt(formData.cargaHorariaSemanal),
                tipoUsuario: formData.tipoUsuario,
            };

            // Se senha foi preenchida, usar nova senha, senão usar a senha original
            if (formData.senha && formData.senha.trim()) {
                usuarioAtualizado.senha = formData.senha;
            } else {
                usuarioAtualizado.senha = senhaOriginal; // Usar senha anterior
            }

            await api.put(`/usuario/atualizarUsuario`, usuarioAtualizado);
            alert('Usuário atualizado com sucesso!');
            window.location.href = '/gerenciarUsuarios';
        } catch (error) {
            console.error("Erro ao atualizar usuário: ", error);
            setError("Erro ao salvar alterações do usuário");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = () => {
        window.location.href = '/gerenciarUsuarios';
        console.log('Cancelar - navegar para /gerenciarUsuarios');
    };

    const formatarCargaHoraria = (horas) => {
        if (!horas) return '';
        return `${horas}h semanais`;
    };

    if (loadingUsuario) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center">
                <div className="text-white text-xl">Carregando dados do usuário...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={handleCancelar}
                        className="text-white hover:text-blue-200 mb-4 flex items-center gap-2"
                    >
                        ← Voltar
                    </button>
                    <h1 className="text-4xl font-bold text-white">Editar Usuário</h1>
                </div>

                {/* Mensagem de erro */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* Layout principal */}
                <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Dados do Usuário</h2>
                    </div>

                    <div>
                        <label className="block text-white text-lg font-semibold mb-2">
                            Nome Completo *
                        </label>
                        <input
                            type="text"
                            value={formData.nomeCompleto}
                            onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                            className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            placeholder="Nome completo do usuário"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-lg font-semibold mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            placeholder="email@exemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-lg font-semibold mb-2">
                            Nova Senha
                        </label>
                        <input
                            type="password"
                            value={formData.senha}
                            onChange={(e) => handleInputChange('senha', e.target.value)}
                            className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            placeholder="Deixe em branco para manter a senha atual"
                        />
                    </div>

                    <div>
                        <label className="block text-white text-lg font-semibold mb-2">
                            Carga Horária Semanal *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="60"
                            value={formData.cargaHorariaSemanal}
                            onChange={(e) => handleInputChange('cargaHorariaSemanal', e.target.value)}
                            className="w-full bg-gray-200 rounded-lg px-4 py-3 text-black text-lg"
                            placeholder="40"
                        />
                        {formData.cargaHorariaSemanal && (
                            <div className="text-blue-200 text-sm mt-1">
                                {formatarCargaHoraria(formData.cargaHorariaSemanal)}
                            </div>
                        )}
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

export default EditarUsuario;