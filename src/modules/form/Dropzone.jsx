import '../../assets/css/input.css';

import {useDropzone} from 'react-dropzone';

import {BsCloudUpload} from 'react-icons/bs';

const Dropzone = ({label, onDrop, accept, multiple, maxFiles, maxSize, onDropRejected, onFileDialogCancel}) => {
  const {getRootProps, getInputProps, isDragActive, acceptedFiles} = useDropzone({accept, onDrop, multiple, maxSize, maxFiles, onDropRejected, onFileDialogCancel});

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {(file.size / 1024 / 1024).toFixed(2)} MB
    </li>
  ));

  return (
    <>
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input className="dropzone_input" {...getInputProps()} />
        <BsCloudUpload />
        {files.length > 0 ? <ul>{files}</ul> : isDragActive ? <p>Drop file to upload...</p> : <p>{label ? label : 'Drag a file here or click to select.'}</p>}
      </div>
    </>
  );
};

export default Dropzone;
