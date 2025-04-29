package com.example.authservice.controller;

import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.TelegramAuthRequest;
import com.example.authservice.exception.InvalidTelegramDataException;
import com.example.authservice.service.TelegramAuthService;
import com.example.authservice.service.TelegramDataValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final TelegramAuthService authService;
    private final TelegramDataValidator validator;

    @PostMapping("/telegram")
    public ResponseEntity<AuthResponse> authenticate(
            @RequestBody TelegramAuthRequest request,
            @RequestHeader(value = "User-Agent", required = false) String userAgent) {

        log.info("Auth request from: {}", userAgent != null ? userAgent : "unknown client");

        if (!validator.validate(request)) {
            log.warn("Invalid Telegram data for user: {}", request.getUsername());
            throw new InvalidTelegramDataException("Invalid authentication data");
        }

        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
}