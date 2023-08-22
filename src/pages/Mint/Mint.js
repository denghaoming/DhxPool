import React, { Component } from 'react'
import { withNavigation } from '../../hocs'
import "../Token/Token.css"
import "../NFT/NFT.css"
import WalletState, { CHAIN_ID, ZERO_ADDRESS, CHAIN_ERROR_TIP, CHAIN_SYMBOL, MAX_INT } from '../../state/WalletState';
import loading from '../../components/loading/Loading'
import toast from '../../components/toast/toast'
import Web3 from 'web3'
import { ERC20_ABI } from "../../abi/erc20"
import { showCountdownTime, showFromWei, showLongAccount, toWei } from '../../utils'
import BN from 'bn.js'

import Header from '../Header';
import copy from 'copy-to-clipboard';
import { DhxPool_ABI } from '../../abi/DhxPool_ABI';
import moment from 'moment';

class Mint extends Component {
    state = {
        chainId: 0,
        account: "",
        lang: "EN",
        local: {},
        amountIn: "",
        rewardRate: 30000,
        countdownTime: ["00", "00", "00", "00"],
        levelPools: [],
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
        console.log(WalletState.wallet.lang);
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
        }, 15000);
    }

    async getInfo() {
        if (WalletState.wallet.chainId != CHAIN_ID) {
            return;
        }
        try {
            const web3 = new Web3(Web3.givenProvider);
            //挖矿合约
            const dhxPoolContract = new web3.eth.Contract(DhxPool_ABI, WalletState.config.DhxPool);

            //挖矿合约基本信息
            const baseInfo = await dhxPoolContract.methods.getBaseInfo().call();
            //代币合约
            let tokenAddress = baseInfo[0];
            //代币精度
            let tokenDecimals = parseInt(baseInfo[1]);
            //代币符号
            let tokenSymbol = baseInfo[2];
            //默认上级，首码地址
            let defaultInvitor = baseInfo[3];
            //全网累计参与代币数量
            let accAmount = baseInfo[4];
            //当前时间，单位秒
            let blockTime = parseInt(baseInfo[5]);
            //静态池余额
            let staticPoolBalance = baseInfo[6];
            this.setState({
                tokenAddress: tokenAddress,
                tokenDecimals: tokenDecimals,
                tokenSymbol: tokenSymbol,
                defaultInvitor: defaultInvitor,
                accAmount: showFromWei(accAmount, tokenDecimals, 2),
                staticPoolBalance: showFromWei(staticPoolBalance, tokenDecimals, 2),
            })

            //获取矿池信息
            let poolInfoResult = await dhxPoolContract.methods.getPoolInfo().call();
            //最小参与金额
            let minAmount = new BN(poolInfoResult[0], 10);
            //最大参与金额
            let maxAmount = new BN(poolInfoResult[1], 10);
            //奖励倍数，分母1万
            let rewardRate = parseInt(poolInfoResult[2]);
            //全网权重
            let poolTotalAmount = poolInfoResult[3];
            //合约使用，累计权重奖励
            let accReward = poolInfoResult[4];
            //合约使用，每1单位权重累计奖励
            let accPerShare = poolInfoResult[5];
            //最近一次静态矿池拨出时间
            let lastStaticPoolRewardTime = parseInt(poolInfoResult[6]);
            //静态矿池拨出比例
            let staticPoolRewardRate = poolInfoResult[7];
            //静态矿池拨出周期，间隔
            let staticPoolRewardDuration = parseInt(poolInfoResult[8]);
            //倒计时
            let countdownTime = showCountdownTime(lastStaticPoolRewardTime + staticPoolRewardDuration - blockTime);
            this.setState({
                rewardRate: rewardRate,
                minAmount: minAmount,
                maxAmount: maxAmount,
                showMinAmount: showFromWei(minAmount, tokenDecimals, 2),
                showMaxAmount: showFromWei(maxAmount, tokenDecimals, 2),
                poolTotalAmount: showFromWei(poolTotalAmount, tokenDecimals, 2),
                countdownTime: countdownTime,
            })


            let account = WalletState.wallet.account;
            if (account) {
                //用户挖矿信息
                const userInfo = await dhxPoolContract.methods.getUserInfo(account).call();
                //累计参与
                let userTotalAmount = new BN(userInfo[0], 10);
                //奖励总额度
                let totalReward = new BN(userInfo[1], 10);
                //直推奖励
                let invitorReward = new BN(userInfo[2], 10);
                //见点链接奖励
                let linkReward = new BN(userInfo[3], 10);
                //团队奖励
                let teamReward = new BN(userInfo[4], 10);
                //全球级别分红
                let worldReward = new BN(userInfo[5], 10);
                //权重分红
                let poolReward = new BN(userInfo[6], 10);
                //已领取奖励
                let claimedReward = new BN(userInfo[7], 10);
                //代币余额
                let tokenBalance = new BN(userInfo[8], 10);
                //代币授权额度
                let tokenAllowance = new BN(userInfo[9], 10);
                //倒计时预估权重分红
                let pendingCalPoolReward = new BN(userInfo[10], 10);
                let pendingReward = invitorReward.add(linkReward).add(teamReward)
                    .add(worldReward).add(poolReward);
                let maxPendingReward = totalReward.sub(claimedReward);
                if (pendingReward.gt(maxPendingReward)) {
                    pendingReward = maxPendingReward;
                }
                this.setState({
                    userTotalAmount: showFromWei(userTotalAmount, tokenDecimals, 2),
                    totalReward: showFromWei(totalReward, tokenDecimals, 2),
                    invitorReward: showFromWei(invitorReward, tokenDecimals, 2),
                    linkReward: showFromWei(linkReward, tokenDecimals, 2),
                    teamReward: showFromWei(teamReward, tokenDecimals, 2),
                    worldReward: showFromWei(worldReward, tokenDecimals, 2),
                    poolReward: showFromWei(poolReward, tokenDecimals, 2),
                    claimedReward: showFromWei(claimedReward, tokenDecimals, 2),
                    pendingReward: showFromWei(pendingReward, tokenDecimals, 2),
                    tokenBalance: tokenBalance,
                    showTokenBalance: showFromWei(tokenBalance, tokenDecimals, 2),
                    tokenAllowance: tokenAllowance,
                    pendingCalPoolReward: showFromWei(pendingCalPoolReward, tokenDecimals, 2),
                })

                //用户权重分红池子信息
                const userPoolInfo = await dhxPoolContract.methods.getUserPoolInfo(account).call();
                //分红权重
                let userPoolAmount = userPoolInfo[0];
                this.setState({
                    userPoolAmount: showFromWei(userPoolAmount, tokenDecimals, 2),
                })

                //用户团队信息
                const userTeamInfo = await dhxPoolContract.methods.getUserTeamInfo(account).call();
                //是否激活
                let active = userInfo[0];
                //团队人数
                let teamNum = parseInt(userTeamInfo[1]);
                //团队业绩
                let teamAmount = userTeamInfo[2];
                //上级邀请人
                let invitor = userTeamInfo[3];
                //见点链接邀请等级
                let inviteLevel = parseInt(userTeamInfo[4]);
                //团队等级
                let teamLevel = parseInt(userTeamInfo[5]);
                this.setState({
                    teamAmount: showFromWei(teamAmount, tokenDecimals, 2),
                    active: active,
                    teamNum: teamNum,
                    teamLevel: teamLevel,
                    inviteLevel: inviteLevel,
                    invitor: invitor,
                })
            }

            //全球分红池子列表
            let levelPools = [];
            let levelPoolsResult = await dhxPoolContract.methods.getAllLevelPoolInfo().call();
            //该等级用户数量
            let totalAmount = levelPoolsResult[0];
            let len = totalAmount.length;
            //从1开始，0是等级0，没有意义
            for (let i = 1; i < len; ++i) {
                levelPools.push({
                    totalAmount: parseInt(totalAmount[i]),
                });
            }
            this.setState({
                levelPools: levelPools
            });
        } catch (e) {
            console.log("getInfo", e);
            toast.show(e.message);
        } finally {
        }
    }

    formatTime(timestamp) {
        return moment(new BN(timestamp, 10).mul(new BN(1000)).toNumber()).format("YYYY-MM-DD HH:mm:ss");
    }

    //输入框变化
    handleAmountChange(event) {
        let amount = this.state.amountIn;
        let amountInReward = this.state.amountInReward;
        if (event.target.validity.valid) {
            amount = event.target.value;
            amountInReward = parseInt(amount) * this.state.rewardRate / 10000;
        }
        this.setState({ amountIn: amount, amountInReward: amountInReward });
    }

    connectWallet() {
        WalletState.connetWallet();
    }

    //参与挖矿
    async join() {
        if (WalletState.wallet.chainId != CHAIN_ID || !WalletState.wallet.account) {
            toast.show(CHAIN_ERROR_TIP);
            return;
        }
        loading.show();
        try {
            let amount = parseInt(this.state.amountIn);
            //参与数量，处理精度
            let amountToken = toWei(this.state.amountIn, this.state.tokenDecimals);
            if (amountToken.lt(this.state.minAmount)) {
                toast.show("最少参与" + this.state.showMinAmount);
            }
            if (amountToken.gt(this.state.maxAmount)) {
                toast.show("最多参与" + this.state.showMaxAmount);
            }
            //可用代币余额
            var tokenBalance = this.state.tokenBalance;
            if (tokenBalance.lt(amountToken)) {
                toast.show("余额不足");
                // return;
            }

            const web3 = new Web3(Web3.givenProvider);
            let account = WalletState.wallet.account;
            let approvalNum = this.state.tokenAllowance;
            //LP授权额度不够了，需要重新授权
            if (approvalNum.lt(amountToken)) {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, this.state.tokenAddress);
                var transaction = await tokenContract.methods.approve(WalletState.config.DhxPool, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("授权失败");
                    return;
                }
            }
            const dhxPoolContract = new web3.eth.Contract(DhxPool_ABI, WalletState.config.DhxPool);
            //邀请人
            let invitor = this.getRef();
            if (!invitor) {
                invitor = ZERO_ADDRESS;
            }
            //参与挖矿
            var estimateGas = await dhxPoolContract.methods.join(amountToken, invitor).estimateGas({ from: account });
            var transaction = await dhxPoolContract.methods.join(amountToken, invitor).send({ from: account });
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

    //获取邀请人
    getRef() {
        //先从链接获取，如果有，直接使用
        var url = window.location.href;
        var obj = new Object();
        var scan_url = url.split("?");
        if (2 == scan_url.length) {
            scan_url = scan_url[1];
            var strs = scan_url.split("&");
            for (var x in strs) {
                var arr = strs[x].split("=");
                obj[arr[0]] = arr[1];
                //链接里有邀请人
                if ("ref" == arr[0] && arr[1]) {
                    return arr[1];
                }
            }
        }
        //从浏览器缓存获取，这里可能部分浏览器不支持
        var storage = window.localStorage;
        if (storage) {
            return storage["ref"];
        }
        return null;
    }

    //领取奖励
    async claimReward() {
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            const dhxPoolContract = new web3.eth.Contract(DhxPool_ABI, WalletState.config.DhxPool);
            var estimateGas = await dhxPoolContract.methods.claimReward(account).estimateGas({ from: account });
            var transaction = await dhxPoolContract.methods.claimReward(account).send({ from: account });
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

    //邀请好友
    invite() {
        if (WalletState.wallet.account) {
            var url = window.location.href;
            url = url.split("?")[0];
            let inviteLink = url + "?ref=" + WalletState.wallet.account;
            if (copy(inviteLink)) {
                toast.show("邀请链接已复制")
            } else {
                toast.show("邀请失败")
            }
        }
    }

    render() {
        return (
            <div className="Token NFT">
                <Header></Header>
                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>全网累计参与</div>
                        <div>{this.state.accAmount}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>全网权重</div>
                        <div>{this.state.poolTotalAmount}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>个人权重</div>
                        <div>{this.state.userPoolAmount}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>个人累计总收益</div>
                        <div>{this.state.claimedReward}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>个人累计参与</div>
                        <div>{this.state.userTotalAmount}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>个人分红总额度</div>
                        <div>{this.state.totalReward}</div>
                    </div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='InputBg mt10'>
                        <input className="Input" type="text" value={this.state.amountIn}
                            placeholder={'请输入数量,' + this.state.showMinAmount + '-' + this.state.showMaxAmount}
                            onChange={this.handleAmountChange.bind(this)} pattern="[0-9]*" >
                        </input>
                    </div>
                    <div className='mt10 prettyBg button' onClick={this.join.bind(this)}>参与</div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>预计收益</div>
                        <div>{this.state.amountInReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt10'>
                        <div>钱包余额</div>
                        <div>{this.state.showTokenBalance} {this.state.tokenSymbol}</div>
                    </div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>静态池分红倒计时</div>
                        <div>{this.state.countdownTime[1]}:{this.state.countdownTime[2]}:{this.state.countdownTime[3]}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>静态池余额</div>
                        <div>{this.state.staticPoolBalance} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>预计获得分红</div>
                        <div>{this.state.pendingCalPoolReward} {this.state.tokenSymbol}</div>
                    </div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>权重分红</div>
                        <div>{this.state.poolReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>团队分红</div>
                        <div>{this.state.teamReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>全球分红</div>
                        <div>{this.state.worldReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>链接分红</div>
                        <div>{this.state.linkReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>直推分红</div>
                        <div>{this.state.invitorReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>总收益</div>
                        <div>{this.state.pendingReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='mt10 prettyBg button' onClick={this.claimReward.bind(this)}>领取</div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>上级邀请人</div>
                        <div>{showLongAccount(this.state.invitor)}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>团队业绩</div>
                        <div>{this.state.teamAmount}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>团队级别</div>
                        <div>{this.state.teamLevel}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>团队人数</div>
                        <div>{this.state.teamNum}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>见点邀请级别</div>
                        <div>{this.state.inviteLevel}</div>
                    </div>
                    <div className='mt20 prettyBg button' onClick={this.invite.bind(this)}>邀请</div>
                </div>

                <div className='ModuleTop'>
                    <div className='Title'>全球分红等级总量</div>
                </div>

                {this.state.levelPools.map((item, index) => {
                    return <div className='Module mt10' key={index}>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div className=''>等级{index + 1}</div>
                            <div className=''>{item.totalAmount}</div>
                        </div>
                    </div>
                })}

                <div className='mt20'></div>
            </div>
        );
    }
}

export default withNavigation(Mint);