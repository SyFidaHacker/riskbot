const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('analyze')
        .setDescription(`Provides intel on potential battles`)
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
            await interaction.reply({ content: 'Running simulation', ephemeral: true });
            await interaction.deleteReply();
            let attackers = interaction.options.getInteger('attackers');
            let defenders = interaction.options.getInteger('defenders');
            let attackerSkill = interaction.options.getInteger('attacker_skill');
            let defenderSkill = interaction.options.getInteger('defender_skill');
            let attackerDamageDisplay = 0;
            let defenderDamageDisplay = 0;
            let attackSimTotal = 0;
            let defendSimTotal = 0;
            let attackVictories = 0;
            let defendVictories = 0;
            let stalemates = 0;
            let attackStrategicVictories = 0;
            let defendStrategicVictories = 0;
            let garrisonCheck = false;
            let entrenchCheck = false;
            let attackerSkillDisplay = attackerSkill;
            let defenderSkillDisplay = defenderSkill;

            function calculateAttack(x, y){

                // Randomly generate defender skill for garrison battles
                if (defenderSkill == 0){
                    defenderSkill = Math.floor(Math.random() * 3 + 1)
                    garrisonCheck = true;
                }
                else if (defenderSkill == -1){
                    defenderSkill = 4;
                    entrenchCheck = true;
                }

                // Calculate relative strength:
                while (attackerSkill > 1 && defenderSkill > 1){
                    attackerSkill--;
                    defenderSkill--;
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
                    let shot = Math.random() * 10;
                    if (shot >= 4 + attackerSkill){
                        defenderDamage++;
                    }
                }

                // Reset defender and attacker skills for garrison and entrenchment battles
                if (garrisonCheck){
                    defenderSkill = 0;
                }
                if (entrenchCheck){
                    defenderSkill = -1;
                }

                // Check for attacker crits
                if (attackerCrit == 20){

                    // Recalculate damage
                    attackerDamage = Math.floor(attackerDamage * 2);
                    defenderDamage = Math.floor(defenderDamage * 0.5);
                }

                // Check for defender crits
                if (defenderCrit == 20){

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

                // Determine end status

                // Attacking force is wiped out
                if (x < 1){
                    defendVictories++;
                    attackSimTotal += attackerDamageDisplay;
                    defendSimTotal += defenderDamageDisplay;
                    return;
                }

                // Defending force is wiped out
                else if (y < 1){
                    attackVictories++;
                    attackSimTotal += attackerDamageDisplay;
                    defendSimTotal += defenderDamageDisplay;
                    return;
                }

                // Checks for stalemates or strategic victories
                else{

                    // Stalemate
                    if (attackerDamageDisplay <= (defenderDamageDisplay * 1.25) && attackerDamageDisplay >= (defenderDamageDisplay * 0.75)){
                        stalemates ++;
                        attackSimTotal += attackerDamageDisplay;
                        defendSimTotal += defenderDamageDisplay;
                        return;
                    }

                    // Attacker strategic victory
                    else if (attackerDamageDisplay > (defenderDamageDisplay * 1.25)){
                        attackStrategicVictories++;
                        attackSimTotal += attackerDamageDisplay;
                        defendSimTotal += defenderDamageDisplay;
                        return;
                    }

                    // Defender strategic victory
                    else if (defenderDamageDisplay > (attackerDamageDisplay * 1.25)){
                        defendStrategicVictories++;
                        attackSimTotal += attackerDamageDisplay;
                        defendSimTotal += defenderDamageDisplay;
                        return;
                    }
                }
            }

            for (let i = 0; i < 1000; i++){
                calculateAttack(attackers, defenders,);
            }

            // Get timestamp for logs
            let timeStamp = new Date();

            // Console logs for tracking
            console.log('')
            console.log('~~~~~~~~~~~~~~~~~~~~')
            console.log('Analyze command successfully run')
            console.log(timeStamp.toDateString())
            console.log(timeStamp.toLocaleTimeString())
            console.log('~~~~~~~~~~~~~~~~~~~~')

            // Set correct display values for garrison and entrench battles
            if (garrisonCheck){
                defenderSkill = 'Garrison (random level, 1-3)';
            }
            if (entrenchCheck){
                defenderSkill = 'Entrenchment (level 4)'
            }

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
                    { name: 'Attacker skill level', value: `${attackerSkillDisplay}`, inline: true },
                    { name: 'Defender skill level', value: `${defenderSkillDisplay}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '\u200B', value: '__**Expected outcomes:**__'},
                    { name: 'Attacker total victory', value: `${Math.round(((attackVictories / 1000) * 100) * 10) / 10}%`, inline: true },
                    { name: 'Defender total victory', value: `${Math.round(((defendVictories / 1000) * 100) * 10) / 10}%`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attacker strategic victory', value: `${Math.round(((attackStrategicVictories / 1000) * 100) * 10) / 10}%`, inline: true },
                    { name: 'Defender strategic victory', value: `${Math.round(((defendStrategicVictories / 1000) * 100) * 10) / 10}%`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Stalemate', value: `${Math.round(((stalemates / 1000) * 100) * 10) / 10}%`, inline: true },
                    { name: '\u200B', value: '__**Average Casualties:**__'},
                    { name: 'Attackers', value: `${Math.round(defendSimTotal / 1000)}`, inline: true },
                    { name: 'Defenders', value: `${Math.round(attackSimTotal / 1000)}`, inline: true },
                    { name: '\u200B', value: '\u200B' }
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}