import {useContext, useEffect, useRef, useState} from "react";
import {FlowContext} from "../App.jsx";
import {ACQuestions} from "../assets/AttentionQ";
import {CALVIQuestions} from "../assets/calviQ";
import {Grid, Image, LoadingOverlay, Radio, useMantineColorScheme} from "@mantine/core";

import { Button } from '@mantine/core';
import {nextQuestionURL, nextQuestionURLTest} from "../constants/endpoints.js";
import {doc, getDoc} from "firebase/firestore";
import {addRecord, fb, defaultExpName} from "../firebase/firebase-config.js";
import ls from "localstorage-slim";
import { useNavigate } from "react-router-dom";
import {CALVINormalQuestions} from "../assets/normalQ.js";
import {reConstructRandomArray} from "../utils/commonFunc.js";


const imgPrefix  = "../calviImgs/"
const FullQuestions = [...CALVIQuestions,...ACQuestions,...CALVINormalQuestions]

// attention checks: [[index],[qNo]]. fixed postion, fixed quesiotn
// randomQuestions :

export default function TrialAdaptive({expLen=20, step,nxtUrl,attentionChecks=[[],[]], randomNormalQ = [[],[]]}) {

    const getQuestion = (itemID) => {
        const q = FullQuestions.filter(q => q.img === "T"+itemID);
        return q[0];
    }

    const isFirstItemCheck = () => {
        return attentionChecks[0].length>0 && attentionChecks[0][0] === 1
    }

    const isFirstItemNormal = () => {
        return randomNormalQ[0].length>0 && randomNormalQ[0][0] === 1
    }

    const firstQIndex =  isFirstItemCheck()?getQuestion(attentionChecks[1][0]): (isFirstItemNormal()? getQuestion(randomNormalQ[[1][0]]):48)
    const firstQuestion = getQuestion(firstQIndex)

    const navigate = useNavigate();

    const userID = ls.get('ID',  { decrypt: true });
    const expName = ls.get("expname",{decrypt: true}) || defaultExpName

    const {activeStep, setActiveStep} = useContext(FlowContext);
    const [qidx, setQidx] = useState(firstQIndex);
    const [idx, setIdx] = useState(1);
    const [activeQuestion,setActiveQuestion]= useState(firstQuestion)
    const [answer, setAnswer] = useState('')
    const [record, setRecord] = useState({})
    const [loading, setLoading] = useState(false)
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const dark = colorScheme === 'dark';



    const setUserAnswer = (e) => {
        setAnswer(e.target.value)

    }

    const buildFormData = (curRecord)=>{
        let formData = new FormData();
        const qidArr = [];
        const correctArr = [];
        for(const [id,entry] of Object.entries(curRecord)){
            if(entry.qid<99){
                qidArr.push(entry.qid);
                correctArr.push(entry.correct);
            }
        }



        formData.append('uid', userID);
        formData.append('qid', JSON.stringify(qidArr));
        formData.append('correct', JSON.stringify(correctArr));

        return formData;

    }

     const getNextQuestion = async (formdata = {}) => {

            // Default options are marked with *
            const response = await fetch(nextQuestionURL, {
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                },
                mode: 'cors',
                cache: 'no-cache',
                body: formdata
            });
            return await response.json();

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

    const trimStaticTrials = (curIdx,data) => {
        while (attentionChecks[0][0] < curIdx){
            attentionChecks[0].shift();
            attentionChecks[1].shift();
        }
        randomNormalQ = reConstructRandomArray(randomNormalQ,data,curIdx)
    }


    const constructFireBaseRecord = () => {

        const newrecord = {...record}
        const newentry = getdataEntry();
        if(qidx === 6){
            newentry["trueAnswerIdx"] = "Multi"
            newentry["trueAnswer"] = "Multi"
            newentry["correct"] =  activeQuestion.trueAnswer.includes(activeQuestion.options.indexOf(answer))? 1: 0;
        }
        newrecord[idx]= newentry
        setRecord(newrecord)
        const firebaseNewRecord = {}
        firebaseNewRecord[idx] = newentry
        return firebaseNewRecord;
    }

    const setNextTrial = (nextQID) => {
        if (idx >= expLen) {
            navigate(nxtUrl)
        }
        setAnswer('')

        setQidx(nextQID);
        setActiveQuestion(getQuestion(nextQID))
        setIdx(idx + 1);
    }


    const nextIndex = async () => {
        const curImg = activeQuestion.img;
        const firebaseNewRecord = constructFireBaseRecord();
        const curRecord = {...record,...firebaseNewRecord};
        trimStaticTrials(idx+1,curRecord)

        console.log(randomNormalQ,"random Q")
       if(randomNormalQ[0].includes(idx+1)){
           const nextQID = randomNormalQ[1][0]
           setLoading(true)
           await addRecord(userID, idx, firebaseNewRecord, expName).then(async () => {
               setNextTrial(nextQID)

               if (activeQuestion.img === curImg)
                   setLoading(false)
           })
               .catch(()=>{
                   setLoading(false)
               })
       }
       else if(attentionChecks[0].includes(idx+1)){
           const nextQID = attentionChecks[1][0]
           setLoading(true)
           await addRecord(userID, idx, firebaseNewRecord, expName).then(async () => {
               setNextTrial(nextQID)

               if (activeQuestion.img === curImg)
                   setLoading(false)
           })
               .catch(()=>{
                   setLoading(false)
               })


       } else{
           setLoading(true)

           const newrecord = {...record}
           const newentry = getdataEntry();
           if(qidx === 6){
               newentry["trueAnswerIdx"] = "Multi"
               newentry["trueAnswer"] = "Multi"
               newentry["correct"] =  activeQuestion.trueAnswer.includes(activeQuestion.options.indexOf(answer))? 1: 0;
           }
           newrecord[idx]= newentry
           setRecord(newrecord)
           const trickfirebaseNewRecord = {}
           trickfirebaseNewRecord[idx] = newentry
           await addRecord(userID, idx, trickfirebaseNewRecord, expName).then(async () => {
               if (idx >= expLen) {
                   navigate(nxtUrl)
               }
               setAnswer('')

               const curImg = activeQuestion.img;
               const nextData = await getNextQuestion(buildFormData(newrecord))
               const nextQID = nextData["item_id"];
               setQidx(nextQID);
               setActiveQuestion(getQuestion(nextQID))
               setIdx(idx + 1);
               if (activeQuestion.img === curImg)
                   setLoading(false)
           })
               .catch(()=>{
                   setLoading(false)
               })
       }


    }


    useEffect(() => {
        setActiveStep(step)

        const getRecords = async ()=>{
            const docRef = doc(fb, expName, userID);
            const docSnap = await getDoc(docRef);
            // console.log(docSnap.data(),"snap data")
            if(docSnap.data()) {
                let curIdx = Object.keys(docSnap.data()).length+1;
                setRecord(docSnap.data())

                trimStaticTrials(curIdx,docSnap.data())


                if(curIdx >= expLen) navigate(nxtUrl);
                else if(attentionChecks[0].includes(curIdx)){


                    const nextQID = attentionChecks[1][0]
                    setQidx(nextQID);
                    setActiveQuestion(getQuestion(nextQID))
                    setIdx(curIdx);

                }else if(randomNormalQ[0].includes(curIdx)){
                    const nextQID = randomNormalQ[1][0]
                    setQidx(nextQID);
                    setActiveQuestion(getQuestion(nextQID))
                    setIdx(curIdx);
                }
                else{
                    const nextData = await getNextQuestion(buildFormData(docSnap.data()))
                    const nextQID = nextData["item_id"];
                    setQidx(nextQID);
                    setActiveQuestion(getQuestion(nextQID))
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
