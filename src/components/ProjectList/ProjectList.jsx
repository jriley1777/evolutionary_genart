import React from "react";
import ProjectCard from "./ProjectCard";

const ProjectList = ({ projects, activeSlug, onProjectClick }) => (
  <aside className="project-panel">
    <div className="project-panel-header">
      <h2>Projects</h2>
    </div>
    <div className="project-list">
      {projects.map((projectItem, index) => (
        <ProjectCard
          key={projectItem.slug}
          projectItem={projectItem}
          isActive={projectItem.slug === activeSlug}
          onClick={onProjectClick}
          index={index}
        />
      ))}
    </div>
  </aside>
);

export default ProjectList;
