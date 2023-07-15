import gsap from "gsap";
import { useEffect } from "react";
import { styled } from "styled-components";
import z from "../assets/z.svg";
import o from "../assets/o.svg";
import oo from "../assets/oo.svg";
import ooo from "../assets/ooo.svg";
import m from "../assets/m.svg";
import { Link } from "react-router-dom";
const Home = () => {
  useEffect(() => {
    gsap.from(".z", { x: -100, opacity: 0, rotateZ: 100, duration: 2 });
    gsap.from(".o_1", {
      y: -200,
      opacity: 0,
      rotateX: 200,
      duration: 2,
      delay: 1,
    });
    gsap.from(".o_2", {
      y: 200,
      x: 100,
      opacity: 0,
      rotateX: 200,
      duration: 2,
      delay: 0,
    });
    gsap.from(".o_3", {
      y: -200,
      x: 100,
      opacity: 0,
      rotateX: 200,
      duration: 2,
      delay: 4,
    });
    gsap.from(".m", {
      x: 100,
      opacity: 0,
      rotateX: 200,
      duration: 2,
      delay: 1,
    });
  }, []);
  return (
    <Container>
      <Main>
        <Content>
          <img src={z} className="z" />
          <img src={o} className="o_1" />
          <img src={oo} className="o_2" />
          <img src={ooo} className="o_3" />
          <img src={m} className="m" />
        </Content>
        <Span>방문 해주셔서 감사합니다.</Span>
        <A to="/chat">화상채팅 해보기</A>
      </Main>
    </Container>
  );
};
export default Home;

const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  --tw-bg-opacity: 1;
  overflow: hidden;
  background-color: rgb(254 242 242 / var(--tw-bg-opacity));
`;

const Main = styled.main`
  width: 75%;
  height: 66.666667%;
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  padding-top: 2.75rem;
  @media screen and (max-width: 620px) {
    height: 50%;
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rem;
  img {
    width: 80px;
    height: 80px;
    @media screen and (max-width: 620px) {
      width: 60px;
      height: 60px;
    }
  }
`;

const Span = styled.span`
  --tw-text-opacity: 1;
  color: rgb(216 180 254 / var(--tw-text-opacity));
  text-align: center;
  font-size: 1.875rem /* 30px */;
  line-height: 2.25rem /* 36px */;
  @media screen and (max-width: 620px) {
    font-size: 1.4rem;
  }
`;

const A = styled(Link)`
  --tw-text-opacity: 1;
  color: rgb(216 180 254 / var(--tw-text-opacity));
  width: fit-content;
  margin: auto;
  text-align: center;
  font-size: 1.5rem /* 24px */;
  line-height: 2rem /* 32px */;
  margin-top: 4rem;
  transition: 0.3s ease-in-out;
  &:hover {
    --tw-text-opacity: 1;
    color: rgb(107 114 128 / var(--tw-text-opacity));
  }
  @media screen and (max-width: 620px) {
    font-size: 1.2rem;
  }
`;
