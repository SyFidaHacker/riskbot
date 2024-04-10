const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('d20')
        .setDescription('Roll a d20'),
        async execute(interaction) {
            let roll = Math.floor(Math.random() * (20) + 1)
            await interaction.reply(`${roll}`);
        }
}