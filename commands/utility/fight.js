const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Calculates the result of a battle')
        .addIntegerOption(option =>
            option.setName('attackers')
                .setDescription(`The attacking army's troop count`)
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('defenders')
                .setDescription(`The defending army's troop count`)
                .setRequired(true)
                .setMinValue(1)),
        async execute(interaction) {
            await interaction.reply({ content: 'Battle Commencing', ephemeral: true });
            await interaction.deleteReply();
            let attackers = interaction.options.getInteger('attackers');
            let defenders = -interaction.options.getInteger('defenders');
            let attackersRemaining = attackers;
            let defendersRemaining = defenders;
            let winner;

            console.log("attackers: " + attackers)
            console.log("defenders: " + -defenders)

            let result = Math.floor(Math.random() * (attackers - defenders + 1) + defenders);
            console.log("result: " + result)

            function calc(x){
                if (x > 0){
                    winner = "Attackers";
                    console.log("winner: " + winner)
                    let winnerLosses = Math.floor(Math.random() * ((Math.ceil(x * 0.6)) - Math.floor((x * 0.2)) + 1) + Math.floor((x * 0.2)));
                    console.log("attackers win, and lose " + winnerLosses + " troops")
                    defendersRemaining += x;
                    attackersRemaining -= winnerLosses;
                    if (attackersRemaining < 0){
                        console.log("attacker damage exceeds troop count")
                        attackersRemaining = 0;
                    }
                    if (defendersRemaining > 0){
                        console.log("defender damage exceeds troop count")
                        defendersRemaining = 0;
                    }
                    console.log("attackers left: " + attackersRemaining)
                    console.log("defenders left: " + -defendersRemaining)
                    let response = {
                        winner: winner,
                        attackersRemaining: attackersRemaining,
                        defendersRemaining: defendersRemaining,
                        attackerLosses: winnerLosses,
                        defenderLosses: result
                    }
                    return response;
                }
                else if (x < 0){
                    winner = "Defenders";
                    console.log("winner: " + winner)
                    let winnerLosses = Math.floor(Math.random() * ((Math.ceil(x * 0.6)) - Math.floor((x * 0.2)) + 1) + Math.floor((x * 0.2)));
                    console.log("defenders win, and lose " + -winnerLosses + " troops")
                    attackersRemaining += x;
                    defendersRemaining -= winnerLosses;
                    if (attackersRemaining < 0){
                        console.log("attacker damage exceeds troop count")
                        attackersRemaining = 0;
                    }
                    if (defendersRemaining > 0){
                        console.log("defender damage exceeds troop count")
                        defendersRemaining = 0;
                    }
                    console.log("attackers left: " + attackersRemaining)
                    console.log("defenders left: " + -defendersRemaining)
                    let response = {
                        winner: winner,
                        attackersRemaining: attackersRemaining,
                        defendersRemaining: defendersRemaining,
                        attackerLosses: -result,
                        defenderLosses: -winnerLosses
                    }
                    return response;
                }
                else{
                    calc(x);
                }
            }

            let res = calc(result);

            // Embed image
            let imageURL = 'https://d3d00swyhr67nd.cloudfront.net/w944h944/collection/LW/RHOC/LW_RHOC_8-001.jpg';

            // Embed builder
            const exampleEmbed = new EmbedBuilder()
                .setColor('#fc0303')
                .setTitle(`Jean Lafitte Battle Simulator Lite`)
                .setImage(`${imageURL}`)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'RNG Roll', value: `${result}`, inline: true },
                    { name: 'Winner', value: `${res.winner}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Initial Attackers', value: `${attackers}`, inline: true },
                    { name: 'Initial Defenders', value: `${-defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attacker losses', value: `${res.attackerLosses}`, inline: true },
                    { name: `Defender' losses`, value: `${res.defenderLosses}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attackers remaining', value: `${res.attackersRemaining}`, inline: true },
                    { name: 'Defenders remaining', value: `${-res.defendersRemaining}`, inline: true }
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}