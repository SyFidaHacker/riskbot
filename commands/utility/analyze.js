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
                    {name: 'Assault', value: 'Assault'},
                    {name: 'Raid', value: 'Raid'},
                    {name: 'Shock', value: 'Shock'}
                ))
        .addStringOption(option =>
            option.setName('defender_stance')
                .setDescription(`Defending army's stance`)
                .setRequired(true)
                .addChoices(
                    {name: 'Hold', value: 'Hold'},
                    {name: 'Retreat', value: 'Retreat'},
                    {name: 'Entrench', value: 'Entrench'}
                )),
        async execute(interaction) {
            await interaction.reply({ content: 'Running simulation', ephemeral: true });
            await interaction.deleteReply();
            let attackers = interaction.options.getInteger('attackers');
            let defenders = interaction.options.getInteger('defenders');
            let attackerStance = interaction.options.getString('attacker_stance');
            let defenderStance = interaction.options.getString('defender_stance');
            let totalAttackerDeaths = 0;
            let totalDefenderDeaths = 0;
            let totalAttackerRouts = 0;
            let totalDefenderRouts = 0;
            let attackerKillCount = 0;
            let defenderKillCount = 0;
            let rounds = 0;
            let attackVictories = 0;
            let defendVictories = 0;
            let draws = 0;
            let attackerOutdamages = 0;
            let defenderOutdamages = 0;
            let projectedOutcome = '';

            // Bases chance to hit variables:
            let attackerChanceToHit;
            let defenderChanceToHit;

            function calculateAttack(x, y){

                // Increment round counter
                rounds++;

                // // Check if round 1
                if (rounds == 1){
                    attackerChanceToHit = Math.floor(Math.random() * 21 + 10)/100;
                    defenderChanceToHit = Math.floor(Math.random() * 21 + 10)/100;
                }

                // Running totals of the kills inflicted by each side
                let attackerDeaths = 0;
                let defenderDeaths = 0;

                // Running totals of routed troops for each side
                let attackerRouts = 0;
                let defenderRouts = 0;

                // Base chance to rout variables:
                let attackerChanceToRout = 0.25;
                let defenderChanceToRout = 0.25;

                // Alter damage and rout modifiers based on army stances
                if (attackerStance == 'Raid'){
                    attackerChanceToHit = 0.75;
                    defenderChanceToRout = 0.1;
                    if (startingAttackers > Math.floor(startingDefenders / 4) && rounds == 1){
                        x = Math.floor(startingDefenders / 4);
                    }
                }
                if (attackerStance == 'Shock'){
                    attackerChanceToRout = 0;
                    if (defenderStance != 'Entrench'){
                        defenderChanceToHit/= 1.75;
                        defenderChanceToRout = 0.9;
                    }
                }
                if (defenderStance == 'Entrench'){
                    defenderChanceToRout = 0;
                    if (attackerStance != 'Shock'){
                        attackerChanceToHit/= 1.75;
                        attackerChanceToRout = 0.9;
                    }
                }
                if (defenderStance == 'Retreat'){
                    defenderChanceToRout = 0.9;
                    defenderChanceToHit*= 0.75;
                }
            
                // Variable for each side's remaining troops
                let currentAttackers = x;
                let currentDefenders = y;
            
                // Loop through every attacking troop to see if its "shot" hit or missed
                for (i = 0; i < x; i++){
                    if (currentDefenders > 0){
                        let shot = Math.random();
                        if (shot >= (1 - attackerChanceToHit)){
                            currentDefenders--;
                            let shellShock = Math.random();
                            if (shellShock >= (1 - defenderChanceToRout)){
                                defenderRouts++;
                            }
                            else{
                                defenderDeaths++;
                            }
                        }
                    }
                }

                // Loop through the defending troops, doing the same thing
                for (i = 0; i < y; i++){
                    if (currentAttackers > 0){
                        let shot = Math.random();
                        if (shot >= (1 - defenderChanceToHit)){
                            currentAttackers--;
                            let shellShock = Math.random();
                            if (shellShock >= (1 - attackerChanceToRout)){
                                attackerRouts++;
                            }
                            else{
                                attackerDeaths++;
                            }
                        }
                    }
                }

                // Add each side's kills to the running total
                totalAttackerDeaths+= attackerDeaths;
                totalDefenderDeaths+= defenderDeaths;

                // Add each side's routs to the running total
                totalAttackerRouts+= attackerRouts;
                totalDefenderRouts+= defenderRouts;

                // Calculate remaining troops by subtracting damage
                x -= (attackerDeaths + attackerRouts);
                y -= (defenderDeaths + defenderRouts);

                // Add each side's kills to kill count check
                attackerKillCount+= defenderDeaths;
                defenderKillCount+= attackerDeaths;

                // Check if battle should run again based on army stance and troop count
                if (x < 1 && y < 1){
                    draws++;
                    attackVictories+= 0.5;
                    defendVictories+= 0.5;

                    // Compare kill counts
                    if (attackerKillCount > defenderKillCount){
                        attackerOutdamages++;
                    }
                    else if (defenderKillCount > attackerKillCount){
                        defenderOutdamages++;
                    }
                    else{
                        attackerOutdamages+= 0.5;
                        defenderOutdamages+= 0.5;
                    }

                    // Reset kill counts
                    attackerKillCount = 0;
                    defenderKillCount = 0;

                    // Reset rounds
                    rounds = 0;
                }
                else if (x < 1){
                    defendVictories++;

                    // Compare kill counts
                    if (attackerKillCount > defenderKillCount){
                        attackerOutdamages++;
                    }
                    else if (defenderKillCount > attackerKillCount){
                        defenderOutdamages++;
                    }
                    else{
                        attackerOutdamages+= 0.5;
                        defenderOutdamages+= 0.5;
                    }

                    // Reset kill counts
                    attackerKillCount = 0;
                    defenderKillCount = 0;
            
                    // Reset rounds
                    rounds = 0;
                }
                else if (y < 1){
                    attackVictories++;

                    // Compare kill counts
                    if (attackerKillCount > defenderKillCount){
                        attackerOutdamages++;
                    }
                    else if (defenderKillCount > attackerKillCount){
                        defenderOutdamages++;
                    }
                    else{
                        attackerOutdamages+= 0.5;
                        defenderOutdamages+= 0.5;
                    }

                    // Reset kill counts
                    attackerKillCount = 0;
                    defenderKillCount = 0;
            
                    // Reset rounds
                    rounds = 0;
                }
                else{
                    return calculateAttack(x, y, attackerStance, defenderStance);
                }
            }

            for (let i = 0; i < 10000; i++){
                calculateAttack(attackers, defenders);
            }

            if (attackVictories > defendVictories){
                projectedOutcome = 'Attackers take the state';
            }
            else if (defendVictories > attackVictories){
                projectedOutcome = 'Defenders keep the state'
            }
            else{
                projectedVictor = 'Too close to call';
            }

            let attackerMean = (Math.round((totalAttackerDeaths + totalAttackerRouts) / 10000));
            let defenderMean = (Math.round((totalDefenderDeaths + totalDefenderRouts) / 10000));
            let attackerMeanDeath = (Math.round(totalAttackerDeaths / 10000));
            let attackerMeanRout = (Math.round(totalAttackerRouts / 10000));
            let defenderMeanDeath = (Math.round(totalDefenderDeaths / 10000));
            let defenderMeanRout = (Math.round(totalDefenderRouts / 10000));

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
                    { name: 'Average Attacker Deaths', value: `${attackerMeanDeath}`, inline: true },
                    { name: 'Average Defender Deaths', value: `${defenderMeanDeath}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Average Routed Attackers', value: `${attackerMeanRout}`, inline: true },
                    { name: 'Average Routed Defenders', value: `${defenderMeanRout}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Average Attacker Combined Casualties', value: `${attackerMean}`, inline: true },
                    { name: 'Average Defender Combined Casualties', value: `${defenderMean}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '\u200B', value: 'Likelihood of inflicting more kills:'},
                    { name: 'Attackers', value: `${Math.round(((attackerOutdamages / 10000) * 100) * 10) / 10}%`, inline: true },
                    { name: 'Defenders', value: `${Math.round(((defenderOutdamages / 10000) * 100) * 10) / 10}%`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: '\u200B', value: 'Likelihood of winning the state:'},
                    { name: 'Attackers', value: `${Math.round(((attackVictories / 10000) * 100) * 10) / 10}%`, inline: true },
                    { name: 'Defenders', value: `${Math.round(((defendVictories / 10000) * 100) * 10) / 10}%`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Projected Outcome', value: `${projectedOutcome}`, inline: true },
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}