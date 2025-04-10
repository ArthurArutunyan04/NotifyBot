package com.example.telegrambot.handler.commands;

import com.example.telegrambot.handler.CommandHandler.Command;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class WebsiteCommand implements Command {

    @Value("${website.url}")
    private String websiteUrl;

    @Override
    public String execute() {
        return "WEBAPP:" + websiteUrl;
    }
}