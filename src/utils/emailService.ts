import Mailjet from 'node-mailjet';
import { render } from '@react-email/render';
import NewQuestionEmail from '@/emails/NewQuestionEmail';
import QuestionAnsweredEmail from '@/emails/QuestionAnsweredEmail';
import { Question, Answer } from '@/types';

if (!process.env.MAILJET_API_KEY || !process.env.MAILJET_SECRET_KEY) {
  throw new Error('Mailjet credentials are not set in environment variables');
}

const mailjet = new Mailjet({
  apiKey: process.env.MAILJET_API_KEY,
  apiSecret: process.env.MAILJET_SECRET_KEY,
});

class EmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }

  async sendNewQuestionEmail(question: Question, adminEmail: string, adminName: string) {
    const emailHtml = await render(
      NewQuestionEmail({
        question,
        adminName,
        baseUrl: this.baseUrl,
      }) as React.ReactElement
    );

    const emailData = {
      Messages: [
        {
          From: {
            Email: process.env.CONTACT_EMAIL_FROM || 'terri@westoverheights.com',
            Name: 'Westover Heights Contact Form',
          },
          To: [
            {
              Email: adminEmail,
              Name: 'Westover Research Group',
            },
          ],
          Subject: `New Question: ${question.title}`,
          TextPart: emailHtml,
          HTMLPart: emailHtml.replace(/\n/g, '<br>'),
          CustomID: 'NewQuestionEmail',
        },
      ],
    };

    return mailjet.post('send', { version: 'v3.1' }).request(emailData);
  }

  async sendQuestionAnsweredEmail(
    question: Question,
    answer: Answer,
    userEmail: string,
    userName: string
  ) {
    const emailHtml = await render(
      QuestionAnsweredEmail({
        question,
        answer,
        userName,
        baseUrl: this.baseUrl,
      }) as React.ReactElement
    );

    const emailData = {
      Messages: [
        {
          From: {
            Email: process.env.CONTACT_EMAIL_FROM || 'terri@westoverheights.com',
            Name: 'Westover Heights Contact Form',
          },
          To: [
            {
              Email: userEmail,
              Name: 'Westover Research Group',
            },
          ],
          Subject: 'Your Question Has Been Answered',
          TextPart: emailHtml,
          HTMLPart: emailHtml.replace(/\n/g, '<br>'),
          CustomID: 'QuestionAnsweredEmail',
        },
      ],
    };

    return mailjet.post('send', { version: 'v3.1' }).request(emailData);
  }
}

export default new EmailService(); 