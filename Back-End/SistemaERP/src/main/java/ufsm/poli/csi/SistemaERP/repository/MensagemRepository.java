package ufsm.poli.csi.SistemaERP.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.model.Mensagem;

import java.util.List;

@Repository
public interface MensagemRepository extends JpaRepository<Mensagem, Long> {

    // Busca uma mensagem específica pelo ID
    Mensagem findByMensagemId(Long id);

    // Busca todas as mensagens de um usuário (destinatário), ordenadas da mais recente para a mais antiga
    List<Mensagem> findByDestinatarioUsuarioIdOrderByDataEnvioDesc(Long usuarioId);

    // Busca todas as mensagens não lidas de um usuário
    List<Mensagem> findByDestinatarioUsuarioIdAndLidaFalseOrderByDataEnvioDesc(Long usuarioId);

    // Marca uma mensagem como lida
    @Transactional
    @Modifying
    @Query("UPDATE Mensagem m SET m.lida = true WHERE m.mensagemId = :mensagemId")
    void marcarComoLida(@Param("mensagemId") Long mensagemId);
}
