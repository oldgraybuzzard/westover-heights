import React from 'react';
import { Question, Answer } from '@/types';
import RichTextEditor from '@/components/questions/RichTextEditor';
import ResponseTemplates from './ResponseTemplates';
import FileUpload from './FileUpload';
import api from '@/lib/api';

interface QuestionResponseProps {
  question: Question;
  onAnswerSubmitted: (answer: Answer) => void;
}

const QuestionResponse: React.FC<QuestionResponseProps> = ({ question, onAnswerSubmitted }) => {
  const [response, setResponse] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);

  const handleTemplateSelect = (templateContent: string) => {
    setResponse(templateContent);
  };

  const handleFileUpload = (files: File[]) => {
    setAttachments(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Upload attachments first
      const uploadPromises = attachments.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const uploadResponse = await api.post('/api/upload', formData);
        return uploadResponse.data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Submit response with attachment URLs
      const result = await api.post(`/api/questions/${question.id}/answer`, {
        content: response,
        attachments: uploadedUrls,
      });

      onAnswerSubmitted(result.data);
      setResponse('');
      setAttachments([]);
    } catch (err) {
      setError('Failed to submit response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ResponseTemplates onSelectTemplate={handleTemplateSelect} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Response
        </label>
        <RichTextEditor
          value={response}
          onChange={setResponse}
          placeholder="Type your response here..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        <FileUpload onFileUpload={handleFileUpload} />
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !response.trim()}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Response'}
        </button>
      </div>
    </form>
  );
};

export default QuestionResponse; 