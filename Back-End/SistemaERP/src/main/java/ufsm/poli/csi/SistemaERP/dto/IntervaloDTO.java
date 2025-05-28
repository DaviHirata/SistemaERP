package ufsm.poli.csi.SistemaERP.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ufsm.poli.csi.SistemaERP.model.Intervalo;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class IntervaloDTO {
    private Long intervaloId;
    private LocalDateTime inicio;
    private LocalDateTime fim;
    private Long sessaoId;
    private SessaoDTO sessao;

    public IntervaloDTO(Intervalo intervalo) {
        this.intervaloId = intervalo.getIntervaloId();
        this.inicio = intervalo.getInicio();
        this.fim = intervalo.getFim();
        this.sessaoId = intervalo.getSessao().getSessaoId();
        this.sessao = new SessaoDTO(intervalo.getSessao());
    }
}
