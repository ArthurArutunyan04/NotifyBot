package com.example.telegrambot;

import com.example.telegrambot.BotConfig.BotConfig;
import com.example.telegrambot.handler.CommandHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.telegram.telegrambots.bots.TelegramWebhookBot;
import org.telegram.telegrambots.meta.api.methods.BotApiMethod;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import org.telegram.telegrambots.meta.api.objects.webapp.WebAppInfo;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;

import java.util.List;

@Component
public class NotifyBot extends TelegramWebhookBot {
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
    public String getBotPath() {
        return "/api/v1/telegram/webhook";
    }

    @Override
    public BotApiMethod<?> onWebhookUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            String response = commandHandler.handleCommand(messageText);

            if (response.startsWith("WEBAPP:")) {
                return sendWebAppLink(chatId, response.replace("WEBAPP:", ""));
            } else {
                return sendTextMessage(chatId, response);
            }
        }
        return null;
    }

    private SendMessage sendWebAppLink(Long chatId, String url) {
        try {
            InlineKeyboardMarkup keyboard = new InlineKeyboardMarkup();
            InlineKeyboardButton button = new InlineKeyboardButton();

            button.setText("Открыть веб-приложение");
            button.setWebApp(new WebAppInfo(url));

            keyboard.setKeyboard(List.of(List.of(button)));

            return SendMessage.builder()
                    .chatId(chatId.toString())
                    .text("Нажмите для открытия веб-приложения:")
                    .replyMarkup(keyboard)
                    .build();
        } catch (Exception e) {
            logger.error("Failed to send webapp link", e);
            return sendTextMessage(chatId, "Ошибка при открытии веб-приложения");
        }
    }

    private SendMessage sendTextMessage(Long chatId, String text) {
        return SendMessage.builder()
                .chatId(chatId.toString())
                .text(text)
                .build();
    }
}