import { InboxIcon } from "./Icons";

export function EmptyState({ icon, title, description, action, className = "" }) {
  const classes = ["empty-state", className].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <span className="empty-state-icon">{icon ?? <InboxIcon size={24} />}</span>
      {title ? <h3 className="empty-state-title">{title}</h3> : null}
      {description ? <p className="empty-state-description">{description}</p> : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}
