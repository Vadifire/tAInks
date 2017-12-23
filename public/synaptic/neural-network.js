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
function NeuralNetwork(tank){
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
	this.network = this.constructRandomNetwork(1,3);
	this.count = 0;
    console.log(this.network);
}

/*
 * Constructs a randomly populated neural network
 *
 * @param {number} hLayers - Number of hidden layers
 * @param {number} hNeurons - Number of hidden neurons/layer
 * @returns {Object} A network containing weight and bias
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
	var inputValues = [];
	this.inputs.forEach(function(input){
		inputValues.push(input.readInput());
	});
	
	//calculate outputs and perform actions
	if (this.count === 0){
		this.count = TARGET_FPS/2; //calculate new action every half-second
		this.outputValues = this.calculateOutputs(inputValues);
		this.mutate(0.1);
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

		inputValues = outputValues.slice(); //Next inputs are the newly calculated outputs
	}
	//console.log(outputValues);
	return outputValues;
}

/*
 * Mutates this NeuralNetwork based on mutationStrength
 *
 * @param {number} mutationStrength: how much to mutate weights and biases
 *  mutationStrength must be between 0 and 1. A mutation strength of 0
 *  signals not to change the NeuralNetwork at all. A strength of 1 signals
 *  to completely randomize the NeuralNetwork
 */
NeuralNetwork.prototype.mutate = function (mutationStrength) {

    var numSynapses = this.network.biases.length; // numLayers - 1
    var stagnation = 1 - mutationStrength; //tendency for things to stay same [0,1]

    /* copy original network */
    originalNetwork = JSON.parse(JSON.stringify(this.network));
    this.network = this.constructRandomNetwork(numSynapses - 1, this.network.biases[1].length);

    for (var layer = 0; layer < numSynapses; layer++) {
        //for all biases or 'cols'
        for (var b = 0; b < originalNetwork.biases[layer].length; b++) {
            this.network.biases[layer][b] = this.network.biases[layer][b] * mutationStrength + originalNetwork.biases[layer][b] * (stagnation);
            //for all weights or 'rows'
            for (var w = 0; w < originalNetwork.weights[layer].length; w++) {
                this.network.weights[layer][w][b] = this.network.weights[layer][w][b] * mutationStrength + originalNetwork.weights[layer][w][b] * (stagnation);
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
 * For all tanks, select new fuinction
 * @param {Tank} tank - The corresponding tank
 */
function calcualteFitness(tank){ //may want to put this in tank class
	return tank.health + tank.damageDone; //Fitness is health left + total dmg done
}

