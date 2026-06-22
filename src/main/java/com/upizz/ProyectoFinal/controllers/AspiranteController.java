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

    @PostMapping("/enviar-correo")
    public ResponseEntity<String> enviarCorreo(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String asunto = request.get("asunto");
        String mensaje = request.get("mensaje");

        aspiranteService.enviarCorreo(email, asunto, mensaje);
        return new ResponseEntity<>("Correo enviado correctamente", HttpStatus.OK);
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