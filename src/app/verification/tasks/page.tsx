import Link from "next/link"
import { CheckCircle, Clock, Filter, Search, MoreVertical, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function TasksPage() {
  // Mock data for tasks
  const tasks = [
    {
      id: 1,
      title: "Biology - Photosynthesis",
      description: "Learn about the process of photosynthesis in plants",
      category: "Science",
      difficulty: "Medium",
      estimatedTime: "45 min",
      tags: ["biology", "plants", "energy"],
      status: "available",
    },
    {
      id: 2,
      title: "History - Ancient Rome",
      description: "Study the rise and fall of the Roman Empire",
      category: "History",
      difficulty: "Hard",
      estimatedTime: "60 min",
      tags: ["history", "rome", "empire"],
      status: "available",
    },
    {
      id: 3,
      title: "Mathematics - Algebra Basics",
      description: "Review fundamental algebraic equations and operations",
      category: "Mathematics",
      difficulty: "Easy",
      estimatedTime: "30 min",
      tags: ["math", "algebra", "equations"],
      status: "available",
    },
    {
      id: 4,
      title: "Computer Science - Algorithms",
      description: "Learn about sorting algorithms and their time complexity",
      category: "Computer Science",
      difficulty: "Hard",
      estimatedTime: "90 min",
      tags: ["programming", "algorithms", "sorting"],
      status: "available",
    },
    {
      id: 5,
      title: "Literature - Shakespeare",
      description: "Analyze themes in Shakespeare's Hamlet",
      category: "Literature",
      difficulty: "Medium",
      estimatedTime: "60 min",
      tags: ["literature", "shakespeare", "plays"],
      status: "available",
    },
    {
      id: 6,
      title: "Physics - Newton's Laws",
      description: "Study Newton's three laws of motion and their applications",
      category: "Science",
      difficulty: "Medium",
      estimatedTime: "45 min",
      tags: ["physics", "motion", "forces"],
      status: "available",
    },
  ]

  // Mock data for completed tasks
  const completedTasks = [
    {
      id: 101,
      title: "Chemistry - Periodic Table",
      description: "Learn about elements and their properties",
      category: "Science",
      difficulty: "Medium",
      completedDate: "2025-03-15",
      score: "85%",
      tags: ["chemistry", "elements", "science"],
      status: "completed",
    },
    {
      id: 102,
      title: "Geography - World Capitals",
      description: "Memorize capital cities of countries around the world",
      category: "Geography",
      difficulty: "Easy",
      completedDate: "2025-03-10",
      score: "92%",
      tags: ["geography", "capitals", "countries"],
      status: "completed",
    },
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">Browse available tasks and generate quizzes</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search tasks..." className="pl-8" />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <Tabs defaultValue="available" className="mb-8">
        <TabsList>
          <TabsTrigger value="available">Available Tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="available">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{task.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-2">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Link href={`/tasks/${task.id}`} className="flex w-full">
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Link href={`/tasks/${task.id}/generate-quiz`} className="flex w-full">
                            Generate Quiz
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>{task.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {task.category}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{task.estimatedTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button className="w-full" asChild>
                    <Link href={`/tasks/${task.id}/generate-quiz`}>
                      <BrainCircuit className="mr-2 h-4 w-4" /> Generate Quiz
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold">{task.title}</CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    >
                      {task.score}
                    </Badge>
                  </div>
                  <CardDescription>{task.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                      {task.difficulty}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      {task.category}
                    </Badge>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                    <span>Completed on {new Date(task.completedDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/tasks/${task.id}/results`}>View Results</Link>
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

