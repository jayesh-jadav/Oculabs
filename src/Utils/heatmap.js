import h337 from "heatmap.js";

var heatmapInstance = null;
var heatmapInstanceM = null;

export const renderHeatmap = (mainData, from) => {
  const heatmapCanvas1 = document.getElementById(
    from === "modal" ? `heatmap-canvas-m` : `heatmap-canvas`
  );
  const canvas = document.getElementById(
    from === "modal" ? "phone-m" : "phone"
  );
  const height = (canvas?.offsetHeight / mainData?.height).toFixed(2);

  // Check if the element exists
  if (heatmapCanvas1) {
    // console.log('An element with the ID "heatmap-canvas" exists.');
  } else {
    var config = {
      container: document.getElementById(
        from === "modal" ? "phone-m" : "phone"
      ),
      width: mainData?.width,
      height: mainData?.height,
    };
    if (mainData) {
      if (from === "modal") {
        heatmapInstanceM = h337.create(config);
      } else {
        heatmapInstance = h337.create(config);
      }
      const heatmapCanvas = config.container.querySelector(".heatmap-canvas");
      heatmapCanvas.id =
        from === "modal" ? `heatmap-canvas-m` : `heatmap-canvas`;
      heatmapCanvas.style.transform = `scale(${height})`;
      heatmapCanvas.style.transformOrigin = "0 0";
      heatmapCanvas.style.top = `${height * 100}px`;
    }
  }
};

export const setHeatmapData = (data, from) => {
  const canvas = document.getElementById(`canvas`);
  const ctx = canvas && canvas.getContext("2d");
  // Clear the canvas
  ctx && ctx.clearRect(0, 0, canvas?.height * 2, canvas?.width * 2);

  const heatmapData =
    data &&
    data.map(({ screenX, screenY }) => ({
      x: Math.round(screenX), // Adjust based on original canvas width
      y: Math.round(screenY),
      value: 1,
    }));

  // console.log(heatmapData);
  if (from === "modal") {
    data && heatmapInstanceM.setData({ max: 10, min: 0, data: heatmapData });
  } else {
    data && heatmapInstance.setData({ max: 10, min: 0, data: heatmapData });
  }
};
