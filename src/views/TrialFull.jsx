import {useContext, useEffect, useRef, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Grid, Image, LoadingOverlay, Radio, useMantineColorScheme} from "@mantine/core";
import {ACQuestions} from "../assets/AttentionQ";
import {CALVIQuestions} from "../assets/calviQ";
import { Button } from '@mantine/core';
import {doc, getDoc} from "firebase/firestore";
import {addRecord, fb, defaultExpName} from "../firebase/firebase-config.js";
import ls from "localstorage-slim";
import { useNavigate } from "react-router-dom";
const imgPrefix  = "../calviImgs/"

export default function TrialFull({step, nxtUrl, attentionChecks, expLen=10}) {


    const addAttentionChecks = () => {
        let fullQuestions = [...CALVIQuestions];
        for(let i = 0;i<attentionChecks[0].length;i++){
            let idx = attentionChecks[0][i]
            let checkIdx = attentionChecks[1][i] - 100
            fullQuestions.splice(idx, 0, ACQuestions[checkIdx])
        }
        return fullQuestions;
    }

    const fullVLATQuestions = addAttentionChecks();



    const navigate = useNavigate();

    const userID = ls.get('ID',  { decrypt: true });
    const expName = ls.get("expname",{decrypt: true}) || defaultExpName

    const {activeStep, setActiveStep} = useContext(FlowContext);
    const [qidx, setQidx] = useState(1);
    const [idx, setIdx] = useState(1);
    const [activeQuestion,setActiveQuestion]= useState(fullVLATQuestions[0])
    const [answer, setAnswer] = useState('')
    const [record, setRecord] = useState({})
    const [loading, setLoading] = useState(false)
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';




    const setUserAnswer = (e) => {
        setAnswer(e.target.value)

    }


    const getdataEntry = () => {
        return {
            "qid":qidx,
            "answer":answer,
            "answerIdx": activeQuestion.options.indexOf(answer),
            "trueAnswer": activeQuestion.options[activeQuestion.trueAnswer],
            "trueAnswerIdx":activeQuestion.trueAnswer,
            "correct": answer === activeQuestion.options[activeQuestion.trueAnswer]? 1 : 0

        }
    }
    const nextIndex = async () => {
        setLoading(true)
        const newrecord = {...record}
        const newentry = getdataEntry();
        if(qidx === 6){
            newentry["correct"] =  activeQuestion.trueAnswer.includes(activeQuestion.options.indexOf(answer))? 1: 0;
            newentry["trueAnswerIdx"] = "Multi"
            newentry["trueAnswer"] = "Multi"


        }
        newrecord[idx]= newentry
        setRecord(newrecord)
        const firebaseNewRecord = {}
        firebaseNewRecord[idx] = newentry
        await addRecord(userID, idx, firebaseNewRecord, expName).then(async () => {
            if (idx >= expLen) {
                navigate(nxtUrl)
            }
            setAnswer('')

            const curImg = activeQuestion.img;
            // setQidx(nextQID);
            const nextQuestion = fullVLATQuestions[idx]
            setQidx(+nextQuestion.img.slice(1))
            setActiveQuestion(nextQuestion)
            setIdx(idx + 1);
            if (activeQuestion.img === curImg)
                setLoading(false)
        })
            .catch((e)=>{
                console.log(e)
                setLoading(false)
            })
    }


    useEffect(() => {
        setActiveStep(step)

        const getRecords = async ()=>{
            const docRef = doc(fb, expName, userID);
            const docSnap = await getDoc(docRef);
            // console.log(docSnap.data(),"snap data")
            if(docSnap.data()) {
                let curIdx = Object.keys(docSnap.data()).length+1;
                if(curIdx >= expLen) navigate(nxtUrl);
                else{
                    setRecord(docSnap.data())
                    const question = fullVLATQuestions[curIdx]
                    setQidx(+question.img.slice(1));
                    setActiveQuestion(question)
                    setIdx(curIdx);

                }

            }
        }
        getRecords();
    }, []);

    return (
        <>
            <LoadingOverlay visible={loading} overlayBlur={2} />

            <Grid>
                <Grid.Col md={8} sm={12}>
                    <Image
                        radius="sm"
                        src={`${imgPrefix}T${qidx}.jpg`}
                        alt="VIS"
                        style={{width:"100%"}}
                        onLoad={() => setLoading(false)}

                    />
                </Grid.Col>
                <Grid.Col md={4} sm={12}>
                    <div style={{textAlign:"left",  paddingLeft: '20px',display:"inline-block" }}>
                        <Radio.Group
                            name="question"
                            orientation="vertical"
                            label={ idx + ". "+activeQuestion["question"]}
                            value={answer}
                            size={"md"}

                        >
                            {
                                activeQuestion["options"].map((op,idx)=>{
                                    return  <Radio
                                        color={dark ? 'yellow' : 'blue'}
                                        value={op}
                                        label={op}
                                        key={"op"+idx}
                                        onClick={setUserAnswer}/>
                                })
                            }
                        </Radio.Group>
                    </div>

                </Grid.Col>
            </Grid>
            <Button variant="gradient"
                    disabled={answer === ''}
                    onClick={nextIndex}
                    style={{marginTop: '30px'}}
                    gradient={dark ?{ from: 'yellow', to: 'orange' } :{ from: 'indigo', to: 'cyan' }}>
                NEXT
            </Button>




        </>
    );
}
