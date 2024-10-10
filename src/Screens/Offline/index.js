import React from "react";
import Lottie from "react-lottie";
import "./styles.css";
import offline from "../../Assets/Lottie/offline.json";

function Offline() {
  return (
    <div className="offlinemaindiv">
      <div className="offlinerootdiv">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: offline,
          }}
          height={window.innerWidth >= 500 ? 300 : 250}
          width={window.innerWidth >= 500 ? 300 : 250}
        />

        <div className="offlinetextmain">
          <span
            className="offlinetextroot"
            style={{
              fontSize: window.innerWidth >= 500 ? "25px" : "20px",
            }}
          >
            You're Offline Mode
          </span>
          <span
            className="offlinebottmetitle"
            style={{
              fontSize: window.innerWidth >= 500 ? "15px" : "14px",
            }}
          >
            Your app is on offline mode.
          </span>
          <span
            className="offlinebottmetitle"
            style={{
              fontSize: window.innerWidth >= 500 ? "15px" : "14px",
            }}
          >
            Try to check your internet connection or wi-fi settings
          </span>
        </div>

        <div className="offlinebtnmain">
          <span
            className="offlinebtninner"
            onClick={() => window.location.reload(false)}
          >
            Refresh
          </span>
        </div>
      </div>
    </div>
  );
}

export default Offline;
