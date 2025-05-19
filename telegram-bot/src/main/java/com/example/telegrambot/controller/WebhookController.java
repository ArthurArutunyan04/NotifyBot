package com.example.telegrambot.controller;

import com.example.telegrambot.NotifyBot;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.objects.Update;

@RestController
@RequestMapping("/api/v1/telegram")
public class WebhookController {

    private final NotifyBot notifyBot;

    @Autowired
    public WebhookController(NotifyBot notifyBot) {
        this.notifyBot = notifyBot;
    }

    @PostMapping("/webhook")
    public BotApiMethod<?> handleWebhook(@RequestBody Update update) {
        return notifyBot.onWebhookUpdateReceived(update);
    }
}