"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Sidebar from "@/components/Sidebar";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: string | string[]; // Allow single or multiple correct answers
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
}

export default function TaskVerification() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId");
  const category = searchParams.get("category");
  const { user } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [correctAnswerList, setCorrectAnswerList] = useState<string[][]>([]); // New state for storing correct answer lists

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (taskId) {
      fetchTaskAndGenerateQuiz();
    }
  }, [taskId]);

  const fetchTaskAndGenerateQuiz = async () => {
    try {
      if (!taskId) {
        throw new Error("No task ID provided");
      }

      let { data: dailyTask, error: dailyError } = await supabase
        .from("dailies")
        .select("*")
        .eq("id", taskId)
        .single();

      let taskData = null;

      if (dailyTask) {
        taskData = {
          id: dailyTask.id,
          title: dailyTask.title,
          description: dailyTask.description,
          category: dailyTask.category,
        };
      } else {
        const { data: questData, error: questError } = await supabase
          .from("quests")
          .select("*")
          .eq("id", taskId)
          .single();

        if (questData && questData.selected_tasks) {
          const selectedTask = questData.selected_tasks.find(
            (task: any) => task.id === taskId
          );

          if (selectedTask) {
            taskData = {
              id: selectedTask.id,
              title: questData.title,
              description: selectedTask.description,
              category: category || "Quest Task",
            };
          }
        }
      }

      if (!taskData) {
        throw new Error("Task not found");
      }

      setTask(taskData);

      // Generate quiz using Gemini
      const prompt = `Generate 5 multiple choice questions to verify the completion of this task:
        Title: "${taskData.title}"
        Description: "${taskData.description}"
        Category: "${taskData.category}"
        
        Return the response as a JSON array with exactly this structure:
        [
          {
            "question": "Question text here?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "correctAnswer": "The correct option as list (if task is related to workout,mark more than one option as correct answer if it is logically correct or possible )"
          }
        ]
        
        Requirements:
        1. Each question should verify different aspects of task completion
        2. Each question must have exactly 4 options
        3. The correctAnswer must match exactly one of the options (or multiple, if workout related)
        4. Questions should be relevant to the task details. If task is related to workout ask no.of reps completed, no.of sets, area where pain feels etc to find whether the poster is correct or not.
        5. Format as valid JSON that can be parsed`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Invalid AI response");
      }

      try {
        const cleanedText = text
          .replace(/```(json)?\n/g, "")
          .replace(/```/g, "");
        const generatedQuizzes = JSON.parse(cleanedText);
        console.log("Generated Quizzes:", generatedQuizzes);
        if (Array.isArray(generatedQuizzes) && generatedQuizzes.length > 0) {
          setQuizzes(generatedQuizzes);

          const answerLists = generatedQuizzes.map((quiz) => {
            if (Array.isArray(quiz.correctAnswer)) {
              return quiz.correctAnswer;
            } else {
              return [quiz.correctAnswer];
            }
          });
          setCorrectAnswerList(answerLists);
        } else {
          throw new Error("Invalid quiz format from AI");
        }
      } catch (parseError) {
        console.error("Error parsing AI quiz response:", parseError);
        throw new Error("Invalid quiz format from AI");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
      if (task) {
        setQuizzes([
          {
            question: `Did you complete the task: "${task.title}"?`,
            options: [
              "Yes, completed",
              "No, not yet",
              "In progress",
              "Need help",
            ],
            correctAnswer: "Yes, completed",
          },
        ]);
        setCorrectAnswerList([["Yes, completed"]]);
      }
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuiz] = answer;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuiz = () => {
    if (currentQuiz < quizzes.length - 1) {
      setCurrentQuiz(currentQuiz + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = async () => {
    if (!user) {
      console.error("User is not authenticated");
      return; // Handle the case where the user is not logged in
    }

    console.log("User ID:", user?.id);

    let correctCount = 0;
    for (let i = 0; i < quizzes.length; i++) {
      if (correctAnswerList[i].includes(selectedAnswers[i])) {
        correctCount++;
      }
    }

    const percentage = (correctCount / quizzes.length) * 100;
    setScore(percentage);
    setQuizCompleted(true);

    if (percentage >= 60) {
      try {
        const { data: userData, error: userError } = await supabase
          .from("xp_points")
          .select("total_points")
          .eq("id", user?.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
        }

        if (!userData) {
          // Create a new row in xp_points table for the user
          const { error: insertError } = await supabase
            .from("xp_points")
            .insert([{ id: user?.id, total_points: 0 }]); // Initialize with 0 points

          if (insertError) {
            console.error("Error creating new xp_points entry:", insertError);
            return; // Handle the error as needed
          }

          // Fetch the newly created user data
          const { data: newUserData } = await supabase
            .from("xp_points")
            .select("total_points")
            .eq("id", user?.id)
            .single();

          // Proceed with the rest of your logic using newUserData
          const experiencePoints = newUserData?.total_points || 0;
          const newPoints = experiencePoints + 50;

          await supabase
            .from("xp_points")
            .update({ total_points: newPoints })
            .eq("id", user?.id);
        } else {
          const experiencePoints = userData?.total_points || 0;
          const newPoints = experiencePoints + 50;

          await supabase
            .from("xp_points")
            .update({ total_points: newPoints })
            .eq("id", user?.id);
        }
      } catch (error) {
        console.error("Error updating experience points:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <h1 className="text-4xl font-bold text-violet-100 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-violet-500/20">
                <Trophy className="h-8 w-8 text-violet-400" />
              </div>
              Task Verification
            </h1>
            <p className="text-violet-300/90 mt-2 text-lg">
              Complete the quiz to verify your task completion
            </p>
          </div>

          {/* Quiz Card */}
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-b from-[#0E0529]/80 via-[#030014]/90 to-[#030014]/80 border-violet-500/30 shadow-lg relative overflow-hidden">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#1C133240,transparent_120%)]"></div>

            {!quizCompleted ? (
              <div className="relative z-10">
                <div className="mb-8">
                  <Progress
                    value={((currentQuiz + 1) / quizzes.length) * 100}
                    className="h-2 bg-violet-950/50"
                  />
                  <p className="text-violet-300 mt-2 text-sm">
                    Question {currentQuiz + 1} of {quizzes.length}
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white">
                    {quizzes[currentQuiz]?.question}
                  </h3>
                  <div className="space-y-4">
                    {quizzes[currentQuiz]?.options.map((option, index) => (
                      <Button
                        key={index}
                        variant={
                          selectedAnswers[currentQuiz] === option
                            ? "secondary"
                            : "outline"
                        }
                        className={`w-full p-4 text-left justify-start transition-all duration-300 ${
                          selectedAnswers[currentQuiz] === option
                            ? "bg-violet-600 border-violet-400 text-white font-medium"
                            : "bg-violet-900/60 hover:bg-violet-800 border-violet-400/50 text-white hover:text-white"
                        }`}
                        onClick={() => handleAnswerSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="w-full mt-6 bg-violet-600 hover:bg-violet-700 transition-all duration-300 py-6 text-white font-medium"
                    onClick={handleNextQuiz}
                    disabled={!selectedAnswers[currentQuiz]}
                  >
                    {currentQuiz === quizzes.length - 1
                      ? "Complete Verification"
                      : "Next Question"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6 relative z-10">
                {score >= 60 ? (
                  <>
                    <Trophy className="h-20 w-20 text-yellow-500 mx-auto animate-bounce" />
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-violet-100">
                        Congratulations!
                      </h2>
                      <p className="text-xl text-violet-300">
                        You scored {score.toFixed(1)}% and earned 50 experience
                        points!
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-20 w-20 text-red-500 mx-auto" />
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-violet-100">
                        Keep Practicing!
                      </h2>
                      <p className="text-xl text-violet-300">
                        You scored {score.toFixed(1)}%. You need 60% to earn
                        experience points.
                      </p>
                    </div>
                  </>
                )}
                <Button
                  className="mt-8 bg-violet-600 hover:bg-violet-700 transition-all duration-300 py-6 px-8 text-black font-medium"
                  onClick={() => (window.location.href = "/tasks")}
                >
                  Return to Tasks
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
