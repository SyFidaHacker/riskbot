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
            await interaction.reply({ content: 'Running simulation', ephemeral: true });
            await interaction.deleteReply();
            let attackers = interaction.options.getInteger('attackers');
            let defenders = interaction.options.getInteger('defenders');
            let attackerStance = interaction.options.getString('attacker_stance');
            let defenderStance = interaction.options.getString('defender_stance');
            let totalAttackerDamage = 0;
            let totalDefenderDamage = 0;
            let attackSimTotal = 0;
            let defendSimTotal = 0;
            let attackVictories = 0;
            let defendVictories = 0;
            let attackerOutdamages = 0;
            let defenderOutdamages = 0;
            let projectedVictor = '';

            function calculateAttack(x, y){

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
                    attackVictories++;
                    attackSimTotal += totalAttackerDamage;
                    defendSimTotal += totalDefenderDamage;
                    if (totalAttackerDamage > totalDefenderDamage){
                        attackerOutdamages++;
                    }
                    else if (totalDefenderDamage > totalAttackerDamage){
                        defenderOutdamages++;
                    }
                    else{
                        attackerOutdamages += 0.5;
                        defenderOutdamages += 0.5;
                    }
                    totalAttackerDamage = 0;
                    totalDefenderDamage = 0;
                    return;
                }
                else if (y > 0 && attackerStance == 'raid'){
                    victor = 'Defenders';
                    defendVictories++;
                    attackSimTotal += totalAttackerDamage;
                    defendSimTotal += totalDefenderDamage;
                    if (totalAttackerDamage > totalDefenderDamage){
                        attackerOutdamages++;
                    }
                    else if (totalDefenderDamage > totalAttackerDamage){
                        defenderOutdamages++;
                    }
                    else{
                        attackerOutdamages += 0.5;
                        defenderOutdamages += 0.5;
                    }
                    totalAttackerDamage = 0;
                    totalDefenderDamage = 0;
                    return;
                }
                else if (x < 1){
                    victor = 'Defenders';
                    defendVictories++;
                    attackSimTotal += totalAttackerDamage;
                    defendSimTotal += totalDefenderDamage;
                    if (totalAttackerDamage > totalDefenderDamage){
                        attackerOutdamages++;
                    }
                    else if (totalDefenderDamage > totalAttackerDamage){
                        defenderOutdamages++;
                    }
                    else{
                        attackerOutdamages += 0.5;
                        defenderOutdamages += 0.5;
                    }
                    totalAttackerDamage = 0;
                    totalDefenderDamage = 0;
                    return;
                }
                else if (y < 1){
                    victor = 'Attackers';
                    attackVictories++;
                    attackSimTotal += totalAttackerDamage;
                    defendSimTotal += totalDefenderDamage;
                    if (totalAttackerDamage > totalDefenderDamage){
                        attackerOutdamages++;
                    }
                    else if (totalDefenderDamage > totalAttackerDamage){
                        defenderOutdamages++;
                    }
                    else{
                        attackerOutdamages += 0.5;
                        defenderOutdamages += 0.5;
                    }
                    totalAttackerDamage = 0;
                    totalDefenderDamage = 0;
                    return;
                }
                else if (x > 0 && y > 0 && attackerStance == 'assault' && defenderStance == 'entrench'){
                    calculateAttack(x, y);
                }
            }

            for (let i = 0; i < 1000; i++){
                calculateAttack(attackers, defenders,);
            }

            if (attackVictories > defendVictories){
                projectedVictor = 'Attackers';
            }
            else if (defendVictories > attackVictories){
                projectedVictor = 'Defenders'
            }
            else{
                projectedVictor = 'Too close to call';
            }

            console.log('attacker victories: ' + attackVictories)
            console.log('defender victories: ' + defendVictories)
            

            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Jean Lafitte's Virginia Memorial Battle Simulator`)
                .setImage('https://render.fineartamerica.com/images/images-profile-flow/400/images/artworkimages/mediumlarge/2/planning-a-maneuver-1841-1850-mapping-the-exercise-henry-alexander-ogden.jpg')
                .setDescription(`"If you fail to prepare, you're preparing to fail" -Jean Lafitte, 1811`)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Expected Attackers', value: `${attackers}`, inline: true },
                    { name: 'Expected Defenders', value: `${defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Expected Attacker Stance', value: `${attackerStance}`, inline: true },
                    { name: 'Expected Defender Stance', value: `${defenderStance}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '\u200B', value: 'Likelihood of inflicting more casualties:'},
                    { name: 'Attackers', value: `${Math.round(((attackerOutdamages / 1000) * 100) * 10) / 10}%`, inline: true },
                    { name: 'Defenders', value: `${Math.round(((defenderOutdamages / 1000) * 100) * 10) / 10}%`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attacker Average Casualties', value: `${Math.round(defendSimTotal / 1000)}`, inline: true },
                    { name: 'Defender Average Casualties', value: `${Math.round(attackSimTotal / 1000)}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Projected Victor', value: `${projectedVictor}`, inline: true },
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}