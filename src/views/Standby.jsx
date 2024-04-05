
import {Title, Text, Container, Button, useMantineColorScheme, TextInput, LoadingOverlay, Center} from "@mantine/core";

export default function Standby({step}) {



    return (
        <Center style={{ height: 400 }}>
            <Text  variant="gradient"
                   gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                   sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
                   ta="center"
                   fz="xl"
                   fw={700}>
                Please wait, the administrator will start the survey soon.
            </Text>
        </Center>

    );
}
