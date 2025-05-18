#!/bin/bash
echo "Checking /api/v1/tasks/health..."
curl -k -s -o /dev/null -w "%{http_code}\n" https://api.notify-task-bot.ru/api/v1/tasks/health -H "Host: api.notify-task-bot.ru"
echo "Checking /api/v1/telegram/health..."
curl -k -s -o /dev/null -w "%{http_code}\n" https://web.notify-task-bot.ru/api/v1/telegram/health -H "Host: web.notify-task-bot.ru"