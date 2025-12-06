import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Settings } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface NewsletterGeneratorProps {
  onGenerationStart?: (executionId: string) => void;
  onGenerationComplete?: () => void;
}

const NewsletterGenerator: React.FC<NewsletterGeneratorProps> = ({
  onGenerationStart,
  onGenerationComplete,
}) => {
  const [topics, setTopics] = useState<string[]>(['AI', 'Technology']);
  const [topicInput, setTopicInput] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'technical'>('professional');
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [newsSource, setNewsSource] = useState('mixed');
  const [personalizationLevel, setPersonalizationLevel] = useState(5);
  const [language, setLanguage] = useState<'english' | 'hindi' | 'bilingual'>('bilingual');
  const [isGenerating, setIsGenerating] = useState(false);

  // Load user preferences
  const { data: preferences } = trpc.newsletter.getPreferences.useQuery();

  // Generate newsletter mutation
  const generateMutation = trpc.newsletter.generateNewsletter.useMutation({
    onError: (error) => {
      setIsGenerating(false);
      console.error('Generation error:', error);
    },
  });

  // Load preferences on mount
  useEffect(() => {
    if (preferences) {
      if (preferences.topics) {
        try {
          setTopics(JSON.parse(preferences.topics));
        } catch (e) {
          // Fallback to default
        }
      }
      if (preferences.tone) setTone(preferences.tone as any);
      if (preferences.contentLength) setContentLength(preferences.contentLength as any);
      if (preferences.newsSourcePreference) setNewsSource(preferences.newsSourcePreference);
      if (preferences.personalizationLevel) setPersonalizationLevel(preferences.personalizationLevel);
    }
  }, [preferences]);

  const handleAddTopic = () => {
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
      setTopicInput('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const handleGenerate = async () => {
      console.log('handleGenerate fired', { topics, tone, contentLength });
      if (topics.length === 0) {
        alert('Please add at least one topic');
        return;
      }

      setIsGenerating(true);
      try {
        const data = await generateMutation.mutateAsync({
          topics,
          tone,
          contentLength,
          newsSourcePreference: newsSource,
          personalizationLevel,
          language,
        });
        console.log('mutateAsync result', data);
        onGenerationStart?.(data.executionId);
      } catch (error) {
        console.error('mutation failed', error);
        alert('Failed to generate newsletter – see console');
      } finally {
        setIsGenerating(false);
      }
    };

  const toneDescriptions = {
    professional: 'Formal, business-appropriate tone',
    casual: 'Friendly, conversational tone',
    technical: 'In-depth technical explanations',
  };

  const lengthDescriptions = {
    short: '~500 words - Quick overview',
    medium: '~1000 words - Balanced coverage',
    long: '~2000 words - Comprehensive analysis',
  };

  return (
    <div className="w-full space-y-6">
      {/* Main Generator Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <CardTitle>Newsletter Generator</CardTitle>
              <CardDescription>Customize your newsletter parameters</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Topics Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Topics</Label>
            <p className="text-sm text-gray-600">What topics should your newsletter cover?</p>
            <div className="flex gap-2">
              <Input
                placeholder="Add a topic (e.g., AI, Machine Learning)"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddTopic} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => (
                <Badge
                  key={topic}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100"
                  onClick={() => handleRemoveTopic(topic)}
                >
                  {topic} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tone</Label>
            <p className="text-sm text-gray-600">How should the newsletter sound?</p>
            <Select value={tone} onValueChange={(value: any) => setTone(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{toneDescriptions[tone]}</p>
          </div>

          {/* Content Length Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Content Length</Label>
            <p className="text-sm text-gray-600">How detailed should the content be?</p>
            <Select value={contentLength} onValueChange={(value: any) => setContentLength(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{lengthDescriptions[contentLength]}</p>
          </div>

          {/* News Source Preference */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">News Source Preference</Label>
            <p className="text-sm text-gray-600">Which sources should we prioritize?</p>
            <Select value={newsSource} onValueChange={setNewsSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology News</SelectItem>
                <SelectItem value="business">Business News</SelectItem>
                <SelectItem value="general">General News</SelectItem>
                <SelectItem value="mixed">Mixed Sources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Language</Label>
            <p className="text-sm text-gray-600">Which language should the newsletter be in?</p>
            <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English Only</SelectItem>
                <SelectItem value="hindi">Hindi Only</SelectItem>
                <SelectItem value="bilingual">English & Hindi (Bilingual)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              {language === 'bilingual' ? 'Content will be presented in both languages side by side' : `Content will be in ${language} only`}
            </p>
          </div>

          {/* Personalization Level Slider */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Personalization Level</Label>
            <p className="text-sm text-gray-600">How personalized should the content be?</p>
            <div className="space-y-2">
              <Slider
                value={[personalizationLevel]}
                onValueChange={(value) => setPersonalizationLevel(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Generic</span>
                <span className="font-semibold text-blue-600">{personalizationLevel}/10</span>
                <span>Highly Personalized</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || topics.length === 0}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Newsletter...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Newsletter
              </>
            )}
          </Button>

          {generateMutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              Error: {generateMutation.error.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Settings className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-semibold text-sm text-blue-900">How it works</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>✓ AI agents research and gather relevant news</li>
                <li>✓ Content is analyzed and summarized</li>
                <li>✓ Personalized newsletter is generated</li>
                <li>✓ Quality checks ensure accuracy</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewsletterGenerator;
