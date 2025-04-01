import Link from "next/link"
import { CheckCircle, Clock, Search, Filter, MoreVertical, Play, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export default function QuizzesPage() {
  // Mock data for quizzes
  const quizzes = [
    {
      id: 1,
      title: "Biology 101 - Cell Structure",
      description: "Test your knowledge of cell structure and function",
      source: "Notes",
      questionCount: 15,
      createdDate: "2025-03-15",
      status: "not-started",
      tags: ["biology", "science", "cells"],
    },
    {
      id: 2,
      title: "World War II - Major Events",
      description: "Quiz on the causes and major events of WWII",
      source: "Notes",
      questionCount: 20,
      createdDate: "2025-03-10",
      status: "in-progress",
      progress: 40,
      tags: ["history", "war", "europe"],
    },
    {
      id: 3,
      title: "Computer Science - Algorithms",
      description: "Test your knowledge of sorting algorithms",
      source: "Task",
      questionCount: 10,
      createdDate: "2025-03-05",
      status: "completed",
      score: 85,
      tags: ["computer science", "algorithms", "programming"],
    },
    {
      id: 4,
      title: "Psychology - Cognitive Development",
      description: "Quiz on Piaget's theory of cognitive development",
      source: "Notes",
      questionCount: 12,
      createdDate: "2025-02-28",
      status: "completed",
      score: 92,
      tags: ["psychology", "development", "cognition"],
    },
  ]

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Quizzes</h1>
          <p className="text-muted-foreground mt-1">Manage and take your generated quizzes</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search quizzes..." className="pl-8" />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Quizzes</TabsTrigger>
          <TabsTrigger value="not-started">Not Started</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{quiz.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/quizzes/${quiz.id}`} className="flex w-full">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {quiz.status === "completed" && (
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}/results`} className="flex w-full">
                              View Results
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {quiz.status !== "completed" && (
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}/take`} className="flex w-full">
                              Take Quiz
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      Source: {quiz.source}
                    </Badge>
                    <Badge variant="outline">{quiz.questionCount} questions</Badge>
                  </div>

                  {quiz.status === "not-started" && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Not started</span>
                    </div>
                  )}

                  {quiz.status === "in-progress" && (
                    <div className="space-y-2 mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{quiz.progress}%</span>
                      </div>
                      <Progress value={quiz.progress} className="h-2" />
                    </div>
                  )}

                  {quiz.status === "completed" && (
                    <div className="flex items-center text-sm mb-2">
                      <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                      <span className="font-medium">Score: {quiz.score}%</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {quiz.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  {quiz.status === "not-started" && (
                    <Button className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}/take`}>
                        <Play className="mr-2 h-4 w-4" /> Start Quiz
                      </Link>
                    </Button>
                  )}

                  {quiz.status === "in-progress" && (
                    <Button className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}/take`}>
                        <Play className="mr-2 h-4 w-4" /> Continue Quiz
                      </Link>
                    </Button>
                  )}

                  {quiz.status === "completed" && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}/results`}>
                        <BarChart className="mr-2 h-4 w-4" /> View Results
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="not-started">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes
              .filter((quiz) => quiz.status === "not-started")
              .map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">{quiz.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}`} className="flex w-full">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}/take`} className="flex w-full">
                              Take Quiz
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        Source: {quiz.source}
                      </Badge>
                      <Badge variant="outline">{quiz.questionCount} questions</Badge>
                    </div>

                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Clock className="mr-1 h-4 w-4" />
                      <span>Not started</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quiz.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3">
                    <Button className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}/take`}>
                        <Play className="mr-2 h-4 w-4" /> Start Quiz
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="in-progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes
              .filter((quiz) => quiz.status === "in-progress")
              .map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">{quiz.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}`} className="flex w-full">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}/take`} className="flex w-full">
                              Continue Quiz
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        Source: {quiz.source}
                      </Badge>
                      <Badge variant="outline">{quiz.questionCount} questions</Badge>
                    </div>

                    <div className="space-y-2 mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{quiz.progress}%</span>
                      </div>
                      <Progress value={quiz.progress} className="h-2" />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quiz.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3">
                    <Button className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}/take`}>
                        <Play className="mr-2 h-4 w-4" /> Continue Quiz
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes
              .filter((quiz) => quiz.status === "completed")
              .map((quiz) => (
                <Card key={quiz.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-bold">{quiz.title}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mr-2">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}`} className="flex w-full">
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Link href={`/quizzes/${quiz.id}/results`} className="flex w-full">
                              View Results
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                      >
                        Source: {quiz.source}
                      </Badge>
                      <Badge variant="outline">{quiz.questionCount} questions</Badge>
                    </div>

                    <div className="flex items-center text-sm mb-2">
                      <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                      <span className="font-medium">Score: {quiz.score}%</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {quiz.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-3">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/quizzes/${quiz.id}/results`}>
                        <BarChart className="mr-2 h-4 w-4" /> View Results
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

