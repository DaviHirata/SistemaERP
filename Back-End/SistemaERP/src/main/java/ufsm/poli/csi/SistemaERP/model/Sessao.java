package ufsm.poli.csi.SistemaERP.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sessao_trabalho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entidade que representa uma sessão de trabalho no sistema")
public class Sessao {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Id da sessão de trabalho", example = "1")
    private Long sessaoId;

    @NonNull
    @Schema(description = "Horário do início da sessão de trabalho em uma tarefa", example = "08:00:00")
    private LocalDateTime inicioSessao;

    @Schema(description = "Horário de término da sessão de trabalho em uma tarefa", example = "18:00:00")
    private LocalDateTime fimSessao;

    @Schema(description = "Tempo total da sessão de trabalho. " +
            "Calculado por ((fim_sessao - inicio_sessao) - duração do intervalo", example = "08:00:00")
    private Duration duracaoTotal;

    @NonNull
    @Schema(description = "Verificação sobre a validade de uma sessão. Definido como falso por padrão." +
            "Será alterado após o administrador validar a sessão")
    private boolean validado;

    // Relacionamento com Tarefa
    @ManyToOne
    @JoinColumn(name = "tarefa_id")
    @Schema(description = "Tarefa à qual uma sessão pertence")
    private Tarefa tarefa;

    // Relacionamento com Intervalo
    @OneToMany(mappedBy = "sessao", cascade = CascadeType.ALL)
    @Schema(description = "Lista de intervalos vinculados à uma única sessão")
    private List<Intervalo> intervalos;
}