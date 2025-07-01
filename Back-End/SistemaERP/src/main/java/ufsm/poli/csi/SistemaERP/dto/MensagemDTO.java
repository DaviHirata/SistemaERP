package ufsm.poli.csi.SistemaERP.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ufsm.poli.csi.SistemaERP.model.Mensagem;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MensagemDTO {
    private Long mensagemId;
    private UsuarioDTO remetente;     // pode ser null
    private UsuarioDTO destinatario;
    private String texto;
    private String tipo;
    private LocalDateTime dataEnvio;
    private boolean lida;

    public MensagemDTO(Mensagem mensagem) {
        this.mensagemId = mensagem.getMensagemId();
        this.remetente = mensagem.getRemetente() != null ? new UsuarioDTO(mensagem.getRemetente()) : null;
        this.destinatario = new UsuarioDTO(mensagem.getDestinatario());
        this.texto = mensagem.getTexto();
        this.tipo = mensagem.getTipo();
        this.dataEnvio = mensagem.getDataEnvio();
        this.lida = mensagem.isLida();
    }
}
