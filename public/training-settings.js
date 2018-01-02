/*
 * Settings for the Tank Training Environment
 *
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/*
 * Instantiate Settings with Default Values
 */
function TrainingSettings(){
	/* DEFAULTS */
	this.arena = {width: 640, height: 480}; //Arena Parameters
	this.packs = {healthPackNum: 4, ammoPackNum: 4}; //Pack Rate
	this.tanks = {}; //List of Tanks to Include

	this.learning = { //Configure Automated Learning Techniques
		simsPerGen: 1,
		automaticMutation : { //Maximum Mutation Varas
			maxMutationRate : 0.8,
			maxMutationStrength : 0.5
		},
		automaticMating : false
	};

	this.god = { //Manual Selection Techniques
		randomize : false, //Scramble the brain of this tank
		mutants : {
			mutationRate : 0.4, //Mutation Rate relative to parent
			mutationStrength : 0.8 //Mutation Strength relative to parent
		},
		useAsParent : false //Select to use tank as parent
	};

	this.jesus = false; //Allow use of Player Tank
}