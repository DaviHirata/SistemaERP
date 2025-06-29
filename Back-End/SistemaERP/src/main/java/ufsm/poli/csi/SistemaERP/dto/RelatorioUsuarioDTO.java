package ufsm.poli.csi.SistemaERP.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RelatorioUsuarioDTO {
    private Long usuarioId;
    private String nomeCompleto;
    private int cargaHorariaSemanal;
    private double totalHorasCumpridas;
    private List<TarefaDTO> tarefas;
}
