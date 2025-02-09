import React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Preview,
} from '@react-email/components';
import { Question, Answer } from '@/types';

interface QuestionAnsweredEmailProps {
  question: Question;
  answer: Answer;
  userName: string;
  baseUrl: string;
}

export const QuestionAnsweredEmail: React.FC<QuestionAnsweredEmailProps> = ({
  question,
  answer,
  userName,
  baseUrl,
}) => {
  const questionUrl = `${baseUrl}/questions/${question.id}`;

  return (
    <Html>
      <Head />
      <Preview>Your question has been answered</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>Your Question Has Been Answered</Text>
            <Text style={paragraph}>Hello {userName},</Text>
            <Text style={paragraph}>
              Your question has received a response from our medical team.
            </Text>

            <Section style={questionSection}>
              <Text style={sectionLabel}>Your Question:</Text>
              <Text style={questionTitle}>{question.title}</Text>
              <Text style={questionContent}>{question.content}</Text>

              <Hr style={sectionDivider} />

              <Text style={sectionLabel}>Response:</Text>
              <Text style={answerContent}>{answer.content}</Text>
            </Section>

            <Button
              href={questionUrl}
              style={button}
            >
              View Full Response
            </Button>

            <Text style={paragraph}>
              If you need any clarification, you can submit up to two follow-up questions.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              This is an automated message from the Medical Q&A Platform.
              Please do not reply to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const heading = {
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  color: '#484848',
  textAlign: 'center' as const,
  padding: '17px 0 0',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.4',
  color: '#484848',
  marginTop: '16px',
};

const questionSection = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '5px',
  margin: '24px 0',
};

const sectionLabel = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '8px',
};

const questionTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#484848',
  marginBottom: '12px',
};

const questionContent = {
  fontSize: '16px',
  color: '#484848',
  lineHeight: '1.4',
};

const answerContent = {
  fontSize: '16px',
  color: '#484848',
  lineHeight: '1.4',
  backgroundColor: '#ffffff',
  padding: '16px',
  borderRadius: '4px',
  marginTop: '8px',
};

const sectionDivider = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  marginTop: '24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0 24px',
};

const footer = {
  fontSize: '14px',
  color: '#9BA2B0',
  textAlign: 'center' as const,
  marginTop: '16px',
};

export default QuestionAnsweredEmail; 