package ufsm.poli.csi.SistemaERP.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import ufsm.poli.csi.SistemaERP.dto.RelatorioUsuarioDTO;
import ufsm.poli.csi.SistemaERP.dto.UsuarioDTO;
import ufsm.poli.csi.SistemaERP.model.Usuario;
import ufsm.poli.csi.SistemaERP.service.UsuarioService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/usuario")
@Tag(name = "Usuarios", description = "Área para operações CRUD com usuários")
public class UsuarioController {
    private UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/cadastrar")
    public ResponseEntity salvarUsuario(@RequestBody @Valid Usuario usuario) {
        this.usuarioService.salvarUsuario(usuario);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/listar")
    public List<Usuario> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }

    @GetMapping("/buscarUsuario/{usuarioId}")
    public ResponseEntity<Usuario> buscarUsuarioPorId(@PathVariable Long usuarioId) {
        Usuario usuario = usuarioService.buscarUsuarioPorId(usuarioId);
        return ResponseEntity.ok(usuario);
    }

    @PutMapping("/atualizarUsuario")
    public ResponseEntity atualizarUsuario(@RequestBody Usuario usuario) {
        this.usuarioService.atualizarUsuario(usuario);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/relatorio")
    public ResponseEntity<List<RelatorioUsuarioDTO>> gerarRelatorio(
            @RequestParam("dataInicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam("dataFim") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim) {
        List<RelatorioUsuarioDTO> relatorio = usuarioService.gerarRelatorio(dataInicio, dataFim);
        return ResponseEntity.ok(relatorio);
    }

    @DeleteMapping("/deletarUsuario/{id}")
    public ResponseEntity deletarUsuario(@PathVariable Long id) {
        try {
            this.usuarioService.excluirUsuario(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Retorna erro 409 (conflito) informando que o usuário está vinculado a outros registros
            return ResponseEntity.status(409).body("Não foi possível excluir o usuário, pois " +
                    "este usuário está vinculado a uma ou mais tarefas.");
        } catch (Exception e) {
            // Retorna um erro 500 para qualquer outro erro inesperado
            return ResponseEntity.status(500).body("Erro interno ao tentar excluir o usuário");
        }
    }
}
