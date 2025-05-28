package ufsm.poli.csi.SistemaERP.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ufsm.poli.csi.SistemaERP.model.Tarefa;

import java.sql.Timestamp;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TarefaDTO {
    private Long tarefaId;
    private String titulo;
    private String descricao;
    private Timestamp dataInicio;
    private Timestamp dataConclusao;
    private LocalDate prazo;
    private String status;
    private Long usuarioId;
    private UsuarioDTO usuario;

    public TarefaDTO(Tarefa tarefa) {
        this.tarefaId = tarefa.getTarefaId();
        this.titulo = tarefa.getTitulo();
        this.descricao = tarefa.getDescricao();
        this.dataInicio = tarefa.getDataInicio();
        this.dataConclusao = tarefa.getDataConclusao();
        this.prazo = tarefa.getPrazo();
        this.status = String.valueOf(tarefa.getStatus());
        this.usuario = new UsuarioDTO(tarefa.getUsuario());
        this.usuarioId = tarefa.getUsuario().getUsuarioId();
    }
}