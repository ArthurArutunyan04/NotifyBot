package com.example.telegrambot.handler;

import com.example.telegrambot.handler.commands.*;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class CommandHandler {
    public interface Command {
        String execute();
    }

    private final Map<String, Command> commands = new HashMap<>();

    public CommandHandler() {
        commands.put("/start", new StartCommand());
        commands.put("/help", new HelpCommand());
    }

    public String handleCommand(String input) {
        String command = input.split(" ")[0].toLowerCase();
        Command cmd = commands.getOrDefault(command, () -> "Неизвестная команда");
        return cmd.execute();
    }
}