import React from "react";
import ProjectCard from "./ProjectCard";

const ProjectList = ({ projectRoots, activeSlug, onProjectClick }) => {
  let cardIndex = 0;
  return (
    <aside className="project-panel">
      <div className="project-panel-header">
        <h2>Projects</h2>
      </div>
      <div className="project-list">
        {projectRoots.map((root) => (
          <section key={root.id} className="project-root-group">
            <h3 className="project-root-heading">{root.name}</h3>
            {root.sketches.map((projectItem) => {
              const index = cardIndex++;
              return (
                <ProjectCard
                  key={projectItem.slug}
                  projectItem={projectItem}
                  isActive={projectItem.slug === activeSlug}
                  onClick={onProjectClick}
                  index={index}
                />
              );
            })}
          </section>
        ))}
      </div>
    </aside>
  );
};

export default ProjectList;
