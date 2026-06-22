package com.upizz.ProyectoFinal.services;

import com.upizz.ProyectoFinal.models.Aspirante;
import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Optional;

public interface AspiranteService {
    List<Aspirante> getAllAspirantes();
    Optional<Aspirante> getAspiranteById(Long id);
    Aspirante saveAspirante(Aspirante aspirante);
    void deleteAspirante(Long id);
    boolean existsByEmail(String email);
    Optional<Aspirante> authenticate(String email, String contrasenia);
    void enviarCorreo(String destinatario, String asunto, String mensaje);
    void enviarCorreoMasivo(String asunto, String mensaje);
    void generarConstanciaPdf(Long id, HttpServletResponse response);
}