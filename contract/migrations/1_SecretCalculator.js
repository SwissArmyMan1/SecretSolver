const SecretCalculator = artifacts.require("SecretCalculator");

module.exports = function(deployer) {
    const blockTimestamp = 1714419741;
    const blockGaslimit = 1125899906842624;
    const blockDifficulty = 1;
    const sender = "0x39b42878097e0f2ae913a0C4825afb874dB0a168";
    const y = 60;

    deployer.deploy(SecretCalculator, blockTimestamp, blockGaslimit, blockDifficulty, sender, y);
};