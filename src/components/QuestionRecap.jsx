import { useEffect, useState } from "react";
import {Image, Radio, Stack, Text, useMantineColorScheme} from "@mantine/core";
import {CALVIQuestions} from "../assets/calviQ";
import {doc, getDoc} from "firebase/firestore";
import {defaultExpName, fb} from "../firebase/firebase-config.js";
import ls from "localstorage-slim";
import {ACQuestions} from "../assets/AttentionQ.js";
import {CALVINormalQuestions} from "../assets/normalQ.js";


const FullQuestions = [...CALVIQuestions,...ACQuestions, ...CALVINormalQuestions]

export default function QuestionRecap({}) {
    const imgPrefix  = "../calviImgs/"
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const dark = colorScheme === 'dark';

    const userID = ls.get('ID',  { decrypt: true });
    const expName = ls.get("expname",{decrypt: true}) || defaultExpName
    const [record,setRecord] = useState([]);
    useEffect(() => {
        const getRecords = async ()=>{
            const docRef = doc(fb, expName, userID);
            const docSnap = await getDoc(docRef);
            // console.log(docSnap.data(),"snap data")
            if(docSnap.data()) {
                setRecord(Object.values(docSnap.data()))
                }

            }

        getRecords();
    }, []);
    const getQuestion = (itemID) => {
        const q = FullQuestions.filter(q => q.img === "T"+itemID);
        return q[0];
    }
    return (
        <div>
            <Text fz="xl" fw={700}>Question Recap</Text>

            {
                record.map((r,i)=>
                    <Stack key={i}  sx={{marginTop: 10, textAlign:"left", borderBottom:"1px solid"}}>
                        <Image
                            radius="sm"
                            src={`${imgPrefix}T${r.qid}.jpg`}
                            alt="VIS"
                            style={{width:300}}
                        />
                        {`${i+1}.${getQuestion(r.qid).question}`}
                        { getQuestion(r.qid).options.map((op,idx)=>{
                            return  <Radio
                                color={dark ? 'yellow' : 'blue'}
                                value={r.answer}
                                label={op}
                                key={"op"+idx}
                                disabled={true}
                                checked={idx == r.answerIdx}
                                />
                        })}
                    </Stack>
                )}


        </div>
    );
};