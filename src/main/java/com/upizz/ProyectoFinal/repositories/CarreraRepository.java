package com.upizz.ProyectoFinal.repositories;


import com.upizz.ProyectoFinal.models.Carrera;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarreraRepository extends JpaRepository<Carrera, Long> {
}
