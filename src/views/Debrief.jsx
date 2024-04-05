import {useContext, useEffect, useRef, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Box, Button, Group, TextInput} from "@mantine/core";
import {useForm} from "@mantine/form";
import {RadioQuestion} from "../components/forms/RadioQuestion.jsx";
import { useNavigate } from "react-router-dom";
import {addDebrief, addUser} from "../firebase/firebase-config.js";
import ls from "localstorage-slim";




export default function Debrief({step, nxtUrl}) {
    const {activeStep, setActiveStep} = useContext(FlowContext);
    const navigate = useNavigate();
    const ID = ls.get('ID',  { decrypt: true });

    const form = useForm({
        initialValues: {
            year: '',
            major: '',
        },

    });

    useEffect(() => {
        setActiveStep(step)

    }, []);

    const allAnswered = (values) => {
        return Object.values(values).reduce((accu,cur)=>accu && cur.length>0, true)
    }

    return (
        <Box sx={{ maxWidth: 600, textAlign: 'left'}} mx="auto">
            <form onSubmit={form.onSubmit((values) =>{
                addDebrief(ID,values)
                navigate(nxtUrl);
            })}>

                <RadioQuestion
                    name={"year"}
                    question={"Which year are you in university?"}
                    options={["Freshman", "Sophomore", "Junior", "Senior", "Master","Ph.D"]}
                    inputProps={form.getInputProps('year')}
                />

                <RadioQuestion
                    name={"major"}
                    question={"What is your major?"}
                    options={["Computer Science", "Data Science", "Statistics", "Other"]}
                    inputProps={form.getInputProps('major')}

                />
                {/*<TextInput*/}
                {/*    withAsterisk*/}
                {/*    label="Which year are you in university?"*/}
                {/*    placeholder="your@email.com"*/}
                {/*    {...form.getInputProps('Year')}*/}
                {/*/>*/}

                <Group position="center" mt="md">
                    <Button disabled={!allAnswered(form.values)} type="submit">Submit</Button>
                </Group>
            </form>
        </Box>
    );
}
