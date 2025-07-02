import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { projects } from "../../data/projects";
import "./Home.css";
import SketchWithFullscreen from "../../components/SketchWithFullscreen/SketchWithFullscreen";
import BlogPost from "../../components/BlogPost/BlogPost";
import * as sketches from "../../sketches/sketches";

const Home = () => {
  const param = useParams();
  const navigate = useNavigate();
  const [activeProject, setActiveProject] = useState(param?.slug || 'sine-wave-puddle');
  const [selectedGeneration, setSelectedGeneration] = useState(param?.type || 'gen1');
  const project = projects.findProjectBySlug(activeProject);
  const SketchComponent = project ? sketches.default[project.sketch] : null;
  const [blogContent, setBlogContent] = useState("");
  const [isBlogLoading, setIsBlogLoading] = useState(false);

  useEffect(() => {
    if (param?.slug && param.slug !== activeProject) {
      setActiveProject(param.slug)
      setSelectedGeneration(param.type)
    }
  }, [param])

  useEffect(() => {
    if (project) {
      setIsBlogLoading(true);
      fetch(`/blog/${project.type}/${project.slug}.md`)
        .then(res => res.text())
        .then(content => {
          setBlogContent(content);
          setIsBlogLoading(false);
        })
        .catch(err => {
          console.error('Failed to load blog:', err);
          setIsBlogLoading(false);
        });
    }
  }, [project?.type, project?.slug]);

  // Handle project click
  const handleProjectClick = (e, projectSlug, projectType) => {
    if (projectSlug === activeProject) {
      e.preventDefault();
      return;
    }
    navigate(`/${projectType}/${projectSlug}`);
  };

  // Handle generation change
  const handleGenerationChange = (generationId, fromFullscreen = false) => {
    setSelectedGeneration(generationId);
    // Find the project in the new generation for the same root
    if (project) {
      const projectRoot = projects.projectRoots.find(root => root.id === project.rootId);
      if (projectRoot && projectRoot.generations[generationId]) {
        const newProject = projectRoot.generations[generationId];
        setActiveProject(newProject.slug);
        
        if (fromFullscreen) {
          // Update URL with fullscreen parameter to maintain fullscreen state
          window.history.replaceState({}, '', `/${generationId}/${newProject.slug}?sz=fullscreen`);
        } else {
          // Regular navigation
          navigate(`/${generationId}/${newProject.slug}`);
        }
      }
    }
  };

  // Get available generations for the active project
  const getAvailableGenerations = () => {
    if (!project) return [];
    
    const projectRoot = projects.projectRoots.find(root => root.id === project.rootId);
    if (!projectRoot) return [];
    
    return projects.generations.filter(gen => projectRoot.generations[gen.id]);
  };

  // Get all projects for navigation
  const allProjects = projects.getAllProjects();

  return (
    <div className="home-container">
      {/* Title Bar */}
      <header className="title-bar">
        <div className="title-content">
          <h1>Playtesting - Evolutionary Generative Art</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Left Panel - Project Navigation */}
        <aside className="project-panel">
          <div className="project-panel-header">
            <h2>Projects</h2>
          </div>
          <div className="project-list">
            {projects.getProjectsByGeneration(selectedGeneration).map((projectItem, index) => (
              <Link
                key={projectItem.slug}
                to={`/${projectItem.type}/${projectItem.slug}`}
                className={`project-card ${projectItem.slug === activeProject ? 'active' : ''}`}
                onClick={(e) => handleProjectClick(e, projectItem.slug, projectItem.type)}
                style={{ 
                  '--item-index': index,
                  animationDelay: `${index * 0.1}s`                }}
              >
                <div className="project-card-content">
                  <div className="project-header">
                    <span className="project-emoji">{projects.generations.find(g => g.id === projectItem.type)?.emoji}</span>
                    <h3>{projectItem.title}</h3>
                  </div>
                  <p className="project-description">{projectItem.description}</p>
                  <div className="project-meta">
                    <span className="project-root">{projectItem.rootName}</span>
                    <div className="project-tags">
                      {projectItem.tags?.slice(0, 3).map((tag, tagIndex) => (
                        <span key={tagIndex} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        {/* Right Panel - Split between Sketch and Markdown */}
        <section className="content-panel">
          {project ? (
            <>
              {/* Sketch Section */}
              <div className="sketch-section">
                <div className="sketch-header">
                  <div className="sketch-title">
                    <h2>{project.title}</h2>
                    <p>{project.description}</p>
                  </div>
                  <div className="sketch-meta">
                    <span className="project-root">Root: {project.rootName}</span>
                    <span className="project-generation">Generation: {project.type}</span>
                  </div>
                </div>

                {/* Generation Navigation */}
                <div className="generation-nav">
                  <div className="generation-nav-content">
                    <span className="generation-nav-label">Available Generations:</span>
                    <div className="generation-tabs">
                      {getAvailableGenerations().map(gen => (
                        <button
                          key={gen.id}
                          className={`generation-tab ${project.type === gen.id ? 'active' : ''}`}
                          onClick={() => handleGenerationChange(gen.id, false)}
                        >
                          <span className="generation-label">{gen.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="sketch-container">
                  {isBlogLoading ? (
                    <div className="loading">Loading sketch...</div>
                  ) : (
                    <SketchWithFullscreen 
                      SketchComponent={SketchComponent}
                      title={project.title}
                      description={project.description}
                      availableGenerations={getAvailableGenerations()}
                      currentGeneration={selectedGeneration}
                      onGenerationChange={handleGenerationChange}
                      project={project}
                    />
                  )}
                </div>
              </div>

              {/* Markdown Section */}
              <div className="markdown-section">
                <div className="markdown-header">
                  <h3>Documentation</h3>
                </div>
                <div className="markdown-content">
                  <BlogPost markdownContent={blogContent} />
                </div>
              </div>
            </>
          ) : (
            <div className="no-project-selected">
              <h2>Select a Project</h2>
              <p>Choose a project from the left panel to view its sketch and documentation.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
