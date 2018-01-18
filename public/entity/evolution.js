/*
 * Contains various genetic-algorithm based
 * evolution strategies
 *
 * Authors:
 *  @author Cedric Debelle
 *  @author Calvin Ellis
 */

var cumulativeScore; //used across evolvePopulation()

/*
 * Central entry point function for processing evolution
 * As more evolution implementations are added, settings
 * will control which are invoked
 *
 * @param {Map <number, Tank>} tankMap - Map of tanks
 * @returns {Map <number, Tank>} map of original tanks, but with evolved neural networks
 */
function evolve(tankMap) {
    //evolveMutation(tankMap, 0.6, 0.4);
    cumulativeScore = evolvePopulation(tankMap, cumulativeScore);
}

/* 
 * Fitness sorter utility function
 * @param {Map <number, Tank>} tankMap - Map of tanks
 * @returns {Array<Tank>} - Tanks sorted by calculated fitness
 */
function sortByFitness(tankMap){
    var array = Array.from(tankMap.values()); // copy original map to array
    array.sort(function (t1, t2) { //Sort in descending order of fitness
        return t2.calculateFitness() - t1.calculateFitness();
    });
    return array;
}

/* 
 * Fitness average utility function
 * @param {Map <number, Tank>} tankMap - Map of tanks
 * @returns {number} - The average fitness of the tanks
 */
function getAverageFitness(tankMap){ 
    var average = 0;
    tankMap.forEach(function (tank) { 
        average += tank.calculateFitness();
    });
    return (average / tankMap.size);
}

/*
 * Have top of tank population reproduce, bottom be replaced, middle mutate.
 * Uses cumulative scoring to lower variance in performance evaluation
 * 
 * @param {Map <number, Tank>} tankMap - Map of tanks to evolve
 * @param {Map <number, number>} score - Map of tank ids to cumulative score
 * @returns {Object} - the updated scorecard
 */
function evolvePopulation(tankMap, score) {
    const SHIFT = 1; // +/- incentive for performance
    const MAX_SCORE = 3; // cap on score
    const MIN_SCORE = -MAX_SCORE; //cap on min
    const THRESHOLD = 4; // once two tanks meet threshold, can replace inferior

    if (!score){ //init score
        score = new Map();
        tankMap.forEach(function (tank) { 
            score.set(tank.id, 0); //Set all scores to default of 0
        });
    }

    var sorted = sortByFitness(tankMap);

    for (var i = 0; i < sorted.length/3; i++){ 

        console.log(i);

        var id1 = sorted[i].id; //top 3rd
        score.set(id1, Math.min(score.get(id1) + SHIFT, MAX_SCORE)); // += SHIFT

        id2 = sorted.length-1-i; //bottom 3rd
        score.set(id2, Math.max(score.get(id2) - SHIFT, MIN_SCORE)); // -= SHIFT

        if ((score.get(id1) - score.get(id2)) >= THRESHOLD){ //sufficient score delta
            console.log("SCORE DELTA THRESHOLD EXCEEDED");

            var child = tankMap.get(id2); // new child will replace lower performing tank
            var parent = tankMap.get(id1);

            console.log(id1+" used as a parent");
            console.log(id2+" replaced with a child");

            //asexual 0 mutation reproduction for now (testing)
            child.neuralNetwork.network = parent.neuralNetwork.crossoverNeurons(parent.neuralNetwork.network, 1);
            score.set(id2, 1); //bias to think child is OK
        }
    }
    console.log(score);
    return score;
}

/*
 * Strictly mutation based genetic algorithm 
 * Strength of mutation is inversly propotional to current fitness function
 *
 * @param {Map <number, Tank>} tankMap - Map of tanks to evolve
 * @param {number} maxMutationStrength - the degree to mutate the worst tank [0,1]
 * @param {number} maxMutationRate - the rate at which weights/biases mutate in the worst tank [0,1]
 */
function evolveMutation(tankMap, maxMutationStrength, maxMutationRate) {
    var sortedArray = sortByFitness(tankMap);
    var totalPop = sortedArray.length;

    for (var i = 0; i < totalPop; i++){ //Evolve every tank and add to evolvedMap
        var tank = sortedArray[i];
        if (tank.neuralNetwork) { //tank is AI controlled
            tank.neuralNetwork.mutate(maxMutationStrength * (i / (totalPop - 1) ),// mutation ~ 1/fitness
                maxMutationRate ); // this may be too conservative, but hopefully sustains growth
        }
    }
    //console.log(tankMap);
}
