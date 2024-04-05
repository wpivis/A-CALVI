import {useContext, useEffect, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Title, Text, Container, Button, useMantineColorScheme, TextInput, LoadingOverlay} from "@mantine/core";
import {useNavigate, useSearchParams} from "react-router-dom";
import {addUser, defaultExpName, fb} from "../firebase/firebase-config.js";
import ls from 'localstorage-slim';
import {doc, getDoc} from "firebase/firestore";
import MdReader from "../components/MdReader.jsx";
import { v4 as uuidv4 } from 'uuid';

export default function ConsentProlific({step,nxtUrl, fileName}) {
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const expName = searchParams.get("db") || defaultExpName
    const [ID, setID] = useState(searchParams.get("pid") || uuidv4())


    ls.set("expname",expName,{ encrypt: true })


    const canProceed = ()=>{
        return ID.length>0
    }


    const onProceed = async () => {
        setLoading(true)

        const userRef = doc(fb, "users", ID)
        const userSnap = await getDoc(userRef);
        let expArr = userSnap.exists() ? userSnap.data().exp : ["users"]

        if(!expArr.includes(expName))
            expArr.push(expName)

        addUser({
            ID: ID,
            round1: -1,
            round2: -1,
            exp: expArr
        }).then(()=>{
            ls.set('ID', ID, { encrypt: true });

            navigate(nxtUrl)
        }).catch((e)=>{
                alert("database offline")
            })
            .finally(()=>{
                setLoading(false)

            })
    }


    const {activeStep, setActiveStep} = useContext(FlowContext);
    const navigate = useNavigate();
    const { colorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';
    useEffect(() => {
        setActiveStep(step)

    }, []);

    return (
        <>
            <LoadingOverlay visible={loading} overlayBlur={2} />

            {/*<Title order={1}> Visualization Literacy Assessment Test (VLAT)</Title>*/}
            <Container size={600} px={10} ta={"left"}>

                <MdReader fileName={fileName}/>
            </Container>
            <Container size={"sm"}>
                <TextInput
                    placeholder="Your prolific ID is not valid, please try again"
                    label="ID"
                    withAsterisk
                    value={ID}
                    disabled
                />

            </Container>

            <Button variant="gradient"
                    disabled={!canProceed()}
                    m={30}
                    onClick={onProceed}
                    gradient={dark ?{ from: 'yellow', to: 'orange' } :{ from: 'indigo', to: 'cyan' }}>
                NEXT
            </Button>
        </>
    );
}
