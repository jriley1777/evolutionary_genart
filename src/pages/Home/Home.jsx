import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projects } from "../../data/projects";
import "./Home.css";
import ProjectList from "../../components/ProjectList/ProjectList";
import SketchWithFullscreen from "../../components/SketchWithFullscreen/SketchWithFullscreen";
import BlogPost from "../../components/BlogPost/BlogPost";
import * as sketches from "../../sketches/sketches";

const Home = () => {
  const param = useParams();
  const navigate = useNavigate();
  const allProjects = projects.getAllProjects();
  const [activeProject, setActiveProject] = useState(param?.slug || allProjects[0]?.slug || 'flow-field-trails');
  const project = projects.findProjectBySlug(activeProject);
  const SketchComponent = project ? sketches.default[project.sketch] : null;
  const [blogContent, setBlogContent] = useState("");
  const [isBlogLoading, setIsBlogLoading] = useState(false);

  useEffect(() => {
    if (param?.slug && param.slug !== activeProject) {
      setActiveProject(param.slug);
    }
  }, [param?.slug])

  useEffect(() => {
    if (project) {
      setIsBlogLoading(true);
      fetch(`/blog/${project.slug}.md`)
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
  }, [project?.slug]);

  // Handle project click
  const handleProjectClick = (e, projectSlug) => {
    if (projectSlug === activeProject) {
      e.preventDefault();
      return;
    }
    navigate(`/${projectSlug}`);
  };

  return (
    <div className="home-container">
      {/* Title Bar */}
      <header className="title-bar">
        <div className="title-content">
          <h1>Playtesting - Free Flowing Generative Art</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Left Panel - Project Navigation */}
        <ProjectList
          projectRoots={projects.getProjectRoots()}
          activeSlug={activeProject}
          onProjectClick={handleProjectClick}
        />

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
                </div>

                <div className="sketch-container">
                  {isBlogLoading ? (
                    <div className="loading">Loading sketch...</div>
                  ) : (
                    <SketchWithFullscreen 
                      SketchComponent={SketchComponent}
                      title={project.title}
                      description={project.description}
                      project={project}
                      sketchType={project.sketchType ?? 'p5'}
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
