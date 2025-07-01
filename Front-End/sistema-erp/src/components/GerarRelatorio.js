import React, { useState, useEffect } from 'react';
import api from '@/services/api';

const GerarRelatorio = () => {
  const [relatorioData, setRelatorioData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [periodo, setPeriodo] = useState('semana'); // 'semana' ou 'mes'
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [relatorioGerado, setRelatorioGerado] = useState(false);

  useEffect(() => {
    // Configurar datas padrão baseado no período selecionado
    const hoje = new Date();
    
    if (periodo === 'semana') {
      // Semana anterior
      const inicioSemanaAnterior = new Date(hoje);
      inicioSemanaAnterior.setDate(hoje.getDate() - 7);
      const fimSemanaAnterior = new Date(hoje);
      fimSemanaAnterior.setDate(hoje.getDate() - 1);
      
      setDataInicio(inicioSemanaAnterior.toISOString().split('T')[0]);
      setDataFim(fimSemanaAnterior.toISOString().split('T')[0]);
    } else if (periodo === 'mes') {
      // Mês anterior
      const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
      
      setDataInicio(inicioMesAnterior.toISOString().split('T')[0]);
      setDataFim(fimMesAnterior.toISOString().split('T')[0]);
    }
  }, [periodo]);

  const gerarRelatorio = async () => {
    if (!dataInicio || !dataFim) {
      setError('Por favor, selecione as datas de início e fim');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.get('/usuario/relatorio', {
        params: {
          dataInicio: dataInicio,
          dataFim: dataFim
        }
      });

      if (response.data) {
        setRelatorioData(response.data);
        setRelatorioGerado(true);
      }
    } catch (error) {
      console.error("Erro ao gerar relatório: ", error);
      if (error.response?.status === 401) {
        setError("Sessão expirada. Faça login novamente");
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      } else {
        setError("Erro ao gerar relatório de atividades");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatarHoras = (horas) => {
    if (typeof horas === 'number') {
      return `${horas.toFixed(1)} horas`;
    }
    return '0 horas';
  };

  const formatarData = (data) => {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  const handleAlertar = async (usuario) => {
      const remetente = JSON.parse(localStorage.getItem('usuario')); // quem está logado (presidente ou admin)

      if (!remetente || !(remetente.usuarioId || remetente.id)) {
        alert("Usuário logado não identificado.");
        return;
      }

      const mensagem = {
        remetente: { usuarioId: remetente.usuarioId || remetente.id },
        destinatario: { usuarioId: usuario.usuarioId },
        texto: `Você realizou apenas ${usuario.totalHorasCumpridas.toFixed(1)} horas no período de ${formatarData(dataInicio)} a ${formatarData(dataFim)}, abaixo da sua carga horária esperada de ${usuario.cargaHorariaSemanal} horas.`,
        tipo: "alerta",
        dataEnvio: new Date().toISOString()
      };

      try {
        await api.post('/mensagem/salvar', mensagem);
        alert(`Alerta enviado para ${usuario.nomeCompleto}.`);
      } catch (error) {
        console.error("Erro ao enviar alerta:", error);
        alert("Erro ao enviar alerta.");
      }
  };

  const exportarRelatorio = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Usuário,Total de Horas,Carga Horária Esperada,Status\n"
      + relatorioData.map(usuario => 
          `${usuario.nomeCompleto},${usuario.totalHorasCumpridas.toFixed(1)},${usuario.cargaHorariaSemanal},${usuario.totalHorasCumpridas >= usuario.cargaHorariaSemanal ? 'Adequado' : 'Abaixo'}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_atividades_${dataInicio}_${dataFim}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-900">
        <div className="text-lg text-white">Gerando relatório...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Gerar relatório de atividades</h1>
        </div>

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

        {/* Formulário para seleção de período */}
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Período</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="flex items-center text-gray-700 mb-2">
                <input
                  type="radio"
                  name="periodo"
                  value="mes"
                  checked={periodo === 'mes'}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="mr-2"
                />
                Mês anterior
              </label>
            </div>
            <div>
              <label className="flex items-center text-gray-700 mb-2">
                <input
                  type="radio"
                  name="periodo"
                  value="semana"
                  checked={periodo === 'semana'}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="mr-2"
                />
                Semana anterior
              </label>
            </div>
            <div>
              <label className="flex items-center text-gray-700 mb-2">
                <input
                  type="radio"
                  name="periodo"
                  value="personalizado"
                  checked={periodo === 'personalizado'}
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="mr-2"
                />
                Período personalizado
              </label>
            </div>
          </div>

          {/* Campos de data customizáveis ou apenas exibição */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-gray-700 mb-2">Data Início</label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                disabled={periodo !== 'personalizado'}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Data Fim</label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                disabled={periodo !== 'personalizado'}
                className="w-full border rounded px-3 py-2 disabled:bg-gray-200"
              />
            </div>
            <div>
              <button 
                onClick={gerarRelatorio}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Gerando...' : 'Gerar relatório'}
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de resultados */}
        {relatorioGerado && (
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Relatório de {formatarData(dataInicio)} a {formatarData(dataFim)}
              </h3>
              <button 
                onClick={exportarRelatorio}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Exportar CSV
              </button>
            </div>
            
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">Usuário</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">Total de horas</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">Carga horária esperada</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-800">Ações</th>
                </tr>
              </thead>
              <tbody>
                {relatorioData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      Nenhum dado encontrado para o período selecionado
                    </td>
                  </tr>
                ) : (
                  relatorioData.map((usuario, index) => (
                    <tr key={usuario.usuarioId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-4 px-6 text-gray-800">
                        <div>
                          <div className="font-medium">{usuario.nomeCompleto}</div>
                          <div className="text-sm text-gray-500">
                            {usuario.tarefas.length} tarefa{usuario.tarefas.length !== 1 ? 's' : ''} concluída{usuario.tarefas.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        <span className={usuario.totalHorasCumpridas < usuario.cargaHorariaSemanal ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {formatarHoras(usuario.totalHorasCumpridas)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-800">
                        {formatarHoras(usuario.cargaHorariaSemanal)}
                      </td>
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => handleAlertar(usuario)}
                          className={`px-4 py-2 rounded text-white font-medium ${
                            usuario.totalHorasCumpridas < usuario.cargaHorariaSemanal 
                              ? 'bg-yellow-500 hover:bg-yellow-600' 
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                          disabled={usuario.totalHorasCumpridas >= usuario.cargaHorariaSemanal}
                        >
                          Alertar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Detalhes das tarefas por usuário */}
        {relatorioGerado && relatorioData.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Detalhes das Tarefas</h3>
            {relatorioData.map((usuario) => (
              usuario.tarefas.length > 0 && (
                <div key={usuario.usuarioId} className="bg-white rounded-lg p-6 mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">{usuario.nomeCompleto}</h4>
                  <div className="space-y-2">
                    {usuario.tarefas.map((tarefa) => (
                      <div key={tarefa.tarefaId} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="font-medium text-gray-800">{tarefa.titulo}</div>
                        <div className="text-sm text-gray-600">
                          Status: <span className="capitalize">{tarefa.status.replace('_', ' ')}</span> | 
                          Prazo: {formatarData(tarefa.prazo)} | 
                          {tarefa.dataConclusao && `Concluído em: ${formatarData(tarefa.dataConclusao)}`}
                        </div>
                        {tarefa.descricao && (
                          <div className="text-sm text-gray-500 mt-1">{tarefa.descricao}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GerarRelatorio;