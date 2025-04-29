package com.example.authservice.service;

import com.example.authservice.dto.TelegramAuthRequest;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
public class TelegramDataValidator {
    @Value("${telegram.bot.token}")
    private String botToken;

    public boolean validate(TelegramAuthRequest request) {
        try {
            String dataCheckString = buildDataCheckString(request);
            String secretKey = sha256(botToken);
            String computedHash = hmacSha256(secretKey, dataCheckString);
            return computedHash.equals(request.getHash());
        } catch (Exception e) {
            return false;
        }
    }

    private String buildDataCheckString(TelegramAuthRequest request) {
        List<String> fields = new ArrayList<>();
        if (request.getId() != null) fields.add("id=" + request.getId());
        if (request.getFirstName() != null) fields.add("first_name=" + request.getFirstName());
        if (request.getLastName() != null) fields.add("last_name=" + request.getLastName());
        if (request.getUsername() != null) fields.add("username=" + request.getUsername());
        if (request.getPhotoUrl() != null) fields.add("photo_url=" + request.getPhotoUrl());
        if (request.getAuthDate() != null) fields.add("auth_date=" + request.getAuthDate());

        Collections.sort(fields, Comparator.naturalOrder());
        return String.join("\n", fields);
    }

    private String sha256(String data) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(data.getBytes());
        byte[] digest = md.digest();
        return bytesToHex(digest);
    }

    private String hmacSha256(String secretKey, String data) {
        try {
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes());
            return bytesToHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC", e);
        }
    }

    @PostConstruct
    public void validateConfig() {
        if (botToken == null || botToken.equals("your_bot_token_here")) {
            throw new IllegalStateException("Telegram bot token is not configured");
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}