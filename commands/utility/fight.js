const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Calculates the result of a battle')
        .addIntegerOption(option =>
            option.setName('attackers')
                .setDescription(`Attacker's troop count`)
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('attacker_skill')
                .setDescription(`Attacker's skill level`)
                .setRequired(true)
                .addChoices(
                    {name: 'Level 1', value: 1},
                    {name: 'Level 2', value: 2},
                    {name: 'Level 3', value: 3},
                    {name: 'Level 4', value: 4}
                ))
        .addIntegerOption(option =>
            option.setName('defenders')
                .setDescription(`Defender's troop count`)
                .setRequired(true)
                .setMinValue(1))
        .addIntegerOption(option =>
            option.setName('defender_skill')
                .setDescription(`Defender's skill level`)
                .setRequired(true)
                .addChoices(
                    {name: 'Level 1', value: 1},
                    {name: 'Level 2', value: 2},
                    {name: 'Level 3', value: 3},
                    {name: 'Level 4', value: 4},
                    {name: 'Garrison', value: 0},
                    {name: 'Entrenchment', value: -1}
                )),

        async execute(interaction) {
            await interaction.reply({ content: 'Battle Commencing', ephemeral: true });
            await interaction.deleteReply();
            let attackers = interaction.options.getInteger('attackers');
            let defenders = interaction.options.getInteger('defenders');
            let attackerSkill = interaction.options.getInteger('attacker_skill');
            let defenderSkill = interaction.options.getInteger('defender_skill');
            let attackerDamageDisplay = 0;
            let defenderDamageDisplay = 0;
            let attackerCritCheck = false;
            let defenderCritCheck = false;

            function calculateAttack(x, y){
                console.log('')
                console.log('--------------------')
                console.log('attacker skill ' + attackerSkill)
                console.log('defender skill ' + defenderSkill)

                // Randomly generate defender skill for garrison battles
                if (defenderSkill == 0){
                    defenderSkill = Math.floor(Math.random() * 3 + 1)
                    console.log('Garrison fight. Defender skill: ' + defenderSkill)
                }
                else if (defenderSkill == -1){
                    defenderSkill = 4;
                    console.log('Entrenchment fight. Defender skill: ' + defenderSkill)
                }

                // Running totals of the casualties inflicted by each side
                let attackerDamage = 0;
                let defenderDamage = 0;
            
                // 1d20 roll to see if either side crits
                let attackerCrit = Math.floor(Math.random() * 20 + 1);
                let defenderCrit = Math.floor(Math.random() * 20 + 1);
            
                // Loop through every attacking troop to see if its "shot" hit or missed
                for (i = 0; i < x; i++){
                    let shot = Math.random() * 10;
                    if (shot >= 4 + defenderSkill){
                        attackerDamage++;
                    }
                }
            
                // Loop through the defending troops, doing the same thing
                for (i = 0; i < y; i++){
                    let shot = Math.random() * (attackerSkill + 1);
                    if (shot >= attackerSkill){
                        defenderDamage++;
                    }
                }

                // Check for attacker crits
                if (attackerCrit == 20){
                    attackerCritCheck = true;

                    // Recalculate damage
                    attackerDamage = Math.floor(attackerDamage * 2);
                    defenderDamage = Math.floor(defenderDamage * 0.5);
                }

                // Check for defender crits
                if (defenderCrit == 20){
                    defenderCritCheck = true;

                    // Recalculate damage
                    defenderDamage = Math.floor(defenderDamage * 2);
                    attackerDamage = Math.floor(attackerDamage * 0.5);
                }
            
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

                // Set damage displays to their respective values
                attackerDamageDisplay = attackerDamage;
                defenderDamageDisplay = defenderDamage;

                // Ensure that total damage counters do not exceed the original troop counts
                if (attackerDamage > defenders){
                    attackerDamageDisplay = defenders;
                }
                if (defenderDamage > attackers){
                    defenderDamageDisplay = attackers;
                }

                // Console logs for testing
                console.log('attacker crit: ' + attackerCrit)
                console.log('defender crit: ' + defenderCrit)

                // Determine end status

                // Attacking force is wiped out
                if (x < 1){
                    let response = {
                        attackers: x,
                        defenders: y,
                        victor: 'defenders',
                        result: 'Defenders win, the attackers are no more!',
                        attackerCritCheck: attackerCritCheck,
                        defenderCritCheck: defenderCritCheck
                    }
                    return response;
                }

                // Defending force is wiped out
                else if (y < 1){
                    let response = {
                        attackers: x,
                        defenders: y,
                        victor: 'attackers',
                        result: 'Attackers win, the defenders are no more!',
                        attackerCritCheck: attackerCritCheck,
                        defenderCritCheck: defenderCritCheck
                    }
                    return response;
                }

                // Checks for stalemates or strategic victories
                else{

                    // Stalemate
                    if (attackerDamageDisplay <= (defenderDamageDisplay * 1.25) && attackerDamageDisplay >= (defenderDamageDisplay * 0.75)){
                        let response = {
                            attackers: x,
                            defenders: y,
                            victor: 'none',
                            result: 'Stalemate, this is not the end!',
                            attackerCritCheck: attackerCritCheck,
                            defenderCritCheck: defenderCritCheck
                        }
                        return response;
                    }

                    // Attacker strategic victory
                    else if (attackerDamageDisplay > (defenderDamageDisplay * 1.25)){
                        let response = {
                            attackers: x,
                            defenders: y,
                            victor: 'attackers',
                            result: 'Attacker strategic victory, a decisive blow!',
                            attackerCritCheck: attackerCritCheck,
                            defenderCritCheck: defenderCritCheck
                        }
                        return response;
                    }

                    // Defender strategic victory
                    else if (defenderDamageDisplay > (attackerDamageDisplay * 1.25)){
                        let response = {
                            attackers: x,
                            defenders: y,
                            victor: 'defenders',
                            result: 'Defender strategic victory, stopped them in their tracks!',
                            attackerCritCheck: attackerCritCheck,
                            defenderCritCheck: defenderCritCheck
                        }
                        return response;
                    }
                }
            }
            
            let res = calculateAttack(attackers, defenders);
            let imageURL = '';
            if (attackerCritCheck && defenderCritCheck){
                console.log('offset crits')
                imageURL = 'https://smarthistory.org/wp-content/uploads/2021/02/233eaa4dec95a98d5ad5ba30be8f05a5-624x374.jpg';
            }
            else if (attackerCritCheck && !defenderCritCheck && res.victor == 'defenders'){
                console.log('attacker crit is defeated')
                imageURL = 'https://d3d00swyhr67nd.cloudfront.net/w944h944/collection/LW/RHOC/LW_RHOC_8-001.jpg';
            }
            else if (res.defenderCritCheck && !res.attackerCritCheck && res.victor == 'attackers'){
                console.log('defender crit is defeated')
                imageURL = 'https://www.onthisday.com/images/photos/battle-of-the-alamo.jpg';
            }
            else if (res.victor == 'attackers' && res.attackerCritCheck && !res.defenderCritCheck){
                console.log('attacker crit succeeds')
                imageURL = 'https://img.apmcdn.org/a9bedc6f326e257120951467bf8c0c11f0c0f961/uncropped/58dbd1-20150327-capitolart2.jpg';
            }
            else if (res.victor == 'defenders' && res.defenderCritCheck && !res.attackerCritCheck){
                console.log('defender crit succeeds')
                imageURL = 'https://upload.wikimedia.org/wikipedia/commons/3/35/Battle_of_New_Orleans.jpg';
            }
            else if (res.victor == 'attackers' && !res.attackerCritCheck && !res.defenderCritCheck){
                console.log('normal attacker victory')
                imageURL = 'https://images.squarespace-cdn.com/content/v1/5caa57b7e8ba44f0a1ce6bb3/1555008937634-14180VXTA46NHER7H2B2/A01.jpg';
            }
            else if (res.victor == 'defenders' && !res.attackerCritCheck && !res.defenderCritCheck){
                console.log('normal defender victory')
                imageURL = 'https://ohiomagazine.imgix.net/sitefinity/images/default-source/articles/2015/april-2015/battle-h-1st-ohio-volunteers-by-gaul.jpg?sfvrsn=b370ae38_2&w=960&auto=compress%2Cformat';
            }
            else if (res.victor == 'none'){
                console.log('stalemate')
                imageURL = 'https://imagedelivery.net/9sCnq8t6WEGNay0RAQNdvQ/UUID-cl9d642ye1364qvosbvw2vmr3/public'
            }
            else{
                console.log('what the hell happened?')
                console.log(res)
            }

            // Get timestamp for logs
            let timeStamp = new Date();

            console.log(timeStamp.toDateString())
            console.log(timeStamp.toLocaleTimeString())
            console.log('--------------------')

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
                    { name: 'Attacker casualties', value: `${defenderDamageDisplay}`, inline: true },
                    { name: 'Defender casualties', value: `${attackerDamageDisplay}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attackers remaining', value: `${res.attackers}`, inline: true },
                    { name: 'Defenders remaining', value: `${res.defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Result', value: `${res.result}`, inline: true },
                    { name: '\u200B', value: '\u200B' }
                )
                .setColor('Red')
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}