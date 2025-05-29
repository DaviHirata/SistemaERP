package ufsm.poli.csi.SistemaERP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ufsm.poli.csi.SistemaERP.model.Tarefa;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    public Tarefa findByTarefaId(Long id);

    List<Tarefa> findTarefaByUsuarioUsuarioId(Long usuarioId);
}
