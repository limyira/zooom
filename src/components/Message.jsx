import styled from "styled-components";
import gsap from "gsap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import plane_img from "../assets/paper-plane.png";
import { useState } from "react";
import axios from "axios";
const Message = ({ open, setOpen, setIsSending }) => {
  const tl = gsap.timeline();
  const [text, setText] = useState("");
  const validation = (e) => {
    if (e.length < 4) {
      alert("4 글자 이상은 입력 부탁드립니다.");
      return false;
    }
    return true;
  };
  const sendMessage = async (e) => {
    if (validation(text)) {
      setIsSending(true);
      tl.to(".wrapper", {
        y: "-140%",
        duration: 0.3,
        ease: "bounce.out",
      });
      tl.to(".wrapper", {
        delay: 1,
        rotateY: 360 * 122,
        duration: 2,
        ease: "bounce.out",
        opacity: 0,
      });
      tl.to(".plane", {
        rotateY: 360 * 122,
        duration: 2,
        ease: "bounce.out",
        opacity: 1,
      });

      await tl.to(".plane", {
        x: 1200,
        y: -200,
        duration: 1,
      });

      setOpen(false);

      tl.set(".wrapper", {
        y: 0,
        rotateY: 0,
        visibility: "visible",
      });
      tl.to(".plane", { x: 0, y: 0, rotateY: 0, duration: 0.3, opacity: 0 });
      await tl.set(".wrapper", { opacity: 1, delay: 1 });
      const res = await axios.post("https://yira.site/api/message", { text });
      if (res.status === 500) alert("메시지 전송 실패");
      setText("");
      setIsSending(false);
    } else return;
  };
  return (
    <>
      <FormWrapper className="wrapper" open={open}>
        <XBtnWrapper>
          <XBtn
            onClick={() => {
              setOpen(false);
              setText("");
            }}
          >
            <span>X</span>
          </XBtn>
        </XBtnWrapper>
        <Dear>
          <span>to yira</span>
        </Dear>
        <Content>
          <textarea onChange={(e) => setText(e.target.value)} value={text} />
          <SendBtn onClick={sendMessage}>
            <FontAwesomeIcon icon={faArrowUp} />
          </SendBtn>
        </Content>
      </FormWrapper>
      <Img className="plane" open={open} src={plane_img} />
    </>
  );
};

export default Message;

const FormWrapper = styled.div`
  width: 340px;
  height: 240px;
  background-color: #f0f0f0;
  position: absolute;
  bottom: ${(props) => (props.open ? "0" : "-240px")};
  right: 10%;
  border-radius: 8px;
  z-index: 9999;
  transition: 1s ease-in-out;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
  padding: 5px 10px;
  padding-left: 24px;
`;

const XBtnWrapper = styled.div`
  display: flex;
  justify-content: end;
  margin-bottom: 15px;
`;
const XBtn = styled.button`
  background-color: #fb635e;
  width: 17px;
  height: 17px;
  border-radius: 10px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;

  span {
    visibility: hidden;
  }

  &:hover span {
    visibility: visible;
  }
`;

const Dear = styled.div`
  background-color: white;
  width: 80%;
  height: 30px;
  border-radius: 10px;
  border: 1px #e1e3e3 solid;
  display: flex;
  align-items: center;
  padding: 0px 10px;
  margin-bottom: 10%;
  span {
    color: #9faab3;
  }
`;

const Content = styled.div`
  display: flex;
  height: 50%;
  width: 90%;
  align-items: end;
  position: relative;
  textarea {
    resize: none;
    border-radius: 10px;
    border: 1px #e1e3e3 solid;
    width: 100%;
    height: 100%;
    padding: 10px 10px;
    outline: none;
  }
`;

const SendBtn = styled.button`
  position: absolute;
  bottom: 5%;
  right: 1.8%;
  z-index: 33;
  width: fit-content;
  height: fit-content;
  padding: 4px 8px;
  background-color: #097afd;
  border: none;
  border-radius: 50%;
  color: white;
`;

const Img = styled.img`
  width: 340px;
  height: 240px;
  position: absolute;
  bottom: ${(props) => (props.open ? "40%" : "-100%")};
  right: 10%;
  z-index: 9999;
  opacity: 0;
`;
