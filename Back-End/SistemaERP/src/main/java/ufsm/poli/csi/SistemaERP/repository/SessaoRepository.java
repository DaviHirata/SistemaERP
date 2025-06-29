package ufsm.poli.csi.SistemaERP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ufsm.poli.csi.SistemaERP.dto.SessaoDTO;
import ufsm.poli.csi.SistemaERP.model.Sessao;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, Long> {
    @Query(value = "SELECT * FROM sessao_trabalho WHERE tarefa_id = ?", nativeQuery = true)
    List<Sessao> findSessoesTarefa(Long tarefaId);

    boolean existsByTarefa_TarefaIdAndValidadoIsNull(Long tarefaId);

    List<SessaoDTO> findByTarefa_TarefaIdAndValidadoTrue(Long tarefaId);

    @Query("SELECT s FROM Sessao s WHERE s.tarefa.usuario.usuarioId = :usuarioId " +
            "AND s.inicioSessao >= :dataInicio AND s.inicioSessao <= :dataFim")
    List<Sessao> findByUsuarioAndPeriodo(@Param("usuarioId") Long usuarioId,
                                         @Param("dataInicio") LocalDateTime dataInicio,
                                         @Param("dataFim") LocalDateTime dataFim);
}
