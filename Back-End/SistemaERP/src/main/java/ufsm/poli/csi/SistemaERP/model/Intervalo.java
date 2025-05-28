package ufsm.poli.csi.SistemaERP.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "intervalo_sessao_trabalho")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Entidade que representa um intervalo durante uma sessão de trabalho")
public class Intervalo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Id do intervalo durante uma sessão", example = "1")
    private Long intervaloId;

    @NonNull
    @Schema(description = "Horário de início do intervalo - marcado à partir do momento " +
            "que o usuário clica em pausar", example = "12:00:00")
    private LocalDateTime inicio;

    @Schema(description = "Horário de término do intervalo - registrado à partir do momento" +
            "que o usuário clica em retormar", example = "14:00:00")
    private LocalDateTime fim;

    // Relacionamento com Sessão
    @ManyToOne
    @JoinColumn(name = "sessao_id")
    @Schema(description = "Sessão ao qual um intervalo está ligado")
    private Sessao sessao;
}
