
package com.example.notifybot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;
import org.springframework.boot.CommandLineRunner;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

@SpringBootApplication
public class NotifyBotApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotifyBotApplication.class, args);
    }

    private void printProperties(Environment env) {
        System.out.println("Checking application.properties...");
        System.out.println("bot.token from environment: " + env.getProperty("bot.token"));
        System.out.println("bot.username from environment: " + env.getProperty("bot.username"));
    }

    @Bean
    public CommandLineRunner commandLineRunner(Environment env, NotifyBot notifyBot) {
        return args -> {
            printProperties(env);
            System.out.println("Starting manual bot registration...");
            try {
                TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
                System.out.println("TelegramBotsApi initialized successfully.");
                botsApi.registerBot(notifyBot);
                System.out.println("Bot manually registered with Telegram!");
            } catch (TelegramApiException e) {
                System.err.println("Failed to manually register bot: " + e.getMessage());
                e.printStackTrace();
            } catch (Exception e) {
                System.err.println("Unexpected error during bot registration: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}

