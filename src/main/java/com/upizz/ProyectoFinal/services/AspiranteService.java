package com.upizz.ProyectoFinal.services;

import com.upizz.ProyectoFinal.models.Aspirante;

import java.util.List;
import java.util.Optional;

public interface AspiranteService {
    List<Aspirante> getAllAspirantes();
    Optional<Aspirante> getAspiranteById(Long id);
    Aspirante saveAspirante(Aspirante aspirante);
    void deleteAspirante(Long id);
    boolean existsByEmail(String email);
    Optional<Aspirante> authenticate(String email, String contrasenia);
}
