package com.example.notifybot;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/webapp")
public class WebAppController {

    @PostMapping("/handle")
    public ResponseEntity<String> handleWebAppData(@RequestBody String data) {
        // Обработка данных из Web App
        return ResponseEntity.ok("Processed: " + data);
    }

    @GetMapping("/config")
    public ResponseEntity<String> getBotConfig() {
        return ResponseEntity.ok("Web App connected!");
    }
}