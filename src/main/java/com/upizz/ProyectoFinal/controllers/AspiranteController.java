package com.upizz.ProyectoFinal.controllers;

import com.upizz.ProyectoFinal.models.Aspirante;
import com.upizz.ProyectoFinal.services.AspiranteService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
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
        return aspiranteService.getAspiranteById(id)
                .map(aspirante -> new ResponseEntity<>(aspirante, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Único método POST base para registro público de aspirantes
    @PostMapping
    public ResponseEntity<String> registrarAspirante(@RequestBody Aspirante aspirante) {
        if (aspirante.getEmail() != null && aspiranteService.existsByEmail(aspirante.getEmail())) {
            return new ResponseEntity<>("El correo ya está registrado", HttpStatus.CONFLICT);
        }
        if (aspirante.getFechaRegistro() == null || aspirante.getFechaRegistro().isBlank()) {
            aspirante.setFechaRegistro(java.time.LocalDate.now().toString());
        }
        aspiranteService.saveAspirante(aspirante);
        return new ResponseEntity<>("Registro exitoso", HttpStatus.CREATED);
    }

    // Login de aspirantes (por correo)
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Aspirante loginRequest) {
        if (loginRequest.getEmail() == null || loginRequest.getEmail().isBlank()
                || loginRequest.getContrasenia() == null || loginRequest.getContrasenia().isBlank()) {
            return new ResponseEntity<>("Credenciales invalidas", HttpStatus.UNAUTHORIZED);
        }
        Optional<Aspirante> aspirante = aspiranteService.authenticate(loginRequest.getEmail(), loginRequest.getContrasenia());
        if (aspirante.isPresent()) {
            return new ResponseEntity<>("ASPIRANTE", HttpStatus.OK);
        }
        return new ResponseEntity<>("Credenciales invalidas", HttpStatus.UNAUTHORIZED);
    }

    @PostMapping("/enviar-correo")
    public ResponseEntity<String> enviarCorreo(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String asunto = request.get("asunto");
        String mensaje = request.get("mensaje");

        aspiranteService.enviarCorreo(email, asunto, mensaje);
        return new ResponseEntity<>("Correo enviado correctamente", HttpStatus.OK);
    }

    // Corregido a /validar-email y conectando con existsByEmail
    @GetMapping("/validar-email")
    public ResponseEntity<Boolean> validarEmail(@RequestParam String email) {
        boolean existe = aspiranteService.existsByEmail(email);
        return new ResponseEntity<>(existe, HttpStatus.OK);
    }

    @PostMapping("/correo-masivo")
    public ResponseEntity<String> enviarCorreoMasivo(@RequestBody Map<String, String> request) {
        String asunto = request.get("asunto");
        String mensaje = request.get("mensaje");

        aspiranteService.enviarCorreoMasivo(asunto, mensaje);
        return new ResponseEntity<>("Correos masivos enviados correctamente", HttpStatus.OK);
    }

    @GetMapping("/pdf/{id}")
    public void generarConstancia(@PathVariable Long id, HttpServletResponse response) {
        aspiranteService.generarConstanciaPdf(id, response);
    }
}