const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require("discord.js");

const userGames = new Map();

module.exports = {
    category: 'gambling',
    data: new SlashCommandBuilder()
      .setName('highlow')
      .setDescription("Classic game of Higher/Lower")
      .addNumberOption((option) => option
        .setName("wager")
        .setDescription("Amount to wager")
        .setRequired(true)),
    execute: async function (interaction, util) {
        let betAmount = interaction.options.getNumber('wager');
        const userId = interaction.user.id;
        if (betAmount < 0) {
            return interaction.reply("Nice Try, You can't bet negative numbers");
        }
        betAmount = Math.floor(betAmount);
 
        util.dataHandler.getUserInfo(userId, async (err, userInfo) => {
            if (err) {
                util.logger.error(err);
                return interaction.reply("Something didn't process correctly, Please contact bot owner if issue persists.");
            }
            if (!userInfo) {
                return interaction.reply("User data likely hasn't been initialized yet! \n Please try again.");
            }

            const userCurrency = userInfo.Currency;

            if (betAmount > userCurrency) {
                return interaction.reply("You don't have that much! Try again with a lower wager.");
            }

            const gameState = new highLowGameState(betAmount, userCurrency, userId, interaction);
            gameState.initializeComponents();
            userGames.set(interaction.user.id, gameState);

            let playingEmbed = gameState.createGameEmbed(interaction.user, gameState.currentCard);

            await interaction.reply({ embeds: [playingEmbed], components: gameState.components, files: [gameState.currentCard.cardFile]});

            const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                //util.logger.log(`Interaction: ${interaction.user.id}, Collector: ${i.user.id}`);
                const gameState = userGames.get(interaction.user.id);
                const int = gameState.interaction;
                const [action, gameId] = i.customId.split('-');

                if (!gameState) {
                    return i.reply({ content: "No active game found.", ephemeral: true});
                }
                if(i.user.id !== gameState.gameId) return;

                gameState.handleUserChoice(action, i, collector, util);

            });


        });
    }
};

class highLowGameState {
    constructor(betAmount, userCurrency, user) {
        this.betAmount = betAmount;
        this.userCurrency = userCurrency;
        this.gameId = user; 
        this.currentCard = this.drawCard();
        this.winCount = 0; 
        this.multiplier = Math.round(.65 * 100) / 100;
    }

    async handleUserChoice(choice, interaction, collector, util) {

        if (choice == 'Cashout') {
            collector.stop();
            util.dataHandler.payout(interaction.user.id, (Math.floor(this.betAmount * this.multiplier) - this.betAmount));
            return interaction.update({ content: `You cashed out with ${this.multiplier}x your bet. Totalling ${Math.round(this.betAmount * this.multiplier)} Alcoins`, components: []});
        }

        const newCard = this.drawCard();
        const result = this.compareCards(this.currentCard, newCard, choice);
        const embed = this.createGameEmbed(interaction.user, newCard);

        switch(result){
            case 'correct':
                this.winCount++;
                this.multiplier = Math.round((this.multiplier + .30) * 100 ) /100;
                this.currentCard = newCard;
                embed.description = `Win Count: ${this.winCount}, Current Multiplier ${this.multiplier}`;
                await interaction.update({ embeds: [embed], components: this.components, files: [this.currentCard.cardFile]});
                break;
            case 'draw':
                this.currentCard = newCard;
                embed.description = `Win Count: ${this.winCount}, Current Multiplier ${this.multiplier}`;
                await interaction.update({ embeds: [embed], components: this.components , files: [this.currentCard.cardFile]});
                break;
            case 'incorrect':
                collector.stop();
                util.dataHandler.payout(interaction.user.id, (this.betAmount * -1));
                await interaction.update({ content: `You Lost -${this.betAmount} Alcoins, the next card was a ${newCard.value} of ${newCard.suit}s`, components: [] });
                break;
            default: 
                return interaction.reply("Unreachable");
        }        
    }

    compareCards(oldCard, newCard, choice) {
        const oldCardValue = this.getCardValue(oldCard.value);
        const newCardValue = this.getCardValue(newCard.value);
        if ((choice === 'higher' && newCardValue > oldCardValue) || (choice === 'lower' && newCardValue < oldCardValue)) {
                return 'correct';
            } else if (newCardValue === oldCardValue) {
                return 'draw';
            }
            return 'incorrect';            
    }

    drawCard() {
        const suits = ['heart', 'spade', 'club', 'diamond'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const value = values[Math.floor(Math.random() * values.length)];
        const suit = suits[Math.floor(Math.random() * suits.length)];

        const valueName = value.toLowerCase();
        
        const cardFile = `assets/cards/${valueName}_${suit}.png`;

        return {value, suit, cardFile};
    }

    getCardValue(card) {
        const cardValues = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        };
        return cardValues[card];
    }

    initializeComponents() {
        this.components = [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId(`higher-${this.gameId}`)
                  .setLabel('Higher')
                  .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                  .setCustomId(`lower-${this.gameId}`)
                  .setLabel('Lower')
                  .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                  .setCustomId(`Cashout-${this.gameId}`)
                  .setLabel('Cashout')
                  .setStyle(ButtonStyle.Secondary),
            )
        ];
    }

    createGameEmbed(user, card) {
        const fileName = card.cardFile.split('/').pop();
        return {
            author: {
                name: `${user.username}'s Higher/Lower Game`,
                icon_url: user.avatarURL(),
            },
            title: "Higher / Lower --- Ace's are always Highest",
            image: {
                url: `attachment://${fileName}`
            }
        };
    }

}
