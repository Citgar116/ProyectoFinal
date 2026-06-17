package com.upizz.ProyectoFinal.controllers;


import com.upizz.ProyectoFinal.models.Carrera;
import com.upizz.ProyectoFinal.services.CarreraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/carreras")
public class CarreraController {

    @Autowired
    private CarreraService carreraService;

    @GetMapping
    public ResponseEntity<List<Carrera>> getAllCarreras() {
        List<Carrera> carreras = carreraService.getAllCarreras();
        return new ResponseEntity<>(carreras, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Carrera> getCarreraById(@PathVariable Long id) {
        Optional<Carrera> carrera = carreraService.getCarreraById(id);
        return carrera.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<Carrera> createCarrera(@RequestBody Carrera carrera) {
        Carrera nuevaCarrera = carreraService.saveCarrera(carrera);
        return new ResponseEntity<>(nuevaCarrera, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Carrera> updateCarrera(@PathVariable Long id, @RequestBody Carrera carrera) {
        Carrera carreraActualizada = carreraService.updateCarrera(id, carrera);
        if (carreraActualizada != null) {
            return new ResponseEntity<>(carreraActualizada, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCarrera(@PathVariable Long id) {
        carreraService.deleteCarrera(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
