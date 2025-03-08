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

            console.log("attackers: " + attackers)
            console.log.apply("defenders: " + defenders)

            let res = Math.floor(Math.random() * (attackers - defenders + 1) + defenders);
            console.log("result: " + res)

            if (res > 0){
                defendersRemaining -= res;
                attackersRemaining -= Math.floor(Math.random() * ((res * 0.6) - (res * 0.2) + 1) + (res * 0.2));
            }
            else if (res < 0){
                attackersRemaining += res;
                defendersRemaining += Math.floor(Math.random() * ((res * 0.6) - (res * 0.2) + 1) + (res * 0.2));
            }

            console.log("attackers left: " + attackersRemaining)
            console.log("defenders left: " + defendersRemaining)

            // Embed image
            let imageURL = 'https://d3d00swyhr67nd.cloudfront.net/w944h944/collection/LW/RHOC/LW_RHOC_8-001.jpg';

            // Embed builder
            const exampleEmbed = new EmbedBuilder()
                .setColor('#fc0303')
                .setTitle(`Johann von Füßen Kampfcomputer`)
                .setImage(`${imageURL}`)
                .addFields(
                    { name: 'Initial Attackers', value: `${attackers}`, inline: true },
                    { name: 'Initial Defenders', value: `${defenders}`, inline: true },
                    { name: 'Outcome', value: `${res.outcome}`, inline: true },
                    { name: 'Attackers remaining', value: `${totalAttackerDeaths}`, inline: true },
                    { name: 'Defenders remaining', value: `${totalDefenderDeaths}`, inline: true },
                    { name: '\u200B', value: '\u200B' }
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}