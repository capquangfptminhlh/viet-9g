import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Phone } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

interface MarkdownPostPageProps {
  slug: string;
  config: any;
  onBack: () => void;
  onSearchChange: (q: string) => void;
}

export default function MarkdownPostPage({ slug, config, onBack, onSearchChange }: MarkdownPostPageProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the markdown file from the public folder
    fetch(`/posts/${slug}.md`)
      .then((res) => {
        if (!res.ok) throw new Error('Not Found');
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        setContent('# 404 - Bài viết không tồn tại\nRất tiếc, bài viết bạn tìm kiếm đã bị xóa hoặc không tồn tại trên hệ thống.');
        setLoading(false);
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header
        config={config}
        onOpenSettings={() => {}}
        onOpenAdsGuide={() => {}}
        searchQuery=""
        onSearchChange={onSearchChange}
        onCategorySelect={() => {}}
        selectedCategory="all"
      />

      {/* Mini Top Banner */}
      <div className="bg-[#D71920] text-white text-xs py-3 px-4 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack} 
            className="flex items-center gap-1 hover:underline font-bold text-xs cursor-pointer text-white/90 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại trang chủ
          </button>
          <a href={`tel:${config.supportPhone.replace(/\./g, '')}`} className="flex items-center gap-1 hover:underline font-bold text-xs">
            <Phone className="w-3.5 h-3.5 fill-white" />
            Hotline: {config.supportPhone}
          </a>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full space-y-8">
        <article className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-gray-100 min-h-[50vh]">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D71920]"></div>
            </div>
          ) : (
            <div className="prose prose-sm sm:prose-base prose-red max-w-none">
              {/* This is the invisible SEO block that prerender will inject into */}
              <div id="markdown-seo-content" className="hidden"></div>
              
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-6" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-xl font-bold text-gray-800 mt-8 mb-4 border-b pb-2 border-gray-100" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-lg font-bold text-gray-800 mt-6 mb-3" {...props} />,
                  p: ({node, ...props}) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-2" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 text-gray-700 space-y-2" {...props} />,
                  li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                  a: ({node, ...props}) => <a className="text-[#D71920] hover:underline font-bold" {...props} />,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </article>

        {/* Back Button bottom */}
        <div className="text-center pb-8">
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-800 text-white text-xs font-bold rounded-full hover:bg-gray-900 shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            QUAY LẠI TRANG CHỦ TRACUUGOICUOC.COM
          </button>
        </div>
      </main>

      <Footer config={config} onOpenPolicy={() => {}} />
    </div>
  );
}
