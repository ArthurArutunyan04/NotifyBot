package com.example.notifybot;

import org.springframework.stereotype.Component;

@Component
public class CommandHandler {

    public String handleCommand(String command) {
        switch (command.toLowerCase()) {
            case "/start":
                return "Привет, используй команды: /start, /hello, /bye";
            case "/hello":
                return "Привет!";
            case "/bye":
                return "Пока!";
            default:
                return "Я понимаю только команды: /start, /hello, /bye";
        }
    }

    public String getWebAppResponse(String data) {
        return "WebApp says: " + data.toUpperCase();
    }
}