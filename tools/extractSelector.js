const {Web3} = require('web3');
const fs = require('fs');

const rawData = JSON.parse(fs.readFileSync('secretABI.json', 'utf8'));

const abi = JSON.parse(rawData.result);

const getSelector = (signature) => Web3.utils.sha3(signature).slice(0, 10);

const selectorsToFunctionName = abi
    .filter((item) => item.type === 'function')
    .reduce((acc, func) => {
        const signature = `${func.name}(${func.inputs.map((input) => input.type).join(',')})`;
        const selector = getSelector(signature);
        acc[selector] = func.name;
        return acc;
    }, {});

const findFunctionNameBySelector = (selector) => {
    return selectorsToFunctionName[selector] || 'Function name not found';
};

const selector = '0x22afcccb';
const functionName = findFunctionNameBySelector(selector);
console.log(`Function name for selector ${selector}: ${functionName}`);
