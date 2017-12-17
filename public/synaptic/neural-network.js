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
	var outputValues = this.calculate(inputValues);
	for (var i = 0; i < this.outputs.length; i++){
		this.outputs[i].performAction(outputValues[i]);
	}
}

/*
 * Calculate output values from input values
 * @param {Array} inputs - Array of input numbers
 * @returns {Array} Array of output values
 */
NeuralNetwork.prototype.calculate = function(inputs){
	var numSynapses = this.network.weights.length; // numLayers - 1

	var inputValues = inputs;
	var outputValues;

	/* Iterate across all hidden layers */
	for (var layer = 0; layer < numSynapses; layer++){
		outputValues = []; //clear current output values
		/*  For every receiving neuron */
		for (var n2 = 0; n2 < this.network.biases[layer].length; n2++){
			outputValues.push(this.network.biases[layer][n2]); //start with bias
			/* for every sending neuron */
			for (var n1 = 0; n1 < this.network.weights[layer].length; n1++){ //weighted sum
				outputValues[n2] += inputValues[n1] * this.network.weights[layer][n1][n2];
			}
			outputValues[n2] = sigmoid(outputValues[n2]); //squish range to (0,1)
		}

		inputValues = outputValues.slice(); //Next inputs are the newly calculated outputs
	}
	console.log(outputValues);
	return outputValues;
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
 * Update weights and biases baesd on loss function
 */
NeuralNetwork.prototype.learn = function (){
	
}