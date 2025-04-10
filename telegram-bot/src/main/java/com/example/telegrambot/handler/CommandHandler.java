package com.example.telegrambot.handler;

import com.example.telegrambot.handler.commands.HelpCommand;
import com.example.telegrambot.handler.commands.StartCommand;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class CommandHandler {
    private final Map<String, Command> commands = new HashMap<>();

    public CommandHandler() {
        commands.put("/start", new StartCommand());
        commands.put("/help", new HelpCommand());
    }

    public String handleCommand(String command) {
        Command cmd = commands.getOrDefault(command.toLowerCase(), () -> "Неизвестная команда");
        return cmd.execute();
    }

    public interface Command {
        String execute();
    }
}