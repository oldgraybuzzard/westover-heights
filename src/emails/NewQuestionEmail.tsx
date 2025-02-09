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
import { Question } from '@/types';

interface NewQuestionEmailProps {
  question: Question;
  adminName: string;
  baseUrl: string;
}

export const NewQuestionEmail: React.FC<NewQuestionEmailProps> = ({
  question,
  adminName,
  baseUrl,
}) => {
  const questionUrl = `${baseUrl}/admin/questions/${question.id}`;

  return (
    <Html>
      <Head />
      <Preview>New Question: {question.title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={heading}>New Question Received</Text>
            <Text style={paragraph}>Hello {adminName},</Text>
            <Text style={paragraph}>
              A new question has been submitted and requires your attention.
            </Text>

            <Section style={questionSection}>
              <Text style={questionTitle}>{question.title}</Text>
              <Text style={questionContent}>{question.content}</Text>
            </Section>

            <Button
              href={questionUrl}
              style={button}
            >
              View Question
            </Button>

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

export default NewQuestionEmail; 