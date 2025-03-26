package com.example.notifybot;

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
        this.botConfig = botConfig;
        this.commandHandler = commandHandler;
        try {
            var me = getMe();
            logger.info("Bot initialized successfully. Bot info: {}", me);
        } catch (TelegramApiException e) {
            logger.error("Failed to validate bot token", e);
        }
    }

    @Override
    public String getBotUsername() {
        return botConfig.getBotUsername();
    }

    @Override
    public String getBotToken() {
        return botConfig.getBotToken();
    }

    @Override
    public void onRegister() {
        super.onRegister();
        logger.info("Bot successfully registered with Telegram");
    }

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            long chatId = update.getMessage().getChatId();

            SendMessage message = new SendMessage();
            message.setChatId(String.valueOf(chatId));
            message.setText(commandHandler.handleCommand(messageText));

            try {
                execute(message);
                logger.info("Sent message to chat {}: {}", chatId, message.getText());
            } catch (TelegramApiException e) {
                logger.error("Failed to send message to chat " + chatId, e);
            }
        }
    }
}