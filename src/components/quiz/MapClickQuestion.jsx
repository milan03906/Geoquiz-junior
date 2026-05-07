import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function MapClickQuestion({ question, value, onChange }) {
  const mapCenter = question?.specialData?.mapCenter || [10, 20];
  const zoom = question?.specialData?.zoom || 1.5;
  const choices = question?.specialData?.choices || [];
  const selected = value || null;

  const isPointSelection = choices.length > 0;

  return (
    <div className="map-wrapper">
      <p className="question-help">
        {isPointSelection 
          ? "Klikni na tačnu tačku na mapi." 
          : "BOSS LEVEL: Klikni direktno na državu na mapi!"}
      </p>

      <div className="simple-map-shell">
        <ComposableMap
          projection="geoMercator"
          
          projectionConfig={{ scale: 200 }} 
        >
          <ZoomableGroup center={mapCenter} zoom={zoom}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isSelectedGeo = selected === geo.properties.name;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onClick={() => !isPointSelection && onChange(geo.properties.name)}
                      style={{
                        default: { 
                          fill: isSelectedGeo ? "#e74c3c" : "#D6D6DA", 
                          stroke: "#999", 
                          strokeWidth: 0.5 / zoom, 
                          outline: "none" 
                        },
                        hover: { 
                          fill: isPointSelection ? "#D6D6DA" : "#f39c12", 
                          stroke: "#666", 
                          outline: "none", 
                          cursor: isPointSelection ? "default" : "pointer" 
                        },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {isPointSelection && choices.map((choice) => {
              const markerSize = question?.specialData?.markerSize ?? 6;
              const finalRadius = markerSize / zoom;
              const finalStroke = 1 / zoom;

              return (
                <Marker
                  key={choice.id}
                  coordinates={choice.coordinates}
                  onClick={() => onChange(choice.id)}
                >
                  <circle 
                    r={finalRadius} 
                    fill={selected === choice.id ? "#e74c3c" : "#3498db"} 
                    stroke="#fff" 
                    strokeWidth={finalStroke}
                    style={{ 
                        cursor: "pointer",
                        transition: "all 0.2s ease" 
                    }}
                  />
                </Marker>
              );
            })}
          </ZoomableGroup>
        </ComposableMap>
      </div>
    </div>
  );
}