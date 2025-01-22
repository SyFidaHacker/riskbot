let totalAttackerDeaths = 0;
let totalDefenderDeaths = 0;
let totalAttackerRouts = 0;
let totalDefenderRouts = 0;
let rounds = 0;
let attackSimTotal = 0;
let defendSimTotal = 0;
let attackVictories = 0;
let defendVictories = 0;
let draws = 0;
let attackerOutdamages = 0;
let defenderOutdamages = 0;
let projectedVictor = '';
let attackerHighest = 0;
let attackerHighestRunning = 0;
let attackerLowest = 10000;
let attackerLowestRunning = 0;
let defenderHighest = 0;
let defenderHighestRunning = 0;
let defenderLowest = 10000;
let defenderLowestRunning = 0;
let attackerSDArr = [];
let defenderSDArr = [];

// Variables up here so I don't have to scroll all the way down
let startingAttackers = 200;
let startingDefenders = 100;
let attackerStance = 'shock';
let defenderStance = 'retreat';
let iterations = 10000;

// Bases chance to hit variables:
let attackerChanceToHit;
let defenderChanceToHit;

function calculateAttack(x, y, attackerStance, defenderStance){

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

    // Running total of routed troops for each side
    let attackerRouts = 0;
    let defenderRouts = 0;
    
    // Base chance to rout variables:
    let attackerChanceToRout = 0.25;
    let defenderChanceToRout = 0.25;

    // Alter damage and rout modifiers based on army stances
    if (attackerStance == 'assault'){
    }
    if (attackerStance == 'raid'){
        attackerChanceToHit = 0.75;
        defenderChanceToRout = 0.1;
        if (startingAttackers > Math.floor(startingDefenders / 4) && rounds == 1){
            x = Math.floor(startingDefenders / 4);
        }
    }
    if (attackerStance == 'shock'){
        attackerChanceToRout = 0;
        if (defenderStance != 'entrench'){
            defenderChanceToHit/= 1.75;
            defenderChanceToRout = 0.9;
        }
    }
    if (defenderStance == 'entrench'){
        defenderChanceToRout = 0;
        if (attackerStance != 'shock'){
            attackerChanceToHit/= 1.75;
            attackerChanceToRout = 0.9;
        }
    }
    if (defenderStance == 'retreat'){
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

    // Add each side's damage to the running total
    totalAttackerDeaths+= attackerDeaths;
    totalDefenderDeaths+= defenderDeaths;

    // Add each side's routs to the running total
    totalAttackerRouts+= attackerRouts;
    totalDefenderRouts+= defenderRouts;

    // Calculate remaining troops by subtracting damage
    x -= (attackerDeaths + attackerRouts);
    y -= (defenderDeaths + defenderRouts);

    // Add casualties to high/low running totals:
    attackerHighestRunning += (attackerDeaths + attackerRouts);
    attackerLowestRunning += (attackerDeaths + attackerRouts);
    defenderHighestRunning += (defenderDeaths + defenderRouts);
    defenderLowestRunning += (defenderDeaths + defenderRouts);

    // Check if battle should run again based on army stance and troop count
    if (x < 1 && y < 1){
        draws++;

        // Reset rounds
        rounds = 0;

        // Add total casualties to standard deviation array
        attackerSDArr.push(attackerHighestRunning);
        defenderSDArr.push(defenderHighestRunning);

        // Check highs and lows
        if (attackerHighestRunning > attackerHighest){
            attackerHighest = attackerHighestRunning;
        }
        if (attackerLowestRunning < attackerLowest){
            attackerLowest = attackerLowestRunning;
        }
        if (defenderHighestRunning > defenderHighest){
            defenderHighest = defenderHighestRunning;
        }
        if (defenderLowestRunning < defenderLowest){
            defenderLowest = defenderLowestRunning;
        }

        // Reset high/low running totals
        attackerHighestRunning = 0;
        attackerLowestRunning = 0;
        defenderHighestRunning = 0;
        defenderLowestRunning = 0;
    }
    else if (x < 1){
        victor = 'Defenders';
        defendVictories++;

        // Reset rounds
        rounds = 0;

        let response = {
            attackers: x,
            defenders: y,
            victor: victor
        }

        // Add total casualties to standard deviation array
        attackerSDArr.push(attackerHighestRunning);
        defenderSDArr.push(defenderHighestRunning);

        // Check highs and lows
        if (attackerHighestRunning > attackerHighest){
            attackerHighest = attackerHighestRunning;
        }
        if (attackerLowestRunning < attackerLowest){
            attackerLowest = attackerLowestRunning;
        }
        if (defenderHighestRunning > defenderHighest){
            defenderHighest = defenderHighestRunning;
        }
        if (defenderLowestRunning < defenderLowest){
            defenderLowest = defenderLowestRunning;
        }

        // Reset high/low running totals
        attackerHighestRunning = 0;
        attackerLowestRunning = 0;
        defenderHighestRunning = 0;
        defenderLowestRunning = 0;

        return response;
    }
    else if (y < 1){
        victor = 'Attackers';
        attackVictories++;

        // Reset rounds
        rounds = 0;

        let response = {
            attackers: x,
            defenders: y,
            victor: victor
        }

        // Add total casualties to standard deviation array
        attackerSDArr.push(attackerHighestRunning);
        defenderSDArr.push(defenderHighestRunning);

        // Check highs and lows
        if (attackerHighestRunning > attackerHighest){
            attackerHighest = attackerHighestRunning;
        }
        if (attackerLowestRunning < attackerLowest){
            attackerLowest = attackerLowestRunning;
        }
        if (defenderHighestRunning > defenderHighest){
            defenderHighest = defenderHighestRunning;
        }
        if (defenderLowestRunning < defenderLowest){
            defenderLowest = defenderLowestRunning;
        }

        // Reset high/low running totals
        attackerHighestRunning = 0;
        attackerLowestRunning = 0;
        defenderHighestRunning = 0;
        defenderLowestRunning = 0;

        return response;
    }
    else{
        return calculateAttack(x, y, attackerStance, defenderStance);
    }

}

for (let i = 0; i < iterations; i++){
    calculateAttack(startingAttackers, startingDefenders, attackerStance, defenderStance);
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

let attackerMean = (Math.round((totalAttackerDeaths + totalAttackerRouts) / 10000));
let defenderMean = (Math.round((totalDefenderDeaths + totalDefenderRouts) / 10000));
let attackerMeanDeath = (Math.round(totalAttackerDeaths / 10000));
let attackerMeanRout = (Math.round(totalAttackerRouts / 10000));
let defenderMeanDeath = (Math.round(totalDefenderDeaths / 10000));
let defenderMeanRout = (Math.round(totalDefenderRouts / 10000));

console.log('------------------------------')
console.log('attacker victories: ' + attackVictories)
console.log('defender victories: ' + defendVictories)
console.log('draws: ' + draws)
console.log('------------------------------')
console.log('average attacker casualties: ' + attackerMean)
console.log('attacker highest: ' + attackerHighest)
console.log('attacker lowest: ' + attackerLowest)
console.log('average attacker deaths: ' + attackerMeanDeath)
console.log('average attacker routs: ' + attackerMeanRout)
console.log('------------------------------')
console.log('average defender casualties: ' + defenderMean)
console.log('defender highest: ' + defenderHighest)
console.log('defender lowest: ' + defenderLowest)
console.log('average defender deaths: ' + defenderMeanDeath)
console.log('average defender routs: ' + defenderMeanRout)
console.log('------------------------------')

let attackerSDSum = 0;
let defenderSDSum = 0;

for (let i = 0; i < attackerSDArr.length; i++){
    let anum = (attackerSDArr[i] - attackerMean) * (attackerSDArr[i] - attackerMean);
    attackerSDSum+= anum;
}
for (let i = 0; i < defenderSDArr.length; i++){
    let dnum = (defenderSDArr[i] - defenderMean) * (defenderSDArr[i] - defenderMean);
    defenderSDSum+= dnum;
}

console.log('attacker standard deviation: ' + Math.sqrt(attackerSDSum/10000));
console.log('defender standard deviation: ' + Math.sqrt(defenderSDSum/10000));
console.log('------------------------------')