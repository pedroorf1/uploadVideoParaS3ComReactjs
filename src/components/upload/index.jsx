import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
// import { compressAndConvertToHLS as compress } from "../compress/compress";

import { uploadFileToS3 } from "./UploadFileToS3";

function Upload() {
  const [fileSelected, setFileSelected] = useState({ type: "", name: "" });
  const [fileUrl, setFileUrl] = useState(null);
  const fileInput = React.useRef();
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);
  const messageRef = useRef(null);

  const load = async () => {
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on("log", ({ message }) => {
      messageRef.current.innerHTML = message;
      console.log(message);
    });
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
      workerURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.worker.js`,
        "text/javascript"
      ),
    });
    setLoaded(true);
  };

  useEffect(() => {
    load();
    const file = videoRef.current?.files[0];
    if (file) {
      const src = URL.createObjectURL(file);
      setFileUrl(videoRef.current?.files[0]);
      console.log("\nfileSelected", src);
    }
  }, [loaded]);

  function onChangeFile(event) {
    setFileSelected(event.target.files[0]);
  }

  const handleClick = async event => {
    event.preventDefault();
    // let newArr = fileInput.current.files;
    // handleUpload(fileSelected);
    // for (let i = 0; i < newArr.length; i++) {
    // }

    // const response = await compress(fileSelected);
    // console.log(response);
  };

  const handleUpload = fileSelected => {
    try {
      uploadFileToS3(fileSelected);
    } catch (err) {
      console.log(err);
    }
  };

  const transcode = async () => {
    // const videoURL =
    //   "https://raw.githubusercontent.com/ffmpegwasm/testdata/master/video-15s.avi";
    const hashnamefile = uuidv4();
    const outputFilePath = "../../tempvideo" + hashnamefile + ".mp4";
    console.log("\noutputFilePath", outputFilePath);
    const videoURL = fileUrl;
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile("input.avi", await fetchFile(videoURL));
    await ffmpeg.exec([
      "-i",
      "input.avi",
      "-c:v",
      "libx264",
      "-b:v",
      "500k",
      "-c:a",
      "aac",
      "-b:a",
      "64k",
      "-hls_time",
      "2",
      "-hls_list_size",
      "0",
      "-f",
      "hls",
      "output.mp4",
    ]);
    const fileData = await ffmpeg.readFile("output.mp4");
    const data = new Uint8Array(fileData);
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(
        new Blob([data.buffer], { type: "video/mp4" })
      );
    }

    // const blob = new Blob([data.buffer], { type: "video/mp4" });
    // const url = toBlobURL(blob);

    console.log("Video saved to: " + fileData);
  };

  if (!loaded) {
    return <p>Carragando...</p>;
  }

  return (
    <>
      <form className="upload-steps" onSubmit={handleClick}>
        <label>
          Upload file:
          <input
            type="file"
            multiple
            // ref={fileInput}
            ref={videoRef}
            onChange={onChangeFile}
          />
        </label>
        <br />
        <button type="submit">Upload</button>
        <br />
        <button onClick={transcode}>
          Split video to segments of 180 sec. and plays 2nd segment
        </button>
        <br />
        <p ref={messageRef}></p>
      </form>
    </>
  );
}
export default Upload;
