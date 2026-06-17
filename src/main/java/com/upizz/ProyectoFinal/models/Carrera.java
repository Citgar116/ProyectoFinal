package com.upizz.ProyectoFinal.models;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "carreras")
public class Carrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String nombre;

    @Column(nullable = false)
    private Integer semestres;

    @Column(length = 500)
    private String observaciones;

    @OneToMany(mappedBy = "carrera", cascade = CascadeType.ALL)
    private List<Aspirante> aspirantes;

    public Carrera() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public Integer getSemestres() { return semestres; }
    public void setSemestres(Integer semestres) { this.semestres = semestres; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public List<Aspirante> getAspirantes() { return aspirantes; }
    public void setAspirantes(List<Aspirante> aspirantes) { this.aspirantes = aspirantes; }
}
