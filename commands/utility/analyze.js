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

                // Running totals of the casualties inflicted by each side
                let attackerDamage = 0;
                let defenderDamage = 0;
            
                // 1d20 roll to see if either side hits a crit(damage) which deals ~90% max damage
                let legendAttack = Math.floor(Math.random() * 20 + 1);
                let legendDefense = Math.floor(Math.random() * 20 + 1);

                // 1d20 roll to see if either side hits a crit(armor) which reduces the enemy damage to ~10% of their max
                let attackerMiracle = Math.floor(Math.random() * 20 + 1);
                let defenderMiracle = Math.floor(Math.random() * 20 + 1);
            
                // A random score to measure how effectively each side mitigates its own losses (the higher the better)
                let attackerSkill = Math.floor(Math.random() * 4 + 1)
                let defenderSkill = Math.floor(Math.random() * 4 + 1)
            
                // Loop through every attacking troop to see if its "shot" hit or missed
                for (i = 0; i < x; i++){
            
                    // Check if attackers crit(damage) and defenders crit(armor), setting accuracy to 50%
                    if (legendAttack == 20 && defenderMiracle == 20){
                        let shot = Math.random() * 2;
                        if (shot >= 1){
                            attackerDamage++;
                        }
                    }
            
                    // Check to see if a crit(damage) is applicable, and if so, calculate shots at 90% accuracy
                    else if (legendAttack == 20){
                        let shot = Math.random() * 10;
                        if (shot >= 1){
                            attackerDamage++;
                        }
                    }
            
                    // Check if defenders rolled a crit(armor), and if so, calculate shots at 10% accuracy
                    else if (defenderMiracle == 20){
                        let shot = Math.random() * 10;
                        if (shot >= 9){
                            attackerDamage++;
                        }
                    }
            
                    // Normal calculation, roll a dice to see if a troop's shot hits against the defender's skill score
                    else{
                        let shot = Math.random() * (defenderSkill + 1);
                        if (shot >= defenderSkill){
                            attackerDamage++;
                        }
                    }
                }
            
                // Loop through the defending troops, doing the same thing
                for (i = 0; i < y; i++){
            
                    // Offsetting crits check
                    if (legendDefense == 20 && attackerMiracle == 20){
                        let shot = Math.random() * 2;
                        if (shot >= 1){
                            defenderDamage++;
                        }
                    }
            
                    // Crit(damage) check
                    else if (legendDefense == 20){
                        let shot = Math.random() * 10;
                        if (shot >= 1){
                            defenderDamage++;
                        }
                    }
            
                    // Attackers crit(armor) check
                    else if (attackerMiracle == 20){
                        let shot = Math.random() * 10;
                        if (shot >= 9){
                            defenderDamage++;
                        }
                    }
            
                    // Normal shot calculation against attacker's skill score
                    else{
                        if (defenderStance == 'entrench'){
                            let shot = Math.random() * (attackerSkill + 10);
                            if (shot >= attackerSkill + 2.5){
                                defenderDamage++;
                            }
                        }
                        else{
                            let shot = Math.random() * (attackerSkill + 1);
                            if (shot >= attackerSkill){
                                defenderDamage++;
                            }
                        }
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
            else{
                projectedVictor = 'Defenders'
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