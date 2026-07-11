import React, { useState } from 'react';
import Modal from './Modal';
import sfx from '../utils/sfx';
import { translations, translateText } from '../utils/i18n';

const Projects = ({ projects, lang }) => {
  const t = lang === 'tr' ? translations.tr : translations.en;
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  // Normalize categories for filtering
  const categories = ['All', 'Web', 'AI'];

  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.category?.toUpperCase() === activeFilter.toUpperCase());

  // Generate dynamic tech gradient background for mock images
  const getGradient = (index) => {
    const gradients = [
      'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
      'linear-gradient(135deg, #7f00ff 0%, #ff007f 100%)',
      'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)'
    ];
    return gradients[index % gradients.length];
  };

  const isVideo = (url) => {
    if (!url) return false;
    return url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg') || url.startsWith('data:video');
  };

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title font-orbitron text-gradient glitch-hover" data-text={t.projectsTitle}>{t.projectsTitle}</h2>
          <p className="section-subtitle">{t.projectsSubtitle}</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { sfx.playClick(); setActiveFilter(cat); }}
              onMouseEnter={() => sfx.playTick()}
              className={`filter-btn font-mono ${activeFilter === cat ? 'active' : ''}`}
            >
              {cat === 'All' ? t.all : cat === 'AI' ? (lang === 'tr' ? 'Yapay Zekâ' : 'AI') : cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects && filteredProjects.map((project, index) => (
            <div 
              key={project.id || index} 
              className="project-card glass-card"
              onClick={() => { sfx.playClick(); setSelectedProject(project); }}
            >
              <div className="project-image-fallback">
                {project.image ? (
                  isVideo(project.image) ? (
                    <video 
                      src={project.image} 
                      muted 
                      loop 
                      autoPlay 
                      playsInline 
                      className="project-video-element"
                    />
                  ) : (
                    <div 
                      className="project-img-inner" 
                      style={{ background: `url(${project.image}) center/cover` }} 
                    />
                  )
                ) : (
                  <div 
                    className="project-img-inner" 
                    style={{ background: getGradient(index) }} 
                  />
                )}
                <span className="project-category-badge font-mono">{project.category}</span>
                <div className="project-image-overlay">
                  <span className="view-details-text font-orbitron">{t.viewDetails}</span>
                </div>
              </div>
              
              <div className="project-info">
                <h3 className="project-title font-orbitron">{translateText(project.title, lang)}</h3>
                <p className="project-desc">{translateText(project.description, lang)}</p>
                <div className="project-tech-list">
                  {project.technologies && project.technologies.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="tech-badge">{tech}</span>
                  ))}
                  {project.technologies && project.technologies.length > 3 && (
                    <span className="tech-badge">+{project.technologies.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub CTA - More Projects Button */}
      <div className="projects-github-cta">
        <a
          href="https://github.com/aksoyalimelih"
          target="_blank"
          rel="noopener noreferrer"
          className="github-cta-btn"
          onMouseEnter={() => sfx.playTick()}
          onClick={() => sfx.playClick()}
        >
          <span className="github-cta-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          </span>
          <span className="github-cta-text">
            {lang === 'tr' ? 'Daha Fazla Proje İçin GitHub' : 'More Projects on GitHub'}
          </span>
          <span className="github-cta-arrow">→</span>
          <span className="github-cta-particles">
            <span></span><span></span><span></span><span></span><span></span>
          </span>
        </a>
      </div>

      {/* Project Details Modal */}
      <Modal
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        title={selectedProject ? translateText(selectedProject.title, lang) : ''}
      >
        {selectedProject && (
          <div className="project-details">
            <div className="project-details-image">
              {selectedProject.image ? (
                isVideo(selectedProject.image) ? (
                  <video 
                    src={selectedProject.image} 
                    controls 
                    autoPlay 
                    loop 
                    playsInline
                    className="project-video-element"
                  />
                ) : (
                  <div 
                    className="project-img-inner" 
                    style={{ background: `url(${selectedProject.image}) center/cover` }} 
                  />
                )
              ) : (
                <div 
                  className="project-img-inner" 
                  style={{ background: getGradient(projects.indexOf(selectedProject)) }} 
                />
              )}
              <span className="project-details-category font-mono">{selectedProject.category}</span>
            </div>
            
            <div className="project-details-content">
              <h4 className="project-details-subtitle font-orbitron">
                {lang === 'tr' ? 'Proje Hakkında' : 'About the Project'}
              </h4>
              <p className="project-details-desc">{translateText(selectedProject.description, lang)}</p>
              
              <h4 className="project-details-subtitle font-orbitron">
                {lang === 'tr' ? 'Kullanılan Teknolojiler' : 'Technologies Used'}
              </h4>
              <div className="project-details-tech">
                {selectedProject.technologies && selectedProject.technologies.map((tech, idx) => (
                  <span key={idx} className="tech-badge">{tech}</span>
                ))}
              </div>

              <div className="project-details-actions">
                {selectedProject.githubUrl && (
                  <a 
                    href={selectedProject.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    {t.githubLink}
                  </a>
                )}
                {selectedProject.liveUrl && (
                  <a 
                    href={selectedProject.liveUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-primary animate-pulse"
                  >
                    {t.liveLink}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default Projects;
