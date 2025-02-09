import { Question, Answer } from '@/types';

export const notificationTemplates = {
  newQuestion: (question: Question) => ({
    title: 'New Question Received',
    message: `New question: "${question.title.substring(0, 50)}${question.title.length > 50 ? '...' : ''}"`,
    link: `/admin/questions/${question.id}`,
  }),

  followUp: (question: Question) => ({
    title: 'Follow-up Question Received',
    message: `Follow-up received for question: "${question.title.substring(0, 40)}${question.title.length > 40 ? '...' : ''}"`,
    link: `/admin/questions/${question.id}`,
  }),

  questionAnswered: (question: Question, answer: Answer) => ({
    title: 'Question Answered',
    message: `Your question "${question.title.substring(0, 40)}${question.title.length > 40 ? '...' : ''}" has been answered`,
    link: `/questions/${question.id}`,
  }),

  questionClosed: (question: Question) => ({
    title: 'Question Closed',
    message: `Question "${question.title.substring(0, 45)}${question.title.length > 45 ? '...' : ''}" has been closed`,
    link: `/questions/${question.id}`,
  }),

  systemUpdate: (title: string, message: string, link?: string) => ({
    title,
    message,
    link,
  }),
}; 