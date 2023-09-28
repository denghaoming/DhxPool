import React, { Component } from 'react'
import { withNavigation } from '../../hocs'
import "../FOMO/FOMO.css"
import "../Token/Token.css"
import "../NFT/NFT.css"
import WalletState, { CHAIN_ID, CHAIN_ERROR_TIP, MAX_INT } from '../../state/WalletState';
import loading from '../../components/loading/Loading'
import toast from '../../components/toast/toast'
import Web3 from 'web3'
import { ERC20_ABI } from "../../abi/erc20"
import { showFromWei, toWei } from '../../utils'
import BN from 'bn.js'
import moment from 'moment'
import Header from '../Header';
import { StakePool_ABI } from '../../abi/StakePool_ABI';

class Stake extends Component {
    state = {
        chainId: 0,
        account: "",
        lang: "EN",
        local: {},
        amountIn: "",
        records: [],
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
            const stakeContract = new web3.eth.Contract(StakePool_ABI, WalletState.config.StakePool);

            //获取基本信息
            const baseInfo = await stakeContract.methods.getBaseInfo().call();
            //代币合约
            let tokenAddress = baseInfo[0];
            //代币精度
            let tokenDecimals = parseInt(baseInfo[1]);
            //代币符号
            let tokenSymbol = baseInfo[2];
            //当前质押总量
            let totalJoinAmount = baseInfo[3];
            //累计参与数量
            let accJoinAmount = baseInfo[4];
            //累计领取奖励
            let accClaimedAmount = baseInfo[5];
            //当前时间，时间戳，秒
            let nowTime = parseInt(baseInfo[6]);
            //当前收益率
            let rates = baseInfo[7];
            this.setState({
                tokenAddress: tokenAddress,
                tokenDecimals: tokenDecimals,
                tokenSymbol: tokenSymbol,
                totalJoinAmount: showFromWei(totalJoinAmount, tokenDecimals, 2),
            });

            let account = WalletState.wallet.account;
            if (account) {
                //获取用户信息
                const userInfo = await stakeContract.methods.getUserInfo(account).call();
                //用户质押数量
                let joinAmount = userInfo[0];
                //用户累计领取收益
                let claimedReward = userInfo[1];
                //代币余额
                let tokenBalance = new BN(userInfo[2], 10);
                //代币授权额度
                let tokenAllowance = new BN(userInfo[3], 10);
                //一期奖励额度
                let mxcPoolReward = new BN(userInfo[4], 10);
                //剩余质押额度
                let remainJoinAmount = new BN(userInfo[5], 10);

                this.setState({
                    joinAmount: showFromWei(joinAmount, tokenDecimals, 2),
                    claimedReward: showFromWei(claimedReward, tokenDecimals, 2),
                    tokenBalance: tokenBalance,
                    showTokenBalance: showFromWei(tokenBalance, tokenDecimals, 2),
                    tokenAllowance: tokenAllowance,
                    mxcPoolReward: showFromWei(mxcPoolReward, tokenDecimals, 2),
                    remainJoinAmount: remainJoinAmount,
                    showRemainJoinAmount: showFromWei(remainJoinAmount, tokenDecimals, 2),
                });

                //质押列表
                let records = [];
                let startIndex = 0;
                let pageSize = 50;
                let index = 0;
                while (true) {
                    //获取记录列表
                    let recordssResult = await stakeContract.methods.getRecords(account, startIndex, pageSize).call();
                    //有效记录条数
                    let len = parseInt(recordssResult[0]);
                    //质押数量
                    let amounts = recordssResult[1];
                    //开始时间
                    let startTimes = recordssResult[2];
                    //记录的收益率，需要转换为数组，合约使用
                    let rateInts = recordssResult[3];
                    //已领取的收益
                    let claimedRewards = recordssResult[4];
                    //退出时间，退出后不显示
                    let exitTimes = recordssResult[5];
                    //待领取收益
                    let pendingRewards = recordssResult[6];
                    //当前收益率
                    let currentRates = recordssResult[7];
                    for (let i = 0; i < len; ++i) {
                        let exitTime = parseInt(exitTimes[i]);
                        if (0 == exitTime) {
                            records.push({
                                //id领取收益和取消时要用到，确保和返回的记录顺序一致
                                id: index,
                                amount: showFromWei(amounts[i], tokenDecimals, 2),
                                startTime: this.formatTime(parseInt(startTimes[i])),
                                currentRate: parseInt(currentRates[i]) / 100,
                                pendingReward: showFromWei(pendingRewards[i], tokenDecimals, 6),
                            });
                        }
                        index++;
                    }
                    if (len < pageSize) {
                        break;
                    }
                    startIndex += pageSize;
                }

                this.setState({
                    records: records,
                });
            }
        } catch (e) {
            console.log("getInfo", e.message);
            toast.show(e.message);
        } finally {
        }
    }

    //参与质押
    async stake() {
        if (WalletState.wallet.chainId != CHAIN_ID || !WalletState.wallet.account) {
            toast.show(CHAIN_ERROR_TIP);
            return;
        }
        loading.show();
        try {
            let amount = parseInt(this.state.amountIn);
            //参与数量，处理精度
            let amountToken = toWei(this.state.amountIn, this.state.tokenDecimals);
            if (amountToken.gt(this.state.remainJoinAmount)) {
                toast.show("最多参与" + this.state.showRemainJoinAmount);
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
            //授权额度不够了，需要重新授权
            if (approvalNum.lt(amountToken)) {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, this.state.tokenAddress);
                var transaction = await tokenContract.methods.approve(WalletState.config.StakePool, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("授权失败");
                    return;
                }
            }
            const stakeContract = new web3.eth.Contract(StakePool_ABI, WalletState.config.StakePool);
            //参与质押
            var estimateGas = await stakeContract.methods.stake(amountToken).estimateGas({ from: account });
            var transaction = await stakeContract.methods.stake(amountToken).send({ from: account });
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

    formatTime(timestamp) {
        return moment(new BN(timestamp, 10).mul(new BN(1000)).toNumber()).format("YYYY-MM-DD HH:mm:ss");
    }

    //输入框变化
    handleAmountChange(event) {
        let amount = this.state.amountIn;
        if (event.target.validity.valid) {
            amount = event.target.value;
        }
        this.setState({ amountIn: amount });
    }

    //领取收益
    async claimReward(i, e) {
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            const stakeContract = new web3.eth.Contract(StakePool_ABI, WalletState.config.StakePool);
            var estimateGas = await stakeContract.methods.claimReward(i).estimateGas({ from: account });
            var transaction = await stakeContract.methods.claimReward(i).send({ from: account });
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

    //取消质押
    async unStake(i, e) {
        let account = WalletState.wallet.account;
        if (!account) {
            this.connectWallet();
            return;
        }
        loading.show();
        try {
            const web3 = new Web3(Web3.givenProvider);
            const stakeContract = new web3.eth.Contract(StakePool_ABI, WalletState.config.StakePool);
            var estimateGas = await stakeContract.methods.unStake(i).estimateGas({ from: account });
            var transaction = await stakeContract.methods.unStake(i).send({ from: account });
            if (transaction.status) {
                toast.show("取消质押");
            } else {
                toast.show("操作失败");
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
            <div className="Token NFT Presale">
                <Header></Header>
                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>全网总质押</div>
                        <div>{this.state.totalJoinAmount}</div>
                    </div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>第一期释放额度</div>
                        <div>{this.state.mxcPoolReward} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>钱包余额</div>
                        <div>{this.state.showTokenBalance} {this.state.tokenSymbol}</div>
                    </div>
                    <div className='InputBg mt10'>
                        <input className="Input" type="text" value={this.state.amountIn}
                            placeholder={'请输入数量,最大可质押' + this.state.showRemainJoinAmount}
                            onChange={this.handleAmountChange.bind(this)} pattern="[0-9]*" >
                        </input>
                    </div>
                    <div className='mt10 prettyBg button' onClick={this.stake.bind(this)}>参与质押</div>
                </div>

                {this.state.records.map((item, index) => {
                    return <div className='Module ModuleTop' key={index}>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>id</div>
                            <div>{item.id}</div>
                        </div>
                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>质押数量</div>
                            <div>{item.amount}</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>开始时间</div>
                            <div>{item.startTime}</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>当前收益率</div>
                            <div>{item.currentRate}%/天</div>
                        </div>

                        <div className='ModuleContentWitdh RuleTitle'>
                            <div>待领取收益</div>
                            <div>{item.pendingReward}</div>
                        </div>
                        <div className='mt10 prettyBg button' onClick={this.claimReward.bind(this, item.id)}>领取收益</div>
                        <div className='mt10 prettyBg button' onClick={this.unStake.bind(this, item.id)}>取消质押</div>
                    </div>
                })}

                <div className='mt20'></div>
            </div>
        );
    }
}

export default withNavigation(Stake);