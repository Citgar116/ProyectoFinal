package com.upizz.ProyectoFinal.controllers;

import com.upizz.ProyectoFinal.models.Usuario;
import com.upizz.ProyectoFinal.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Login de administradores. Si no coincide, el front-end reintenta
    // contra /api/aspirantes/login.
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Usuario loginRequest) {
        if (loginRequest.getUsuario() == null || loginRequest.getUsuario().isBlank()
                || loginRequest.getContrasenia() == null || loginRequest.getContrasenia().isBlank()) {
            return new ResponseEntity<>("Credenciales invalidas", HttpStatus.UNAUTHORIZED);
        }
        Optional<Usuario> usuario = usuarioService.authenticate(loginRequest.getUsuario(), loginRequest.getContrasenia());
        if (usuario.isPresent()) {
            return new ResponseEntity<>("ADMIN", HttpStatus.OK);
        }
        return new ResponseEntity<>("Credenciales invalidas", HttpStatus.UNAUTHORIZED);
    }
}
