// src/components/FileUpload.js
import React, { useState } from 'react';
// import { amplify ,Storage } from 'aws-amplify';
import { uploadData} from 'aws-amplify/storage';

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setSuccess(false); // Reset success message if new file selected

    };
    console.log(file);





    //1 Handle file upload
    const handleUpload = async () => {
        if (!file) return;
        
        const onProgress = (progress) => {
            console.log(`Progress: ${(progress.loaded / progress.total) * 100}%`);
        };
        //=======================================
        setUploading(true);
        try {
          const  uploadProgress=await uploadData({
                path: `public/${file.name}`,
                data: file,
                options: {
                    contentType: file.type,
                    onProgress// Optional progress callback.
                  }
                
                  }).result;
            console.log('File uploaded successfully:',uploadProgress);
            setSuccess(true);
        } catch (error) {
            console.error('Error uploading file:', error);
            setSuccess(false);
        } finally {
            setUploading(false);
        }
    };

    // const handleGuesssAccess= async()=>{
    //     try {
    //         const result = await getProperties({
    //         });
    //         console.log('File Properties ', result);
    //       } catch (error) {
    //         console.log('Error ', error);
    //       }
    // };
    // handleGuesssAccess();
    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload} disabled={!file || uploading}>
                {uploading ? 'Uploading...' : 'Upload to S3'}
            </button>
            {success && <p>File uploaded successfully!</p>}
        </div>
    );
};

export default FileUpload;
