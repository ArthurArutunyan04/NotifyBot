package com.example.authservice.service;

import com.example.authservice.dto.AuthResponse;
import com.example.authservice.dto.TelegramAuthRequest;
import com.example.authservice.exception.InvalidTelegramDataException;
import com.example.authservice.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TelegramAuthService {
    private final TelegramDataValidator validator;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse authenticate(TelegramAuthRequest request) {
        if (!validator.validate(request)) {
            throw new InvalidTelegramDataException("Invalid Telegram data");
        }

        Long userId = Long.parseLong(String.valueOf(request.getId()));
        String token = tokenProvider.generateToken(userId);
        return new AuthResponse(token, request.getUsername());
    }
}