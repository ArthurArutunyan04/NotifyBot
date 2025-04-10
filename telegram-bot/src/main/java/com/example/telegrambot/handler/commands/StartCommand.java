package com.example.telegrambot.handler.commands;

import com.example.telegrambot.handler.CommandHandler;

public class StartCommand implements CommandHandler.Command {
    @Override
    public String execute() {
        return "Привет! Я бот для управления задачами. Используй /help для списка команд";
    }
}