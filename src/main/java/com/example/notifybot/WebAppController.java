package com.example.notifybot;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webapp")
public class WebAppController {

    @PostMapping("/handle")
    public ResponseEntity<String> handleRequest(
            @RequestBody String data,
            @RequestHeader(value = "Telegram-Init-Data", required = false) String initData
    ) {
        System.out.println("Received data: " + data);
        System.out.println("Telegram initData: " + (initData != null ? "present" : "null"));

        return ResponseEntity.ok()
                .header("Access-Control-Allow-Origin", "https://notify-bot-frontend.onrender.com")
                .body("Данные получены: " + data.toUpperCase());
    }

    @GetMapping("/healthcheck")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Server is UP");
    }
}