package com.upizz.ProyectoFinal.config;

import com.upizz.ProyectoFinal.models.Carrera;
import com.upizz.ProyectoFinal.models.Usuario;
import com.upizz.ProyectoFinal.repositories.CarreraRepository;
import com.upizz.ProyectoFinal.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Carga datos iniciales al arrancar si la base de datos está vacía.
 * Es idempotente: solo inserta cuando no existen registros previos.
 */
@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(UsuarioRepository usuarioRepository, CarreraRepository carreraRepository) {
        return args -> {
            // Usuario administrador por defecto (se crea si no existe uno llamado "admin")
            if (usuarioRepository.findByUsuario("admin").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setUsuario("admin");
                admin.setContrasenia("admin123");
                usuarioRepository.save(admin);
                System.out.println("[DataInitializer] Usuario admin creado (admin / admin123).");
            }

            // Carreras iniciales (UPIIZ)
            if (carreraRepository.count() == 0) {
                String[][] carreras = {
                        {"Ingeniería en Sistemas Computacionales", "9", "Desarrollo de software y sistemas."},
                        {"Ingeniería Mecatrónica", "9", "Integración de mecánica, electrónica y control."},
                        {"Ingeniería en Inteligencia Artificial", "9", "Aprendizaje automático y ciencia de datos."},
                        {"Ingeniería en Alimentos", "9", "Procesamiento y conservación de alimentos."},
                        {"Ingeniería Farmacéutica", "9", "Producción y control de fármacos."},
                        {"Ingeniería Aeronáutica", "9", "Diseño y mantenimiento de aeronaves."}
                };
                for (String[] c : carreras) {
                    Carrera carrera = new Carrera();
                    carrera.setNombre(c[0]);
                    carrera.setSemestres(Integer.parseInt(c[1]));
                    carrera.setObservaciones(c[2]);
                    carreraRepository.save(carrera);
                }
                System.out.println("[DataInitializer] " + carreras.length + " carreras iniciales creadas.");
            }
        };
    }
}
