import React from "react";
import { poiOptions } from "@/lib/poiOptions";

type RouteDisplayProps = {
  poiList: string[];
};

export function RouteDisplay({ poiList }: RouteDisplayProps) {
  return (
    <div className="mt-8 text-black font-bold text-center flex flex-col items-center gap-1">
      <div className="bg-green-200 rounded-lg">[現在地]</div>
      {poiList.length === 0 ? null : (
        <>
          <div className="border-l-2 border-black h-6"></div>
          {poiList.map((poi, i) => (
            <React.Fragment key={i}>
              <div className="bg-yellow-200 rounded">[{poiOptions.find(opt => opt.value === poi)?.label || poi}]</div>
              <div className="border-l-2 border-black h-6 "></div>
            </React.Fragment>
          ))}
        </>
      )}
      <div className="bg-red-200 rounded">[目的地]</div>
    </div>
  );
}
