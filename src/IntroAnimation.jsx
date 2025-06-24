// components/IntroAnimation.jsx
import Lottie from "lottie-react";
import introAnimation from "../src/assets/playtesting_loader.json";

const IntroAnimation = () => {
  return (
    <div className="" style={{ marginTop: '-100px' }}>
      <Lottie
        animationData={introAnimation}
        loop={false}
        autoplay
        style={{ width: '100vw', height: '80vh' }}
      />
    </div>
  );
};

export default IntroAnimation;