package com.upizz.ProyectoFinal.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping("/")
    public String index() {
        return "login";
    }

    @GetMapping("/registro")
    public String registro() {
        return "index";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/admin")
    public String admin() {
        return "admin";
    }

    @GetMapping("/carreras")
    public String carreras() {
        return "carreras";
    }

    @GetMapping("/aspirantes")
    public String aspirantes() {
        return "aspirantes";
    }

    @GetMapping("/constancias")
    public String constancias() {
        return "constancias";
    }
}
