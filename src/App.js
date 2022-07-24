import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/Bank.json";

const { expect } = require('chai');

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false);
  ////
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", donate:"", communityName: 
        "", walletAddress: "", transferAmount: "", burnAmount: "", mintAmount: ""  });
  ////
  const [communityAdminAddress, setCommunityAdminAddress] = useState(null);
  const [userTotalBalance, setUserTotalBalance] = useState(null);
  const [communityTotalBalance, setCommunityTotalBalance] = useState(null);///
  const [currentCommunityName, setCurrentCommunityName] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  /////
  const [yourWalletAddress, setYourWalletAddress] = useState(null);
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState(0);
  const [isTokenOwner, setIsTokenOwner] = useState(false);
  const [tokenOwnerAddress, setTokenOwnerAddress] = useState(null);
  const [tokenTransferred, setTokenTransferred] = useState("");
  const [tokenTransferredEth, setTokenTransferredEth] = useState("");  
  const [tokenBurnt, setTokenBurnt] = useState(null);
  const [tokenMinted, setTokenMinted] = useState(null);
  const [onlyAdmin, setOnlyAdmin] = useState(null);
  const [ifDeposite, setIfDeposite] = useState(null);
  const [ifWithdraw, setIfWithdraw] = useState(null);  

  ////
  const [error, setError] = useState(null);





  const communityAddress = '0x57FFC31468e45a2a091Ce2EB7290A064e7Ed38c1';
  const communityABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = accounts[0];
        setIsWalletConnected(true);
        setUserAddress(account);
        console.log("Account Connected: ", account);
      } else {
        setError("Please install a MetaMask wallet to use our community.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }


  /////
  const getTokenInfo = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(communityAddress, communityABI, signer);
        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        let tokenName = await tokenContract.name();
        let tokenSymbol = await tokenContract.symbol();
        let tokenOwner = await tokenContract.owner();
        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)

        setTokenName(`${tokenName} 🦊`);
        setTokenSymbol(tokenSymbol);
        setTokenTotalSupply(tokenSupply);
        setTokenOwnerAddress(tokenOwner);

        if (account.toLowerCase() === tokenOwner.toLowerCase()) {
          setIsTokenOwner(true)
        }

        console.log("Token Name: ", tokenName);
        console.log("Token Symbol: ", tokenSymbol);
        console.log("Token Supply: ", tokenSupply);
        console.log("Token Owner: ", tokenOwner);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const transferToken = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(communityAddress, communityABI, signer);

        const txn = await tokenContract.transfer(inputValue.walletAddress, utils.parseEther(inputValue.transferAmount));
        console.log("Transfering tokens...");
        setTokenTransferred("Transfering tokens...")
        await txn.wait();
        console.log("Tokens Transfered", txn.hash);
        setTokenTransferred("Tokens Transfered  "+ txn.hash.toString())

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our Community token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const burnTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(communityAddress, communityABI, signer);

        const txn = await tokenContract.burn(utils.parseEther(inputValue.burnAmount));
        console.log("Burning tokens...");        
        setTokenBurnt("Burning tokens...")
        await txn.wait();
        console.log("Tokens burned...", txn.hash);
        setTokenBurnt(expect(txn).to.emit(tokenContract, 'tokensBurned'))

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our Community token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const mintTokens = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const tokenContract = new ethers.Contract(communityAddress, communityABI, signer);
        let tokenOwner = await tokenContract.owner();
        const txn = await tokenContract.mint(tokenOwner, utils.parseEther(inputValue.mintAmount));
        console.log("Minting tokens...");
        setTokenMinted("Minting tokens...")
        await txn.wait();
        console.log("Tokens minted...", txn.hash);

        let tokenSupply = await tokenContract.totalSupply();
        tokenSupply = utils.formatEther(tokenSupply)
        setTokenTotalSupply(tokenSupply);        
        setTokenMinted(expect(txn).to.emit(tokenContract, 'additionalTokensMinted'))

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Install a MetaMask wallet to get our Community token.");
      }
    } catch (error) {
      console.log(error);
    }
  }

  /////

  const getCommunityName = async () => {
    try {
      if (window.ethereum) {

        //read data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let communityName = await communityContract.communityName();
        communityName = utils.parseBytes32String(communityName);
        setCurrentCommunityName(communityName.toString());
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
    } catch (error) {
      console.log(error)
    }
  }


//////
  const setCommunityNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        const txn = await communityContract.setCommunityName(utils.formatBytes32String(inputValue.communityName));
        if (expect(txn).to.emit(communityContract, 'storedResponse')){
            setOnlyAdmin(expect(txn).to.emit(communityContract, 'storedResponse'));

        }else{
            console.log("Setting Community Name...");
            setOnlyAdmin("Setting Community Name...");
            await txn.wait();
            console.log("Community Name Changed", txn.hash);
            setOnlyAdmin("Community Name Changed", txn.hash);
            getCommunityName();
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const getcommunityAdminHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let admin = await communityContract.communityAdmin();
        setCommunityAdminAddress(admin);

        const [account] = await window.ethereum.request({ method: 'eth_requestAccounts' });

        if (admin.toLowerCase() === account.toLowerCase()) {
          setIsCommunityAdmin(true);
        }
      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
    } catch (error) {
      console.log(error)
    }
  }


//////
  const donateFundsHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let unityAddress = await communityContract.communityAdmin();
        console.log("provider signer...", unityAddress);

        // const txn = await communityContract.DonateFunds(unityAddress.toLowerCase(), ethers.utils.parseEther(inputValue.donate));
        // console.log("Donating money...");
        // await txn.wait();
        // console.log("Thank You For your Donating to our community Project", txn.hash);

        const txn = await communityContract.transfer(unityAddress.toLowerCase(), utils.parseEther(inputValue.donate));
        console.log("Donating money...");
        setTokenTransferredEth("Donating money...")
        await txn.wait();
        console.log("Thank You For your Donating to our community Project ", txn.hash);
        setTokenTransferredEth("Thank You For your Donating to our community Project  "+ txn.hash.toString())

        userBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
      this.reset()
    } catch (error) {
      console.log(error)
      setTokenTransferredEth(error.message.toString())
    }
  }


  const userBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let balance = await communityContract.getUserBalance();
        setUserTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
    } catch (error) {
      console.log(error)
    }
  }

/////
  const communityBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let balance = await communityContract.getCommunityBalance();
        setCommunityTotalBalance(utils.formatEther(balance));
        console.log("Retrieved balance...", balance);

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }


/////
  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);
        const txn = await communityContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });

        if (expect(txn).to.emit(communityContract, 'storedResponse')){
            setIfDeposite(expect(txn).to.emit(communityContract, 'storedResponse'));

        }else{
            console.log("Deposting money...");
            setIfDeposite("Deposting money...");
            await txn.wait();
            console.log("Deposited money...done", txn.hash);
            setIfDeposite("Deposited money...done", txn.hash);
            userBalanceHandler();
        }

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
    } catch (error) {
      console.log(error)
    }
  }


/////
  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await communityContract.withDrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));

        if (expect(txn).to.emit(communityContract, 'storedResponse')){
            setIfWithdraw(expect(txn).to.emit(communityContract, 'storedResponse'));

        }else{
            console.log("Withdrawing money...");
            setIfWithdraw("Withdrawing money...");
            await txn.wait();
            console.log("Money with drew...done", txn.hash);
            setIfWithdraw("Money with drew...done", txn.hash);
            userBalanceHandler();
        }

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getCommunityName();
    getcommunityAdminHandler();
    userBalanceHandler();
    communityBalanceHandler();   ///////
    ///////
    mintTokens();
    burnTokens();
    transferToken();
    getTokenInfo();
    donateFundsHandler();
    withDrawMoneyHandler();
    deposityMoneyHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Make Our Community Development and NextCoin Project Better By Donating 
      To This Project</span> 💰

      <span className="headline-gradient">NextCoin</span>
        <img className="inline p-3 ml-2" src="https://i.imgur.com/5JfHKHU.png" alt="Meme Coin" width="60" height="30" />
      </h2>

      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentCommunityName === "" && isCommunityAdmin ?
            <p>"Setup the name of your community." </p> :
            <p className="text-3xl font-bold">{currentCommunityName}</p>
          }        
          <span className="mr-5"><strong>Coin:</strong> {tokenName} </span>
          <span className="mr-5"><strong>Ticker:</strong>  {tokenSymbol} </span>
          <span className="mr-5"><strong>Total Supply:</strong>  {tokenTotalSupply}</span>
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="donate"
              placeholder="0.0000 ETH"
              value={inputValue.donate}
            />
            <button
              className="btn-purple"
              onClick={donateFundsHandler}>Donate Funds In ETH</button>
              
          <span className="mr-5"><strong></strong> {tokenTransferredEth} </span>              
          </form>
        </div>        
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="deposit"
              placeholder="0.0000 ETH"
              value={inputValue.deposit}
            />
            <button
              className="btn-purple"
              onClick={deposityMoneyHandler}>Deposit Money In ETH</button>
            <span className="mr-5"><strong></strong> {ifDeposite} </span>  
          </form>
        </div>

        <div className="mt-10 mb-10">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="withdraw"
              placeholder="0.0000 ETH"
              value={inputValue.withdraw}
            />
            <button
              className="btn-purple"
              onClick={withDrawMoneyHandler}>
              Withdraw Money In ETH
            </button>
          <span className="mr-5"><strong></strong> {ifWithdraw} </span>            
          </form>
        </div>
        <div className="mt-7 mb-9">
          <form className="form-style">
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="walletAddress"
              placeholder="Wallet Address"
              value={inputValue.walletAddress}
            />
            <input
              type="text"
              className="input-style"
              onChange={handleInputChange}
              name="transferAmount"
              placeholder={`0.0000 ${tokenSymbol}`}
              value={inputValue.transferAmount}
            />
            <button
              className="btn-purple"
              onClick={transferToken}>Transfer Tokens</button>
              <span className="mr-5"><strong></strong> {tokenTransferred} </span>
          </form>
        </div>        
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance: </span>{userTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Community Admin Address: </span>{communityAdminAddress}</p>
        </div>
        <div className="mt-5">
          {isWalletConnected && <p><span className="font-bold">Your Wallet Address: </span>{userAddress}</p>}
          <button className="btn-connect" onClick={checkIfWalletIsConnected}>
            {isWalletConnected ? "Wallet Connected 🔒" : "Connect Wallet 🔑"}
          </button>
        </div>
      </section>
      {
        isCommunityAdmin && (
          <section className="bank-owner-section">

          <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold">Community Admin Panel</h2>
          <div className="mt-5">
          <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold"><span>Community Balance: </span>{communityTotalBalance}</h2>///
          <h2 className="text-xl border-b-2 border-indigo-500 px-10 py-4 font-bold"><span>Token Balance: </span>{tokenTotalSupply}</h2>
          </div>
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="communityName"
                  placeholder="Enter a Community for Your Bank"
                  value={inputValue.communityName}
                />
                <button
                  className="btn-grey"
                  onClick={setCommunityNameHandler}>
                  Set Community Name
                </button>
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="burnAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.burnAmount}
                />
                <button
                  className="btn-purple"
                  onClick={burnTokens}>
                  Burn Tokens
                </button>
                <span className="mr-5"><strong></strong> {tokenBurnt} </span>
              </form>
            </div>
            <div className="mt-10 mb-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="mintAmount"
                  placeholder={`0.0000 ${tokenSymbol}`}
                  value={inputValue.mintAmount}
                />
                <button
                  className="btn-purple"
                  onClick={mintTokens}>
                  Mint Tokens
                </button>
                <span className="mr-5"><strong></strong> {tokenMinted} </span>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;
