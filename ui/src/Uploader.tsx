import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import axios from "axios";
import "./uploader.scss";

const thumbsContainer = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #eaeaea",
  marginBottom: 8,
  marginRight: 8,
  width: 100,
  height: 100,
  padding: 4,
  boxSizing: "border-box",
};

const thumbInner = {
  display: "flex",
  minWidth: 0,
  overflow: "hidden",
};

const img = {
  display: "block",
  width: "auto",
  height: "100%",
};

function Uploader() {
  const [files, setFiles] = useState([]);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      onDrop: (acceptedFiles) => {
        setFiles(
          acceptedFiles.map((file) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          )
        );

        const data = new FormData();
        for (let i = 0; i < acceptedFiles.length; i++) {
          data.append("myFile", acceptedFiles[i]);
        }
        const url = import.meta.env.VITE_API_ENDPOINT + "/api/v1/fileupload";
        axios
          .post(url, data, {
            validateStatus: function (status) {
              return status < 300;
            }
          })
          .then((response) => {
            toast.success(`🦄 ${response.data[0]?.message}`);
          })
          .catch((error) => {
            if (error?.response?.data) {
              toast.error(error?.response?.data?.message);
            } else {
              toast.error("🦄 File upload error");
            }
          });
      },
    });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  useEffect(() => {
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  const thumbs = files.map((file) => (
    <div style={thumb} key={file.name}>
      <div style={thumbInner}>
        <img alt="" src={file.preview} style={img} />
      </div>
    </div>
  ));

  return (
    <>
      <div {...getRootProps({ className: "dropzone" })}>
        <input {...getInputProps()} />
        <h1>Try it out!</h1>
        <p>Drag and drop files here</p>
      </div>
      <aside style={thumbsContainer} className="dropzoneThumbnail">
        {thumbs}
      </aside>
      <aside>
        <h4>Accepted files</h4>
        <ul>{acceptedFileItems}</ul>
        <h4>Rejected files</h4>
        <ul>{fileRejectionItems}</ul>
      </aside>
    </>
  );
}

export default Uploader;
