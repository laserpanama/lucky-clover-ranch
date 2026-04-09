
import { useState } from "react";

type Props = {
  isAvailable: boolean;
  currentRental?: { client: { name: string }; endDate: string };
  nextRental?: { client: { name: string }; startDate: string };
};

export const AnimalStatusBadge = ({
  isAvailable,
  currentRental,
  nextRental,
}: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (isAvailable) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          padding: "2px 8px",
          background: "#d4edda",
          color: "#155724",
          borderRadius: "12px",
          fontSize: "0.8rem",
          cursor: "help",
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        🟢 Available
        {showTooltip && (
          <div
            style={{
              position: "absolute",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "6px 10px",
              borderRadius: "4px",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              zIndex: 1000,
              marginTop: "4px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            Ready for rental now
          </div>
        )}
      </span>
    );
  }

  const nextAvailable = nextRental
    ? new Date(nextRental.startDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        background: "#f8d7da",
        color: "#721c24",
        borderRadius: "12px",
        fontSize: "0.8rem",
        cursor: "help",
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      🔴 Rented until {nextAvailable}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "4px",
            fontSize: "0.75rem",
            whiteSpace: "nowrap",
            zIndex: 1000,
            marginTop: "4px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          {currentRental ? (
            <>
              Currently rented to: <strong>{currentRental.client.name}</strong>{" "}
              (until{" "}
              {new Date(currentRental.endDate).toLocaleDateString()})
            </>
          ) : (
            "No current rental data"
          )}
          {nextRental && (
            <div style={{ marginTop: "4px" }}>
              Next: <strong>{nextRental.client.name}</strong>{" "}
              (starting {nextAvailable})
            </div>
          )}
        </div>
      )}
    </span>
  );
};

