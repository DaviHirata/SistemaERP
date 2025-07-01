package ufsm.poli.csi.SistemaERP.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ufsm.poli.csi.SistemaERP.dto.MensagemDTO;
import ufsm.poli.csi.SistemaERP.service.MensagemService;

import java.util.List;

@RestController
@RequestMapping("/mensagem")
@Tag(name = "Mensagem", description = "Área para operações com mensagens e notificações")
public class MensagemController {

    private final MensagemService mensagemService;

    public MensagemController(MensagemService mensagemService) {
        this.mensagemService = mensagemService;
    }

    @PostMapping("/salvar")
    public ResponseEntity<?> salvarMensagem(@RequestBody @Valid MensagemDTO dto) {
        try {
            mensagemService.salvarMensagem(dto);
            return ResponseEntity.ok("Mensagem enviada com sucesso.");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao salvar a mensagem.");
        }
    }

    @GetMapping("/listar/{usuarioId}")
    public ResponseEntity<List<MensagemDTO>> listarMensagens(@PathVariable Long usuarioId) {
        try {
            List<MensagemDTO> mensagens = mensagemService.listarMensagensPorUsuario(usuarioId);
            return ResponseEntity.ok(mensagens);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/naoLidas/{usuarioId}")
    public ResponseEntity<List<MensagemDTO>> listarMensagensNaoLidas(@PathVariable Long usuarioId) {
        try {
            List<MensagemDTO> mensagens = mensagemService.listarNaoLidas(usuarioId);
            return ResponseEntity.ok(mensagens);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("/marcarComoLida/{mensagemId}")
    public ResponseEntity<?> marcarComoLida(@PathVariable Long mensagemId) {
        try {
            mensagemService.marcarMensagemComoLida(mensagemId);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mensagem não encontrada.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao marcar como lida.");
        }
    }

    @DeleteMapping("/deletar/{mensagemId}")
    public ResponseEntity<?> deletarMensagem(@PathVariable Long mensagemId) {
        try {
            mensagemService.excluirMensagem(mensagemId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Mensagem não encontrada.");
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Mensagem vinculada a outros registros.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao deletar mensagem.");
        }
    }
}
