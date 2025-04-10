package com.example.telegrambot;

import com.example.telegrambot.BotConfig.BotConfig;
import com.example.telegrambot.handler.CommandHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

@Component
public class NotifyBot extends TelegramLongPollingBot {
    private static final Logger logger = LoggerFactory.getLogger(NotifyBot.class);
    private final BotConfig botConfig;
    private final CommandHandler commandHandler;

    public NotifyBot(BotConfig botConfig, CommandHandler commandHandler) {
        super(botConfig.getToken());
        this.botConfig = botConfig;
        this.commandHandler = commandHandler;
    }

    @Override
    public String getBotUsername() {
        return botConfig.getUsername();
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            String response = commandHandler.handleCommand(messageText);
            sendResponse(chatId, response);
        }
    }

    private void sendResponse(long chatId, String text) {
        SendMessage message = new SendMessage();
        message.setChatId(String.valueOf(chatId));
        message.setText(text);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Error sending message", e);
        }
    }
}