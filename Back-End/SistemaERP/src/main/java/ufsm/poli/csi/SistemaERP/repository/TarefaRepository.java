package ufsm.poli.csi.SistemaERP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.model.Tarefa;

import java.util.List;

@Repository
public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    public Tarefa findByTarefaId(Long id);

    List<Tarefa> findTarefaByUsuarioUsuarioId(Long usuarioId);

    @Query(value = "SELECT * FROM tarefa WHERE status != 'concluido' AND usuario_id = :usuarioId", nativeQuery = true)
    List<Tarefa> findTarefaNaoConcluidaByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query(value = "SELECT * FROM tarefa WHERE status = 'concluido'", nativeQuery = true)
    List<Tarefa> findTarefaConcluidas();

    @Modifying
    @Query("UPDATE Tarefa t SET t.totalHorasTrabalhadas = :nanos WHERE t.tarefaId = :tarefaId")
    void atualizarTotalHorasTrabalhadas(@Param("tarefaId") Long tarefaId, @Param("nanos") Long nanos);
}
