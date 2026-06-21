package com.upizz.ProyectoFinal.controllers;

import com.upizz.ProyectoFinal.models.Usuario;
import com.upizz.ProyectoFinal.models.Aspirante;
import com.upizz.ProyectoFinal.services.AspiranteService;
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

    @Autowired
    private AspiranteService aspiranteService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Usuario loginRequest) {
        Optional<Usuario> usuario = usuarioService.authenticate(loginRequest.getUsuario(), loginRequest.getContrasenia());
        if (usuario.isPresent()) {
            return new ResponseEntity<>("ADMIN", HttpStatus.OK);
        }

       Optional<Aspirante> aspirante = aspiranteService.authenticate(loginRequest.getUsuario(), loginRequest.getContrasenia());
        if (aspirante.isPresent()){
            return new ResponseEntity<>("ASPIRANTE", HttpStatus.OK);
        }

        return new ResponseEntity<>("Credenciales invalidas", HttpStatus.UNAUTHORIZED);
    }
    //Funciona bien, pero cuando exista código requerirá
    //cambios
}
