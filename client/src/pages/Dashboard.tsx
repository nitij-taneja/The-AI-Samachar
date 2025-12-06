import React, { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Mail, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import NewsletterGenerator from '@/components/NewsletterGenerator';
import AgentVisualization, { AgentState, AgentStep } from '@/components/AgentVisualization';
import { trpc } from '@/lib/trpc';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('generate');
  const [latestNewsletterId, setLatestNewsletterId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Email mutation and form state
  const sendMutation = trpc.newsletter.sendNewsletter.useMutation();
  const [selectedNewsletter, setSelectedNewsletter] = useState<number | null>(null);
  const [emailTo, setEmailTo] = useState('');
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');

  // PDF generation
  const pdfMutation = trpc.newsletter.generatePDF.useMutation();

  // Get execution status
  const { data: executionStatus, isLoading: statusLoading } = trpc.newsletter.getExecutionStatus.useQuery(
    { executionId: executionId || '' },
    { enabled: !!executionId, refetchInterval: 1000 }
  );

  // Get user's newsletters
  const { data: newsletters, isLoading: newslettersLoading, refetch: refetchNewsletters } = trpc.newsletter.getNewsletters.useQuery(
    { limit: 10 },
    {
      refetchOnWindowFocus: false,
      staleTime: 0, // Don't cache
    }
  );

  // Debug newsletter data
  useEffect(() => {
    if (newsletters) {
      console.log('Newsletter query success:', newsletters?.length, 'newsletters, newest:', newsletters?.[0]?.title, newsletters?.[0]?.createdAt);
    }
  }, [newsletters]);

  // Update agent state when execution status changes
  useEffect(() => {
    if (executionStatus && executionId) {
      const steps: AgentStep[] = (executionStatus.steps || []).map((step: any) => ({
        stepNumber: step.stepNumber,
        agentName: step.agentName,
        taskDescription: step.taskDescription || '',
        status: step.status || 'pending',
        input: step.input,
        output: step.output,
        error: step.error,
      }));
      setAgentState({
        executionId,
        status: executionStatus.status === 'completed' ? 'completed' : executionStatus.status === 'failed' ? 'failed' : 'running',
        goal: 'Generate customized newsletter',
        constraints: [],
        steps,
      });
      setIsLiveUpdating(executionStatus.status === 'running' || executionStatus.status === 'pending');
    }
  }, [executionStatus, executionId]);

  // Stop live updates when execution completes
  useEffect(() => {
    if (agentState && agentState.status === 'completed') {
      setIsLiveUpdating(false);
    }
  }, [agentState?.status]);

  // Invalidate newsletter query when we detect a new newsletter might be available
  // This happens when execution status changes from running to completed
  useEffect(() => {
    if (executionStatus && executionStatus.status === 'completed') {
      // Force refetch and invalidate cache
      const timer = setTimeout(async () => {
        await refetchNewsletters();
        queryClient.invalidateQueries({ queryKey: [['newsletter', 'getNewsletters']] });
        // Clear any cached data
        queryClient.removeQueries({ queryKey: [['newsletter', 'getNewsletters']] });

        // After refetch, set the latest newsletter ID for preview/download
        if (newsletters && newsletters.length > 0) {
          setLatestNewsletterId(newsletters[0].id);
          console.log('Latest newsletter set to:', newsletters[0].title, newsletters[0].id);
        }
      }, 2500); // 2.5 second delay to ensure newsletter is saved and query updated

      return () => clearTimeout(timer);
    }
  }, [executionStatus?.status, queryClient, refetchNewsletters, newsletters]);

  const handleAddEmail = () => {
    const email = emailInput.trim();
    if (email && !emailList.includes(email) && email.includes('@')) {
      setEmailList([...emailList, email]);
      setEmailInput('');
    }
  };

  const removeEmail = (email: string) => {
    setEmailList(emailList.filter(e => e !== email));
  };

  const handleSendEmails = async () => {
    if (!selectedNewsletter) return;

    const emailsToSend = emailList.length > 0 ? emailList : [emailTo].filter(Boolean);

    if (emailsToSend.length === 0) return;

    // Send to each email address
    for (const email of emailsToSend) {
      try {
        await sendMutation.mutateAsync({ newsletterId: selectedNewsletter, to: email });
      } catch (error) {
        console.error(`Failed to send to ${email}:`, error);
      }
    }
  };

  const handleDownloadPDF = async (newsletterId: number) => {
    try {
      const result = await pdfMutation.mutateAsync({ newsletterId });
      if (result && result.html) {
        // Create a blob with the HTML content and download it
        const blob = new Blob([result.html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF download failed:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-4">Please log in to access the dashboard</p>
            <Button onClick={() => setLocation('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Newsletter Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome, {user.name || 'User'}</p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </TabsTrigger>
          </TabsList>

          {/* Generate Tab */}
          <TabsContent value="generate" className="space-y-8">
            <NewsletterGenerator
              onGenerationStart={(id) => {
                setExecutionId(id);
                // Initialize agent state immediately for live visualization
                const initialAgentState: AgentState = {
                  executionId: id,
                  status: 'running',
                  goal: `Generate newsletter`,
                  constraints: [
                    `Execution ID: ${id}`,
                  ],
                  steps: [
                    {
                      stepNumber: 1,
                      agentName: 'Research Agent',
                      taskDescription: 'Gathering relevant news and articles',
                      status: 'running',
                      input: { status: 'starting' },
                    },
                    {
                      stepNumber: 2,
                      agentName: 'Financial Data Agent',
                      taskDescription: 'Collecting financial market data',
                      status: 'pending',
                      input: { status: 'waiting' },
                    },
                    {
                      stepNumber: 3,
                      agentName: 'Analysis Agent',
                      taskDescription: 'Analyzing and summarizing content',
                      status: 'pending',
                      input: { status: 'waiting' },
                    },
                    {
                      stepNumber: 4,
                      agentName: 'Content Generation Agent',
                      taskDescription: 'Generating personalized newsletter content',
                      status: 'pending',
                      input: { status: 'waiting' },
                    },
                    {
                      stepNumber: 5,
                      agentName: 'Formatting Agent',
                      taskDescription: 'Formatting and polishing the newsletter',
                      status: 'pending',
                      input: { status: 'waiting' },
                    },
                    {
                      stepNumber: 6,
                      agentName: 'Quality Agent',
                      taskDescription: 'Performing quality checks and validation',
                      status: 'pending',
                      input: { status: 'waiting' },
                    },
                  ],
                };
                setAgentState(initialAgentState);
                setIsLiveUpdating(true);
              }}
              onGenerationComplete={() => {
                // Newsletter query will be invalidated when agent completes
              }}
            />

            {/* Agent Execution Monitor - Moved from separate tab */}
            {agentState && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">AI Agent Execution Monitor</h2>
                    <p className="text-gray-600 mt-1">
                      Watch the AI agents work step-by-step to generate your newsletter
                      {executionId && <span className="ml-2 text-xs">(ID: {executionId.substring(0, 8)}...)</span>}
                    </p>
                  </div>
                  {isLiveUpdating && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Live Generation</span>
                    </div>
                  )}
                  {agentState.status === 'completed' && (
                    <div className="flex items-center gap-2 text-green-600">
                      <div className="w-2 h-2 bg-green-600 rounded-full" />
                      <span className="text-sm font-medium">Generation Complete</span>
                    </div>
                  )}
                </div>

                <AgentVisualization state={agentState} isLive={isLiveUpdating} />

                {statusLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                    <span className="text-gray-600">Updating agent status...</span>
                  </div>
                )}

                {/* Download buttons for generated newsletter */}
                {agentState.status === 'completed' && newsletters && newsletters.length > 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-800">Newsletter Generated Successfully!</CardTitle>
                      <CardDescription className="text-green-700">
                        Your newsletter is ready. Download it in your preferred format.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleDownloadPDF(newsletters[0].id)}
                          disabled={pdfMutation.status === 'pending'}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {pdfMutation.status === 'pending' ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Preparing...
                            </>
                          ) : (
                            'Download HTML'
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Open preview window and trigger print dialog for PDF
                            const printWindow = window.open('', '_blank');
                            if (printWindow && newsletters[0].content) {
                              printWindow.document.write(newsletters[0].content);
                              printWindow.document.close();
                              // Wait for content to load then show print dialog
                              setTimeout(() => {
                                printWindow.print();
                              }, 500);
                            }
                          }}
                        >
                          Download PDF (Print)
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const previewWindow = window.open('', '_blank');
                            if (previewWindow && newsletters[0].content) {
                              previewWindow.document.write(newsletters[0].content);
                              previewWindow.document.close();
                            }
                          }}
                        >
                          Preview Newsletter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Newsletter History</h2>
                <p className="text-gray-600 mt-1">Your previously generated newsletters</p>
              </div>
              <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: [['newsletter', 'getNewsletters']] })}>
                <ArrowLeft className="w-4 h-4 mr-2 rotate-180" />
                Refresh
              </Button>
            </div>

            {newslettersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                <span className="text-gray-600">Loading newsletters...</span>
              </div>
            ) : newsletters && newsletters.length > 0 ? (
              <div className="space-y-4">
                {newsletters.map((newsletter) => (
                  <Card key={newsletter.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{newsletter.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Created on {new Date(newsletter.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(newsletter.id)}
                            disabled={pdfMutation.status === 'pending'}
                          >
                            {pdfMutation.status === 'pending' ? 'Downloading...' : 'Download HTML'}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {newsletter.summary && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Summary</h4>
                            <p className="text-sm text-gray-600">{newsletter.summary}</p>
                          </div>
                        )}
                        {newsletter.topics && (
                          <div>
                            <h4 className="font-semibold text-sm mb-1">Topics</h4>
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(newsletter.topics).map((topic: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-gray-600 text-center py-8">
                    No newsletters generated yet. Generate your first newsletter to see it here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Send Newsletter via Email</h2>
            <div className="space-y-4">
              <Label>Select Newsletter</Label>
              <Select value={String(selectedNewsletter ?? '')} onValueChange={(v) => setSelectedNewsletter(Number(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose…" />
                </SelectTrigger>
                <SelectContent>
                  {newsletters?.map((nl) => (
                    <SelectItem key={nl.id} value={String(nl.id)}>
                      {nl.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label>Add Recipient Emails</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="user@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
                  />
                  <Button type="button" onClick={handleAddEmail} variant="outline">
                    Add
                  </Button>
                </div>
                {emailList.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {emailList.map((email, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeEmail(email)}
                      >
                        {email} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Or Send to Single Email</Label>
                <Input
                  placeholder="single@example.com"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                />
              </div>

              <Button
                onClick={handleSendEmails}
                disabled={sendMutation.status !== 'idle' || !selectedNewsletter || (emailList.length === 0 && !emailTo)}
              >
                {sendMutation.status === 'pending' ? 'Sending...' : `Send Newsletter${emailList.length > 1 ? ` to ${emailList.length} recipients` : ''}`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
