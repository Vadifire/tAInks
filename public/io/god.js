/*
 * God class is respsonible for influencing
 * the evolution of tanks, independently of any
 * evolutionary / natural selection forces.
 *
 * Because we love our player so very much, they
 * get to be God here!
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/*
 * Instead of using only fitness function, allow God to make decisions.
 * Each selected tank will be preseved, and remaining unselected tanks will
 * be replaced with mutants of the selected.
 *
 * @param {Map <number, Tank>} tankList - List of tanks to evolve
 * @param {number} mutationStrength - the amount to mutate unselected tanks
 * @param {number} mutationRate - the rate to mutate unselected tanks weights and biases
 * @returns {Map <number, Tank>} new Tank map, but with evolved neural networks
 */
function evolveUnselected(tankList, mutationStrength, mutationRate) {
    var originalSize = tankList.size;
    var newMap = new Map(); //Map which will contain selected and evolved tanks
    var unselected = new Map(); //Map of tanks to be overwritten

    var totalSelectedFitness = 0;

    //Populate selected tanks
    tankList.forEach(function (tank) {
        if (tank.selected === true) {
            newMap.set(tank.id, tank); //TODO: perhaps we just want to maintain a list of selected tanks
            totalSelectedFitness += tank.calculateFitness();
        } else {
            unselected.set(tank.id, tank);
        }
    });

    if (newMap.size == 0) { //Absolutely nothing was selected
        return evolve(tankList); //Fall back on normal evolution (God has foresaken us :<)
    }

    //Assign probabilities for being a mutant of selected tanks based on fitness
    var countedProb = 0;
    var probabilities = [];
    newMap.forEach(function (tank) { // for all selected tanks
        countedProb += (tank.calculateFitness() / totalSelectedFitness); // get relative probability through fitness
        probabilities.push({network: tank.neuralNetwork.network, probability: countedProb});
    });

    //Mutate the unselected tanks at constant strength/rate (for now at least)
    unselected.forEach(function (tank){
        var rand = Math.random();
        for (var i = 0; i < probabilities.length; i++) {
            if (rand < probabilities[i].probability) { //Reached probability bin
                tank.neuralNetwork.network = JSON.parse(JSON.stringify(probabilities[i].network)); //select parent neural network to mutate off
                tank.neuralNetwork.mutate(mutationStrength, mutationRate); //Mutate
                break;
            }
        }
        newMap.set(tank.id, tank); //add new mutant to final map
    });

    return newMap;
}