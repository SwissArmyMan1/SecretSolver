require('dotenv').config();
const {Web3} = require('web3');
const fs = require('fs');

const web3 = new Web3(process.env.INFURA);

const secretRawData = JSON.parse(fs.readFileSync('secretABI.json', 'utf8'));
const secretABI = JSON.parse(secretRawData.result);
const secretAddress = '0xCC1B4094eA3E642c2A8ACb262ACA454c7f8865E4';
const secretContract = new web3.eth.Contract(secretABI, secretAddress);

const calculatorABI = JSON.parse(fs.readFileSync('calculatorABI.json', 'utf8'));
const calculatorAddress = '0x08370865d77B03a0C92F442408B37836901B2E71';
const calculatorContract = new web3.eth.Contract(calculatorABI, calculatorAddress);

const account = process.env.ACCOUNT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;
const text = process.argv[2];

async function readNonce() {
    const nonceBigInt = await secretContract.methods.nonce().call();
    const nonce = Number(nonceBigInt);
    return nonce;
}

async function getData() {
    const data = await web3.eth.getStorageAt(secretAddress, 0);
    return data;
}

async function startContract(text) {
    try {
        const nonce = await readNonce().catch(console.error);
        console.log("Nonce:", nonce);
        const data = await getData().catch(console.error);
        console.log("Data from slot 0:", data);
        const encodedABI = calculatorContract.methods.Start(nonce, data, text).encodeABI();

        const tx = {
            from: account,
            to: calculatorAddress,
            maxPriorityFeePerGas: web3.utils.toWei('1', 'gwei'),
            maxFeePerGas: web3.utils.toWei('5', 'gwei'),
            data: encodedABI
        };

        const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log("Transaction hash:", receipt.transactionHash);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

startContract(text);