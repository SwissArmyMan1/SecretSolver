// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISecretContract {
    function submitApplication(string calldata contacts, bytes32 password1, bytes32 password2, bytes32 password3) external;
}

contract SecretCalculator is Ownable {
    address private constant secretAddress = 0xCC1B4094eA3E642c2A8ACb262ACA454c7f8865E4;
    uint256 private constant valuePwd1 = 314159265358979323846264338327950288419716939937510582097494459;
    uint256 private constant valuePwd2 = 271828182845904523536028747135266249775724709369995957496696762;
    uint24 private nonceStart = 0;
    uint256 private blockTimestamp;
    uint256 private blockGaslimit;
    uint256 private blockDifficulty;
    address private sender;
    uint256 private y;
    bytes32 private pwd1;
    bytes32 private pwd2;

    constructor(uint256 _blockTimestamp,
                uint256 _blockGaslimit,
                uint256 _blockDifficulty,
                address _sender,
                uint256 _y) Ownable(msg.sender) {
        blockTimestamp = _blockTimestamp;
        blockGaslimit = _blockGaslimit;
        blockDifficulty = _blockDifficulty;
        sender = _sender;
        y = _y;
        pwd1 = calculatePwd(valuePwd1);
        pwd2 = calculatePwd(valuePwd2);
    }

    function Start(uint24 nonce, uint256 secretSlot, string memory _contacts) external onlyOwner {
        bytes32 secret1 = calculateSecret1(nonce, secretSlot);
        nonce++;
        bytes32 secret2 = keccak256(abi.encode(pwd1, nonce));
        nonce++;
        bytes32 secret3 = keccak256(abi.encode(pwd2, nonce));
        string memory contacts = _contacts;
            
        ISecretContract secretContract = ISecretContract(secretAddress);
        secretContract.submitApplication(contacts, secret1, secret2, secret3);
    }

    function calculateSecret1(uint24 nonce, uint256 _secretSlot) private view returns (bytes32) {
        bytes memory buffer = new bytes(32);
        uint256 secret;
        uint256 _y = y;
        assembly {
            let bufref := add(buffer, 0x20)
            mstore(bufref, add(add(_secretSlot, _y), nonce))
            secret := keccak256(bufref, 0x20)
        }
        return bytes32(secret);
    }

    function calculatePwd(uint256 valuePwd) private returns (bytes32) {
        uint256 seed = blockTimestamp + blockGaslimit + blockDifficulty + uint256(uint160(sender)) + valuePwd;
        bytes memory b = new bytes(32);
        uint256 n = nonceStart + 1;
        assembly {
            seed := mulmod(seed, seed, add(n, 0xffffff))
            let r := 1
            for { let i := 0 } lt(i, 5) { i := add(i, 1) }
            {
                r := add(r, div(seed, r))
                mstore(add(b, 0x20), r)
                r := keccak256(add(b, 0x20), 0x20)                
            }
            mstore(add(b, 0x20), r)
        }
        nonceStart++;
        return keccak256(b);
    }
}