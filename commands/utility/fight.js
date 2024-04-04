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
                        let shot = Math.random() * (attackerSkill + 1);
                        if (shot >= attackerSkill){
                            defenderDamage++;
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

            const exampleEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Jean Lafitte's Virginia Memorial Battle Simulator`)
                .setImage('https://upload.wikimedia.org/wikipedia/commons/3/35/Battle_of_New_Orleans.jpg')
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