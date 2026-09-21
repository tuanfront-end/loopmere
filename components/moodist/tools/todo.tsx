"use client";

import { Delete02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { ToolPanel } from "../tool-panel";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTodoStore } from "@/stores/todo";

interface TodoProps {
  onClose: () => void;
  show: boolean;
}

export function Todo({ onClose, show }: TodoProps) {
  const [value, setValue] = useState("");

  const todos = useTodoStore((state) => state.todos);
  const doneCount = useTodoStore((state) => state.doneCount());
  const addTodo = useTodoStore((state) => state.addTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const toggleTodo = useTodoStore((state) => state.toggleTodo);
  const editTodo = useTodoStore((state) => state.editTodo);

  return (
    <ToolPanel
      blurb="It lives in this browser and nowhere else."
      show={show}
      title="Checklist"
      onClose={onClose}
    >
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!value.trim().length) return;
          addTodo(value);
          setValue("");
        }}
      >
        <Input
          aria-label="What needs doing"
          placeholder="I have to..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => event.stopPropagation()}
        />
        <Button disabled={!value.trim().length} type="submit">
          Add
        </Button>
      </form>

      <div>
        <div className="flex items-center gap-3">
          <p className="text-xs font-medium">Your list</p>
          <div className="bg-border h-px flex-1" />
          <p className="text-muted-foreground text-xs tabular-nums">
            {doneCount} / {todos.length}
          </p>
        </div>

        {todos.length ? (
          <ul className="divide-border mt-2 divide-y">
            {todos.map((todo) => (
              <li className="flex items-center gap-3 py-3" key={todo.id}>
                <Checkbox
                  aria-label={`Mark ${todo.todo} done`}
                  checked={todo.done}
                  onCheckedChange={() => toggleTodo(todo.id)}
                />

                <input
                  aria-label={`Edit ${todo.todo}`}
                  className={cn(
                    "flex-1 bg-transparent text-sm outline-none",
                    todo.done && "text-muted-foreground line-through",
                  )}
                  value={todo.todo}
                  onChange={(event) => editTodo(todo.id, event.target.value)}
                  onKeyDown={(event) => event.stopPropagation()}
                />

                <Button
                  aria-label={`Delete ${todo.todo}`}
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => deleteTodo(todo.id)}
                >
                  <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            Nothing on the list. Add the first thing above.
          </p>
        )}
      </div>
    </ToolPanel>
  );
}
