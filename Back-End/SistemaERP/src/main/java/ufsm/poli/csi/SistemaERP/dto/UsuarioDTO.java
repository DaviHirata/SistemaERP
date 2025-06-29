package ufsm.poli.csi.SistemaERP.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ufsm.poli.csi.SistemaERP.model.Usuario;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsuarioDTO {
    private Long usuarioId;
    private String nomeCompleto;
    private String email;
    private int cargaHorariaSemanal;
    private String tipoUsuario;

    public UsuarioDTO(Usuario usuario) {
        this.usuarioId = usuario.getUsuarioId();
        this.nomeCompleto = usuario.getNomeCompleto();
        this.email = usuario.getEmail();
        this.cargaHorariaSemanal = usuario.getCargaHorariaSemanal();
        this.tipoUsuario = String.valueOf(usuario.getTipoUsuario());
    }
}
