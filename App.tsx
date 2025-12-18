import React, { useState } from 'react';
import { Scene } from './components/Scene';
import { TreeState } from './types';

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.TREE_SHAPE);

  const toggleState = () => {
    setTreeState((prev) => 
      prev === TreeState.TREE_SHAPE ? TreeState.SCATTERED : TreeState.TREE_SHAPE
    );
  };

  return (
    <div className="relative w-full h-screen bg-black text-white overflow-hidden select-none">
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="flex flex-col items-center md:items-start space-y-2 animate-fade-in-down">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-amber-400/50 hidden md:block"></div>
            <h3 className="font-cinzel text-amber-400 tracking-[0.3em] text-xs uppercase">
              The Arix Collection
            </h3>
            <div className="w-12 h-[1px] bg-amber-400/50 hidden md:block"></div>
          </div>
          <h1 className="font-serif-display text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 via-white to-amber-100 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            Signature Tree
          </h1>
        </header>

        {/* Controls */}
        <div className="flex flex-col items-center gap-6 pb-8 pointer-events-auto">
          
          <p className="font-cinzel text-emerald-200/60 text-xs tracking-widest text-center max-w-md">
            EXPERIENCE THE DUALITY OF CHAOS AND ORDER
          </p>

          <button
            onClick={toggleState}
            className={`
              group relative px-12 py-4 
              overflow-hidden transition-all duration-700 ease-out
              border border-amber-500/30 bg-black/40 backdrop-blur-md
              hover:border-amber-400 hover:bg-emerald-950/50
            `}
          >
            {/* Button Inner Glow */}
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
            
            <span className={`
              relative z-10 font-cinzel text-sm tracking-[0.2em] font-bold
              bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500
              ${treeState === TreeState.TREE_SHAPE 
                ? 'from-amber-200 via-amber-100 to-amber-300' 
                : 'from-emerald-300 via-emerald-100 to-teal-300'}
            `}>
              {treeState === TreeState.TREE_SHAPE ? 'SCATTER ESSENCE' : 'GATHER SPIRIT'}
            </span>

            {/* Decorative Lines */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-100"></div>
          </button>
        </div>

        {/* Footer */}
        <div className="hidden md:flex justify-between items-end w-full opacity-40 text-[10px] font-mono text-emerald-100/50">
          <div>
            COORDS: {treeState === TreeState.TREE_SHAPE ? 'CONICAL_PROJECTION' : 'SPHERICAL_DISPERSION'}<br/>
            LUX_LEVEL: 100%
          </div>
          <div className="text-right">
            ARIX INTERACTIVE © 2024<br/>
            WINTER EXHIBITION
          </div>
        </div>

      </div>
    </div>
  );
};

export default App;