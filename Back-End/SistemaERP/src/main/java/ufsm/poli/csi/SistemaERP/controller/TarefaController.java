package ufsm.poli.csi.SistemaERP.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ufsm.poli.csi.SistemaERP.dto.TarefaDTO;
import ufsm.poli.csi.SistemaERP.model.Tarefa;
import ufsm.poli.csi.SistemaERP.service.TarefaService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tarefa")
@Tag(name = "Tarefa", description = "Área para operações de CRUD com tarefas")
public class TarefaController {
    private final TarefaService tarefaService;

    public TarefaController(TarefaService tarefaService) {
        this.tarefaService = tarefaService;
    }

    @PostMapping("/salvar")
    public ResponseEntity<?> salvarTarefa(@RequestBody TarefaDTO tarefaDTO) {
        try {
            tarefaService.salvarTarefa(tarefaDTO);
            return ResponseEntity.ok("Tarefa criada com sucesso");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao criar tarefa");
        }
    }

    @GetMapping("/listar")
    public List<TarefaDTO> listarTarefas() {
        return this.tarefaService.listarTarefas().stream().
                map(TarefaDTO::new).collect(Collectors.toList());
    }

    @PutMapping("/atualizarTarefa")
    public ResponseEntity<Tarefa> atualizarTarefa(@RequestBody TarefaDTO tarefaDTO) {
        this.tarefaService.atualizarTarefa(tarefaDTO);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/deletarTarefa/{id}")
    public ResponseEntity deletarTarefa(@PathVariable Long id) {
        try {
            this.tarefaService.excluirTarefa(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Retorna erro 409 (conflito) informando que a tarefa está vinculado a outros registros
            return ResponseEntity.status(409).body("Não foi possível excluir a tarefa, pois " +
                    "ela está vinculado a uma ou mais sessões.");
        } catch (Exception e) {
            // Retorna um erro 500 para qualquer outro erro inesperado
            return ResponseEntity.status(500).body("Erro interno ao tentar excluir a tarefa");
        }
    }
}
