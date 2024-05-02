# Alice Infinity - A Generic AIO Discord Bot

## About

Alice is a JavaScript-based Discord bot developed for personal experimentation and coding practice. Its primary purpose is to amalgamate my favorite features from various bots into a single, versatile platform, with unique twists to make it unique.

Eventaully I want to do more advance things, like patching into Amazon for storage and making a website for management. Also to add some sort of activity/game that can provide fun and promote server activity. Also AI chatting based on the way your server talks.

## Setup

Requirements: Create a `config.json` file in the same directory as `index.js`.

```json
{
  "token": "Bot_token_here",
  "clientId": "Your bot's ClientId",
  "prefix": "*"
}
```

## What can Alice Currently Do?
Currently Alice has the following features!
  - Server Logging! 
    - Message Deletes/Edits, Server Memeber Join/Leave/role updates, Server Emoji add/delete/update, Voice join/leave, AuditLog Create Events (Kick, Ban, Mod message delete)
  - Experience and Currency 
    - Currency for gambling, Experience for member activity tracking.
    - Leaderboards (Global)
  - Gambling Games 
    - Betroll, blackjack, coinToss, highlow, rps
  - Music! 
    - Able to play music in one channel per server! Allows music from places like Spotify, Youtube, Apple Music, etc (Default Spotify)
  - Server Autorole on Join
  - Role Menu 
  - Moderation Commands 
    - Kick/Ban/Mute(Timeout)
  - Say and Edit messages. Embeds allowed via JSON.
  - Small Antibot system - This definetly needs to get better but it works...
## Notes
Limitations: Currently, The database only tracks a global usage. I'm considering splitting so you can run per server tracking. Things that will need to be updated would be the dataHandler, commands like leaderboard, and the services like Exp and Currency.
There are likely other limitations I haven't considered or realized.

Starting the Bot: After setting up your `config.json`, execute `node start` (developed using Node v18). This action initializes a database file in the data folder, which can be renamed in the DataHandler file.

Note: The bot is designed to provide essential functionalities without premium charges. All features are freely accessible, and kept open for open-source development.

Note 2: I'm nowhere skilled enough and will be continuesly improving, The way the code looks between updates as I add things may be different as I refine the way I code and learn about new functionalities. Feel free to make a branch and update to make it more consistant.


