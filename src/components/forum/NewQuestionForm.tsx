import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface NewQuestionFormProps {
  onSubmit: (data: QuestionFormData) => Promise<void>;
}

interface QuestionFormData {
  title: string;
  content: string;
  forum: string;
  type: string;
  notifyEmail: boolean;
}

const NewQuestionForm: React.FC<NewQuestionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<QuestionFormData>({
    title: '',
    content: '',
    forum: 'Herpes Questions',
    type: 'question',
    notifyEmail: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Question Title (Maximum Length: 80)
        </label>
        <input
          type="text"
          maxLength={80}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 form-input block w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description of your Issue (Maximum Length: ~500 words)
        </label>
        <textarea
          rows={6}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="mt-1 form-textarea block w-full"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          checked={formData.notifyEmail}
          onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.checked })}
          className="form-checkbox h-4 w-4 text-primary"
        />
        <label className="ml-2 text-sm text-gray-700">
          Notify me of follow-up replies via email
        </label>
      </div>

      <button type="submit" className="btn-primary w-full">
        Submit Question
      </button>
    </form>
  );
};

export default NewQuestionForm; 