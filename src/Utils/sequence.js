import { isNaN } from "lodash";

// Drawing Sequence
function drawSequence(tData, mainData, from, aoi) {
  let previousX = -Infinity;
  let previousY = -Infinity;
  let currentLetterIndex = 0;

  const topMargin = aoi && aoi[0] && aoi[0].rootY ? aoi[0].rootY : 0;

  const canvas1 = document.getElementById(
    from === "modal" ? "heatmap-canvas-m" : `heatmap-canvas`
  );
  const ctx1 = canvas1 && canvas1.getContext("2d");
  // Clear the canvas
  ctx1 && ctx1.clearRect(0, 0, canvas1?.height * 3, canvas1?.width * 3);

  function getNextLetter() {
    currentLetterIndex = currentLetterIndex + 1;
    return currentLetterIndex;
  }

  const element = document.getElementById(
    from === "modal" ? `phone-m` : `phone`
  );
  const width = mainData?.width / element.offsetWidth;
  const height = mainData?.height / element.offsetHeight;

  const canvas = document.getElementById(
    from === "modal" ? `canvas-m` : `canvas`
  );
  const ctx = canvas && canvas.getContext("2d");
  // Clear the canvas
  ctx && ctx.clearRect(0, 0, canvas?.width, canvas?.height);

  // Draw dots and lines
  const circles = [];

  let iniIndex = 0;
  let radius = 25;
  //fixation count

  function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * 2 + (y2 - y1) * 2);
  }

  // Function to check if a point (x, y) is within the radius
  function isWithinRadius(x, y) {
    let distance = calculateDistance(
      tData[iniIndex]?.screenX,
      tData[iniIndex]?.screenY,
      x,
      y
    );
    if (!isNaN(distance)) return distance <= radius;
  }

  function runLoopFromIndex(index) {
    for (let i = index + 1; i < tData.length; i++) {
      const { screenX, screenY, time } = tData[i];
      if (isWithinRadius(screenX, screenY)) {
        const duration = time - tData[iniIndex]?.time;
        if (duration >= 100) {
          const letter = getNextLetter();
          // Draw dot
          circles.push({
            screenX: tData[iniIndex]?.screenX / width,
            screenY: (tData[iniIndex]?.screenY + topMargin) / height,
            letter,
          }); // Draw line
          if (currentLetterIndex > 0) {
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(previousX / width, (previousY + topMargin) / height);
            ctx.lineTo(
              tData[iniIndex]?.screenX / width,
              (tData[iniIndex]?.screenY + topMargin) / height
            );
            ctx.stroke();
          }
          previousX = tData[iniIndex]?.screenX;
          previousY = tData[iniIndex]?.screenY;
          iniIndex = i;
          runLoopFromIndex(i);
          break;
        }
      } else {
        iniIndex = i;
        runLoopFromIndex(i); // Call the function recursively with the updated index
        break; // Terminate the loop when condition is met
      }
    }
  }

  runLoopFromIndex(iniIndex); // Initial loop run

  circles.forEach(({ screenX, screenY, letter }) => {
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(screenX, screenY, canvas.width > 300 ? 15 : 6, 0, Math.PI * 2);
    ctx.strokeStyle = "#000000";
    ctx.stroke();
    ctx.fill();

    // Draw sequence number
    ctx.fillStyle = "#000";
    ctx.font = canvas.width > 300 ? "15px Arial" : "8px Arial";
    ctx.fillText(letter, screenX - 3, screenY + 5);
  });
}

export default drawSequence;
