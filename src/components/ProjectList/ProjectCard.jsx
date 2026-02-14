import React from "react";
import { Link } from "react-router-dom";

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
};

const ProjectCard = ({ projectItem, isActive, onClick, index }) => {
  const created = projectItem.created ?? projectItem.date;
  const dateLabel = formatDate(created);
  return (
    <Link
      to={`/${projectItem.slug}`}
      className={`project-card ${isActive ? "active" : ""}`}
      onClick={(e) => onClick(e, projectItem.slug)}
      style={{
        "--item-index": index,
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div className="project-card-content">
        <div className="project-header">
          <h3>{projectItem.title}</h3>
          {dateLabel && <span className="project-card-date">{dateLabel}</span>}
        </div>
        <p className="project-description">{projectItem.description}</p>
      </div>
    </Link>
  );
};

export default ProjectCard;
