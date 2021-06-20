import { useMutation } from "@apollo/client";
import { CheckIcon } from "@chakra-ui/icons";
import {
  Input,
  VStack,
  useColorModeValue,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import { Markup } from "interweave";
import React, { useContext, useState } from "react";
import { UserAuthContext } from "../../context/UserAuth";
import { SUBMIT_ANSWER } from "../../util/graphql";
import { FETCH_COMPLETED_PROBLEM } from "../../util/graphql";
import { transform } from "../../util/Interweave";

function Part({ problemID, part }) {
  const background = useColorModeValue("gray.100", "gray.700");
  const { user } = useContext(UserAuthContext);

  const [answer, setAnswer] = useState("");
  const [incorrect, setIncorrect] = useState(false);
  const [completed, setCompleted] = useState(part.completed)

  const [submitAnswer] = useMutation(SUBMIT_ANSWER, {
    update(proxy, result) {
      const data = proxy.readQuery({
        query: FETCH_COMPLETED_PROBLEM,
        variables: {
          problemID,
        },
      });

      let write = { ...data.getCompletedProblem };
      write.parts = write.parts.map((p) =>
        p.id === part.id
          ? part.question
            ? {
                id: part.id,
                question: part.question,
                answer: part.answer,
                completed: true,
              }
            : {
                id: part.id,
                body: part.body,
                completed: true,
              }
          : p
      );

      proxy.writeQuery({ query: FETCH_COMPLETED_PROBLEM, write });

      console.log(result);
    },
    variables: {
      partID: part.id,
    },
  }); 

  function onSubmit() {
    if (answer === part.answer) {
      submitAnswer();
      setIncorrect(false);
      setCompleted(true);
    } else {
      setIncorrect(true);
    }
  }

  if(part.body && !completed){
    submitAnswer();
  }

  return part.question ? (
    <VStack
      justifyContent="center"
      rounded={6}
      p={12}
      background={background}
      spacing={6}
    >
      <Markup content={part.question} transform={transform}/>
      
      {user && (
        <Input
          placeholder="Answer"
          variant="filled"
          onChange={(event) => setAnswer(event.target.value)}
          isDisabled={completed}
        />
      )}
      {user && (
        <Button
          leftIcon={<CheckIcon />}
          colorScheme="teal"
          variant="solid"
          isDisabled={completed}
          onClick={onSubmit}
        >
          Submit
        </Button>
      )}
      {incorrect && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Your Answer was incorrect!</AlertTitle>
        </Alert>
      )}
      {completed && (
        <Alert status="success">
          <AlertIcon />
          <AlertTitle mr={2}>Your Answer was correct</AlertTitle>
        </Alert>
      )}
    </VStack>
  ) : (
    <VStack
      justifyContent="center"
      rounded={6}
      p={12}
      background={background}
      spacing={6}
    >
      <Markup content={part.body} transform={transform}/>
    </VStack>
  );
}

export default Part;
