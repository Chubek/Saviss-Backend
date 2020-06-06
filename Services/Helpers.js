exports.popNumber = (number) => {
  const numberArray = Array.from(number);
  if (numberArray[0] === "0" || numberArray[0] === "+") {
    return number.substr(1);
  }

  return number;
};
