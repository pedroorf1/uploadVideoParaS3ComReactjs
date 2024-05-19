import React, { useRef, useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import { uploadFileToS3 } from "./UploadFileToS3";
import { getVideoInformations } from "./getVideoInformations";

function Upload() {
  const [fileBuffer, setFileBuffer] = useState(null);
  const [fileDownloadUrl, setFileDownloadUrl] = useState(null);
  const [fileInformations, setFileInformations] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef(null);
  const messageRef = useRef(null);
  console.log("\nAqui6");

  const load = useCallback(async () => {
    try {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      console.log("\nLoadFFmpeg: 1");
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on("log", ({ message }) => {
        console.log(message);
      });

      ffmpeg.on("progress", data => {
        console.log(`Progress: ${data.time}`);
        messageRef.current.innerText = `${
          JSON.stringify(data).split(",")[0]
        }\n ${!!fileInformations && fileInformations.duration}`;
      });
      // console.log("\nLoadFFmpeg: 2");
      // await ffmpeg.load({
      //   coreURL: await toBlobURL(
      //     `${baseURL}/ffmpeg-core.js`,
      //     "text/javascript"
      //   ),
      //   wasmURL: await toBlobURL(
      //     `${baseURL}/ffmpeg-core.wasm`,
      //     "application/wasm"
      //   ),
      // });

      const response = await fetch(`${baseURL}/ffmpeg-core.js`);
      const script = await response.text();
      const blob = new Blob([script], { type: "text/javascript" });
      const scriptURL = URL.createObjectURL(blob);
      // const scriptTag = document.createElement("script");
      // scriptTag.src = scriptURL;
      // document.body.appendChild(scriptTag);

      const responseWasm = await fetch(`${baseURL}/ffmpeg-core.wasm`);
      const wasm = await responseWasm.arrayBuffer();
      const wasmBlob = new Blob([wasm], { type: "application/wasm" });
      const wasmURL = URL.createObjectURL(wasmBlob);

      await ffmpeg.load({ coreURL: scriptURL, wasmURL });
      setLoaded(true);

      console.log("\nLoadFFmpeg: 3");
    } catch (err) {
      console.error("\nErro ao carregar ffmpeg: ", err);
      setLoaded(false);
    }
  }, []);
  console.log("\nAqui5");
  if (!loaded) {
    (async () => {
      await load();
    })();
  }
  useEffect(() => {
    const file = videoRef.current?.files[0];
    if (file) {
      const src = URL.createObjectURL(file);
      console.log("\nfileSelected", src);
    }
  }, []);
  console.log("\nAqui4", loaded);
  const onChangeFile = async event => {
    const file = event.target.files[0];
    const fileBuffer = await file.arrayBuffer();
    setFileBuffer(fileBuffer);
    const informations = await getVideoInformations(event.target.files[0]);
    setFileInformations(informations);
    console.log("\ninformations: ", informations);
  };
  console.log("\nAqui3");
  const handleClick = async event => {
    event.preventDefault();
  };

  const handleUpload = fileSelected => {
    try {
      uploadFileToS3(fileSelected);
    } catch (err) {
      console.log(err);
    }
  };

  console.log("\nAqui2");

  const transcode = async () => {
    const hashnamefile = uuidv4();
    const outputFilePath = "../../tempvideo" + hashnamefile;
    console.log("\noutputFilePath", outputFilePath);
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile(
      "input.avi",
      await fetchFile(videoRef.current?.files[0])
    );

    const currentTime = new Date();
    const timestamp = Math.floor(currentTime.getTime() / 1000);
    const originalName = videoRef.current?.files[0].name
      .split(".")
      .slice(0, -1)
      .join(".");
    const finalName = `${originalName}-${timestamp}`;

    alert("Comprimindo e convertendo vídeo...");
    ffmpeg.writeFile("input.mp4", new Uint8Array(fileBuffer));

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      // "-q",
      // "23",
      // "-c:v",
      // "libx264",
      // "-bsf:v",
      // "h264_mp4toannexb",
      // "-hls_time",
      // "2",
      // "-hls_playlist_type",
      // "vod",
      `${finalName}.mp4`,
    ]);
    // await ffmpeg.exec([
    //   "-i",
    //   "input.mp4",
    //   "-c:v",
    //   "libx264",
    //   "-b:v",
    //   "500k",
    //   "-c:a",
    //   "aac",
    //   "-b:a",
    //   "64k",
    //   "-hls_time",
    //   "2",
    //   "-hls_list_size",
    //   "0",
    //   "-f",
    //   "hls",
    //   `${finalName}.mp4`,
    // ]);
    const fileData = await ffmpeg.readFile(`${finalName}.mp4`);
    const data = new Uint8Array(fileData);
    if (data) {
      setFileDownloadUrl(
        URL.createObjectURL(new Blob([data.buffer], { type: "video/mp4" }))
      );
    }

    // const blob = new Blob([data.buffer], { type: "video/mp4" });
    // const url = toBlobURL(blob);
    if (fileData) {
      console.log("Video saved to: " + fileData);
      videoRef.current = null;
    }
  };

  console.log("\nAqui");

  if (!loaded) {
    return <p>Carragando...</p>;
  }

  return (
    <>
      <form className="upload-steps" onSubmit={handleClick}>
        <label>
          Upload file:
          <input type="file" multiple ref={videoRef} onChange={onChangeFile} />
        </label>
        <br />
        <button type="submit">Upload</button>
        <br />
        <button onClick={transcode}>Tranascode video</button>
        <br />
        <br />
        <p ref={messageRef}></p>
        <p>
          <a href={fileDownloadUrl} target="_blank" rel="noreferrer">
            Download file
          </a>
        </p>
      </form>
    </>
  );
}
export default Upload;
