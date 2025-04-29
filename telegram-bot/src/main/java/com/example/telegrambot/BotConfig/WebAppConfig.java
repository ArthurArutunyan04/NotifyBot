package com.example.telegrambot.BotConfig;

import com.example.telegrambot.handler.commands.WebAppCommand;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebAppConfig {
    @Bean
    public WebAppCommand webAppCommand(@Value("${website.url}") String websiteUrl) {
        return new WebAppCommand(websiteUrl);
    }
}