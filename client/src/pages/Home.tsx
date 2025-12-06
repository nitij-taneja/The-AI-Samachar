import React from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Brain, Sparkles, BarChart3, Workflow, Mail, ArrowRight, Github } from 'lucide-react';
import { useLocation } from 'wouter';
import { getLoginUrl } from '@/const';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Brain,
      title: 'Agentic AI Framework',
      description: 'Multi-agent system that orchestrates research, analysis, and content generation',
    },
    {
      icon: Workflow,
      title: 'Real-time Visualization',
      description: 'Watch AI agents work step-by-step with live execution monitoring',
    },
    {
      icon: Sparkles,
      title: 'Personalization',
      description: 'Customize tone, length, topics, and personalization level',
    },
    {
      icon: Mail,
      title: 'Smart Content',
      description: 'AI-powered newsletter generation with quality checks',
    },
    {
      icon: BarChart3,
      title: 'Execution Insights',
      description: 'Track agent performance and execution metrics',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized pipeline for rapid newsletter generation',
    },
  ];

  const agents = [
    { name: 'ResearchAgent', task: 'Gather relevant news and articles' },
    { name: 'AnalysisAgent', task: 'Analyze and summarize content' },
    { name: 'ContentGenerationAgent', task: 'Generate personalized content' },
    { name: 'FormattingAgent', task: 'Format and polish newsletter' },
    { name: 'QualityAgent', task: 'Perform quality checks' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-blue-800/30 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-bold text-white">AI Newsletter Agent</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-300">Welcome, {user?.name}</span>
                  <Button onClick={() => setLocation('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                    Dashboard
                  </Button>
                </>
              ) : (
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <a href={getLoginUrl()}>Sign In</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <Badge className="inline-block bg-blue-500/20 text-blue-300 border-blue-500/50">
            Powered by Agentic AI
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            AI-Powered Newsletter<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Generation Engine
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of content automation. Watch intelligent agents collaborate in real-time to create personalized newsletters tailored to your interests.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => setLocation('/dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8"
              >
                <a href={getLoginUrl()}>
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="border-blue-500/50 text-blue-300 hover:bg-blue-500/10"
              asChild
            >
              <a href="#features">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-lg">Everything you need for intelligent newsletter generation</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="bg-slate-800/50 border-blue-500/20 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                <CardHeader>
                  <Icon className="w-8 h-8 text-blue-400 mb-2" />
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Agent System Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Multi-Agent Architecture</h2>
          <p className="text-gray-400 text-lg">Specialized agents working together seamlessly</p>
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {agents.map((agent, idx) => (
            <div key={idx} className="relative">
              <Card className="bg-slate-800/50 border-blue-500/20 h-full">
                <CardHeader>
                  <CardTitle className="text-base text-blue-400">{agent.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-400">{agent.task}</p>
                </CardContent>
              </Card>
              {idx < agents.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Customize', desc: 'Set your preferences and topics' },
            { step: '2', title: 'Execute', desc: 'Agents start researching' },
            { step: '3', title: 'Monitor', desc: 'Watch real-time progress' },
            { step: '4', title: 'Deliver', desc: 'Get your newsletter' },
          ].map((item, idx) => (
            <div key={idx} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold mb-4">
                {item.step}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="bg-gradient-to-r from-blue-600 to-cyan-600 border-0">
          <CardContent className="pt-12 pb-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Newsletter?</h2>
            <p className="text-blue-100 mb-8 text-lg">
              Experience the power of agentic AI for content generation
            </p>
            {isAuthenticated ? (
              <Button
                size="lg"
                onClick={() => setLocation('/dashboard')}
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            ) : (
              <Button
                size="lg"
                asChild
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <a href={getLoginUrl()}>
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-blue-800/30 bg-slate-900/50 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400">AI Newsletter Agent</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built with React, TypeScript, and agentic AI frameworks
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
