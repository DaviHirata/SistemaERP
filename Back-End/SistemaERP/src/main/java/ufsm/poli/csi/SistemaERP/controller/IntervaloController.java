package ufsm.poli.csi.SistemaERP.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ufsm.poli.csi.SistemaERP.dto.IntervaloDTO;
import ufsm.poli.csi.SistemaERP.model.Intervalo;
import ufsm.poli.csi.SistemaERP.service.IntervaloService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/intervalo")
@Tag(name = "Intervalo", description = "Área para operações CRUD com intervalos")
public class IntervaloController {
    private final IntervaloService intervaloService;

    public IntervaloController(IntervaloService intervaloService) {
        this.intervaloService = intervaloService;
    }

    @PostMapping("/pausar")
    public ResponseEntity<?> iniciarPausa(@RequestBody IntervaloDTO intervaloDTO) {
        try {
            intervaloService.iniciarIntervalo(intervaloDTO);
            return ResponseEntity.ok("Intervalo iniciado");
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erro ao iniciar intervalo");
        }
    }

    @GetMapping("/listar")
    public List<IntervaloDTO> listarIntervalos() {
        return this.intervaloService.listarIntervalos().stream().
                map(IntervaloDTO::new).collect(Collectors.toList());
    }

    @PutMapping("/retomar")
    public ResponseEntity<Intervalo> encerrarIntervalo(@RequestBody Intervalo intervalo) {
        this.intervaloService.encerrarIntervalo(intervalo.getIntervaloId());
        return ResponseEntity.ok(intervalo);
    }

    @DeleteMapping("/deletarIntervalo/{id}")
    public ResponseEntity deletarIntervalo(@PathVariable Long id) {
        try {
            this.intervaloService.excluirIntervalo(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Retornar erro 409 (conflito) informando que a sessão está vinculada a outros registros
            return ResponseEntity.status(409).body("Não foi possível excluir o intervalo.");
        }catch (Exception e) {
            // Retorna um erro 500 para qualquer outro erro inesperado
            return ResponseEntity.status(500).body("Erro interno ao tentar excluir o intervalo");
        }
    }
}
