import admin from 'firebase-admin'; 
import { ServiceAccount } from 'firebase-admin';
import dotenv from 'dotenv'
dotenv.config()

const firebaseConfig = {
     type: "service_account",
     project_id: process.env.PROJECT_ID,
     private_key_id: process.env.PROVATE_KEY_ID,
     private_key: process.env.PRIVATE_KEY!.replace(/\\n/g, '\n'),
     client_email: process.env.CLIENT_EMAIL,
     client_id: process.env.CLIENT_ID,
     auth_uri: process.env.AUTH_URI,
     token_uri: process.env.TOKEN_URI,
     auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
     client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
     universe_domain: process.env.UNIVERSE_DOMAIN
   }

admin.initializeApp({ 
     credential: admin.credential.cert(firebaseConfig as ServiceAccount), 
     storageBucket: `${process.env.PROJECT_ID}.appspot.com` 
}); 

const bucket = admin.storage().bucket(); 
export default  bucket ;