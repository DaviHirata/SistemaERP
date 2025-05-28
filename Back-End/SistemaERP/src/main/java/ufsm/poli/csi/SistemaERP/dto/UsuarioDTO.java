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
    private String nome_completo;
    private String email;
    private int carga_horaria_semanal;
    private String tipo_usuario;

    public UsuarioDTO(Usuario usuario) {
        this.usuarioId = usuario.getUsuarioId();
        this.nome_completo = usuario.getNomeCompleto();
        this.email = usuario.getEmail();
        this.carga_horaria_semanal = usuario.getCargaHorariaSemanal();
        this.tipo_usuario = String.valueOf(usuario.getTipoUsuario());
    }
}
