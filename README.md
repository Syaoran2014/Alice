# Alice Infinity - A Generic AIO Discord Bot

## About

Alice is a JavaScript-based Discord bot developed for personal experimentation and coding practice. Its primary purpose is to amalgamate my favorite features from various bots into a single, versatile platform, with unique twists to make it unique.

Eventaully I want to do more advance things, like patching into Amazon for storage and making a website for management. Also to add some sort of activity/game that can provide fun and promote server activity. Also AI chatting based on the way your server talks.

## Setup

Requirements: Create a `config.json` file in the same directory as `index.js`.
For Music to work - follow the instructions here: https://github.com/retrouser955/discord-player-youtubei under the "Signing into Youtube" Section.
tl;dr run this command:
`$ npx --no discord-player-youtubei`

```json
{
  "token": "Bot_token_here",
  "clientId": "Your bot's ClientId",
  "prefix": "*",
  "YoutubeOauthToken": "Paste entire npx command output here"
}
```

## What can Alice Currently Do?
Currently Alice has the following features!
  - Server Logging! 
    - Message Deletes/Edits, Server Memeber Join/Leave/role updates, Server Emoji add/delete/update, Voice join/leave, AuditLog Create Events (Kick, Ban, Mod message delete), etc etc
  - Experience and Currency 
    - Currency for gambling, Experience for member activity tracking.
    - Leaderboards (Global) - will add local server support later
  - Gambling Games 
    - Betroll, blackjack, coinToss, highlow, rps
  - Music! (Bug https://github.com/Syaoran2014/Alice/issues/16) 
    - *Requires Youtube Oauth*
    - Able to play music in one channel per server!
  - Server Autorole on Join
  - Role Menu Support  
    - Now editable!
  - Moderation Commands 
    - Kick/Ban/Mute(Timeout)
  - Say and Edit messages. Embeds allowed via JSON object
  - Small Antibot system - This definetly needs to get better but it probably works...
  - Ez Polls! - Options seperated by commas, Anonymous and multiple options supported.

## Notes
Limitations: Currently, The database only tracks a global usage. I'm considering splitting so you can run per server tracking. Things that will need to be updated would be the dataHandler, commands like leaderboard, and the services like Exp and Currency.
There are likely other limitations I haven't considered or realized.

Starting the Bot: After setting up your `config.json`, execute `node start` (developed using Node v18). This action initializes a database file in the data folder, which can be renamed in the DataHandler file.

Note: The bot is designed to provide essential functionalities without premium charges. All features are freely accessible, and kept open for open-source development.

Note 2: I'm nowhere skilled enough and will be continuesly improving, The way the code looks between updates as I add things may be different as I refine the way I code and learn about new functionalities. Feel free to make a branch and update to make it more consistant.


