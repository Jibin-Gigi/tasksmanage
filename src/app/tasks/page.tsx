"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Check,
  Trash2,
  Filter,
  Search,
  Calendar,
  Tag,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface DailyTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  streak: number;
  xp: number;
  created_at: string;
  category: string;
  reminder: boolean;
  last_completed: string | null;
  multiplier: number;
}

interface QuestTask {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  xp: number;
  created_at: string;
  selected_tasks: {
    id: string;
    completed: boolean;
    description: string;
  }[];
}

export default function TasksPage() {
  const { user, loading } = useAuth();
  const [dailies, setDailies] = useState<DailyTask[]>([]);
  const [quests, setQuests] = useState<QuestTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [expandedQuests, setExpandedQuests] = useState<string[]>([]); // Move state here

  const toggleQuestExpansion = (questId: string) => {
    // Move function here
    setExpandedQuests((prev) =>
      prev.includes(questId)
        ? prev.filter((id) => id !== questId)
        : [...prev, questId]
    );
  };

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/auth/login";
      return;
    }

    loadTasks();
  }, [user, loading]);

  const loadTasks = async () => {
    try {
      if (!user) return;

      const today = new Date();
      const { data: dailiesData, error: dailiesError } = await supabase
        .from("dailies")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (dailiesError) throw dailiesError;

      // Filter dailies in JavaScript to exclude those completed today
      const todays_tasks = dailiesData?.filter(
        (daily) => new Date(daily.last_completed).getDate() !== today.getDate()
      );

      setDailies(todays_tasks);

      // Fetch quests
      const { data: questsData, error: questsError } = await supabase
        .from("quests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (questsError) throw questsError;
      setQuests(questsData || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleVerifyTask = (taskId: string, category: string) => {
    window.location.href = `/task-verification?taskId=${taskId}&category=${category}`;
  };

  const filteredDailies = dailies.filter(
    (daily) =>
      daily.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      daily.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuests = quests.filter(
    (quest) =>
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <div className="min-h-screen bg-[#030014] text-white p-8 md:pl-20">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-violet-100 flex items-center gap-3">
                <div className="p-3 rounded-xl bg-violet-500/20">
                  <Check className="h-8 w-8 text-violet-400" />
                </div>
                Tasks
              </h1>
              <p className="text-violet-300/90 mt-2 text-lg">
                View and verify your tasks
              </p>
            </div>

            {/* Search */}
            <Card className="mb-6 p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-violet-950/80 border-violet-500/30 focus:border-violet-500/50"
                />
              </div>
            </Card>

            {/* Dailies Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-violet-100 mb-4">
                Daily Tasks
              </h2>
              <div className="space-y-4">
                {filteredDailies.length === 0 ? (
                  <div className="text-center text-lg text-green-500">
                    Your daily tasks have been completed. Good job!
                  </div>
                ) : (
                  filteredDailies.map((daily) => (
                    <Card
                      key={daily.id}
                      className="p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg"
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() =>
                            handleVerifyTask(daily.id, daily.category)
                          }
                          className="mt-1 p-2 rounded-full bg-violet-950/80 text-violet-400 hover:bg-violet-500/20 transition-all duration-300"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-violet-100">
                                {daily.title}
                              </h3>
                              <p className="text-violet-300/90 mt-2">
                                {daily.description}
                              </p>
                            </div>
                            <Badge className="bg-blue-500/30 text-blue-200 border-blue-500/40">
                              XP: {daily.xp}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-green-500/30 text-green-200">
                              Streak: {daily.streak}
                            </Badge>
                            <Badge className="bg-purple-500/30 text-purple-200">
                              {daily.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Quests Section */}
            <div>
              <h2 className="text-2xl font-semibold text-violet-100 mb-4">
                Quests
              </h2>
              <div className="space-y-4">
                {filteredQuests.map((quest) => (
                  <Card
                    key={quest.id}
                    className="p-6 bg-[#0E0529]/80 border-violet-500/30 shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleQuestExpansion(quest.id)}
                        className="mt-1 p-2 rounded-full bg-violet-950/80 text-violet-400 hover:bg-violet-500/20 transition-all duration-300"
                      >
                        {expandedQuests.includes(quest.id) ? "-" : "+"}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-violet-100">
                              {quest.title}
                            </h3>
                            <p className="text-violet-300/90 mt-2">
                              {quest.description}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge className="bg-yellow-500/30 text-yellow-200">
                              XP: {quest.xp}
                            </Badge>
                            <Badge className="bg-red-500/30 text-red-200">
                              {quest.difficulty}
                            </Badge>
                          </div>
                        </div>

                        {expandedQuests.includes(quest.id) && (
                          <div className="mt-6 pl-4 border-l-2 border-violet-500/30 space-y-4">
                            {quest.selected_tasks.map((task, index) => (
                              <div
                                key={task.id}
                                className="flex items-start gap-4"
                              >
                                <button
                                  onClick={() =>
                                    handleVerifyTask(
                                      quest.id,
                                      `quest-task-${index}`
                                    )
                                  }
                                  className="mt-1 p-2 rounded-full bg-violet-950/80 text-violet-400 hover:bg-violet-500/20 transition-all duration-300"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <div>
                                  <p className="text-violet-200">
                                    {task.description}
                                  </p>
                                  {task.completed && (
                                    <Badge className="mt-2 bg-green-500/30 text-green-200">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4">
                          <p className="text-sm text-violet-300/90">
                            {
                              quest.selected_tasks.filter((t) => t.completed)
                                .length
                            }{" "}
                            of {quest.selected_tasks.length} tasks completed
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
