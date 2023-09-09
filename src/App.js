import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import AirdropContractABI from './AirdropContract.json';

const AirdropApp = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [registrationFee, setRegistrationFee] = useState('0.5');
  const [isRegistered, setIsRegistered] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false); // Track MetaMask connection status

  useEffect(() => {
    const initEthers = async () => {
      if (window.ethereum) {
        const ethereum = window.ethereum;
        const provider = new ethers.providers.Web3Provider(ethereum);
        setProvider(provider);

        try {
          await ethereum.enable();
          const accounts = await provider.listAccounts();
          setAccounts(accounts);

          const contractAddress = '0xc85e2BF4B2Cf4eb8E997Ff350c6d0ccF217Ba2df';
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            contractAddress,
            AirdropContractABI,
            signer
          );
          setSigner(signer);
          setContract(contract);

          const isUserRegistered = await contract.isRegistered(accounts[0]);
          setIsRegistered(isUserRegistered);

          // Listen for new blocks using WebSocket (wss)
          const web3Provider = new ethers.providers.WebSocketProvider('wss://testnet-msc.mindchain.info/ws	');
          web3Provider.on('block', (blockNumber) => {
            fetchRegisteredUsers();
          });

          setIsConnected(true); // MetaMask is connected
        } catch (error) {
          console.error(error);
        }
      } else {
        console.error('MetaMask not detected');
      }
    };

    initEthers();
  }, []);

  const fetchRegisteredUsers = async () => {
    if (contract) {
      const users = await contract.getAllParticipants();
      setRegisteredUsers(users);
    }
  };

  useEffect(() => {
    fetchRegisteredUsers();
  }, [contract]);

  const handleConnectDisconnect = async () => {
    if (isConnected) {
      // Disconnect from MetaMask
      await provider.send('eth_requestAccounts', []);
      setIsConnected(false);
    } else {
      // Connect to MetaMask
      try {
        await provider.send('eth_requestAccounts', []);
        setIsConnected(true);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleRegister = async () => {
    try {
      const registrationFeeWei = ethers.utils.parseEther(registrationFee);
      const tx = await contract.register({ value: registrationFeeWei });
      await tx.wait();
      setIsRegistered(true);
      fetchRegisteredUsers();
    } catch (error) {
      if (error.code === 4001) {
        console.error('Transaction rejected by the user.');
      } else if (error.code === -32603 && error.data && error.data.message === 'insufficient funds for execution') {
        console.error('Insufficient funds for the transaction. Please make sure you have enough MIND in your MetaMask wallet.');
      } else {
        console.error('An error occurred while processing the transaction:', error);
      }
    }
  };

  return (
    <div>
      <h1>Airdrop Registration App</h1>
      <button onClick={handleConnectDisconnect}>
        {isConnected ? 'Disconnect from MetaMask' : 'Connect to MetaMask'}
      </button>

      {accounts.length === 0 ? (
        <p>Connect your MetaMask account</p>
      ) : isConnected ? (
        <>
          {isRegistered ? (
            <p>You are already registered for the airdrop.</p>
          ) : (
            <div>
              <p>Registration fee: {registrationFee}MIND </p>
              <button onClick={handleRegister}>Register for Airdrop</button>
            </div>
          )}
          <h2>Registered Users:</h2>
          <ul>
            {registeredUsers.map((user, index) => (
              <li key={index}>{user}</li>
            ))}
          </ul>
        </>
      ) : (
        <p>Connect your MetaMask account to interact with the app.</p>
      )}
    </div>
  );
};

export default AirdropApp;
