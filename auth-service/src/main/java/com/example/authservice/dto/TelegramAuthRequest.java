package com.example.authservice.dto;

import lombok.Data;

@Data
public class TelegramAuthRequest {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String photoUrl;
    private String authDate;
    private String hash;
}