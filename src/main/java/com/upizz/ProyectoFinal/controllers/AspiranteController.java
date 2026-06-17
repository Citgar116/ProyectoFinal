package com.upizz.ProyectoFinal.controllers;

import com.upizz.ProyectoFinal.models.Aspirante;
import com.upizz.ProyectoFinal.services.AspiranteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/aspirantes")
public class AspiranteController {

    @Autowired
    private AspiranteService aspiranteService;

    @GetMapping
    public ResponseEntity<List<Aspirante>> getAllAspirantes() {
        return new ResponseEntity<>(aspiranteService.getAllAspirantes(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Aspirante> getAspiranteById(@PathVariable Long id) {
        Optional<Aspirante> aspirante = aspiranteService.getAspiranteById(id);
        return aspirante.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<?> createAspirante(@RequestBody Aspirante aspirante) {
        if (aspiranteService.existsByEmail(aspirante.getEmail())) {
            return new ResponseEntity<>("El correo electrónico ya está registrado.", HttpStatus.BAD_REQUEST);
        }
        Aspirante nuevoAspirante = aspiranteService.saveAspirante(aspirante);
        return new ResponseEntity<>(nuevoAspirante, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAspirante(@PathVariable Long id) {
        aspiranteService.deleteAspirante(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/validar-email")
    public ResponseEntity<Boolean> validateEmail(@RequestParam String email) {
        boolean exists = aspiranteService.existsByEmail(email);
        return new ResponseEntity<>(exists, HttpStatus.OK);
    }
}
