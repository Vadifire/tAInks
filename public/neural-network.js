/*
 * Client-Sided Notion of a Neural Network
 *
 * Neural Networks are owned by Tank AIs. They
 * form connections between layers of input,
 * output, and intermediate neuron layers.
 *
 * The associated input values and output actions
 * to nodes are properties of components owned by 
 * the Tank owner of this Neural Network
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */

/*
 * NeuralNetwork Constructor
 *
 * @param {Tank} tank - the owner of this network
 */
function NeuralNetwork(tank) {
    this.draw = true; // TOGGLE
	this.inputs = [];
	this.outputs = [];
	//Assemble IO components
	tank.components.forEach(function(comp){
		if (comp instanceof InputComponent){
			this.inputs.push(comp);
		} else if (comp instanceof OutputComponent){
			this.outputs.push(comp);
		}
    }, this);
    this.tankId = tank.id;
	this.network = this.constructRandomNetwork(2,4);
	this.count = 0;
    console.log(this.network);
}

/*
 * Constructs a randomly populated neural network
 *
 * @param {number} hLayers - Number of hidden layers
 * @param {number} hNeurons - Number of hidden neurons/layer
 * @returns {Object} A network containing and bias
 * matricies for every layer, initialized with random values
 */
NeuralNetwork.prototype.constructRandomNetwork = function(hLayers, hNeurons){
	var layerSizes = [];
	var weights = [];
    var biases = [];

	layerSizes.push(this.inputs.length);
	for (var h = 0; h < hLayers; h++){
		layerSizes.push(hNeurons);
	}
	layerSizes.push(this.outputs.length);

	/* Iterate between every layer, populating weights/biases between */
	for (var synapse = 0; synapse < layerSizes.length-1; synapse++){ //'synapse' is a connection
		weights.push([]); //Add new synapse layer to weights
		/* populate weights */
		for (var n1 = 0; n1 < layerSizes[synapse]; n1++){ //for every firing neuron
			weights[synapse].push([]);
			for (var n2 = 0; n2 < layerSizes[synapse+1]; n2++){ //for every sending neuron
                weights[synapse][n1].push(Math.random()*2-1);
			}
		} 
		/* populate biases */
		biases.push([]);
		for (var n2 = 0; n2 < layerSizes[synapse+1]; n2++){
            biases[synapse][n2] = (Math.random()*2-1);
		}
	}
	var network = new Object();
	network.weights = weights;
    network.biases = biases;
    this.values = []; //Values for rendering
	return network;
}

/*
 * Read input neurons and perform actions based
 * on their resulting outputs.
 */
NeuralNetwork.prototype.act = function(){
	if (!this.inputs.length || !this.outputs.length){
		return;	//Need both inputs and outputs defined
	}

	//read all input values
	inputValues = [];
    this.inputs.forEach(function (input) {
		inputValues.push(input.readInput());
    });
    
	//calculate outputs and perform actions
	if (this.count === 0){
		this.count = TARGET_FPS/4; //calculate new action every 250ms
		this.outputValues = this.calculateOutputs(inputValues, ctx);
	}
	this.count--;
	for (var i = 0; i < this.outputs.length; i++){
		this.outputs[i].performAction(this.outputValues[i]);
	}
}

/*
 * Purpose is to squish outputs between 0 and 1
 * @param {number} x
 * @returns {number} 1/[1+e^(-x)]
 */
function sigmoid(x){
	return 1/(1+Math.pow(Math.E, -x));
}

/*
 * Calculate output values from input values
 * @param {Array} inputs - Array of input numbers
 * @returns {Array} Array of output values
 */
NeuralNetwork.prototype.calculateOutputs = function(inputs){
	var numSynapses = this.network.biases.length; // numLayers - 1

	var inputValues = inputs;
    var outputValues;
    this.values = [];
	/* Iterate across all hidden layers */
	for (var syn = 0; syn < numSynapses; syn++){
		outputValues = []; //clear current output values
		/*  For every receiving neuron */
		for (var n2 = 0; n2 < this.network.biases[syn].length; n2++){
			outputValues.push(this.network.biases[syn][n2]); //start with bias
			/* for every sending neuron */
			for (var n1 = 0; n1 < this.network.weights[syn].length; n1++){ //weighted sum
				outputValues[n2] += inputValues[n1] * this.network.weights[syn][n1][n2];
			}
			outputValues[n2] = sigmoid(outputValues[n2]); //squish range to (0,1)
		}
        this.values.push(inputValues);
		inputValues = outputValues.slice(); //Next inputs are the newly calculated outputs
    }
    this.values.push(outputValues);
	//console.log(outputValues);
	return outputValues;
}

/*
 * Mutates this NeuralNetwork based on mutationStrength
 *
 * @param {number} mutationStrength: how much to mutate weights and biases
 *  mutationStrength must be between 0 and 1. A mutation strength of 0
 *  signals not to change the NeuralNetwork at all. A strength of 1 signals
 *  to completely randomize Neurons
 * @param {number} mutationRate: the likelihood that any given weight
 *  or bias within the network will mutate. Must be between 0 and 1.
 *
 */
NeuralNetwork.prototype.mutate = function (mutationStrength, mutationRate) {
    var numSynapses = this.network.biases.length; // numLayers - 1
    var stagnation = 1 - mutationStrength; //tendency for things to stay same [0,1]

    /* copy original network */
    originalNetwork = JSON.parse(JSON.stringify(this.network));
    this.network = this.constructRandomNetwork(numSynapses - 1, this.network.biases[0].length);

    for (var layer = 0; layer < numSynapses; layer++) {
        //for all biases or 'cols'
        for (var b = 0; b < originalNetwork.biases[layer].length; b++) {
            this.network.biases[layer][b] = this.network.biases[layer][b] * mutationStrength + originalNetwork.biases[layer][b] * (stagnation);
            //for all weights or 'rows'
            for (var w = 0; w < originalNetwork.weights[layer].length; w++) {
                if (Math.random() < mutationRate){ // Check if individual mutation should occur
                    this.network.weights[layer][w][b] = this.network.weights[layer][w][b] * mutationStrength + originalNetwork.weights[layer][w][b] * (stagnation);
                }
            }
        }
    }
}

/*
 * Overwrite current genes with crossover of two parent Neural Networks
 *
 * @param {Object} n1 - The network of the first NN parent
 * @param {Object} n2 - The network of the second NN parent
 */
NeuralNetwork.prototype.crossover = function (n1, n2) {
    /*console.log("Parent networks:");
    console.log(n1);
    console.log(n2);*/
    var numSynapses = this.network.biases.length; // numLayers - 1
    for (var layer = 0; layer < numSynapses; layer++) {
        //for all biases or 'cols'
        for (var b = 0; b < n1.biases[layer].length; b++) {
            this.network.biases[layer][b] = (n1.biases[layer][b] + n2.biases[layer][b]) / 2;
            //for all weights or 'rows'
            for (var w = 0; w < n1.weights[layer].length; w++) {
                this.network.weights[layer][w][b] = (n1.weights[layer][w][b] + n2.weights[layer][w][b]) /2;
            }
        }
    }
    /*console.log("Child network:");
    console.log(this.network);*/
}


/*
 * Overwrite current genes with parent's Neural Networks
 * TODO: worry about compatability issues
 *
 * @param {Object} n1 - The network of the only NN parent 
 */
NeuralNetwork.prototype.copyFrom = function (n1) {
    var numSynapses = this.network.biases.length;
    for (var layer = 0; layer < numSynapses; layer++) {
        //for all biases or 'cols'
        for (var b = 0; b < n1.biases[layer].length; b++) {
            this.network.biases[layer][b] = n1.biases[layer][b];
            //for all weights or 'rows'
            for (var w = 0; w < n1.weights[layer].length; w++) {
                this.network.weights[layer][w][b] = n1.weights[layer][w][b];
            }
        }
    }
}

/*
 * Genetic algorithm intended to evolve fitness of population over time
 *
 * @param {Map <number, Tank>} tankList - List of tanks to evolve
 * @param {number} maxMutationStrength - the degree to mutate the worst tank [0,1]
 * @param {number} maxMutationRate - the rate at which weights/biases mutate in the worst tank [0,1]
 * @returns {Map <number, Tank>} new map based on original tanks, but with evolved neural networks
 */
function evolve(tankList, maxMutationStrength, maxMutationRate) {
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
                maxMutationRate * (i / (totalPop - 1) )); // this may be too conservative, but hopefully sustains growth
        }
        evolvedMap.set(tank.id, tank); // Add potentially modified tank to new map
    }

    return evolvedMap;
}

/*
 * Render the Neural Network
 * @param {Object} ctx - The context to draw to
 */
NeuralNetwork.prototype.render = function (ctx) {
    var x = tanks.get(this.tankId).x;
    var y = tanks.get(this.tankId).y;

    if (this.values) {
        for (var layer = 0; layer < this.values.length; layer++) {
            for (var n = 0; n < this.values[layer].length; n++) {
                var val = Math.round(this.values[layer][n] * 100) / 100; //Round to the nearest hundredth
                ctx.fillText(val, x + layer*40, y + n * 40);
            }
        }
    }
}