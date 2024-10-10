import React from "react";
import Lottie from "react-lottie";
import btnLoad from "../../../Assets/Lottie/btnLoad.json";

export default function MainLoader() {
  return (
    <div
      style={{
        position: "absolute",
        marginTop: 5,
      }}
    >
      <Lottie
        options={{
          loop: true,
          autoplay: true,
          animationData: btnLoad,
        }}
        height={window.innerWidth >= 500 ? 45 : 25}
        width={window.innerWidth >= 500 ? 200 : 150}
      />
    </div>
  );
}
