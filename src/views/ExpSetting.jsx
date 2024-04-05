import {useContext, useEffect, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Title, Text, Container, Button, useMantineColorScheme, TextInput, LoadingOverlay} from "@mantine/core";
import {useNavigate, useSearchParams} from "react-router-dom";
import {addUser, defaultExpName, fb} from "../firebase/firebase-config.js";
import ls from 'localstorage-slim';
import {doc, getDoc} from "firebase/firestore";

export default function ExpSetting() {

    const {setExpMode,setExpDB} = useContext(FlowContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const db = searchParams.get("db") || "debug"
    setExpDB(db);

    const pid = searchParams.get("pid")
    const settingRef = doc(fb, "settings", db);
    getDoc(settingRef).then((snapshot)=>{
        setExpMode(snapshot.data().mode)
        ls.set("expmode",snapshot.data().mode,{ encrypt: true })

        let nxtURL = "/"+snapshot.data().mode+"/consent?db="+db

        if(pid) nxtURL += ("&pid="+pid)
        navigate(nxtURL)
    });

    return (
        <>
           Loading Experiment
        </>
    );
}
