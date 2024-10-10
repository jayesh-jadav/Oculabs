import React from "react";
import Lottie from "react-lottie";
import heartLoader from "../../../Assets/Lottie/heartLoader.json";

export default function MainLoader() {
  return (
    <div>
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: heartLoader,
        }}
        height={window.innerWidth >= 500 ? 250 : 200}
        width={window.innerWidth >= 500 ? 250 : 200}
      />
    </div>
  );
}
