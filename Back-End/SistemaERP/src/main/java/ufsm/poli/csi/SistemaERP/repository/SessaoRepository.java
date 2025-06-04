package ufsm.poli.csi.SistemaERP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import ufsm.poli.csi.SistemaERP.model.Sessao;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, Long> {
    List<Sessao> findByTarefa_TarefaIdAndValidadoTrue(Long tarefaId);

    @Query(value = "SELECT * FROM sessao_trabalho WHERE tarefa_id = ?", nativeQuery = true)
    List<Sessao> findSessoesTarefa(Long tarefaId);
}
