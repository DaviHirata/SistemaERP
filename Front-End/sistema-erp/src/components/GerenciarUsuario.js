import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function GerenciamentoUsuarios() {
  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    email: '',
    confirmarEmail: '',
    senha: '',
    confirmarSenha: '',
    tipoUsuario: '',
    cargaHorariaSemanal: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para lista de usuários (exemplo)
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [errorUsuarios, setErrorUsuarios] = useState('');
  
  // Função para buscar usuários da API
  const fetchUsuarios = async () => {
    try {
      setLoadingUsuarios(true);
      setErrorUsuarios('');

      const response = await api.get('/usuario/listar');

      if (response.status === 200) {
        setUsuarios(response.data);
      } else {
        setErrorUsuarios('Erro ao carregar usuários');
      }
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        
        if (error.response) {
          setErrorUsuarios(error.response.data?.message || 'Erro ao carregar usuários');
        } else if (error.request) {
          setErrorUsuarios('Erro de conexão. Verifique sua internet.');
        } else {
          setErrorUsuarios('Erro inesperado ao carregar usuários.');
        }
    } finally {
        setLoadingUsuarios(false);
    }
  };

  // Carregar usuários ao montar o componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpa mensagens de erro ao digitar
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.nomeCompleto.trim()) {
      setError('Nome completo é obrigatório');
      return false;
    }
    
    if (!formData.email.trim()) {
      setError('E-mail é obrigatório');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('E-mail inválido');
      return false;
    }
    
    if (formData.email !== formData.confirmarEmail) {
      setError('E-mails não coincidem');
      return false;
    }
    
    if (!formData.senha) {
      setError('Senha é obrigatória');
      return false;
    }
    
    if (formData.senha.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    if (formData.senha !== formData.confirmarSenha) {
      setError('Senhas não coincidem');
      return false;
    }
    
    if (!formData.tipoUsuario) {
      setError('Selecione o tipo de usuário');
      return false;
    }

    if (!formData.cargaHorariaSemanal) {
      setError('Carga horária semanal é obrigatória');
      return false;
    }
    
    const cargaHoraria = parseInt(formData.cargaHorariaSemanal);
    if (isNaN(cargaHoraria) || cargaHoraria <= 0 || cargaHoraria > 60) {
      setError('Carga horária deve ser um número entre 1 e 60 horas');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/usuario/cadastrar', {
        nomeCompleto: formData.nomeCompleto,
        email: formData.email,
        senha: formData.senha,
        tipoUsuario: formData.tipoUsuario,
        cargaHorariaSemanal: formData.cargaHorariaSemanal
      });
      
      if (response.status === 200 || response.status === 201) {
        setSuccess('Usuário criado com sucesso!');
        // Limpar formulário
        setFormData({
          nomeCompleto: '',
          email: '',
          confirmarEmail: '',
          senha: '',
          confirmarSenha: '',
          tipoUsuario: '',
          cargaHorariaSemanal: '',
        });
        
        // Fechar modal após alguns segundos
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccess('');
        }, 2000);
        
      } else {
        setError(response.data?.message || 'Erro ao criar usuário');
      }
      
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      
      if (error.response) {
        setError(error.response.data?.message || 'Erro ao criar usuário');
      } else if (error.request) {
        setError('Erro de conexão. Verifique sua internet.');
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
    setSuccess('');
    setFormData({
      nomeCompleto: '',
      email: '',
      confirmarEmail: '',
      senha: '',
      confirmarSenha: '',
      tipoUsuario: '',
      cargaHorariaSemanal: '',
    });
  };

  const getTipoUsuarioColor = (tipo) => {
    switch(tipo) {
      case 'administrador': return 'bg-red-100 text-red-800';
      case 'presidente': return 'bg-purple-100 text-purple-800';
      case 'membro': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-20 h-full bg-blue-900 bg-opacity-50 flex flex-col items-center py-6 space-y-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        
        <button className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>

        <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
        </button>

        <button className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
        </button>

        <button className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1"></div>

        <button className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Header */}
      <div className="ml-20 flex justify-between items-center p-6">
        <h1 className="text-3xl font-bold text-white">Usuários</h1>
      </div>

      {/* Conteúdo principal */}
      <div className="ml-20 px-6 pb-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {usuarios.map((usuario) => (
            <div key={usuario.usuarioId} className="bg-white bg-opacity-90 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <h3 className="font-semibold text-gray-800">{usuario.nomeCompleto}</h3>
                  <p className="text-gray-600 text-sm">{usuario.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoUsuarioColor(usuario.tipoUsuario)}`}>
                  {usuario.tipoUsuario}
                </span>
              </div>
              <button 
                onClick={() => window.location.href = `/editar/${usuario.usuarioId}`}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 font-medium"
              >
                ver
              </button>
            </div>
          ))}
        </div>

        {/* Botão flutuante para adicionar usuário */}
        <button
          onClick={openModal}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm backdrop-brightness-75 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 w-full max-w-md max-h-screen overflow-y-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Novo Usuário</h2>
              <button 
                onClick={closeModal}
                className="text-white hover:text-blue-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mensagens de erro/sucesso */}
            {error && (
              <div className="bg-red-500 text-white px-4 py-3 rounded-lg mb-4 text-center">
                {error}
              </div>
            )}
            
            {success && (
              <div className="bg-green-500 text-white px-4 py-3 rounded-lg mb-4 text-center">
                {success}
              </div>
            )}

            {/* Formulário */}
            <div className="space-y-4">
              {/* Nome completo */}
              <div>
                <label className="block text-white mb-2 font-medium text-sm">
                  Nome e sobrenome
                </label>
                <input
                  type="text"
                  className="w-full bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Nome e sobrenome"
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                />
              </div>

              {/* E-mail */}
              <div>
                <label className="block text-white mb-2 font-medium text-sm">
                  Digite seu e-mail
                </label>
                <input
                  type="email"
                  className="w-full bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Digite seu e-mail"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              {/* Confirmar e-mail */}
              <div>
                <label className="block text-white mb-2 font-medium text-sm">
                  Repita seu e-mail
                </label>
                <input
                  type="email"
                  className="w-full bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Repita seu e-mail"
                  value={formData.confirmarEmail}
                  onChange={(e) => handleInputChange('confirmarEmail', e.target.value)}
                />
              </div>

              {/* Tipo de usuário e Carga Horária */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-medium text-sm">
                    Tipo de usuário
                  </label>
                  <select
                    className="w-full bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    value={formData.tipoUsuario}
                    onChange={(e) => handleInputChange('tipoUsuario', e.target.value)}
                  >
                    <option value="" className="bg-blue-800">Selecione</option>
                    <option value="administrador" className="bg-blue-800">Administrador</option>
                    <option value="membro" className="bg-blue-800">Membro</option>
                    <option value="presidente" className="bg-blue-800">Presidente</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white mb-2 font-medium text-sm">
                    Carga Horária/Semana
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="w-full bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-3 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="40"
                    value={formData.cargaHorariaSemanal}
                    onChange={(e) => handleInputChange('cargaHorariaSemanal', e.target.value)}
                  />
                </div>
              </div>

              {/* Senhas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white mb-2 font-medium text-sm">
                    Crie uma senha
                  </label>
                  <input
                    type="password"
                    className="w-full bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    placeholder="Senha"
                    value={formData.senha}
                    onChange={(e) => handleInputChange('senha', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-white mb-2 font-medium text-sm">
                    Repita a senha
                  </label>
                  <input
                    type="password"
                    className="w-full bg-blue-800 bg-opacity-50 border border-blue-600 rounded-lg px-4 py-2 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm"
                    placeholder="Confirmar"
                    value={formData.confirmarSenha}
                    onChange={(e) => handleInputChange('confirmarSenha', e.target.value)}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={closeModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}