/*
 * Collision Module 
 * 
 * Provides utility functions for collision detection
 * 
 * TODO: many of the methods defined here can be optimized
 * for performance
 * 
 * Authors:
 *	@author Cedric Debelle
 *	@author Calvin Ellis
 */


/*
 * Calculates the intersection between two lines
 *
 * @param {Object} line1
 * @param {Object} line2
 *  These lines must have {x1, y1, x2, y2}
 * 
 * @returns {number, number} x,y - The point of intersection (null if none)
 * 
 */
function getLinesIntercept(line1, line2){
    // Constants:
    // A = y2-y1
    // B = x1-x2
    // C = A*x1+B*y1

    // Line representation:
    // A1x + B1y = C1
    // A2x + B2y = C2

    var A1 = line1.y2 - line1.y1;
    var A2 = line2.y2 - line2.y1;

    var B1 = line1.x1 - line1.x2;
    var B2 = line2.x1 - line2.x2;

    var det = A1*B2 - A2*B1;

    if (det === 0){
        return null; // no intersection (lines in parallel)
    } else{
        var C1 = A1 * line1.x1 + B1 * line1.y1;
        var C2 = A2 * line2.x1 + B2 * line2.y1;
        var x = (B2*C1 - B1*C2)/det;
        var y = (A1*C2 - A2*C1)/det;

        if (x > Math.max(line1.x1, line1.x2) || x > Math.max(line2.x1, line2.x2) ||
            x < Math.min(line1.x1, line1.x2) || x < Math.min(line2.x1, line2.x2) ||
            y > Math.max(line1.y1, line1.y2) || y > Math.max(line2.y1, line2.y2) ||
            y < Math.min(line1.y1, line1.y2) || y < Math.min(line2.y1, line2.y2)){
             return null; //Not within both lines
        }

        //console.log(x+" ,"+y);
        //Return point object representing intersection
        return {
            x: x,
            y: y
        };
    }
}


/*
 * Calculates the intersection point between line and rectangle-based entity
 *
 * @param {Object} line
 * @param {Object} entity
 *  These lines must have {x1, y1, x2, y2}
 *  Entities must have already invoked getLinesForEntity()
 * 
 * @returns {boolean} returns whether a line intersects an entity's hitbox
 */
function doesLineIntersectEntity(line, entity){
    for (var i = 0 ; i < entity.lines.length; i++){
        if (getLinesIntercept(entity.lines[i], line) !== null){
            return true;
        }
    }
    return false;
}


/*
 * Calculates the intersection point between line and rectangle-based entity
 *
 * @param {Object} entity1
 * @param {Object} entity2
 *  Entities must have already invoked getLinesForEntity()
 * 
 * @returns {boolean} returns whether two entities make contact
 */
function doesEntityIntersectEntity(entity1, entity2) {
    if (!entity1.lines || !entity2.lines) {
        return false;   
    }
    for (var i = 0; i < entity1.lines.length; i++) {
        if (doesLineIntersectEntity(entity1.lines[i], entity2)) {
            return true;
        }
    }
    return false;
}

/*
 * Calculates the bounding lines of a potentially rotated 
 * rectangular entity
 *
 * @param {Object} entity
 *  Entities must have {x, y, width, height, xComp, yComp}
 * 
 * @returns {Array<Line>} - The bounding lines of the entity
 */
function getLinesForEntity(entity){
    /* 
     * Line Layout
     *  1_
     * 2|_|0
     *   3 
     */

    var lines = [ // Array of 4 bounding lines
        { // Line 0
            x1: entity.width/2,
            y1: -entity.height/2,
            x2: entity.width/2,
            y2: entity.height/2
        },
        { // Line 1
            x1: -entity.width/2,
            y1: -entity.height/2,
            x2: +entity.width/2,
            y2: -entity.height/2
        },
        { // Line 2
            x1: -entity.width/2,
            y1: -entity.height/2,
            x2: -entity.width/2,
            y2: entity.height/2
        },
        { // Line 3
            x1: -entity.width/2,
            y1: entity.height/2,
            x2: +entity.width/2,
            y2: entity.height/2
        }
    ];

    //Rotate Points around Entity origin
    for (var i = 0 ; i < lines.length; i++){
        rotateLineAroundEntity(lines[i], entity);
    }

    return lines;
}
function setLinesForEntity(entity){
    entity.lines = getLinesForEntity(entity);
}

/*
 * Rotates a line around the origin of an 'entity'
 *
 * @param {Object} line
 *  These lines must have {x1, y1, x2, y2}
 * @param {Object} entity
 *  Entities must have {x, y, width, height, xComp, yComp}
 * 
 * @returns {Object} - The rotated line
 */

function rotateLineAroundEntity(line, entity){
    //Rotate Points around Entity origin
    var x1 = line.x1 * entity.xComp - line.y1 * entity.yComp;
    var y1 = line.y1 * entity.xComp + line.x1 * entity.yComp;

    var x2 = line.x2 * entity.xComp - line.y2 * entity.yComp;
    var y2 = line.y2 * entity.xComp + line.x2 * entity.yComp;

    //Translate points to be correctly located on screen
    line.x1=entity.x+x1;
    line.x2=entity.x+x2;
    line.y1=entity.y+y1;
    line.y2=entity.y+y2;
}