export const FOMOPool_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "calReward",
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
		"inputs": [],
		"name": "claimLockReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "claimReward",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "erc20Address",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "num",
				"type": "uint256"
			}
		],
		"name": "copyPoo",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "join",
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
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastTicketAmount",
				"type": "uint256"
			}
		],
		"name": "setLastTicketAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "poolDuration",
				"type": "uint256"
			}
		],
		"name": "setPoolDuration",
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
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "dailyCount",
				"type": "uint256"
			}
		],
		"name": "setDailyCount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "d",
				"type": "uint256"
			}
		],
		"name": "setDailyDuration",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "joinCount",
				"type": "uint256"
			}
		],
		"name": "setJoinCount",
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
		"name": "setMXCPool",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "perTicketAmount",
				"type": "uint256"
			}
		],
		"name": "setPerTicketAmount",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "perTokenAmount",
				"type": "uint256"
			}
		],
		"name": "setPerTokenAmount",
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
		"name": "setSwapPool",
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
		"name": "setTicketAddress",
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
		"name": "setTokenAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winLockDuration",
				"type": "uint256"
			}
		],
		"name": "setWinLockDuration",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winTokenAmount",
				"type": "uint256"
			}
		],
		"name": "setWinTokenAmount",
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
		"inputs": [],
		"name": "_dailyDuration",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_mxcPool",
		"outputs": [
			{
				"internalType": "contract IMXCPool",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "_poolDailyCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "_poolId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_poolLen",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_swapPool",
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
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "_userPoolJoined",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllPoolInfo",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "perTokenAmount",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "perTicketAmount",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "joinCount",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "totalJoinCount",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "endTime",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "status",
				"type": "uint256[]"
			},
			{
				"internalType": "address[]",
				"name": "lastRewardAddress",
				"type": "address[]"
			},
			{
				"internalType": "address[][]",
				"name": "accounts",
				"type": "address[][]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBaseInfo",
		"outputs": [
			{
				"internalType": "address",
				"name": "tokenAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "tokenDecimals",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "tokenSymbol",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "ticketAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "ticketDecimals",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "ticketSymbol",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "totalJoinTokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalJoinCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "nowTime",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getCurrentPoolId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "poolId",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getCurrentPoolInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "perTokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "perTicketAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "joinCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalJoinCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "status",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "lastRewardAddress",
				"type": "address"
			},
			{
				"internalType": "address[]",
				"name": "accounts",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getDay",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "day",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "currentPid",
				"type": "uint256"
			}
		],
		"name": "getLastRewardAddress",
		"outputs": [
			{
				"internalType": "address",
				"name": "lastRewardAddress",
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
		"name": "getMXCPoolPendingReward",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pid",
				"type": "uint256"
			}
		],
		"name": "getPoolStatus",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "status",
				"type": "uint256"
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
				"name": "pendingTokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pendingTicketAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pendingReleaseTokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pendingReleaseTicketAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pendingReleaseRewardTokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "releaseTime",
				"type": "uint256"
			},
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "viewPoolBaseInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "perTokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "perTicketAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "poolDuration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winTokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastTicketAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "dailyCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "joinCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "winLockDuration",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalJoinCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "pid",
				"type": "uint256"
			}
		],
		"name": "viewPoolInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "endTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endReward",
				"type": "uint256"
			},
			{
				"internalType": "address[]",
				"name": "accounts",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]