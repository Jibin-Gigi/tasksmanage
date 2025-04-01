import Link from "next/link"
import { ArrowRight, BookOpen, FileText, CheckSquare, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Transform Your Notes into Knowledge
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Upload your notes, generate quizzes, and verify your understanding. The smart way to study and learn.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg">
                <Link href="/notes/upload">Upload Notes</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/tasks">Browse Tasks</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">How It Works</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform makes it easy to test your knowledge and verify your understanding
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-2">
                <FileText className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Upload Notes</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Upload your study notes, documents, or text files to our platform
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <BrainCircuit className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Generate Quizzes</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Our AI analyzes your content and creates personalized quizzes
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <CheckSquare className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Verify Knowledge</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Take quizzes, track your progress, and identify areas for improvement
                </p>
              </div>
            </div>
            <Button variant="outline" className="mt-8" asChild>
              <Link href="/how-it-works" className="flex items-center">
                Learn More <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Perfect For</h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                QuizGenius helps a variety of users test and improve their knowledge
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start rounded-lg border p-6">
                <BookOpen className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold">Students</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Create quizzes from lecture notes, textbooks, and study materials to prepare for exams
                </p>
              </div>
              <div className="flex flex-col items-start rounded-lg border p-6">
                <FileText className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold">Professionals</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Test your understanding of work documents, training materials, and industry knowledge
                </p>
              </div>
              <div className="flex flex-col items-start rounded-lg border p-6">
                <CheckSquare className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-bold">Teachers</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Generate quizzes from lesson plans and course materials to assess student understanding
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Test Your Knowledge?
              </h2>
              <p className="mx-auto max-w-[700px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of users who have improved their learning with QuizGenius
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="secondary">
                Get Started for Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

