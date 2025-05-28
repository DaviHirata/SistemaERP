package ufsm.poli.csi.SistemaERP.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.Type;

import java.util.List;

@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entidade que representa um usuário no sistema.")
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Id do usuário", example = "1")
    private Long usuarioId;

    @NonNull
    @Schema(description = "Nome do usuário", example = "Davi Hirata de Lima")
    private String nomeCompleto;

    @NonNull
    @Schema(description = "Email do usuário", example = "davi.lima@acad.ufsm.br")
    private String email;

    @NonNull
    @Schema(description = "Senha do usuário")
    private String senha;

    @NonNull
    @Schema(description = "Carga horária semanal que o usuário deve cumprir", example = "20")
    private Integer cargaHorariaSemanal;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Schema(description = "Tipo do usuário", example = "administrador")
    private TipoUsuario tipoUsuario;

    public enum TipoUsuario {
        administrador,
        membro,
        presidente
    }

    // Relacionamento com Tarefa
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    @Schema(description = "Lista de tarefas atribuídas ao usuário")
    private List<Tarefa> tarefas;
}