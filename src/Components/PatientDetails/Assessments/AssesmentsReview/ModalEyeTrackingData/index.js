import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

import { isEmpty } from "lodash";
import { renderHeatmap, setHeatmapData } from "../../../../../Utils/heatmap";
import { startReplay } from "../../../../../Utils/replay";
import drawSequence from "../../../../../Utils/sequence";

// "undefined" means the URL will be computed from the `window.location` object
const URL = "https://eyetracking-api.oculabs.com";
export const socket = io(URL, {
  autoConnect: true,
});
export default function ModalEyeTrackingData(props) {
  const { type, tracking_data, deviceData, aoiXY, from, deviceBG } = props;
  const device_data = JSON.parse(deviceData);
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
    } else if (type === "sequence" && !isEmpty(device_data)) {
      showSequence();
    } else if (type === "replay" && !isEmpty(device_data)) {
      showReplay();
    }
  }, [type, device_data, Loader]);

  // Show Heatmap
  function showHeatMap() {
    setHeatmapData(tData, from);
  }

  // Show Replay
  function showReplay() {
    startReplay(tData, aoi, device_data, from);
  }

  // Show Sequence
  function showSequence() {
    !Loader && drawSequence(tData, device_data, from, aoi);
  }

  return (
    <div
      id={`phone-m`}
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
      <div id="replay-dot" className="replay-dot"></div>
      {!Loader && (
        <canvas
          id={`canvas-m`}
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
