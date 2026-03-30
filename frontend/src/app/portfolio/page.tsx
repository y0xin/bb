import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Portfolio } from '@/types';

export default async function PortfolioPage() {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  let projects: Portfolio[] = [];
  
  try {
    const res = await fetch(`${strapiUrl}/api/portfolios?populate=*&sort=createdAt:desc`, { cache: 'no-store' });
    const { data } = await res.json();
    if (data) {
      projects = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        tag: p.tag,
        link: p.link,
        image: p.image?.url ? `${strapiUrl}${p.image.url}` : 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800'
      } as Portfolio));
    }
  } catch (e) {
    console.error('Portfolio fetch error', e);
  }

  return (
    <main className="min-h-screen hero-gradient flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 flex-1">
        <h1 className="text-5xl md:text-7xl font-black mb-4 text-center tracking-tighter text-white">Наше портфолио</h1>
        <p className="text-center text-gray-500 mb-20 font-bold uppercase tracking-widest text-xs">Проекты, которыми мы гордимся</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {projects.map((project) => (
            <div key={project.id} className="glass rounded-[40px] border border-white/5 overflow-hidden group hover:border-blue-500/20 transition-all duration-700 shadow-3xl">
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src={project.image} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-1000 opacity-90 group-hover:opacity-100" 
                  alt={project.title}
                />
                <div className="absolute top-4 left-4 glass px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">{project.tag}</div>
              </div>
              <div className="p-10 space-y-4">
                <h3 className="text-2xl font-black tracking-tight text-white italic">{project.title}</h3>
                <p className="text-gray-400 font-medium leading-relaxed line-clamp-3">{project.description}</p>
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors pt-4"
                  >
                    Смотреть проект <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
