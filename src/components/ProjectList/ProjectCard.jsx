import React from "react";
import { Link } from "react-router-dom";

const ProjectCard = ({ projectItem, isActive, onClick, index }) => (
  <Link
    to={`/${projectItem.type}/${projectItem.slug}`}
    className={`project-card ${isActive ? "active" : ""}`}
    onClick={(e) => onClick(e, projectItem.slug, projectItem.type)}
    style={{
      "--item-index": index,
      animationDelay: `${index * 0.05}s`,
    }}
  >
    <div className="project-card-content">
      <div className="project-header">
        <h3>{projectItem.title}</h3>
      </div>
      <p className="project-description">{projectItem.description}</p>
      <div className="project-meta">
        <div className="project-tags">
          {projectItem.tags?.slice(0, 3).map((tag, tagIndex) => (
            <span key={tagIndex} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  </Link>
);

export default ProjectCard;
