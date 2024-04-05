import {useContext, useEffect, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Title, Text, Container, Button, useMantineColorScheme, TextInput, LoadingOverlay} from "@mantine/core";
import {useNavigate, useSearchParams} from "react-router-dom";
import {addUser, defaultExpName, fb} from "../firebase/firebase-config.js";
import ls from 'localstorage-slim';
import {doc, getDoc} from "firebase/firestore";

export default function Consent({step,nxtUrl}) {
    // const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [ID, setID] = useState("")
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams();
    const expName = searchParams.get("db") || defaultExpName
    ls.set("expname",expName,{ encrypt: true })

    const canProceed = ()=>{
        return  name.length>0 && ID.length>0
    }

    // const onEmailChange = (e)=>{
    //     setEmail(e.target.value)
    // }
    const onNameChange = (e)=>{
        setName(e.target.value)
    }
    const onIDChange = (e)=>{
        setID(e.target.value)
    }

    const onProceed = async () => {
        setLoading(true)

        const userRef = doc(fb, "users", ID)
        const userSnap = await getDoc(userRef);
        let expArr = userSnap.exists() ? userSnap.data().exp : ["users"]

        if(!expArr.includes(expName))
            expArr.push(expName)

        addUser({
            // email: email,
            name: name,
            ID: ID,
            round1: -1,
            round2: -1,
            exp: expArr
        }).then(()=>{
            // ls.set('email', email, { encrypt: true });
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

            <Text fz="lg" m={20}>
                VLAT is developed to measure users' ability to read, understand, and
                use data visualizations to solve problems. This test is a web
                adaptation of the original test.
            </Text>
            <Text fw={700} ta={"center"}>Before you begin, please keep these in mind:</Text>

            <Text fz="lg" m={20}>     The test contains 54 multiple-choice questions about 12 data
                visualizations. You will need to answer 20 of them. For each question, you will be given a static data
                visualization (left) and a problem to solve (right). Choose the BEST
                answer to the questions. If you don't know the answer, select
                'skip'. We suggest maximizing your browser window.
            </Text>

            </Container>
            <Container size={"sm"}>
                <TextInput
                    placeholder="Your School Email"
                    label="Email"
                    withAsterisk
                    value={ID}
                    onChange={onIDChange}
                />
                {/*<TextInput*/}
                {/*    placeholder="Your email"*/}
                {/*    label="Email"*/}
                {/*    withAsterisk*/}
                {/*    value={email}*/}
                {/*    onChange={onEmailChange}*/}
                {/*/>*/}
                <TextInput
                    placeholder="Your name"
                    label="Name"
                    withAsterisk
                    value={name}
                    onChange={onNameChange}
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
