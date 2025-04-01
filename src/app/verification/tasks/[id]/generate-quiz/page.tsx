"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BrainCircuit, Settings, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function GenerateQuizFromTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

  // Quiz generation settings
  const [quizTitle, setQuizTitle] = useState("")
  const [quizType, setQuizType] = useState("multiple-choice")
  const [questionCount, setQuestionCount] = useState(10)
  const [difficulty, setDifficulty] = useState("medium")
  const [includeExplanations, setIncludeExplanations] = useState(true)

  // Mock task data
  const task = {
    id: params.id,
    title: "Biology - Photosynthesis",
    description: "Learn about the process of photosynthesis in plants",
    category: "Science",
    difficulty: "Medium",
    estimatedTime: "45 min",
    tags: ["biology", "plants", "energy"],
    content:
      "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. It is a complex process that converts carbon dioxide and water into glucose and oxygen using energy from sunlight.",
  }

  const handleGenerateQuiz = async () => {
    if (!quizTitle) {
      toast({
        title: "Title Required",
        description: "Please provide a title for your quiz.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Simulate quiz generation process
    setTimeout(() => {
      toast({
        title: "Quiz Generated",
        description: "Your quiz has been generated successfully.",
      })
      setIsGenerating(false)
      router.push(`/quizzes/${Date.now()}`)
    }, 3000)
  }

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Generate Quiz from Task</h1>
        <p className="text-muted-foreground mb-6">Create a quiz based on the selected task</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
            <CardDescription>The quiz will be generated based on this task</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {task.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                >
                  {task.difficulty}
                </Badge>
                <Badge variant="outline">{task.estimatedTime}</Badge>
              </div>
              <div className="rounded-md bg-muted p-4 text-sm">
                <p>{task.content}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
            <CardDescription>Customize your quiz generation options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="quiz-title">Quiz Title</Label>
                <Input
                  id="quiz-title"
                  placeholder="Enter a title for your quiz"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-type">Quiz Type</Label>
                <Select value={quizType} onValueChange={setQuizType}>
                  <SelectTrigger id="quiz-type">
                    <SelectValue placeholder="Select quiz type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="fill-in-blank">Fill in the Blank</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                    <SelectItem value="mixed">Mixed Question Types</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="question-count">Number of Questions</Label>
                  <span className="text-sm text-muted-foreground">{questionCount}</span>
                </div>
                <Slider
                  id="question-count"
                  min={5}
                  max={30}
                  step={1}
                  value={[questionCount]}
                  onValueChange={(value) => setQuestionCount(value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="explanations">Include Explanations</Label>
                  <p className="text-sm text-muted-foreground">Add explanations for correct answers</p>
                </div>
                <Switch id="explanations" checked={includeExplanations} onCheckedChange={setIncludeExplanations} />
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="advanced-settings">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Advanced Settings
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="time-limit">Set Time Limit</Label>
                          <p className="text-sm text-muted-foreground">Limit time for each question</p>
                        </div>
                        <Switch id="time-limit" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="randomize">Randomize Questions</Label>
                          <p className="text-sm text-muted-foreground">Shuffle question order each time</p>
                        </div>
                        <Switch id="randomize" defaultChecked />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push(`/tasks/${params.id}`)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateQuiz} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

