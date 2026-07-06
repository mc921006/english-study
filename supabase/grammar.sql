create table if not exists public.grammar (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  example text not null,
  example_meaning text not null,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  order_index int not null default 0,
  created_at timestamp with time zone default now()
);

create index if not exists grammar_cefr_level_order_index_idx
  on public.grammar (cefr_level, order_index);

create table if not exists public.grammar_quizzes (
  id uuid primary key default gen_random_uuid(),
  grammar_id uuid not null references public.grammar(id) on delete cascade,
  question text not null,
  options jsonb not null,
  answer text not null,
  explanation text,
  cefr_level text not null check (cefr_level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  created_at timestamp with time zone default now()
);

create index if not exists grammar_quizzes_grammar_id_idx
  on public.grammar_quizzes (grammar_id);
