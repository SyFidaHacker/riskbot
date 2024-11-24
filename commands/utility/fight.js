const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Calculates the result of a battle')
        .addStringOption(option =>
            option.setName('attacker_state')
                .setDescription(`State attack is coming from`)
                .setRequired(true))
        .addStringOption(option =>
            option.setName('defender_state')
                .setDescription(`State being attacked`)
                .setRequired(true))
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
            await interaction.reply({ content: 'Battle Commencing', ephemeral: true });
            await interaction.deleteReply();
            let attackerState = interaction.options.getString('attacker_state');
            let defenderState = interaction.options.getString('defender_state');
            let attackers = interaction.options.getInteger('attackers');
            let defenders = interaction.options.getInteger('defenders');
            let attackerStance = interaction.options.getString('attacker_stance');
            let defenderStance = interaction.options.getString('defender_stance');
            let totalAttackerDeaths = 0;
            let totalDefenderDeaths = 0;
            let totalAttackerRouts = 0;
            let totalDefenderRouts = 0;
            let rounds = 0;

            // Console logs: Battle initiation
            console.log('------------------------------')
            console.log('------------------------------')
            console.log('from: ' + attackerState)
            console.log('to: ' + defenderState)

            // Bases chance to hit variables:
            let attackerChanceToHit;
            let defenderChanceToHit;

            function calculateAttack(x, y){
                
                // Increment round counter
                rounds++;

                // Console logs: Beginning of round report
                console.log('ROUND ' + rounds)
                console.log()
                console.log('starting attackers: ' + x)
                console.log('starting defenders: ' + y)
                console.log('attacker stance: ' + attackerStance)
                console.log('defender stance: ' + defenderStance)

                // // Check if round 1
                if (rounds == 1){
                    attackerChanceToHit = Math.floor(Math.random() * 21 + 10)/100;
                    defenderChanceToHit = Math.floor(Math.random() * 21 + 10)/100;
                }

                // Running totals of deaths inflicted by each side
                let attackerDeaths = 0;
                let defenderDeaths = 0;

                // Running totals of routed troops for each side
                let attackerRouts = 0;
                let defenderRouts = 0;

                // Base chance to rout variables:
                let attackerChanceToRout = 0.25;
                let defenderChanceToRout = 0.25;

                // Console logs: base damage and rout chances
                console.log('attacker base chance to hit: ' + attackerChanceToHit)
                console.log('attacker base chance to rout: ' + attackerChanceToRout)
                console.log('defender base chance to hit: ' + defenderChanceToHit)
                console.log('defender base chance to rout: ' + defenderChanceToRout)

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

                // Console logs: damage and rout chances after stance bonuses
                console.log('attacker modified chance to hit: ' + attackerChanceToHit)
                console.log('attacker modified chance to rout: ' + attackerChanceToRout)
                console.log('defender modified chance to hit: ' + defenderChanceToHit)
                console.log('defender modified chance to rout: ' + defenderChanceToRout)

                // Variables for each side's remaining troops
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

                // Add each side's deaths to the running total
                totalAttackerDeaths+= attackerDeaths;
                totalDefenderDeaths+= defenderDeaths;

                // Add each side's routs to the running total
                totalAttackerRouts+= attackerRouts;
                totalDefenderRouts+= defenderRouts;

                // Console logs: Casualty report
                console.log()
                console.log('attacker deaths: ' + attackerDeaths)
                console.log('attacker routs: ' + attackerRouts)
                console.log()
                console.log('defender deaths: ' + defenderDeaths)
                console.log('defender routs: ' + defenderRouts)
            
                // Calculate remaining troops by subtracting damage
                x -= (attackerDeaths + attackerRouts);
                y -= (defenderDeaths + defenderRouts);
                
                // Console logs: End of round report
                console.log()
                console.log('remaining attackers: ' + x)
                console.log('remaining defenders: ' + y)
                console.log()
                console.log('END OF ROUND')
                console.log()

                // Check if battle should run again based on army stance and troop count
                if (x < 1 && y < 1){
                    outcome = 'Draw';
                    let response = {
                        attackers: x,
                        defenders: y,
                        outcome: outcome
                    }
                    return response;
                }
                if (x < 1){
                    outcome = 'Defenders keep the state';
                    let response = {
                        attackers: x,
                        defenders: y,
                        outcome: outcome
                    }
                    return response;
                }
                else if (y < 1){
                    outcome = 'Attackers take the state';
                    let response = {
                        attackers: x,
                        defenders: y,
                        outcome: outcome
                    }
                    return response;
                }
                else{
                    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
                    console.log()
                    return calculateAttack(x, y);
                }
            }
            
            // Response variable, run function
            let res = calculateAttack(attackers, defenders);

            // Console logs: End of battle report
            console.log('******************************')
            console.log()
            console.log('END OF BATTLE')
            console.log()
            console.log('total attacker deaths: ' + totalAttackerDeaths)
            console.log('total attacker routs: ' + totalAttackerRouts)
            console.log("TOTAL ATTACKER CASUALTIES: " + (totalAttackerDeaths + totalAttackerRouts))
            console.log()
            console.log('total defender deaths: ' + totalDefenderDeaths)
            console.log('total defender routs: ' + totalDefenderRouts)
            console.log("TOTAL DEFENDER CASUALTIES: " + (totalDefenderDeaths + totalDefenderRouts))
            console.log('------------------------------')
            console.log('------------------------------')

            // Embed image
            let imageURL = 'https://d3d00swyhr67nd.cloudfront.net/w944h944/collection/LW/RHOC/LW_RHOC_8-001.jpg';

            // Embed builder
            const exampleEmbed = new EmbedBuilder()
                .setColor('#fc0303')
                .setTitle(`Jean Lafitte's Virginia Memorial Battle Simulator`)
                .setImage(`${imageURL}`)
                .setDescription(`"Mama ain't raised no wuss" -Jean Lafitte, 1815`)
                .addFields(
                    { name: '\u200B', value: '\u200B' },
                    { name: 'From', value: `${attackerState}`, inline: true },
                    { name: 'To', value: `${defenderState}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Initial Attackers', value: `${attackers}`, inline: true },
                    { name: 'Initial Defenders', value: `${defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attacker stance', value: `${attackerStance}`, inline: true },
                    { name: 'Defender stance', value: `${defenderStance}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attacker deaths', value: `${totalAttackerDeaths}`, inline: true },
                    { name: 'Defender deaths', value: `${totalDefenderDeaths}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Attackers remaining', value: `${res.attackers}`, inline: true },
                    { name: 'Defenders remaining', value: `${res.defenders}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Routed attackers', value: `${totalAttackerRouts}`, inline: true },
                    { name: 'Routed defenders', value: `${totalDefenderRouts}`, inline: true },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'Rounds fought', value: `${rounds}`, inline: true },
                    { name: 'Outcome', value: `${res.outcome}`, inline: true },
                    { name: '\u200B', value: '\u200B' }
                )
                .setTimestamp();

            interaction.channel.send({ embeds: [exampleEmbed] });
        },
}