// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAHyqknThEs5NXD7-2F_ewmiteSRqVd_k0",
    authDomain: "elarcabeer.firebaseapp.com",
    databaseURL: "https://elarcabeer.firebaseio.com",
    projectId: "elarcabeer",
    storageBucket: "elarcabeer.appspot.com",
    messagingSenderId: "592535969008",
    appId: "1:592535969008:web:b40de5d072fdcc8c34b635",
    measurementId: "G-N8P892BB7K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
