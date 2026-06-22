package com.upizz.ProyectoFinal.repositories;

import com.upizz.ProyectoFinal.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuarioAndContrasenia(String usuario, String contrasenia);
    Optional<Usuario> findByUsuario(String usuario);
}
