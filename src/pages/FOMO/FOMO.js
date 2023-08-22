import React, { Component, createFactory } from 'react'
import { withNavigation } from '../../hocs'
import "./FOMO.css"
import WalletState, { CHAIN_ID, ZERO_ADDRESS, CHAIN_ERROR_TIP, MAX_INT } from '../../state/WalletState';
import loading from '../../components/loading/Loading'
import toast from '../../components/toast/toast'
import Web3 from 'web3'
import { ERC20_ABI } from "../../abi/erc20"
import { FOMOPool_ABI } from '../../abi/FOMOPool_ABI'
import { showCountdownTime, showFromWei, showAccount, showLongAccount, showTail } from '../../utils'
import BN from 'bn.js'
import moment from 'moment'

import copy from 'copy-to-clipboard';
import IconHelp from "../../images/IconHelp.png"
import IconInvite from "../../images/IconInvite.png"

import Header from '../Header';
import Footer from '../Footer';

class FOMO extends Component {
    state = {
        chainId: 0,
        account: "",
        lang: "EN",
        local: {},
        poolInfos: [],
        userPoolJoins: {},
        releaseCountdown:['','','','']
    }
    constructor(props) {
        super(props);
        this.refreshInfo = this.refreshInfo.bind(this);
    }
    componentDidMount() {
        this.handleAccountsChanged();
        WalletState.onStateChanged(this.handleAccountsChanged);
        this.refreshInfo();
    }

    componentWillUnmount() {
        WalletState.removeListener(this.handleAccountsChanged);
        if (this._refreshInfoIntervel) {
            clearInterval(this._refreshInfoIntervel);
        }
    }

    handleAccountsChanged = () => {
        const wallet = WalletState.wallet;
        let page = this;
        page.setState({
            chainId: wallet.chainId,
            account: wallet.account,
            lang: WalletState.wallet.lang,
            local: page.getLocal()
        });
        this.getInfo();
    }

    getLocal() {
        let local = {};
        return local;
    }

    _refreshInfoIntervel;
    refreshInfo() {
        if (this._refreshInfoIntervel) {
            clearInterval(this._refreshInfoIntervel);
        }
        this._refreshInfoIntervel = setInterval(() => {
            this.getInfo();
        }, 3000);
    }

    async getInfo() {
        if (WalletState.wallet.chainId != CHAIN_ID) {
            return;
        }
        try {
            const web3 = new Web3(Web3.givenProvider);
            const fomoContract = new web3.eth.Contract(FOMOPool_ABI, WalletState.config.FOMO);

            //获取基本信息
            const baseInfo = await fomoContract.methods.getBaseInfo().call();
            //代币合约
            let tokenAddress = baseInfo[0];
            //代币精度
            let tokenDecimals = parseInt(baseInfo[1]);
            //代币符号
            let tokenSymbol = baseInfo[2];
            //门票合约
            let ticketAddress = baseInfo[3];
            //门票精度
            let ticketDecimals = parseInt(baseInfo[4]);
            //门票符号
            let ticketSymbol = baseInfo[5];
            //总参与金额
            let totalJoinTokenAmount = baseInfo[6];
            //总参与次数
            let totalJoinCount = parseInt(baseInfo[7]);
            //当前时间，时间戳，秒
            let nowTime = parseInt(baseInfo[8]);

            this.setState({
                tokenAddress: tokenAddress,
                tokenDecimals: tokenDecimals,
                tokenSymbol: tokenSymbol,
                ticketAddress: ticketAddress,
                ticketDecimals: ticketDecimals,
                ticketSymbol: ticketSymbol,
                totalJoinTokenAmount: showFromWei(totalJoinTokenAmount, tokenDecimals, 2),
                totalJoinCount: totalJoinCount,
            });

            //获取全部FOMO池子当前场次信息
            let allPoolInfo = await fomoContract.methods.getAllPoolInfo().call();
            //当前场次ID
            let currentPoolIds = allPoolInfo[0];
            //参与需要代币数量
            let perTokenAmounts = allPoolInfo[1];
            //参与需要门票数量
            let perTicketAmounts = allPoolInfo[2];
            //开奖需要参与多少次
            let joinCounts = allPoolInfo[3];
            //池子总参与次数
            let poolTotalJoinCounts = allPoolInfo[4];
            //结束时间
            let endTimes = allPoolInfo[5];
            //状态：0表示未开启，1表示开启
            let statuss = allPoolInfo[6];
            //上一场奖励地址
            let lastRewardAddresss = allPoolInfo[7];
            //参与地址列表
            let accountss = allPoolInfo[8];

            let poolInfos = [];
            let len = currentPoolIds.length;
            for (let i = 0; i < len; ++i) {
                let currentPoolId = parseInt(currentPoolIds[i]);
                let perTokenAmount = new BN(perTokenAmounts[i], 10);
                let perTicketAmount = new BN(perTicketAmounts[i], 10);
                let joinCount = parseInt(joinCounts[i]);
                let poolTotalJoinCount = parseInt(poolTotalJoinCounts[i]);
                let endTime = parseInt(endTimes[i]);
                let status = parseInt(statuss[i]);
                let lastRewardAddress = lastRewardAddresss[i];
                let accounts = accountss[i];

                poolInfos.push({
                    currentPoolId: currentPoolId,
                    perTokenAmount: perTokenAmount,
                    showPerTokenAmount: showFromWei(perTokenAmount, tokenDecimals, 2),
                    perTicketAmount: perTicketAmount,
                    showPerTicketAmount: showFromWei(perTicketAmount, ticketDecimals, 2),
                    joinCount: joinCount,
                    poolTotalJoinCount: poolTotalJoinCount,
                    status: status,
                    lastRewardAddress: lastRewardAddress,
                    countdown: showCountdownTime(endTime - nowTime),
                    accounts: accounts,
                });
            }

            let account = WalletState.wallet.account;
            if (account) {
                //获取用户信息
                const userInfo = await fomoContract.methods.getUserInfo(account).call();
                //待领取未成团退回本金
                let pendingTokenAmount = userInfo[0];
                //待领取未成团退回门票
                let pendingTicketAmount = userInfo[1];
                //待领取成团退回本金
                let pendingReleaseTokenAmount = userInfo[2];
                //待领取成团退回门票
                let pendingReleaseTicketAmount = userInfo[3];
                //待领取成团收益奖励
                let pendingReleaseRewardTokenAmount = userInfo[4];
                //释放时间
                let releaseTime = parseInt(userInfo[5]);
                //代币余额
                let tokenBalance = new BN(userInfo[6], 10);
                //代币授权额度
                let tokenAllowance = new BN(userInfo[7], 10);
                //门票余额
                let ticketBalance = new BN(userInfo[8], 10);
                //门票授权额度
                let ticketAllowance = new BN(userInfo[9], 10);
                //一期奖励额度
                let mxcPoolReward = new BN(userInfo[10], 10);

                //获取用户全部池子本期是否参与
                const userAllPoolJoined = await fomoContract.methods.getUserAllPoolJoined(account).call();
                for (let i = 0; i < len; ++i) {
                    poolInfos[i].userJoined = userAllPoolJoined[i];
                }

                this.setState({
                    pendingTokenAmount: showFromWei(pendingTokenAmount, tokenDecimals, 2),
                    pendingTicketAmount: showFromWei(pendingTicketAmount, ticketDecimals, 2),

                    pendingReleaseTokenAmount: showFromWei(pendingReleaseTokenAmount, tokenDecimals, 2),
                    pendingReleaseTicketAmount: showFromWei(pendingReleaseTicketAmount, ticketDecimals, 2),
                    pendingReleaseRewardTokenAmount: showFromWei(pendingReleaseRewardTokenAmount, tokenDecimals, 2),
                    releaseCountdown: showCountdownTime(releaseTime - nowTime),

                    tokenBalance: tokenBalance,
                    showTokenBalance: showFromWei(tokenBalance, tokenDecimals, 2),
                    tokenAllowance: tokenAllowance,
                    ticketBalance: ticketBalance,
                    showTicketBalance: showFromWei(ticketBalance, ticketDecimals, 2),
                    ticketAllowance: ticketAllowance,
                    mxcPoolReward: showFromWei(mxcPoolReward, tokenDecimals, 2),
                });
            }

            this.setState({
                poolInfos: poolInfos
            });
        } catch (e) {
            console.log("getInfo", e.message);
            toast.show(e.message);
        } finally {
        }
    }

    async join(index, e) {
        if (WalletState.wallet.chainId != CHAIN_ID) {
            toast.show(CHAIN_ERROR_TIP);
            return;
        }
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        let item = this.state.poolInfos[index];
        let tokenAmount = item.perTokenAmount;
        //代币余额
        var tokenBalance = this.state.tokenBalance;
        if (tokenBalance.lt(tokenAmount)) {
            toast.show(this.state.tokenSymbol + "余额不足");
            // return;
        }

        let ticketAmount = item.perTicketAmount;
        //门票余额
        var ticketBalance = this.state.ticketBalance;
        if (ticketBalance.lt(ticketAmount)) {
            toast.show(this.state.ticketSymbol + "余额不足");
            // return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            let tokenAllowance = new BN(this.state.tokenAllowance, 10);
            //代币授权额度不够了，需要重新授权
            if (tokenAllowance.lt(tokenAmount)) {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, this.state.tokenAddress);
                var transaction = await tokenContract.methods.approve(WalletState.config.FOMO, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("代币授权失败");
                    return;
                }
            }

            let ticketAllowance = new BN(this.state.ticketAllowance, 10);
            //门票授权额度不够了，需要重新授权
            if (ticketAllowance.lt(ticketAmount)) {
                const ticketContract = new web3.eth.Contract(ERC20_ABI, this.state.ticketAddress);
                var transaction = await ticketContract.methods.approve(WalletState.config.FOMO, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("门票授权失败");
                    return;
                }
            }
            const fomoContract = new web3.eth.Contract(FOMOPool_ABI, WalletState.config.FOMO);
            var estimateGas = await fomoContract.methods.join(index).estimateGas({ from: account });
            var transaction = await fomoContract.methods.join(index).send({ from: account });
            if (transaction.status) {
                toast.show("参与成功");
            } else {
                toast.show("参与失败");
            }
        } catch (e) {
            console.log("e", e);
            toast.show(e.message);
        } finally {
            loading.hide();
        }
    }

    //领取未成团退回本金
    async claimReward() {
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            const fomoContract = new web3.eth.Contract(FOMOPool_ABI, WalletState.config.FOMO);
            var estimateGas = await fomoContract.methods.claimReward().estimateGas({ from: account });
            var transaction = await fomoContract.methods.claimReward().send({ from: account });
            if (transaction.status) {
                toast.show("领取成功");
            } else {
                toast.show("领取失败");
            }
        } catch (e) {
            console.log("e", e);
            toast.show(e.message);
        } finally {
            loading.hide();
        }
    }

    //领取成团释放本金和收益
    async claimLockReward() {
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            const fomoContract = new web3.eth.Contract(FOMOPool_ABI, WalletState.config.FOMO);
            var estimateGas = await fomoContract.methods.claimLockReward().estimateGas({ from: account });
            var transaction = await fomoContract.methods.claimLockReward().send({ from: account });
            if (transaction.status) {
                toast.show("领取成功");
            } else {
                toast.show("领取失败");
            }
        } catch (e) {
            console.log("e", e);
            toast.show(e.message);
        } finally {
            loading.hide();
        }
    }

    connectWallet() {
        WalletState.connetWallet();
    }

    render() {
        return (
            <div className="Presale">
                <Header></Header>
                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>总参与次数</div>
                        <div>{this.state.totalJoinCount}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>总参与金额</div>
                        <div>{this.state.totalJoinTokenAmount}{this.state.tokenSymbol}</div>
                    </div>

                </div>

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>未成团</div>
                        <div>{this.state.pendingTokenAmount}{this.state.tokenSymbol} / {this.state.pendingTicketAmount}{this.state.ticketSymbol}</div>
                    </div>

                    <div className='mt10 prettyBg button' onClick={this.claimReward.bind(this)}>领取</div>

                </div>

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>成团本金</div>
                        <div>{this.state.pendingReleaseTokenAmount}{this.state.tokenSymbol} / {this.state.pendingReleaseTicketAmount}{this.state.ticketSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>收益/额度</div>
                        <div>{this.state.pendingReleaseRewardTokenAmount}{this.state.tokenSymbol} / {this.state.mxcPoolReward}{this.state.tokenSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>释放倒计时</div>
                        <div>{this.state.releaseCountdown[0]}:{this.state.releaseCountdown[1]}:{this.state.releaseCountdown[2]}:{this.state.releaseCountdown[3]}</div>
                    </div>

                    <div className='mt10 prettyBg button' onClick={this.claimLockReward.bind(this)}>领取</div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>余额</div>
                        <div>{this.state.showTokenBalance}{this.state.tokenSymbol} / {this.state.showTicketBalance}{this.state.ticketSymbol}</div>
                    </div>

                </div>

                {this.state.poolInfos.map((item, index) => {
                    return <div className='Module ModuleTop' key={index}>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>{index + 1}号房，累计{item.poolTotalJoinCount}次</div>
                            <div>{item.status == 0 ? '未启动' : item.userJoined ? "待开奖" : "可参与"}</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>参与人数</div>
                            <div>{item.accounts.length}/{item.joinCount}</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>开奖倒计时</div>
                            <div>{item.countdown[0]}:{item.countdown[1]}:{item.countdown[2]}:{item.countdown[3]}</div>
                        </div>

                        <div className='Accounts'>
                            {
                                item.accounts.map((i, j) => {
                                    return <div className='AccountItem' key={j}>
                                        {showTail(i)}
                                    </div>
                                })
                            }
                        </div>

                        <div className='mt10 prettyBg button' onClick={this.join.bind(this, index)}>{item.showPerTokenAmount}{this.state.tokenSymbol} + {item.showPerTicketAmount}{this.state.ticketSymbol}参与</div>
                        <div className='ModuleContentWitdh RuleTitle mt5'>
                            <div>上一期中奖地址</div>
                            <div>{showLongAccount(item.lastRewardAddress)}</div>
                        </div>
                    </div>
                })}

                <div className='mt20'></div>
            </div>
        );
    }
}

export default withNavigation(FOMO);