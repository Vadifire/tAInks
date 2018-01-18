/*
 * Contains various genetic-algorithm based
 * evolution strategies
 *
 * Authors:
 *  @author Cedric Debelle
 *  @author Calvin Ellis
 */


/*
 * Central entry point function for processing evolution
 * As more evolution implementations are added, settings
 * will control which are invoked
 */
function evolve(tankList) {
    //evolveUnselected(0.6, 0.4); //Need to be careful of infinite loop
    evolveMutation(tankList, 0.6, 0.4);
}


/*
 * Strictly mutation based genetic algorithm 
 * Strength of mutation is inversly propotional to current fitness function
 *
 * @param {Map <number, Tank>} tankList - List of tanks to evolve
 * @param {number} maxMutationStrength - the degree to mutate the worst tank [0,1]
 * @param {number} maxMutationRate - the rate at which weights/biases mutate in the worst tank [0,1]
 * @returns {Map <number, Tank>} new map based on original tanks, but with evolved neural networks
 */
function evolveMutation(tankList, maxMutationStrength, maxMutationRate) {
    var evolutionArray = Array.from(tankList.values()); // copy original map to array
    var evolvedMap = new Map(); //Map which will return evolved tanks

    var totalPop = evolutionArray.length;
    evolutionArray.sort(function (t1, t2) { //Sort in descending order of fitness
        return t2.calculateFitness() - t1.calculateFitness();
    });

    for (var i = 0; i < totalPop; i++){ //Evolve every tank and add to evolvedMap
        var tank = evolutionArray[i];
        if (tank.neuralNetwork) { //tank is AI controlled
            tank.neuralNetwork.mutate(maxMutationStrength * (i / (totalPop - 1) ),// mutation ~ 1/fitness
                maxMutationRate ); // this may be too conservative, but hopefully sustains growth
        }
        evolvedMap.set(tank.id, tank); // Add potentially modified tank to new map
    }

    return evolvedMap;
}
