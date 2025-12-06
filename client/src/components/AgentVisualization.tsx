import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertCircle, Loader2, Target, Lock } from 'lucide-react';

export interface AgentStep {
  stepNumber: number;
  agentName: string;
  taskDescription: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: any;
  output?: any;
  error?: string;
}

export interface AgentState {
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  goal: string;
  constraints: string[];
  steps: AgentStep[];
  result?: string;
  error?: string;
}

interface AgentVisualizationProps {
  state: AgentState;
  isLive?: boolean;
}

const AgentVisualization: React.FC<AgentVisualizationProps> = ({ state, isLive = false }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'running':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const completedSteps = state.steps.filter(s => s.status === 'completed').length;
  const totalSteps = state.steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <div className="w-full space-y-4">
      {/* Header with execution status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle>Agent Execution</CardTitle>
                <CardDescription>Real-time workflow visualization</CardDescription>
              </div>
            </div>
            <Badge variant={getStatusBadgeVariant(state.status)}>
              {state.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Goal */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Goal</p>
                <p className="text-sm text-gray-600">{state.goal}</p>
              </div>
            </div>
          </div>

          {/* Constraints */}
          {state.constraints.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Lock className="w-4 h-4 mt-1 text-amber-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-2">Constraints</p>
                  <div className="flex flex-wrap gap-2">
                    {state.constraints.map((constraint, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {constraint}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold">{completedSteps}/{totalSteps} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Steps Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {state.steps.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No steps executed yet
              </p>
            ) : (
              state.steps.map((step, index) => (
                <div key={index} className={`p-3 rounded-lg border-2 transition-all ${getStatusColor(step.status)}`}>
                  <div className="flex items-start gap-3">
                    {/* Status icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(step.status)}
                    </div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">Step {step.stepNumber}: {step.agentName}</span>
                        <Badge variant={getStatusBadgeVariant(step.status)} className="text-xs">
                          {step.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{step.taskDescription}</p>

                      {/* Input/Output details */}
                      {(step.input || step.output) && (
                        <div className="space-y-1 text-xs">
                          {step.input && (
                            <details className="cursor-pointer">
                              <summary className="font-medium text-gray-700 hover:text-gray-900">
                                Input Details
                              </summary>
                              <pre className="mt-1 p-2 bg-white bg-opacity-50 rounded text-gray-600 overflow-auto max-h-32">
                                {JSON.stringify(step.input, null, 2)}
                              </pre>
                            </details>
                          )}
                          {step.output && (
                            <details className="cursor-pointer">
                              <summary className="font-medium text-gray-700 hover:text-gray-900">
                                Output Details
                              </summary>
                              <pre className="mt-1 p-2 bg-white bg-opacity-50 rounded text-gray-600 overflow-auto max-h-32">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}

                      {/* Error message */}
                      {step.error && (
                        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-xs">
                          Error: {step.error}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connection line to next step */}
                  {index < state.steps.length - 1 && (
                    <div className="ml-2.5 mt-2 h-2 border-l-2 border-gray-300" />
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live indicator */}
      {isLive && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span>Live updates enabled</span>
        </div>
      )}

      {/* Error message if execution failed */}
      {state.status === 'failed' && state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Execution Failed</p>
                <p className="text-sm text-red-700 mt-1">{state.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AgentVisualization;
