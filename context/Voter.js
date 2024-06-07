import React, { useState, useEffect, Children } from 'react';
import Web3Modal from "web3modal";
import { ethers } from "ethers";
// import { create as ipfsHttpClient } from "ipfs-http-client"
import axios from 'axios';
import { useRouter } from 'next/router';

import { VotingAddress, VotingAddressABI} from "./constants";

const fetchContract = (signerOrProvider) => new ethers.Contract(VotingAddress, VotingAddressABI, signerOrProvider);

export const VotingContext = React.createContext();

export const VotingProvider = ({ children}) => {
    const votingTitle = "Blablabla";
    const router = useRouter();
    const [currentAccount, setCurrentAccount] = useState('');
    const [candidateLength, setCandidateLength] = useState('');
    const pushCandidate = [];
    const candidateIndex = [];
    const [candidateArray, setCandidateArray] = useState(pushCandidate);

    //-------------End of Candidate Data

    const [error, setError] = useState('');
    const higestVote = [];

    //---------Voter Section
    const pushVoter = [];
    const [voterArray, setVoterArray] = useState(pushVoter);
    const [voterLength, setVoterLength] = useState(''); 
    const [voterAdderess, setVoterAddress] = useState([]);

    //--- Connecting Metamask

    const checkIfWalletIsConnected = async () => {
        if(!window.ethereum) return setError("Please Install Metamask");

        const account = await window.ethereum.request({method: "eth_accounts"});

        if(account.length) {
            setCurrentAccount(account[0]);
        } else {
            setError("Please Install Metamask & Connect, Reload");
        }
    }

    //------Connect Wallet
    const connectWallet = async () => {
        if(!window.ethereum) return setError("Please Install Metamask");

        const account = await window.ethereum.request({
            method: "eth_requestAccounts"
        });

        setCurrentAccount(account[0]);
    }

    //----Upload to IPFS Voter Image
    const uploadToIPFS = async (file) => {
        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        pinata_api_key: `8ea0236d21934383b6d9`,
                        pinata_secret_api_key: `c9382fc3c60095a0c52d44ba0b9af159e7ee499be46ca6bde27c2310944a2798`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                console.log(response);
                const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
                return ImgHash;
            } catch(error) {
                console.log("Unnable to upload image to Pinata");
            }
        }
    }

    //----Upload to IPFS Candidate Image
    const uploadToIPFSCandidate = async (file) => {
        if (file) {
            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await axios({
                    method: "post",
                    url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    data: formData,
                    headers: {
                        pinata_api_key: `8ea0236d21934383b6d9`,
                        pinata_secret_api_key: `c9382fc3c60095a0c52d44ba0b9af159e7ee499be46ca6bde27c2310944a2798`,
                        "Content-Type": "multipart/form-data",
                    },
                });
                console.log(response);
                const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
                return ImgHash;
            } catch(error) {
                console.log("Unnable to upload image to Pinata");
            }
        }
    }


    //Create Voter---------------------------------------------
    const createVoter = async (formInput, fileUrl) => {
        try {
            const { name, address, position } = formInput;
            console.log(name, address, position, fileUrl);

            if( !name || !address || !position )
                return console.log("Input data is missing");

            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const data = JSON.stringify({ name, address, position, image: fileUrl});

            const response = await axios({
                method: "POST",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: data,
                headers: {
                    pinata_api_key: `8ea0236d21934383b6d9`,
                    pinata_secret_api_key: `c9382fc3c60095a0c52d44ba0b9af159e7ee499be46ca6bde27c2310944a2798`,
                    "Content-Type": "application/json",
                },
            });

            const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

            const voter = await contract.voterRight(address, name, url, fileUrl);
            voter.wait();
            console.log(voter);

            router.push("/voterList")
        } catch (error) {
            console.log(error);
        }
    }

    // Get Voter Data --------------------------------->
    const getAllVoterData = async() => {
        try {
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            //voter list
            const voterListData = await contract.getVoterList();
            setVoterAddress(voterListData);

            voterListData.map(async (el) => {
                const singleVoterData = await contract.getVoterdata(el);
                pushVoter.push(singleVoterData);
            })

            const voterList = await contract.getVoterLength();
            setVoterLength(voterList.toNumber())
        } catch (error) {
            console.log(error);
        }
    };

    // useEffect(() => {
    //     getAllVoterData();

    // }, []);

    //Give Vote -------------------------------->
    const giveVote = async (id) => {
        try {
            const voterAdderess = id.address;
            const voterId = id.id;
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const votedList = await contract.vote(voterAdderess, voterId);
            console.log(votedList)
        } catch (error) {
            console.log(error);
        }
    }

    //Candidate Section------------------------------------------------------------->
    const setCandidate = async (candidateForm, fileUrl, router) => {
        try {
            const { name, address, age } = candidateForm;


            if( !name || !address || !age )
                return console.log("Input data is missing");

            console.log(name, address, age, fileUrl);

            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            const data = JSON.stringify({ name, address, image: fileUrl, age});

            const response = await axios({
                method: "POST",
                url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                data: data,
                headers: {
                    pinata_api_key: `8ea0236d21934383b6d9`,
                    pinata_secret_api_key: `c9382fc3c60095a0c52d44ba0b9af159e7ee499be46ca6bde27c2310944a2798`,
                    "Content-Type": "application/json",
                },
            });

            const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;

            const candidate = await contract.setCandidate(address, age, name, fileUrl, url);
            candidate.wait();
            
            console.log(candidate)
            // router.push("/")
        } catch (error) {
            console.log(error);
        }
    }

    //Get Candidate Data -------------------------------------->
    const getNewCandidate = async  () => {
        try {
            const web3modal = new Web3Modal();
            const connection = await web3modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = fetchContract(signer);

            //All Candidate-----
            const allCandidate = await contract.getCandidate();

            allCandidate.map(async (el) => {
                const singleCandidateData = await contract.getCandidatedata(el);

                pushCandidate.push(singleCandidateData);
                candidateIndex.push(singleCandidateData[2].toNumber());
            });

            

            //Candidatet Length
            const allCandidateLength = await contract.candidateLength();
            setCandidateLength(allCandidateLength.toNumber());

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getNewCandidate();
        console.log(voterArray)
    }, []);


    return (
        <VotingContext.Provider 
          value={{
             votingTitle,
             checkIfWalletIsConnected,
             connectWallet, 
             uploadToIPFS,
             createVoter,
             getAllVoterData,
             giveVote,
             setCandidate,
             getNewCandidate,
             error,
             voterArray,
             voterLength,
             voterAdderess,
             currentAccount,
             candidateLength,
             candidateArray,
             uploadToIPFSCandidate
             }}
        >
            {children}
        </VotingContext.Provider>
    );
};





