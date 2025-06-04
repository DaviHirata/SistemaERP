package ufsm.poli.csi.SistemaERP.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ufsm.poli.csi.SistemaERP.model.Sessao;

import java.time.Duration;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SessaoDTO {
    private Long sessaoId;
    private LocalDateTime inicioSessao;
    private LocalDateTime fimSessao;
    private Duration duracaoTotal;
    private Boolean validado;
    private Long tarefaId;
    private TarefaDTO tarefa;

    public SessaoDTO(Sessao sessao) {
        this.sessaoId = sessao.getSessaoId();
        this.inicioSessao = sessao.getInicioSessao();
        this.fimSessao = sessao.getFimSessao();
        this.duracaoTotal = sessao.getDuracaoTotal();
        this.validado = sessao.getValidado();
        this.tarefa = new TarefaDTO(sessao.getTarefa());
        this.tarefaId = sessao.getTarefa().getTarefaId();
    }
}
