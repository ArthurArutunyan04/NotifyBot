package com.example.telegrambot.handler.commands;

import com.example.telegrambot.handler.CommandHandler;

public class HelpCommand implements CommandHandler.Command {
    @Override
    public String execute() {
        return """
            Доступные команды:
            /start - Начать работу с ботом
            /webapp - открыть Web приложение
            /help - Показать это сообщение
            """;
    }
}