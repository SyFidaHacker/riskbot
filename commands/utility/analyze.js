const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analyze')
        .setDescription(`Provides intel on potential battles`)
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
            await interaction.reply({ content: 'Running simulation', ephemeral: true });
            await interaction.deleteReply();
            let attackers = interaction.options.getInteger('attackers');
            let defenders = -interaction.options.getInteger('defenders');
            let totalAttackerDeaths = 0;
            let totalDefenderDeaths = 0;
            let attackerVictories = 0;
            let defenderVictories = 0;
            let projectedWinner = '';

            function calculateAttack(x, y){
                let result = Math.floor(Math.random() * (x - y + 1) + y);

                if (result > 0){
                    let winnerLosses = Math.floor(Math.random() * ((Math.ceil(result * 0.6)) - Math.floor((result * 0.2)) + 1) + Math.floor((result * 0.2)));
                    if (winnerLosses > x){
                        winnerLosses = x;
                    }
                    if (result > -y){
                        result = -y;
                    }
                    totalAttackerDeaths += winnerLosses;
                    totalDefenderDeaths += result;
                    attackerVictories++;
                }
                else if (result < 0){
                    let winnerLosses = Math.floor(Math.random() * ((Math.ceil(result * 0.6)) - Math.floor((result * 0.2)) + 1) + Math.floor((result * 0.2)));
                    if (winnerLosses < y){
                        winnerLosses = y;
                    }
                    if (result < -x){
                        result = -x;
                    }
                    totalAttackerDeaths -= result;
                    totalDefenderDeaths -= winnerLosses;
                    defenderVictories++;
                }
                else{
                    calculateAttack(x, y);
                }
            }

            for (let i = 0; i < 10000; i++){
                calculateAttack(attackers, defenders);
            }

            if (attackerVictories > defenderVictories){
                projectedWinner = 'Attackers';
            }
            else if (defenderVictories > attackerVictories){
                projectedWinner = 'Defenders'
            }
            else{
                projectedWinner = 'Too close to call';
            }

            let attackerMean = Math.round((totalAttackerDeaths / 10000));
            let defenderMean = Math.round((totalDefenderDeaths / 10000));
            let attackerWinChance = Math.round(((attackerVictories / 10000) * 100) * 10) / 10;
            let defenderWinChance = Math.round(((defenderVictories / 10000) * 100) * 10) / 10;

            console.log('attacker victories: ' + attackerVictories)
            console.log('defender victories: ' + defenderVictories)

            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Jean Lafitte Battle Sim Lite`)
                .setImage('https://render.fineartamerica.com/images/images-profile-flow/400/images/artworkimages/mediumlarge/2/planning-a-maneuver-1841-1850-mapping-the-exercise-henry-alexander-ogden.jpg')
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Expected Attackers', value: `${attackers}`, inline: true },
                    { name: 'Expected Defenders', value: `${-defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Average Attacker Deaths', value: `${attackerMean}`, inline: true },
                    { name: 'Average Defender Deaths', value: `${defenderMean}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Average Chance to Win', value: `${attackerWinChance}%`, inline: true },
                    { name: 'Defender Chance to Win', value: `${defenderWinChance}%`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Projected Winner', value: `${projectedWinner}`, inline: true },
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}