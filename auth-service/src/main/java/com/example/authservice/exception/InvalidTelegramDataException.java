package com.example.authservice.exception;

public class InvalidTelegramDataException extends RuntimeException {
    public InvalidTelegramDataException(String message) {
        super(message);
    }
}