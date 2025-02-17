import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface Template {
  id: string;
  title: string;
  content: string;
  category: string;
  is_global: boolean;
  created_by: string | null;
}

interface Props {
  onSelect: (content: string) => void;
  currentContent?: string;
}

export default function ResponseTemplateSelector({ onSelect, currentContent }: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    content: currentContent || '',
    category: 'GENERAL',
    is_global: false
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('response_templates')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const saveTemplate = async () => {
    try {
      if (editTemplate) {
        const { error } = await supabase
          .from('response_templates')
          .update({
            title: newTemplate.title,
            content: newTemplate.content,
            category: newTemplate.category,
            is_global: newTemplate.is_global,
            updated_at: new Date().toISOString()
          })
          .eq('id', editTemplate.id);

        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase
          .from('response_templates')
          .insert({
            title: newTemplate.title,
            content: newTemplate.content,
            category: newTemplate.category,
            is_global: newTemplate.is_global
          });

        if (error) throw error;
        toast.success('Template saved');
      }

      setShowModal(false);
      setEditTemplate(null);
      setNewTemplate({
        title: '',
        content: '',
        category: 'GENERAL',
        is_global: false
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('response_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Response Templates</h3>
        <button
          onClick={() => {
            setEditTemplate(null);
            setNewTemplate({
              title: '',
              content: currentContent || '',
              category: 'GENERAL',
              is_global: false
            });
            setShowModal(true);
          }}
          className="text-primary hover:text-primary/80"
        >
          <FaPlus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {templates.map(template => (
          <div
            key={template.id}
            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <div onClick={() => onSelect(template.content)}>
                <h4 className="font-medium">{template.title}</h4>
                <p className="text-sm text-gray-500">{template.category}</p>
              </div>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditTemplate(template);
                    setNewTemplate({
                      title: template.title,
                      content: template.content,
                      category: template.category,
                      is_global: template.is_global
                    });
                    setShowModal(true);
                  }}
                  className="text-primary hover:text-primary/80"
                >
                  <FaEdit />
                </button>
                {!template.is_global && (
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editTemplate ? 'Edit Template' : 'New Template'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={newTemplate.title}
                  onChange={e => setNewTemplate(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newTemplate.category}
                  onChange={e => setNewTemplate(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="GENERAL">General</option>
                  <option value="TESTING">Testing</option>
                  <option value="TREATMENT">Treatment</option>
                  <option value="PREVENTION">Prevention</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={newTemplate.content}
                  onChange={e => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full h-48 p-2 border rounded"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_global"
                  checked={newTemplate.is_global}
                  onChange={e => setNewTemplate(prev => ({ ...prev, is_global: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="is_global" className="text-sm">
                  Make template available to all experts
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={saveTemplate}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 