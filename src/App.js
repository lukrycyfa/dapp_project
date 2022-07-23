import { useState, useEffect } from 'react';
import { ethers, utils } from "ethers";
import abi from "./contracts/Bank.json";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false);
  const [inputValue, setInputValue] = useState({ withdraw: "", deposit: "", bankName: "" });
  const [communityAdminAddress, setCommunityAdminAddress] = useState(null);
  const [userTotalBalance, setUserTotalBalance] = useState(null);
  const [currentCommunityName, setCurrentCommunityName] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [error, setError] = useState(null);

  const communityAddress = '0xF66ce2Be06baf0DE9b738189e15CcCC61B7856c1';
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

  const setCommunityNameHandler = async (event) => {
    event.preventDefault();
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        const txn = await communityContract.setCommunityName(utils.formatBytes32String(inputValue.communityName));
        console.log("Setting Community Name...");
        await txn.wait();
        console.log("Community Name Changed", txn.hash);
        getCommunityName();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
      event.target.reset();
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

  const donateFundsHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let unityAddress = await communityContract.communityAdmin();
        console.log("provider signer...", unityAddress);

        const txn = await communityContract.DonateFunds(unityAddress, ethers.utils.parseEther(inputValue.donate));
        console.log("Donating money...");
        await txn.wait();
        console.log("Thank You For your Donating to our community Project", txn.hash);

        userBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
      event.target.reset();
    } catch (error) {
      console.log(error)
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

  const handleInputChange = (event) => {
    setInputValue(prevFormData => ({ ...prevFormData, [event.target.name]: event.target.value }));
  }

  const deposityMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        //write data
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        const txn = await communityContract.depositMoney({ value: ethers.utils.parseEther(inputValue.deposit) });
        console.log("Deposting money...");
        await txn.wait();
        console.log("Deposited money...done", txn.hash);

        userBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
      event.target.reset();
    } catch (error) {
      console.log(error)
    }
  }

  const withDrawMoneyHandler = async (event) => {
    try {
      event.preventDefault();
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const communityContract = new ethers.Contract(communityAddress, communityABI, signer);

        let myAddress = await signer.getAddress()
        console.log("provider signer...", myAddress);

        const txn = await communityContract.withdrawMoney(myAddress, ethers.utils.parseEther(inputValue.withdraw));
        console.log("Withdrawing money...");
        await txn.wait();
        console.log("Money with drew...done", txn.hash);

        userBalanceHandler();

      } else {
        console.log("Ethereum object not found, install Metamask.");
        setError("Please install a MetaMask wallet to use our community.");
      }
      event.target.reset();
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getCommunityName();
    getcommunityAdminHandler();
    userBalanceHandler()
  }, [isWalletConnected])

  return (
    <main className="main-container">
      <h2 className="headline"><span className="headline-gradient">Make Our Community Development Project Better By Donating 
      This Project</span> 💰</h2>
      <section className="customer-section px-10 pt-5 pb-10">
        {error && <p className="text-2xl text-red-700">{error}</p>}
        <div className="mt-5">
          {currentCommunityName === "" && isCommunityAdmin ?
            <p>"Setup the name of your community." </p> :
            <p className="text-3xl font-bold">{currentCommunityName}</p>
          }
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
          </form>
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
          </form>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Customer Balance: </span>{userTotalBalance}</p>
        </div>
        <div className="mt-5">
          <p><span className="font-bold">Community Address: </span>{communityAdminAddress}</p>
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
            <div className="p-10">
              <form className="form-style">
                <input
                  type="text"
                  className="input-style"
                  onChange={handleInputChange}
                  name="communityName"
                  placeholder="Enter a Community Name for Your Community"
                  value={inputValue.communityName}
                />
                <button
                  className="btn-grey"
                  onClick={setCommunityNameHandler}>
                  Set Community Name
                </button>
              </form>
            </div>
          </section>
        )
      }
    </main>
  );
}
export default App;
