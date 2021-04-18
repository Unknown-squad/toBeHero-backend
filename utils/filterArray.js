// function that return the diffrence between two arrays
exports.filterArray = (firstArray, secondArray) => {

  // array that contains diffrent elements between the tow arrays
  let diffrentElements = [];

  // loop on first array
  firstArray.forEach(element => {

    let equal = false;
    
    // loop on second array
    for(let i = 0; i < secondArray.length; i++) {

      // check the diffrent elements
      if(element === secondArray[i]) {
        equal = true;
        break;
      }

    }

    // check that if element doesn't found in second array
    // then push it to diffrentElements array
    if(!equal) {
      diffrentElements.push(element);
    }

  });

  // return diffrent elements between the two arrays
  return diffrentElements;

}