# Cardinal - A Generic AIO Discord Bot

## About

Cardinal is a JavaScript-based Discord bot developed for personal experimentation and coding practice. Its primary purpose is to amalgamate my favorite features from various bots into a single, versatile platform, enriched with unique twists and functionalities

## Setup

Essential Requirement: Create a `config.json` file in the same directory as `index.js`.

```json
{
  "token": "Bot_token_here",
  "clientId": "Your bot's ClientId",
  "guildId": "Your guild Id",
  "prefix": "*"
}
```

Current Limitation: The bot is designed for single-guild operations. If you're planning to deploy it across multiple guilds, consider enhancing the command handler to manage different guild IDs and incorporate an `onGuildJoin` listener for new guild registrations. This feature may be added in future updates.

Starting the Bot: After setting up your `config.json`, execute `node start` (developed using Node v21). This action initializes a database file in the data folder, which can be renamed in the DataHandler file.

Operational Note: The bot is designed to provide essential functionalities without premium charges. All features are freely accessible, reflecting the ethos of open-source development.

Also, check out Nadeko, another bot I appreciate for its free features.