package com.example.authservice.controller;

import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.TelegramAuthRequest;
import com.example.authservice.service.TelegramAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final TelegramAuthService authService;

    @PostMapping("/telegram")
    public ResponseEntity<AuthResponse> authenticate(@RequestBody TelegramAuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }
}