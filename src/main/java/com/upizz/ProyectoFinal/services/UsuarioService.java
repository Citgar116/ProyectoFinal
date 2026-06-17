package com.upizz.ProyectoFinal.services;


import com.upizz.ProyectoFinal.models.Usuario;

import java.util.Optional;

public interface UsuarioService {
    Optional<Usuario> authenticate(String usuario, String contrasenia);
}
