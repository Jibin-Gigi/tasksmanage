"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Clock, Flag, HelpCircle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function TakeQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({})
  const [showExplanation, setShowExplanation] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)

  // Mock quiz data
  const quiz = {
    id: params.id,
    title: "Biology 101 - Cell Structure",
    description: "Test your knowledge of cell structure and function",
    questions: [
      {
        id: 1,
        text: "Which of the following organelles is responsible for protein synthesis?",
        options: [
          { id: "a", text: "Mitochondria" },
          { id: "b", text: "Ribosome" },
          { id: "c", text: "Golgi apparatus" },
          { id: "d", text: "Lysosome" },
        ],
        correctAnswer: "b",
        explanation:
          "Ribosomes are responsible for protein synthesis. They can be found floating freely in the cytoplasm or attached to the endoplasmic reticulum.",
      },
      {
        id: 2,
        text: "The cell membrane is composed primarily of:",
        options: [
          { id: "a", text: "Carbohydrates" },
          { id: "b", text: "Proteins" },
          { id: "c", text: "Phospholipids" },
          { id: "d", text: "Nucleic acids" },
        ],
        correctAnswer: "c",
        explanation:
          "The cell membrane is primarily composed of a phospholipid bilayer, which forms a barrier between the cell and its environment.",
      },
      {
        id: 3,
        text: "Which organelle is known as the 'powerhouse of the cell'?",
        options: [
          { id: "a", text: "Nucleus" },
          { id: "b", text: "Endoplasmic reticulum" },
          { id: "c", text: "Mitochondria" },
          { id: "d", text: "Chloroplast" },
        ],
        correctAnswer: "c",
        explanation:
          "Mitochondria are often referred to as the 'powerhouse of the cell' because they generate most of the cell's supply of ATP, which is used as a source of chemical energy.",
      },
      {
        id: 4,
        text: "Which of the following is NOT a function of the cell membrane?",
        options: [
          { id: "a", text: "Regulating what enters and exits the cell" },
          { id: "b", text: "Providing structural support" },
          { id: "c", text: "Protein synthesis" },
          { id: "d", text: "Cell signaling" },
        ],
        correctAnswer: "c",
        explanation:
          "Protein synthesis occurs primarily in the ribosomes, not in the cell membrane. The cell membrane regulates transport, provides support, and participates in cell signaling.",
      },
      {
        id: 5,
        text: "Which organelle contains enzymes for breaking down cellular waste?",
        options: [
          { id: "a", text: "Lysosome" },
          { id: "b", text: "Peroxisome" },
          { id: "c", text: "Vacuole" },
          { id: "d", text: "Golgi apparatus" },
        ],
        correctAnswer: "a",
        explanation:
          "Lysosomes contain digestive enzymes that break down waste materials and cellular debris. They are often referred to as the cell's 'recycling center'.",
      },
    ],
  }

  const totalQuestions = quiz.questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100

  const handleSelectAnswer = (answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerId,
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setShowExplanation(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setShowExplanation(false)
    }
  }

  const handleSubmitQuiz = () => {
    setIsSubmitting(true)

    // Simulate submission process
    setTimeout(() => {
      toast({
        title: "Quiz Submitted",
        description: "Your quiz has been submitted successfully.",
      })
      setIsSubmitting(false)
      router.push(`/quizzes/${params.id}/results`)
    }, 2000)
  }

  const isQuestionAnswered = (questionIndex: number) => {
    return selectedAnswers[questionIndex] !== undefined
  }

  const isCurrentAnswerCorrect = () => {
    const currentQuestionData = quiz.questions[currentQuestion]
    return selectedAnswers[currentQuestion] === currentQuestionData.correctAnswer
  }

  const allQuestionsAnswered = Object.keys(selectedAnswers).length === totalQuestions

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-medium">
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span>No time limit</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{quiz.questions[currentQuestion].text}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedAnswers[currentQuestion]}
              onValueChange={handleSelectAnswer}
              className="space-y-3"
            >
              {quiz.questions[currentQuestion].options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-2 rounded-md border p-3 ${
                    showExplanation && option.id === quiz.questions[currentQuestion].correctAnswer
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : showExplanation &&
                          selectedAnswers[currentQuestion] === option.id &&
                          option.id !== quiz.questions[currentQuestion].correctAnswer
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : ""
                  }`}
                >
                  <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                  <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer font-normal">
                    {option.text}
                  </Label>
                  {showExplanation && option.id === quiz.questions[currentQuestion].correctAnswer && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {showExplanation &&
                    selectedAnswers[currentQuestion] === option.id &&
                    option.id !== quiz.questions[currentQuestion].correctAnswer && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                </div>
              ))}
            </RadioGroup>

            {showExplanation && (
              <div className="mt-4 rounded-md bg-muted p-4">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold">Explanation</h4>
                    <p className="text-sm text-muted-foreground">{quiz.questions[currentQuestion].explanation}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              {!showExplanation && isQuestionAnswered(currentQuestion) && (
                <Button variant="secondary" onClick={() => setShowExplanation(true)}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Show Explanation
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {currentQuestion < totalQuestions - 1 ? (
                <Button onClick={handleNextQuestion} disabled={!isQuestionAnswered(currentQuestion)}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                  <DialogTrigger asChild>
                    <Button disabled={!isQuestionAnswered(currentQuestion)}>
                      <Flag className="mr-2 h-4 w-4" />
                      Finish Quiz
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Quiz</DialogTitle>
                      <DialogDescription>
                        {allQuestionsAnswered
                          ? "You have answered all questions. Are you sure you want to submit your quiz?"
                          : "You haven't answered all questions yet. Do you still want to submit your quiz?"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>Questions answered:</span>
                        <span className="font-medium">
                          {Object.keys(selectedAnswers).length} of {totalQuestions}
                        </span>
                      </div>
                      <Progress
                        value={(Object.keys(selectedAnswers).length / totalQuestions) * 100}
                        className="h-2 mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>Submit Quiz</>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: totalQuestions }).map((_, index) => (
            <Button
              key={index}
              variant={currentQuestion === index ? "default" : isQuestionAnswered(index) ? "secondary" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setCurrentQuestion(index)
                setShowExplanation(false)
              }}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

