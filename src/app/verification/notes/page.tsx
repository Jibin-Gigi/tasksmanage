import Link from "next/link"
import { FileText, Plus, Search, Filter, MoreVertical, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function NotesPage() {
  // Mock data for notes
  const notes = [
    {
      id: 1,
      title: "Biology 101 - Cell Structure",
      description: "Notes on cell structure and function from Chapter 3",
      date: "2025-03-15",
      tags: ["biology", "science", "cells"],
      wordCount: 1250,
    },
    {
      id: 2,
      title: "History - World War II",
      description: "Lecture notes on the causes and major events of WWII",
      date: "2025-03-10",
      tags: ["history", "war", "europe"],
      wordCount: 2340,
    },
    {
      id: 3,
      title: "Computer Science - Algorithms",
      description: "Notes on sorting algorithms and time complexity",
      date: "2025-03-05",
      tags: ["computer science", "algorithms", "programming"],
      wordCount: 1820,
    },
    {
      id: 4,
      title: "Psychology - Cognitive Development",
      description: "Piaget's theory of cognitive development stages",
      date: "2025-02-28",
      tags: ["psychology", "development", "cognition"],
      wordCount: 1650,
    },
    {
      id: 5,
      title: "Mathematics - Calculus",
      description: "Notes on derivatives and integrals from Chapter 5",
      date: "2025-02-20",
      tags: ["math", "calculus", "functions"],
      wordCount: 1430,
    },
    {
      id: 6,
      title: "Literature - Shakespeare",
      description: "Analysis of themes in Hamlet and Macbeth",
      date: "2025-02-15",
      tags: ["literature", "shakespeare", "plays"],
      wordCount: 2100,
    },
  ]

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
          <p className="text-muted-foreground mt-1">Manage your uploaded notes and generate quizzes</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/notes/upload">
            <Plus className="mr-2 h-4 w-4" /> Upload New Notes
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search notes..." className="pl-8" />
        </div>
        <Button variant="outline" className="flex gap-2">
          <Filter className="h-4 w-4" /> Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{note.title}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="-mr-2">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href={`/notes/${note.id}`} className="flex w-full">
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/notes/${note.id}/edit`} className="flex w-full">
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/notes/${note.id}/generate-quiz`} className="flex w-full">
                        Generate Quiz
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>{note.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-2">
                {note.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <FileText className="mr-1 h-4 w-4" />
                <span>{note.wordCount} words</span>
              </div>
            </CardContent>
            <CardFooter className="pt-3 flex justify-between">
              <div className="text-sm text-muted-foreground">
                Uploaded on {new Date(note.date).toLocaleDateString()}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/notes/${note.id}/generate-quiz`}>Generate Quiz</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

