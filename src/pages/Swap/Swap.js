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
import { SwapPool_ABI } from '../../abi/SwapPool_ABI';
import moment from 'moment';

class Swap extends Component {
    state = {
        chainId: 0,
        account: "",
        lang: "EN",
        local: {},
        wmxcIn: "",
        tixOut: '',
        tixRate: new BN(30000),
        tixIn: '',
        wmxcOut: '',
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
            //兑换池合约
            const swapPoolContract = new web3.eth.Contract(SwapPool_ABI, WalletState.config.SwapPool);

            //兑换池代币信息
            const tokenInfo = await swapPoolContract.methods.tokenInfo().call();
            //wmxc合约
            let wmxcAddress = tokenInfo[0];
            //wmxc精度
            let wmxcDecimals = parseInt(tokenInfo[1]);
            //wmxc符号
            let wmxcSymbol = tokenInfo[2];
            //tix合约
            let tixAddress = tokenInfo[3];
            //tix精度
            let tixDecimals = parseInt(tokenInfo[4]);
            //tix符号
            let tixSymbol = tokenInfo[5];
            //wmxc兑换tix比例，分母为10000
            let tixRate = new BN(tokenInfo[6], 10);
            //最小兑换wmxc数量
            let minWmxc = new BN(tokenInfo[7], 10);
            //池子里wmxc数量
            let poolWMXC = new BN(tokenInfo[8], 10);
            //池子里tix数量
            let poolTIX = new BN(tokenInfo[9], 10);
            //tix流通数量
            let totalTIX = new BN(tokenInfo[10], 10);
            //最少兑换tix数量
            let minTix = minWmxc.mul(tixRate).div(new BN(10000));

            this.setState({
                wmxcAddress: wmxcAddress,
                wmxcDecimals: wmxcDecimals,
                wmxcSymbol: wmxcSymbol,
                tixAddress: tixAddress,
                tixDecimals: tixDecimals,
                tixSymbol: tixSymbol,
                tixRate: tixRate,
                minWmxc: minWmxc,
                showMinWmxc: showFromWei(minWmxc, wmxcDecimals, 2),
                poolWMXC: showFromWei(poolWMXC, wmxcDecimals, 2),
                poolTIX: showFromWei(poolTIX, tixDecimals, 2),
                totalTIX: showFromWei(totalTIX, tixDecimals, 2),
                minTix: minTix,
                showMinTix: showFromWei(minTix, tixDecimals, 2),
            })

            let account = WalletState.wallet.account;
            if (account) {
                //用户信息
                const userInfo = await swapPoolContract.methods.getUserInfo(account).call();
                let wmxcBalance = new BN(userInfo[0], 10);
                let wmxcAllowance = new BN(userInfo[1], 10);
                let tixBalance = new BN(userInfo[2], 10);
                let tixAllowance = new BN(userInfo[3], 10);
                this.setState({
                    wmxcBalance: wmxcBalance,
                    wmxcAllowance: wmxcAllowance,
                    showWmxcBalance: showFromWei(wmxcBalance, wmxcDecimals, 2),
                    tixBalance: tixBalance,
                    tixAllowance: tixAllowance,
                    showTixBalance: showFromWei(tixBalance, tixDecimals, 2),
                })
            }
        } catch (e) {
            console.log("getInfo", e);
            toast.show(e.message);
        } finally {
        }
    }

    //wmxc输入框变化
    handleWmxcInChange(event) {
        let amountIn = this.state.wmxcIn;
        let amountOut = this.state.tixOut;
        if (event.target.validity.valid) {
            amountIn = event.target.value;
            if (amountIn) {
                let wmxcDecimals = this.state.wmxcDecimals;
                let tixRate = this.state.tixRate;
                amountOut = toWei(amountIn, wmxcDecimals).mul(tixRate).div(new BN(10000));
                let tixDecimals = this.state.tixDecimals;
                amountOut = showFromWei(amountOut, tixDecimals, 2);
            } else {
                amountOut = '';
            }
        }

        this.setState({ wmxcIn: amountIn, tixOut: amountOut });
    }

    //tix输入框变化
    handleTixInChange(event) {
        let amountIn = this.state.tixIn;
        let amountOut = this.state.wmxcOut;
        if (event.target.validity.valid) {
            amountIn = event.target.value;
            if (amountIn) {
                let tixDecimals = this.state.tixDecimals;
                let tixRate = this.state.tixRate;
                amountOut = toWei(amountIn, tixDecimals).mul(new BN(10000)).div(tixRate);
                let wmxcDecimals = this.state.wmxcDecimals;
                amountOut = showFromWei(amountOut, wmxcDecimals, 2);
            } else {
                amountOut = "";
            }

        }
        this.setState({ tixIn: amountIn, wmxcOut: amountOut });
    }

    connectWallet() {
        WalletState.connetWallet();
    }

    //购买Tix
    async buyTix() {
        if (WalletState.wallet.chainId != CHAIN_ID || !WalletState.wallet.account) {
            toast.show(CHAIN_ERROR_TIP);
            return;
        }
        loading.show();
        try {
            let wmxcIn = this.state.wmxcIn;
            //参与数量，处理精度
            let wmxcInDecimals = toWei(wmxcIn, this.state.wmxcDecimals);
            if (wmxcInDecimals.lt(this.state.minWmxc)) {
                toast.show("最少参与" + this.state.showMinWmxc);
            }
            //可用代币余额
            var wmxcBalance = this.state.wmxcBalance;
            if (wmxcBalance.lt(wmxcInDecimals)) {
                toast.show("余额不足");
                // return;
            }

            const web3 = new Web3(Web3.givenProvider);
            let account = WalletState.wallet.account;
            let approvalNum = this.state.wmxcAllowance;
            //LP授权额度不够了，需要重新授权
            if (approvalNum.lt(wmxcInDecimals)) {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, this.state.wmxcAddress);
                var transaction = await tokenContract.methods.approve(WalletState.config.SwapPool, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("授权失败");
                    return;
                }
            }
            const swapPoolContract = new web3.eth.Contract(SwapPool_ABI, WalletState.config.SwapPool);
            //买入TIX
            var estimateGas = await swapPoolContract.methods.buyTIX(wmxcInDecimals).estimateGas({ from: account });
            var transaction = await swapPoolContract.methods.buyTIX(wmxcInDecimals).send({ from: account });
            if (transaction.status) {
                toast.show("买入成功");
            } else {
                toast.show("买入失败");
            }
        } catch (e) {
            console.log("e", e);
            toast.show(e.message);
        } finally {
            loading.hide();
        }
    }

    //卖出Tix
    async sellTix() {
        if (WalletState.wallet.chainId != CHAIN_ID || !WalletState.wallet.account) {
            toast.show(CHAIN_ERROR_TIP);
            return;
        }
        loading.show();
        try {
            let tixIn = this.state.tixIn;
            //参与数量，处理精度
            let tixInDecimals = toWei(tixIn, this.state.tixDecimals);
            if (tixInDecimals.lt(this.state.minTix)) {
                toast.show("最少参与" + this.state.showMinTix);
            }
            //可用代币余额
            var tixBalance = this.state.tixBalance;
            if (tixBalance.lt(tixInDecimals)) {
                toast.show("余额不足");
                // return;
            }

            const web3 = new Web3(Web3.givenProvider);
            let account = WalletState.wallet.account;
            let approvalNum = this.state.wmxcAllowance;
            //LP授权额度不够了，需要重新授权
            if (approvalNum.lt(tixInDecimals)) {
                const tokenContract = new web3.eth.Contract(ERC20_ABI, this.state.tixAddress);
                var transaction = await tokenContract.methods.approve(WalletState.config.SwapPool, MAX_INT).send({ from: account });
                if (!transaction.status) {
                    toast.show("授权失败");
                    return;
                }
            }
            const swapPoolContract = new web3.eth.Contract(SwapPool_ABI, WalletState.config.SwapPool);
            //卖出TIX
            var estimateGas = await swapPoolContract.methods.sellTIX(tixInDecimals).estimateGas({ from: account });
            var transaction = await swapPoolContract.methods.sellTIX(tixInDecimals).send({ from: account });
            if (transaction.status) {
                toast.show("卖出成功");
            } else {
                toast.show("卖出失败");
            }
        } catch (e) {
            console.log("e", e);
            toast.show(e.message);
        } finally {
            loading.hide();
        }
    }

    render() {
        return (
            <div className="Token NFT">
                <Header></Header>
                <div className='Module ModuleTop'>
                    <div className='ModuleContentWitdh RuleTitle'>
                        <div>{this.state.tixSymbol}流通数量</div>
                        <div>{this.state.totalTIX}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle mt10'>
                        <div>兑换池余额</div>
                        <div>{this.state.poolWMXC} {this.state.wmxcSymbol} / {this.state.poolTIX} {this.state.tixSymbol}</div>
                    </div>

                    <div className='ModuleContentWitdh RuleTitle mt10'>
                        <div>钱包余额</div>
                        <div>{this.state.showWmxcBalance} {this.state.wmxcSymbol} / {this.state.showTixBalance} {this.state.tixSymbol}</div>
                    </div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='InputBg mt10'>
                        <input className="Input" type="text" value={this.state.wmxcIn}
                            placeholder={'请输入' + this.state.wmxcSymbol + '数量,至少' + this.state.showMinWmxc}
                            onChange={this.handleWmxcInChange.bind(this)} pattern="[0-9.]*" >
                        </input>
                    </div>
                    <div className='mt10 prettyBg button' onClick={this.buyTix.bind(this)}>买入TIX</div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>预计获得</div>
                        <div>{this.state.tixOut} {this.state.tixSymbol}</div>
                    </div>
                </div>

                <div className='Module ModuleTop'>
                    <div className='InputBg mt10'>
                        <input className="Input" type="text" value={this.state.tixIn}
                            placeholder={'请输入' + this.state.tixSymbol + '数量,至少' + this.state.showMinTix}
                            onChange={this.handleTixInChange.bind(this)} pattern="[0-9.]*" >
                        </input>
                    </div>
                    <div className='mt10 prettyBg button' onClick={this.sellTix.bind(this)}>卖出TIX</div>
                    <div className='ModuleContentWitdh RuleTitle mt5'>
                        <div>预计获得</div>
                        <div>{this.state.wmxcOut} {this.state.wmxcSymbol}</div>
                    </div>
                </div>

                <div className='mt20'></div>
            </div>
        );
    }
}

export default withNavigation(Swap);