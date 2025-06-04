package ufsm.poli.csi.SistemaERP.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.dto.TarefaDTO;
import ufsm.poli.csi.SistemaERP.model.Sessao;
import ufsm.poli.csi.SistemaERP.model.Tarefa;
import ufsm.poli.csi.SistemaERP.model.Usuario;
import ufsm.poli.csi.SistemaERP.repository.SessaoRepository;
import ufsm.poli.csi.SistemaERP.repository.TarefaRepository;
import ufsm.poli.csi.SistemaERP.repository.UsuarioRepository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TarefaService {
    private final TarefaRepository tarefasRepository;
    private final UsuarioRepository usuariosRepository;
    private final SessaoRepository sessaoRepository;

    public TarefaService(TarefaRepository tarefasRepository, UsuarioRepository usuariosRepository, SessaoRepository sessaoRepository) {
        this.tarefasRepository = tarefasRepository;
        this.usuariosRepository = usuariosRepository;
        this.sessaoRepository = sessaoRepository;
    }

    public void salvarTarefa(TarefaDTO tarefaDTO){
        if (tarefaDTO.getUsuarioId() == null) {
            throw new IllegalArgumentException("O id do usuário não pode ser nulo.");
        }

        Usuario usuario = usuariosRepository.findById(tarefaDTO.getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Usuário não encontrado com id: " + tarefaDTO.getUsuarioId()));

        Tarefa tarefa = new Tarefa();
        tarefa.setUsuario(usuario);
        tarefa.setTitulo(tarefaDTO.getTitulo());
        tarefa.setDescricao(tarefaDTO.getDescricao());
        tarefa.setPrazo(tarefaDTO.getPrazo());
        tarefa.setStatus(Tarefa.StatusTarefa.pendente);
        tarefa.setDataInicio(Timestamp.valueOf(LocalDateTime.now()));
        this.tarefasRepository.save(tarefa);
    }

    public List<Tarefa> listarTarefas(){
        return this.tarefasRepository.findAll();
    }

    public List<Tarefa> listarConcluidas() {
        return this.tarefasRepository.findTarefaConcluidas();
    }

    public Tarefa buscarTarefaPorId(Long id) {
        return this.tarefasRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com id: " + id));
    }

    public void atualizarTarefa(TarefaDTO tarefaDTO){
        Tarefa tarefaAtual = this.tarefasRepository.findByTarefaId(tarefaDTO.getTarefaId());
        if (tarefaAtual == null) {
            throw new EntityNotFoundException("Tarefa não encontrada com id: " + tarefaDTO.getTarefaId());
        }

        Usuario usuario = this.usuariosRepository.findById(tarefaDTO.getUsuarioId())
                        .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com id: " + tarefaDTO.getUsuarioId()));

        tarefaAtual.setUsuario(usuario);
        tarefaAtual.setTitulo(tarefaDTO.getTitulo());
        tarefaAtual.setDescricao(tarefaDTO.getDescricao());
        tarefaAtual.setDataInicio(tarefaDTO.getDataInicio());
        if (tarefaDTO.getStatus().equalsIgnoreCase("concluido")) {
            tarefaAtual.setDataConclusao(Timestamp.valueOf(LocalDateTime.now()));
        } else {
            tarefaAtual.setDataConclusao(tarefaDTO.getDataConclusao());
        }
        tarefaAtual.setPrazo(tarefaDTO.getPrazo());
        tarefaAtual.setStatus(Tarefa.StatusTarefa.valueOf(tarefaDTO.getStatus()));

        this.tarefasRepository.save(tarefaAtual);

        // Atualizar totalHorasTrabalhadas recalculando com base nas sessões válidas
        this.atualizarTotalHorasTrabalhadas(tarefaAtual.getTarefaId());
    }

    private void atualizarTotalHorasTrabalhadas(Long tarefaId) {
        Tarefa tarefa = this.tarefasRepository.findByTarefaId(tarefaId);
        if (tarefa == null) {
            throw new EntityNotFoundException("Tarefa não encontrada com id: " + tarefaId);
        }

        // Buscar todas as sessões validadas da tarefa
        List<Sessao> sesoesValidadas = sessaoRepository.findByTarefa_TarefaIdAndValidadoTrue(tarefaId);

        // Somar duração total
        long totalHoras = 0L;
        for (Sessao sessao : sesoesValidadas) {
            if (sessao.getDuracaoTotal() != null) {
                totalHoras += sessao.getDuracaoTotal().toHours();
            }
        }

        // Atualizar e salvar a tarefa
        tarefa.setTotalHorasTrabalhadas(totalHoras);
        this.tarefasRepository.save(tarefa);
    }

    @Transactional
    public void excluirTarefa(Long id){
        Tarefa tarefa = tarefasRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tarefa não encontrada com o id: " + id));
        tarefasRepository.delete(tarefa);
    }
}
