import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import drawSequence from "../../../../Utils/sequence";
import { renderHeatmap, setHeatmapData } from "../../../../Utils/heatmap";
import { isEmpty, isUndefined } from "lodash";
import { startReplay, stopReplay, pauseReplay } from "../../../../Utils/replay";
import authAuthentication from "../../../../Redux/reducers/auth/actions";
import {
  PauseCircleFilledOutlined,
  PlayCircleOutlined,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "https://eyetracking-api.oculabs.com";
export const socket = io(URL, {
  autoConnect: true,
});
export default function EyetrackingData(props) {
  const {
    type,
    tracking_data,
    deviceData,
    aoiXY,
    deviceBG,
    from,
    open,
    isHovered,
  } = props;
  const device_data = JSON.parse(deviceData);
  const dispatch = useDispatch();
  const { playButton } = useSelector((state) => state.auth);
  const { setPlayButton } = authAuthentication;
  const [deviceSize, setDeviceSize] = useState({ height: "100%", width: 300 });
  const [aoi, setAOI] = useState([
    {
      index: 0,
      x: { rootStart: 40, rootEnd: 388, start: 40, end: 388, width: 348 },
      y: {
        rootStart: 170,
        rootEnd: 405.6666564941406,
        start: 272,
        end: 507.6666564941406,
        height: 235.66665649414062,
      },
      screen: { scale: 3, width: 428, height: 926, fontScale: 0.823 },
      rootY: 102,
    },
  ]);
  const [tData, setTData] = useState([]);
  const [Loader, setLoader] = useState(true);
  useEffect(() => {
    setDeviceSize({ height: device_data.height, width: device_data.width });
    setAOI(aoiXY);
    setTData(tracking_data);
  }, [tracking_data]);

  useEffect(() => {
    device_data && renderHeatmap(device_data, from);
  }, [device_data]);

  useEffect(() => {
    if (type === "heat" && !isEmpty(device_data)) {
      showHeatMap();
      stopReplay();
    } else if (type === "sequence" && !isEmpty(device_data)) {
      showSequence();
      stopReplay();
    } else if (type === "replay" && !isEmpty(device_data)) {
      if (!isUndefined(open) || open === false) {
        console.log("comes to this Pationentntnntn");
        const heatCanvas = document.getElementById(
          from === "modal" ? `heatmap-canvas-m` : `heatmap-canvas`
        );
        const canvas = document.getElementById(
          from === "modal" ? `canvas-m` : `canvas`
        );
        const ctx = heatCanvas && heatCanvas.getContext("2d");
        const canvas1 = canvas && canvas.getContext("2d");
        // Clear the canvas
        ctx && ctx.clearRect(0, 0, canvas?.height * 2, canvas?.width * 2);
        canvas1 &&
          canvas1.clearRect(0, 0, canvas?.height * 2, canvas?.width * 2);
      }
      stopReplay();
    }
  }, [type, device_data, Loader]);

  // Show Heatmap
  function showHeatMap() {
    setHeatmapData(tData, from);
  }

  // Show Replay
  function showReplay() {
    dispatch(setPlayButton(false));
    startReplay(tData, aoi, device_data, from);
  }

  // Show Sequence
  function showSequence() {
    !Loader && drawSequence(tData, device_data, from, aoi);
  }

  return (
    <div
      id={from === "modal" ? "phone-m" : `phone`}
      style={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {deviceBG && (
        <img
          src={deviceBG}
          alt="img"
          style={{
            objectFit: "contain",
            height: "100%",
          }}
          onLoad={() => {
            setLoader(false);
          }}
        />
      )}
      {type === "replay" && (
        <div
          className="playIcon"
          style={{
            position: "absolute",
            color: "#3778c2",
            fontSize: "30px",
            left: 0,
            textAlign: "center",
            right: 0,
            zIndex: 1,
            top: "50%",
            cursor: "pointer",
          }}
          onClick={() => {
            if (playButton) {
              dispatch(setPlayButton(false));
              showReplay();
            } else {
              dispatch(setPlayButton(true));
              pauseReplay();
            }
          }}
        >
          {open || isHovered ? (
            !playButton ? (
              <PauseCircleFilledOutlined fontSize="10px" />
            ) : (
              <PlayCircleOutlined fontSize="10px" />
            )
          ) : null}
          <div
            id={from === "modal" ? "replay-dot-modal" : "replay-dot"}
            className="replay-dot"
          ></div>
        </div>
      )}
      {!Loader && (
        <canvas
          id={from === "modal" ? "canvas-m" : `canvas`}
          height={deviceSize?.height}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
          }}
        />
      )}
    </div>
  );
}
