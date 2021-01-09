import React, { Component } from "react";
import Dropzone from "../Dropzone/Dropzone";
import "./Upload.css";
import S3 from "react-aws-s3";

class Upload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      uploading: false,
      successfullUploaded: false,
      countFiles:0,
      noOfFiles:0
    };

    this.onFilesAdded = this.onFilesAdded.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.renderActions = this.renderActions.bind(this);
  }
  // =========================================================================
  config = {
      bucketName: process.env.REACT_APP_BUCKET_NAME,
      dirName: process.env.REACT_APP_DIR_NAME /* optional */,
      region: process.env.REACT_APP_REGION,
      accessKeyId: process.env.REACT_APP_ACCESS_ID,
      secretAccessKey: process.env.REACT_APP_ACCESS_KEY,
    };
// ================================================================================
  
  onFilesAdded(files) {
    this.setState(prevState => ({
      files: prevState.files.concat(files)
    }));
  }

  async uploadFiles() {
    this.setState({ uploading: true });
    const promises = [];
    this.state.files.forEach(file => {
      promises.push(this.handleUpload(file));

    });
    try {
      await Promise.all(promises);
      this.setState({ successfullUploaded: true, uploading: false });
    } catch (e) {
      // Not Production ready! Do some error handling here instead...
      this.setState({ successfullUploaded: true, uploading: false });
    }
  }

  handleUpload = (file) => {
      let newFileName = file.name.replace(/\..+$/, "");
      console.log(newFileName);
      
      this.state.noOfFiles++;      
      const ReactS3Client = new S3(this.config);
      ReactS3Client.uploadFile(file, newFileName).then((data) => {
        if (data.status === 204) {
        //Counting number of files uploaded
          this.setState(prevState => {
            return {countFiles: prevState.countFiles + 1}
         });
          console.log("Uploaded Successfully -> "+newFileName)
        } else {
          console.log("Uploading Failed -> "+newFileName)
        }
      });
    };

  renderActions() {
    if (this.state.successfullUploaded) {
      return (
        <button
          onClick={() =>
            this.setState({ files: [], successfullUploaded: false, countFiles:0, noOfFiles:0})
          }
        >
          Clear
        </button>
      );
    } else {
      return (
        <button
          disabled={this.state.files.length === 0 || this.state.uploading}
          onClick={this.uploadFiles}
        >
          Upload
        </button>
      );
    }
  }

  renderMessage(){
    // if(this.state.noOfFiles==this.state.countFiles){   // Add This to display message after uploading all files.
      return (
        <div className="uploadStatus-wrap">
        <p 
              className="numberOfFiles"
              style={{display : this.state.successfullUploaded ? "block" : "none"} }>
                
              {this.state.countFiles} Files Uploaded Successfully
          </p>
          <img
          className="CheckIcon"
          alt="done"
          src="https://cdn0.iconfinder.com/data/icons/shift-symbol/32/Complete_Symbol-256.png"
          style={{display : this.state.successfullUploaded ? "block" : "none"} }

        />
        </div>
      );
    // }
  }

  render() {
    return (
      <div className="Upload">
        <span className="Title">Upload Files</span>
        <div className="Content">
          <div>
            <Dropzone
              onFilesAdded={this.onFilesAdded}
              disabled={this.state.uploading || this.state.successfullUploaded}
            />
          </div>

          <div className="Files">
            {this.state.files.map(file => {
              return (
                <div key={file.name} className="Row">
                  <span className="Filename"> {file.name}</span>
                </div>
              );
            })}
          </div>

        </div>
        <div >
          {this.renderMessage()}
          
        </div>
        <div className="Actions">{this.renderActions()}</div>
      </div>
    );
  }
}

export default Upload;