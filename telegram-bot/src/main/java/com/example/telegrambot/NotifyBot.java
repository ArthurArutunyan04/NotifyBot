package com.example.telegrambot;

import com.example.telegrambot.BotConfig.BotConfig;
import com.example.telegrambot.handler.CommandHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.List;

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

            if (response.startsWith("WEBAPP:")) {
                sendWebAppLink(chatId, response.replace("WEBAPP:", ""));
            } else {
                sendTextMessage(chatId, response);
            }
        }
    }

    private void sendWebAppLink(Long chatId, String url) {
        try {
            if (url == null || url.isBlank()) {
                sendTextMessage(chatId, "Веб-приложение временно недоступно");
                return;
            }
            InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
            InlineKeyboardButton button = new InlineKeyboardButton();

            button.setText("Открыть веб-приложение 🌐");
            button.setUrl(url);

            keyboard.setKeyboard(List.of(List.of(button)));

            SendMessage message = SendMessage.builder()
                    .chatId(chatId.toString())
                    .text("Нажмите кнопку ниже, чтобы открыть веб-версию:")
                    .replyMarkup(keyboard)
                    .build();

            execute(message);
        } catch (TelegramApiException e) {
            logger.error("Failed to send webapp link", e);
        }
    }

    private void sendTextMessage(Long chatId, String text) {
        try {
            execute(SendMessage.builder()
                    .chatId(chatId.toString())
                    .text(text)
                    .build());
        } catch (TelegramApiException e) {
            logger.error("Failed to send message", e);
        }
    }
}