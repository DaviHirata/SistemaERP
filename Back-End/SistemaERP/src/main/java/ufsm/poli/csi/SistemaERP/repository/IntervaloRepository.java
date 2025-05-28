package ufsm.poli.csi.SistemaERP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ufsm.poli.csi.SistemaERP.model.Intervalo;

import java.time.Duration;
import java.util.List;

@Repository
public interface IntervaloRepository extends JpaRepository<Intervalo, Long> {
    @Query(value = "SELECT SUM(EXTRACT(EPOCH FROM (i.fim - i.inicio))) FROM intervalo_sessao_trabalho" +
            " i WHERE i.sessao_id = :sessaoId AND i.fim IS NOT NULL", nativeQuery = true)
    Long calcularDuracaoTotalPorSessao(@Param("sessaoId") Long sessaoId);


    //List<Intervalo> findBySessaoId(Long sessaoId);
}
