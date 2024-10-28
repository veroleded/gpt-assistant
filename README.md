# GPT Assistant – Telegram Bot with ChatGPT

GPT Assistant is an advanced Telegram bot powered by ChatGPT, designed for convenient interaction through text and voice messages. This project is built with **NestJS-Telegraf**, supports **Docker** for easy installation, uses a database for data and settings storage, and offers flexible customization options.

## Key Features

- **Text and voice responses** to user questions
- **Image generation** based on text prompts
- **Model selection** to adjust the ChatGPT model used
- **Voice customization** and **assigning roles** to the assistant
- **Context retention** to continue conversations considering previous messages

## Technologies and Stack

- **NestJS** with **Telegraf** for bot structure
- **Docker** for simplified installation and environment management
- **PostgreSQL** for data storage and user settings

## Installation and Setup

### Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** and **npm**

### Installation Steps

1. **Clone the repository**:

   ```bash
   git clone git@github.com:veroleded/gpt-assistant.git
   cd gpt-assistant
   ```

2. **Configure environment variables**:  
   Copy the `.env.example` file in the backend folder and rename it to `.env`. Enter all required keys and parameters (you will need a Telegram bot token and OpenAI API key).

3. **Run Docker containers**:

   ```bash
   make docker-start
   ```

4. **Local launch** (without Docker):
   ```bash
   make install
   make start
   ```

### Usage

1. **Connect to Telegram**: Start the bot and follow the instructions for setup.
2. **Команды**:
   - /settings - настройка текущего диалога
   - /deletecontext - удалить контекст текущего диалога
   - /image - генерация изображений
   - /newchat - новый диалог
   - /chats - выбор диалога
   - /role - задать роль ассистенту текущего диалога
   - /start - описание бота
   - /help - основные команды
   - /account - мой профиль, баланс

## Contribution

We welcome PRs and suggestions to improve the project.
