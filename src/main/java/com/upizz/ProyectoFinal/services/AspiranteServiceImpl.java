package com.upizz.ProyectoFinal.services;

import com.upizz.ProyectoFinal.models.Aspirante;
import com.upizz.ProyectoFinal.repositories.AspiranteRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.io.OutputStream;
import java.util.List;
import java.util.Optional;

@Service
public class AspiranteServiceImpl implements AspiranteService {

    @Autowired
    private AspiranteRepository aspiranteRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Override
    public List<Aspirante> getAllAspirantes() {
        return aspiranteRepository.findAll();
    }

    @Override
    public Optional<Aspirante> getAspiranteById(Long id) {
        return aspiranteRepository.findById(id);
    }

    @Override
    public Aspirante saveAspirante(Aspirante aspirante) {
        return aspiranteRepository.save(aspirante);
    }

    @Override
    public void deleteAspirante(Long id) {
        aspiranteRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return aspiranteRepository.existsByEmail(email);
    }

    @Override
    public Optional<Aspirante> authenticate(String email, String contrasenia) {
        return aspiranteRepository.findByEmailAndContrasenia(email, contrasenia);
    }

    @Override
    public void enviarCorreo(String destinatario, String asunto, String mensaje) {
        if (mailSender != null) {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(destinatario);
            mail.setSubject(asunto);
            mail.setText(mensaje);
            mailSender.send(mail);
        }
    }

    @Override
    public void enviarCorreoMasivo(String asunto, String mensaje) {
        List<Aspirante> aspirantes = aspiranteRepository.findAll();
        for (Aspirante a : aspirantes) {
            enviarCorreo(a.getEmail(), asunto, mensaje);
        }
    }

    @Override
    public void generarConstanciaPdf(Long id, HttpServletResponse response) {
        Aspirante aspirante = aspiranteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Aspirante no encontrado"));

        try {
            response.setContentType("application/pdf");
            response.setHeader("Content-Disposition", "inline; filename=Constancia_" + aspirante.getId() + ".pdf");

            OutputStream out = response.getOutputStream();
            Document document = new Document(PageSize.LETTER, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);

            document.open();

            // CARGA DE IMAGEN CORREGIDA CON EL NOMBRE QUE TIENES EN TU PROYECTO (ipn_logo.jpg)
            try {
                ClassPathResource imgFile = new ClassPathResource("static/assets/img/ipn_logo.jpg");
                if (imgFile.exists()) {
                    com.itextpdf.text.Image logo = com.itextpdf.text.Image.getInstance(imgFile.getInputStream().readAllBytes());
                    logo.scaleToFit(120, 120);
                    logo.setAlignment(com.itextpdf.text.Element.ALIGN_CENTER);
                    document.add(logo);
                } else {
                    System.err.println("Advertencia: No se encontró el archivo ipn_logo.jpg en la ruta especificada.");
                }
            } catch (Exception e) {
                System.err.println("Error al cargar la imagen: " + e.getMessage());
            }

            // FUENTES Y CONTENIDO
            Font fontTitulo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font fontTexto = FontFactory.getFont(FontFactory.HELVETICA, 12);
            Font fontNegrita = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            Paragraph header = new Paragraph("\nINSTITUTO POLITÉCNICO NACIONAL\nUPIIZ - UNIDAD PROFESIONAL INTERDISCIPLINARIA DE INGENIERÍA\nCAMPUS ZACATECAS", fontTitulo);
            header.setAlignment(Element.ALIGN_CENTER);
            document.add(header);

            document.add(new Paragraph("\n\n"));
            Paragraph titulo = new Paragraph("CONSTANCIA DE REGISTRO", fontTitulo);
            titulo.setAlignment(Element.ALIGN_CENTER);
            document.add(titulo);

            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("A QUIEN CORRESPONDA:", fontNegrita));
            document.add(new Paragraph("\nPor medio de la presente, se hace constar que el(la) alumno(a):", fontTexto));

            Paragraph nombre = new Paragraph(aspirante.getNombre().toUpperCase(), fontNegrita);
            nombre.setAlignment(Element.ALIGN_CENTER);
            document.add(nombre);

            document.add(new Paragraph("\nSe encuentra debidamente registrado(a) en el sistema SIRESE. Se emite la presente a solicitud del interesado para los fines legales que considere convenientes.", fontTexto));
            document.add(new Paragraph("\n\nFecha de emisión: " + java.time.LocalDate.now(), fontTexto));
            document.add(new Paragraph("\n\n\n\n\nATENTAMENTE,", fontNegrita));
            document.add(new Paragraph("DEPARTAMENTO DE CONTROL ESCOLAR\nSIRESE - UPIIZ", fontTexto));

            document.close();
            out.flush();
            out.close();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error fatal al generar el PDF: " + e.getMessage());
        }
    }
}