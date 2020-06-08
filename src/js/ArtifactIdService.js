/**
 * @author: Yashua Ovando
 * @email: yashua.ovando@student.csulb.edu
 * @description: This module provides functionality that allowing the generation
 * of artifcat id.  
 */


const fs = require('fs');

function artifactID(filePath) {
	const fileContent = fs.readFileSync(filePath);

	let multiplier = 1; //used to check which multiplier we are using in the array of factors
	let factors = [1, 7, 3, 7, 11]; //array of factors
	let sum = 0; //keeps track of total sum of char multiplied with factor
	let count = 0; //keeps track of file size according to character count

	for (const char of fileContent) {
		if (char != 10) //used to avoid reading end of file character
		{
			sum = sum + (char * factors[multiplier - 1]); //access the factor and multiply with char
			if (sum % (Math.pow(2, 31) - 1) == 0) //modulus to wrap file
			{
				sum = sum - (Math.pow(2, 31) - 1);
			}
			multiplier++;

			if (multiplier > 5) //makes sure we circle around factors
			{
				multiplier = 1;
			}
			count++;
		}
	}
	return (sum + "-" + "L" + count);
}

module.exports = {
	artifactID
};