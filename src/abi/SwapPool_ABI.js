export const SwapPool_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "buyTIX",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "claimBalance",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "claimToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "sellTIX",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "adr",
				"type": "address"
			}
		],
		"name": "setCashAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "m",
				"type": "uint256"
			}
		],
		"name": "setMinAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "adr",
				"type": "address"
			}
		],
		"name": "setTIX",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "r",
				"type": "uint256"
			}
		],
		"name": "setTixRate",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "adr",
				"type": "address"
			}
		],
		"name": "setWMXC",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [],
		"name": "_cashAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "getUserInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "tokenBalance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "tokenAllowance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ticketBalance",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "ticketAllowance",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tokenInfo",
		"outputs": [
			{
				"internalType": "address",
				"name": "WMXC",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "WMXCDecimals",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "WMXCSymbol",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "TIX",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "TIXDecimals",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "TIXSymbol",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "tixRate",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "minAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "poolWMXC",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "poolTIX",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalTIX",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]