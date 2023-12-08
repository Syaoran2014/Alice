const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

const userGames = new Map();

module.exports = {
    category: 'gambling',
    data: new SlashCommandBuilder()
      .setName('blackjack')
      .setDescription("Play a hand of blackjack")
      .addNumberOption(option => 
        option
          .setName("bet")
          .setDescription("Amount you want to wager")
          .setRequired(true)),
    execute: async function (interaction, util){ 
        let betAmount = interaction.options.getNumber('bet');
        const userId = interaction.user.id;

        util.dataHandler.getUserInfo(userId, async (err, userInfo) => {
            if (err){
                return interaction.reply("An Error has occured, please try again later.");
            }

            if (!userInfo) {
                return interaction.reply("User data not Initialized, Try sending a normal message first!");
            }

            if (userGames.has(interaction.user.id)) {
                return interaction.reply({ content: `Please complete your last game first before starting a new one!`, ephemeral: true});
            }

            const userCurrency = userInfo.Currency;
            if (betAmount > userCurrency){
                return interaction.reply("You don't have that much! Try with a lower amount");
            }

            const gameState = new BlackjackGameState(betAmount, userCurrency, userId);
            gameState.initializeComponents();
            userGames.set(interaction.user.id, gameState);

            // let playerHands = gameState.playerHands;
            let currentHand = gameState.playerHands[gameState.handIndex];
            // let handIndex = gameState.handIndex;
            // let gameEnded = gameState.gameEnded;

            let playingEmbed = gameState.createGameEmbed(interaction.user);
            let playerScore = gameState.calculateScore(currentHand);
            let dealerScore = gameState.calculateScore(gameState.dealerHand);

            if (playerScore === 21 && currentHand.length === 2) {
                gameState.gameEnded = true; 
                userGames.delete(interaction.user.id);
                betAmount = betAmount * 1.5;
                return await interaction.reply({content : `***Blackjack! You WIN! *** +${betAmount}`, embeds: [playingEmbed]});
            } else if (dealerScore === 21 && currentHand.length === 2) {
                gameState.gameEnded = true; 
                userGames.delete(interaction.user.id);
                playingEmbed.description = `Dealer's Hand: \nTotal: ${dealerScore} \n${gameState.formatHand(gameState.dealerHand)}`;
                return await interaction.reply({content : `Dealer Blackjack, You Lose...`, embeds: [playingEmbed]});
            } else {
                await await interaction.reply({ content: `Playing Hand ${gameState.handIndex + 1}`, embeds: [playingEmbed], components: gameState.components, fetchReply: true});

            }

            const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000});
            
            collector.on('collect', async i => {
                const gameState = userGames.get(interaction.user.id);
                const [action, gameId] = i.customId.split('-');
                if(!gameState) {
                    return i.reply({ content: "No active game found.", ephemeral: true});
                }
                if (i.user.id !== gameState.gameId) {
                    return;
                }
                                
                try {
                    switch(action){
                        case "hit":
                            await handleHit(gameState, i, collector);
                            break;
                        case "stand": 
                            await handleStand(gameState, i, collector);
                            break;
                        case "double":
                            await handleDouble(gameState, i, collector);
                            break;
                        case "split":
                            await handleSplit(gameState, i);
                            break;
                        default: 
                            return i.reply({ content: `You somehow managed to see this......`});
                    }
                } catch (error) {
                    util.logger.error("Error in game collector: ", error);
                }


                /*
                if (i.customId === 'hit') {
                    currentHand.push(gameState.drawCard());

                    const playerScore = gameState.calculateScore(currentHand);

                    // util.logger.log(`${JSON.stringify(currentHand)} --- Total: ${playerScore}`);

                    if (playerScore < 22) {
                        playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                        await i.update({content: `Playing Hand ${gameState.handIndex + 1}`, embeds: [playingEmbed], components });
                    }else if (playerScore > 21) {
                        if (gameState.handIndex < gameState.playerHands.length - 1) {
                            playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                            await i.update({content: `Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed], components });
                            gameState.handIndex++;
                            currentHand = gameState.playerHands[gameState.handIndex];
                        } else {
                            gameState.gameEnded = true;
                            collector.stop();
                            playingEmbed.fields[0].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                            return i.update({ content: `***Bust!***`, embeds: [playingEmbed], components: [] });
                        }
                    }
                } else if (i.customId === 'stand') {
                    if (gameState.handIndex < gameState.playerHands.length - 1) {
                        await i.update({content: `Playing Hand ${gameState.handIndex + 1}`, embeds: [playingEmbed], components });
                        gameState.handIndex++;
                        currentHand = gameState.playerHands[gameState.handIndex];
                    } else { 
                        gameState.gameEnded = true; 
                        collector.stop();
                    }
                } else if (i.customId === 'double') {
                    if (currentHand.length === 2) {
                        gameState.betAmount *= 2;
                        currentHand.push(gameState.drawCard());
                        const playerScore = gameState.calculateScore(currentHand);

                        // util.logger.log(`${JSON.stringify(currentHand)} --- ${handIndex}`)
                        
                        if (gameState.handIndex < gameState.playerHands.length - 1) {
                            if (playerScore > 21) {
                                playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                                currentHand = gameState.playerHands[gameState.handIndex];
                                await i.update({ content: `***Bust!*** Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed] });
                            } else {
                                playingEmbed.fields[handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                                currentHand = gameState.playerHands[gameState.handIndex];
                                await i.update({ embeds: [playingEmbed] });
                            }
                            gameState.handIndex++;
                            currentHand = gameState.playerHands[gameState.handIndex];
                        } else {
                            gameState.gameEnded = true;
                            if (playerScore > 21) {
                                playingEmbed.fields[handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                                currentHand = gameState.playerHands[handIndex];
                                await i.update({ content: `***Bust!***`, embeds: [playingEmbed], components: [] });
                            } else {
                                playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                                currentHand = gameState.playerHands[gameState.handIndex];
                                await i.update({ embeds: [playingEmbed], components: [] });
                            }
                            collector.stop();
                        }
                    } else {
                        return i.update({ content: `Unable to double down, try a different option.`});
                    }
                } else if (i.customId === 'split') {
                    if (gameState.isHandSplittable(currentHand)) {
                        //Handle's New hand
                        let splitCard = currentHand.pop();
                        let newHand = [splitCard, gameState.drawCard()];
                        gameState.playerHands.push(newHand);

                        // let newField = { 
                        //     name: '\u200B', 
                        //     value: `Player's Hand ${playerHands.length}:\nTotal: ${calculateScore(newHand)}\n${formatHand(newHand)}`,
                        // };

                        // playingEmbed.fields.push(newField)

                        playingEmbed = gameState.createGameEmbed(i.user);

                        //Handles Current Hand
                        currentHand.push(gameState.drawCard());
                        playerScore = gameState.calculateScore(currentHand);
                        playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;

                        await i.update({content: `Playing Hand ${gameState.handIndex + 1}`, embeds: [playingEmbed], components});
                        // util.logger.log(JSON.stringify(playingEmbed.fields[0]));
                    } else {
                        await i.update({ content: `Unable to split, try a different option.`});
                    }
                }
                */
            });

            collector.on('end', async collected => {
                if(!gameState.gameEnded) {
                    userGames.delete(interaction.user.id);
                    return interaction.editReply({ content: 'Game nullified, timeout was reached', components: []});
                } else {
                    while (dealerScore < 17) {
                        gameState.dealerHand.push(gameState.drawCard());
                        dealerScore = gameState.calculateScore(gameState.dealerHand);
                    }
                    let playingEmbed = gameState.createGameEmbed(interaction.user);

                    playingEmbed.description = `Dealer's Hand: \nTotal: ${dealerScore} \n${gameState.formatHand(gameState.dealerHand)}`;
                    let currentIndex = 0;
                    gameState.playerHands.forEach((hand) => {
                        // util.logger.log(JSON.stringify(hand));
                        playerScore = gameState.calculateScore(hand);
                        // util.logger.log(`${JSON.stringify(hand)} - Score: ${playerScore}`)
                        if (playerScore > 21) {
                            playingEmbed.fields[currentIndex].name = `Hand ${currentIndex + 1} loses... ${gameState.betAmount[currentIndex]}`;
                            playingEmbed.fields[currentIndex].value = `Total: ${playerScore} \n${gameState.formatHand(hand)}`;
                        } else if ((playerScore > dealerScore && playerScore < 22) || (dealerScore > 21)) {
                            playingEmbed.fields[currentIndex].name = `Hand ${currentIndex + 1} WINS! ${gameState.betAmount[currentIndex]}`;
                            playingEmbed.fields[currentIndex].value = `Total: ${playerScore} \n${gameState.formatHand(hand)}`;
                        } else if ( playerScore < dealerScore || playerScore > 21) {
                            playingEmbed.fields[currentIndex].name = `Hand ${currentIndex + 1} loses... ${gameState.betAmount[currentIndex]}`;
                            playingEmbed.fields[currentIndex].value = `Total: ${playerScore} \n${gameState.formatHand(hand)}`;
                        } else {
                            playingEmbed.fields[currentIndex].name = `Push`;
                            playingEmbed.fields[currentIndex].value = `Total: ${playerScore} \n${gameState.formatHand(hand)}`;
                        }
                        currentIndex++;
                    });
                    userGames.delete(interaction.user.id);
                    return await interaction.editReply({ embeds: [playingEmbed], components: [] });
                }
            });
        });
    }
};

async function handleHit(gameState, interaction, collector) {
    const currentHand = gameState.playerHands[gameState.handIndex];
    const components = gameState.components;

    currentHand.push(gameState.drawCard());
    const playerScore = gameState.calculateScore(currentHand);

    let playingEmbed = gameState.createGameEmbed(interaction.user);

    if (playerScore < 22) {
        playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
        return interaction.update({content: `Playing Hand ${gameState.handIndex + 1}`, embeds: [playingEmbed], components });
    } else if (playerScore > 21) {
        if (gameState.handIndex < gameState.playerHands.length - 1) {
            playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
            interaction.update({content: `Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed], components });
            gameState.handIndex++;
        } else {
            gameState.gameEnded = true;
            collector.stop();
            playingEmbed.fields[0].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
            return interaction.update({ content: `***Bust!***`, embeds: [playingEmbed], components: [] });
        }
    }
}

async function handleStand(gameState, interaction, collector) {
    let playingEmbed = gameState.createGameEmbed(interaction.user);
    const components = gameState.components;


    if (gameState.handIndex < gameState.playerHands.length -1) {
        interaction.update({content: `Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed], components });
        gameState.handIndex++;
    } else {
        gameState.gameEnded = true;
        collector.stop();
    }
}

async function handleDouble(gameState, interaction, collector){
    const currentHand = gameState.playerHands[gameState.handIndex];
    const components = gameState.components;

    if (currentHand.length === 2) {
        gameState.betAmount[gameState.handIndex] *= 2;
        currentHand.push(gameState.drawCard());
        const playerScore = gameState.calculateScore(currentHand);
        let playingEmbed = gameState.createGameEmbed(interaction.user);

        if (gameState.handIndex < gameState.playerHands.length -1) {
            if (playerScore > 21) {
                playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                await interaction.update({ content: `***Bust!*** Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed], components});
            } else {
                playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                await interaction.update({ content: `Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed] , components });
            }
            gameState.handIndex++; 
        } else { 
            gameState.gameEnded = true;
            if (playerScore > 21) {
                playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                await interaction.update({ content: `***Bust!*** Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed], components: [] });
            } else {
                playingEmbed.fields[gameState.handIndex].value = `Player's Hand ${gameState.handIndex + 1}:\nTotal: ${playerScore} \n${gameState.formatHand(currentHand)}`;
                await interaction.update({ content: `Playing Hand ${gameState.handIndex + 2}`, embeds: [playingEmbed] , components: [] });
            }
            collector.stop();
        }
    } else {
        await interaction.update ({ content: `Unable to double down, try a different option`});
    }
}

async function handleSplit(gameState, interaction) {
    const currentHand = gameState.playerHands[gameState.handIndex];
    const components = gameState.components;

    if (gameState.isHandSplittable(currentHand)) {
        //Handle the new hand first
        let splitCard = currentHand.pop();
        let newHand = [splitCard, gameState.drawCard()];
        gameState.playerHands.push(newHand);
        gameState.betAmount.push(gameState.betAmount[gameState.handIndex]);

        //Handle current Hand
        currentHand.push(gameState.drawCard());
        
        let playingEmbed = gameState.createGameEmbed(interaction.user);

        await interaction.update({ content: `Playing Hand ${gameState.handIndex + 1}`, embeds: [playingEmbed], components});
    } else {
        await interaction.update({ content: `Unable to split, try a different option.`});
    }
}

class BlackjackGameState {
    constructor(betAmount, userCurrency, user) { 
        this.betAmount = [betAmount];
        this.userCurrency = userCurrency;
        this.playerHands = [this.dealHand()];
        this.dealerHand = this.dealHand();
        this.handIndex = 0;
        this.gameEnded = false;
        this.gameId = user;
    }

    drawCard() {
        const suits = ['♡', '♢', '♣', '♠'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const value = values[Math.floor(Math.random() * values.length)];
        const suit = suits[Math.floor(Math.random() * suits.length)];
        return {value, suit};
    }

    dealHand() {
        return[this.drawCard(), this.drawCard()];
    }

    calculateScore(hand) {
        let score = 0;
        let aceCount = 0;
        hand.forEach(card => {
            if (['J', 'Q', 'K'].includes(card.value)) {
                score += 10;
            } else if (card.value === 'A') {
                aceCount += 1;
                score += 11; 
            } else {
                score += parseInt(card.value);
            }
        });
    
        while (score > 21 && aceCount > 0) {
            score -= 10;
            aceCount -= 1;
        }
    
        return score;
    }

    formatHand(hand, hideSecondCard = false){
        if (hideSecondCard) {
            return `**${hand[0].value}** ${hand[0].suit}, Hidden Card`;
        }
    
        return hand.map(card => `**${card.value}** ${card.suit}`).join(', ');
    }

    isHandSplittable(hand) {
        return hand.length === 2 && hand[0].value === hand[1].value;
    }

    initializeComponents() {
        this.components = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`hit-${this.gameId}`)
                  .setLabel('Hit')
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId(`stand-${this.gameId}`)
                  .setLabel('Stand')
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId(`double-${this.gameId}`)
                  .setLabel('Double Down')
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(this.playerHands[this.handIndex].length !== 2 || (this.betAmount * 2) > this.userCurrency),
                ...(this.isHandSplittable(this.playerHands[this.handIndex]) ? [new ButtonBuilder()
                  .setCustomId(`split-${this.gameId}`)
                  .setLabel('Split')
                  .setStyle(ButtonStyle.Primary)] : [])
            )
        ];
    }

    createGameEmbed(user) {
        // console.log(JSON.stringify(this.playerHands));
        return {
            author: {
                name: `${user.username}'s Blackjack Gamne`,
                icon_url: user.avatarURL(),
            },
            description: `Dealer's Hand: \n${this.formatHand(this.dealerHand, true)}`,
            fields: this.playerHands.map((hand, index) => ({
                name: `\u200B`,
                value: `Player's Hand ${index + 1}: \nTotal: ${this.calculateScore(hand)}\n ${this.formatHand(hand)}`
            }))
        };
    }
}