import { initializeApp } from "firebase/app";
import {getFirestore} from '@firebase/firestore';
import {collection, getDocs, addDoc, doc,setDoc} from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDkTnhXGqv69f0S1Og4G_4mrq_wbtPlvJ0",
    authDomain: "calvisup.firebaseapp.com",
    projectId: "calvisup",
    storageBucket: "calvisup.appspot.com",
    messagingSenderId: "245966107122",
    appId: "1:245966107122:web:873fbc6f8715ac5c71bb6b",
    measurementId: "G-ME2CBJ9BYH"
};

export const defaultExpName = "debug"

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//setting path
export const settingPath = "settings"
export const fb = getFirestore(app)

// const usersCollectionRef = collection(db,"users")
export const addUser = async (user) => {
    return await setDoc(doc(fb, "users",  user.ID),user,{merge:true})
}

export const addDebrief = async (id,values, expName=defaultExpName) => {
    const path = `${expName}-debrief/${id}`
    return await setDoc(doc(fb, path),values,{merge:true})
}



export const addRecord = async (id, seq, record,expName=defaultExpName) => {
    const path = `${expName}/${id}`
    return await setDoc(doc(fb, path),record,{merge:true})
}
