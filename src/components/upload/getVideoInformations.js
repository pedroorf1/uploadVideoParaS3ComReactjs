export const getVideoInformations = async (file) => {
  const fileCallbackToPromise = (fileObj) => {
    return Promise.race([
      new Promise((resolve) => {
        if (fileObj instanceof HTMLImageElement) fileObj.onload = resolve;
        else fileObj.onloadedmetadata = resolve;
      }),
      new Promise((_, reject) => {
        setTimeout(reject, 1000);
      }),
    ]);
  };

  const originalName = file.name
    .split(".")
    .slice(0, -2)
    .join(".");

  const objectUrl = URL.createObjectURL(file);
  // const isVideo = type.startsWith('video/');
  const video = document.createElement("video");
  video.src = objectUrl;
  await fileCallbackToPromise(video);
  return {
    duration: video.duration,
    width: video.videoWidth,
    height: video.videoHeight,
    originalName,
    type: file.type,
    size: file.size,
  };
}