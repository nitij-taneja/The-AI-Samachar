import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { trpc } from '@/lib/trpc';

interface TemplateForm {
  name: string;
  description?: string;
  prompt: string;
  defaultParameters: string;
}

const TemplateManager: React.FC = () => {
  const { data: templates, refetch } = trpc.newsletter.listTemplates.useQuery();
  const createMutation = trpc.newsletter.createTemplate.useMutation();
  const updateMutation = trpc.newsletter.updateTemplate.useMutation();
  const deleteMutation = trpc.newsletter.deleteTemplate.useMutation();

  const [newTemplate, setNewTemplate] = useState<TemplateForm>({
    name: '',
    description: '',
    prompt: '',
    defaultParameters: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<TemplateForm>({
    name: '',
    description: '',
    prompt: '',
    defaultParameters: '',
  });

  const handleCreate = async () => {
    await createMutation.mutateAsync(newTemplate);
    setNewTemplate({ name: '', description: '', prompt: '', defaultParameters: '' });
    refetch();
  };

  const handleEdit = (template: any) => {
    setEditingId(template.id);
    setEditValues({
      name: template.name,
      description: template.description,
      prompt: template.prompt,
      defaultParameters: template.defaultParameters,
    });
  };

  const handleUpdate = async () => {
    if (editingId != null) {
      await updateMutation.mutateAsync({ id: editingId, updates: editValues });
      setEditingId(null);
      refetch();
    }
  };

  const handleDelete = async (id: number) => {
    await deleteMutation.mutateAsync({ id });
    refetch();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Prompt</Label>
            <Textarea
              rows={3}
              value={newTemplate.prompt}
              onChange={(e) => setNewTemplate({ ...newTemplate, prompt: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Default Parameters (JSON)</Label>
            <Textarea
              rows={2}
              value={newTemplate.defaultParameters}
              onChange={(e) => setNewTemplate({ ...newTemplate, defaultParameters: e.target.value })}
            />
          </div>
          <Button onClick={handleCreate} disabled={createMutation.status === 'pending' || !newTemplate.name || !newTemplate.prompt}>
            {createMutation.status === 'pending' ? 'Creating...' : 'Create Template'}
          </Button>
        </CardContent>
      </Card>

      {templates?.map((tpl) => (
        <Card key={tpl.id}>
          <CardHeader>
            <CardTitle>{tpl.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingId === tpl.id ? (
              <>
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={editValues.name}
                    onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea
                    rows={2}
                    value={editValues.description}
                    onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Prompt</Label>
                  <Textarea
                    rows={3}
                    value={editValues.prompt}
                    onChange={(e) => setEditValues({ ...editValues, prompt: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Default Parameters (JSON)</Label>
                  <Textarea
                    rows={2}
                    value={editValues.defaultParameters}
                    onChange={(e) => setEditValues({ ...editValues, defaultParameters: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdate} disabled={updateMutation.status === 'pending'}>
                    {updateMutation.status === 'pending' ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm"><strong>Description:</strong> {tpl.description || '—'}</p>
                <p className="text-sm"><strong>Prompt:</strong> <code className="block whitespace-pre-wrap">{tpl.prompt}</code></p>
                <p className="text-sm"><strong>Default Params:</strong> <code className="block whitespace-pre-wrap">{tpl.defaultParameters}</code></p>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(tpl)}>Edit</Button>
                  <Button variant="destructive" onClick={() => handleDelete(tpl.id)} disabled={deleteMutation.status === 'pending'}>
                    Delete
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TemplateManager;