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
    this.arena = {
        width: 640, height: 480, // Dimensions
        tanks: {}, // Collection of Tanks 
        packs: {
            healthPackNum: 4, ammoPackNum: 4 // # of Packs on Field
        }
    }; //Arena Parameters

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

/* ARENA PARAMS */
//setters
TrainingSettings.prototype.setWidth = function (x) { this.arena.width = x; }
TrainingSettings.prototype.setHeight = function (x) { this.arena.height = x; }
TrainingSettings.prototype.addTank = function (tank) { this.arena.tanks.set(tank.id, tank); }
TrainingSettings.prototype.removeTank = function (tank) { this.arena.tanks.delete(tank.id); }
//getters
TrainingSettings.prototype.getWidth = function () { return this.arena.width; }
TrainingSettings.prototype.getHeight = function () { return this.arena.height; }
TrainingSettings.prototype.getTank = function (id) { return this.arena.tanks.get(id); }
TrainingSettings.prototype.getTanks = function () { return this.arena.tanks; }

/* LEARNING PARAMS */
//setters
TrainingSettings.prototype.setSimsPerGen = function (x) { this.learning.simsPerGen = x; }
TrainingSettings.prototype.toggleAutomaticMutation = function () {
    if (this.learning.automaticMutation) { //On -> Turn Off
        this.learning.automaticMutation = false;
    } else { //No automatic mutation -> Turn On
        this.learning.automaticMutation = { //Reset to arbitrary defaults
            maxMutationRate: 0.8,
            maxMutationStrength: 0.5 //TODO memorize
        }
    }
}
TrainingSettings.prototype.setMaxMutationRate = function (x) { this.learning.automaticMutation.maxMutationRate = x; }
TrainingSettings.prototype.setMaxMutationStrength = function (x) { this.learning.automaticMutation.maxMutationStrength = x; }
TrainingSettings.prototype.toggleAutomaticMating = function () {
    if (this.learning.automaticMating) {
        this.learning.automaticMating = false; //Turn Off
    } else { //No automatic mutation -> Turn On
        this.learning.automaticMating = { //Reset to arbitrary defaults
            parentCount: Math.min(this.arena.tanks.size, 2), //Can children replace parents? I suppose so
            childCount: Math.floor(this.arena.tanks.size / 2)
        }
    }
}
TrainingSettings.prototype.setParentCount = function (x) { this.learning.automaticMutation.parentCount = x; }
TrainingSettings.prototype.setChildCount = function (x) { this.learning.automaticMutation.childCount = x; }
//getters
TrainingSettings.prototype.getSimsPerGen = function () { return this.learning.simsPerGen; }
TrainingSettings.prototype.isUsingAutomaticMutation = function () { return (this.learning.automaticMutation == true); }
TrainingSettings.prototype.getMaxMutationRate = function () { return this.learning.automaticMutation.maxMutationRate; }
TrainingSettings.prototype.getMaxMutationStrength = function () { return this.learning.automaticMutation.maxMutationStrength; }
TrainingSettings.prototype.isUsingAutomaticMating = function () { return (this.learning.automaticMating == true); }
TrainingSettings.prototype.getParentCount = function () { return this.learning.automaticMating.parentCount; }
TrainingSettings.prototype.getChildCount = function () { return this.learning.automaticMating.childCount; }

/* GOD PARAMS */
//setters
TrainingSettings.prototype.toggleGodMode = function () {
    if (this.god) { //It's on - Turn Off
        this.god = false;
    } else { //Turn on
        this.god = { 
            randomize: false, //Scramble the brain of this tank
            mutants: {
                mutationRate: 0.4, //Mutation Rate relative to parent
                mutationStrength: 0.8 //Mutation Strength relative to parent
            },
            useAsParent: false //Select to use tank as parent
        };
    }
}
TrainingSettings.prototype.togglecanRandomize = function () { this.god.randomize = !this.god.randomize; }
TrainingSettings.prototype.toggleCanMutate = function () { this.god.mutants = !this.god.mutants; }
TrainingSettings.prototype.setManualMutationRate = function (x) { this.god.mutants.mutationRate = x; }
TrainingSettings.prototype.setManualMutationStrength = function (x) { this.god.mutants.mutationStrength = x; }
TrainingSettings.prototype.toggleCanPickParents = function () { this.god.useAsParent = !this.god.useAsParent; }
//getters
TrainingSettings.prototype.isUsingGodMode = function () { return (this.god == true); }
TrainingSettings.prototype.canRandomize = function () { return (this.god.randomize == true); }
TrainingSettings.prototype.canMutate = function () { return (this.god.mutants == true); }
TrainingSettings.prototype.getManualMutationRate = function () { return this.god.mutants.mutationRate; }
TrainingSettings.prototype.getManualMutationStrength = function () { return this.god.mutants.mutationStrength; }
TrainingSettings.prototype.canPickParents = function () { return (this.god.useAsParent == true); }

/* JESUS PARAMS */
//setters
TrainingSettings.prototype.toggleJesusMode = function () { this.jesus = !this.jesus; }
//getters
TrainingSettings.prototype.isUsingJesusMode = function () { return (this.jesus == true); }