/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useRef } from "react";
import Globe from "react-globe.gl";
import { scaleSequentialSqrt } from "d3-scale";
import { interpolateYlOrRd } from "d3-scale-chromatic";
import countries from "@/assets/ne_110m_admin_0_countries.json";
import { Division, Fighter } from "@/types/fighter.ts";
import apiClient from "@/api/apiClient.ts";
import "../App.css";

const FighterGlobe: React.FC = () => {
  const [hoverD, setHoverD] = useState<any>(null);
  const colorScale = useMemo(() => scaleSequentialSqrt(interpolateYlOrRd), []);
  const [fighters, setFighters] = useState<Fighter[]>([]);
  const globeRef = useRef<any>(null);

  const getVal = (feat: any) =>
    feat.properties.GDP_MD_EST / Math.max(1e5, feat.properties.POP_EST);

  const maxVal = useMemo(() => {
    if (!countries.features.length) return 0;
    return Math.max(...countries.features.map(getVal));
  }, [countries]);

  colorScale.domain([0, maxVal]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fightersRes] = await Promise.all([
          apiClient.get<Fighter[]>("/fighters"),
          apiClient.get<Division[]>("/divisions"),
        ]);
        setFighters(fightersRes.data);
      } catch (err) {
        console.error("Error fetching fighters:", err);
      }
    };
    fetchData();
  }, []);

  const fightersByCountry = useMemo(() => {
    const map: Record<string, Fighter[]> = {};
    fighters.forEach((f) => {
      if (!map[f.country]) map[f.country] = [];
      map[f.country].push(f);
    });
    return map;
  }, [fighters]);

  const countryLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    Object.entries(fightersByCountry).forEach(([country, fList]) => {
      let html = "";
      const visible = fList.slice(0, 2);
      visible.forEach((f) => {
        html += `<img src="${
          f.image || "https://via.placeholder.com/32"
        }" style="width:32px;height:32px;border-radius:50%;margin-right:4px;" title="${
          f.name
        }" />`;
      });

      if (fList.length > 3) {
        html += `<span style="display:inline-block;width:32px;height:32px;border-radius:50%;background:#555;color:white;text-align:center;line-height:32px;font-size:12px;margin-left:2px;">+${
          fList.length - 2
        }</span>`;
      } else if (fList.length === 3) {
        const third = fList[2];
        html += `<img src="${
          third.image || "https://via.placeholder.com/32"
        }" style="width:32px;height:32px;border-radius:50%;margin-left:2px;" title="${
          third.name
        }" />`;
      }

      labels[country] = `
                <div style="text-align:left; display: flex; flex-direction: column; gap: 4px;">
                  <h2><b>${country}</b></h2>
                  <p>Total fighter(s): ${fList.length}</p>
                  <div style="display:flex; align-items:center;">${html}</div>
                </div>
            `;
    });
    return labels;
  }, [fightersByCountry]);

  const onHoverCountry = (data: { properties: { BRK_NAME: string } }) => {
    const country = data.properties.BRK_NAME;

    if (!country) return `N/A`;
    if (!countryLabels[country])
      return `<div style="text-align:left; display: flex; flex-direction: column; gap: 4px;">
                  <h2><b>${country}</b></h2>
                  <p>No fighter(s)</p>
                </div>`;

    return countryLabels[country];
  };

  return (
    <div className="globe-container">
      <Globe
        ref={globeRef}
        globeImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="https://cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png"
        lineHoverPrecision={0}
        polygonsData={countries.features.filter(
          (d) => d.properties.ISO_A2 !== "AQ"
        )}
        polygonAltitude={(d: any) => (d === hoverD ? 0.12 : 0.06)}
        polygonCapColor={(d: any) =>
          d === hoverD ? "steelblue" : colorScale(getVal(d))
        }
        polygonSideColor={() => "rgba(0, 100, 0, 0.15)"}
        polygonStrokeColor={() => "#111"}
        polygonLabel={onHoverCountry}
        onPolygonHover={setHoverD}
        polygonsTransitionDuration={300}
      ></Globe>
    </div>
  );
};

export default FighterGlobe;
