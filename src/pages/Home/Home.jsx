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
  console.log(param)
  const [activeProject, setActiveProject] = useState(param?.slug || 'sine-wave-puddle');
  const [selectedGeneration, setSelectedGeneration] = useState(param?.type || 'gen1');
  console.log(activeProject, selectedGeneration)
  const project = projects.find((p) => p.slug === activeProject);
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
  }, [project.blog]); // Only depend on project slug

  // Handle project click - prevent navigation if it's the active project
  const handleProjectClick = (e, projectSlug, projectType) => {
    if (projectSlug === activeProject) {
      e.preventDefault(); // Prevent navigation
      return; // Do nothing if clicking the same project
    }
    // Navigate to the new project
    navigate(`/${projectType}/${projectSlug}`);
  };

  // Filter projects by selected generation
  const filteredProjects = projects.filter(project => project.type === selectedGeneration);

  // Generation options with display names and emojis
  const generationOptions = [
    { value: 'gen1', label: '🎮 Gen1', emoji: '⚡' },
    { value: 'gen2', label: '🎯 Gen2', emoji: '🎯' }
  ];

  // Type-specific emojis for project items
  const typeEmojis = {
    gen1: "⚡",
    gen2: "🎯"
  };

  return (
    <>
      <div className="home-container">
        
        <div className="projects-grid">
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
            {/* Generation Dropdown */}
            <div className="generation-dropdown-container">
              <select 
                className="generation-dropdown"
                value={selectedGeneration}
                onChange={(e) => setSelectedGeneration(e.target.value)}
              >
                {generationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="project-list">
              {filteredProjects.map((project, projectIndex) => (
                <Link 
                  to={`/${project.type}/${project.slug}`} 
                  key={project.slug}
                  className={`project-item ${project.slug === activeProject ? 'active' : ''}`}
                  data-type={project.type}
                  style={{ 
                    '--item-index': projectIndex,
                    animationDelay: `${projectIndex * 0.1}s`
                  }}
                  onClick={(e) => handleProjectClick(e, project.slug, project.type)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>{typeEmojis[project.type]}</span>
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="sketch-preview">
          {project ? <>
            <div className="sketch-title" style={{ marginTop: "10px" }}>
              <h1 style={{ margin: 0 }}>{project.title}</h1>
              <p style={{ margin: 0 }}>{project.description}</p>
            </div>
            <div className="sketch-container">
              {isBlogLoading ? <div>Loading...</div> : <SketchWithFullscreen 
                key={activeProject} // Force re-render when project changes
                SketchComponent={SketchComponent}
                title={project.title}
                description={project.description}
              />}
            </div>
            <div>
              <BlogPost markdownContent={blogContent} />
            </div>
          </> : null}
        </div>
      </div>
    </>
  );
};

export default Home;