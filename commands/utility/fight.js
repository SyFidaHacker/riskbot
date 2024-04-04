const { SlashCommandBuilder } = require('discord.js');

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
            function calculateAttack(x, y){
                // Response object to return
                let response = {
                    attackers: x,
                    defenders: y
                }

                // Running totals of the casualties inflicted by each side
                let attackerDamage = 0;
                let defenderDamage = 0;
            
                // 1d20 roll to see if either side hits a crit(offense) which deals ~90% max damage
                let legendAttack = Math.floor(Math.random() * 20 + 1);
                let legendDefense = Math.floor(Math.random() * 20 + 1);
            
                // 1d20 roll to see if either side hits a crit(defense) which reduces the enemy damage to ~10% of their max
                let attackerMiracle = Math.floor(Math.random() * 20 + 1);
                let defenderMiracle = Math.floor(Math.random() * 20 + 1);
            
                // A random score to measure how effectively each side mitigates its own losses (the higher the better)
                let attackerSkill = Math.floor(Math.random() * 4 + 1)
                let defenderSkill = Math.floor(Math.random() * 4 + 1)
            
                // Loop through every attacking troop to see if its "shot" hit or missed
                for (i = 0; i < x; i++){
            
                    // Check if attackers crit(offense) and defenders crit(defense), setting accuracy to 50%
                    if (legendAttack == 20 && defenderMiracle == 20){
                        let shot = Math.random() * 2;
                        if (shot >= 1){
                            attackerDamage++;
                        }
                    }
            
                    // Check to see if a crit(offense) is applicable, and if so, calculate shots at 90% accuracy
                    else if (legendAttack == 20){
                        let shot = Math.random() * 10;
                        if (shot >= 1){
                            attackerDamage++;
                        }
                    }
            
                    // Check if defenders rolled a crit(defense), and if so, calculate shots at 10% accuracy
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
            
                    // Offset crits check
                    if (legendDefense == 20 && attackerMiracle == 20){
                        let shot = Math.random() * 2;
                        if (shot >= 1){
                            defenderDamage++;
                        }
                    }
            
                    // Crit(offense) check
                    else if (legendDefense == 20){
                        let shot = Math.random() * 10;
                        if (shot >= 1){
                            defenderDamage++;
                        }
                    }
            
                    // Attackers crit(defense) check
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
            
                // Calculate remaining troops by subtracting damage
                response.attackers -= defenderDamage;
                response.defenders -= attackerDamage;
                
                // Ensure remaining totals aren't displayed as a negative value
                if (response.attackers < 0){
                    response.attackers = 0;
                }
                if (response.defenders < 0){
                    response.defenders = 0;
                }
            
                //Return response object
                return response;
            }
            
            let res = calculateAttack(attackers, defenders);
            
            await interaction.reply(`${res.attackers} and ${res.defenders}`);
        },
}