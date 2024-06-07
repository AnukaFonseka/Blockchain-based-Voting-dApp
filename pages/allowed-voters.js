
import React, { useState, useEffect, useCallback, useContext, useReducer} from "react";
import Router, { useRouter } from "next/router";
import { useDropzone } from "react-dropzone";
import  Image  from 'next/image';

import { VotingContext } from "../context/Voter";
import Style from "../styles/allowedVoter.module.css";
import { upload, creator } from '../assets';
import Button from "../components/Button/Button";
import Input from "../components/Input/Input";

const allowedVoters = () => {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, setFormInput] = useState({
    name: "",
    address: "",
    position: ""
  });

  const router = useRouter();
  const { uploadToIPFS, createVoter, voterArray, getAllVoterData } = useContext(VotingContext);

  //-------Voters Image Drop
  const onDrop = useCallback(async (acceptedFile) => {
    const url = await uploadToIPFS(acceptedFile[0]);
    setFileUrl(url);
  });

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {'image/*': ['.jpeg', '.jpg', '.png']},
    maxSize: 5000000
  });

  useEffect(() => {
    getAllVoterData();
  }, [])

  return (
    <div className={Style.createVoter}>
      <div>
        {fileUrl && (
          <div className={Style.voterInfo}>
            <img src={fileUrl} alt="Voter Image" />
            <div className={Style.voterInfo_paragraph}>
              <p>
                Name: <span>&nbps; {formInput.name}</span>
              </p>
              <p>
                Add: <span>&nbps; {formInput.address.slice(0, 20)}</span>
              </p>
              <p>
                Pos: <span>&nbps; {formInput.position}</span>
              </p>
            </div>
          </div>
        )}

        {
          !fileUrl && (
            <div className={Style.sideInfo}>
              <div className={Style.sideInfo_box}>
                <h4> Create Candidate For Voting</h4>
                <p>
                  Blockchain Voting org, provide Ethereum eco system.
                </p>
                <p className={Style.sideInfo_para}>Contract Candidate List</p>
              </div>

              <div className={Style.card}>
                {voterArray.map((el, i) => (
                  <div key={i+1} className={Style.card_box}>
                    <div className={Style.image}>
                      <img src={el[4]} alt="profile photo"/>
                    </div>

                    <div className={Style.card_info}>
                      <p>{el[1]}</p>
                      <p>Address: {el[3].slice(0, 10)}...</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        }
      </div>

      <div className={Style.voter}>
        <div className={Style.voter_container}>
          <h1>Create New Voter</h1>
          <div className={Style.voter_container_box}>
            <div className={Style.voter_container_box_div}>
              <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className={Style.voter_container_box_div_info}>
                  <p>Upload File: JPG, PNG, GIF, WEBM Max 10MB</p>

                  <div className={Style.voter_container_box_div_image}>
                    <Image 
                      src={upload} 
                      alt='Icon' 
                      width={150} 
                      height={150} 
                      objectFit="contain"
                    />
                  </div>
                  <p>Drag & Drop Files</p>
                  <p>or Brows Media on your device</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={Style.input_container}>
          < Input
              inputType="text"
              title="Name"
              placeholder="Voter Name"
              handleClick={(e) => 
                setFormInput({...formInput, name: e.target.value})
              }
          />
          < Input
              inputType="text"
              title="Address"
              placeholder="Voter Address"
              handleClick={(e) => 
                setFormInput({...formInput, address: e.target.value})
              }
          />
          < Input
              inputType="text"
              title="Position"
              placeholder="Voter Position"
              handleClick={(e) => 
                setFormInput({...formInput, position: e.target.value})
              }
          />

          <div className={Style.Button}>
            <Button btnName="Authorized Voter" handleClick={() => createVoter(formInput, fileUrl)} />
          </div>
        </div>
      </div>

      {/* //////////////////////////////////// */}
      <div className={Style.createdVoter}>
        <div className={Style.createdVoter_info}>
          <Image src={creator} alt="user Profile" />
          <p>Notice For User</p>
          <p>
            Organizer <span>0x939939</span>
          </p>
          <p>Only Organizer of the Voting Contract can create voters for voting election</p>
          
        </div>
      </div>
    </div>
  );
};

export default allowedVoters;
