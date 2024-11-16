import bucket from "./firebase"

const uploadImage = (image: any) => {
    return new Promise((resolve, reject) => {
        if (image) {
            try{
                const file = image; 
                const randomNum = Math.floor(Math.random() * 10000); 
                const date = new Date().toISOString().replace(/:/g, '-'); 
                const newFileName = `${randomNum}_${date}_${file.name}`;
                const blob = bucket.file(newFileName); 
                const blobStream = blob.createWriteStream({ metadata: { contentType: file.mimetype } }); 
                blobStream.on('error', (err: any) => reject(err)); 
                blobStream.on('finish', async () => { 
                    await blob.makePublic()
                    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`; 
                    resolve(publicUrl); 
                }); 
                blobStream.end(file.data); 
            }
            catch (error) {
                reject(error);
            }
        } else {
            resolve(null);  
        }
    });
};

export default uploadImage;