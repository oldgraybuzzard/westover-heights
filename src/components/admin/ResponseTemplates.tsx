import React from 'react';

interface Template {
  id: string;
  title: string;
  content: string;
}

interface ResponseTemplatesProps {
  onSelectTemplate: (content: string) => void;
}

const ResponseTemplates: React.FC<ResponseTemplatesProps> = ({ onSelectTemplate }) => {
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [showAddTemplate, setShowAddTemplate] = React.useState(false);
  const [newTemplate, setNewTemplate] = React.useState({ title: '', content: '' });

  React.useEffect(() => {
    // Load templates from API
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
      setShowAddTemplate(false);
      setNewTemplate({ title: '', content: '' });
      loadTemplates();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">Response Templates</h3>
        <button
          onClick={() => setShowAddTemplate(!showAddTemplate)}
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          {showAddTemplate ? 'Cancel' : 'Add Template'}
        </button>
      </div>

      {showAddTemplate ? (
        <div className="space-y-2 mb-4">
          <input
            type="text"
            placeholder="Template Title"
            value={newTemplate.title}
            onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          />
          <textarea
            placeholder="Template Content"
            value={newTemplate.content}
            onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
            rows={3}
          />
          <button
            onClick={handleSaveTemplate}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template.content)}
              className="text-left px-3 py-2 border rounded-md hover:bg-gray-50"
            >
              {template.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponseTemplates; 