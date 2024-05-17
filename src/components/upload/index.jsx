import React, { useState } from "react";
// import { compressAndConvertToHLS as compress } from "../compress/compress";
import { Converter } from "../process";

import { uploadFileToS3 } from "./UploadFileToS3";

function Upload() {
  const [fileSelected, setFileSelected] = useState({ type: "", name: "" });
  const fileInput = React.useRef();

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

  return (
    <>
      <form className="upload-steps" onSubmit={handleClick}>
        <label>
          Upload file:
          <input type="file" multiple ref={fileInput} onChange={onChangeFile} />
        </label>
        <br />
        <button type="submit">Upload</button>
      </form>
      <Converter />
    </>
  );
}
export default Upload;
