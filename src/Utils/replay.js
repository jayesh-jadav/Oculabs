import authAuthentication from "../Redux/reducers/auth/actions";
import { store } from "../Redux/store/configureStore";

let replayStartAt = null;
let replayStartAtMS = null;
let originalReplayTime = null;
let isReplayRunning = false; // Flag to control the replay
let replayDot = null;
let timeoutID = null;

function moveReplayDot(position, aoi, mainData, from) {
  const element = document.getElementById(
    from === "modal" ? "phone-m" : `phone`
  );
  const dotID = from === "modal" ? "replay-dot-modal" : "replay-dot";
  const canvas1 = document.getElementById(`heatmap-canvas`);
  const ctx1 = canvas1 && canvas1.getContext("2d");
  // Clear the heat map canvas
  ctx1 && ctx1.clearRect(0, 0, canvas1?.height * 3, canvas1?.width * 3);
  const canvas = document.getElementById(`canvas`);
  const ctx = canvas && canvas.getContext("2d");
  // Clear the sequence canvas
  ctx && ctx.clearRect(0, 0, canvas?.height * 3, canvas?.width * 3);
  const width = mainData?.width / element.offsetWidth;
  const height = mainData?.height / element.offsetHeight;

  const { screenX, screenY } = position;
  const topMargin = aoi && aoi[0] && aoi[0].rootY ? aoi[0].rootY : 0;
  // console.log('topMargin: ', topMargin, aoi)
  replayDot = document.getElementById(dotID);
  if (replayDot) {
    replayDot.style.left = `${
      from === "modal" ? (screenX / width) * 0.45 : (screenX / width) * 0.7
    }%`;
    replayDot.style.top = `${
      from === "modal" ? (screenY / height) * -0.7 : (screenY / height) * -0.8
    }%`;
  } else {
    console.error(`Replay dot element not found: ${dotID}`);
  }
}

function startReplay(tData, aoi, mainData, from) {
  store.dispatch(authAuthentication.setPlayButton(false));
  if (!tData || tData.length == 0) {
    // toast("Replay Data doesn't exists.");
    return false;
  }
  if (!replayDot) {
    replayDot = document.getElementById("replay-dot");
  }

  // toast.success("Replay Started");
  let currentIndex = 0;
  isReplayRunning = true;

  originalReplayTime = tData[tData.length - 1].time - tData[0].time;

  replayStartAtMS = new Date().getTime();
  replayStartAt = new Date().toLocaleString("en-GB", {
    timeZone: "asia/calcutta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
  function replay() {
    // if (!isReplayRunning || currentIndex >= tData.length) {
    //   store.dispatch(authAuthentication.setPlayButton(true));
    //   console.log("Done");
    //   return; // Reached the end of the gaze positions
    // }

    const position = tData[currentIndex];
    moveReplayDot(position, aoi, mainData, from);

    currentIndex++;

    // Adjust the replay speed by changing the timeout duration
    if (tData[currentIndex]) {
      const d = tData[currentIndex].time - position.time;
      timeoutID = setTimeout(() => {
        replay();
      }, d);
      // timeoutID = setTimeout(replay, tData[currentIndex].time - position.time); // Move to the next position after 200ms
    } else {
      // toast.success("Replay Completed");
      store.dispatch(authAuthentication.setPlayButton(true));
      stopReplay();
      console.log(
        "Done with Timeout",
        replayStartAt,
        new Date().toLocaleString("en-GB", {
          timeZone: "asia/calcutta",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          fractionalSecondDigits: 3,
        }),
        "Time Taken: ",
        new Date().getTime() - replayStartAtMS,
        "Original Time: ",
        originalReplayTime
      );
    }
  }

  replay();
}

function stopReplay() {
  isReplayRunning = false; // Stop the replay
  return;
  // console.log("Replay stopped manually");
}

function pauseReplay() {
  console.log("Pause manually");
  isReplayRunning = false; // Stop the replay
  if (timeoutID) {
    clearTimeout(timeoutID); // Clear the timeout to pause the replay
    timeoutID = null; // Reset timeoutID
  }
  return;
}

export { startReplay, stopReplay, pauseReplay };
