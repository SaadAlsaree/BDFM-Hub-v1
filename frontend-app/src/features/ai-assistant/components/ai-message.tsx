'use client';

import { ThreadPrimitive, MessagePrimitive } from '@assistant-ui/react';
import { BotIcon, UserIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

function UserMessageComponent() {
  return (
    <div className='bg-background flex gap-3 px-4 py-6' dir='rtl'>
      <div className='bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg select-none'>
        <UserIcon className='h-4 w-4' />
      </div>
      <div className='flex-1 space-y-2 overflow-hidden'>
        <div className='text-sm leading-relaxed break-words whitespace-pre-wrap'>
          <MessagePrimitive.Content />
        </div>
      </div>
    </div>
  );
}

function AssistantMessageComponent() {
  return (
    <div className='bg-muted/30 flex gap-3 px-4 py-6' dir='rtl'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 text-white select-none'>
        <BotIcon className='h-4 w-4' />
      </div>
      <div className='flex-1 space-y-2 overflow-hidden'>
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => (
              <div className='prose prose-sm prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-strong:font-bold prose-table:my-4 dark:prose-invert prose-strong:text-primary max-w-none'>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    // Customize tables
                    table: ({ children }) => (
                      <div className='my-4 w-full overflow-x-auto rounded-lg border'>
                        <table className='w-full border-collapse text-sm'>
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className='bg-muted/50'>{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className='divide-y'>{children}</tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className='hover:bg-muted/30 border-b transition-colors'>
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className='border-b px-4 py-3 text-right font-semibold [&:has([align=center])]:text-center [&:has([align=right])]:text-left'>
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className='px-4 py-3 text-right align-top [&:has([align=center])]:text-center [&:has([align=right])]:text-left'>
                        {children}
                      </td>
                    ),
                    // Customize list items
                    li: ({ children }) => (
                      <li className='mr-4 text-sm leading-relaxed'>
                        {children}
                      </li>
                    ),
                    // Customize paragraphs
                    p: ({ children }) => (
                      <p className='text-foreground text-sm leading-relaxed'>
                        {children}
                      </p>
                    ),
                    // Customize strong/bold text
                    strong: ({ children }) => (
                      <span className='text-foreground font-semibold'>
                        {children}
                      </span>
                    ),
                    // Customize links
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className='text-primary underline-offset-2 hover:underline'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {children}
                      </a>
                    ),
                    // Customize code blocks
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className='bg-muted rounded px-1.5 py-0.5 text-sm'>
                            {children}
                          </code>
                        );
                      }
                      return <code className={className}>{children}</code>;
                    },
                    // Handle line breaks
                    br: () => <br />
                  }}
                >
                  {text}
                </ReactMarkdown>
              </div>
            )
          }}
        />
      </div>
    </div>
  );
}

export function AiMessageList() {
  return (
    <ScrollArea className='h-full w-full'>
      <div className='flex flex-col'>
        <ThreadPrimitive.Messages
          components={{
            UserMessage: UserMessageComponent,
            AssistantMessage: AssistantMessageComponent
          }}
        />
      </div>
    </ScrollArea>
  );
}
