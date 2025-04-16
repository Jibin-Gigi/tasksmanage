"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  Download,
  Share2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
//import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function QuizResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  // Mock quiz result data
  const quizResult = {
    id: params.id,
    title: "Biology 101 - Cell Structure",
    description: "Test your knowledge of cell structure and function",
    score: 80,
    totalQuestions: 5,
    correctAnswers: 4,
    incorrectAnswers: 1,
    timeTaken: "8 minutes",
    completedDate: "2025-03-20",
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
        userAnswer: "b",
        isCorrect: true,
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
        userAnswer: "c",
        isCorrect: true,
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
        userAnswer: "c",
        isCorrect: true,
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
        userAnswer: "c",
        isCorrect: true,
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
        userAnswer: "b",
        isCorrect: false,
        explanation:
          "Lysosomes contain digestive enzymes that break down waste materials and cellular debris. They are often referred to as the cell's 'recycling center'.",
      },
    ],
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/quizzes")}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back to quizzes</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {quizResult.title}
            </h1>
            <p className="text-muted-foreground">{quizResult.description}</p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>
              Completed on{" "}
              {new Date(quizResult.completedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-5xl font-bold mb-2">
                  {quizResult.score}%
                </div>
                <p className="text-muted-foreground">
                  You answered {quizResult.correctAnswers} out of{" "}
                  {quizResult.totalQuestions} questions correctly
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {quizResult.correctAnswers}
                    </div>
                    <p className="text-sm text-muted-foreground">Correct</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {quizResult.incorrectAnswers}
                    </div>
                    <p className="text-sm text-muted-foreground">Incorrect</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold">
                      {quizResult.timeTaken}
                    </div>
                    <p className="text-sm text-muted-foreground">Time Taken</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/quizzes/${params.id}/take`}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Link>
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Results
              </Button>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share Results
              </Button>
            </div>
          </CardFooter>
        </Card>

        <h2 className="text-2xl font-bold mb-4">Question Review</h2>
        {/* <Accordion type="single" collapsible className="space-y-4">
          {quizResult.questions.map((question, index) => (
            <AccordionItem key={question.id} value={`question-${question.id}`} className="border rounded-lg">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center text-left">
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      question.isCorrect
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {question.isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Question {index + 1}</span>
                    <h3 className="font-medium">{question.text}</h3>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`flex items-center space-x-2 rounded-md border p-3 ${
                          option.id === question.correctAnswer
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : option.id === question.userAnswer && option.id !== question.correctAnswer
                              ? "border-red-500 bg-red-50 dark:bg-red-950"
                              : ""
                        }`}
                      >
                        <div className="flex-1">{option.text}</div>
                        {option.id === question.correctAnswer && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {option.id === question.userAnswer && option.id !== question.correctAnswer && (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-md bg-muted p-4">
                    <div className="flex items-start gap-2">
                      <div>
                        <h4 className="font-semibold">Explanation</h4>
                        <p className="text-sm text-muted-foreground">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion> */}
      </div>
    </div>
  );
}
