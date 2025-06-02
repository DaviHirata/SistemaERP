package ufsm.poli.csi.SistemaERP.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.dto.SessaoDTO;
import ufsm.poli.csi.SistemaERP.model.Sessao;
import ufsm.poli.csi.SistemaERP.model.Tarefa;
import ufsm.poli.csi.SistemaERP.repository.IntervaloRepository;
import ufsm.poli.csi.SistemaERP.repository.SessaoRepository;
import ufsm.poli.csi.SistemaERP.repository.TarefaRepository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SessaoService {
    private final SessaoRepository sessaoRepository;
    private final TarefaRepository tarefaRepository;
    private final IntervaloRepository intervaloRepository;
    private final IntervaloService intervaloService;

    public SessaoService(SessaoRepository sessaoRepository, TarefaRepository tarefaRepository, IntervaloRepository intervaloRepository, IntervaloService intervaloService) {
        this.sessaoRepository = sessaoRepository;
        this.tarefaRepository = tarefaRepository;
        this.intervaloRepository = intervaloRepository;
        this.intervaloService = intervaloService;
    }

    public Long iniciarSessao(SessaoDTO sessaoDTO) {
        Tarefa tarefa = tarefaRepository.findById(sessaoDTO.getTarefaId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Tarefa não encontrada com id: " + sessaoDTO.getTarefaId()));

        // Atualizar o status da tarefa para "em_andamento" se ainda estiver "pendente"
        if (tarefa.getStatus() == Tarefa.StatusTarefa.pendente) {
            tarefa.setStatus(Tarefa.StatusTarefa.em_desenvolvimento);
            tarefaRepository.save(tarefa);
        }

        Sessao sessao = new Sessao();
        sessao.setTarefa(tarefa);
        sessao.setInicioSessao(LocalDateTime.now());
        sessao.setValidado(false);
        this.sessaoRepository.save(sessao);

        return sessao.getSessaoId();
    }

    public List<Sessao> listarSessoes(){
        return this.sessaoRepository.findAll();
    }

    public void calcularDuracaoSessao(Long sessaoId){
        Sessao sessao = sessaoRepository.findById(sessaoId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada: " + sessaoId));

        if (sessao.getFimSessao() == null) {
            throw new IllegalStateException("Sessão não foi encerrada corretamente");
        }

        // Duração total (sem subtrair intervalos) da sessão
        Duration duracaoBruta = Duration.between(sessao.getInicioSessao(), sessao.getFimSessao());
        // Tempo total dos intervalos
        Duration duracaoIntervalos = intervaloService.totalIntervalosNaSessao(sessaoId);
        // Duração real da sessão
        Duration duracaoFinal = duracaoBruta.minus(duracaoIntervalos);

        // Garantir que não fique negativo (em caso de inconsistências)
        if (duracaoFinal.isNegative()) {
            duracaoFinal = Duration.ZERO;
        }

        sessao.setDuracaoTotal(duracaoFinal);
        sessaoRepository.save(sessao);
    }

    public void validarSessao(Long sessaoId, String acao) {
        Sessao sessao = sessaoRepository.findById(sessaoId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada com id: " + sessaoId));

        switch (acao.toUpperCase()) {
            case "ACEITAR":
                sessao.setValidado(true);
                break;
            case "REJEITAR":
                sessao.setValidado(false);
                break;
            default:
                throw new IllegalArgumentException("Ação inválida: use 'ACEITAR' ou 'REJEITAR");
        }

        sessaoRepository.save(sessao);
    }

    public void encerrarSessao(Long sessaoId){
        Sessao sessao = sessaoRepository.findById(sessaoId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada com id: " + sessaoId));
        LocalDateTime fimSessao = LocalDateTime.now();
        sessao.setFimSessao(fimSessao);

        sessaoRepository.save(sessao);

        // Calcular a duração com base no tempo total - intervalos
        this.calcularDuracaoSessao(sessaoId);
    }

    @Transactional
    public void excluirSessao(Long id){
        Sessao sessao = sessaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada com o id: " + id));
        sessaoRepository.delete(sessao);
    }
}
