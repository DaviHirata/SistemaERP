package ufsm.poli.csi.SistemaERP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ufsm.poli.csi.SistemaERP.model.Sessao;

import java.util.List;

@Repository
public interface SessaoRepository extends JpaRepository<Sessao, Long> {
    List<Sessao> findByTarefa_TarefaIdAndValidadoTrue(Long tarefaId);
}
