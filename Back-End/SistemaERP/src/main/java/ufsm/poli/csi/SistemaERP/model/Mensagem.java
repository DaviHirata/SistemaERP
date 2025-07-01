package ufsm.poli.csi.SistemaERP.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mensagem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Entidade que representa uma mensagem ou notificação.")
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "ID da mensagem", example = "1")
    private Long mensagemId;

    @ManyToOne
    @JoinColumn(name = "remetente_id")
    @JsonIgnoreProperties({"tarefas"})
    @Schema(description = "Usuário remetente da mensagem (pode ser nulo para mensagens do sistema).")
    private Usuario remetente;

    @ManyToOne(optional = false)
    @JoinColumn(name = "destinatario_id", nullable = false)
    @JsonIgnoreProperties({"tarefas"})
    @Schema(description = "Usuário destinatário da mensagem.")
    private Usuario destinatario;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Schema(description = "Texto da mensagem", example = "Nova tarefa atribuída")
    private String texto;

    @Column(nullable = false, length = 50)
    @Schema(description = "Tipo da mensagem", example = "nova_tarefa")
    private String tipo;

    @Column(name = "data_envio", nullable = false)
    @Schema(description = "Data e hora de envio da mensagem", example = "2025-06-30T14:33:00")
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Column(nullable = false)
    @Schema(description = "Indica se a mensagem foi lida", example = "false")
    private boolean lida = false;
}
