# TODO:

- [] FIX YOUR FUCKING DATAHANDLER
- [] Ticket System
- [] Add Channel, Perms, etc (Guild updates) send to logs. 
- [✓] Add a Info for generic bot info (What does Alice do.)
- [✓] Add server status - Show whats enabled / disabled
- [✓] Update: Fix role menu edit to only remove emotes that were removed.
- [] BUGFIX: Fix Poll system -> Allow to check if any polls are active, Remember active polls for restarts.
- [] Add suggestions
- [] Welcome messages with optional Validate button
- [] Update nowPlaying to be more console like (Buttons with Pause/Play, Next, volume?)
- [] Malort
- [] Hunt/Fish (Daily/Timely activity)
- [] Slots (Gambling)
- [] Currency manipulation command
- [] Update Profile command for Image manipulation, Create Better looking profiles
- [] Determine if my current Database structure supports this.....
  - [] Port over to AWS Database? 
  - [] Port to Better Database Service?

- [] Other Mee6, Carl, etc bot stuff

Large Scale Idea:
- [] Adventure RPG
  - [] Create Character (Rpg start)
    - [] Simple classes (tank, healer, fighter, mage) 
    - [] Stats: Str, Def, Vit, Int... Wis?
  - [] Adventure and Train Commands
    - [] Add drops
  - [] Equipment
  - [] Other Items
  - [] Dungeon 
    - [] Eventually 100 floors (maybe more?)
    - [] Party System
  - [] NPC's
  - [] In depth Stat system review
    - [] Equipment / Class system rework
    - [] Require Healing as Items
  - [] Magic?
  - [] ? 
- [] Idle Game
  - [] Sync with Advernture RPG
  - [] Gacha with Waifus
    - [] Percentage boost per waifu stat?
    - [] Partying with Waifu in party system, improves waifu stats, percentage boost main char as support
    - [] Gacha rolls drop something other than just characters
    - [] How do you earn Gacha Rolls?
  - [] AFK Earnings for Currency?
  - [] Waifus have jobs? Can improve gear?
    - [] Blacksmith, fisher, miner, chef, weaver.... others?
    - [] Boosts crafted Items?
  - [] ?

- [] Port To WebServer
  - [] Make Functional GUI for everything above
  - [] Blog
- [] Port To Mobile Apps
  - [] Apple
  - [] Andorid

How to Monetize: 
Discord has activity SDK's now, look into that....
- [] Subscription Service
  - [] Double/Multiplied Xp Rate
    - [] Applies to Waifus as well?
  - [] Gacha Rolls?
  - [] ?

Other Items:
- [] Update VIP System
  - [] Need new rules like how much exp per attendee
- [] Warn Command
- [] Make Party Invite Functionality.
  - [] Make list to react to
  - [] Send Dms
  - [] Have Priority field
  - [] Log where invites have been sent to.
- [] Make My own Stat Algorithm that matches Discord closer
- [] Add Honkai/Genshin Support (Check-in?, Profile cards, etc)
- [] Conversational AI
  - [] ChatGPT API/Functionality?
  - [] Abillity to hold conversations
  - [] Personality Bias
- [] Twitch Integration
  - [] Chatbot
  - [] Commands
  - [] XP per chat Activity

Unrelated:
- [] fork of video2x and create a button to turn off my pc when the conversion is done
  - [] https://github.com/k4yt3x/video2x

Completed:
- [✓] Reset AWS VM (Fixed)
- [✓] Save Existing Database -> Port it into new VM
- [✓] Remake in JS???
- [✓] Migrate over to Apathys VM
  - [✓] Setup CI/CD Pipeline
- [✓] Add Help Command
- [✓] Add Leaderboard command. (Exp, Economy)
- [✓] Move VM to reset SSH pem Key. (Unneeded when Migrate to new host.)
- [✓] Make actual Slash Command Handler
  - [✓] Add all Commands to Slash Command
- [✓] Update Database Handler
  - [✓] Add Discord Server info
      - [✓] Framework Added, need Implementation
    - [✓] Logging Channel ID
    - [✓] Service Enable/Disable (For Future Services)
- [✓] Add Profile command
- [✓] Logging Enable Disable
- [✓] Update CommandHandler - Put the Commands in subfolders for organization
  - [✓] Update Help command to account for this.
  - [✓] Make commands first letter capitalized  
- [✓] Update DiscordUserInfo Table - Update columns to better suit what I want.. (remove dup columns, add others, etc) 
  - [✓] UserID, UserName, Birthday, ChatLvl, ChatExp, LevelExp
- [✓] Voice Chat integration
  - [✓] Music Player
  - [✓] BUG: Figure out Connection Reset Issue
  - [✓] Make play searchable with terms if link not provided.
    - [✓] Pulls list, assumes its the first one
  - [✓] Make Skip restrict to Dj role, admin, or Channel Majority
    - [✓] Add djRole column in ServerConfig 
  - [✓] Add shuffle, playNext, nowPlaying
  - [✓] Update queue to cycle and show more. 
- [✓] Economy / Alcoins? Malorkles?
  - [✓] New Table for RPG Items?
    - [✓] tableName UserEconomy
    - [✓] UserID, Currency, inventory
      - [✓] Inventory needs blob - houses json
       - [✓] ie { "fish": 1, "meat": 1}
  - [✓] Chat messages generate
  - [✓] Update services to generate Correctly
  - [✓] Gambling
    - [✓] Blackjack
    - [✓] CoinToss
    - [✓] D100 BetRoll 
    - [✓] higher lower
    - [✓] Rock paper Scissors
    - [✓] Make Art for my stuff!
      - [✓] Rps
      - [✓] cointoss
  - [✓] Update leaderboard for currency
