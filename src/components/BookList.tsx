"use client";

import type { Book } from "@/lib/kobo";

interface Props {
  books: Book[];
  selectedId: string | null;
  onSelect: (book: Book) => void;
}

export default function BookList({ books, selectedId, onSelect }: Props) {
  if (books.length === 0) {
    return (
      <p className="text-sm font-mono text-stone-400 uppercase tracking-widest px-3 py-4">
        no highlights
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-0 divide-y divide-stone-200">
      {books.map((book) => (
        <li key={book.id}>
          <button
            onClick={() => onSelect(book)}
            className={`cursor-pointer w-full text-left px-3 py-3 font-mono text-sm transition-colors ${
              selectedId === book.id
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-stone-100"
            }`}
          >
            <div className="font-medium truncate">{book.title}</div>
            <div className="text-xs mt-0.5 opacity-60 truncate">{book.author}</div>
            <div className="text-xs mt-1 opacity-40">
              {book.highlightCount} highlight{book.highlightCount !== 1 ? "s" : ""}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
