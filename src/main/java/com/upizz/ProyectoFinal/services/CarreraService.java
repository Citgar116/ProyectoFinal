package com.upizz.ProyectoFinal.services;

import com.upizz.ProyectoFinal.models.Carrera;

import java.util.List;
import java.util.Optional;

public interface CarreraService {
    List<Carrera> getAllCarreras();
    Optional<Carrera> getCarreraById(Long id);
    Carrera saveCarrera(Carrera carrera);
    Carrera updateCarrera(Long id, Carrera carreraDetails);
    void deleteCarrera(Long id);
}
