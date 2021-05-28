/* eslint-disable */
import web3 from "./web3";

const address = "0x548f01155f1B7853756d9392ffED6f5DE74D47cd"; // Your deployed contract's address goes here // Your ABI goes here (Crowdfunding contract) // Example:

const abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "contractAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "projectStarter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "projectTitle",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "projectDesc",
        type: "string",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "goalAmount",
        type: "uint256",
      },
    ],
    name: "ProjectStarted",
    type: "event",
  },
  {
    inputs: [],
    name: "returnAllProjects",
    outputs: [
      {
        internalType: "contract Project[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "title",
        type: "string",
      },
      {
        internalType: "string",
        name: "description",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "durationInDays",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "amountToRaise",
        type: "uint256",
      },
    ],
    name: "startProject",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const instance = new web3.eth.Contract(abi, address);

export default instance;
