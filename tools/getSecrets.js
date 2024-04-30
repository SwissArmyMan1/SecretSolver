require('dotenv').config();
const {Web3} = require('web3');
const fs = require('fs');

const web3 = new Web3(process.env.INFURA);
const rawDataSecret = JSON.parse(fs.readFileSync('secretABI.json', 'utf8'));
const rawDataUniswap = JSON.parse(fs.readFileSync('uniswapV3factoryABI.json', 'utf8'));
const secretABI = JSON.parse(rawDataSecret.result);
const uniswapV3factoryABI = JSON.parse(rawDataUniswap.result);

const secretAddress = '0xCC1B4094eA3E642c2A8ACb262ACA454c7f8865E4';
const uniswapV3factoryAddress = '0x248AB79Bbb9bC29bB72f7Cd42F17e054Fc40188e';
const transactionHash = '0x4b20d62c25b75ddeaff35927f2b9c61695b3011f54347a3b71db2e5cb0db3c10';
const secretContract = new web3.eth.Contract(secretABI, secretAddress);
const uniswapV3factoryContract = new web3.eth.Contract(uniswapV3factoryABI, uniswapV3factoryAddress);

async function readNonce() {
    const nonceBigInt = await secretContract.methods.nonce().call();
    const nonce = Number(nonceBigInt);
    console.log("Nonce:", nonce);
}

async function getFeeAmountTickSpacing(fee) {
    const tickSpacingBigInt = await uniswapV3factoryContract.methods.feeAmountTickSpacing(fee).call();
    const tickSpacing = Number(tickSpacingBigInt);
    console.log(`Tick spacing for fee ${fee}:`, tickSpacing);
}

async function getData() {
    const data = await web3.eth.getStorageAt(secretAddress, 0);
    console.log("Data from slot 0:", data);
}

async function getBlockDetails() {
    const transaction = await web3.eth.getTransaction(transactionHash);
    const blockNumber = transaction.blockNumber;
    const block = await web3.eth.getBlock(blockNumber);

    console.log(`Timestamp: ${block.timestamp}`);
    console.log(`Difficulty: ${block.difficulty}`);
    console.log(`Gas Limit: ${block.gasLimit}`);
}

readNonce().catch(console.error);
getFeeAmountTickSpacing(3000).catch(console.error);
getData().catch(console.error);
getBlockDetails().catch(console.error);