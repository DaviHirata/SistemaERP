package ufsm.poli.csi.SistemaERP.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ufsm.poli.csi.SistemaERP.dto.SessaoDTO;
import ufsm.poli.csi.SistemaERP.model.Sessao;
import ufsm.poli.csi.SistemaERP.service.SessaoService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sessao")
@Tag(name = "Sessão", description = "Área para operações de CRUD com sessões")
public class SessaoController {
    private final SessaoService sessaoService;

    public SessaoController(SessaoService sessaoService) {
        this.sessaoService = sessaoService;
    }

    @PostMapping("/iniciar")
    public ResponseEntity<?> iniciarSessao(@RequestBody SessaoDTO sessaoDTO) {
        try {
            sessaoService.iniciarSessao(sessaoDTO);
            return ResponseEntity.ok("Sessão iniciada");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao iniciar sessão");
        }
    }

    @GetMapping("/listar")
    public List<SessaoDTO> listarSessoes() {
        return this.sessaoService.listarSessoes().stream().
                map(SessaoDTO::new).collect(Collectors.toList());
    }

    @PutMapping("/encerrar")
    public ResponseEntity<Sessao> encerrarSessao(@RequestBody Sessao sessao) {
        this.sessaoService.encerrarSessao(sessao.getSessaoId());
        return ResponseEntity.ok(sessao);
    }

    @DeleteMapping("/deletarSessao/{id}")
    public ResponseEntity deletarSessao(@PathVariable Long id) {
        try {
            this.sessaoService.excluirSessao(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Retornar erro 409 (conflito) informando que a sessão está vinculada a outros registros
            return ResponseEntity.status(409).body("Não foi possível excluir a sessão, pois " +
                    "ela está vinculado a um ou mais intervalos.");
        } catch (Exception e) {
            // Retorna um erro 500 para qualquer outro erro inesperado
            return ResponseEntity.status(500).body("Erro interno ao tentar excluir a sessão");
        }
    }

    @PutMapping("/validarSessao/{id}")
    public ResponseEntity<Void> validarSessao(@PathVariable Long id, @RequestParam String acao) {
        this.sessaoService.validarSessao(id, acao);
        return ResponseEntity.ok().build();
    }
}
