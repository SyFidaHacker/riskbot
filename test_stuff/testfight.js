let totalAttackerDeaths = 0;
let totalDefenderDeaths = 0;
let totalAttackerRouts = 0;
let totalDefenderRouts = 0;
let rounds = 0;

console.log('------------------------------')
console.log('------------------------------')

// Bases chance to hit variables:
let attackerChanceToHit = Math.floor(Math.random() * 41 + 10)/100;
let defenderChanceToHit = Math.floor(Math.random() * 41 + 10)/100;

// Variables up here so I don't have to scroll all the way down
let startingAttackers = 200;
let startingDefenders = 300;
let attackerStance = 'raid';
let defenderStance = 'retreat';

function calculateAttack(x, y, attackerStance, defenderStance){

    // Increment round counter
    rounds++;
    console.log('ROUND ' + rounds)
    console.log()
    console.log('starting attackers: ' + x)
    console.log('starting defenders: ' + y)
    console.log('attacker stance: ' + attackerStance)
    console.log('defender stance: ' + defenderStance)

    // // Check if round 1
    if (rounds == 1){
        attackerChanceToHit = Math.floor(Math.random() * 46 + 5)/100;
        defenderChanceToHit = Math.floor(Math.random() * 46 + 5)/100;
    }

    // Running totals of the deaths inflicted by each side
    let attackerDeaths = 0;
    let defenderDeaths = 0;

     // Running total of routed troops for each side
     let attackerRouts = 0;
     let defenderRouts = 0;

    // Base chance to rout variables:
    let attackerChanceToRout = 0.25;
    let defenderChanceToRout = 0.25;

    console.log('attacker base chance to hit: ' + attackerChanceToHit)
    console.log('attacker base chance to rout: ' + attackerChanceToRout)
    console.log('defender base chance to hit: ' + defenderChanceToHit)
    console.log('defender base chance to rout: ' + defenderChanceToRout)

    // Alter damage and rout modifiers based on army stances
    if (attackerStance == 'assault'){
    }
    if (attackerStance == 'raid'){
        defenderChanceToHit*= 0.5;
        if (startingAttackers > Math.floor(startingDefenders / 5) && rounds == 1){
            x = Math.floor(startingDefenders / 5);
        }
    }
    if (defenderStance == 'entrench'){
        if (startingAttackers > startingDefenders){
            let bonus = (x/y) + 1;
            // attackerChanceToHit/= 1.5;
            attackerChanceToRout*= 3;
        }
        defenderChanceToRout = 0;
    }
    if (defenderStance == 'retreat'){
    }

    // console.log('attacker modified chance to hit: ' + attackerChanceToHit)
    // console.log('attacker modified chance to rout: ' + attackerChanceToRout)
    console.log('defender modified chance to hit: ' + defenderChanceToHit)
    // console.log('defender modified chance to rout: ' + defenderChanceToRout)

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
                if (shellShock >= (1 - attackerChanceToRout)){
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
                if (shellShock >= (1 - defenderChanceToRout)){
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

    console.log()
    console.log('attacker deaths: ' + attackerDeaths)
    console.log('attacker routs: ' + attackerRouts)
    console.log()
    console.log('defender deaths: ' + defenderDeaths)
    console.log('defender routs: ' + defenderRouts)

    // Calculate remaining troops by subtracting damage
    x -= (attackerDeaths + attackerRouts);
    y -= (defenderDeaths + defenderRouts);
    
    console.log()
    console.log('remaining attackers: ' + x)
    console.log('remaining defenders: ' + y)
    console.log()
    console.log('END OF ROUND')
    console.log()

    // Check if battle should run again based on army stance and troop count
    if (x < 1 && y < 1){
        victor = 'Draw';
        let response = {
            attackers: x,
            defenders: y,
            victor: victor
        }
        return response;
    }
    if (x < 1){
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
    else{
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log()
        return calculateAttack(x, y, attackerStance, defenderStance);
    }
}

calculateAttack(startingAttackers, startingDefenders, attackerStance, defenderStance);

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

// let testCount = 0;
// function test(){
//     testCount++;
//     let baseDamage = Math.floor(Math.random() * 21 + 20)/100;
//     if (baseDamage == 0.2){
//         console.log(testCount)
//         console.log('done')
//     }
//     else{
//         return test();
//     }
// }

// test();