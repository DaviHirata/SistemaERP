package ufsm.poli.csi.SistemaERP.service;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ufsm.poli.csi.SistemaERP.dto.MensagemDTO;
import ufsm.poli.csi.SistemaERP.model.Mensagem;
import ufsm.poli.csi.SistemaERP.model.Usuario;
import ufsm.poli.csi.SistemaERP.repository.MensagemRepository;
import ufsm.poli.csi.SistemaERP.repository.UsuarioRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MensagemService {

    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;

    public MensagemService(MensagemRepository mensagemRepository, UsuarioRepository usuarioRepository) {
        this.mensagemRepository = mensagemRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Cria e salva uma nova mensagem (notificação ou troca de mensagens).
     */
    public void salvarMensagem(MensagemDTO dto) {
        Usuario destinatario = usuarioRepository.findById(dto.getDestinatario().getUsuarioId())
                .orElseThrow(() -> new EntityNotFoundException("Destinatário não encontrado com id: " + dto.getDestinatario().getUsuarioId()));

        Usuario remetente = null;
        if (dto.getRemetente() != null && dto.getRemetente().getUsuarioId() != null) {
            remetente = usuarioRepository.findById(dto.getRemetente().getUsuarioId())
                    .orElseThrow(() -> new EntityNotFoundException("Remetente não encontrado com id: " + dto.getRemetente().getUsuarioId()));
        }

        Mensagem mensagem = Mensagem.builder()
                .remetente(remetente)
                .destinatario(destinatario)
                .texto(dto.getTexto())
                .tipo(dto.getTipo())
                //.dataEnvio(dto.getDataEnvio() != null ? dto.getDataEnvio() : LocalDateTime.now())
                .dataEnvio(LocalDateTime.now())
                .lida(false)
                .build();

        mensagemRepository.save(mensagem);
    }

    /**
     * Lista todas as mensagens de um destinatário.
     */
    public List<MensagemDTO> listarMensagensPorUsuario(Long usuarioId) {
        return mensagemRepository.findByDestinatarioUsuarioIdOrderByDataEnvioDesc(usuarioId)
                .stream()
                .map(MensagemDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Lista mensagens não lidas de um usuário.
     */
    public List<MensagemDTO> listarNaoLidas(Long usuarioId) {
        return mensagemRepository.findByDestinatarioUsuarioIdAndLidaFalseOrderByDataEnvioDesc(usuarioId)
                .stream()
                .map(MensagemDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Marca uma mensagem como lida.
     */
    @Transactional
    public void marcarMensagemComoLida(Long mensagemId) {
        Mensagem mensagem = mensagemRepository.findByMensagemId(mensagemId);
        if (mensagem == null) {
            throw new EntityNotFoundException("Mensagem não encontrada com id: " + mensagemId);
        }

        mensagem.setLida(true);
        mensagemRepository.save(mensagem);
    }

    /**
     * Exclui uma mensagem.
     */
    @Transactional
    public void excluirMensagem(Long mensagemId) {
        Mensagem mensagem = mensagemRepository.findById(mensagemId)
                .orElseThrow(() -> new EntityNotFoundException("Mensagem não encontrada com o id: " + mensagemId));
        mensagemRepository.delete(mensagem);
    }
}
