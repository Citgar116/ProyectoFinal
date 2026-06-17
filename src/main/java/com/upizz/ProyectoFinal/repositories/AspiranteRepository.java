package com.upizz.ProyectoFinal.repositories;

import com.upizz.ProyectoFinal.models.Aspirante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AspiranteRepository extends JpaRepository<com.upizz.ProyectoFinal.models.Aspirante, Long> {
    Optional<Aspirante> findByEmail(String email);
    boolean existsByEmail(String email);
}
