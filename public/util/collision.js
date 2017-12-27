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
        var C2 = A2 * line2.x1 + B1 * line2.y1;
        var x = (B2*C1 - B1*C2)/det;
        var y = (A1*C2 - A2*C1)/det;

        // This is probably terrible (then again, performance impact insignificant)
        if (x > Math.max(line1.x1, line1.x2) || x > Math.max(line2.x1, line2.x2) ||
            x < Math.min(line1.x1, line1.x2) || x < Math.min(line2.x1, line2.x2) ||
            y > Math.max(line1.y1, line1.y2) || y > Math.max(line2.y1, line2.y2) ||
            y < Math.min(line1.y1, line1.y2) || y < Math.min(line2.y1, line2.y2)){
             return null; //Not within both lines
        }

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
 * @returns {number, number} x,y - The point of intersection (null if none)
 */
function getLineEntityIntercept(line, entity){


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
            x1: entity.x + entity.width/2,
            y1: entity.y - entity.height/2,
            x2: entity.x + entity.width/2,
            y2: entity.y + entity.height/2
        },
        { // Line 1
            x1: entity.x - entity.width/2,
            y1: entity.y - entity.height/2,
            x2: entity.x + entity.width/2,
            y2: entity.y - entity.height/2
        },
        { // Line 2
            x1: entity.x - entity.width/2,
            y1: entity.y - entity.height/2,
            x2: entity.x - entity.width/2,
            y2: entity.y + entity.height/2
        },
        { // Line 3
            x1: entity.x - entity.width/2,
            y1: entity.y + entity.height/2,
            x2: entity.x + entity.width/2,
            y2: entity.y + entity.height/2
        }];

    return lines;
}