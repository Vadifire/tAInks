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

/* Import Synaptic Module */
const { Layer, Network } = window.synaptic;

/*
 * NeuralNetwork Constructor
 *
 * @param {Object} tank - the tank comp is attached to
 */
function NeuralNetwork(tank){
	this.inputs = [];
	this.outputs = [];

	tank.components.forEach(function(comp){
		if (comp instanceof InputComponent){
			this.inputs.push(comp);
		} else if (comp instanceof OutputComponent){
			this.outputs.push(comp);
		}
	}, this);

	var inputLayer = new Layer(this.inputs.length); //Component input neurons
	var hiddenLayer = new Layer(3); //Intermediate neurons
	var outputLayer = new Layer(this.outputs.length); //Component output neurons

	/* Connect Network */
	inputLayer.project(hiddenLayer);
	hiddenLayer.project(outputLayer);

	this.network = new Network({
		input: inputLayer,
		hidden: [hiddenLayer],
		output: outputLayer
	});
}

/*
 * Reads input neurons and produces target value
 */
NeuralNetwork.prototype.activate = function(){
	if (!this.inputs.length || !this.outputs.length){
		return;	//Need both inputs and outputs defined
	}

	//read all input values
	var inputValues = [];
	this.inputs.forEach(function(input){
		inputValues.push(input.readInput());
	});
	
	//calculate outputs and perform actions
	var outputValues = this.network.activate(inputValues);
	this.network.propagate(0.05, [0.3, 0.3]); //Encourage the robot to spin!
	for (var i = 0; i < this.outputs.length; i++){
		this.outputs[i].performAction(outputValues[i]);
	}
}
