package com.example.telegrambot.handler.commands;

import com.example.telegrambot.handler.CommandHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class WebAppCommand implements CommandHandler.Command {
    private final String websiteUrl;
    private String authRedirectPath;

    public WebAppCommand(
            @Value("${website.url}") String websiteUrl) {
        this.websiteUrl = websiteUrl;
        this.authRedirectPath = authRedirectPath;
    }

    @Override
    public String execute() {
        String url = websiteUrl + authRedirectPath;
        return "WEBAPP:" + url;
    }
}