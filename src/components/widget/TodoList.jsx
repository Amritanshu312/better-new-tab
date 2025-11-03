import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Rnd } from "react-rnd";
import { Plus, Trash2, Check } from "lucide-react";

const TodoList = ({
  locked
}) => {

  /* 🎯 Helper: calculate centered position */
  const calculateCenter = () => {
    return {
      x: (window.innerWidth) / 1.32,
      y: (-window.innerHeight) / 1.8,
    };
  };

  /* 💾 Load saved data from localStorage */
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("todoListPosition");
    return saved ? JSON.parse(saved) : calculateCenter();
  });

  const [size, setSize] = useState(() => {
    const saved = localStorage.getItem("todoListSize");
    return saved ? JSON.parse(saved) : defaultSize;
  });

  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem("todoListData");
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [input, setInput] = useState("");

  /* 🧠 Debounced persistence to localStorage */
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("todoListData", JSON.stringify(todos));
    }, 400);
    return () => clearTimeout(timeout);
  }, [todos]);

  /* 🧩 Handlers */
  const handleDragStop = useCallback((e, d) => {
    const newPos = { x: d.x, y: d.y };
    setPosition(newPos);
    localStorage.setItem("todoListPosition", JSON.stringify(newPos));
  }, []);

  const handleResizeStop = useCallback((e, direction, ref, delta, newPos) => {
    const newSize = { width: ref.offsetWidth, height: ref.offsetHeight };
    setSize(newSize);
    setPosition(newPos);
    localStorage.setItem("todoListSize", JSON.stringify(newSize));
    localStorage.setItem("todoListPosition", JSON.stringify(newPos));
  }, []);

  const addTodo = useCallback(() => {
    if (!input.trim()) return;
    setTodos((prev) => [...prev, { id: Date.now(), text: input, done: false }]);
    setInput("");
  }, [input]);

  const toggleDone = useCallback((id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }, []);

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* 🧱 Memoized todo rendering */
  const renderedTodos = useMemo(() => {
    if (todos.length === 0) {
      return (
        <p className="text-gray-400 text-sm text-center mt-6">
          No tasks yet ✨
        </p>
      );
    }

    return todos.map((todo) => (
      <div
        key={todo.id}
        className={`flex justify-between items-start bg-white/10 p-2 rounded-lg transition-all break-words ${todo.done ? "opacity-60" : ""
          }`}
      >
        <div className="flex-1 min-w-0 mr-2">
          <span
            onClick={() => toggleDone(todo.id)}
            className={`block cursor-pointer text-sm whitespace-pre-wrap break-words ${todo.done
              ? "line-through text-gray-400"
              : "text-white"
              }`}
          >
            {todo.text}
          </span>
        </div>
        <div className="flex gap-2 ml-2 shrink-0">
          <button
            onClick={() => toggleDone(todo.id)}
            className="text-green-400 hover:text-green-500"
            aria-label="Mark done"
          >
            <Check size={16} />
          </button>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="text-red-400 hover:text-red-500"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    ));
  }, [todos, toggleDone, deleteTodo]);

  return (
    <Rnd
      size={size}
      position={position}
      onDragStop={!locked ? handleDragStop : undefined}
      onResizeStop={!locked ? handleResizeStop : undefined}
      bounds="window"
      dragHandleClassName={!locked ? "drag-handle" : ""}
      disableDragging={!!locked}
      enableResizing={!locked}
      minWidth={250}
      minHeight={300}
      className={`z-30 will-change-transform transform-gpu ${!!locked ? "pointer-events-auto" : ""}`}
    >
      <div
        className={`backdrop-blur-xl bg-[#1a1a1aaf] text-white font-[Poppins]
                 w-full h-full p-4 rounded-2xl shadow-2xl border border-white/10 
                 cursor-default flex flex-col ${!locked ? "cursor-move" : "cursor-default"
          }`}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center mb-3 select-none ${!locked ? "drag-handle cursor-move" : ""
            }`}
        >
          <h2 className="text-lg font-semibold tracking-wide">📝 Todo List</h2>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="Add new task..."
            className="flex-1 bg-[#00000033] text-white px-3 py-2 rounded-lg text-sm
                   placeholder:text-gray-400 outline-none focus:ring-1 ring-[#ffffff3b] 
                   border border-[#ffffff14]"
          />
          <button
            onClick={addTodo}
            className="px-3 bg-[#111111b3] border border-[#ffffff1b] 
                   rounded-md hover:bg-[#181818b0] transition"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Todo items */}
        <div className="overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-[#444] 
                    scrollbar-track-transparent flex-1 no-scrollbar">
          {renderedTodos}
        </div>
      </div>
    </Rnd>

  );
};

export default TodoList;
