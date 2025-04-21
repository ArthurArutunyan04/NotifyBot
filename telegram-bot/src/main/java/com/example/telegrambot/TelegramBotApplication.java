package com.example.telegrambot;

import com.example.telegrambot.BotConfig.BotConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@SpringBootApplication
public class TelegramBotApplication {
    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(TelegramBotApplication.class, args);
        registerBot(context);
    }

    private static void registerBot(ApplicationContext context) {
        try {
            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            botsApi.registerBot(context.getBean(NotifyBot.class));
        } catch (Exception e) {
            throw new RuntimeException("Failed to register bot", e);
        }
    }
}