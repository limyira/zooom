import { useEffect, useRef, useState } from "react";
import { io, Manager } from "socket.io-client";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVideo,
  faMicrophone,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";

import user_img from "../assets/user.svg";
import Message from "../components/Message";

const maxWidth = "620px";
const Chat = () => {
  const socketRef = useRef();
  const pcRef = useRef();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [states, setStates] = useState({
    mic: false,
    video: false,
  });
  const streamRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const setVideoTracks = async () => {
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (localVideoRef.current)
        localVideoRef.current.srcObject = streamRef.current;
      if (!(pcRef.current && socketRef.current)) return;
      streamRef.current.getTracks().forEach((track) => {
        if (!pcRef.current) return;
        pcRef.current.addTrack(track, streamRef.current);
        setStates((prev) => {
          return {
            video: true,
            mic: true,
          };
        });
      });
      pcRef.current.onicecandidate = (e) => {
        if (e.candidate) {
          if (!socketRef.current) return;
          socketRef.current.emit("candidate", e.candidate);
        }
      };
      pcRef.current.ontrack = (ev) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = ev.streams[0];
        }
      };
      socketRef.current.emit("join_room", {
        room: "1234",
      });
    } catch (e) {
      console.error(e);
    }
  };

  const createOffer = async () => {
    console.log("create offer", pcRef.current);
    if (!(pcRef.current && socketRef.current)) return;
    try {
      const offerOptions = {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      };

      const sdp = await pcRef.current.createOffer(offerOptions);
      await pcRef.current.setLocalDescription(sdp);

      socketRef.current.emit("offer", sdp);
    } catch (e) {
      console.error(e);
    }
  };
  const createAnswer = async (sdp) => {
    if (!(pcRef.current && socketRef.current)) return;
    try {
      await pcRef.current.setRemoteDescription(sdp);
      const mySdp = await pcRef.current.createAnswer({
        offerToReceiveVideo: true,
        offerToReceiveAudio: true,
      });
      await pcRef.current.setLocalDescription(mySdp);
      socketRef.current.emit("answer", mySdp);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    socketRef.current = io("https://yira.site");

    pcRef.current = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun4.l.google.com:19302",
        },
      ],
    });

    socketRef.current.on("all_users", (allUsers) => {
      if (allUsers.length > 0) {
        createOffer();
      }
    });

    socketRef.current.on("getOffer", (sdp) => {
      createAnswer(sdp);
    });

    socketRef.current.on("getAnswer", (sdp) => {
      if (!pcRef.current) return;
      pcRef.current.setRemoteDescription(sdp);
    });

    socketRef.current.on("getCandidate", async (candidate) => {
      if (!pcRef.current) return;
      await pcRef.current.addIceCandidate(candidate);
      console.log("candidate add success");
    });
    socketRef.current.on("return_video_state", (state) => {
      console.log(state);
    });

    setVideoTracks();
    socketRef.current.on("user_exit", (id) => {});
    const senders = pcRef.current.getSenders();
    console.log(senders);
    return () => {
      socketRef.current.disconnect();
      pcRef.current.close();
    };
  }, []);

  const handleCamera = async () => {
    streamRef.current
      .getVideoTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    socketRef.current.emit("video_state", states.video);

    setStates((prev) => {
      return {
        ...prev,
        video: !prev.video,
      };
    });
  };
  const handleMic = async () => {
    streamRef.current
      .getAudioTracks()
      .forEach((track) => (track.enabled = !track.enabled));
    setStates((prev) => {
      return {
        ...prev,
        mic: !prev.mic,
      };
    });
  };
  const handleMessage = () => {
    if (isSending) return;
    setOpen((prev) => !prev);
  };

  return (
    <Container>
      <Main className="main">
        <VideoWrapper>
          <Video autoPlay webkit-playsinline playsInline ref={localVideoRef} />
          <DisConnectImg src={user_img} />
        </VideoWrapper>
        <VideoWrapper>
          <Video autoPlay webkit-playsinline playsInline ref={remoteVideoRef} />
          <DisConnectImg src={user_img} />
        </VideoWrapper>
      </Main>
      <Nav>
        <CameraBtn videostate={states.video.toString()} onClick={handleCamera}>
          <FontAwesomeIcon icon={faVideo} />
        </CameraBtn>
        <MicBtn micstate={states.mic.toString()} onClick={handleMic}>
          <FontAwesomeIcon icon={faMicrophone} />
        </MicBtn>
        <MessageBtn open={open} onClick={handleMessage}>
          <FontAwesomeIcon
            style={{ color: open ? "#3d4043" : "white" }}
            icon={faMessage}
          />
        </MessageBtn>
      </Nav>
      <Message setIsSending={setIsSending} open={open} setOpen={setOpen} />
    </Container>
  );
};

export default Chat;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  background-color: #202124;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  @media screen and (max-width: ${maxWidth}) {
    align-items: flex-start;
  }
`;

const Main = styled.main`
  display: flex;
  width: 90%;
  height: 80%;
  justify-content: space-between;
  align-items: center;
  padding: 0px 80px;
  @media screen and (max-width: ${maxWidth}) {
    margin-top: 40px;
    flex-direction: column;
    width: 100%;
    align-items: center;
    justify-content: center;
    padding: 0px;
  }
`;

const Video = styled.video`
  height: 400px;
  z-index: 88;
  border-radius: 15px;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  @media screen and (max-width: ${maxWidth}) {
    height: 200px;
  }
`;

const Nav = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  > div {
    width: 40px;
    height: 40px;
    border-radius: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 4;
    color: white;
    margin-right: 15px;
    cursor: pointer;
    transition: 0.3s ease-in-out;
  }
`;

const MicBtn = styled.div`
  background-color: ${(props) => (props.micstate === "true" ? "red" : "green")};
`;
const MessageBtn = styled.div`
  background-color: ${(props) => (props.open ? "white" : "#3d4043")};
`;

const CameraBtn = styled.div`
  background-color: ${(props) =>
    props.videostate === "true" ? "red" : "green"};
`;
const VideoWrapper = styled.div`
  border-radius: 15px;
  position: relative;
  z-index: 3;
  background-color: #3d4043;
  height: 400px;
  width: 530px;
  display: flex;
  align-items: center;
  overflow: hidden;
  justify-content: center;
  aspect-ratio: 16 / 9;
  @media screen and (max-width: ${maxWidth}) {
    height: fit-content;
    margin-bottom: 40px;
    width: fit-content;
  }
`;

const DisConnectImg = styled.img`
  width: 100%;
  height: 100%;
  position: absolute;
`;
