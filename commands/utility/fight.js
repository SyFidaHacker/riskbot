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
                .setMinValue(1))
        .addStringOption(option =>
            option.setName('attacker_stance')
                .setDescription(`Attacking army's stance`)
                .setRequired(true)
                .addChoices(
                    {name: 'Raid', value: 'raid'},
                    {name: 'Assault', value: 'assault'}
                ))
        .addStringOption(option =>
            option.setName('defender_stance')
                .setDescription(`Defending army's stance`)
                .setRequired(true)
                .addChoices(
                    {name: 'Retreat', value: 'retreat'},
                    {name: 'Entrench', value: 'entrench'}
                )),
        async execute(interaction) {
            await interaction.reply({ content: 'Battle Commencing', ephemeral: true });
            await interaction.deleteReply();
            let attackers = interaction.options.getInteger('attackers');
            let defenders = interaction.options.getInteger('defenders');
            let attackerStance = interaction.options.getString('attacker_stance');
            let defenderStance = interaction.options.getString('defender_stance');
            let totalAttackerDamage = 0;
            let totalDefenderDamage = 0;
            let rounds = 0;

            function calculateAttack(x, y){
                // Increment round counter
                rounds++;

                // Base damage variable
                let baseDamage = 0.5;

                // Running totals of the casualties inflicted by each side
                let attackerDamage = 0;
                let defenderDamage = 0;
            
                // Damage modifier variables
                let damageMod;
                let defenseMod;

                // Alter damage modifiers based on army stances
                if (defenderStance == "entrench"){
                    damageMod = 1.25;
                    defenseMod = 1;
                }
                else{
                    damageMod = 1;
                    defenseMod = 1.25;
                }
            
                // Loop through every attacking troop to see if its "shot" hit or missed
                for (i = 0; i < x; i++){
                    let shot = Math.random();
                    if (shot >= (baseDamage * defenseMod)){
                        attackerDamage++;
                    }
                }
            
                // Loop through the defending troops, doing the same thing
                for (i = 0; i < y; i++){
                    let shot = Math.random();
                    if (shot <= (baseDamage * damageMod)){
                        defenderDamage++;
                    }
                }

                // Add each side's damage to the running total
                totalAttackerDamage+= attackerDamage;
                totalDefenderDamage+= defenderDamage;
            
                // Calculate remaining troops by subtracting damage
                x -= defenderDamage;
                y -= attackerDamage;
                
                // Ensure remaining totals aren't displayed as a negative value
                if (x < 0){
                    x = 0;
                }
                if (y < 0){
                    y = 0;
                }

                // Ensure that total damage counters do not exceed the original troop counts
                if (totalAttackerDamage > defenders){
                    totalAttackerDamage = defenders;
                }
                if (totalDefenderDamage > attackers){
                    totalDefenderDamage = attackers;
                }

                // Check if battle should run again based on army stance and troop count
                if (x > 0 && y > 0 && attackerStance == 'assault' && defenderStance == 'retreat'){
                    victor = 'Attackers';
                    let response = {
                        attackers: x,
                        defenders: y,
                        victor: victor
                    }
                    return response;
                }
                else if (y > 0 && attackerStance == 'raid'){
                    victor = 'Defenders';
                    let response = {
                        attackers: x,
                        defenders: y,
                        victor: victor
                    }
                    return response;
                }
                else if (x < 1){
                    victor = 'Defenders';
                    let response = {
                        attackers: x,
                        defenders: y,
                        victor: victor
                    }
                    return response;
                }
                else if (y < 1){
                    victor = 'Attackers';
                    let response = {
                        attackers: x,
                        defenders: y,
                        victor: victor
                    }
                    return response;
                }
                else if (x > 0 && y > 0 && attackerStance == 'assault' && defenderStance == 'entrench'){
                    return calculateAttack(x, y);
                }
            }
            
            let res = calculateAttack(attackers, defenders);
            let imageURL = 'https://d3d00swyhr67nd.cloudfront.net/w944h944/collection/LW/RHOC/LW_RHOC_8-001.jpg';

            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Jean Lafitte's Virginia Memorial Battle Simulator`)
                .setImage(`${imageURL}`)
                .setDescription(`"Mama ain't raised no wuss" -Jean Lafitte, 1815`)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Initial Attackers', value: `${attackers}`, inline: true },
                    { name: 'Initial Defenders', value: `${defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attacker stance', value: `${attackerStance}`, inline: true },
                    { name: 'Defender stance', value: `${defenderStance}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attacker casualties', value: `${totalDefenderDamage}`, inline: true },
                    { name: 'Defender casualties', value: `${totalAttackerDamage}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attackers remaining', value: `${res.attackers}`, inline: true },
                    { name: 'Defenders remaining', value: `${res.defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Rounds fought', value: `${rounds}`, inline: true },
                    { name: 'Victor', value: `${res.victor}`, inline: true },
                    { name: '\u200B', value: '\u200B' }
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}