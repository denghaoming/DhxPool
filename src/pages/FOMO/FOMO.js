import React, { Component, createFactory } from 'react'
import { withNavigation } from '../../hocs'
import "./FOMO.css"
import WalletState, { CHAIN_ID, ZERO_ADDRESS, CHAIN_ERROR_TIP, MAX_INT } from '../../state/WalletState';
import loading from '../../components/loading/Loading'
import toast from '../../components/toast/toast'
import Web3 from 'web3'
import { ERC20_ABI } from "../../abi/erc20"
import { FOMO_Abi } from '../../abi/FOMO_Abi'
import { showCountdownTime, showFromWei, showAccount, showLongAccount } from '../../utils'
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
        invitor: ZERO_ADDRESS,
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
            const fomoContract = new web3.eth.Contract(FOMO_Abi, WalletState.config.FOMO);

            //获取基本信息
            const baseInfo = await fomoContract.methods.getBaseInfo().call();
            //USDT代币合约
            let usdtAddress = baseInfo[0];
            //USDT代币精度
            let usdtDecimals = parseInt(baseInfo[1]);
            //USDT代币符号
            let usdtSymbol = baseInfo[2];
            //FOMO代币合约
            let tokenAddress = baseInfo[3];
            //FOMO代币精度
            let tokenDecimals = parseInt(baseInfo[4]);
            //FOMO代币符号
            let tokenSymbol = baseInfo[5];
            //每次参与需要USDT数量
            let perUsdtAmount = baseInfo[6];
            //损失奖励代币数量
            let perTokenAmount = baseInfo[7];
            //创建池子价格
            let poolCreatePrice = baseInfo[8];

            //获取全部池子基本信息
            let allPoolBaseInfo = await fomoContract.methods.getAllPoolBaseInfo().call();
            //最新场次Id
            let pids = allPoolBaseInfo[0];
            //池子创建者，为0是公共池子
            let creators = allPoolBaseInfo[1];
            //池子创建者手续费
            let creatorFeeAmounts = allPoolBaseInfo[2];

            //获取全部FOMO池子当前场次信息
            let allPoolInfo = await fomoContract.methods.getAllPoolInfo().call();
            //奖池USDT数量
            let poolRewards = allPoolInfo[0];
            //开奖时间
            let rewardTimes = allPoolInfo[1];
            //总参与次数
            let accountLens = allPoolInfo[2];
            //最近参与地址
            let showAccountss = allPoolInfo[3];
            //最近参与时间
            let showAccountTimess = allPoolInfo[4];
            //前一场获奖地址
            let lastRewardAccounts = allPoolInfo[5];
            //区块时间
            let blockTime = parseInt(allPoolInfo[6]);

            let poolInfos = [];
            let len = poolRewards.length;
            for (let i = 0; i < len; ++i) {
                let poolReward = poolRewards[i];
                let rewardTime = parseInt(rewardTimes[i]);
                let showAccounts = showAccountss[i];
                let accounts = [];
                let showAccountTimes = showAccountTimess[i];
                //最近购买地址和时间
                for (let j = 0; j < showAccounts.length; j++) {
                    accounts.push({
                        account: showAccounts[j],
                        time: this.formatTime(parseInt(showAccountTimes[j])),
                    });
                }
                let lastRewardAccount = lastRewardAccounts[i];
                poolInfos.push({
                    //期数
                    pid: parseInt(pids[i]),
                    //创建者
                    creator: creators[i],
                    //创建者手续费
                    creatorFeeAmount: showFromWei(creatorFeeAmounts[i], usdtDecimals, 2),
                    poolReward: showFromWei(poolReward, usdtDecimals, 2),
                    accountLen: parseInt(accountLens[i]),
                    countdown: showCountdownTime(rewardTime - blockTime),
                    accounts: accounts,
                    lastRewardAccount: lastRewardAccount,
                });
            }

            let account = WalletState.wallet.account;
            if (account) {
                //获取用户基本信息
                const userInfo = await fomoContract.methods.getUserInfo(account).call();
                //出局奖励
                let queueUsdtReward = userInfo[0];
                //奖池奖励
                let poolUsdtReward = userInfo[1];
                //邀请奖励
                let inviteUsdtReward = userInfo[2];
                //代币奖励
                let tokenReward = userInfo[3];
                //是否参与过FOMO
                let isActive = userInfo[4];
                //团队人数：统计9级
                let teamNum = parseInt(userInfo[5]);
                //邀请奖励层次
                let inviteRewardLevel = parseInt(userInfo[6]);
                //USDT余额
                let usdtBalance = userInfo[7];
                //USDT授权给预售合约的额度
                let usdtAllowance = userInfo[8];
                //FOMO代币余额
                let tokenBalance = userInfo[9];
                //已领取FOMO代币
                let claimedToken = userInfo[10];
                //团队业绩
                let teamAmount = userInfo[11];

                //获取上级邀请人
                const invitor = await fomoContract.methods._invitor(account).call();

                //获取用户全部池子本期参与次数，出局次数
                const userAllPoolInfo = await fomoContract.methods.getUserAllPoolInfo(account).call();
                //总参与次数，数组，和池子一一对应
                let joinNums = userAllPoolInfo[0];
                //出局次数
                let queueRewardNums = userAllPoolInfo[1];
                //是否已经统计代币奖励
                let cals = userAllPoolInfo[2];
                for (let i = 0; i < len; ++i) {
                    poolInfos[i].joinNum = parseInt(joinNums[i]);
                    poolInfos[i].queueRewardNum = parseInt(queueRewardNums[i]);
                    poolInfos[i].cal = cals[i];
                }

                this.setState({
                    queueUsdtReward: showFromWei(queueUsdtReward, usdtDecimals, 2),
                    poolUsdtReward: showFromWei(poolUsdtReward, usdtDecimals, 2),
                    inviteUsdtReward: showFromWei(inviteUsdtReward, usdtDecimals, 2),
                    tokenReward: showFromWei(tokenReward, tokenDecimals, 2),
                    teamNum: teamNum,
                    inviteRewardLevel: inviteRewardLevel,
                    usdtBalance: usdtBalance,
                    showUsdtBalance: showFromWei(usdtBalance, usdtDecimals, 2),
                    usdtAllowance: usdtAllowance,
                    showTokenBalance: showFromWei(tokenBalance, tokenDecimals, 2),
                    invitor: invitor,
                    claimedToken: showFromWei(claimedToken, tokenDecimals, 2),
                    teamAmount: showFromWei(teamAmount, usdtDecimals, 2),
                });
            }

            this.setState({
                usdtAddress: usdtAddress,
                usdtDecimals: usdtDecimals,
                usdtSymbol: usdtSymbol,
                tokenAddress: tokenAddress,
                tokenDecimals: tokenDecimals,
                tokenSymbol: tokenSymbol,
                perUsdtAmount: perUsdtAmount,
                showPerUsdtAmount: showFromWei(perUsdtAmount, usdtDecimals, 2),
                poolCreatePrice: poolCreatePrice,
                showPoolCreatePrice: showFromWei(poolCreatePrice, usdtDecimals, 2),
                poolInfos: poolInfos
            });
        } catch (e) {
            console.log("getInfo", e.message);
            toast.show(e.message);
        } finally {
        }
    }

    formatTime(timestamp) {
        return moment(new BN(timestamp, 10).mul(new BN(1000)).toNumber()).format("MM-DD HH:mm");
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
        let cost = new BN(this.state.perUsdtAmount, 10);
        //USDT 余额
        var usdtBalance = new BN(this.state.usdtBalance, 10);
        if (usdtBalance.lt(cost)) {
            toast.show(this.state.usdtSymbol + "余额不足");
            // return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            let approvalNum = new BN(this.state.usdtAllowance, 10);
            //授权额度不够了，需要重新授权
            if (approvalNum.lt(cost)) {
                const usdtContract = new web3.eth.Contract(ERC20_ABI, this.state.usdtAddress);
                var transaction = await usdtContract.methods.approve(WalletState.config.FOMO, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("授权失败");
                    return;
                }
            }
            const fomoContract = new web3.eth.Contract(FOMO_Abi, WalletState.config.FOMO);
            //购买
            let invitor = this.getRef();
            if (!invitor) {
                invitor = ZERO_ADDRESS;
            }
            var estimateGas = await fomoContract.methods.join(index, invitor).estimateGas({ from: account });
            var transaction = await fomoContract.methods.join(index, invitor).send({ from: account });
            if (transaction.status) {
                toast.show("参与FOMO成功");
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

    async createPool(e) {
        if (WalletState.wallet.chainId != CHAIN_ID) {
            toast.show(CHAIN_ERROR_TIP);
            return;
        }
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        let cost = new BN(this.state.poolCreatePrice, 10);
        //USDT 余额
        var usdtBalance = new BN(this.state.usdtBalance, 10);
        if (usdtBalance.lt(cost)) {
            toast.show(this.state.usdtSymbol + "余额不足");
            // return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            let approvalNum = new BN(this.state.usdtAllowance, 10);
            //授权额度不够了，需要重新授权
            if (approvalNum.lt(cost)) {
                const usdtContract = new web3.eth.Contract(ERC20_ABI, this.state.usdtAddress);
                var transaction = await usdtContract.methods.approve(WalletState.config.FOMO, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("授权失败");
                    return;
                }
            }
            const fomoContract = new web3.eth.Contract(FOMO_Abi, WalletState.config.FOMO);
            //创建池子
            var estimateGas = await fomoContract.methods.createPool().estimateGas({ from: account });
            var transaction = await fomoContract.methods.createPool().send({ from: account });
            if (transaction.status) {
                toast.show("创建FOMO池成功");
            } else {
                toast.show("创建失败");
            }
        } catch (e) {
            console.log("e", e);
            toast.show(e.message);
        } finally {
            loading.hide();
        }
    }

    async claim() {
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            const fomoContract = new web3.eth.Contract(FOMO_Abi, WalletState.config.FOMO);
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

    connectWallet() {
        WalletState.connetWallet();
    }

    render() {
        return (
            <div className="Presale">
                <Header></Header>
                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>代币余额</div>
                        <div>{this.state.showTokenBalance}{this.state.tokenSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle mt20'>
                        <div>出局奖励</div>
                        <div>{this.state.queueUsdtReward}{this.state.usdtSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>奖池奖励</div>
                        <div>{this.state.poolUsdtReward}{this.state.usdtSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>邀请奖励</div>
                        <div>{this.state.inviteUsdtReward}{this.state.usdtSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>代币奖励</div>
                        <div>{this.state.tokenReward}{this.state.tokenSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>已领取代币</div>
                        <div>{this.state.claimedToken}{this.state.tokenSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle mt20'>
                        <div className='RuleTitleBg prettyBg' onClick={this.invite.bind(this)}>
                            <img className='clock' src={IconInvite}></img>
                            <div className='Tip'>邀请好友</div>
                        </div>

                        <div className='RuleTitleBg prettyBg' onClick={this.claim.bind(this)}>
                            <img className='clock' src={IconInvite}></img>
                            <div className='Tip'>领取奖励</div>
                        </div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>奖励层次</div>
                        <div>{this.state.inviteRewardLevel}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>团队人数</div>
                        <div>{this.state.teamNum}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>团队业绩</div>
                        <div>{this.state.teamAmount}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>上级邀请人</div>
                        <div>{showLongAccount(this.state.invitor)}</div>
                    </div>
                </div>

                {this.state.poolInfos.map((item, index) => {
                    return <div className='Module ModuleTop' key={index}>
                        <div>{index + 1} 号池子第 {item.pid+1} 期，总参与次数：{item.accountLen}</div>

                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>开奖倒计时</div>
                            <div>{item.countdown[0]}:{item.countdown[1]}:{item.countdown[2]}</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>本次FOMO奖池</div>
                            <div>{item.poolReward} {this.state.usdtSymbol}</div>
                        </div>

                        <div className='mt10 prettyBg button' onClick={this.join.bind(this, index)}>支付{this.state.showPerUsdtAmount}{this.state.usdtSymbol}参与</div>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>我的余额</div>
                            <div>{this.state.showUsdtBalance}{this.state.usdtSymbol}</div>
                        </div>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>我的参与次数</div>
                            <div>{item.joinNum}</div>
                        </div>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>我的出局次数</div>
                            <div>{item.queueRewardNum}</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle mt20'>
                            <div>最近FOMO地址</div>
                            <div>时间</div>
                        </div>

                        {
                            item.accounts.map((i, j) => {
                                return <div className='ModuleContentWitdh RuleTitle' key={j}>
                                    <div>{showLongAccount(i.account)}</div>
                                    <div>{i.time}</div>
                                </div>
                            })
                        }

                        <div className='ModuleContentWitdh RuleTitle mt20'>
                            <div>上一期中奖地址</div>
                            <div>{showLongAccount(item.lastRewardAccount)}</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle mt20'>
                            <div>创建者地址</div>
                            <div>{showLongAccount(item.creator)}</div>
                        </div>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>创建者手续费</div>
                            <div>{item.creatorFeeAmount}</div>
                        </div>
                    </div>
                })}

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>创建池子价格</div>
                        <div>{this.state.showPoolCreatePrice}{this.state.usdtSymbol}</div>
                    </div>
                    <div className='mt10 prettyBg button' onClick={this.createPool.bind(this)}>创建新FOMO池</div>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>余额</div>
                        <div>{this.state.showUsdtBalance}{this.state.usdtSymbol}</div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withNavigation(FOMO);