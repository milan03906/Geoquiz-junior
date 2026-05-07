import { useMemo, useState } from "react";

export default function DragDropQuestion({ question, value, onChange }) {
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);

  const items = question.specialData?.items || [];
  const zones = question.specialData?.zones || [];
  const currentValue = value || {};

  const itemById = (id) => items.find((item) => item.id === id);
  const zoneById = (id) => zones.find((zone) => zone.id === id);

  const getItemAssignedToZone = (zoneId) =>
    Object.entries(currentValue).find(([, assignedZoneId]) => assignedZoneId === zoneId)?.[0] ||
    null;

  const unassignedItems = useMemo(
    () => items.filter((item) => !currentValue[item.id]),
    [items, currentValue]
  );

  const assignItemToZone = (itemId, zoneId) => {
    const next = { ...currentValue };

    delete next[itemId];

    
    const previousItemInZone = getItemAssignedToZone(zoneId);
    if (previousItemInZone) {
      delete next[previousItemInZone];
    }

    next[itemId] = zoneId;
    onChange(next);
  };

  const handleZoneClick = (zoneId) => {
    if (!activeItemId) return;
    assignItemToZone(activeItemId, zoneId);
    setActiveItemId(null);
  };

  const handleDrop = (zoneId) => {
    if (!draggedItemId) return;
    assignItemToZone(draggedItemId, zoneId);
    setDraggedItemId(null);
    setActiveItemId(null);
  };

  const handleRemove = (itemId) => {
    const next = { ...currentValue };
    delete next[itemId];
    onChange(next);
    if (activeItemId === itemId) setActiveItemId(null);
  };

  return (
    <div className="dd-wrapper">
      <p className="question-help">
        Prevuci stavku u odgovarajuće polje ili klikni stavku pa zonu.
      </p>

      <div className="dd-zones">
        {zones.map((zone) => {
          const assignedItemId = getItemAssignedToZone(zone.id);
          const assignedItem = assignedItemId ? itemById(assignedItemId) : null;

          return (
            <div
              key={zone.id}
              className={activeItemId ? "dd-zone active" : "dd-zone"}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(zone.id)}
              onClick={() => handleZoneClick(zone.id)}
              role="button"
              tabIndex={0}
            >
              <div className="dd-zone-label">{zone.label}</div>

              {assignedItem ? (
                <div
                  className="dd-chip selected"
                  draggable
                  onDragStart={() => {
                    setDraggedItemId(assignedItem.id);
                    setActiveItemId(assignedItem.id);
                  }}
                  title="Možeš i da je prebaciš"
                >
                  <span>{assignedItem.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(assignedItem.id);
                    }}
                    aria-label="Ukloni izbor"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span className="dd-empty">Pusti ovde</span>
              )}
            </div>
          );
        })}
      </div>

      <div>
        <h4>Stavke za povezivanje</h4>
        <div className="dd-pool">
          {unassignedItems.map((item) => (
            <div
              key={item.id}
              className={activeItemId === item.id ? "dd-chip selected" : "dd-chip"}
              draggable
              onDragStart={() => {
                setDraggedItemId(item.id);
                setActiveItemId(item.id);
              }}
              onClick={() =>
                setActiveItemId((prev) => (prev === item.id ? null : item.id))
              }
              role="button"
              tabIndex={0}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}