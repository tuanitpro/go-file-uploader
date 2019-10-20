import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
import axios from 'axios';

const thumbsContainer = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 16
}

const thumb = {
  display: 'inline-flex',
  borderRadius: 2,
  border: '1px solid #eaeaea',
  marginBottom: 8,
  marginRight: 8,
  width: 'auto',
  height: 480,
  padding: 4,
  boxSizing: 'border-box'
}

const thumbInner = {
  display: 'flex',
  minWidth: 0,
  overflow: 'hidden'
}

const img = {
  display: 'block',
  width: 'auto',
  
}
const baseStyle = {
  height: 100,
  borderWidth: 0,
  borderColor: '#666',
  borderStyle: 'dashed',
  borderRadius: 1,
  color: '#fff',
  background: '#3399cc',
  textAlign: 'center',  
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      files: [],
      enableSubmitButton: false
    }
    this.onDrop = this.onDrop.bind(this)
  }

  onDrop (files) {
    this.setState({
      files: files.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      }))

    })
    const data = new FormData();
    for(let i= 0; i<files.length; i++){
      data.append('myFile', files[i])
    };

    axios.post('http://localhost:8080/api/v1/fileupload', data).then(response => {
      console.log(response.data);
    })
  }
  componentWillUnmount () {
    // Make sure to revoke the data uris to avoid memory leaks
    this.state.files.forEach(file => URL.revokeObjectURL(file.preview))
  }

  render () {
    const { files } = this.state

    const thumbs = files.map(file => (
      <div style={thumb} key={file.name}>
        <div style={thumbInner}>
          <img alt=''
            src={file.preview}
            style={img}
          />
        </div>
      </div>
    ))
    return (
      <Fragment>
        <section>
          <h3>Go Uploader</h3>
          <div className='dropzone'>
            <Dropzone
              accept='image/*'
              multiple
              onDrop={this.onDrop}
            >
              {({ getRootProps, getInputProps }) => (
                <div {...getRootProps()} style={baseStyle}>
                  <input {...getInputProps()} />
                  <div className='dropzoneText'>Kéo thả file vào đây</div>
                </div>
              )}
            </Dropzone>
            <aside style={thumbsContainer} className='dropzoneThumbnail'>
              {thumbs}
            </aside>
          </div>
        </section>
      </Fragment>
    )
  }
}

App.propTypes = {
  onUploaded: PropTypes.func
}

export default App
