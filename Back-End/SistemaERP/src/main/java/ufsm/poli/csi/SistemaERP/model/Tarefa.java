package ufsm.poli.csi.SistemaERP.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "tarefa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entidade que representa uma tarefa no sistema")
public class Tarefa {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Id da tarefa", example = "1")
    private Long tarefaId;

    @NonNull
    @Schema(description = "Título da tarefa", example = "Desenvolver endpoints do sistema")
    private String titulo;

    @NonNull
    @Schema(description = "Descrição da tarefa")
    private String descricao;

    @NonNull
    @Schema(description = "Data em que o usuário mudou o status da tarefa para 'em andamento' e começou" +
            "a trabalhar na atividade", example = "15/05/2025")
    private Timestamp dataInicio;

    @Schema(description = "Data em que o usuário alterou o status da tarefa para 'concluído'",
            example = "25/05/2025")
    private Timestamp dataConclusao;

    @NonNull
    @Schema(description = "Prazo máximo para a conclusão da tarefa", example = "26/05/2025")
    private LocalDate prazo;

    @NonNull
    @Enumerated(EnumType.STRING)
    @Schema(description = "Status da tarefa - criada como pendente", example = "em_andamento")
    private StatusTarefa status;

    @Schema(description = "Tempo total gasto na execução da tarefa. Soma-se todas as sessões de trabalho",
            example = "PT10H40M")
    private Long totalHorasTrabalhadas;

    public enum StatusTarefa {
        pendente,
        em_desenvolvimento,
        concluido
    }

    // Relacionamento com Usuário
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @Schema(description = "Usuário responsável pela tarefa")
    private Usuario usuario;

    // Relacionamento com Sessão de trabalho
    @OneToMany(mappedBy = "tarefa", cascade = CascadeType.ALL)
    @Schema(description = "Lista de sessões de trabalho vinculadas à tarefa")
    private List<Sessao> sessoes;
}
